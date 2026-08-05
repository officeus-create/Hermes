import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = [
  "src/components/TechnologySolutionMockups.astro",
  "src/components/TechnologyInteractivePrototypes.astro",
  "public/demos/crm-validation/index.html",
  "public/demos/crm-validation/dashboard.json",
  "dist/paths/technology/index.html",
  "dist/demos/crm-validation/index.html",
  "dist/demos/crm-validation/dashboard.json",
];

const retiredValues = ["1482019", "4120938", "923184"];
const realisticAuthorityPattern = /\b(?:MC|USDOT|DOT)[\s:#-]*\d{6,8}\b/gi;

for (const relativePath of files) {
  const content = await readFile(path.join(root, relativePath), "utf8");
  for (const retired of retiredValues) {
    assert.ok(!content.includes(retired), `${relativePath} still contains retired authority value ${retired}`);
  }
  assert.doesNotMatch(
    content,
    realisticAuthorityPattern,
    `${relativePath} must not contain a realistic numeric MC/USDOT identifier in a public demo`,
  );
}

const dashboard = JSON.parse(
  await readFile(path.join(root, "public/demos/crm-validation/dashboard.json"), "utf8"),
);
assert.equal(dashboard.total_records, 3);
assert.equal(dashboard.ready_for_review, 1);
assert.equal(dashboard.needs_review, 2);
assert.equal(dashboard.crm_write_performed, false);
assert.equal(dashboard.records[0].mc, "SAMPLE-MC-A");
assert.equal(dashboard.records[1].dot, "SAMPLE-DOT-B");
assert.ok(dashboard.records.every((record) => record.approval_status === "not_approved"));
assert.ok(dashboard.records.every((record) => record.crm_write_performed === false));

const builtTechnology = await readFile(path.join(root, "dist/paths/technology/index.html"), "utf8");
assert.ok(builtTechnology.includes("SAMPLE-MC"));
assert.ok(builtTechnology.includes("SAMPLE-DOT"));

const builtDashboard = await readFile(path.join(root, "dist/demos/crm-validation/index.html"), "utf8");
assert.ok(builtDashboard.includes("Authority identifiers are unmistakably synthetic placeholders."));
assert.ok(builtDashboard.includes("Synthetic authority placeholders only"));

console.log("Public demo authority identifier privacy contract passed.");
