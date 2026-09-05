export async function ensureRepairShopStaffSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_staff (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Technician',
      specialties TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shop_staff_shop_name ON repair_shop_staff(shop_id, name)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_staff_owner_active ON repair_shop_staff(owner_specialist_id, active, name)",
  ).run();
}

export function serializeRepairShopStaff(row) {
  let specialties = [];
  try {
    const parsed = JSON.parse(String(row?.specialties || "[]"));
    if (Array.isArray(parsed)) specialties = parsed.map((item) => String(item || "").trim()).filter(Boolean);
  } catch {}
  return {
    id: String(row?.id || ""),
    shop_id: String(row?.shop_id || ""),
    name: String(row?.name || ""),
    role: String(row?.role || "Technician"),
    specialties,
    active: Number(row?.active) === 1,
    created_at: row?.created_at ? String(row.created_at) : null,
    updated_at: row?.updated_at ? String(row.updated_at) : null,
  };
}
