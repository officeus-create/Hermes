import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, runtime, header, hub, repairPage, authPage] = await Promise.all([
  readFile(new URL("../src/components/HermesConnectLaunchEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/hermes-connect-launch.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/SiteHeader.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/auth.astro", import.meta.url), "utf8"),
]);

assert.match(header, /HermesConnectLauncher variant="header"/);
assert.match(header, /aria-label="Open Hermes Connect"/);
assert.match(enhancer, /hermes-connect-header-launcher/);
assert.match(enhancer, /display:\s*none\s*!important/);
assert.match(enhancer, /\/hermes-connect-launch\.js/);
assert.match(runtime, /HUB_PATH\s*=\s*"\/services\/hermes-connect\/"/);
assert.match(runtime, /REPAIR_PATH\s*=\s*"\/services\/hermes-connect\/repair-shops\/"/);
assert.match(runtime, /AUTH_PATH\s*=\s*"\/services\/hermes-connect\/repair-shops\/auth\/"/);
assert.match(runtime, /a\[href\^="https:\/\/connect\.hermeslogisticsus\.com"\]/);
assert.match(runtime, /Create Repair Shop account/);
assert.match(runtime, /Open Repair Shop pilot/);
assert.match(runtime, /mode=register/);
assert.match(runtime, /\[data-tab="\$\{mode\}"\]/);
assert.match(hub, /Request Web App access/);
assert.match(hub, /Open interactive workspace/);
assert.match(repairPage, /Owner Login \/ Get Started/);
assert.match(repairPage, /Open Web App Workspace/);
assert.match(authPage, /data-tab="login"/);
assert.match(authPage, /data-tab="register"/);

console.log("Hermes Connect single-entry, canonical internal launch, Repair Shop CTA, and register-mode contract passed.");
