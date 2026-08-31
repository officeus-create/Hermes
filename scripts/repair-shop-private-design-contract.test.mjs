import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [shellCss, dashboard, availability, customers] = await Promise.all([
  readFile(new URL("../src/styles/hermes-repair-public-shell.css", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/dashboard.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/availability.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/customers.astro", import.meta.url), "utf8"),
]);

for (const pageClass of ["workspace-page", "availability-page", "customers-page"]) {
  assert.match(shellCss, new RegExp(`\\.${pageClass}`));
}

assert.match(shellCss, /var\(--hermes-pearl\)/);
assert.match(shellCss, /var\(--hermes-repair\)/);
assert.match(shellCss, /var\(--hermes-ink\)/);
assert.match(shellCss, /var\(--hermes-line-light\)/);
assert.match(shellCss, /var\(--hermes-shadow-card\)/);
assert.match(shellCss, /color-scheme:\s*light/);
assert.match(shellCss, /\.primary-btn[\s\S]*background:\s*var\(--hermes-repair\)/);
assert.match(shellCss, /\.open-toggle input[\s\S]*accent-color:\s*var\(--hermes-repair\)/);
assert.match(shellCss, /prefers-reduced-transparency/);

// Presentation convergence must remain a CSS-only layer. The canonical private
// workspace pages continue to own their existing authenticated API/runtime flows.
assert.match(dashboard, /\/api\/repair-shop\/profile/);
assert.match(dashboard, /\/api\/repair-shop\/bookings/);
assert.match(availability, /\/api\/repair-shop\/availability/);
assert.match(customers, /\/api\/repair-shop\/customers/);
assert.doesNotMatch(shellCss, /fetch\(|\/api\/|localStorage|sessionStorage/);

console.log("Repair Shop private Pearl shell and canonical blue accent contract passed.");
