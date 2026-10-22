const b64 = (data) => btoa(String.fromCharCode(...new Uint8Array(data))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const unb64 = (text) => {
  if (!/^[a-zA-Z0-9_-]+$/.test(text)) throw new Error("invalid_base64url");
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "="));
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
};
const utf8 = new TextEncoder();
const parseJwt = (token) => {
  if (typeof token !== "string" || token.length > 10000) throw new Error("invalid_token_size");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid_token_shape");
  return {
    segments: parts,
    header: JSON.parse(new TextDecoder().decode(unb64(parts[0]))),
    claims: JSON.parse(new TextDecoder().decode(unb64(parts[1]))),
    signature: unb64(parts[2]),
  };
};
export function appleConfig(env, origin) {
  const redirect = String(env.APPLE_REDIRECT_URI || "");
  return env.APPLE_LOGIN_ENABLED === "true" && origin.startsWith("https://")
    && /^[a-z0-9.-]{3,150}$/i.test(String(env.APPLE_SERVICES_ID || ""))
    && /^[A-Z0-9]{10}$/.test(String(env.APPLE_TEAM_ID || ""))
    && /^[A-Z0-9]{10}$/.test(String(env.APPLE_KEY_ID || ""))
    && String(env.APPLE_PRIVATE_KEY_P8 || "").includes("BEGIN PRIVATE KEY")
    && redirect === new URL("/api/auth/apple/callback", origin).toString();
}
export async function appleClientSecret(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(utf8.encode(JSON.stringify({ alg: "ES256", kid: env.APPLE_KEY_ID, typ: "JWT" })));
  const payload = b64(utf8.encode(JSON.stringify({
    iss: env.APPLE_TEAM_ID, iat: now, exp: now + 300,
    aud: "https://appleid.apple.com", sub: env.APPLE_SERVICES_ID,
  })));
  const pem = String(env.APPLE_PRIVATE_KEY_P8).replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const privateKey = await crypto.subtle.importKey("pkcs8", unb64(pem.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")),
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const signingInput = header + "." + payload;
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, utf8.encode(signingInput));
  return signingInput + "." + b64(signature);
}
export async function verifyAppleIdentityToken(token, servicesId, nonce) {
  const jwt = parseJwt(token);
  if (jwt.header.alg !== "RS256" || typeof jwt.header.kid !== "string") return null;
  const response = await fetch("https://appleid.apple.com/auth/keys", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("apple_keys_unavailable");
  const jwks = await response.json();
  const key = Array.isArray(jwks.keys) ? jwks.keys.find(k =>
    k.kid === jwt.header.kid && k.kty === "RSA" && (!k.alg || k.alg === "RS256") && (!k.use || k.use === "sig")
  ) : null;
  if (!key) return null;
  const publicKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signed = utf8.encode(jwt.segments[0] + "." + jwt.segments[1]);
  if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, jwt.signature, signed)) return null;
  const claims = jwt.claims;
  const now = Math.floor(Date.now() / 1000);
  const verifiedEmail = claims.email_verified === true || String(claims.email_verified).toLowerCase() === "true";
  // JWT NumericDate claims are required integers. Number(undefined) is NaN,
  // and NaN comparisons always return false: checking only exp <= now would
  // otherwise accept a correctly signed token with no expiration.
  const exp = claims.exp;
  const iat = claims.iat;
  if (!Number.isSafeInteger(exp) || !Number.isSafeInteger(iat) ||
      exp <= now || iat > now + 60 || iat > exp) return null;
  if (claims.iss !== "https://appleid.apple.com" || claims.aud !== servicesId ||
      claims.nonce !== nonce || !claims.sub || !claims.email || !verifiedEmail) return null;
  return { sub: String(claims.sub), email: String(claims.email) };
}
