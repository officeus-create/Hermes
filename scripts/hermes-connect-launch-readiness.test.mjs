import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, runtime, host, header, hub, repairPage, authPage] = await Promise.all([
  readFile(new URL("../src/components/HermesConnectLaunchEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/hermes-connect-launch.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/SiteHeader.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/auth.astro", import.meta.url), "utf8"),
]);

assert.match(host, /HermesConnectLaunchEnhancer/);
assert.match(header, /HermesConnectLauncher variant="header"/);
assert.match(header, /aria-label="Open Hermes Connect"/);
assert.match(enhancer, /hermes-connect-header-launcher/);
assert.match(enhancer, /hermes-connect-mobile-launcher/);
assert.match(enhancer, /display:\s*none\s*!important/);
assert.match(enhancer, /repair-launch-bar/);
assert.match(enhancer, /\/hermes-connect-launch\.js/);

assert.match(runtime, /REPAIR_PATH\s*=\s*"\/services\/hermes-connect\/repair-shops\/"/);
assert.match(runtime, /AUTH_PATH\s*=\s*"\/services\/hermes-connect\/repair-shops\/auth\/"/);
assert.match(runtime, /Repair Shop \/ STO Pilot/);
assert.match(runtime, /repairShopLaunch/);
assert.match(runtime, /repairLaunchBar/);
assert.match(runtime, /Create Shop Account/);
assert.match(runtime, /repairRegisterLaunch/);
assert.match(runtime, /Owner Login/);
assert.match(runtime, /repairLoginLaunch/);
assert.match(runtime, /mode=register/);
assert.match(runtime, /mode=login/);
assert.match(runtime, /\[data-tab="\$\{mode\}"\]/);
assert.doesNotMatch(runtime, /canonicalizeHeader/);
assert.doesNotMatch(runtime, /canonicalizeLegacyConnectLinks/);
assert.doesNotMatch(runtime, /a\[href\^="https:\/\/connect\.hermeslogisticsus\.com"\]/);

assert.match(hub, /href="https:\/\/connect\.hermeslogisticsus\.com\/#apply"[^>]*>\s*Request Web App access/);
assert.match(hub, /href="https:\/\/connect\.hermeslogisticsus\.com\/workspace"[^>]*>\s*Open interactive workspace/);
assert.match(hub, /<button type="button" tabindex="-1">Request<\/button>/);
assert.match(repairPage, /Owner Login \/ Get Started/);
assert.match(authPage, /data-tab="login"/);
assert.match(authPage, /data-tab="register"/);

console.log("Hermes Connect duplicate header is hidden, existing workspace/tool URLs stay canonical, and stable desktop/mobile Repair Shop launch CTAs are present.");
