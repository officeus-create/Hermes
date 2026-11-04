import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CHATGPT_TASK_MIGRATIONS,
  taskMigrationSnapshot,
} from "../workers/automation-engine/src/schedule-migrations.mjs";
import {
  runZeroTokenPluginTask,
  validateZeroTokenPluginTaskInput,
  ZERO_TOKEN_PLUGIN_TASK_CONTRACTS,
} from "../workers/automation-engine/src/zero-token-plugin-tasks.mjs";
import { pluginRuntimeVersion } from "../workers/automation-engine/src/plugin-runtime-registry.mjs";

const hash = "a".repeat(64);
const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const fixtures = {
  "dispatch.daily.closeout.audit": { business_date: "2026-10-24", coverage_complete: false, orders: [
    { order_id: "O-1", value_cents: 10000, commission_cents: 700, pickup_at: "2026-10-24T10:00:00Z", delivery_at: null, cancelled: false },
    { order_id: "O-2", value_cents: 5000, commission_cents: 350, pickup_at: null, delivery_at: null, cancelled: true },
  ] },
  "knowledge.evidence.audit": { observed_at: "2026-10-24T18:00:00Z", evidence: [
    { evidence_id: "E-1", fingerprint: hash, source_ref: "gmail-metadata://thread/E-1", status: "VERIFIED", observed_at: "2026-10-24T10:00:00Z" },
    { evidence_id: "E-2", fingerprint: hash, source_ref: "drive://evidence/E-2", status: "HOLD", observed_at: "2026-10-24T11:00:00Z" },
  ] },
  "technology.release.radar": { observed_at: "2026-10-24T18:00:00Z", components: [
    { component_id: "astro", current_version: "7.4.1", candidate_version: "7.4.2", security_update: true, source_ref: "https://github.com/withastro/astro/releases/tag/astro%407.4.2" },
  ] },
  "ai.gateway.readiness.audit": { binding_ready: true, gateway_id_present: true, free_provider_ready: true, paid_fallback_enabled: false, budget_usd: 0 },
  "growth.error.closure.audit": { observed_at: "2026-10-24T18:00:00Z", errors: [
    { error_id: "ERR-1", status: "FIXED", owner: "technology", updated_at: "2026-10-24T10:00:00Z", evidence_ref: "github://issue/1", production_verified: true },
    { error_id: "ERR-2", status: "OPEN", owner: "", updated_at: "2026-10-01T10:00:00Z", evidence_ref: null, production_verified: false },
  ] },
  "market.car-hauling.snapshot.evaluate": { current: { observed_at: "2026-10-24T18:00:00Z", dealer_demand_index: 52, shipper_demand_index: null, carrier_availability_index: 61, rate_cents_per_mile: 210 }, previous: { observed_at: "2026-10-17T18:00:00Z", dealer_demand_index: 50, shipper_demand_index: null, carrier_availability_index: 60, rate_cents_per_mile: 205 } },
  "marketing.mentions.audit": { observed_at: "2026-10-24T18:00:00Z", mentions: [
    { mention_id: "M-1", fingerprint: hash, source_url: "https://example.com/hermes", classification: "UNKNOWN", first_seen_at: "2026-10-24T17:00:00Z" },
  ] },
  "report.catalog.weekly.build": {
    observed_at:"2026-11-06T10:00:00Z", mode:"WEEKLY_REPORT", period_start:"2026-10-31", period_end:"2026-11-06",
    catalog:{catalog_profile_count:12,catalog_opt_in_count:10,verified_public_count:4,self_submitted_count:6,hermes_connect_company_count:12,open_catalog_work_count:2,seo_duplicate_risk_count:null,seo_duplicate_risk_state:"UNKNOWN",blockers:["SEO_DUPLICATE_AUDIT_NOT_CONNECTED"],next_action:"Review self-submitted Catalog companies.",done_criteria:"DONE when reviewed companies have explicit verified or held state."}
  },
  "report.hr-tech.weekly.build": {
    observed_at:"2026-11-02T08:00:00Z",period_start:"2026-10-27",period_end:"2026-11-02",
    source_snapshots:[
      {source_id:"linkedin-hiring-release",url:"https://business.linkedin.com/hire/product-update/hire-release",title:"LinkedIn Hiring Release",category:"CANDIDATE_SOURCE",published_at:null,content_fingerprint:hash,changed:false,source_state:"CONNECTED"},
      {source_id:"greenhouse-product-features",url:"https://www.greenhouse.com/product-features",title:"Greenhouse product features",category:"AI_INTERVIEW",published_at:null,content_fingerprint:"b".repeat(64),changed:true,source_state:"CHANGED"}
    ]
  },
  "academy.english.practice.build": { lesson_date: "2026-10-24", track: "LOGISTICS" },
  "hae.self.improvement.audit": {
    observed_at: "2026-10-25T00:30:00Z",
    coverage_complete: true,
    findings: [
      {
        finding_id: "self-test-gap",
        source_ref: "github://officeus-create/Hermes/issues/2062",
        category: "TEST_GAP",
        severity: "P1",
        status: "OPEN",
        artifact_key: "scripts/automation-engine-self-improvement.test.mjs",
        verified: true,
        writer_active: false,
        writer_state_verified: true,
        observed_at: "2026-10-25T00:20:00Z"
      }
    ]
  },
  "hae.self.repair.packet": {
    work_id: "HAE-SELF:self-test-gap",
    finding_id: "self-test-gap",
    artifact_key: "scripts/automation-engine-self-improvement.test.mjs"
  },
  "hae.self.release.verify": {
    work_id: "HAE-SELF:self-test-gap",
    artifact_key: "scripts/automation-engine-self-improvement.test.mjs",
    repair_job_id: "job:repair:1"
  },
};

assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.length, 13);
for (const contract of ZERO_TOKEN_PLUGIN_TASK_CONTRACTS) {
  assert.equal(contract.semantic_required, false);
  assert.equal(contract.permission_class, "READ_ONLY");
  assert.equal(contract.runtime_config.max_cost_usd, 0);
  if (!["ai.gateway.readiness.audit","academy.english.practice.build","hae.self.improvement.audit","report.catalog.weekly.build","report.hr-tech.weekly.build"].includes(contract.job_type)) {
    assert.equal(contract.runtime_config.scheduled, false, "External-source tasks must wait for their authorized plugin adapter");
  }
  validateZeroTokenPluginTaskInput(contract.job_type, fixtures[contract.job_type]);
  const result = runZeroTokenPluginTask(contract.job_type, fixtures[contract.job_type]);
  assert.equal(result.cost_usd, 0, `${contract.job_type} must emit a zero-cost receipt`);
}

assert.equal(runZeroTokenPluginTask("dispatch.daily.closeout.audit", fixtures["dispatch.daily.closeout.audit"]).confirmed_bank_revenue_cents, null);
assert.equal(runZeroTokenPluginTask("technology.release.radar", fixtures["technology.release.radar"]).security_candidate_count, 1);
assert.equal(runZeroTokenPluginTask("ai.gateway.readiness.audit", fixtures["ai.gateway.readiness.audit"]).readiness, "READY");
assert.equal(runZeroTokenPluginTask("growth.error.closure.audit", fixtures["growth.error.closure.audit"]).closure_candidate_count, 1);
assert.equal(runZeroTokenPluginTask("market.car-hauling.snapshot.evaluate", fixtures["market.car-hauling.snapshot.evaluate"]).unknown_metric_count, 1);
assert.equal(runZeroTokenPluginTask("marketing.mentions.audit", fixtures["marketing.mentions.audit"]).raw_page_content_stored, false);
const catalogReport=runZeroTokenPluginTask("report.catalog.weekly.build",fixtures["report.catalog.weekly.build"]);
assert.equal(catalogReport.delivery_surface,"HERMES_COMMAND_CENTER_ONLY");
assert.equal(catalogReport.external_send,false);
assert.equal(catalogReport.ai_tokens_used,0);
assert.equal(catalogReport.cost_usd,0);
assert.equal(catalogReport.planned.find((item)=>item.key==="seo_duplicate_risk").state,"UNKNOWN");
const hrReport=runZeroTokenPluginTask("report.hr-tech.weekly.build",fixtures["report.hr-tech.weekly.build"]);
assert.equal(hrReport.delivery_surface,"HERMES_COMMAND_CENTER_ONLY");
assert.equal(hrReport.external_send,false);
assert.equal(hrReport.ai_tokens_used,0);
assert.equal(hrReport.cost_usd,0);
assert.equal(hrReport.accepted_change_count,1);
assert.equal(hrReport.source_snapshots[0].changed,false,"first/baseline source must not be promoted to a change");
assert.equal(runZeroTokenPluginTask("hae.self.improvement.audit", fixtures["hae.self.improvement.audit"]).next_action, "HOLD_REPAIR");
assert.equal(runZeroTokenPluginTask("hae.self.repair.packet", fixtures["hae.self.repair.packet"]).repair_state, "HOLD_REPAIR");
assert.equal(runZeroTokenPluginTask("hae.self.repair.packet", fixtures["hae.self.repair.packet"]).source_change_performed, false);
assert.equal(runZeroTokenPluginTask("hae.self.release.verify", fixtures["hae.self.release.verify"]).release_state, "BLOCKED");
assert.equal(runZeroTokenPluginTask("hae.self.release.verify", fixtures["hae.self.release.verify"]).blocker, "AUTHENTICATED_RELEASE_EVIDENCE_UNAVAILABLE");
assert.equal(runZeroTokenPluginTask("hae.self.release.verify", fixtures["hae.self.release.verify"]).next_lane, "SELF_IMPROVEMENT");
assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.find((item) => item.job_type === "hae.self.improvement.audit")?.runtime_config.cadence_hours, 6);
assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.find((item) => item.job_type === "knowledge.evidence.audit")?.role_id, "hermes-knowledge-curator");
assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.find((item) => item.job_type === "knowledge.evidence.audit")?.plugin_version, pluginRuntimeVersion("hermes-knowledge-curator"));
assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.find((item) => item.job_type === "technology.release.radar")?.plugin_version, pluginRuntimeVersion("hermes-automatic-engineer"));
assert.equal(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.find((item) => item.job_type === "academy.english.practice.build")?.plugin_version, pluginRuntimeVersion("hermes-academy"));

