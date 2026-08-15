const REFERRAL_COOKIE = "hermes_repair_ref";
const REFERRAL_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const REFERRAL_TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;
const SALESPERSON_CODE_RE = /^[A-Za-z0-9_-]{2,40}$/;

export async function ensureRepairShopSalesAttributionSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_sales_attribution (
      owner_specialist_id TEXT PRIMARY KEY,
      salesperson_code TEXT NOT NULL,
      referral_token_hash TEXT NOT NULL,
      source TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      registered_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_sales_attribution_code_registered ON repair_shop_sales_attribution(salesperson_code, registered_at DESC)",
  ).run();
}

export function parseRepairShopReferralCookie(cookieHeader) {
  if (!cookieHeader) return "";
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    if (key !== REFERRAL_COOKIE) continue;
    const value = decodeURIComponent(part.slice(index + 1).trim());
    return REFERRAL_TOKEN_RE.test(value) ? value : "";
  }
  return "";
}

export function repairShopReferralCookieHeader(token, { clear = false } = {}) {
  const value = clear ? "" : token;
  const maxAge = clear ? 0 : REFERRAL_MAX_AGE_SECONDS;
  return [
    `${REFERRAL_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function normalizeRepairShopReferralToken(value) {
  const token = String(value ?? "").trim();
  return REFERRAL_TOKEN_RE.test(token) ? token : "";
}

export function resolveRepairShopReferral(env, token) {
  if (!normalizeRepairShopReferralToken(token)) return null;
  const rawConfig = env?.REPAIR_SHOP_REFERRAL_MAP_JSON;
  if (typeof rawConfig !== "string" || !rawConfig.trim()) return null;

  let parsed;
  try {
    parsed = JSON.parse(rawConfig);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const entry = parsed[token];
  const salespersonCode = typeof entry === "string"
    ? entry
    : entry && typeof entry === "object"
      ? entry.salesperson_code
      : "";
  const source = entry && typeof entry === "object" && typeof entry.source === "string"
    ? entry.source.trim().slice(0, 80)
    : "repair-shop-sales-link";

  if (typeof salespersonCode !== "string" || !SALESPERSON_CODE_RE.test(salespersonCode)) return null;
  return { salesperson_code: salespersonCode, source: source || "repair-shop-sales-link" };
}

export async function hashRepairShopReferralToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function persistRepairShopSalesAttribution({ db, ownerSpecialistId, referral, referralToken, registeredAt }) {
  if (!db || !ownerSpecialistId || !referral || !referralToken) return false;
  await ensureRepairShopSalesAttributionSchema(db);
  const referralTokenHash = await hashRepairShopReferralToken(referralToken);
  await db.prepare(
    `INSERT OR IGNORE INTO repair_shop_sales_attribution
      (owner_specialist_id, salesperson_code, referral_token_hash, source, captured_at, registered_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      ownerSpecialistId,
      referral.salesperson_code,
      referralTokenHash,
      referral.source,
      registeredAt,
      registeredAt,
    )
    .run();
  return true;
}
