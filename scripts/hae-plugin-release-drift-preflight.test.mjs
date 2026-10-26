import assert from "node:assert/strict";
import {planPluginReleaseReconciliation as plan} from "../workers/automation-engine/src/plugin-release-drift-preflight.mjs";
import {pluginRuntimeRegistrySnapshot} from "../workers/automation-engine/src/plugin-runtime-registry.mjs";
const readbackAt="2026-10-26T14:00:00Z";
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
const current=plan(base,"2026-10-26T16:00:00Z");
assert.equal(current.status,"HOLD_RUNTIME_COMPATIBILITY_PROOF");
assert.equal(current.readback_fresh,true);
assert.equal(current.version_mismatches.length,0);
assert.equal(current.registered_roles,9);
assert.equal(current.automatic_dispatch_allowed,false);
assert.equal(current.one_brain_write_allowed,false);
assert.equal(current.automatic_plugin_update_allowed,false);
assert.equal(current.requires_external_provider_release_readback,true);

const newer={
 "hermes-automatic-engineer":"0.1.26",
 "hermes-agent-coordinator":"0.1.71",
 "hermes-qa-evidence-auditor":"0.1.8",
 "hermes-knowledge-curator":"0.1.81"
};
const drift=plan({...base,entries:base.entries.map(x=>({...x,plugin_version:newer[x.role_id]||x.plugin_version}))},"2026-10-26T16:00:00Z");
assert.equal(drift.status,"HOLD_VERSION_DRIFT_REVIEW");
assert.equal(drift.version_mismatches.length,4);
assert.ok(drift.version_mismatches.every(x=>x.next_action==="INDEPENDENT_CONTRACT_TEST_AND_RELEASE_READBACK"));
assert.equal(drift.automatic_registry_update_allowed,false);
assert.equal(plan(base,"2026-10-28T15:00:00Z").status,"HOLD_STALE_READBACK");
assert.equal(plan({...base,inventory_complete:false},"2026-10-26T16:00:00Z").status,"HOLD_INCOMPLETE_OR_UNREDACTED");
assert.equal(plan({...base,redaction_verified:false},"2026-10-26T16:00:00Z").status,"HOLD_INCOMPLETE_OR_UNREDACTED");
assert.equal(plan({...base,entries:base.entries.slice(1)},"2026-10-26T16:00:00Z").missing_roles.length,1);
const unknown=[...base.entries,{role_id:"hermes-unknown-agent",plugin_version:"1.2.3",release_evidence_hash:"sha256:"+"b".repeat(64)}];
assert.equal(plan({...base,entries:unknown},"2026-10-26T16:00:00Z").unknown_roles.length,1);
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
for(const [input,name] of rejects)assert.throws(()=>plan(input,"2026-10-26T16:00:00Z"),/hae_plugin_drift_input_invalid:/,name);
console.log("HAE_PLUGIN_VERSION_DRIFT_PREFLIGHT_PASS",{
  registered:known.length,version_mismatches:4,adversarial_cases:rejects.length,
  external_reads:0,external_writes:0,automatic_upgrades:0
});
