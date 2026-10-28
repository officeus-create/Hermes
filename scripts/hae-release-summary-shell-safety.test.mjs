import fs from "node:fs";
import assert from "node:assert/strict";

const workflowPath = ".github/workflows/automation-engine-release.yml";
const workflow = fs.readFileSync(workflowPath, "utf8");
const BT = String.fromCharCode(96);
const BS = "\\";
const start = workflow.indexOf("      - name: Publish dry-run evidence summary");
assert.notEqual(start, -1, "dry-run summary step missing");
const next = workflow.indexOf("\n      - name:", start + 10);
const block = workflow.slice(start, next === -1 ? workflow.length : next);

const expected = [
  'echo "- Exact main: ' + BS + BT + '$TARGET_SHA' + BS + BT + '"',
  'echo "- Queue canary slot: ' + BS + BT + '$CANARY_SLOT' + BS + BT + '"',
  'echo "- D1 readback: ' + BS + BT + '$CANARY_STATUS' + BS + BT + '"',
];
for (const expectedLine of expected) {
  assert.ok(block.includes(expectedLine), "escaped Markdown summary line missing: " + expectedLine);
}

const echoLines = block.split("\n").filter((line) => line.trimStart().startsWith('echo "'));
for (const line of echoLines) {
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === BT) {
      assert.equal(line[i - 1], BS, "unescaped backtick in bash echo would execute command substitution: " + line.trim());
    }
  }
}

assert.ok(block.includes('>> "$GITHUB_STEP_SUMMARY"'), "summary output target changed unexpectedly");
console.log(JSON.stringify({ status: "PASS", checked_echo_lines: echoLines.length }, null, 2));
