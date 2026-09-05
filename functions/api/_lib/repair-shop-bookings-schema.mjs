async function ensureOptionalColumn(db, column, definition) {
  const result = await db.prepare("PRAGMA table_info(repair_shop_bookings)").all();
  const names = new Set((result?.results ?? []).map((row) => String(row.name || "")));
  if (!names.has(column)) await db.prepare(`ALTER TABLE repair_shop_bookings ADD COLUMN ${definition}`).run();
}

export async function ensureRepairShopBookingsSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_bookings (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      technician_id TEXT,
      technician_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await ensureOptionalColumn(db, "technician_id", "technician_id TEXT");
  await ensureOptionalColumn(db, "technician_name", "technician_name TEXT");
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_owner_date ON repair_shop_bookings(owner_specialist_id, appointment_date, start_time)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_shop_date ON repair_shop_bookings(shop_id, appointment_date, start_time)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_technician_date ON repair_shop_bookings(technician_id, appointment_date, start_time)",
  ).run();

  // Earlier releases enforced capacity=1 with a unique exact-start index.
  // Capacity-aware booking performs an atomic overlap-count gate instead, so
  // exact-start uniqueness must not reject a valid second service bay/job.
  await db.prepare("DROP INDEX IF EXISTS idx_repair_shop_bookings_exact_slot").run();
  await db.prepare("DROP INDEX IF EXISTS idx_repair_shop_bookings_active_exact_slot").run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_active_window
     ON repair_shop_bookings(shop_id, appointment_date, start_time, end_time, status)`,
  ).run();
}
