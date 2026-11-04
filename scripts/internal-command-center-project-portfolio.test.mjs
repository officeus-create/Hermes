import assert from "node:assert/strict";
import fs from "node:fs";
import { commandCenterProjectPortfolio, validateCommandCenterProjects } from "../functions/api/_lib/command-center-projects.mjs";
import { commandCenterProjectCoverageSnapshot } from "../functions/api/_lib/command-center-project-coverage.mjs";

const api = fs.readFileSync("functions/api/internal-command-center/projects.ts", "utf8");
const ownerWorkspace = fs.readFileSync("src/components/HermesCommandCenterOwnerWorkspace.astro", "utf8");
const ownerComponent = fs.readFileSync("src/components/HermesOwnerProjectPortfolio.astro", "utf8");
const publicPage = fs.readFileSync("src/pages/services/hermes-connect/command-center/index.astro", "utf8");
const publicDemo = fs.readFileSync("src/components/HermesCommandCenterPublicPreview.astro", "utf8");
const publicActivity = fs.readFileSync("src/components/HermesCommandCenterActivityShowcase.astro", "utf8");
const publicContent = fs.readFileSync("src/components/HermesCommandCenterPublicContent.astro", "utf8");
const retiredAiPage = fs.readFileSync("src/pages/services/hermes-connect/ai-command-center.astro", "utf8");
const portfolio = commandCenterProjectPortfolio();
const coverage = commandCenterProjectCoverageSnapshot();
const coverageArtifact = JSON.parse(fs.readFileSync("data/command-center/project-coverage-2026-11-01.json","utf8"));
assert.ok(coverageArtifact.families.some((family)=>family.id==="hae-command-center"&&/VIKTOR/.test(family.label)&&/DeepSeek/.test(family.label)),"coverage family must not hide VIKTOR/DeepSeek under generic AI wording");

assert.deepEqual(validateCommandCenterProjects(portfolio), []);
assert.ok(portfolio.length >= 10, "the initial owner registry must cover the consolidated project families");
assert.equal(new Set(portfolio.map((project) => project.id)).size, portfolio.length);
assert.ok(portfolio.every((project) => Number.isInteger(project.progress.percent) && project.progress.percent >= 0 && project.progress.percent <= 100));
assert.ok(portfolio.every((project) => project.eta === null && project.eta_label === "UNKNOWN"), "unproven ETA must stay UNKNOWN");
assert.ok(portfolio.some((project) => project.id === "investor-intelligence" && project.evidence_level === "HOLD_EVENT_TRIGGER_ONLY"));
assert.ok(portfolio.some((project) => project.id === "ai-operations" && project.status === "in_progress"), "AI Operations must remain in progress until role-scoped production acceptance");
assert.ok(portfolio.some((project) => project.id === "hermes-command-center" && project.evidence_level === "SOURCE_RELEASE_CANDIDATE_REVIEW_PENDING"), "release-candidate source must not become production verification");
const commandCenter=portfolio.find((project)=>project.id==="hermes-command-center");
for(const gate of ["runtime-registry","adapter-gap-detector","github-auditor-source","website-auditor-source","cloudflare-auditor-source","drive-auditor-source","audit-attention","receipt-verifier","plugin-hae-bridge","viktor-canary","free-ai","deployment","production-readback","final-independent-qa"])
  assert.ok(commandCenter.milestones.some((item)=>item.id===gate),"Command Center progress must include closure gate: "+gate);
assert.notEqual(commandCenter.status,"done","Command Center cannot be done while release/runtime gates remain");
assert.ok(commandCenter.milestones.some((item)=>item.id==="client-view"&&item.state==="active"),"Client View must remain visible until independent security + two-tenant production proof");
for(const surface of ["public-showcase","team-view","crm-router","social-read-model","reports-surface","knowledge-investor","access-admin","execution-evidence"])
  assert.ok(commandCenter.milestones.some((item)=>item.id===surface),"Command Center project map must retain product surface: "+surface);
