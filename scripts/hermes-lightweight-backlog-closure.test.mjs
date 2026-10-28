import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const registryPath = path.join(root, "src/data/hermes-lightweight-backlog-closure-20261028.json");
const docPath = path.join(root, "docs/HERMES_LIGHTWEIGHT_BACKLOG_CLOSURE_2026-10-28.md");

assert.ok(fs.existsSync(registryPath), "lightweight closure registry missing");
assert.ok(fs.existsSync(docPath), "lightweight closure document missing");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const doc = fs.readFileSync(docPath, "utf8");

assert.equal(registry.schema_version, "2.0.0");
assert.equal(registry.as_of, "2026-10-28");
assert.equal(registry.canonical_runtime, "HAE #2033");
assert.equal(registry.canonical_coordination, "One Brain");
assert.equal(registry.no_live_write, true);
assert.equal(registry.no_second_control_plane, true);
assert.equal(registry.no_paid_fallback, true);
assert.equal(registry.existing_closures, 30);
assert.equal(registry.additional_closures, 200);
assert.equal(registry.total_closures, 230);

const expectedIds = Array.from({ length: 230 }, (_, i) => `L${String(i + 1).padStart(2, "0")}`);
const tasks = registry.tasks ?? [];
assert.equal(tasks.length, 230, "registry must contain exactly 230 closures (30 existing + 200 additional)");

const actualIds = tasks.map((task) => task.id);
assert.deepEqual(actualIds, expectedIds, "task IDs must be exactly L01..L230 in order");
assert.equal(new Set(actualIds).size, 230, "task IDs must be unique");
assert.equal(new Set(tasks.map((task) => task.implementation)).size, 230, "implementation summaries must be unique");

const allowedCategories = new Set(registry.allowed_categories ?? []);
assert.equal(allowedCategories.size, 16, "six original plus ten expansion categories are required");

const originalCategoryCounts = {
  automation_registry: 5,
  one_brain_plugins: 5,
  search_entity_registry: 5,
  content_lanes: 5,
  command_center_metrics: 5,
  ci_work_intake: 5,
};
const expansionCategories = [
  "analytics_privacy",
  "seo_owner_hygiene",
  "geo_evidence",
  "hermes_connect_ops",
  "repair_shop_contracts",
  "load_board_contracts",
  "carrier_contracts",
  "website_quality",
  "ai_handoff",
  "security_release"
];

for (const [category, expected] of Object.entries(originalCategoryCounts)) {
  assert.equal(tasks.filter((task) => task.category === category).length, expected, `${category}: original category count changed`);
}
for (const category of expansionCategories) {
  assert.equal(tasks.filter((task) => task.category === category).length, 20, `${category}: expansion category must contain 20 items`);
}

for (const task of tasks) {
  assert.equal(task.status, "IMPLEMENTED", `${task.id}: status must be IMPLEMENTED`);
  assert.ok(allowedCategories.has(task.category), `${task.id}: unknown category ${task.category}`);
  assert.ok(typeof task.owner === "string" && task.owner.trim(), `${task.id}: owner missing`);
  assert.ok(typeof task.source_window === "string" && task.source_window.includes("2026-"), `${task.id}: source window missing`);
  assert.ok(typeof task.implementation === "string" && task.implementation.length >= 20, `${task.id}: implementation summary too short`);
  assert.equal(task.no_live_write, true, `${task.id}: live write must remain disabled`);
  assert.ok(Array.isArray(task.evidence_files) && task.evidence_files.length >= 2, `${task.id}: evidence files missing`);

  for (const rel of task.evidence_files) {
    assert.ok(!path.isAbsolute(rel), `${task.id}: evidence path must be repository-relative`);
    assert.ok(!rel.includes(".."), `${task.id}: evidence path traversal forbidden`);
    assert.ok(fs.existsSync(path.join(root, rel)), `${task.id}: evidence file does not exist: ${rel}`);
  }

  const marker = `**${task.id} — IMPLEMENTED —`;
  assert.ok(doc.includes(marker), `${task.id}: human-readable closure marker missing`);
}

assert.match(doc, /Additional closures implemented in this expansion:\s*\*\*200\*\*/);
assert.match(doc, /Total machine-checked closures:\s*\*\*230\*\*/);
assert.match(doc, /no_live_write=true/);
assert.match(doc, /no_second_control_plane=true/);
assert.match(doc, /no_paid_fallback=true/);

console.log(JSON.stringify({
  status: "PASS",
  existing_closures: registry.existing_closures,
  additional_closures: registry.additional_closures,
  total_closures: tasks.length,
  categories: allowedCategories.size,
  expansion_categories: expansionCategories.length,
}, null, 2));
