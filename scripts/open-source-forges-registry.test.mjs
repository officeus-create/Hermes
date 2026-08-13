import { readFileSync, existsSync } from "fs";
import resolvePath from "path";

const registryPath = resolvePath.resolve(process.cwd(), "docs/OPEN_SOURCE_FORGES_REGISTRY.md");

if (!existsSync(registryPath)) {
  console.error("FAIL: docs/OPEN_SOURCE_FORGES_REGISTRY.md does not exist");
  process.exit(1);
}

const content = readFileSync(registryPath, "utf-8");

const requiredPlatforms = [
  "GitLab",
  "Bitbucket",
  "Codeberg",
  "Gitea",
  "Hugging Face",
  "SourceForge",
  "Launchpad",
  "Radicle",
  "Cloud Source Repositories",
  "Apache Software Foundation"
];

for (const platform of requiredPlatforms) {
  if (!content.includes(platform)) {
    console.error(`FAIL: Missing platform '${platform}' in OPEN_SOURCE_FORGES_REGISTRY.md`);
    process.exit(1);
  }
}

console.log("Open-source forges registry test passed: All 10 GitHub alternatives verified.");
