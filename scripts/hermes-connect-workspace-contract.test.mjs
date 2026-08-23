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
assert(privateWorkspaceCss.includes("--hc-workspace-bg: var(--hermes-pearl)"), "Repair Shop owner workspace must consume canonical Pearl, not a full Obsidian room or a third palette.");
assert(privateWorkspaceCss.includes("background: var(--hermes-obsidian)"), "Repair Shop owner workspace must retain canonical Obsidian for decisive actions.");
assert(privateWorkspaceCss.includes("Northstar") === false, "Visual CSS must not contain account-specific profile data.");
assert(academyCss.includes("linear-gradient(145deg,#fff,#f4f1ff"), "Academy emphasis card must use the light intelligence surface.");
assert(!academyCss.includes("var(--hermes-obsidian);border-color:var(--hermes-line-dark)"), "Academy must not restore the previous full Obsidian emphasis card.");

// CEO profile refresh is in-place only. It authenticates the exact v3 identity through
// canonical production APIs, using only the matching retained Actions credential artifact.
// It must not depend on a Cloudflare admin token or self-grant controlled Academy privileges.
assert(ceoRefreshWorkflow.includes("officeus+hc-owner-qa-v3-20260818@hermeslogisticsus.com"), "CEO refresh must target the existing v3 QA identity.");
assert(ceoRefreshWorkflow.includes("actions: read"), "CEO refresh must have read-only Actions artifact permission for the existing secure handoff.");
assert(ceoRefreshWorkflow.includes("hermes-connect-ceo-owner-qa"), "CEO refresh must locate the existing CEO QA credential artifact rather than create another identity.");
assert(ceoRefreshWorkflow.includes("/api/auth/login"), "CEO refresh must authenticate through the canonical production auth API.");
assert(ceoRefreshWorkflow.includes("/api/repair-shop/profile"), "CEO refresh must update/read the existing Repair Shop profile through its owner API.");
assert(ceoRefreshWorkflow.includes("/api/repair-shop/capabilities"), "CEO refresh must fill the existing Repair Shop capability profile through its owner API.");
assert(ceoRefreshWorkflow.includes("/api/academy/profile"), "CEO refresh must fill existing Academy learner preferences through the shared identity API.");
assert(ceoRefreshWorkflow.includes("/api/academy/enrollments"), "CEO refresh may submit normal learner program requests through the existing enrollment API.");
assert(!ceoRefreshWorkflow.includes("CLOUDFLARE_API_TOKEN"), "CEO refresh must not require unavailable Cloudflare admin credentials.");
assert(!ceoRefreshWorkflow.includes("/d1/database/"), "CEO refresh must not bypass the product APIs with direct D1 admin queries.");
assert(!ceoRefreshWorkflow.includes("academy_reviewer_access"), "CEO refresh must not self-grant reviewer authorization.");
assert(!ceoRefreshWorkflow.includes("'CEO-QA'"), "CEO refresh must not force controlled cohort/enrollment state through an ops shortcut.");
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

console.log("Hermes Connect workspace contract passed: canonical preview stays isolated, private Repair Shop/Academy surfaces are Pearl-first with canonical Obsidian actions, and CEO QA profile refresh stays inside the existing authenticated production APIs without privilege bypasses.");
