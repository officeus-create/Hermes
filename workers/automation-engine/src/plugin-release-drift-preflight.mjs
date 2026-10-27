// HAE existing plugin registry: source-only comparison with an independent
// Plugin Creator release inventory. This does NOT establish runtime/plugin
// compatibility or grant permission to update any plugin.
import { pluginRuntimeRegistrySnapshot } from "./plugin-runtime-registry.mjs";

const ID = /^hermes-[a-z0-9-]{2,70}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/;
const SHA = /^sha256:[a-f0-9]{64}$/;
const MAX_ENTRY = 64;

function reject(reason) { throw new Error("hae_plugin_drift_input_invalid:" + reason); }
function cleanObject(x, keys) {
  return x && !Array.isArray(x) && typeof x === "object" &&
    Object.keys(x).every(k => keys.includes(k));
}

export function planPluginReleaseReconciliation(input = {}, nowIso) {
  const expected = pluginRuntimeRegistrySnapshot();
  const allowed = ["source_class", "source_ref", "readback_at", "inventory_complete", "entries", "redaction_verified"];
  if (!cleanObject(input, allowed) || Object.keys(input).length !== allowed.length)
    reject("unexpected_or_missing_fields");
  if (input.source_class !== "PRIVATE_PLUGIN_CREATOR_READBACK" ||
      !/^plugin-creator:\/\/hermes\/releases\/[a-zA-Z0-9_-]{8,80}$/.test(input.source_ref || "") ||
      !Array.isArray(input.entries) || input.entries.length > MAX_ENTRY)
    reject("source_not_eligible");
  const now = Date.parse(nowIso);
  const readback = Date.parse(input.readback_at);
  if (!Number.isFinite(now) || !Number.isFinite(readback) ||
      typeof input.readback_at !== "string" ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(input.readback_at))
    reject("bad_readback_time");

  const ageHours = (now - readback) / 3600000;
  const fresh = ageHours >= 0 && ageHours <= 24;
  const actual = new Map();
  for (const entry of input.entries) {
    if (!cleanObject(entry, ["role_id", "plugin_version", "release_evidence_hash"]) ||
        Object.keys(entry).length !== 3 ||
        !ID.test(entry.role_id || "") ||
        !SEMVER.test(entry.plugin_version || "") ||
        !SHA.test(entry.release_evidence_hash || ""))
      reject("invalid_release_entry");
    if (actual.has(entry.role_id))reject("duplicate_role_identity");
    actual.set(entry.role_id, entry);
  }
  const registered = new Map(expected.entries.map(x => [x.role_id, x.plugin_version]));
  const mismatches = [];
  const missing = [];
  const unknown = [];
  for (const [roleId, expectedVersion] of registered) {
    const release = actual.get(roleId);
    if (!release)missing.push(roleId);
    else if (release.plugin_version !== expectedVersion) {
      mismatches.push({
        role_id:roleId, registered_version:expectedVersion,
        candidate_version:release.plugin_version,
        next_action:"INDEPENDENT_CONTRACT_TEST_AND_RELEASE_READBACK"
      });
    }
  }
  for (const roleId of actual.keys())if (!registered.has(roleId))unknown.push(roleId);

  const complete = input.inventory_complete === true && input.redaction_verified === true &&
    missing.length === 0 && unknown.length === 0;
  const status = !fresh ? "HOLD_STALE_READBACK" :
    !complete ? "HOLD_INCOMPLETE_OR_UNREDACTED" :
    mismatches.length ? "HOLD_VERSION_DRIFT_REVIEW" : "HOLD_RUNTIME_COMPATIBILITY_PROOF";

  return {
    status, readback_fresh:fresh, readback_age_hours:Math.round(ageHours*100)/100,
    source_class:input.source_class, source_ref:input.source_ref,
    registered_roles:registered.size, observed_roles:actual.size,
    missing_roles:missing, unknown_roles:unknown, version_mismatches:mismatches,
    registered_inventory_observed_at:expected.observed_at,
    proof_limit:"CALLER_PROVIDED_METADATA_NOT_INDEPENDENTLY_ATTESTED",
    requires_external_provider_release_readback:true,
    requires_runtime_role_contract_test:true,
    automatic_registry_update_allowed:false,
    automatic_plugin_update_allowed:false,
    automatic_dispatch_allowed:false,
    one_brain_write_allowed:false,
    scheduler_creation_allowed:false,
    paid_ai_cost_usd:0
  };
}
