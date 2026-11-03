import assert from "node:assert/strict";
import {planPluginReleaseReconciliation as plan} from "../workers/automation-engine/src/plugin-release-drift-preflight.mjs";
import {pluginRuntimeRegistrySnapshot} from "../workers/automation-engine/src/plugin-runtime-registry.mjs";
const registryObservedAt=pluginRuntimeRegistrySnapshot().observed_at;
const plusHours=(iso,hours)=>new Date(Date.parse(iso)+hours*3600000).toISOString();
const readbackAt=plusHours(registryObservedAt,1);
const checkedAt=plusHours(registryObservedAt,2);
const known=pluginRuntimeRegistrySnapshot().entries;
const base={
 source_class:"PRIVATE_PLUGIN_CREATOR_READBACK",
 source_ref:"plugin-creator://hermes/releases/readback_20261026",
 readback_at:readbackAt, inventory_complete:true,redaction_verified:true,
 entries:known.map(x=>({
  role_id:x.role_id,plugin_version:x.plugin_version,
  release_evidence_hash:"sha256:"+"b".repeat(64)
 }))
};
const current=plan(base,checkedAt);
assert.equal(current.status,"HOLD_RUNTIME_COMPATIBILITY_PROOF");
assert.equal(current.readback_fresh,true);
assert.equal(current.registered_inventory_fresh,true);
assert.equal(current.registered_inventory_age_hours,2);
assert.equal(current.version_mismatches.length,0);
assert.equal(current.registered_roles,known.length,"registry-size assertion must follow the canonical runtime subset, not a historical hard-coded count");
assert.equal(current.automatic_dispatch_allowed,false);
assert.equal(current.one_brain_write_allowed,false);
assert.equal(current.automatic_plugin_update_allowed,false);
assert.equal(current.requires_external_provider_release_readback,true);

const driftRoles=new Set([
 "hermes-automatic-engineer",
 "hermes-agent-coordinator",
 "hermes-qa-evidence-auditor",
 "hermes-knowledge-curator"
]);
const bumpPatch=(version)=>{
 const [major,minor,patch]=version.split(".").map(Number);
 return `${major}.${minor}.${patch+1}`;
};
const drift=plan({...base,entries:base.entries.map(x=>({...x,plugin_version:driftRoles.has(x.role_id)?bumpPatch(x.plugin_version):x.plugin_version}))},checkedAt);
assert.equal(drift.status,"HOLD_VERSION_DRIFT_REVIEW");
assert.equal(drift.version_mismatches.length,4);
assert.ok(drift.version_mismatches.every(x=>x.next_action==="INDEPENDENT_CONTRACT_TEST_AND_RELEASE_READBACK"));
assert.equal(drift.automatic_registry_update_allowed,false);
assert.equal(plan(base,plusHours(registryObservedAt,50)).status,"HOLD_STALE_READBACK");
const registryStale=plan({...base,readback_at:plusHours(registryObservedAt,25)},plusHours(registryObservedAt,26));
assert.equal(registryStale.status,"HOLD_STALE_REGISTERED_REGISTRY");
assert.equal(registryStale.readback_fresh,true,"Fresh external metadata must not hide an expired local registry");
assert.equal(registryStale.registered_inventory_fresh,false);
assert.equal(registryStale.automatic_dispatch_allowed,false);
assert.equal(plan({...base,inventory_complete:false},checkedAt).status,"HOLD_INCOMPLETE_OR_UNREDACTED");
assert.equal(plan({...base,redaction_verified:false},checkedAt).status,"HOLD_INCOMPLETE_OR_UNREDACTED");
assert.equal(plan({...base,entries:base.entries.slice(1)},checkedAt).missing_roles.length,1);
const providerOnly=[...base.entries,{role_id:"hermes-provider-only-agent",plugin_version:"1.2.3",release_evidence_hash:"sha256:"+"b".repeat(64)}];
const providerOnlyResult=plan({...base,entries:providerOnly},checkedAt);
assert.equal(providerOnlyResult.status,"HOLD_RUNTIME_COMPATIBILITY_PROOF","A complete provider inventory may legitimately contain Hermes plugins outside the HAE runtime subset");
assert.deepEqual(providerOnlyResult.provider_only_roles,["hermes-provider-only-agent"]);
assert.equal(providerOnlyResult.observed_roles,known.length+1);
const rejects=[
 [{...base,raw_secret:"do not read"},"unknown"],
 [{...base,source_class:"USER_SUPPLIED_PROOF"},"source"],
 [{...base,source_ref:"https://private.example"},"url"],
 [{...base,readback_at:"2026-10-26"},"time"],
 [{...base,entries:[...base.entries,base.entries[0]]},"duplicate"],
 [{...base,entries:[{...base.entries[0],plugin_version:"not-a-version"}]},"version"],
 [{...base,entries:[{...base.entries[0],release_evidence_hash:"none"}]},"hash"],
 [{...base,entries:[{...base.entries[0],private_key:"secret"}]},"private field"],
 [{...base,entries:new Array(65).fill(base.entries[0])},"bound"],
];
for(const [input,name] of rejects)assert.throws(()=>plan(input,checkedAt),/hae_plugin_drift_input_invalid:/,name);
console.log("HAE_PLUGIN_VERSION_DRIFT_PREFLIGHT_PASS",{
  registered:known.length,version_mismatches:4,adversarial_cases:rejects.length,
  external_reads:0,external_writes:0,automatic_upgrades:0
});
