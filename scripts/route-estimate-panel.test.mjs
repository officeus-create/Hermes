import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const html = await readFile(join(root, "dist", "load-board", "index.html"), "utf8");
const functionSource = await readFile(join(root, "functions", "api", "route-estimate.ts"), "utf8");

assert.ok(html.includes("data-route-estimate-panel"), "Load Board route estimate panel is missing");
assert.ok(html.includes('data-route-estimate-mode="preview"'), "Route estimate must build in preview mode by default");
assert.ok(html.includes("No route request is made until you press Estimate route."));
assert.ok(html.includes("General driving estimate for planning only."));
assert.ok(html.includes("It is not truck-specific"));
assert.ok(html.includes('type="button" data-route-estimate-submit'), "Estimate control must not submit the load form");
assert.ok(html.includes('data-route-estimate-endpoint="/api/route-estimate"'), "Default estimate endpoint must be same-origin");
assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(html), false, "Rendered HTML must not contain a Google API key");
assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(functionSource), false, "Function source must not contain a Google API key literal");
assert.match(functionSource, /routes\.distanceMeters,routes\.duration/);
assert.match(functionSource, /ROUTE_ESTIMATE_ENABLED/);
assert.match(functionSource, /GOOGLE_MAPS_API_KEY/);
assert.match(functionSource, /ROUTE_LIMITS/);
assert.match(functionSource, /Cache-Control.*no-store/s);

console.log("Route estimate panel checks passed: preview default, explicit interaction, same-origin endpoint, disclaimer, minimal field mask, and zero key leakage.");
