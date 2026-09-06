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
const emailWorkerProduction = JSON.parse(read("workers/lead-email/wrangler.production.jsonc"));
assert.equal(emailWorkerExample.name, "hermes-lead-email");
assert.equal(emailWorkerExample.main, "src/entry.mjs");
assert.equal(emailWorkerProduction.name, "hermes-lead-email");
assert.equal(emailWorkerProduction.main, "src/entry.mjs");
assert.equal(emailWorkerExample.workers_dev, false);
assert.equal(emailWorkerExample.preview_urls, false);
assert.equal("routes" in emailWorkerExample, false, "The private email Worker must not gain a public HTTP route by default.");
assert.equal("routes" in emailWorkerProduction, false, "The private email Worker must not gain a public HTTP route by default.");

const emailWorkerEntry = read("workers/lead-email/src/entry.mjs");
assert.match(emailWorkerEntry, /import leadEmailWorker from "\.\/index\.mjs"/);
assert.match(emailWorkerEntry, /import \{ handleLoadBoardInboundEmail \} from "\.\/load-board-inbound\.mjs"/);
assert.match(emailWorkerEntry, /fetch\(request, env, ctx\)/);
assert.match(emailWorkerEntry, /async email\(message, env, ctx\)/);
assert.equal(exists("workers/lead-email/src/index.mjs"), true, "Existing outbound lead-email implementation must remain present.");

const productionWorkflow = read(".github/workflows/cloudflare-pages-production-v2.yml");
assert.match(
  productionWorkflow,
  /pages deploy dist --project-name=hermes --branch=main/,
  "The controlled production workflow must preserve the reviewed Wrangler Pages deploy path when scoped credentials are available.",
);
assert.match(
  productionWorkflow,
  /checks:\s*read/,
  "The release verifier needs read-only check access to validate the native Cloudflare exact-SHA deployment fallback.",
);
assert.match(
  productionWorkflow,
  /run\.name === "Cloudflare Pages" && run\.app\?\.slug === "cloudflare-workers-and-pages"/,
  "The fallback must accept only the official Cloudflare Pages Git integration check.",
);
assert.match(
  productionWorkflow,
  /commits\/\$\{sha\}\/check-runs\?per_page=100/,
  "The native Pages fallback must be bound to the exact approved commit SHA.",
);
assert.match(
  productionWorkflow,
  /if: steps\.credentials\.outputs\.available != 'true'/,
  "The native Cloudflare path must activate only when the optional Wrangler credential path is unavailable.",
);
assert.match(
  productionWorkflow,
  /https:\/\/hermeslogisticsus\.com\/paths\/academy\//,
  "Production parity must read the public Academy owner back from the real domain.",
);
for (const marker of [
  "Build practical skills across five Hermes Academy tracks.",
  "U.S. Logistics Operations",
  "IT & AI",
  "Sales",
  "COO / Operations",
]) {
  assert.ok(productionWorkflow.includes(marker), `WEB10 Academy production marker is missing from release verification: ${marker}`);
}
for (const retiredMarker of ["2 public programs", "Two public programs", "currently presents two public program paths"]) {
  assert.ok(productionWorkflow.includes(retiredMarker), `Retired Academy marker must remain explicitly forbidden in production verification: ${retiredMarker}`);
}

const leadEmailWorkflow = read(LEAD_EMAIL_DEPLOY_WORKFLOW);
assert.match(leadEmailWorkflow, /branches:\s*\n\s*- main/);
assert.match(leadEmailWorkflow, /workers\/lead-email\/\*\*/);
assert.match(leadEmailWorkflow, /node scripts\/load-board-intake-api-contract\.test\.mjs/);
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

console.log("Cloudflare deployment ownership contract passed: Pages has exact-SHA Wrangler/native-Git release verification plus one composed hermes-lead-email Worker owner.");
