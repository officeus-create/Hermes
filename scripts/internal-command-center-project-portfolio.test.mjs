import assert from "node:assert/strict";
import fs from "node:fs";
import { commandCenterProjectPortfolio, validateCommandCenterProjects } from "../functions/api/_lib/command-center-projects.mjs";
import { commandCenterProjectCoverageSnapshot } from "../functions/api/_lib/command-center-project-coverage.mjs";

const api = fs.readFileSync("functions/api/internal-command-center/projects.ts", "utf8");
const ownerWorkspace = fs.readFileSync("src/components/HermesCommandCenterOwnerWorkspace.astro", "utf8");
const ownerComponent = fs.readFileSync("src/components/HermesOwnerProjectPortfolio.astro", "utf8");
const publicPage = fs.readFileSync("src/pages/services/hermes-connect/command-center/index.astro", "utf8");
const publicDemo = fs.readFileSync("src/components/HermesCommandCenterPublicPreview.astro", "utf8");
const publicContent = fs.readFileSync("src/components/HermesCommandCenterPublicContent.astro", "utf8");
const retiredAiPage = fs.readFileSync("src/pages/services/hermes-connect/ai-command-center.astro", "utf8");
const portfolio = commandCenterProjectPortfolio();
const coverage = commandCenterProjectCoverageSnapshot();
const coverageArtifact = JSON.parse(fs.readFileSync("data/command-center/project-coverage-2026-11-01.json","utf8"));

assert.deepEqual(validateCommandCenterProjects(portfolio), []);
assert.ok(portfolio.length >= 10, "the initial owner registry must cover the consolidated project families");
assert.equal(new Set(portfolio.map((project) => project.id)).size, portfolio.length);
assert.ok(portfolio.every((project) => Number.isInteger(project.progress.percent) && project.progress.percent >= 0 && project.progress.percent <= 100));
assert.ok(portfolio.every((project) => project.eta === null && project.eta_label === "UNKNOWN"), "unproven ETA must stay UNKNOWN");
assert.ok(portfolio.some((project) => project.id === "investor-intelligence" && project.evidence_level === "HOLD_EVENT_TRIGGER_ONLY"));
assert.ok(portfolio.some((project) => project.id === "ai-operations" && project.status === "in_progress"), "AI Operations must remain in progress until role-scoped production acceptance");
assert.ok(portfolio.some((project) => project.id === "hermes-command-center" && project.evidence_level === "SOURCE_MERGED_RUNTIME_UNVERIFIED"), "source merge must not become production verification");

assert.match(api, /requireInternalOwner/);
assert.match(api, /Cache-Control.*private, no-store/);
assert.match(api, /progress_method/);
assert.match(api, /eta_policy/);
assert.match(api, /const checkedAt=new Date\(\)\.toISOString\(\)/,"project API must timestamp the current D1 readback at request time");
assert.match(api, /source_class:"IMMUTABLE_REVIEWED_SNAPSHOT"/,"canonical project registry must be labeled as historical reviewed snapshot evidence");
assert.match(api, /evidence_at:"2026-10-28T15:30:00\+02:00"/,"historical registry evidence date must remain explicit");
assert.match(api, /source_class:"CURRENT_REQUEST_D1_READBACK"/,"owner D1 counts must be labeled as current-request readback");
assert.doesNotMatch(api, /checked_at:"2026-10-28T15:30:00\+02:00"/,"historical snapshot date must never masquerade as current checked_at");
assert.match(api, /commandCenterProjectCoverageSnapshot/,"project API must expose the reviewed One Brain coverage snapshot only behind owner auth");
assert.equal(coverage.coverage_status,"PARTIAL","coverage must stay PARTIAL until every canonical family has an accepted live/readback mapping");
assert.equal(coverage.ledger_row_count_observed,116);
assert.equal(coverage.families.length,15);
assert.ok(coverage.families.every((family)=>family.source_state==="CURRENT_SOURCE_IDENTIFIED"));
assert.ok(coverage.families.every((family)=>family.active_work_id_count===null&&family.count_state==="UNKNOWN_NOT_EXHAUSTIVELY_MAPPED"),"representative WORK_IDs must not masquerade as complete active counts");
assert.equal(coverageArtifact.snapshot_id,coverage.snapshot_id);
assert.equal(coverageArtifact.ledger_row_count_observed,coverage.ledger_row_count_observed);
assert.match(ownerWorkspace, /HermesOwnerProjectPortfolio/, "project portfolio belongs to the shared owner workspace Projects view");
assert.match(ownerComponent, /\/api\/internal-command-center\/projects/);
assert.match(ownerComponent, /role="progressbar"/);
assert.match(ownerComponent, /Dependencies/);
assert.match(ownerComponent, /ETA/);
assert.match(ownerComponent, /data-project-coverage/);
assert.match(ownerComponent, /ONE BRAIN COVERAGE/);
assert.match(ownerComponent, /ledger_row_count_observed/);

assert.match(publicPage, /HermesCommandCenterPublicContent/);
assert.match(publicContent, /HermesBusinessCommandCenterShell/);
assert.match(publicContent, /HermesCommandCenterPublicPreview/);
assert.match(publicPage, /robots="index,follow,max-image-preview:large"/,"canonical public Command Center must be indexable");
assert.match(publicContent, /Private production system · public sample/,"public page must state the production/demo boundary");
assert.match(publicDemo, /SAMPLE DATA/);
assert.match(publicContent, /Request a Command Center|Обсудить Command Center/);
assert.match(retiredAiPage, /AI is no longer a separate Command Center|AI больше не является отдельным Command Center/,"old public AI identity must be subordinate to Business Command Center");
assert.doesNotMatch(publicDemo, /#2107|#2125|#2159|HERMES_INTERNAL_OWNER|127\.0\.0\.1|One Brain|WORK_ID/);
assert.doesNotMatch(publicDemo, /password|token|secret|credential/i);

console.log("Command Center project portfolio: owner-gated registry + public-safe demo PASS");

