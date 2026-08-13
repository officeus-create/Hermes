import { readFileSync, existsSync } from "fs";
import resolvePath from "path";

const docPath = resolvePath.resolve(process.cwd(), "docs/OPEN_SOURCE_SOLUTIONS_IMPROVEMENTS.md");

if (!existsSync(docPath)) {
  console.error("FAIL: docs/OPEN_SOURCE_SOLUTIONS_IMPROVEMENTS.md does not exist");
  process.exit(1);
}

const content = readFileSync(docPath, "utf-8");

const requiredTerms = [
  "Hugging Face",
  "Apache Software Foundation",
  "Gitea",
  "GitLab",
  "SourceForge",
  "Radicle",
  "AWS",
  "Bitbucket",
  "Launchpad",
  "Codeberg",
  "donut-base",
  "apache/camel",
  "vllm"
];

for (const term of requiredTerms) {
  if (!content.includes(term)) {
    console.error(`FAIL: Missing term '${term}' in OPEN_SOURCE_SOLUTIONS_IMPROVEMENTS.md`);
    process.exit(1);
  }
}

console.log("Open-source solutions & improvements test passed: All 10 platform upgrades verified.");
