const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_JWKS = "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_REPOSITORY = "officeus-create/Hermes";
const EXPECTED_REF = "refs/heads/main";

const REMINDER_IDENTITY = {
  audience: "hermes-connect-weekly-inactivity-reminders",
  workflowRef: "officeus-create/Hermes/.github/workflows/hermes-connect-weekly-inactivity-reminders.yml@refs/heads/main",
  allowedEvents: new Set(["schedule", "workflow_dispatch"]),
};

const CABINET_AUDIT_IDENTITY = {
  audience: "hermes-connect-cabinet-audit",
  workflowRef: "officeus-create/Hermes/.github/workflows/hc-cabinet-audit.yml@refs/heads/main",
  allowedEvents: new Set(["issue_comment"]),
};

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

function validateClaimsForIdentity(claims, identity, now = new Date()) {
  if (!claims || typeof claims !== "object" || !identity) return false;
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const exp = Number(claims.exp || 0);
  const nbf = Number(claims.nbf || 0);
  const iat = Number(claims.iat || 0);

  if (claims.iss !== GITHUB_OIDC_ISSUER) return false;
  if (claims.aud !== identity.audience) return false;
  if (claims.repository !== EXPECTED_REPOSITORY) return false;
  if (claims.ref !== EXPECTED_REF) return false;
  if (claims.workflow_ref !== identity.workflowRef) return false;
  if (!identity.allowedEvents.has(String(claims.event_name || ""))) return false;
  if (!Number.isFinite(exp) || exp <= nowSeconds) return false;
  if (Number.isFinite(nbf) && nbf > nowSeconds + 30) return false;
  if (!Number.isFinite(iat) || iat > nowSeconds + 30 || iat < nowSeconds - 20 * 60) return false;
  return true;
}

export function validateGitHubOidcClaims(claims, now = new Date()) {
  return validateClaimsForIdentity(claims, REMINDER_IDENTITY, now);
}

export function validateGitHubCabinetAuditOidcClaims(claims, now = new Date()) {
  return validateClaimsForIdentity(claims, CABINET_AUDIT_IDENTITY, now);
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

async function verifyGitHubOidcToken(token, validateClaims, now = new Date()) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return false;
    const [encodedHeader, encodedClaims, encodedSignature] = parts;
    const header = parseJsonSegment(encodedHeader);
    const claims = parseJsonSegment(encodedClaims);
    if (header?.alg !== "RS256" || !header?.kid) return false;
    if (!validateClaims(claims, now)) return false;

    const key = await fetchSigningKey(header.kid);
    if (!key) return false;
    const payload = new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`);
    const signature = decodeBase64Url(encodedSignature);
    return crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, key, signature, payload);
  } catch {
    return false;
  }
}

export async function verifyGitHubReminderOidcToken(token, now = new Date()) {
  return verifyGitHubOidcToken(token, validateGitHubOidcClaims, now);
}

export async function verifyGitHubCabinetAuditOidcToken(token, now = new Date()) {
  return verifyGitHubOidcToken(token, validateGitHubCabinetAuditOidcClaims, now);
}

export function bearerToken(request) {
  const header = request?.headers?.get?.("Authorization") || request?.headers?.get?.("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}
