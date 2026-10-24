const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

async function ensureColumns(db, table, columns) {
  const existing = await db.prepare(`PRAGMA table_info(${table})`).all();
  const names = new Set((existing?.results || []).map((row) => String(row.name)));
  for (const [name, definition] of Object.entries(columns)) {
    if (names.has(name)) continue;
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
  }
}

export const HERMES_COMPANY_TYPES = new Set([
  "carrier",
  "owner_operator",
  "fleet",
  "dispatcher",
  "broker",
  "shipper",
  "dealer",
  "home_service",
  "other",
]);

export function cleanCompanyText(value, max = 160) {
  return String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
}

export function normalizeCompanyType(value) {
  const normalized = cleanCompanyText(value, 40).toLowerCase().replace(/[\s-]+/g, "_");
  return HERMES_COMPANY_TYPES.has(normalized) ? normalized : "other";
}

export function normalizeState(value) {
  const normalized = cleanCompanyText(value, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

export function companySlug(value, ownerId = "") {
  const base = cleanCompanyText(value, 120)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "company";
  const suffix = String(ownerId).replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return suffix ? `${base}-${suffix}` : base;
}

export async function ensureHermesCompanyProfilesSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_company_profiles (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      company_type TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      website TEXT,
      authority_number TEXT,
      catalog_opt_in INTEGER NOT NULL DEFAULT 1,
      catalog_status TEXT NOT NULL DEFAULT 'self_submitted',
      load_board_access INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await ensureColumns(db, "hermes_company_profiles", {
    phone: "TEXT",
    address_line1: "TEXT",
    postal_code: "TEXT",
    country_code: "TEXT NOT NULL DEFAULT 'US'",
    timezone: "TEXT",
    public_source_ref: "TEXT",
    management_mode: "TEXT NOT NULL DEFAULT 'owner_managed'",
    catalog_publication_basis: "TEXT NOT NULL DEFAULT 'owner_opt_in'",
  });
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_company_catalog ON hermes_company_profiles(catalog_opt_in, catalog_status, state, city)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_company_loadboard ON hermes_company_profiles(owner_specialist_id, load_board_access)").run();
}

export function roleCanUseLoadBoard(role) {
  return /carrier|owner[- ]?operator|dispatcher|operations/i.test(String(role ?? ""));
}

export async function getSpecialistLoadBoardCompany(db, specialist) {
  if (!specialist) return null;
  await ensureHermesCompanyProfilesSchema(db);
  // A self-selected company type or load_board_access registration flag is not carrier verification.
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_board_entitlements (
      company_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('active','revoked')),
      reviewed_by_specialist_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      note TEXT
    )
  `).run();
  const company = await db.prepare(`
    SELECT c.id,c.company_name,c.load_board_access,c.company_type,e.status AS entitlement
    FROM hermes_company_profiles c
    LEFT JOIN hermes_carrier_board_entitlements e ON e.company_id=c.id
    WHERE c.owner_specialist_id=? LIMIT 1
  `).bind(specialist.id).first();
  return Number(company?.load_board_access)===1 &&
    ['carrier','owner_operator','fleet'].includes(String(company?.company_type||'')) &&
    company?.entitlement==='active' ? company : null;
}

export async function specialistHasLoadBoardAccess(db, specialist) {
  return Boolean(await getSpecialistLoadBoardCompany(db, specialist));
}
