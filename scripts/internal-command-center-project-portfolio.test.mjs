import assert from "node:assert/strict";
import fs from "node:fs";
import { commandCenterProjectPortfolio, validateCommandCenterProjects } from "../functions/api/_lib/command-center-projects.mjs";

const api = fs.readFileSync("functions/api/internal-command-center/projects.ts", "utf8");
const ownerPage = fs.readFileSync("src/pages/services/hermes-connect/internal/command-center/index.astro", "utf8");
const ownerComponent = fs.readFileSync("src/components/HermesOwnerProjectPortfolio.astro", "utf8");
const publicPage = fs.readFileSync("src/pages/services/hermes-connect/command-center/index.astro", "utf8");
const publicDemo = fs.readFileSync("src/components/HermesCommandCenterPublicPreview.astro", "utf8");
const retiredAiPage = fs.readFileSync("src/pages/services/hermes-connect/ai-command-center.astro", "utf8");
const portfolio = commandCenterProjectPortfolio();

assert.deepEqual(validateCommandCenterProjects(portfolio), []);
assert.ok(portfolio.length >= 10, "the initial owner registry must cover the consolidated project families");
assert.equal(new Set(portfolio.map((project) => project.id)).size, portfolio.length);
assert.ok(portfolio.every((project) => Number.isInteger(project.progress.percent) && project.progress.percent >= 0 && project.progress.percent <= 100));
assert.ok(portfolio.every((project) => project.eta === null && project.eta_label === "UNKNOWN"), "unproven ETA must stay UNKNOWN");
assert.ok(portfolio.some((project) => project.id === "investor-intelligence" && project.evidence_level === "HOLD_EVENT_TRIGGER_ONLY"));
assert.ok(portfolio.some((project) => project.id === "ai-operations" && project.status === "blocked"), "the #2125/#2159 ownership conflict must remain visible");

assert.match(api, /requireInternalOwner/);
assert.match(api, /Cache-Control.*private, no-store/);
assert.match(api, /progress_method/);
assert.match(api, /eta_policy/);
assert.match(ownerPage, /HermesOwnerProjectPortfolio/);
assert.match(ownerComponent, /\/api\/internal-command-center\/projects/);
assert.match(ownerComponent, /role="progressbar"/);
assert.match(ownerComponent, /Dependencies/);
assert.match(ownerComponent, /ETA/);

assert.match(publicPage, /HermesCommandCenterPublicPreview/);
assert.match(publicPage, /robots="index,follow,max-image-preview:large"/,"canonical public Command Center must be indexable");
assert.match(publicPage, /Private production system · public sample/,"public page must state the production/demo boundary");
assert.match(publicDemo, /SAMPLE DATA/);
assert.match(publicPage, /Request a Command Center|Обсудить Command Center/);
assert.match(retiredAiPage, /AI is no longer a separate Command Center|AI больше не является отдельным Command Center/,"old public AI identity must be subordinate to Business Command Center");
assert.doesNotMatch(publicDemo, /#2107|#2125|#2159|HERMES_INTERNAL_OWNER|127\.0\.0\.1|One Brain|WORK_ID/);
assert.doesNotMatch(publicDemo, /password|token|secret|credential/i);

console.log("Command Center project portfolio: owner-gated registry + public-safe demo PASS");

