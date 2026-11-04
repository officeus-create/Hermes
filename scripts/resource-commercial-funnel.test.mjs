import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const tracked = [
  ["src/pages/resources/logistics-seo-audit-sample/index.astro", 2],
  ["src/pages/resources/search-to-inquiry-conversion-checklist/index.astro", 3],
  ["src/pages/resources/technical-seo-checklist/index.astro", 2],
  ["src/pages/resources/website-project-brief-template/index.astro", 2],
  ["src/pages/logistics/resources/index.astro", 3],
  ["src/pages/logistics/resources/auction-vehicle-pickup-checklist.astro", 2],
  ["src/pages/logistics/resources/wisconsin-car-shipping-cost-guide.astro", 2],
  ["src/pages/logistics/resources/broker-setup-packet-checklist/index.astro", 2],
  ["src/pages/logistics/resources/dispatch-service-vs-self-dispatch/index.astro", 2],
  ["src/pages/logistics/resources/factoring-vs-direct-payment-calculator/index.astro", 2],
  ["src/pages/logistics/resources/new-authority-car-hauler-readiness-checklist/index.astro", 2],
  ["src/pages/logistics/resources/rpm-calculator/index.astro", 3],
];

for (const [path, expected] of tracked) {
  const source = await readFile(join(root, path), "utf8");
  const tags = [...source.matchAll(/<a\b[^>]*data-resource-commercial-cta[^>]*>/g)].map((match) => match[0]);
  assert.equal(tags.length, expected, `${path}: expected ${expected} measured resource commercial link(s)`);
  for (const tag of tags) {
    assert.match(tag, /\bdata-service-group=(?:\{[^}]+\}|"[^"]+")/, `${path}: every measured resource link needs a controlled service group`);
    assert.match(tag, /\bdata-audience-type=(?:\{[^}]+\}|"[^"]+")/, `${path}: every measured resource link needs a controlled audience type`);
    assert.doesNotMatch(tag, /\bdata-commercial-primary-cta\b/, `${path}: do not double-register the resource click with the legacy primary-CTA tracker`);
  }
}

for (const path of [
  "src/pages/logistics/resources/car-hauler-capacity-checklist.astro",
  "src/pages/logistics/resources/car-hauler-jobs-owner-operator-guide/index.astro",
]) {
  const source = await readFile(join(root, path), "utf8");
  assert.match(source, /data-commercial-primary-cta/, `${path}: existing approved commercial tracker must remain`);
  assert.doesNotMatch(source, /data-resource-commercial-cta/, `${path}: existing tracked resources must not receive a duplicate resource tracker`);
}

const enhancer = await readFile(join(root, "src/components/ContactLinkEnhancer.astro"), "utf8");
assert.match(enhancer, /event\.isTrusted[^\n]*data-resource-commercial-cta/, "Resource measurement must require a trusted click");
assert.match(enhancer, /event:\s*"commercial_cta_click"/, "Resource measurement must reuse commercial_cta_click");
assert.match(enhancer, /cta_type:\s*"resource_to_commercial_click"/, "Resource CTA type must remain scorecard-compatible");
assert.match(enhancer, /page_group:\s*"resource"/, "Resource clicks must preserve their source family");
assert.match(enhancer, /service_group:\s*serviceGroup/, "Resource clicks must preserve controlled service group");
assert.match(enhancer, /audience_type:\s*audienceType/, "Resource clicks must preserve controlled audience type");
assert.match(enhancer, /destination_path:\s*target\.pathname/, "Resource clicks must preserve the internal destination path");

console.log("Resource commercial funnel contract passed: 12 newly measured sources + 2 existing tracked resources, no duplicate CTA owner.");
