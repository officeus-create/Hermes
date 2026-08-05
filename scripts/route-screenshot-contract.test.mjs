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
assert.equal(
  screenshotUrl(local, "/services/seo/").href,
  "http://127.0.0.1:4321/services/seo/",
);
assert.equal(
  screenshotFileName("seo-service", "mobile"),
  "seo-service--mobile.png",
);
assert.equal(validateScreenshotRoutes(), DEFAULT_SCREENSHOT_ROUTES);

assert.throws(
  () => parseScreenshotBaseUrl("https://hermeslogisticsus.com/"),
  /Remote screenshot capture is disabled/,
);
assert.equal(
  parseScreenshotBaseUrl("https://hermeslogisticsus.com/", {
    allowRemote: true,
  }).hostname,
  "hermeslogisticsus.com",
);
assert.throws(
  () => parseScreenshotBaseUrl("https://user:pass@localhost:4321/"),
  /must not contain credentials/,
);
assert.throws(
  () =>
    validateScreenshotRoutes([
      { id: "duplicate", path: "/a/" },
      { id: "duplicate", path: "/b/" },
    ]),
  /Duplicate screenshot route/,
);
assert.throws(
  () => validateScreenshotRoutes([{ id: "unsafe", path: "/a/?token=x" }]),
  /clean absolute path/,
);

console.log("Route screenshot safety contract passed.");
