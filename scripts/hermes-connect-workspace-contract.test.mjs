import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const distRoot = join(root, "dist", "demos", "hermes-connect");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(name) {
  return readFile(join(distRoot, name), "utf8");
}

const workspace = await text("workspace.html");
const review = await text("review.html");
const css = await text("workspace.css");
const js = await text("workspace.js");
const enhancements = await text("workspace-enhancements.js");
const privateWorkspaceCss = await readFile(join(root, "src", "styles", "hermes-connect-workspace.css"), "utf8");
const academyCss = await readFile(join(root, "src", "styles", "hermes-academy-app.css"), "utf8");
const ceoRefreshWorkflow = await readFile(join(root, ".github", "workflows", "hc-ceo-profile-refresh.yml"), "utf8");

for (const [name, html] of [["workspace.html", workspace], ["review.html", review]]) {
  assert(/name=["']robots["'][^>]*noindex/i.test(html), `${name}: must remain noindex.`);
  assert(/nofollow/i.test(html), `${name}: must remain nofollow.`);
}

const requiredWorkspaceLabels = [
  "Hermes Connect",
  "Hermes Intelligence",
  "Inbox",
  "Customers",
  "Calendar",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Integrations",
  "Academy",
];
for (const marker of requiredWorkspaceLabels) {
  assert(workspace.includes(marker), `workspace.html: missing product marker: ${marker}`);
}

for (const vertical of ["beauty", "logistics", "fitness", "agency", "realestate"]) {
  assert(workspace.includes(`data-vertical="${vertical}"`), `workspace.html: missing demo vertical ${vertical}.`);
}

assert(workspace.includes('data-hermes-drawer'), "workspace.html: global Hermes Intelligence drawer is missing.");
assert(workspace.includes('data-mobile-view="home"'), "workspace.html: responsive mobile navigation is missing.");
assert(workspace.includes('./sales-roleplay.html'), "workspace.html: Academy must link to Sales Coach.");
assert(workspace.includes('./workspace.css') && workspace.includes('./workspace.js'), "workspace.html: local product assets are not linked.");
assert(workspace.includes('./workspace-enhancements.css') && workspace.includes('./workspace-enhancements.js'), "workspace.html: canonical enhancement assets are not linked.");
assert(!workspace.includes('workspace-launch-v2'), "workspace.html: retired launch-v2 asset names must not remain.");
assert(!workspace.includes('hermes-connect-brand-v1'), "workspace.html: retired Brand V1 path must not remain.");

for (const marker of ["Canonical Review Hub", "Responsive Workspace", "Request Access", "AI Sales Coach"]) {
  assert(review.includes(marker), `review.html: missing canonical review marker: ${marker}`);
}
assert(!review.includes("Brand Direction V1"), "review.html: retired V1 review language must not remain.");
assert(!review.includes("workspace-v2"), "review.html: retired workspace-v2 references must not remain.");

assert(css.includes(".hermes-drawer") && css.includes(".mobile-nav"), "workspace.css: Hermes drawer or mobile navigation style is missing.");
assert(js.includes("function setView") && js.includes("function setVertical") && js.includes("function setDrawer"), "workspace.js: core interaction contracts are missing.");
assert(!enhancements.includes("LAUNCH-V2"), "workspace-enhancements.js: retired launcher name must not remain in the canonical runtime.");

// The live private workspaces intentionally inherit the previously approved Pearl-room direction.
assert(privateWorkspaceCss.includes("--hc-workspace-bg: #f4f2ed"), "Repair Shop owner workspace must be Pearl-first, not a full Obsidian room.");
assert(privateWorkspaceCss.includes("background: #171a24"), "Repair Shop owner workspace must retain Obsidian only for decisive actions.");
assert(privateWorkspaceCss.includes("Northstar") === false, "Visual CSS must not contain account-specific profile data.");
assert(academyCss.includes("linear-gradient(145deg,#fff,#f4f1ff"), "Academy emphasis card must use the light intelligence surface.");
assert(!academyCss.includes("var(--hermes-obsidian);border-color:var(--hermes-line-dark)"), "Academy must not restore the previous full Obsidian emphasis card.");

// CEO profile refresh is in-place only: exact v3 identity, canonical Pages DB binding, no duplicate identity/shop creation.
assert(ceoRefreshWorkflow.includes("officeus+hc-owner-qa-v3-20260818@hermeslogisticsus.com"), "CEO refresh must target the existing v3 QA identity.");
assert(ceoRefreshWorkflow.includes("deployment_configs?.production?.d1_databases?.DB"), "CEO refresh must resolve the canonical production DB binding.");
assert(ceoRefreshWorkflow.includes("UPDATE repair_shops"), "CEO refresh must update the existing Repair Shop profile in place.");
assert(ceoRefreshWorkflow.includes("repair_shop_capabilities"), "CEO refresh must fill the existing capability profile rather than leave the QA shop visually empty.");
assert(ceoRefreshWorkflow.includes("INSERT OR IGNORE INTO academy_learner_profiles"), "CEO refresh must ensure the existing identity has Academy preferences.");
assert(ceoRefreshWorkflow.includes("academy_enrollments") && ceoRefreshWorkflow.includes("'CEO-QA'"), "CEO refresh must provision bounded Academy QA enrollment through the existing human-controlled table.");
assert(ceoRefreshWorkflow.includes("academy_reviewer_access"), "CEO refresh must use the existing reviewer-access table for CEO QA inspection.");
assert(!/UPDATE\s+specialists\s+SET[^;]*\brole\s*=/is.test(ceoRefreshWorkflow), "CEO refresh must not mutate the shared identity role to bypass authorization.");
assert(!ceoRefreshWorkflow.includes("INSERT INTO specialists"), "CEO refresh must never create a duplicate Hermes identity.");
assert(!ceoRefreshWorkflow.includes("INSERT INTO repair_shops"), "CEO refresh must never create a duplicate shop/slug.");

const forbiddenNetworkPatterns = [
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /navigator\.sendBeacon/,
  /<form\b[^>]*\baction\s*=/i,
];
for (const pattern of forbiddenNetworkPatterns) {
  assert(!pattern.test(js), `workspace.js: visual prototype must not perform external network actions: ${pattern}`);
  assert(!pattern.test(workspace), `workspace.html: visual prototype must not submit to an external action: ${pattern}`);
}

console.log("Hermes Connect workspace contract passed: canonical preview stays isolated, private Repair Shop/Academy surfaces are Pearl-first, and CEO QA data is provisioned in-place through existing controlled tables.");
