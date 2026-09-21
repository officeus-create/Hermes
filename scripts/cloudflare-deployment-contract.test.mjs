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

const TRANSPORT_METADATA_MARKER = "[" + "executed on device" + ":";
const transportScanRoots = [".github/workflows", "scripts", "config", "functions", "src", "workers"];
const transportTextFiles = transportScanRoots
  .flatMap((directory) => listFiles(directory))
  .filter((file) => /\.(?:ya?ml|mjs|c?js|ts|tsx|jsonc?|toml|astro)$/i.test(file));

for (const file of transportTextFiles) {
  assert.equal(
    read(file).toLowerCase().includes(TRANSPORT_METADATA_MARKER),
    false,
    `${file} contains local tool/device execution metadata. Transport annotations are never repository source.`,
  );
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
assert.equal(
  aiProjectState.platform_and_owner_gates?.cloudflare_production_parity_961,
  undefined,
  "#961 is closed and must not remain a current owner-gate key.",
);
assert.match(
  aiProjectState.platform_and_owner_gates?.repair_shop_access_proof_960 ?? "",
  /BLOCKED_CLOUDFLARE_ACCOUNT_ACCESS.*DEDICATED_PAGES_READ.*D1.*ACCOUNT_CONTEXT_REQUIRED.*961_CLOSED/,
  "#960 must own the bounded production D1/operator proof with dedicated least-privilege Cloudflare inputs.",
);
assert.match(
  aiProjectState.platform_and_owner_gates?.password_reset_email_611 ?? "",
  /OWNER_ADMIN_ACTIVATION_GMAIL_API_TRANSPORT_OFF.*GMAIL_SEND_OAUTH_SECRETS.*RESET_PROOF.*MAIL_AUTH_ALIGNMENT/,
  "#611 must reflect the merged-but-off Gmail API transport and its owner/admin activation plus mail-auth proof gates.",
);
assert.match(
  aiProjectState.platform_and_owner_gates?.owner_mac_internal_ai ?? "",
  /MACBOOK_RETIRED.*DO_NOT_USE_OLD_LOCAL_RUNNER_ROUTE/,
  "Retired MacBook/local-runner state must not be routed as a current execution path.",
);
assert.match(
  (aiProjectState.execution_priorities ?? []).join("\n"),
  /#961 is closed[\s\S]*owner issue #960/,
  "Current execution priorities must route the bounded D1/operator proof to #960 and keep #961 closed.",
);
assert.doesNotMatch(
  (aiProjectState.execution_priorities ?? []).join("\n"),
  /Close #961/,
  "Current project state must not instruct agents to close an already-closed #961.",
);

const productionWorkflow = read(".github/workflows/cloudflare-pages-production-v2.yml");
for (const ignoredPath of [".github/**", "docs/**", "ai-collaboration/**", "tests/**", "README.md", "AGENTS.md", "CLAUDE.md"]) {
  assert.ok(productionWorkflow.includes(`- "${ignoredPath}"`), `Non-runtime path should not spend a production Pages build: ${ignoredPath}`);
}
assert.doesNotMatch(
  productionWorkflow,
  /pages deploy dist --project-name=hermes --branch=main|cloudflare\/wrangler-action|steps\.credentials|CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CLOUDFLARE_TOKEN/,
  "Production Pages must keep one release owner: the native Cloudflare Git integration, not an optional Wrangler upload path.",
);
assert.match(
  productionWorkflow,
  /checks:\s*read/,
  "The release verifier needs read-only check access to validate the native Cloudflare exact-SHA deployment.",
);
assert.match(
  productionWorkflow,
  /run\.name === "Cloudflare Pages" && run\.app\?\.slug === "cloudflare-workers-and-pages"/,
  "The release verifier must accept only the official Cloudflare Pages Git integration check.",
);
assert.match(
  productionWorkflow,
  /commits\/\$\{sha\}\/check-runs\?per_page=100/,
  "The native Pages release proof must be bound to the exact approved commit SHA.",
);
assert.doesNotMatch(
  productionWorkflow,
  /if:\s*steps\.credentials|WRANGLER_AVAILABLE|WRANGLER_DEPLOYMENT_/,
  "Native Cloudflare Git verification must be unconditional and must not depend on an alternate Wrangler credential path.",
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

const accessStateProofWorkflow = read(".github/workflows/repair-access-state-production-proof.yml");
assert.match(
  accessStateProofWorkflow,
  /CLOUDFLARE_PAGES_API_TOKEN:\s*\$\{\{\s*secrets\.CLOUDFLARE_PAGES_READ_TOKEN\s*\}\}/,
  "#961 proof must use the dedicated Pages-read credential only.",
);
assert.match(
  accessStateProofWorkflow,
  /CLOUDFLARE_D1_API_TOKEN:\s*\$\{\{\s*secrets\.CLOUDFLARE_D1_API_TOKEN\s*\}\}/,
  "#961 proof must keep a distinct dedicated D1 proof credential.",
);
assert.doesNotMatch(
  accessStateProofWorkflow,
  /secrets\.(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CLOUDFLARE_TOKEN)/,
  "#961 proof must not fall back to a broad generic Cloudflare token.",
);

const deploymentRecord = read("docs/DEPLOYMENT_RECORD.md");
const deploymentOwnership = read("docs/CLOUDFLARE_DEPLOYMENT_OWNERSHIP.md");
const agentInstructions = read("AGENTS.md");
const aiRoles = read("docs/AI_ROLES.md");
const claudeInstructions = read("CLAUDE.md");
assert.match(
  deploymentRecord,
  /Release owner:\s*Cloudflare Git integration/,
  "Current deployment record must name the native Cloudflare Git integration as the Pages release owner.",
);
assert.match(
  deploymentRecord,
  /Bounded production D1\/operator proof — #960/,
  "Current deployment record must route the bounded D1/operator proof to #960.",
);
assert.doesNotMatch(
  deploymentRecord,
  /Bounded production D1\/operator proof — #961/,
  "Closed #961 must not remain the deployment-record owner of the D1/operator proof.",
);
assert.match(
  deploymentOwnership,
  /#960 bounded D1\/operator proof[\s\S]*#961 is closed/i,
  "Cloudflare deployment ownership must route the bounded D1/operator proof to #960 and keep #961 closed.",
);
assert.doesNotMatch(
  agentInstructions,
  /The active local checkout is `\/Users\/progressopro\/Hermes`|Claude Code: local Mac execution/,
  "Repository agent instructions must not route current work to the retired owner Mac.",
);
assert.match(
  agentInstructions,
  /retired MacBook\/local checkout paths are historical provenance only/i,
  "Repository agent instructions must explicitly preserve the MacBook-retired current-state boundary.",
);
assert.doesNotMatch(
  aiRoles,
  /Claude Code on the Mac|use the Mac environment|Primary local coding/,
  "Current AI role routing must not depend on the retired owner Mac.",
);
assert.match(
  aiRoles,
  /retired owner Mac\/MacBook is historical provenance/i,
  "AI role routing must carry the MacBook-retired boundary explicitly.",
);
assert.doesNotMatch(
  claudeInstructions,
  /Environment available for this role: macOS \(this Mac\)|when operating on the Mac/,
  "Claude's current repository instructions must not assume the retired Mac is available.",
);
assert.match(
  claudeInstructions,
  /owner MacBook is retired/i,
  "Claude's current repository instructions must carry the MacBook-retired boundary explicitly.",
);
assert.doesNotMatch(
  deploymentRecord,
  /CUSTOM_DOMAIN_DEPLOYMENT_STALE|create a scoped API token|CLOUDFLARE_API_TOKEN/,
  "Current deployment record must not revive superseded generic Pages-token or stale-domain blockers.",
);

const claudeGuide = read("CLAUDE.md");
assert.doesNotMatch(
  claudeGuide,
  /real \(untracked\) `wrangler\.toml`|sole piece of server code/,
  "Agent guidance must not recreate an untracked root Wrangler authority or deny current Pages Function surfaces.",
);
assert.match(
  claudeGuide,
  /no active root Wrangler configuration/i,
  "Agent guidance must preserve the no-active-root-Wrangler ownership rule.",
);

const paidIntentSmokeWorkflow = read(".github/workflows/repair-paid-intent-production-smoke.yml");
assert.match(paidIntentSmokeWorkflow, /schedule:\s*\n\s*- cron:/, "Paid-intent E2E needs a bounded recurring proof even without receiver code changes.");
assert.match(paidIntentSmokeWorkflow, /Decide whether full receiver smoke is required/, "Every deploy should classify whether a real synthetic email is justified.");
assert.match(paidIntentSmokeWorkflow, /steps\.scope\.outputs\.full == 'true'/, "Real receiver sends must be gated to relevant changes or the scheduled/manual proof.");
assert.match(paidIntentSmokeWorkflow, /fail_safe_large_or_missing_commit_file_list/, "Ambiguous large commits must fail safe to the full receiver proof instead of silently skipping it.");
assert.match(paidIntentSmokeWorkflow, /Verify current paid-plan production truth/, "A lightweight production readback must remain on every successful deployment.");

const fiveSurfaceSyntheticWorkflow = read(".github/workflows/cloudflare-five-surface-synthetic.yml");
assert.match(fiveSurfaceSyntheticWorkflow, /schedule:\s*\n\s*- cron: "23 \*\/6 \* \* \*"/, "The five public Cloudflare surfaces need bounded recurring availability coverage.");
for (const surface of [
  "https://hermeslogisticsus.com/",
  "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/",
  "https://hermeslogisticsus.com/load-board/",
  "https://connect.hermeslogisticsus.com/",
  "https://app.hermeslogisticsus.com/",
]) {
  assert.ok(fiveSurfaceSyntheticWorkflow.includes(surface), `Five-surface synthetic is missing ${surface}`);
}
assert.match(fiveSurfaceSyntheticWorkflow, /gh issue comment 1349/, "Synthetic failures must report to the sole canonical Cloudflare tracker.");
assert.doesNotMatch(fiveSurfaceSyntheticWorkflow, /CLOUDFLARE_(?:API_TOKEN|ACCOUNT_ID)|CF_API_TOKEN|--request\s+POST/i, "Availability synthetics must stay public-read-only and credential-free.");

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
    `${workflowPath} invokes a generic wrangler-action deploy command. Pages releases must remain owned by the native Cloudflare Git integration.`,
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

console.log("Cloudflare deployment ownership contract passed: Pages has one native Cloudflare Git exact-SHA release owner plus one composed hermes-lead-email Worker owner.");

await import("./production-contact-smoke-contract.test.mjs");
