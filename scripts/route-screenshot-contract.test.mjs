import assert from "node:assert/strict";
import {
  DEFAULT_SCREENSHOT_ROUTES,
  SCREENSHOT_VIEWPORTS,
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

const viewportMap = new Map(SCREENSHOT_VIEWPORTS.map((viewport) => [viewport.id, viewport.width]));
assert.equal(viewportMap.get("desktop"), 1440);
assert.equal(viewportMap.get("laptop"), 1024);
assert.equal(viewportMap.get("tablet"), 768);
assert.equal(viewportMap.get("mobile-wide"), 430);
assert.equal(viewportMap.get("mobile"), 390);
assert.equal(SCREENSHOT_VIEWPORTS.length, 5, "visual evidence must keep the five-width regression matrix");

const routeMap = new Map(DEFAULT_SCREENSHOT_ROUTES.map((route) => [route.id, route.path]));
assert.equal(routeMap.get("path-logistics"), "/paths/logistics/");
assert.equal(routeMap.get("path-marketing"), "/paths/marketing/");
assert.equal(routeMap.get("path-academy"), "/paths/academy/");
assert.equal(routeMap.get("path-technology"), "/paths/technology/");
assert.equal(routeMap.get("carrier-sales"), "/carrier/");
assert.equal(routeMap.get("carrier-signing"), "/sign/");
assert.equal(routeMap.get("repair-shops"), "/services/hermes-connect/repair-shops/");
assert.equal(routeMap.get("repair-shop-auth"), "/services/hermes-connect/repair-shops/auth/");
assert.equal(routeMap.get("repair-shop-plan"), "/services/hermes-connect/repair-shops/plan/");
assert.equal(routeMap.get("hermes-connect-workspace"), "/demos/hermes-connect/workspace.html");
assert.equal(screenshotFileName("path-logistics", "desktop"), "path-logistics--desktop.png");
assert.equal(screenshotFileName("path-marketing", "mobile"), "path-marketing--mobile.png");
assert.equal(screenshotFileName("path-academy", "desktop"), "path-academy--desktop.png");
assert.equal(screenshotFileName("path-technology", "mobile"), "path-technology--mobile.png");
assert.equal(screenshotFileName("carrier-sales", "desktop"), "carrier-sales--desktop.png");
assert.equal(screenshotFileName("carrier-signing", "mobile"), "carrier-signing--mobile.png");
assert.equal(screenshotFileName("repair-shops", "desktop"), "repair-shops--desktop.png");
assert.equal(screenshotFileName("repair-shop-auth", "mobile"), "repair-shop-auth--mobile.png");
assert.equal(screenshotFileName("repair-shop-plan", "desktop"), "repair-shop-plan--desktop.png");
assert.equal(screenshotFileName("hermes-connect-workspace", "mobile"), "hermes-connect-workspace--mobile.png");

assert.throws(() => parseScreenshotBaseUrl("https://hermeslogisticsus.com/"), /Remote screenshot capture is disabled/);
assert.equal(parseScreenshotBaseUrl("https://hermeslogisticsus.com/", { allowRemote: true }).hostname, "hermeslogisticsus.com");
assert.throws(() => parseScreenshotBaseUrl("https://user:pass@localhost:4321/"), /must not contain credentials/);
assert.throws(() => validateScreenshotRoutes([{ id: "duplicate", path: "/a/" }, { id: "duplicate", path: "/b/" }]), /Duplicate screenshot route/);
assert.throws(() => validateScreenshotRoutes([{ id: "unsafe", path: "/a/?token=x" }]), /clean absolute path/);

console.log("Route screenshot safety contract passed, including all four Hermes public directions, carrier sales, Repair Shops public/auth/plan, canonical Hermes Connect workspace, and the 390/430/768/1024/1440 visual evidence matrix.");
