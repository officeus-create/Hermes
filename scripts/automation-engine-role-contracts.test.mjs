import assert from "node:assert/strict";
import {
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

assert.equal(ROLE_CONTRACTS.length, 13, "Runtime must expose twelve deterministic contracts plus one free-only semantic contract");
assert.deepEqual(
  [...ROLE_CONTRACT_JOB_TYPES].sort(),
  [
    "academy.english.practice.build",
    "ai.gateway.readiness.audit",
    "dispatch.daily.closeout.audit",
    "growth.error.closure.audit",
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
    assert.equal(contract.job_type, "search.defect.prioritize");
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
assert.equal(ROLE_CONTRACTS.filter((contract) => !contract.semantic_required).length, 12);
assert.equal(ROLE_CONTRACTS.filter((contract) => contract.semantic_required).length, 1);

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

console.log("HAE plugin role contracts PASS: 12 zero-model + 1 free-only semantic contract");
