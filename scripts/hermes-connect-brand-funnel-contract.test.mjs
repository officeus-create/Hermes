import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (path) => readFile(join(root, path), "utf8");

console.log("Running Hermes Connect Product Family Contract Test...");

const launcher = await text("src/components/HermesConnectLauncher.astro");
assert(launcher.includes("data-hermes-connect-launcher"), "Launcher: missing product launcher marker.");
assert(launcher.includes('const computedHref = href || "/services/hermes-connect/"'), "Launcher: default must be the canonical Product Hub.");
assert(!launcher.includes("connect.hermeslogisticsus.com/workspace"), "Launcher: legacy workspace must not be a current default target.");
assert(!launcher.includes("hermes-connect-brand-v1"), "Launcher: retired Brand V1 path must not return.");
assert(launcher.includes("hermes-knot-mark"), "Launcher: official Hermes knot mark is required.");

const header = await text("src/components/SiteHeader.astro");
assert(header.includes("HermesConnectLauncher"), "Header: missing Hermes Connect launcher.");
assert(header.includes('variant="header"') && header.includes('variant="mobile"'), "Header: desktop and mobile launcher variants are required.");
assert(header.includes('href="/services/hermes-connect/repair-shops/"'), "Header: current Repair Shop product entry is required.");
assert(header.includes("isHermesConnectRoute"), "Header: Connect-specific language routing is required.");
assert(header.includes("params.set(\"lang\", language)"), "Header: language switching must preserve the equivalent Connect route.");

const experience = await text("src/components/HermesConnectExperience.astro");
assert(experience.includes("data-hc-product-context"), "Experience: product-family navigation is required.");
assert(experience.includes("data-hc-english-only"), "Experience: non-English routes must disclose English-only page content until fully localized.");
assert(experience.includes("REFERENCE CAPABILITY · NOT CURRENT LIVE PILOT"), "Experience: reference-capability status is required.");
assert(experience.includes("CURRENT LIVE PILOT"), "Experience: current live pilot status is required.");

const hub = await text("src/pages/services/hermes-connect/index.astro");
assert(hub.includes("One product family. One current live pilot."), "Hub: product-family hierarchy statement is required.");
assert(hub.includes("Reference capability"), "Hub: non-live modules must be classified as reference capabilities.");
assert(!hub.includes("connect.hermeslogisticsus.com/workspace"), "Hub: legacy workspace link must not be user-facing.");
assert(!/\$99|\$299|\$799/.test(hub), "Hub: historical planning prices must not appear as current pricing.");

const capabilityPages = [
  "ai-command-center.astro",
  "unified-inbox.astro",
  "load-analyzer.astro",
  "rate-negotiator.astro",
  "proposal-builder.astro",
  "roi-calculator.astro",
  "business-automation.astro",
];
for (const file of capabilityPages) {
  const source = await text(`src/pages/services/hermes-connect/${file}`);
  assert(source.includes("HermesConnectCapabilityPage"), `${file}: must use the shared Connect capability design system.`);
  assert(!source.includes("HERMES_CONNECT_PRICING"), `${file}: historical pricing module must not be imported by canonical product pages.`);
  assert(!source.includes("CANONICAL_PRICING_TIERS"), `${file}: historical price tiers must not be rendered.`);
  assert(!source.includes("connect.hermeslogisticsus.com/workspace"), `${file}: legacy workspace must not be linked.`);
  assert(!source.includes("Public Beta"), `${file}: non-live capability must not claim Public Beta.`);
}

const pricing = await text("src/data/hermes-connect-pricing.ts");
assert(pricing.includes('HERMES_CONNECT_PRICING_STATUS = "historical-planning-only"'), "Pricing: legacy tier data must be explicitly historical-only.");

const download = await text("src/pages/download.astro");
assert(download.includes("No public mobile-store or direct APK release"), "Access Center: mobile release boundary must be explicit.");
assert(!download.includes("connect.hermeslogisticsus.com/workspace"), "Access Center: legacy workspace target must not remain.");

const technology = await text("src/components/TechnologyInteractivePrototypes.astro");
assert(technology.includes("Reference capability"), "Technology preview: Connect preview must be clearly classified.");
assert(technology.includes("no calendar event, payment, account, or message is created"), "Technology preview: no-side-effect boundary must remain explicit.");
assert(!technology.includes("https://connect.hermeslogisticsus.com"), "Technology preview: legacy Connect host must not be user-facing.");

const workspaceHtml = await text("public/demos/hermes-connect/workspace.html");
assert(/demo|simulated|preview|fictional/i.test(workspaceHtml), "Preserved workspace: historical/demo nature must remain explicit.");
assert(!workspaceHtml.includes("hermes-connect-brand-v1"), "Preserved workspace: Brand V1 path must not return.");
assert(!workspaceHtml.includes("workspace-v2"), "Preserved workspace: retired workspace-v2 assets must not return.");

console.log("Hermes Connect product-family navigation, truthfulness, localization boundary, and legacy-routing contract passed.");
