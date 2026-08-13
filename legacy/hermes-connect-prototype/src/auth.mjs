const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const SESSION_BYTES = 32;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function deriveKey(password, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_BYTES * 8,
  );
  return toHex(bits);
}

export function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 200;
}

export async function hashPassword(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const salt = toHex(saltBytes);
  const hash = await deriveKey(password, saltBytes);
  return { hash, salt };
}

export async function verifyPassword(password, salt, expectedHash) {
  const candidate = await deriveKey(password, fromHex(salt));
  if (candidate.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    mismatch |= candidate.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

export function createSessionToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
}

export function sessionExpiry(now = new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS).toISOString();
}

export function isSessionExpired(expiresAtIso, now = new Date()) {
  return new Date(expiresAtIso).getTime() <= now.getTime();
}

const TELEGRAM_AUTH_MAX_AGE_SECONDS = 24 * 60 * 60;

async function hmacSha256Hex(keyBytes, message) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(signature);
}

// Verifies the Telegram Login Widget payload per https://core.telegram.org/widgets/login
// `data` is the widget's callback object (id, first_name, ..., auth_date, hash).
export async function verifyTelegramAuth(data, botToken) {
  if (!data || typeof data.hash !== "string" || !botToken) return false;
  const { hash, ...fields } = data;
  const checkString = Object.keys(fields)
    .filter((key) => fields[key] !== undefined && fields[key] !== null && fields[key] !== "")
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("\n");

  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const computedHash = await hmacSha256Hex(new Uint8Array(secretKey), checkString);
  if (computedHash.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedHash.length; i += 1) mismatch |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
  if (mismatch !== 0) return false;

  const authDate = Number(fields.auth_date);
  if (!Number.isFinite(authDate)) return false;
  const ageSeconds = Date.now() / 1000 - authDate;
  return ageSeconds >= -60 && ageSeconds <= TELEGRAM_AUTH_MAX_AGE_SECONDS;
}

export function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function sessionCookieHeader(token, { maxAgeSeconds = 7 * 24 * 60 * 60, clear = false } = {}) {
  const parts = [
    `hermes_session=${clear ? "" : token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${maxAgeSeconds}`,
  ];
  return parts.join("; ");
}
