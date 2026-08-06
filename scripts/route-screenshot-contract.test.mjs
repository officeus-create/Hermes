import assert from "node:assert/strict";
import {
  DEFAULT_SCREENSHOT_ROUTES,
  parseScreenshotBaseUrl,
  screenshotFileName,
  screenshotUrl,
  validateScreenshotRoutes,
} from "./route-screenshot-contract.mjs";

const local = parseScreenshotBaseUrl("http://127.0.0.1:4321");
assert.equal(local.href, "http://127.0.0.1:4321/");
assert.equal(screenshotUrl(local, "/services/seo/").href, "http://127.0.0.1:4321/services/seo/");
assert.equal(screenshotFileName("seo-service", "mobile"), "seo-service--mobile.png");
assert.equal(validateScreenshotRoutes(), DEFAULT_SCREENSHOT_ROUTES);

const routeMap = new Map(DEFAULT_SCREENSHOT_ROUTES.map((route) => [route.id, route.path]));
assert.equal(routeMap.get("carrier-sales"), "/carrier/");
assert.equal(routeMap.get("carrier-signing"), "/sign/");
assert.equal(screenshotFileName("carrier-sales", "desktop"), "carrier-sales--desktop.png");
assert.equal(screenshotFileName("carrier-signing", "mobile"), "carrier-signing--mobile.png");

assert.throws(() => parseScreenshotBaseUrl("https://hermeslogisticsus.com/"), /Remote screenshot capture is disabled/);
assert.equal(parseScreenshotBaseUrl("https://hermeslogisticsus.com/", { allowRemote: true }).hostname, "hermeslogisticsus.com");
assert.throws(() => parseScreenshotBaseUrl("https://user:pass@localhost:4321/"), /must not contain credentials/);
assert.throws(() => validateScreenshotRoutes([{ id: "duplicate", path: "/a/" }, { id: "duplicate", path: "/b/" }]), /Duplicate screenshot route/);
assert.throws(() => validateScreenshotRoutes([{ id: "unsafe", path: "/a/?token=x" }]), /clean absolute path/);

console.log("Route screenshot safety contract passed, including carrier sales and clean signing desktop/mobile coverage.");