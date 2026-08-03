import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const loadBoardHtml = await readFile(join(root, "dist", "load-board", "index.html"), "utf8");
const homeHtml = await readFile(join(root, "dist", "index.html"), "utf8");
const componentSource = await readFile(join(root, "src", "components", "RouteEstimateEnhancer.astro"), "utf8");
const functionSource = await readFile(join(root, "functions", "api", "route-estimate.ts"), "utf8");

assert.ok(loadBoardHtml.includes("data-route-estimate-panel"), "Load Board route estimate panel is missing");
assert.ok(loadBoardHtml.includes('data-route-estimate-mode="preview"'), "Route estimate must build in preview mode by default");
assert.ok(loadBoardHtml.includes("No route request is made until you press Estimate route."));
assert.ok(loadBoardHtml.includes("General driving estimate for planning only."));
assert.ok(loadBoardHtml.includes("It is not truck-specific"));
assert.ok(loadBoardHtml.includes("Logistics Sales contact options"), "Direct contact fallback is missing");
assert.ok(loadBoardHtml.includes('type="button" data-route-estimate-submit'), "Estimate control must not submit the load form");
assert.ok(loadBoardHtml.includes('data-route-estimate-endpoint="/api/route-estimate"'), "Default estimate endpoint must be same-origin");
assert.equal(homeHtml.includes("data-route-estimate-panel"), false, "Route estimate markup must not render outside Load Board");
assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(loadBoardHtml), false, "Rendered HTML must not contain a Google API key");
assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(functionSource), false, "Function source must not contain a Google API key literal");
assert.match(functionSource, /routes\.distanceMeters,routes\.duration/);
assert.match(functionSource, /ROUTE_ESTIMATE_ENABLED/);
assert.match(functionSource, /GOOGLE_MAPS_API_KEY/);
assert.match(functionSource, /ROUTE_LIMITS/);
assert.match(functionSource, /Cache-Control.*no-store/s);
assert.match(functionSource, /X-Robots-Tag.*noindex, nofollow/s);
assert.equal(componentSource.includes("geolocation"), false, "The preview must not request browser location");
assert.equal(componentSource.includes("places.googleapis.com"), false, "Autocomplete is outside Release A");
assert.match(componentSource, /button\.addEventListener\("click"/);
assert.match(componentSource, /panel\.dataset\.routeEstimateMode !== "live"/);
assert.match(componentSource, /endpointUrl\.origin !== window\.location\.origin/);
assert.equal(componentSource.includes("gtag("), false, "Route values must not be sent to analytics");

console.log("Route estimate panel checks passed: Load Board only, preview default, explicit interaction, same-origin endpoint, direct fallback, minimal field mask and zero key/analytics/geolocation leakage.");
