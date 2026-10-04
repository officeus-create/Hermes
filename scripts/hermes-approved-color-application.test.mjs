import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const text = (path) => readFile(join(root, path), "utf8");

const brand = await text("src/styles/hermes-brand-system.css");
const divisions = await text("src/styles/hermes-connect-division-context.css");
const connect = await text("src/styles/hermes-connect-brand-visuals.css");
const workspaces = await text("src/styles/hermes-connect-workspace-colors.css");
const appleton = await text("src/styles/features/appleton.css");
const appletonPage = await text("src/pages/logistics/appleton-wi-vehicle-transport.astro");

assert(brand.includes("--hermes-logistics: #1e88ff"), "Logistics must keep owner-approved #1E88FF.");
assert(brand.includes("--hermes-marketing: #00c853"), "Marketing must keep owner-approved #00C853.");
assert(brand.includes("--hermes-academy: #7c5cff"), "Academy must keep owner-approved #7C5CFF.");
assert(brand.includes("--hermes-technology: #ff7a00"), "IT & Product must keep owner-approved #FF7A00.");

for (const [name, token] of [
  ["Logistics", "var(--hermes-logistics,#1e88ff)"],
  ["Marketing", "var(--hermes-marketing,#00c853)"],
  ["Academy", "var(--hermes-academy,#7c5cff)"],
  ["Technology", "var(--hermes-technology,#ff7a00)"],
]) {
  assert(divisions.includes(token), `${name}: approved division token must drive the public path.`);
}
assert(divisions.includes("QUIET CORPORATION → PRODUCT THEATRE → OPERATIONAL CLARITY"), "Public direction styling must declare the V4 presentation rule.");
assert(divisions.includes("background: var(--hermes-obsidian)"), "Public direction hero CTA must use the quiet corporate Hermes action, not a direction-colored gradient.");
assert(divisions.includes(".detail-hero > img.detail-hero-media"), "Direction color may remain as restrained hero-media framing.");
assert(divisions.includes(".offering-grid article:hover"), "Direction identity may remain as a restrained interactive card signal.");
assert(divisions.includes(".hermes-connect-banner-actions a"), "The explicit Hermes Connect bridge remains a product-theatre surface.");

assert(connect.includes("--hc-blue: #00a8ff"), "Hermes Connect must keep Hermes Blue #00A8FF.");
assert(connect.includes("--hc-violet: #7c5cff"), "Hermes Connect must keep Iris Violet #7C5CFF.");
assert(connect.includes("--hc-cyan: #22d3ee"), "Hermes Connect must keep Electric Cyan #22D3EE.");
assert(connect.includes("--hc-deep: #0a0f1c"), "Hermes Connect must keep Deep Navy #0A0F1C.");
assert(connect.includes("mark-option02.svg"), "Hermes Connect hero must use locked Option 02 rather than the retired decorative knot geometry.");
assert(connect.includes(".hc-brand-page .hc-primary"), "Connect primary CTA must consume the brand gradient.");
assert(connect.includes(".hc-brand-page .hc-vertical-grid article"), "Connect business cards must expose context color.");

assert(workspaces.includes(".hc-account-workspace.repair") && workspaces.includes("--hermes-logistics"), "Repair workspace cue must be blue.");
assert(workspaces.includes(".hc-account-workspace.academy") && workspaces.includes("--hermes-academy"), "Academy workspace cue must be violet.");
assert(workspaces.includes(".hc-account-workspace.ai") && workspaces.includes("--hermes-technology"), "AI/IT workspace cue must be orange.");
assert(workspaces.includes(".hc-account-workspace.beauty") && workspaces.includes("--hc-cyan"), "Beauty may use a Connect-family cyan UI cue but no invented canonical Beauty token.");
assert(!brand.includes("--hermes-beauty:"), "Do not invent a canonical Beauty brand color without owner approval.");

assert(appletonPage.includes('<SiteHeader theme="light" activePath="/paths/logistics/" />'), "Appleton commercial owner must use the light corporate header.");
assert(appleton.includes("Design V4: quiet corporate shell"), "Appleton styles must declare the bounded V4 presentation intent.");
assert(appleton.includes("background: radial-gradient(circle at 84% 16%, rgba(30,136,255,.12), transparent 30rem), #f7f6f3"), "Appleton hero must keep a Pearl corporate shell with restrained Logistics signal.");
assert(appleton.includes(".appleton-planning { background: #0b0d12; color: #fff; }"), "Appleton may keep one bounded Focus Ink planning scene.");
assert(appleton.includes(".appleton-carrier-note { border-block: 1px solid rgba(11,13,18,.08); background: #f7f6f3; color: #0b0d12; }"), "Appleton must not stack a second dark reading section after the focus scene.");
assert(!appleton.includes("#07113c"), "Appleton must not restore the retired full dark-blue page shell.");

console.log("Approved Hermes division and Connect color application contract passed.");
