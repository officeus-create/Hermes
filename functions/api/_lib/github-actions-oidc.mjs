const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_JWKS = "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_REPOSITORY = "officeus-create/Hermes";
const CLOCK_SKEW_SECONDS = 60;
const MAX_TOKEN_AGE_SECONDS = 10 * 60;

let jwksCache = { expiresAt: 0, keys: [] };

const clean = (value) => String(value ?? "").trim();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJsonPart(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function readJwks(fetchImpl) {
  const now = Date.now();
  if (jwksCache.expiresAt > now && jwksCache.keys.length) return jwksCache.keys;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetchImpl(GITHUB_OIDC_JWKS, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("jwks_unavailable");
    const body = await response.json();
    const keys = Array.isArray(body?.keys) ? body.keys : [];
    if (!keys.length) throw new Error("jwks_empty");
    jwksCache = { expiresAt: now + 10 * 60 * 1000, keys };
    return keys;
  } finally {
    clearTimeout(timer);
  }
}

function audienceMatches(aud, expectedAudience) {
  if (typeof aud === "string") return aud === expectedAudience;
  return Array.isArray(aud) && aud.includes(expectedAudience);
}

function claimsAreTrusted(claims, { expectedAudience, allowedWorkflowRefs, nowSeconds }) {
  if (claims?.iss !== GITHUB_OIDC_ISSUER) return false;
  if (!audienceMatches(claims?.aud, expectedAudience)) return false;
  if (claims?.repository !== EXPECTED_REPOSITORY) return false;
  if (claims?.repository_owner !== "officeus-create") return false;
  if (claims?.ref !== "refs/heads/main") return false;
  if (!["push", "issue_comment"].includes(String(claims?.event_name || ""))) return false;
  if (claims?.runner_environment !== "github-hosted") return false;
  if (!allowedWorkflowRefs.has(String(claims?.workflow_ref || ""))) return false;

  const exp = Number(claims?.exp || 0);
  const nbf = Number(claims?.nbf || 0);
  const iat = Number(claims?.iat || 0);
  if (!Number.isFinite(exp) || exp < nowSeconds - CLOCK_SKEW_SECONDS) return false;
  if (!Number.isFinite(nbf) || nbf > nowSeconds + CLOCK_SKEW_SECONDS) return false;
  if (!Number.isFinite(iat) || iat > nowSeconds + CLOCK_SKEW_SECONDS) return false;
  if (iat < nowSeconds - MAX_TOKEN_AGE_SECONDS) return false;
  return true;
}

export async function verifyGithubActionsOidcToken({
  token,
  expectedAudience,
  allowedWorkflowRefs,
  fetchImpl = fetch,
  nowMs = Date.now(),
}) {
  const cleanToken = clean(token);
  if (!cleanToken || cleanToken.length > 16_384) return false;
  const parts = cleanToken.split(".");
  if (parts.length !== 3) return false;

  let header;
  let claims;
  try {
    header = decodeJsonPart(parts[0]);
    claims = decodeJsonPart(parts[1]);
  } catch {
    return false;
  }

  if (header?.alg !== "RS256" || header?.typ !== "JWT" || !clean(header?.kid)) return false;
  const workflowRefs = new Set(Array.isArray(allowedWorkflowRefs) ? allowedWorkflowRefs : []);
  if (!claimsAreTrusted(claims, {
    expectedAudience,
    allowedWorkflowRefs: workflowRefs,
    nowSeconds: Math.floor(nowMs / 1000),
  })) return false;

  try {
    const keys = await readJwks(fetchImpl);
    const jwk = keys.find((candidate) => candidate?.kid === header.kid && candidate?.kty === "RSA");
    if (!jwk) return false;
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return false;
  }
}
