export async function ensureRepairShopStaffScheduleSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_staff_schedule (
      staff_id TEXT NOT NULL,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      is_working INTEGER NOT NULL DEFAULT 0 CHECK (is_working IN (0,1)),
      start_time TEXT,
      end_time TEXT,
      breaks TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      PRIMARY KEY (staff_id, day_of_week)
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_staff_schedule_owner ON repair_shop_staff_schedule(owner_specialist_id,shop_id,staff_id,day_of_week)",
  ).run();
}

export function serializeRepairShopStaffSchedule(row) {
  let breaks = [];
  try {
    const parsed = JSON.parse(String(row?.breaks || "[]"));
    if (Array.isArray(parsed)) breaks = parsed;
  } catch {}
  return {
    staff_id: String(row?.staff_id || ""),
    day_of_week: Number(row?.day_of_week),
    is_working: Number(row?.is_working) === 1,
    start_time: row?.start_time ? String(row.start_time) : null,
    end_time: row?.end_time ? String(row.end_time) : null,
    breaks,
    updated_at: row?.updated_at ? String(row.updated_at) : null,
  };
}
