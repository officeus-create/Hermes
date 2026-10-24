import assert from "node:assert/strict";
import {
  ROLE_CONTRACTS,
  ROLE_CONTRACT_JOB_TYPES,
  roleContractForJobType,
  roleContractSha256,
  runRoleContractPrimitive,
  stableRoleContractJson,
  validateRoleContractInput,
} from "../workers/automation-engine/src/role-contracts.mjs";

assert.equal(ROLE_CONTRACTS.length, 3, "First free-first slice must expose exactly three plugin-owned domain contracts");
assert.deepEqual(
  [...ROLE_CONTRACT_JOB_TYPES].sort(),
  ["logistics.source.freshness.audit", "marketing.content.dedupe.audit", "search.snapshot.evaluate"].sort(),
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
  assert.equal(contract.semantic_required, false, `${contract.job_type} must not need AI in the first acceptance slice`);
  assert.equal(contract.free_ai_policy, "not_required");
  const sha = await roleContractSha256(contract);
  assert.match(sha, /^[0-9a-f]{64}$/);
  assert.equal(sha, await roleContractSha256(JSON.parse(stableRoleContractJson(contract))), "Contract digest must be canonical/deterministic");
  assert.equal(roleContractForJobType(contract.job_type)?.contract_version, contract.contract_version);
}

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

console.log("HAE plugin role contracts PASS: 3 zero-model domain contracts");
