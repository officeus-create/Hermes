export const REPAIR_SHOP_ACCESS_STATES = [
  "trialing",
  "founding",
  "active",
  "past_due",
  "cancelled",
  "comped",
];

export const REPAIR_SHOP_PLAN_ID = "repair_shop_founding";
export const REPAIR_SHOP_PLAN_NAME = "Founding Shop Plan";

export function isRepairShopAccessState(value) {
  return REPAIR_SHOP_ACCESS_STATES.includes(String(value || ""));
}

export function nextRepairShopCommercialAction(state) {
  if (state === "trialing") return "choose_plan";
  if (state === "past_due") return "contact_billing";
  if (state === "cancelled") return "renew";
  return "none";
}

export async function ensureRepairShopAccessSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_access (
      shop_id TEXT PRIMARY KEY,
      access_state TEXT NOT NULL CHECK (access_state IN ('trialing','founding','active','past_due','cancelled','comped')),
      plan_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      current_period_end TEXT,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_repair_shop_access_state ON repair_shop_access(access_state)").run();
}

export async function ensureDefaultRepairShopAccess(db, shopId) {
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT OR IGNORE INTO repair_shop_access
      (shop_id,access_state,plan_id,started_at,current_period_end,updated_at)
    VALUES (?,?,?,?,?,?)
  `).bind(shopId, "trialing", REPAIR_SHOP_PLAN_ID, now, null, now).run();
}

export async function getRepairShopAccess(db, shopId) {
  return db.prepare(`
    SELECT shop_id,access_state,plan_id,started_at,current_period_end,updated_at
    FROM repair_shop_access
    WHERE shop_id = ?
    LIMIT 1
  `).bind(shopId).first();
}
