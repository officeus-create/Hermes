import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/insights-content-pr.yml", import.meta.url), "utf8");

assert.match(
  workflow,
  /gh pr create --draft --base main --head "\$GITHUB_REF_NAME"/,
  "Insights automation must open a draft PR so validated content is not publication-ready without a human action",
);
assert.match(
  workflow,
  /authorized human must review the exact PR head, mark the draft ready, and merge it through GitHub/,
  "the draft must state the exact-head human approval receipt required for publication",
);
assert.doesNotMatch(
  workflow,
  /\bgh\s+pr\s+merge\b|--auto\b/,
  "Insights automation must never queue or perform a merge",
);

console.log("Insights human approval contract passed: draft-only PR, exact-head receipt, no automated merge.");
