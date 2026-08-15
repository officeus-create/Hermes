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

console.log("Hermes Connect canonical workspace contract passed: one responsive workspace, review hub, industry switching, Hermes Intelligence, and no-network preview boundary are present.");
