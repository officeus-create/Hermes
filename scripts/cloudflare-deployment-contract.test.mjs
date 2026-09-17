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
assert.equal(pagesExample.compatibility_date, "2026-08-04", "Preview/default Pages compatibility baseline must stay on the reviewed date.");
assert.equal(pagesExample.vars?.LEAD_DELIVERY_MODE, "off", "Preview/default lead delivery must remain fail-closed.");
assert.deepEqual(Object.keys(pagesExample.vars ?? {}).sort(), ["ALLOWED_ORIGIN", "LEAD_DELIVERY_MODE"]);
assert.deepEqual((pagesExample.kv_namespaces ?? []).map((entry) => entry.binding), ["LEAD_LIMITS"]);
assert.equal("d1_databases" in pagesExample, false, "Preview/default Pages config must not bind Production D1.");
assert.equal("services" in pagesExample, false, "Preview/default Pages config must not bind the private production email service.");
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

const aiProjectState = JSON.parse(read("docs/ai-project-state.json"));
const cloudflareReleaseState = aiProjectState.recent_promotions?.cloudflare_release_wiring_pr_1063;
assert.equal(cloudflareReleaseState?.state, "MERGED_CODE_VERIFIED_PAGES_RELEASE_WORKING");
assert.doesNotMatch(
  JSON.stringify(aiProjectState),
  /CLOUDFLARE_API_TOKEN_MISSING_FROM_AUTHORIZED_PRODUCTION_OR_REPOSITORY_SECRET_SCOPE|BLOCKED_ONLY_SCOPED_CLOUDFLARE_API_TOKEN_THEN_BUILD_DEPLOY_AND_PUBLIC_READBACK|BLOCKED_SCOPED_CLOUDFLARE_DEPLOY_TOKEN_PLUS_REAL_EMAIL_RESET/,
  "Current project state must not revive superseded generic Cloudflare token blockers for Pages, #961, or #611.",
);
assert.match(
  aiProjectState.platform_and_owner_gates?.cloudflare_production_parity_961 ?? "",
  /BOUNDED_REPAIR_SHOP_ACCESS_PRODUCTION_D1_OPERATOR_PROOF/,
  "#961 must stay narrowed to the bounded production D1/operator proof.",
);
assert.match(
  aiProjectState.platform_and_owner_gates?.password_reset_email_611 ?? "",
  /ARBITRARY_RECIPIENT_OUTBOUND_TRANSACTIONAL_EMAIL_CAPABILITY/,
  "#611 must remain an outbound transactional-recipient capability gate, not a Worker deployment gate.",
);

const productionWorkflow = read(".github/workflows/cloudflare-pages-production-v2.yml");
for (const ignoredPath of [".github/**", "docs/**", "ai-collaboration/**", "tests/**", "README.md", "AGENTS.md", "CLAUDE.md"]) {
  assert.ok(productionWorkflow.includes(`- "${ignoredPath}"`), `Non-runtime path should not spend a production Pages build: ${ignoredPath}`);
}
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
  /node <<'NODE'\n\s*import fs from "node:fs";/,
  "The native exact-SHA verifier must run as unambiguous ESM because it uses top-level await on Node 22.",
);
assert.doesNotMatch(
  productionWorkflow,
  /node <<'NODE'\n\s*const fs = require\("node:fs"\);/,
  "The native verifier must not mix CommonJS require() with top-level await; Node 22 rejects that module format as ambiguous.",
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
assert.ok(
  productionWorkflow.includes('## Approved main is live and read back\\n\\nApproved'),
  "Successful release comments must keep newlines escaped inside the YAML run block.",
);
assert.ok(
  productionWorkflow.includes('## Approved-main production parity did not complete\\n\\nThe release workflow'),
  "Failure release comments must keep newlines escaped inside the YAML run block.",
);

const paidIntentSmokeWorkflow = read(".github/workflows/repair-paid-intent-production-smoke.yml");
assert.match(paidIntentSmokeWorkflow, /schedule:\s*\n\s*- cron:/, "Paid-intent E2E needs a bounded recurring proof even without receiver code changes.");
assert.match(paidIntentSmokeWorkflow, /Decide whether full receiver smoke is required/, "Every deploy should classify whether a real synthetic email is justified.");
assert.match(paidIntentSmokeWorkflow, /steps\.scope\.outputs\.full == 'true'/, "Real receiver sends must be gated to relevant changes or the scheduled/manual proof.");
assert.match(paidIntentSmokeWorkflow, /fail_safe_large_or_missing_commit_file_list/, "Ambiguous large commits must fail safe to the full receiver proof instead of silently skipping it.");
assert.match(paidIntentSmokeWorkflow, /Verify current paid-plan production truth/, "A lightweight production readback must remain on every successful deployment.");

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

await import("./production-contact-smoke-contract.test.mjs");
