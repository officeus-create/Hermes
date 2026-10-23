import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = decodeURIComponent(new URL("../", import.meta.url).pathname);
const text = (path) => readFile(join(root, path), "utf8");

const brand = await text("src/styles/hermes-brand-system.css");
const divisions = await text("src/styles/hermes-connect-division-context.css");
const connect = await text("src/styles/hermes-connect-brand-visuals.css");
const workspaces = await text("src/styles/hermes-connect-workspace-colors.css");

assert(brand.includes("--hermes-logistics: #2f6bf6"), "Logistics must use the H-mark palette #2F6BF6 (owner decision 2026-10-23).");
assert(brand.includes("--hermes-marketing: #ff7a59"), "Marketing must use the H-mark palette #FF7A59 (owner decision 2026-10-23).");
assert(brand.includes("--hermes-academy: #12b886"), "Academy must use the H-mark palette #12B886 (owner decision 2026-10-23).");
assert(brand.includes("--hermes-technology: #38b6f5"), "Technology must use the H-mark palette #38B6F5 (owner decision 2026-10-23).");

for (const [name, token] of [
  ["Logistics", "var(--hermes-logistics,#2f6bf6)"],
  ["Marketing", "var(--hermes-marketing,#ff7a59)"],
  ["Academy", "var(--hermes-academy,#12b886)"],
  ["Technology", "var(--hermes-technology,#38b6f5)"],
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
assert(workspaces.includes(".hc-account-workspace.academy") && workspaces.includes("--hermes-academy"), "Academy workspace cue must be green.");
assert(workspaces.includes(".hc-account-workspace.ai") && workspaces.includes("--hermes-technology"), "AI/IT workspace cue must be sky.");
assert(workspaces.includes(".hc-account-workspace.beauty") && workspaces.includes("--hc-cyan"), "Beauty may use a Connect-family cyan UI cue but no invented canonical Beauty token.");
assert(!brand.includes("--hermes-beauty:"), "Do not invent a canonical Beauty brand color without owner approval.");

console.log("Approved Hermes division and Connect color application contract passed.");
