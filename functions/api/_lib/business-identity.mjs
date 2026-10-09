const BUSINESS_NAMESPACES = new Set(["company", "repair_shop", "beauty_salon"]);
const NATIVE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/;
const LINK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/;
const EVIDENCE_REF_RE = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{0,239}$/;

const clean = (value, max = 180) =>
  String(value ?? "")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);

export function createBusinessRef(namespace, nativeId) {
  const ns = clean(namespace, 40).toLowerCase();
  const id = clean(nativeId, 160);
  if (!BUSINESS_NAMESPACES.has(ns) || !NATIVE_ID_RE.test(id)) return null;
  return `${ns}:${id}`;
}

export function parseBusinessRef(value) {
  const raw = clean(value, 220);
  const separator = raw.indexOf(":");
  if (separator <= 0 || separator === raw.length - 1) return null;
  const namespace = raw.slice(0, separator);
  const nativeId = raw.slice(separator + 1);
  const ref = createBusinessRef(namespace, nativeId);
  return ref ? { ref, namespace, native_id: nativeId } : null;
}

export function sameBusinessRef(left, right) {
  const a = parseBusinessRef(left);
  const b = parseBusinessRef(right);
  return Boolean(a && b && a.ref === b.ref);
}

export function businessRefForRecord(namespace, row) {
  return createBusinessRef(namespace, row?.id);
}

export function normalizeBusinessIdentityLink(input = {}) {
  const id = clean(input.id, 160);
  const canonical = parseBusinessRef(input.canonical_ref);
  const alias = parseBusinessRef(input.alias_ref);
  const relationshipType = clean(input.relationship_type, 40).toLowerCase();
  const evidenceRef = clean(input.evidence_ref, 240);
  const verifiedBy = clean(input.verified_by, 160);
  const verifiedAtRaw = clean(input.verified_at, 64);
  const verifiedAtMs = Date.parse(verifiedAtRaw);

  if (!LINK_ID_RE.test(id)) return null;
  if (!canonical || !alias || canonical.ref === alias.ref) return null;
  if (relationshipType !== "same_business") return null;
  if (!EVIDENCE_REF_RE.test(evidenceRef) || !LINK_ID_RE.test(verifiedBy) || !Number.isFinite(verifiedAtMs)) return null;

  return {
    id,
    canonical_ref: canonical.ref,
    alias_ref: alias.ref,
    relationship_type: "same_business",
    evidence_ref: evidenceRef,
    verified_by: verifiedBy,
    verified_at: new Date(verifiedAtMs).toISOString(),
    active: input.active !== false,
  };
}

export function resolveCanonicalBusinessRef(value, links = []) {
  const parsed = parseBusinessRef(value);
  if (!parsed) return null;

  const byAlias = new Map();
  for (const candidate of links) {
    const link = normalizeBusinessIdentityLink(candidate);
    if (!link?.active) continue;
    if (byAlias.has(link.alias_ref)) return null;
    byAlias.set(link.alias_ref, link.canonical_ref);
  }

  let current = parsed.ref;
  const seen = new Set([current]);
  for (let depth = 0; depth < 8; depth += 1) {
    const next = byAlias.get(current);
    if (!next) return current;
    if (seen.has(next)) return null;
    seen.add(next);
    current = next;
  }
  return byAlias.has(current) ? null : current;
}

export const HERMES_BUSINESS_NAMESPACES = Object.freeze([...BUSINESS_NAMESPACES]);
