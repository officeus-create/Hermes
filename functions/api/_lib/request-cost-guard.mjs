// Request-cost guard for the private Command Center read path.
//
// Problem (production incident 2026-11-06, Cloudflare 1102 on every private route):
// each authenticated owner request re-ran the full schema bootstrap, which includes
// the historical and four-month backlog seeders, the internal-AI schema DDL, the
// account-engagement schema DDL and an unconditional reconcile UPDATE pair. The
// private page then repeated that whole cost once per card every 15 seconds.
// Workers CPU limits were exhausted, so the private Command Center — including
// receipt readback — returned 1102 while the public site stayed healthy.
//
// Contract: the schema bootstrap runs once per isolate, reconcile probes before it
// writes, and outbound reads are cached so the upstream cost does not scale with
// the poll rate.

/** @typedef {{ promise: Promise<any>, expiresAt: number }} GuardEntry */

/** @type {Map<string, GuardEntry>} */
const ensureCache = new Map();
/** @type {Map<string, GuardEntry>} */
const valueCache = new Map();

const DEFAULT_SCHEMA_TTL_MS = 30 * 60 * 1000;

/**
 * Run a bootstrap once per isolate and cache the promise.
 * A rejected factory is not cached, so a transient failure can recover immediately.
 * @param {any} db
 * @param {string} key
 * @param {() => any} factory
 * @param {{ ttlMs?: number }} [options]
 * @returns {Promise<any>}
 */
export function ensureOnce(db, key, factory, options = {}) {
  if (!db) return Promise.reject(new Error("database_not_configured"));
  if (typeof factory !== "function") return Promise.reject(new Error("invalid_bootstrap_factory"));
  const ttlMs = Number.isFinite(Number(options.ttlMs)) ? Number(options.ttlMs) : DEFAULT_SCHEMA_TTL_MS;
  const existing = ensureCache.get(key);
  const now = Date.now();
  if (existing && existing.expiresAt > now) return existing.promise;
  const promise = Promise.resolve()
    .then(() => factory())
    .catch((error) => {
      ensureCache.delete(key);
      throw error;
    });
  ensureCache.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

/**
 * Cache a value (typically an outbound read) for a short window, so repeated
 * polls do not repeat the upstream cost. Failures are not cached for the full TTL:
 * they fall back to a short retry window.
 * @param {string} key
 * @param {() => any} factory
 * @param {{ ttlMs?: number, errorTtlMs?: number }} [options]
 * @returns {Promise<any>}
 */
export function cachedValue(key, factory, options = {}) {
  if (typeof factory !== "function") return Promise.reject(new Error("invalid_cached_factory"));
  const ttlMs = Number.isFinite(Number(options.ttlMs)) ? Number(options.ttlMs) : 60_000;
  const errorTtlMs = Number.isFinite(Number(options.errorTtlMs)) ? Number(options.errorTtlMs) : 5_000;
  const existing = valueCache.get(key);
  const now = Date.now();
  if (existing && existing.expiresAt > now) return existing.promise;
  const promise = Promise.resolve()
    .then(() => factory())
    .catch((error) => {
      valueCache.delete(key);
      throw error;
    });
  valueCache.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

/**
 * Test-only: reset the per-isolate caches.
 * @returns {void}
 */
export function resetRequestCostGuard() {
  ensureCache.clear();
  valueCache.clear();
}
