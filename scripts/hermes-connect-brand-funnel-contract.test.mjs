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

// 1. Verify Reusable Launcher Component exists
const launcher = await text("src/components/HermesConnectLauncher.astro");
assert(launcher.includes("data-hermes-connect-launcher"), "HermesConnectLauncher.astro: Missing data-hermes-connect-launcher attribute.");
assert(launcher.includes("/demos/hermes-connect-brand-v1/workspace.html"), "HermesConnectLauncher.astro: Missing primary workspace target.");
assert(launcher.includes("path d=\"M8 12c0-3 2.4-5.4 5.4-5.4h7.2"), "HermesConnectLauncher.astro: Missing brand knot SVG mark.");

// 2. Verify SiteHeader & SiteFooter Integration
const header = await text("src/components/SiteHeader.astro");
assert(header.includes("HermesConnectLauncher"), "SiteHeader.astro: Missing HermesConnectLauncher import or usage.");
assert(header.includes("variant=\"header\""), "SiteHeader.astro: Missing header launcher variant.");
assert(header.includes("variant=\"mobile\""), "SiteHeader.astro: Missing mobile launcher variant.");

const footer = await text("src/components/SiteFooter.astro");
assert(footer.includes("HermesConnectLauncher"), "SiteFooter.astro: Missing HermesConnectLauncher import or usage.");
assert(footer.includes("variant=\"footer\""), "SiteFooter.astro: Missing footer launcher variant.");

// 3. Verify Commercial Page Integrations
const pathSlug = await text("src/pages/paths/[slug].astro");
assert(pathSlug.includes("HermesConnectLauncher"), "paths/[slug].astro: Missing HermesConnectLauncher integration.");

const loadBoard = await text("src/pages/load-board.astro");
assert(loadBoard.includes("HermesConnectLauncher"), "load-board.astro: Missing HermesConnectLauncher integration.");

const digitalPage = await text("src/components/DigitalServicePage.astro");
assert(digitalPage.includes("HermesConnectLauncher"), "DigitalServicePage.astro: Missing HermesConnectLauncher integration.");

const hermesConnectPage = await text("src/pages/services/hermes-connect/index.astro");
assert(hermesConnectPage.includes("HermesConnectLauncher"), "services/hermes-connect/index.astro: Missing HermesConnectLauncher integration.");

// 4. Verify Brand Knot Logo Usage (Primary AI mark must be Hermes Knot, not generic icons)
assert(launcher.includes("hermes-knot-mark"), "Launcher must use official hermes-knot-mark CSS class.");

// 5. Verify Mock Status Honesty in workspace / adapters
const workspaceHtml = await text("public/demos/hermes-connect-brand-v1/workspace.html");
assert(/demo|simulated|preview|fictional/i.test(workspaceHtml), "Workspace HTML must state demo or simulated preview nature.");

console.log("✅ Hermes Connect Brand & Funnel Contract Test Passed successfully.");
