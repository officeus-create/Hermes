export const REPAIR_SHOP_DISCOUNT_SCOPES = new Set(["all", "selected"]);

export function defaultRepairShopDriverDiscount(shopId) {
  return {
    shop_id: String(shopId || ""),
    enabled: false,
    service_discount_percent: 0,
    service_scope: "all",
    service_ids: [],
    materials_discount_percent: 0,
    materials_scope: "all",
    materials_items: [],
    updated_at: null,
  };
}

function parseList(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function serializeRepairShopDriverDiscount(row, shopId) {
  if (!row) return defaultRepairShopDriverDiscount(shopId);
  return {
    shop_id: String(row.shop_id || shopId || ""),
    enabled: Number(row.enabled) === 1,
    service_discount_percent: Number(row.service_discount_percent || 0),
    service_scope: REPAIR_SHOP_DISCOUNT_SCOPES.has(String(row.service_scope)) ? String(row.service_scope) : "all",
    service_ids: parseList(row.service_ids),
    materials_discount_percent: Number(row.materials_discount_percent || 0),
    materials_scope: REPAIR_SHOP_DISCOUNT_SCOPES.has(String(row.materials_scope)) ? String(row.materials_scope) : "all",
    materials_items: parseList(row.materials_items),
    updated_at: row.updated_at || null,
  };
}

export async function ensureRepairShopDriverDiscountSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_driver_discounts (
      shop_id TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
      service_discount_percent INTEGER NOT NULL DEFAULT 0 CHECK(service_discount_percent BETWEEN 0 AND 100),
      service_scope TEXT NOT NULL DEFAULT 'all' CHECK(service_scope IN ('all','selected')),
      service_ids TEXT NOT NULL DEFAULT '[]',
      materials_discount_percent INTEGER NOT NULL DEFAULT 0 CHECK(materials_discount_percent BETWEEN 0 AND 100),
      materials_scope TEXT NOT NULL DEFAULT 'all' CHECK(materials_scope IN ('all','selected')),
      materials_items TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    )
  `).run();
}
