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
] = await Promise.all([
  read("src/styles/hermes-public-path-shell.css"),
  read("src/styles/hermes-academy-public.css"),
  read("src/styles/hermes-technology-public.css"),
  read("src/styles/hermes-logistics-public.css"),
  read("src/styles/hermes-logistics-commercial-polish.css"),
  read("src/components/TrustPage.astro"),
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
