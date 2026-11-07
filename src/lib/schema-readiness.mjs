// Shared schema-readiness probe.
//
// DDL takes the write lock of the whole D1 database, and the HAE cron writes
// that same database every five minutes. A cold isolate that re-runs DDL on
// every request therefore serialises against the cron and the request hangs
// until the platform gives up (production incident 2026-11-07: authenticated
// Command Center routes answered 524 after 125-145 seconds).
//
// Verify with READS whether the expected schema objects already exist, and
// take the write lock only when the schema is actually incomplete.
//
// This module lives in `src/lib` because it is used from both the Pages
// Functions (`functions/api/_lib`) and the Astro build (`src/lib`), and it
// must stay free of any runtime-specific dependency.

/**
 * @param {any} db
 * @param {{tables?:string[], indexes?:string[], tableColumns?:Record<string,string[]>}} [spec]
 * @returns {Promise<boolean>}
 */
export async function schemaReady(db, spec = {}) {
  if (!db || typeof db.prepare !== "function") return false;
  const tables = Array.isArray(spec.tables) ? spec.tables : [];
  const indexes = Array.isArray(spec.indexes) ? spec.indexes : [];
  const tableColumns = spec.tableColumns && typeof spec.tableColumns === "object" ? spec.tableColumns : {};
  const names = [...tables, ...indexes];
  if (names.length) {
    const placeholders = names.map(() => "?").join(",");
    const rows = await db.prepare(`SELECT name FROM sqlite_master WHERE name IN (${placeholders})`).bind(...names).all();
    const found = new Set((rows?.results || []).map(row => String(row?.name || "")));
    if (names.some(name => !found.has(name))) return false;
  }
  for (const [table, expected] of Object.entries(tableColumns)) {
    if (!/^[a-z_][a-z0-9_]*$/.test(String(table || ""))) throw new Error("invalid_schema_table_name");
    const columns = await db.prepare(`PRAGMA table_info(${table})`).all();
    const found = new Set((columns?.results || []).map(column => String(column?.name || "")));
    if (expected.some(name => !found.has(name))) return false;
  }
  return true;
}
