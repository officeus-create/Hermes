const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

export const HERMES_COMPANY_TYPES = new Set([
  "carrier",
  "owner_operator",
  "fleet",
  "dispatcher",
  "broker",
  "shipper",
  "dealer",
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
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_company_catalog ON hermes_company_profiles(catalog_opt_in, catalog_status, state, city)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_company_loadboard ON hermes_company_profiles(owner_specialist_id, load_board_access)").run();
}

export function roleCanUseLoadBoard(role) {
  return /carrier|owner[- ]?operator|dispatcher|operations/i.test(String(role ?? ""));
}

export async function specialistHasLoadBoardAccess(db, specialist) {
  if (!specialist) return false;
  if (roleCanUseLoadBoard(specialist.role)) return true;
  await ensureHermesCompanyProfilesSchema(db);
  const company = await db.prepare(
    "SELECT load_board_access FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  return Number(company?.load_board_access) === 1;
}
