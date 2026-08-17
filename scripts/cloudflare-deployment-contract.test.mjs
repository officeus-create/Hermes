import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const LEAD_EMAIL_DEPLOY_WORKFLOW = path.join(".github", "workflows", "lead-email-worker-production.yml");

function listFiles(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(relative) : [relative];
  });
}

// A root Worker configuration would let a dashboard or CLI integration infer a
// generic Worker deployment for the whole website. Keep the website Pages-only.
assert.equal(exists("wrangler.jsonc"), false, "Active root wrangler.jsonc must not be committed.");
assert.equal(exists("wrangler.toml"), false, "Active root wrangler.toml must not be committed.");

const pagesExample = JSON.parse(read("wrangler.jsonc.example"));
assert.equal(pagesExample.name, "hermes");
assert.equal(pagesExample.pages_build_output_dir, "dist");
assert.equal("main" in pagesExample, false, "The root example must remain Pages-oriented, not a Worker entrypoint.");

const emailWorkerExample = JSON.parse(read("workers/lead-email/wrangler.jsonc.example"));
assert.equal(emailWorkerExample.name, "hermes-lead-email");
assert.equal(emailWorkerExample.main, "src/index.mjs");
assert.equal(emailWorkerExample.workers_dev, false);
assert.equal(emailWorkerExample.preview_urls, false);
assert.equal("routes" in emailWorkerExample, false, "The private email Worker must not gain a public route by default.");

const productionWorkflow = read(".github/workflows/cloudflare-pages-production-v2.yml");
assert.match(
  productionWorkflow,
  /pages deploy dist --project-name=hermes --branch=main/,
  "The controlled production workflow must deploy the reviewed dist output to Pages project hermes.",
);

const leadEmailWorkflow = read(LEAD_EMAIL_DEPLOY_WORKFLOW);
assert.match(leadEmailWorkflow, /branches:\s*\n\s*- main/);
assert.match(leadEmailWorkflow, /workers\/lead-email\/\*\*/);
assert.match(
  leadEmailWorkflow,
  /^\s*command:\s*deploy --config workers\/lead-email\/wrangler\.production\.jsonc --keep-vars\s*$/im,
  "The only repository-controlled Worker deploy must remain pinned to the hermes-lead-email production config.",
);
assert.doesNotMatch(leadEmailWorkflow, /\bwrangler\.toml\b|--config\s+wrangler\.jsonc\b/i);

for (const workflowPath of listFiles(".github/workflows").filter((file) => /\.ya?ml$/i.test(file))) {
  if (workflowPath === LEAD_EMAIL_DEPLOY_WORKFLOW) continue;
  const workflow = read(workflowPath);
  assert.doesNotMatch(
    workflow,
    /\b(?:npx\s+)?wrangler\s+deploy\b/i,
    `${workflowPath} introduces a generic Worker deployment. The reviewed service-specific owner is ${LEAD_EMAIL_DEPLOY_WORKFLOW}.`,
  );
  assert.doesNotMatch(
    workflow,
    /^\s*command:\s*deploy(?:\s|$)/im,
    `${workflowPath} invokes a generic wrangler-action deploy command. Pages releases must use pages deploy.`,
  );
}

// Package scripts are another deployment entry point. A generic root Worker
// deploy here could bypass the workflow-only scan above and later be invoked by
// a dashboard, CI job, or operator. Keep the website release path Pages-only.
const packageJson = JSON.parse(read("package.json"));
for (const [scriptName, command] of Object.entries(packageJson.scripts ?? {})) {
  assert.doesNotMatch(
    String(command),
    /\b(?:npx\s+)?wrangler\s+deploy\b/i,
    `package.json script ${scriptName} introduces a generic root Worker deployment.`,
  );
}

console.log("Cloudflare deployment ownership contract passed: Pages plus one pinned hermes-lead-email Worker owner.");
