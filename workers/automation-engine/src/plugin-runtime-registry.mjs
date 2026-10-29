const OBSERVED_AT = "2026-10-29";

export const PLUGIN_RUNTIME_REGISTRY = Object.freeze({
  "hermes-automatic-engineer": Object.freeze({ version: "0.1.34", observed_at: OBSERVED_AT }),
  "hermes-agent-coordinator": Object.freeze({ version: "0.1.80", observed_at: OBSERVED_AT }),
  "hermes-technology-developer": Object.freeze({ version: "0.1.60", observed_at: OBSERVED_AT }),
  "hermes-qa-evidence-auditor": Object.freeze({ version: "0.1.16", observed_at: OBSERVED_AT }),
  "hermes-knowledge-curator": Object.freeze({ version: "0.1.88", observed_at: OBSERVED_AT }),
  "hermes-marketing-growth": Object.freeze({ version: "0.1.13", observed_at: OBSERVED_AT }),
  "hermes-search-growth": Object.freeze({ version: "0.1.12", observed_at: OBSERVED_AT }),
  "hermes-academy": Object.freeze({ version: "0.1.13", observed_at: OBSERVED_AT }),
  "hermes-dispatch-os": Object.freeze({ version: "0.1.26", observed_at: OBSERVED_AT }),
});

export function pluginRuntimeVersion(roleId) {
  const entry = PLUGIN_RUNTIME_REGISTRY[String(roleId || "")];
  if (!entry?.version) throw new Error("plugin_runtime_version_unverified");
  return entry.version;
}

export function pluginRuntimeRegistrySnapshot() {
  return {
    observed_at: OBSERVED_AT,
    source_class: "PRIVATE_PLUGIN_CREATOR_READBACK",
    entries: Object.entries(PLUGIN_RUNTIME_REGISTRY).map(([role_id, value]) => ({
      role_id,
      plugin_version: value.version,
      observed_at: value.observed_at,
    })),
  };
}

export function pluginRuntimeRegistryEvidenceStatus(nowIso, maxAgeHours = 24) {
  const snapshot = pluginRuntimeRegistrySnapshot();
  const nowMs = Date.parse(String(nowIso || ""));
  const observedMs = Date.parse(`${snapshot.observed_at}T00:00:00Z`);
  const maxAge = Number(maxAgeHours);
  if (!Number.isFinite(nowMs) || !Number.isFinite(observedMs) || !Number.isFinite(maxAge) || maxAge <= 0) {
    return {
      fresh: false,
      reason: "INVALID_EVIDENCE_TIME",
      age_hours: null,
      source_class: snapshot.source_class,
      observed_at: snapshot.observed_at,
    };
  }
  const ageHours = (nowMs - observedMs) / 3600000;
  const fresh = ageHours >= 0 && ageHours <= maxAge;
  return {
    fresh,
    reason: fresh ? "FRESH" : "STALE_OR_FUTURE",
    age_hours: Math.round(ageHours * 100) / 100,
    source_class: snapshot.source_class,
    observed_at: snapshot.observed_at,
  };
}