const operationsFeed=portfolio.find((project)=>project.id==="command-center-operations-feed");
assert.ok(operationsFeed,"recurring reports/mail intake must not disappear from the canonical project map");
assert.ok(operationsFeed.milestones.some((item)=>item.id==="catalog-runtime"&&item.state==="blocked"));
assert.ok(operationsFeed.milestones.some((item)=>item.id==="hr-radar-runtime"&&item.state==="blocked"));
assert.ok(operationsFeed.milestones.some((item)=>item.id==="mail-triage"&&item.state==="planned"));
assert.ok(portfolio.some((project) => project.id === "ai-operations" && project.evidence_level === "SOURCE_RELEASE_CANDIDATE_REVIEW_PENDING"), "AI Operations must remain a release candidate until protected review and runtime acceptance");
assert.ok(portfolio.some((project) => project.id === "hae-runtime" && project.evidence_level === "CURRENT_MAIN_RUNTIME_READONLY_PROOF_ACCEPTED_RELEASE_PENDING"), "HAE project must separate accepted current-main runtime proof from the unmerged Command Center release");
assert.ok(portfolio.some((project) => project.id === "windows-ai" && project.evidence_level === "PRIMARY_ASSIGNED_HAE_EXECUTION_UNVERIFIED"), "Windows assignment must stay separate from dynamic host liveness and canonical HAE execution proof");
assert.ok(portfolio.some((project) => project.id === "deepseek-specialist" && project.evidence_level === "PREPARED_NOT_RUNNING_SANDBOX_GATED"), "DeepSeek must remain a separate subordinate specialist lane until sandbox and HAE receipt gates pass");
const deepseek=portfolio.find((project)=>project.id==="deepseek-specialist");
assert.equal(deepseek.parent_id,"ai-operations");
assert.ok(deepseek.dependency_ids.includes("hae-runtime"));
assert.ok(deepseek.milestones.some((item)=>item.id==="hae-receipt"&&item.state==="planned"));
assert.ok(deepseek.milestones.some((item)=>item.id==="sandbox-boundary"&&item.state==="blocked"));
assert.ok(portfolio.some((project) => project.id === "mac-ai" && project.evidence_level === "FALLBACK_RUNTIME_SOURCE_PRESENT_HAE_EXECUTION_UNVERIFIED"), "Mac fallback role must stay separate from dynamic host liveness and Hermes AI/HAE execution proof");

assert.match(api, /requireInternalOwner/);
assert.match(api, /Cache-Control.*private, no-store/);
assert.match(api, /progress_method/);
assert.match(api, /eta_policy/);
assert.match(api, /checked_at:checkedAt/,"project API read time must be generated at request time");
assert.match(api, /snapshot_observed_at:PROJECT_PORTFOLIO_SNAPSHOT_OBSERVED_AT/,"declared snapshot age must be separate from read time");
assert.match(api, /coverage_state:PROJECT_PORTFOLIO_COVERAGE_STATE/,"project API must declare partial registry coverage");
assert.doesNotMatch(api,/checked_at:\s*["']2026-10-28/,"stale fixed snapshot time must never impersonate a fresh read");
assert.match(ownerWorkspace, /HermesOwnerProjectPortfolio/, "project portfolio belongs to the shared owner workspace Projects view");
assert.match(ownerComponent, /\/api\/internal-command-center\/projects/);
assert.match(ownerComponent, /role="progressbar"/);
assert.match(ownerComponent, /Dependencies/);
assert.match(ownerComponent,/Elapsed/,"project cards must expose elapsed time from real timestamps");
assert.match(ownerComponent,/Duration/,"project cards must expose duration only when completion evidence exists");
assert.match(ownerComponent,/formatDuration/,"elapsed/duration must be derived from timestamps, not guessed");
assert.match(ownerComponent, /ETA/);
assert.match(ownerComponent,/data-project-coverage/);
assert.match(ownerComponent,/ONE BRAIN COVERAGE/);
assert.match(ownerComponent, /declared snapshot/,"owner UI must disclose snapshot age");
assert.match(ownerComponent, /coverageState/,"owner UI must surface partial coverage rather than imply completeness");

assert.match(publicPage, /HermesCommandCenterPublicContent/);
assert.match(publicContent, /HermesBusinessCommandCenterShell/);
assert.match(publicContent, /HermesCommandCenterPublicPreview/);
assert.match(publicContent, /HermesCommandCenterActivityShowcase/, "public Command Center must demonstrate the masked workflow");
assert.match(publicActivity, /VISUAL SIMULATION · NOT LIVE DATA/, "simulation must never impersonate real-time telemetry");
assert.match(publicActivity, /data-hcc-activity-toggle/, "public example must offer a working pause control");
assert.match(publicActivity, /prefers-reduced-motion/, "animated showcase must respect reduced motion");
assert.doesNotMatch(publicActivity, /\b(fetch|XMLHttpRequest|EventSource|WebSocket)\b/, "public simulation must not fetch private or live operational events");
assert.doesNotMatch(publicActivity, /WORK_ID|HERMES_INTERNAL_OWNER|127\.0\.0\.1|password|token|secret|credential/i, "public activity must not expose private implementation or identity details");
assert.match(publicPage, /robots="index,follow,max-image-preview:large"/,"canonical public Command Center must be indexable");
assert.match(publicContent, /Private production system · public sample/,"public page must state the production/demo boundary");
assert.match(publicDemo, /SAMPLE DATA/);
assert.match(publicContent, /Request a Command Center|Обсудить Command Center/);
assert.match(retiredAiPage, /AI is no longer a separate Command Center|AI больше не является отдельным Command Center/,"old public AI identity must be subordinate to Business Command Center");
assert.doesNotMatch(publicDemo, /#2107|#2125|#2159|HERMES_INTERNAL_OWNER|127\.0\.0\.1|One Brain|WORK_ID/);
assert.doesNotMatch(publicDemo, /password|token|secret|credential/i);

console.log("Command Center project portfolio: owner-gated registry + public-safe demo PASS");

