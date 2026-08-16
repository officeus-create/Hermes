import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(path) {
  return readFile(join(root, path), "utf8");
}

console.log("Running Hermes Connect Brand & Funnel Contract Test...");

const launcher = await text("src/components/HermesConnectLauncher.astro");
assert(launcher.includes("data-hermes-connect-launcher"), "HermesConnectLauncher.astro: Missing data-hermes-connect-launcher attribute.");
assert(launcher.includes("https://connect.hermeslogisticsus.com/workspace"), "HermesConnectLauncher.astro: Missing canonical workspace target.");
assert(!launcher.includes("hermes-connect-brand-v1"), "HermesConnectLauncher.astro: Retired Brand V1 path must not remain.");
assert(launcher.includes("path d=\"M8 12c0-3 2.4-5.4 5.4-5.4h7.2"), "HermesConnectLauncher.astro: Missing brand knot SVG mark.");

const header = await text("src/components/SiteHeader.astro");
assert(header.includes("HermesConnectLauncher"), "SiteHeader.astro: Missing HermesConnectLauncher import or usage.");
assert(header.includes("variant=\"header\""), "SiteHeader.astro: Missing header launcher variant.");
assert(header.includes("variant=\"mobile\""), "SiteHeader.astro: Missing mobile launcher variant.");
assert(header.includes('href="/services/hermes-connect/repair-shops/"'), "SiteHeader.astro: Primary Hermes Connect entry must open the Repair Shop Partner Beta for pilot launch.");
assert(!header.includes('const connectUrl = "https://connect.hermeslogisticsus.com/"'), "SiteHeader.astro: Duplicate standalone Hermes Connect header route must not return.");
assert(!header.includes('<a class="header-cta" href={connectUrl}'), "SiteHeader.astro: Duplicate Hermes Connect desktop CTA must not return.");
assert(!header.includes('<a href={connectUrl} aria-label="Open Hermes Connect">Hermes Connect</a>'), "SiteHeader.astro: Duplicate Hermes Connect mobile CTA must not return.");

const footer = await text("src/components/SiteFooter.astro");
assert(footer.includes("HermesConnectLauncher"), "SiteFooter.astro: Missing HermesConnectLauncher import or usage.");
assert(footer.includes("variant=\"footer\""), "SiteFooter.astro: Missing footer launcher variant.");

const pathSlug = await text("src/pages/paths/[slug].astro");
assert(pathSlug.includes("HermesConnectLauncher"), "paths/[slug].astro: Missing HermesConnectLauncher integration.");

const loadBoard = await text("src/pages/load-board.astro");
assert(loadBoard.includes("HermesConnectLauncher"), "load-board.astro: Missing HermesConnectLauncher integration.");

const digitalPage = await text("src/components/DigitalServicePage.astro");
assert(digitalPage.includes("HermesConnectLauncher"), "DigitalServicePage.astro: Missing HermesConnectLauncher integration.");

const hermesConnectPage = await text("src/pages/services/hermes-connect/index.astro");
assert(hermesConnectPage.includes("HermesConnectLauncher"), "services/hermes-connect/index.astro: Missing HermesConnectLauncher integration.");

assert(launcher.includes("hermes-knot-mark"), "Launcher must use official hermes-knot-mark CSS class.");

const workspaceHtml = await text("public/demos/hermes-connect/workspace.html");
assert(/demo|simulated|preview|fictional/i.test(workspaceHtml), "Workspace HTML must state demo or simulated preview nature.");
assert(!workspaceHtml.includes("hermes-connect-brand-v1"), "Workspace HTML must not reference retired Brand V1 paths.");
assert(!workspaceHtml.includes("workspace-v2"), "Workspace HTML must not reference retired workspace-v2 assets.");

const pricingTs = await text("src/data/hermes-connect-pricing.ts");
const workspaceJs = await text("public/demos/hermes-connect/workspace.js");

assert(pricingTs.includes("priceMonthly: 99") && pricingTs.includes("priceAnnualMonthly: 79"), "pricing.ts: Starter pricing mismatch.");
assert(workspaceJs.includes("starter: { name: 'Starter', monthly: 99, annual: 79 }"), "workspace.js: Starter pricing mismatch.");
assert(pricingTs.includes("priceMonthly: 299") && pricingTs.includes("priceAnnualMonthly: 249"), "pricing.ts: Pro pricing mismatch.");
assert(workspaceJs.includes("pro: { name: 'Professional', monthly: 299, annual: 249 }"), "workspace.js: Pro pricing mismatch.");
assert(pricingTs.includes("priceMonthly: 799") && pricingTs.includes("priceAnnualMonthly: 699"), "pricing.ts: Enterprise pricing mismatch.");
assert(workspaceJs.includes("enterprise: { name: 'Enterprise', monthly: 799, annual: 699 }"), "workspace.js: Enterprise pricing mismatch.");

console.log("Hermes Connect Brand & Funnel Contract Test passed against the canonical workspace.");