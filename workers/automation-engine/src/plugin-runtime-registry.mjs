// Conservative timestamp for the latest authenticated Plugin Creator inventory readback.
// It uses the newest current release creation instant observed in that same readback as a
// millisecond-truncated lower bound, so freshness is never overstated by a fabricated local clock instant.
// This is bounded release evidence, NOT proof of runtime loading or automatic refreshing.
const OBSERVED_AT = "2026-11-05T13:45:58.040Z";

export const PLUGIN_RUNTIME_REGISTRY = Object.freeze({
  "hermes-automatic-engineer": Object.freeze({ version: "0.1.39", observed_at: OBSERVED_AT }),
  "hermes-agent-coordinator": Object.freeze({ version: "0.1.102", observed_at: OBSERVED_AT }),
  "hermes-technology-developer": Object.freeze({ version: "0.1.63", observed_at: OBSERVED_AT }),
  "hermes-connect-operator": Object.freeze({ version: "1.4.43", observed_at: OBSERVED_AT }),
  "hermes-qa-evidence-auditor": Object.freeze({ version: "0.1.26", observed_at: OBSERVED_AT }),
  "hermes-knowledge-curator": Object.freeze({ version: "0.1.112", observed_at: OBSERVED_AT }),
  "hermes-marketing-growth": Object.freeze({ version: "0.1.20", observed_at: OBSERVED_AT }),
  "hermes-search-growth": Object.freeze({ version: "0.1.18", observed_at: OBSERVED_AT }),
  "hermes-academy": Object.freeze({ version: "0.1.17", observed_at: OBSERVED_AT }),
  "hermes-dispatch-os": Object.freeze({ version: "0.1.27", observed_at: OBSERVED_AT }),
  "hermes-github-auditor": Object.freeze({ version: "0.1.4", observed_at: OBSERVED_AT }),
  "hermes-cloudflare-auditor": Object.freeze({ version: "0.1.4", observed_at: OBSERVED_AT }),
  "hermes-drive-auditor": Object.freeze({ version: "0.1.5", observed_at: OBSERVED_AT }),
  "hermes-website-auditor": Object.freeze({ version: "0.1.5", observed_at: OBSERVED_AT }),
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
  const observedMs = Date.parse(snapshot.observed_at);
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
