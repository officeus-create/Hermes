import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [shellCss, polishCss, demoScript, dashboard, availability, customers, auth, booking] = await Promise.all([
  readFile(new URL("../src/styles/hermes-repair-public-shell.css", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-design-polish.css", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-local-demo.js", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/dashboard.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/availability.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/customers.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/auth.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/booking.astro", import.meta.url), "utf8"),
]);

for (const pageClass of ["workspace-page", "availability-page", "customers-page"]) {
  assert.match(shellCss, new RegExp(`\\.${pageClass}`));
}

assert.match(shellCss, /background-color:\s*var\(--hermes-pearl\)/);
assert.match(shellCss, /background-image:[\s\S]*var\(--hermes-repair\)/);
assert.match(shellCss, /var\(--hermes-ink\)/);
assert.match(shellCss, /var\(--hermes-line-light\)/);
assert.match(shellCss, /var\(--hermes-shadow-card\)/);
assert.match(shellCss, /color-scheme:\s*light/);
assert.match(shellCss, /\.primary-btn[\s\S]*background:\s*var\(--hermes-obsidian\)/);
assert.match(shellCss, /\.open-toggle input[\s\S]*accent-color:\s*var\(--hermes-repair\)/);
assert.match(shellCss, /prefers-reduced-transparency/);

// Latest owner direction: the CRM and onboarding experience remain Pearl/light.
assert.match(polishCss, /:is\(\.auth-page,\.recovery-page,\.booking-page\)/);
assert.match(polishCss, /--hc-pearl:\s*#f7f6f3/i);
assert.match(polishCss, /url\('\/demos\/hermes-connect\/icon\.svg'\)/);
assert.match(polishCss, /rgba\(124,92,255/);
assert.match(polishCss, /rgba\(90,200,250/);
assert.match(polishCss, /\.repair-crm-topbar[\s\S]*backdrop-filter/);
assert.match(polishCss, /\.repair-crm-nav-item\.is-active[\s\S]*linear-gradient/);
assert.doesNotMatch(polishCss, /fetch\(|\/api\//);

// Design polish is loaded for all Repair Shop launch routes before demo gating.
assert.match(demoScript, /ensureDesignPolish\(\);[\s\S]*if \(!demo/);
assert.match(demoScript, /preview\s*=\s*params\.get\("preview"\)\s*===\s*"1"/);
assert.match(demoScript, /publicPreview\s*=\s*!local\s*&&\s*demo\s*&&\s*preview/);
assert.match(demoScript, /LIVE PREVIEW · synthetic data/);
assert.match(demoScript, /if \(!path\.startsWith\("\/api\/"\)\) return originalFetch/);

// Presentation convergence must remain a CSS-only layer. The canonical private
// workspace pages continue to own their existing authenticated API/runtime flows.
assert.match(dashboard, /\/api\/repair-shop\/profile/);
assert.match(dashboard, /\/api\/repair-shop\/bookings/);
assert.match(availability, /\/api\/repair-shop\/availability/);
assert.match(customers, /\/api\/repair-shop\/customers/);
assert.match(auth, /\/api\/auth\/login/);
assert.match(auth, /\/api\/auth\/register/);
assert.match(booking, /\/api\/public\/repair-shop/);
assert.doesNotMatch(shellCss, /fetch\(|\/api\/|localStorage|sessionStorage/);

console.log("Repair Shop Pearl shell, approved Connect mark refinement, and safe synthetic preview contract passed.");