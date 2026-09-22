const CONTROL_CHARS = /[\u0000-\u001f\u007f<>]/g;

export function cleanDealerText(value, max = 240) {
  return String(value ?? "").replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function normalizeVin(value) {
  const vin = cleanDealerText(value, 17).toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  return vin.length === 17 ? vin : vin.length === 0 ? "" : null;
}

export function normalizeVehicleYear(value) {
  if (value === null || value === undefined || value === "") return null;
  const year = Number(value);
  const max = new Date().getUTCFullYear() + 2;
  return Number.isInteger(year) && year >= 1900 && year <= max ? year : null;
}

export function normalizeMoney(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1_000_000 ? Math.round(number * 100) / 100 : null;
}

export function normalizeReadyDate(value) {
  const text = cleanDealerText(value, 10);
  if (!text) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : text;
}

export async function ensureDealerTransportRequestSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_transport_requests (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      source_record_id TEXT NOT NULL,
      vin TEXT,
      vehicle_year INTEGER,
      vehicle_make TEXT,
      vehicle_model TEXT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      ready_date TEXT,
      target_price REAL,
      contact_phone TEXT,
      special_notes TEXT,
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','published','cancelled','sync_error')),
      load_post_id TEXT,
      load_record_id TEXT,
      approved_at TEXT,
      approved_by_specialist_id TEXT,
      last_sync_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, source_record_id)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_transport_company ON hermes_dealer_transport_requests(company_id, status, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_transport_load_post ON hermes_dealer_transport_requests(load_post_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_transport_vin ON hermes_dealer_transport_requests(company_id, vin)").run();
}

export function serializeDealerTransportRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    source_record_id: row.source_record_id,
    vin: row.vin || null,
    vehicle_year: row.vehicle_year == null ? null : Number(row.vehicle_year),
    vehicle_make: row.vehicle_make || null,
    vehicle_model: row.vehicle_model || null,
    origin: row.origin,
    destination: row.destination,
    ready_date: row.ready_date || null,
    target_price: row.target_price == null ? null : Number(row.target_price),
    contact_phone: row.contact_phone || null,
    special_notes: row.special_notes || null,
    status: row.status,
    load_post_id: row.load_post_id || null,
    load_record_id: row.load_record_id || null,
    approved_at: row.approved_at || null,
    last_sync_at: row.last_sync_at || null,
    last_error: row.last_error || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
