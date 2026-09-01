const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_JWKS = "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_AUDIENCE = "hermes-connect-weekly-inactivity-reminders";
const EXPECTED_REPOSITORY = "officeus-create/Hermes";
const EXPECTED_REF = "refs/heads/main";
const EXPECTED_WORKFLOW_REF = "officeus-create/Hermes/.github/workflows/hermes-connect-weekly-inactivity-reminders.yml@refs/heads/main";
const ALLOWED_EVENTS = new Set(["schedule", "workflow_dispatch"]);

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function parseJsonSegment(value) {
  const bytes = decodeBase64Url(value);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function validateGitHubOidcClaims(claims, now = new Date()) {
  if (!claims || typeof claims !== "object") return false;
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const exp = Number(claims.exp || 0);
  const nbf = Number(claims.nbf || 0);
  const iat = Number(claims.iat || 0);

  if (claims.iss !== GITHUB_OIDC_ISSUER) return false;
  if (claims.aud !== EXPECTED_AUDIENCE) return false;
  if (claims.repository !== EXPECTED_REPOSITORY) return false;
  if (claims.ref !== EXPECTED_REF) return false;
  if (claims.workflow_ref !== EXPECTED_WORKFLOW_REF) return false;
  if (!ALLOWED_EVENTS.has(String(claims.event_name || ""))) return false;
  if (!Number.isFinite(exp) || exp <= nowSeconds) return false;
  if (Number.isFinite(nbf) && nbf > nowSeconds + 30) return false;
  if (!Number.isFinite(iat) || iat > nowSeconds + 30 || iat < nowSeconds - 20 * 60) return false;
  return true;
}

async function fetchSigningKey(kid) {
  const response = await fetch(GITHUB_OIDC_JWKS, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!response.ok) return null;
  const jwks = await response.json();
  const jwk = Array.isArray(jwks?.keys) ? jwks.keys.find((key) => key?.kid === kid && key?.kty === "RSA") : null;
  if (!jwk) return null;
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

export async function verifyGitHubReminderOidcToken(token, now = new Date()) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return false;
    const [encodedHeader, encodedClaims, encodedSignature] = parts;
    const header = parseJsonSegment(encodedHeader);
    const claims = parseJsonSegment(encodedClaims);
    if (header?.alg !== "RS256" || !header?.kid) return false;
    if (!validateGitHubOidcClaims(claims, now)) return false;

    const key = await fetchSigningKey(header.kid);
    if (!key) return false;
    const payload = new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`);
    const signature = decodeBase64Url(encodedSignature);
    return crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, key, signature, payload);
  } catch {
    return false;
  }
}

export function bearerToken(request) {
  const header = request?.headers?.get?.("Authorization") || request?.headers?.get?.("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}
