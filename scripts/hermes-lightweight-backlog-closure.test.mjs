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

assert.equal(registry.schema_version, "1.0.0");
assert.equal(registry.as_of, "2026-10-28");
assert.equal(registry.canonical_runtime, "HAE #2033");
assert.equal(registry.canonical_coordination, "One Brain");
assert.equal(registry.no_live_write, true);
assert.equal(registry.no_second_control_plane, true);
assert.equal(registry.no_paid_fallback, true);

const expectedIds = Array.from({ length: 30 }, (_, i) => `L${String(i + 1).padStart(2, "0")}`);
const tasks = registry.tasks ?? [];
assert.equal(tasks.length, 30, "registry must contain exactly 30 lightweight closures");

const actualIds = tasks.map((task) => task.id);
assert.deepEqual(actualIds, expectedIds, "task IDs must be exactly L01..L30 in order");
assert.equal(new Set(actualIds).size, 30, "task IDs must be unique");

const allowedCategories = new Set(registry.allowed_categories ?? []);
assert.equal(allowedCategories.size, 6, "six closure categories are required");

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

  const marker = `**${task.id} — IMPLEMENTED`;
  assert.ok(doc.includes(marker), `${task.id}: human-readable closure marker missing`);
}

const categoryCounts = tasks.reduce((acc, task) => {
  acc[task.category] = (acc[task.category] ?? 0) + 1;
  return acc;
}, {});
for (const category of allowedCategories) {
  assert.equal(categoryCounts[category], 5, `${category}: expected exactly five lightweight closures`);
}

assert.match(doc, /not a new control plane/i);
assert.match(doc, /No merge, deploy, provider mutation/i);
assert.match(doc, /Plugins are knowledge packages/i);
assert.match(doc, /HAE #2033 remains the canonical persistent runtime/i);
assert.match(doc, /VIEW != SESSION != LEAD != QUALIFIED_LEAD != OPPORTUNITY != REVENUE/);
assert.match(doc, /personal-health plugin remains outside Hermes business ingestion/i);

console.log("HERMES_LIGHTWEIGHT_BACKLOG_CLOSURE PASS: 30/30 bounded tasks are registered, evidenced and fail-closed");
