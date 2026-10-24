const OBSERVED_AT = "2026-10-25";

export const PLUGIN_RUNTIME_REGISTRY = Object.freeze({
  "hermes-automatic-engineer": Object.freeze({ version: "0.1.25", observed_at: OBSERVED_AT }),
  "hermes-agent-coordinator": Object.freeze({ version: "0.1.68", observed_at: OBSERVED_AT }),
  "hermes-technology-developer": Object.freeze({ version: "0.1.55", observed_at: OBSERVED_AT }),
  "hermes-qa-evidence-auditor": Object.freeze({ version: "0.1.5", observed_at: OBSERVED_AT }),
  "hermes-knowledge-curator": Object.freeze({ version: "0.1.77", observed_at: OBSERVED_AT }),
  "hermes-marketing-growth": Object.freeze({ version: "0.1.6", observed_at: OBSERVED_AT }),
  "hermes-search-growth": Object.freeze({ version: "0.1.6", observed_at: OBSERVED_AT }),
  "hermes-academy": Object.freeze({ version: "0.1.12", observed_at: OBSERVED_AT }),
  "hermes-dispatch-os": Object.freeze({ version: "0.1.20", observed_at: OBSERVED_AT }),
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
