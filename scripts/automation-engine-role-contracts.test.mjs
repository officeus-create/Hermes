import {verifyCommandCenterHaeReceipt} from "../functions/api/_lib/command-center-hae-receipt-verifier.mjs";
import assert from "node:assert/strict";
import {
  CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES,
  ROLE_CONTRACTS,
  ROLE_CONTRACT_JOB_TYPES,
  buildRoleContractSemanticRequest,
  roleContractForJobType,
  roleContractSha256,
  runRoleContractPrimitive,
  stableRoleContractJson,
  validateRoleContractInput,
  validateRoleContractSemanticResult,
} from "../workers/automation-engine/src/role-contracts.mjs";
import { pluginRuntimeVersion } from "../workers/automation-engine/src/plugin-runtime-registry.mjs";

assert.equal(ROLE_CONTRACTS.length, 17, "Runtime must expose fifteen deterministic contracts plus two free-only semantic contracts");
assert.deepEqual(
  [...ROLE_CONTRACT_JOB_TYPES].sort(),
  [
    "academy.english.practice.build",
    "ai.gateway.readiness.audit",
    "dispatch.daily.closeout.audit",
    "growth.error.closure.audit",
    "hae.self.improvement.audit",
    "hae.self.repair.packet",
    "hae.self.patch.propose",
    "hae.self.release.verify",
    "knowledge.evidence.audit",
    "logistics.source.freshness.audit",
    "market.car-hauling.snapshot.evaluate",
    "marketing.content.dedupe.audit",
    "marketing.mentions.audit",
    "search.defect.prioritize",
    "search.snapshot.evaluate",
    "technology.release.radar",
    "work.portfolio.reconcile",
  ].sort(),
);

for (const contract of ROLE_CONTRACTS) {
  for (const field of [
    "role_id","plugin_version","contract_version","job_type","business_lane","permission_class",
    "semantic_required","free_ai_policy","trigger","input_schema","runtime_config","preconditions","deterministic_steps",
    "output_schema","kpi","owner_gate","readback","failure","retention",
  ]) {
    assert.notEqual(contract[field], undefined, `${contract.job_type} missing ${field}`);
  }
  assert.equal(contract.permission_class, "READ_ONLY");
  if (contract.semantic_required) {
    assert.ok(["search.defect.prioritize", "hae.self.patch.propose"].includes(contract.job_type));
    assert.equal(contract.free_ai_policy, "free_only_wait_if_unavailable");
    assert.equal(contract.runtime_config.retry_seconds, 900);
    assert.equal(contract.runtime_config.max_cost_usd, 0, "Semantic contract must be zero-dollar by default");
  } else if (contract.runtime_config.scheduled !== false) {
    assert.equal(contract.free_ai_policy, "not_required");
    assert.ok(Number.isInteger(contract.runtime_config.cadence_hours));
    assert.ok(contract.runtime_config.cadence_hours >= 1 && contract.runtime_config.cadence_hours <= 24);
  }
  const sha = await roleContractSha256(contract);
  assert.match(sha, /^[0-9a-f]{64}$/);
  assert.equal(sha, await roleContractSha256(JSON.parse(stableRoleContractJson(contract))), "Contract digest must be canonical/deterministic");
  assert.equal(roleContractForJobType(contract.job_type)?.contract_version, contract.contract_version);
}
const searchContract = roleContractForJobType("search.snapshot.evaluate");
assert.ok(searchContract.runtime_config.target_urls.length >= 3);
assert.ok(searchContract.runtime_config.target_urls.every((url) => url.startsWith("https://hermeslogisticsus.com/")));
assert.ok(roleContractForJobType("marketing.content.dedupe.audit").runtime_config.lookback_limit <= 500);
assert.equal(roleContractForJobType("logistics.source.freshness.audit").runtime_config.max_age_minutes, 1440);
assert.equal(roleContractForJobType("ai.gateway.readiness.audit").runtime_config.cadence_hours, 24);
assert.equal(roleContractForJobType("academy.english.practice.build").runtime_config.cadence_hours, 24);
assert.equal(roleContractForJobType("work.portfolio.reconcile").plugin_version, pluginRuntimeVersion("hermes-agent-coordinator"));
assert.equal(roleContractForJobType("hae.self.improvement.audit").plugin_version, pluginRuntimeVersion("hermes-automatic-engineer"));
assert.equal(roleContractForJobType("hae.self.release.verify").role_id, "hermes-qa-evidence-auditor");
assert.equal(roleContractForJobType("hae.self.release.verify").plugin_version, pluginRuntimeVersion("hermes-qa-evidence-auditor"));
assert.ok(ROLE_CONTRACT_JOB_TYPES.includes("hae.self.release.verify"), "Dormant self-release capability remains directly inspectable");
assert.ok(!CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES.includes("hae.self.release.verify"), "Dormant self-release capability must not be graph-routable before authenticated activation");
assert.ok(!CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES.includes("hae.self.patch.propose"), "Patch proposal must not be graph-routable before authenticated source adapter activation");
assert.equal(roleContractForJobType("hae.self.patch.propose").role_id, "hermes-automatic-engineer");
assert.equal(roleContractForJobType("hae.self.patch.propose").runtime_config.max_cost_usd, 0);
assert.equal(CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES.length, ROLE_CONTRACT_JOB_TYPES.length - 2);
assert.equal(roleContractForJobType("knowledge.evidence.audit").role_id, "hermes-knowledge-curator");
assert.equal(roleContractForJobType("knowledge.evidence.audit").plugin_version, pluginRuntimeVersion("hermes-knowledge-curator"));
assert.equal(ROLE_CONTRACTS.filter((contract) => !contract.semantic_required).length, 15);
assert.equal(ROLE_CONTRACTS.filter((contract) => contract.semantic_required).length, 2);

