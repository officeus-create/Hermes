import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const distRoot = join(root, "dist", "demos", "hermes-connect-brand-v1");

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

for (const marker of ["Web Brand Lab", "Hermes Workspace", "Mobile Web", "AI Sales Coach"]) {
  assert(review.includes(marker), `review.html: missing review hub marker: ${marker}`);
}

assert(css.includes(".hermes-drawer") && css.includes(".mobile-nav"), "workspace.css: Hermes drawer or mobile navigation style is missing.");
assert(js.includes("function setView") && js.includes("function setVertical") && js.includes("function setDrawer"), "workspace.js: core interaction contracts are missing.");

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

console.log("Hermes Connect Web Product V1 contract passed: workspace, review hub, mobile shell, industry switching, Hermes Intelligence, and no-network prototype boundary are present.");
