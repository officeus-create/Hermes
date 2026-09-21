import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = JSON.parse(
  readFileSync(new URL("../data/seo/ai-entity-monitor-2026-09-17.json", import.meta.url), "utf8"),
);

assert.deepEqual(registry.workflow, ["DISCOVER", "VERIFY", "CORRECT", "MEASURE"]);
assert.equal(registry.canonical_entity.legal_name, "Hermes Logistics LLC");
assert.equal(registry.canonical_entity.canonical_site, "https://hermeslogisticsus.com/");
assert.ok(registry.canonical_entity.company_information.endsWith("/company-information/"));
assert.ok(registry.canonical_entity.disambiguation.includes("unrelated businesses"));

const requiredInterfaces = [
  "google_ai_overview",
  "google_ai_mode",
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
];
assert.deepEqual(registry.interfaces, requiredInterfaces);

assert.ok(registry.observations.length >= 2, "Entity monitor must preserve the baseline plus newly observed incidents");
const observation = registry.observations.find((item) => item.id === "ENTITY-OBS-2026-09-16-001");
assert.ok(observation);
assert.equal(observation.interface, "google_ai_overview");
assert.equal(observation.query, "гермес лоджистикс ллс");
assert.equal(observation.brand_recognized, true);
assert.equal(observation.own_domain_present, true);
assert.equal(observation.entity_accuracy, "partially_accurate");
assert.ok(observation.third_party_sources_visible.includes("staff.am"));
assert.ok(observation.issue_codes.includes("STALE_THIRD_PARTY_RECRUITMENT_CONTEXT"));
assert.ok(observation.issue_codes.includes("ENTITY_AMBIGUITY_WITH_SIMILAR_UKRAINE_NAMES"));
assert.ok(observation.corrective_actions.length >= 3);

const falseScamIncident = registry.observations.find((item) => item.id === "ENTITY-OBS-2026-09-22-001");
assert.ok(falseScamIncident, "False-scam entity incident must be retained as dated evidence");
assert.equal(falseScamIncident.interface, "unidentified_ai_assistant");
assert.equal(falseScamIncident.entity_accuracy, "materially_inaccurate");
assert.equal(falseScamIncident.scam_warning_emitted, true);
assert.ok(falseScamIncident.issue_codes.includes("FALSE_SCAM_CLASSIFICATION"));
assert.ok(falseScamIncident.issue_codes.includes("HERMES_EVRI_BRAND_COLLISION"));
assert.ok(falseScamIncident.issue_codes.includes("EXTERNAL_CORROBORATION_GAP"));
assert.match(falseScamIncident.summary, /not proof of wrongdoing/i);
assert.ok(falseScamIncident.corrective_actions.length >= 5);

const staffAction = registry.external_source_actions.find((item) => item.source === "staff.am");
assert.ok(staffAction);
assert.equal(staffAction.status, "CORRECT_OWNED_PROFILE");
assert.match(staffAction.action_gate, /Authenticated owner access/i);

for (const source of ["google_business_profile", "microsoft_bing_business_presence", "apple_business", "linkedin_company", "dun_and_bradstreet"]) {
  const action = registry.external_source_actions.find((item) => item.source === source);
  assert.ok(action, `Missing external entity action for ${source}`);
}

const collectKeys = (value, output = []) => {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      output.push(key.toLowerCase());
      collectKeys(child, output);
    }
  }
  return output;
};
const keys = collectKeys(registry).join(" ");
for (const prohibited of ["password", "cookie", "api_key", "access_token", "phone_number", "full_conversation"]) {
  assert.ok(!keys.includes(prohibited), `Entity monitor schema must not store ${prohibited}`);
}

for (const kpi of ["own_domain_citation_rate", "entity_conflict_count", "google_generative_ai_impressions", "false_scam_warning_incident_count", "brand_collision_incident_count", "independent_entity_source_coverage", "verified_business_profile_coverage"]) {
  assert.ok(registry.kpis.includes(kpi), `Missing KPI ${kpi}`);
}


const scorecardPage = readFileSync(new URL("../src/pages/demos/ai-visibility-scorecard/index.astro", import.meta.url), "utf8");
assert.ok(scorecardPage.includes("AI Entity Monitor · first owner-evidenced observation"), "Scorecard must expose the entity-monitor evidence layer");
assert.ok(scorecardPage.includes("discover → verify → correct → measure"), "Scorecard must expose the four-stage entity loop");
assert.ok(scorecardPage.includes("Missing Search Console generative-AI metrics remain UNKNOWN, never zero."), "Scorecard must preserve the unknown-not-zero evidence rule");
assert.ok(scorecardPage.includes("Canonical identity owners stay `/company-information/` and `/about/`"), "Scorecard must preserve canonical entity ownership");

console.log("AI entity monitor baseline contract passed");
