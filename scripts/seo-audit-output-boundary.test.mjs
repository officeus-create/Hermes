import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auditSource = await readFile(new URL("./audit-seo-production.mjs", import.meta.url), "utf8");

for (const forbidden of [
  "/Users/progressopro/",
  "AI_WORKSPACE/15_Active_Tasks",
  "AI_WORKSPACE/13_AI_Handoffs/To_Codex",
]) {
  assert.equal(
    auditSource.includes(forbidden),
    false,
    `SEO audit must not depend on retired workstation path: ${forbidden}`,
  );
}

assert.ok(
  auditSource.includes("HERMES_SEO_AUDIT_OUTPUT_DIR"),
  "SEO audit must support an explicit portable output directory.",
);
assert.ok(
  auditSource.includes("path.join(root, 'artifacts', 'seo')"),
  "SEO audit must use the gitignored repository artifacts directory as its safe default.",
);
assert.ok(
  auditSource.includes("SEO_TECHNICAL_CRAWL_LATEST.csv"),
  "SEO audit must write one stable latest artifact instead of dated workstation copies.",
);

console.log("SEO audit output boundary contract passed.");
