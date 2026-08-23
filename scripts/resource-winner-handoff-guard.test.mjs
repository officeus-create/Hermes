import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const auctionChecklist = await readFile(join(dist, "logistics", "resources", "auction-vehicle-pickup-checklist", "index.html"), "utf8");
const capacityChecklist = await readFile(join(dist, "logistics", "resources", "car-hauler-capacity-checklist", "index.html"), "utf8");
const carHaulingOwner = await readFile(join(dist, "logistics", "car-hauling-dispatch", "index.html"), "utf8");

const getLinkHref = (html, rel) => [...html.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .find((tag) => new RegExp(`\\brel=["'][^"']*\\b${rel}\\b[^"']*["']`, "i").test(tag))
  ?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";

assert.equal(
  getLinkHref(auctionChecklist, "canonical"),
  "https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/",
  "Auction Vehicle Pickup Checklist must remain self-canonical",
);
assert.ok(
  /<meta\b[^>]*name=["']robots["'][^>]*content=["']index,follow,max-image-preview:large["'][^>]*>/i.test(auctionChecklist),
  "Auction Vehicle Pickup Checklist must remain indexable",
);
assert.ok(
  auctionChecklist.includes('href="/logistics/request-vehicle-transport/?request=auction_pickup#transport-intake"'),
  "Auction Vehicle Pickup Checklist must retain its direct vehicle-transport intake handoff",
);
assert.ok(auctionChecklist.includes("data-auction-direct-intake"), "Auction Vehicle Pickup Checklist direct intake CTA marker is missing");
assert.ok(
  auctionChecklist.includes('href="/logistics/resources/car-hauler-capacity-checklist/"'),
  "Auction Vehicle Pickup Checklist must retain the carrier-capacity supporting path",
);
assert.ok(
  auctionChecklist.includes("Submission does not guarantee a price, pickup date, delivery date, successful pickup, or carrier assignment."),
  "Auction Vehicle Pickup Checklist must retain its no-guarantee boundary",
);

assert.equal(
  getLinkHref(capacityChecklist, "canonical"),
  "https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/",
  "Car Hauler Capacity Checklist must remain self-canonical",
);
assert.ok(
  /<meta\b[^>]*name=["']robots["'][^>]*content=["']index,follow,max-image-preview:large["'][^>]*>/i.test(capacityChecklist),
  "Car Hauler Capacity Checklist must remain indexable",
);
assert.ok(
  capacityChecklist.includes('href="/logistics/start-car-hauling-dispatch/"'),
  "Car Hauler Capacity Checklist must retain its direct carrier intake handoff",
);
assert.ok(capacityChecklist.includes("data-commercial-primary-cta"), "Car Hauler Capacity Checklist commercial CTA marker is missing");
assert.ok(
  capacityChecklist.includes('href="/logistics/car-hauling-dispatch/"'),
  "Car Hauler Capacity Checklist must retain its commercial dispatch-owner handoff",
);
assert.ok(
  capacityChecklist.includes("Sharing capacity does not establish approval, onboarding, a load assignment, a rate, revenue, or a booking."),
  "Car Hauler Capacity Checklist must retain its no-guarantee boundary",
);

assert.ok(
  carHaulingOwner.includes('href="/logistics/resources/broker-setup-packet-checklist/"'),
  "Car-hauling owner must retain the broker-setup checklist semantic edge",
);
assert.ok(
  carHaulingOwner.includes('href="/logistics/resources/new-authority-car-hauler-readiness-checklist/"'),
  "Car-hauling owner must retain the new-authority readiness semantic edge",
);

console.log("Protected resource-winner commercial handoffs passed.");
