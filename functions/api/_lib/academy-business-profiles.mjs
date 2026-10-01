const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

export function cleanAcademyBusinessText(value, max = 160) {
  return String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
}

export function academyBusinessSlug(value, ownerId = "") {
  const base = cleanAcademyBusinessText(value, 120)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "academy";
  const suffix = String(ownerId).replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return suffix ? `${base}-${suffix}` : base;
}

export async function ensureAcademyBusinessProfilesSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_profiles (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL UNIQUE,
      business_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      academy_type TEXT NOT NULL DEFAULT 'business_academy',
      city TEXT NOT NULL,
      region TEXT,
      country_code TEXT NOT NULL DEFAULT 'UA',
      website TEXT,
      phone TEXT,
      timezone TEXT,
      catalog_opt_in INTEGER NOT NULL DEFAULT 1,
      catalog_status TEXT NOT NULL DEFAULT 'self_submitted',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_catalog ON hermes_academy_business_profiles(catalog_opt_in, catalog_status, country_code, city)").run();
}

export const ACADEMY_BUSINESS_TYPES = new Set([
  "business_academy",
  "online_school",
  "courses",
  "business_club",
  "coaching",
  "corporate_academy",
]);

export function normalizeAcademyBusinessType(value) {
  const normalized = cleanAcademyBusinessText(value, 40).toLowerCase().replace(/[\s-]+/g, "_");
  return ACADEMY_BUSINESS_TYPES.has(normalized) ? normalized : "business_academy";
}
