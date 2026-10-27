import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  pathShell,
  academy,
  technology,
  logistics,
  logisticsCommercial,
  trustPage,
  directionStory,
] = await Promise.all([
  read("src/styles/hermes-public-path-shell.css"),
  read("src/styles/hermes-academy-public.css"),
  read("src/styles/hermes-technology-public.css"),
  read("src/styles/hermes-logistics-public.css"),
  read("src/styles/hermes-logistics-commercial-polish.css"),
  read("src/components/TrustPage.astro"),
  read("src/components/DirectionStory.astro"),
]);

assert.match(
  pathShell,
  /\.detail-page \.detail-hero \.button-primary\s*\{[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "public direction hero primary CTA must use the pill action shape",
);
assert.match(
  academy,
  /\.academy-opening-actions \.button-primary,[\s\S]*?\.academy-screen-actions \.button-primary[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "Academy public primary actions must use the pill action shape",
);
assert.match(
  academy,
  /\.academy-opening-actions \.button-ghost,[\s\S]*?\.academy-text-button[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "Academy public secondary actions must use the pill action shape",
);
assert.match(
  technology,
  /\.it-screen \.button-primary\s*\{[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "Technology public primary actions must use the pill action shape",
);
assert.match(
  technology,
  /\.it-screen \.button-ghost\s*\{[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "Technology public secondary actions must use the pill action shape",
);
assert.match(
  logistics,
  /\.logistics-local-pilot \.button-primary\s*\{[\s\S]*?border-radius:\s*var\(--hermes-radius-pill\)/,
  "Logistics local-pilot CTA must use the pill action shape",
);
assert.match(
  logisticsCommercial,
  /\.logistics-commercial-footer \.button\s*\{[^}]*border-radius:var\(--hermes-radius-pill\)/,
  "Logistics commercial footer actions must use the pill action shape",
);
assert.match(
  trustPage,
  /\.trust-action,\.trust-contact \.button-primary\{[^}]*border-radius:var\(--hermes-radius-pill\)/,
  "Trust-page public actions must use the pill action shape",
);

// Preserve actual control semantics: 12px remains correct for forms, step controls, and cards.
assert.match(
  technology,
  /\.it-brief-reference-list input,[\s\S]*?\.it-brief-reference-list textarea[\s\S]*?border-radius:\s*var\(--hermes-radius-control\)/,
  "Technology form controls must retain the control radius",
);
assert.match(
  logistics,
  /\.path-option-card\s*\{[\s\S]*?border-radius:\s*var\(--hermes-radius-control\)/,
  "Logistics decision controls/cards must retain the control radius",
);

console.log("Public CTA shape contract passed: public actions are pill-shaped while product/form controls retain the 12px control token.");


// Public proof/status chips are state semantics, never direction branding.
assert.match(directionStory, /\.ds-status-live\s*\{\s*background:\s*#e3f6ec;\s*color:\s*#0b6b40;/);
assert.match(directionStory, /\.ds-status-live-pilot\s*\{\s*background:\s*#e3f6ec;\s*color:\s*#0b6b40;/);
assert.match(directionStory, /\.ds-status-source-gated\s*\{\s*background:\s*#e6edff;\s*color:\s*#1d3fb3;/);
assert.match(directionStory, /\.ds-status-preview\s*\{\s*background:\s*#fff1e6;\s*color:\s*#a2470f;/);
assert.match(directionStory, /\.ds-status-private\s*\{\s*background:\s*#ececf1;\s*color:\s*#3c4050;/);
const statusCss = directionStory.slice(directionStory.indexOf(".ds-status {"), directionStory.indexOf(":global(.ds-connect-mark)"));
assert.doesNotMatch(
  statusCss,
  /var\(--direction-accent\)|var\(--dir-/,
  "public status chips must not use direction/department accent as their state color",
);
