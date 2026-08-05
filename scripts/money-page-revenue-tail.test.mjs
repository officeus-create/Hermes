import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const pages = [
  ["dist/logistics/car-hauling-dispatch/index.html", "Start dispatch review", "/logistics/start-car-hauling-dispatch/", "tel:+12623023626"],
  ["dist/logistics/appleton-wi-vehicle-transport/index.html", "Prepare Appleton request", "/logistics/request-vehicle-transport/#transport-intake", "tel:+12623023626"],
  ["dist/logistics/wisconsin-vehicle-transport/index.html", "Prepare transport request", "/logistics/request-vehicle-transport/#transport-intake", "tel:+12623023626"],
  ["dist/logistics/green-bay-wi-vehicle-transport/index.html", "Prepare transport request", "/logistics/request-vehicle-transport/#transport-intake", "tel:+12623023626"],
  ["dist/logistics/dealer-vehicle-transportation/index.html", "Prepare dealer request", "request=dealer_inventory", "tel:+12623023626"],
  ["dist/logistics/auction-vehicle-pickup/index.html", "Prepare auction request", "request=auction_pickup", "tel:+12623023626"],
  ["dist/logistics/wisconsin-dealer-vehicle-transport/index.html", "Prepare dealer request", "request=dealer_inventory", "tel:+12623023626"],
  ["dist/logistics/wisconsin-auction-vehicle-pickup/index.html", "Prepare auction request", "request=auction_pickup", "tel:+12623023626"],
  ["dist/logistics/wisconsin-enclosed-vehicle-transport/index.html", "Prepare enclosed request", "/logistics/request-vehicle-transport/#transport-intake", "tel:+12623023626"],
  ["dist/logistics/wisconsin-multi-vehicle-dealer-transport/index.html", "Prepare multi-vehicle request", "request=dealer_inventory", "tel:+12623023626"],
  ["dist/services/seo/index.html", "Start SEO review", "service=seo", "mailto:officeus@hermeslogisticsus.com"],
  ["dist/services/local-seo/index.html", "Start local SEO review", "service=local_seo", "mailto:officeus@hermeslogisticsus.com"],
  ["dist/services/seo-for-logistics-companies/index.html", "Start logistics SEO review", "service=logistics_seo", "mailto:officeus@hermeslogisticsus.com"],
  ["dist/services/seo-for-independent-auto-dealers/index.html", "Start dealer SEO review", "service=auto_dealer_seo", "mailto:officeus@hermeslogisticsus.com"],
  ["dist/services/website-development/index.html", "Start website brief", "project=website_development", "mailto:officeus@hermeslogisticsus.com"],
  ["dist/services/website-redesign/index.html", "Start redesign brief", "project=website_redesign", "mailto:officeus@hermeslogisticsus.com"],
];

for (const [relativePath, label, primaryFragment, fallback] of pages) {
  const html = await read(relativePath);
  assert.ok(html.includes("money-page-action-bar"), `${relativePath} must include the bounded mobile action bar`);
  assert.ok(html.includes(label), `${relativePath} must include its page-specific action label`);
  assert.ok(html.includes(primaryFragment), `${relativePath} must preserve its direct intake destination`);
  assert.ok(html.includes(fallback), `${relativePath} must include the approved direct fallback`);
}

const homepage = await read("dist/index.html");
assert.ok(!homepage.includes('<aside class="money-page-action-bar"'), "The homepage must not receive a global sticky sales bar");

const supportingSeo = await read("src/components/SeoSupportingIntakeEnhancer.astro");
for (const variant of ["local_seo", "logistics_seo", "auto_dealer_seo"]) {
  assert.ok(supportingSeo.includes(variant), `Specialized SEO intake is missing ${variant}`);
}
assert.ok(supportingSeo.includes("group.dataset.seoService = requestedService"));
assert.ok(supportingSeo.includes("form.dataset.seoService = requestedService"));
assert.ok(supportingSeo.includes('event: "commercial_cta_click"'));
assert.ok(supportingSeo.includes('event: "seo_intake_start"'));
assert.ok(supportingSeo.includes('event: "seo_intake_preview_ready"'));
assert.ok(supportingSeo.includes('event: "seo_handoff_ready"'));
assert.ok(supportingSeo.includes('presetScope: "local"'));
assert.ok(supportingSeo.includes('presetVertical: "logistics"'));
assert.ok(supportingSeo.includes('presetVertical: "auto_dealer"'));

const layout = await read("src/layouts/BaseLayout.astro");
assert.ok(!layout.includes("SeoServiceVariantBridge"), "A second SEO variant handler must not compete with the approved intake");
assert.ok(layout.includes("<SeoIntakeEnhancer />"));
assert.ok(layout.includes("<SeoSupportingIntakeEnhancer />"));
assert.ok(layout.includes("<MoneyPageActionBar />"));
assert.ok(layout.includes("<VehicleTransportCtaEnhancer />"));

const actionBar = await read("src/components/MoneyPageActionBar.astro");
assert.ok(actionBar.includes("data-service-group={action.serviceGroup}"));
assert.ok(actionBar.includes('serviceGroup: "appleton_vehicle_transport"'));
assert.ok(actionBar.includes('serviceGroup: "wisconsin_local_vehicle_transport"'));

const vehicleTracking = await read("src/components/VehicleTransportCtaEnhancer.astro");
assert.ok(vehicleTracking.includes("link.dataset.serviceGroup"));
assert.ok(vehicleTracking.includes("appleton_vehicle_transport"));
assert.ok(vehicleTracking.includes("wisconsin_local_vehicle_transport"));
assert.ok(vehicleTracking.includes("wisconsin_dealer_vehicle_transport"));
assert.ok(vehicleTracking.includes('cta_type: "vehicle_transport_intake"'));
assert.ok(vehicleTracking.includes('target.pathname !== "/logistics/request-vehicle-transport/"'));

console.log("Money-page revenue tail contract passed: specialized SEO intake, complete Wisconsin vehicle CTA tracking, and bounded mobile actions.");