assert.throws(() => validateZeroTokenPluginTaskInput("dispatch.daily.closeout.audit", { ...fixtures["dispatch.daily.closeout.audit"], coverage_complete: "yes" }), /dispatch_coverage_complete_required/);
assert.throws(() => validateZeroTokenPluginTaskInput("knowledge.evidence.audit", { observed_at: "2026-10-24T18:00:00Z", evidence: [{ evidence_id: "E", fingerprint: hash, source_ref: "gmail://raw/body", status: "VERIFIED", observed_at: "2026-10-24T17:00:00Z" }] }), /knowledge_source_ref_invalid/);
assert.throws(() => validateZeroTokenPluginTaskInput("marketing.mentions.audit", { observed_at: "2026-10-24T18:00:00Z", mentions: [{ mention_id: "M", fingerprint: hash, source_url: "javascript:alert(1)", classification: "SOCIAL", first_seen_at: "2026-10-24T17:00:00Z" }] }), /mention_invalid/);
assert.equal(new Set(CHATGPT_TASK_MIGRATIONS.map((item) => item.task_key)).size, CHATGPT_TASK_MIGRATIONS.length);
const migration = taskMigrationSnapshot(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.map((item) => item.job_type).concat([
  "search.snapshot.evaluate",
  "work.portfolio.reconcile",
  "marketing.content.dedupe.audit",
  "audit.github.snapshot",
  "audit.cloudflare.runtime",
  "audit.drive.truth",
  "audit.website.journey",
]));
assert.equal(migration.recovered_task_count, 14);
assert.equal(migration.unsupported_capability_count, 0);
assert.equal(migration.normal_loop_requires_chatgpt_task, false);
assert.equal(migration.maximum_automatic_ai_cost_usd, 0);
assert.match(worker, /contract\.job_type === "ai\.gateway\.readiness\.audit"/);
assert.match(worker, /contract\.job_type === "academy\.english\.practice\.build"/);
assert.match(worker, /contract\.job_type === "hae\.self\.improvement\.audit"/);
assert.match(worker, /buildScheduledHaeSelfImprovementPayload/);
assert.match(worker, /ensureHaeSelfRepairFollowup/);
assert.match(worker, /writer_state_verified: false/);
assert.match(worker, /pluginRuntimeRegistryEvidenceStatus/);
assert.doesNotMatch(worker, /registry\.get\(contract\.role_id\)/);
assert.match(worker, /existingHaeSelfRepairFollowup/);
assert.match(worker, /frozen_contract_reused: true/);
assert.match(worker, /hae_self_repair_idempotency_conflict/);
assert.match(worker, /job_type: "hae\.self\.repair\.packet"/);
assert.match(worker, /const idempotencyKey = `hae:followup:self\.repair:\${audit\.next_work_id}`/);
assert.match(worker, /idempotency_key: idempotencyKey/);
assert.match(worker, /!contract\.semantic_required && roleContractScheduleEligible/);
assert.match(worker, /url\.pathname === "\/v1\/schedule-migrations"/);

assert.ok(worker.includes("Europe/Kyiv"),"Command Center reports must use Kyiv local scheduling");
assert.ok(worker.includes('cronExpression==="0 * * * *"'),"exact-hour report wake must be isolated from the existing HAE cron");
assert.ok(worker.includes('hae:command-center-report:${job.key}:${localDate}'),"weekly report runs need local-date idempotency");
assert.ok(worker.includes('report.hr-tech.weekly.build'));
assert.ok(worker.includes('report.catalog.weekly.build'));
console.log("HAE zero-token plugin task migration PASS: 14 recovered schedules, 13 deterministic plugin capabilities, no ChatGPT runtime dependency");