const searchInput = {
  pages: [
    { url: "https://hermeslogisticsus.com/a", status: 200, canonical: "https://hermeslogisticsus.com/a", indexable: true, in_sitemap: true },
    { url: "https://hermeslogisticsus.com/b", status: 404, canonical: "", indexable: true, in_sitemap: true },
    { url: "https://hermeslogisticsus.com/c", status: 200, canonical: "https://hermeslogisticsus.com/d", indexable: true, in_sitemap: true },
    { url: "https://hermeslogisticsus.com/e", status: 200, canonical: "https://hermeslogisticsus.com/e", indexable: false, in_sitemap: true },
  ],
};
validateRoleContractInput("search.snapshot.evaluate", searchInput);
const search = runRoleContractPrimitive("search.snapshot.evaluate", searchInput, "2026-10-24T18:00:00.000Z");
assert.equal(search.http_error_count, 1);
assert.equal(search.missing_canonical_count, 1);
assert.equal(search.canonical_mismatch_count, 1);
assert.equal(search.canonical_defect_count, 2);
assert.equal(search.sitemap_indexability_conflict_count, 1);

const marketing = runRoleContractPrimitive("marketing.content.dedupe.audit", {
  items: [
    { content_id: "a", slot_key: "2026-10-24", body_fingerprint: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    { content_id: "b", slot_key: "2026-10-25", body_fingerprint: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    { content_id: "c", slot_key: "2026-10-25", body_fingerprint: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
  ],
});
assert.equal(marketing.duplicate_content_groups, 1);
assert.equal(marketing.duplicate_slot_groups, 1);
assert.equal(marketing.raw_body_persisted, false);
assert.equal(marketing.fingerprint_only, true);
assert.ok(!JSON.stringify(marketing).includes("body_fingerprint"), "Runtime result must expose duplicate ids, not fingerprint material");

const logistics = runRoleContractPrimitive("logistics.source.freshness.audit", {
  max_age_minutes: 60,
  sources: [
    { source_id: "fresh", last_seen_at: "2026-10-24T17:30:00.000Z", expires_at: "2026-10-24T20:00:00.000Z" },
    { source_id: "stale", last_seen_at: "2026-10-24T15:00:00.000Z", expires_at: "2026-10-24T20:00:00.000Z" },
    { source_id: "expired", last_seen_at: "2026-10-24T17:45:00.000Z", expires_at: "2026-10-24T17:59:00.000Z" },
    { source_id: "broken", last_seen_at: "not-a-date", expires_at: null },
    { source_id: "fresh", last_seen_at: "2026-10-24T17:50:00.000Z", expires_at: null },
  ],
}, "2026-10-24T18:00:00.000Z");
assert.equal(logistics.stale_source_count, 1);
assert.equal(logistics.expired_source_count, 1);
assert.equal(logistics.invalid_source_count, 1);
assert.equal(logistics.duplicate_source_count, 1);

assert.throws(() => validateRoleContractInput("search.snapshot.evaluate", { pages: [{ url: "not-url" }] }), /search_page_invalid/);
assert.throws(() => validateRoleContractInput("marketing.content.dedupe.audit", { items: [{ content_id: "x", slot_key: "s", body_fingerprint: "bad" }] }), /marketing_body_fingerprint_required/);
assert.throws(() => validateRoleContractInput("logistics.source.freshness.audit", { sources: [], max_age_minutes: 0 }), /max_age_minutes_invalid/);

const semanticPayload = {
  parent_job_id: "job:parent",
  defects: [
    { defect_type: "http_error", url: "https://hermeslogisticsus.com/load-board/" },
    { defect_type: "canonical_mismatch", url: "https://hermeslogisticsus.com/services/seo/" },
  ],
};
validateRoleContractInput("search.defect.prioritize", semanticPayload);
const semanticRequest = buildRoleContractSemanticRequest("search.defect.prioritize", semanticPayload);
assert.match(semanticRequest.system_prompt, /Return JSON only/);
assert.ok(semanticRequest.user_prompt.includes("canonical_mismatch"));
assert.ok(semanticRequest.max_output_tokens <= 600);
const semanticResult = validateRoleContractSemanticResult("search.defect.prioritize", semanticPayload, {
  priorities: [
    {
      url: "https://hermeslogisticsus.com/load-board/",
      defect_type: "http_error",
      priority: 95,
      reason: "The page is unavailable.",
      next_action: "Verify the current production response and repair only the confirmed defect.",
    },
    {
      url: "https://hermeslogisticsus.com/services/seo/",
      defect_type: "canonical_mismatch",
      priority: 70,
      reason: "The canonical points away from the inspected owner.",
      next_action: "Reconcile the canonical against the current search owner before changing it.",
    },
  ],
});
assert.equal(semanticResult.prioritized_defect_count, 2);
assert.equal(semanticResult.priorities[0].priority, 95);
assert.throws(() => validateRoleContractInput("search.defect.prioritize", {
  defects: [{ defect_type: "http_error", url: "https://example.com/" }],
}), /search_defect_url_invalid/);
assert.throws(() => validateRoleContractSemanticResult("search.defect.prioritize", semanticPayload, {
  priorities: [{ url: "https://hermeslogisticsus.com/not-in-input/", defect_type: "http_error", priority: 90, reason: "x", next_action: "y" }],
}), /semantic_result_item_not_in_input/);
assert.throws(() => runRoleContractPrimitive("search.defect.prioritize", semanticPayload), /semantic_job_requires_free_ai/);

const patchArtifact="scripts/hae-self-patch-proposal-contract.test.mjs";
const patchPayload={
  work_id:"HAE-SELF:ci-40421315430-4-abcdef123456",
  finding_id:"ci-40421315430-4-abcdef123456",
  repair_job_id:"job:12345678-1234-1234-1234-123456789abc",
  artifact_key:patchArtifact,
  base_sha:"a".repeat(40),
  observed_base_sha:"a".repeat(40),
  defect_evidence_ref:"HAE-EVIDENCE:ci_failure_40421315430_4",
  source_status:"HOLD_REPAIR",
  source_coverage_complete:true,
  finding_verified:true,
  writer_state_verified:true,
  writer_active:false,
  source_excerpt:"import assert from \"node:assert/strict\";\nassert.equal(0, 1);\n",
  source_excerpt_sha256:"sha256:"+"b".repeat(64),
  failure_summary:"Exact-head deterministic test failed because the fixture expected zero instead of one."
};
validateRoleContractInput("hae.self.patch.propose",patchPayload);
const patchRequest=buildRoleContractSemanticRequest("hae.self.patch.propose",patchPayload);
assert.match(patchRequest.system_prompt,/PATCH_PROPOSAL_ONLY/);
assert.ok(patchRequest.user_prompt.includes(patchArtifact));
assert.ok(patchRequest.max_output_tokens<=1200);
const patchDiff=[
  "diff --git a/"+patchArtifact+" b/"+patchArtifact,
  "--- a/"+patchArtifact,
  "+++ b/"+patchArtifact,
  "@@ -2 +2 @@",
  "-assert.equal(0, 1);",
  "+assert.equal(1, 1);",
  ""
].join("\n");
const patchResult=validateRoleContractSemanticResult("hae.self.patch.propose",patchPayload,{
  diff:patchDiff,
  rationale:"The deterministic assertion should match the verified expected value."
});
assert.equal(patchResult.proposal_status,"HOLD_BOUNDED_REPAIR_PREFLIGHT");
assert.equal(patchResult.artifact_key,patchArtifact);
assert.equal(patchResult.changed_line_count,2);
assert.equal(patchResult.hunk_count,1);
for(const field of ["automatic_git_write","automatic_branch_creation","automatic_merge","automatic_deploy","knowledge_auto_promotion"]){
  assert.equal(patchResult[field],false,field);
}
assert.equal(patchResult.paid_inference_cost_usd,0);
assert.throws(()=>validateRoleContractInput("hae.self.patch.propose",{...patchPayload,artifact_key:"workers/automation-engine/src/index.mjs"}),/hae_patch_artifact_invalid/);
assert.throws(()=>validateRoleContractInput("hae.self.patch.propose",{...patchPayload,observed_base_sha:"c".repeat(40)}),/hae_patch_base_sha_invalid/);
assert.throws(()=>validateRoleContractInput("hae.self.patch.propose",{...patchPayload,source_excerpt:"const token=\"ghp_12345678901234567890\";"}),/hae_patch_source_excerpt_secret_like/);
assert.throws(()=>validateRoleContractSemanticResult("hae.self.patch.propose",patchPayload,{
  diff:patchDiff.replaceAll(patchArtifact,"workers/automation-engine/src/index.mjs"),
  rationale:"Attempt another file."
}),/hae_patch_diff_file_invalid/);
assert.throws(()=>validateRoleContractSemanticResult("hae.self.patch.propose",patchPayload,{
  diff:patchDiff.replace("+assert.equal(1, 1);","+fetch(\"https://example.com\");"),
  rationale:"Unsafe network addition."
}),/hae_patch_diff_unsafe_added_code/);
assert.throws(()=>runRoleContractPrimitive("hae.self.patch.propose",patchPayload),/semantic_job_requires_free_ai/);

console.log("HAE plugin role contracts PASS: 15 zero-model + 2 free-only semantic contracts");

// #2220: fixture-only matching does not grant an authenticated runtime receipt.
const ccRole=roleContractForJobType("work.portfolio.reconcile");
assert.ok(ccRole);
const ccSha=await roleContractSha256(ccRole); // exact HAE unprefixed SHA digest
const ccJobId="job:12345678-1234-1234-1234-123456789abc";
const ccWorkItem={
  id:"hcwi_12345678-1234-1234-1234-123456789abc",
  organization_scope:"hermes_internal",
  linked_task_id:"hait_12345678-1234-1234-1234-123456789abc",
  plugin_route_json:JSON.stringify({
    policy_version:"command-center-route-v1",
    state:"PLUGIN_SELECTED_NOT_EXECUTED",
    owner:{role_id:ccRole.role_id,plugin_version:ccRole.plugin_version},
    helpers:[],
  }),
};
const ccRegistry=[{role_id:ccRole.role_id,plugin_version:ccRole.plugin_version}];
const ccBinding={
  work_item_id:ccWorkItem.id,linked_task_id:ccWorkItem.linked_task_id,
  hae_job_id:ccJobId,idempotency_key:"hae:command-center:fixture-1",
  job_type:ccRole.job_type,contract_sha256:ccSha,
};
const ccIdentity={
  role_id:ccRole.role_id,plugin_version:ccRole.plugin_version,
  contract_version:ccRole.contract_version,sha256:ccSha,
};
const ccJob={
  job_id:ccJobId,job_type:ccRole.job_type,idempotency_key:ccBinding.idempotency_key,
  state:"SUCCEEDED",payload_json:JSON.stringify({_role_contract:ccIdentity}),
  result_json:JSON.stringify({
    capability:ccRole.job_type,external_write:false,role_contract:ccIdentity,
    result:{snapshot_state:"SOURCE_FIXTURE_ONLY"},
  }),
};
const ccEvents=[{job_id:ccJobId,event_type:"job.succeeded",to_state:"SUCCEEDED"}];
const ccBase={
  workItem:ccWorkItem,registryEntries:ccRegistry,registryEvidence:{fresh:true},
  binding:ccBinding,haeJob:ccJob,jobEvents:ccEvents,roleContract:ccRole,
};
const inspectCc=(patch={})=>verifyCommandCenterHaeReceipt({...ccBase,...patch});
const matched=await inspectCc();
assert.equal(matched.state,"MATCHED_SOURCE_ONLY");
assert.equal(matched.source_only,true);
assert.equal(matched.helper_execution_verified,false);
const ccDenials=[
  [{registryEvidence:{fresh:false}},"REGISTRY_SNAPSHOT_UNVERIFIED"],
  [{registryEntries:[{...ccRegistry[0],plugin_version:"0.0.0"}]},"PLUGIN_ROUTE_VERSION_DRIFT"],
  [{workItem:{...ccWorkItem,organization_scope:"external"}},"OWNER_WORK_ITEM_UNVERIFIED"],
  [{workItem:{...ccWorkItem,plugin_route_json:"{oops"}},"ROUTE_NOT_VERIFIED"],
  [{binding:{...ccBinding,hae_job_id:"job:22222222-2222-2222-2222-222222222222"}},"CANONICAL_JOB_IDENTITY_MISMATCH"],
  [{binding:{...ccBinding,contract_sha256:"b".repeat(64)}},"ROLE_CONTRACT_SHA_MISMATCH"],
  [{haeJob:{...ccJob,state:"RUNNING"}},"NO_SUCCEEDED_HAE_JOB"],
  [{haeJob:{...ccJob,job_type:"another.job"}},"CANONICAL_JOB_IDENTITY_MISMATCH"],
  [{haeJob:{...ccJob,result_json:JSON.stringify({capability:ccRole.job_type,external_write:false,role_contract:{...ccIdentity,plugin_version:"0.0.0"}})}},"RECEIPT_ROLE_CONTRACT_MISMATCH"],
  [{haeJob:{...ccJob,result_json:JSON.stringify({capability:ccRole.job_type,external_write:true,role_contract:ccIdentity})}},"RECEIPT_PERMISSION_OR_CAPABILITY_MISMATCH"],
  [{jobEvents:[]},"DURABLE_SUCCESS_EVENT_UNVERIFIED"],
  [{jobEvents:[...ccEvents,...ccEvents]},"DURABLE_SUCCESS_EVENT_UNVERIFIED"],
  [{roleContract:{...ccRole,permission_class:"EXTERNAL_WRITE"}},"ROLE_CONTRACT_NOT_ELIGIBLE"],
  [{haeJob:{...ccJob,result_json:"{}"}},"RECEIPT_ROLE_CONTRACT_MISMATCH"],
  [{workItem:{...ccWorkItem,linked_task_id:null}},"OWNER_WORK_ITEM_UNVERIFIED"],
  [{workItem:{...ccWorkItem,plugin_route_json:JSON.stringify({
    ...JSON.parse(ccWorkItem.plugin_route_json),
    helpers:[{role_id:"hermes-qa-evidence-auditor",plugin_version:"0.0.0"}],
  })}},"HELPER_ROUTE_VERSION_DRIFT"],
];
for (const [patch,reason] of ccDenials) {
  assert.equal((await inspectCc(patch)).reason,reason,reason);
}
console.log("HAE Command Center receipt guard PASS: synthetic source-only match + "+ccDenials.length+" denials");
