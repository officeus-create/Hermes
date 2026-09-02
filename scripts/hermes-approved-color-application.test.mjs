import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const text = (path) => readFile(join(root, path), "utf8");

const brand = await text("src/styles/hermes-brand-system.css");
const divisions = await text("src/styles/hermes-connect-division-context.css");
const connect = await text("src/styles/hermes-connect-brand-visuals.css");
const workspaces = await text("src/styles/hermes-connect-workspace-colors.css");

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
assert(divisions.includes(".detail-hero::before"), "Division color must create visible hero atmosphere, not only a tiny badge tint.");
assert(divisions.includes(".detail-hero .button-primary"), "Division color must reach the primary hero CTA.");
assert(divisions.includes(".detail-hero > img.detail-hero-media"), "Division color must reach hero media framing/glow.");
assert(divisions.includes(".offering-grid article:hover"), "Division identity must continue into interactive content cards.");
assert(divisions.includes(".hermes-connect-banner-actions a"), "Division identity must continue into the Hermes Connect CTA surface.");

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

console.log("Approved Hermes division and Connect color application contract passed.");
