const SOURCES = new Set(["email", "telegram", "hermes_connect", "system"]);
const CODES = new Set(["REPLY_DUE", "FOLLOW_UP_DUE", "SERVICE_FAILURE", "APPROVAL_PENDING"]);

export const cleanOwnerAlert = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const source = String(input.source || "");
  const code = String(input.code || "");
  const reference = String(input.reference || "");
  const key = String(input.idempotency_key || "");
  if (!SOURCES.has(source) || !CODES.has(code) || !/^[A-Za-z0-9_-]{8,80}$/.test(reference)
    || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return null;
  return { source, code, reference, key };
};

export const ownerAlertText = ({ source, code, reference }) =>
  `HERMES • OWNER ALERT\nSource: ${source}\nAction: ${code}\nReference: ${reference}\nReview the source record. No client details are included.`;

export async function authorizedOwnerAlert(request, secret) {
  if (!secret || typeof secret !== "string" || secret.length < 32) return false;
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  const token = authorization.slice(7);
  const encoder = new TextEncoder();
  const expected = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  const actual = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const a = new Uint8Array(expected);
  const b = new Uint8Array(actual);
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a[i] ^ b[i];
  return different === 0;
}
