import assert from "node:assert/strict";
import {
  logisticsPathNodes,
  logisticsRecommendations,
  resolveLogisticsRecommendation,
} from "../src/data/logistics-path-engine.ts";

assert.equal(resolveLogisticsRecommendation({ role: "owner-operator", equipment: ["car-hauling"], "carrier-need": "loads-now", "carrier-situation": "active-ready" }), "carrier-car-hauling");
assert.equal(resolveLogisticsRecommendation({ role: "fleet-owner", equipment: ["dry-van"], "carrier-need": "dispatch", "carrier-situation": "active-ready" }), "carrier-fleet-owners");
assert.equal(resolveLogisticsRecommendation({ role: "carrier", equipment: ["hotshot"], "carrier-need": "new-authority", "carrier-situation": "new-pending" }), "carrier-new-authority");
assert.equal(resolveLogisticsRecommendation({ role: "carrier", equipment: ["box-truck"], "carrier-need": "direct-freight", "carrier-situation": "active-ready" }), "carrier-direct-freight");
assert.equal(resolveLogisticsRecommendation({ role: "private-customer", "customer-cargo": "port-pickup", "customer-situation": "ready-now" }), "customer-port-pickup");
assert.equal(resolveLogisticsRecommendation({ role: "private-customer", "customer-cargo": "luxury-classic", "customer-situation": "special-handling" }), "customer-luxury-classic");
assert.equal(resolveLogisticsRecommendation({ role: "dealer", "customer-cargo": "multiple-vehicles", "customer-situation": "date-known" }), "shipper-dealer");
assert.equal(resolveLogisticsRecommendation({ role: "broker" }), "broker-carrier-capacity");
assert.equal(resolveLogisticsRecommendation({ role: "driver" }), "driver-careers");
assert.equal(resolveLogisticsRecommendation({ role: "agency-partner" }), "agency-development");
assert.equal(resolveLogisticsRecommendation({ role: "unsure" }), "logistics-guidance");

const ids = new Set(logisticsRecommendations.map((item) => item.id));
const routes = new Set(logisticsRecommendations.map((item) => item.route));
assert.equal(ids.size, logisticsRecommendations.length, "Recommendation ids must be unique");
assert.equal(routes.size, logisticsRecommendations.length, "Recommendation routes must be unique");
assert.ok(logisticsRecommendations.every((item) => item.route.startsWith("/paths/logistics/") && item.route.endsWith("/")));
assert.ok(logisticsRecommendations.every((item) => item.summary.length >= 80 && item.included.length >= 4 && item.nextSteps.length >= 3));
assert.equal(logisticsPathNodes["carrier-situation"].helperText.includes("MC, DOT"), true);
assert.equal(logisticsPathNodes.equipment.selectionMode, "multiple");

console.log("Hermes Path Engine unit checks passed.");
