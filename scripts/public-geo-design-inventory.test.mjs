import assert from "node:assert/strict";
import {
  classifyPublicRoute,
  isConnectPrivateRoute,
  publicGeoDesignExecutionOrder,
  publicGeoDesignGuardrails,
} from "../src/data/public-geo-design-inventory.ts";

const privateConnectRoutes = [
  "/services/hermes-connect/repair-shops/auth/",
  "/services/hermes-connect/repair-shops/booking/",
  "/services/hermes-connect/repair-shops/customers/",
  "/services/hermes-connect/repair-shops/dashboard/",
  "/services/hermes-connect/academy/auth/",
  "/services/hermes-connect/academy/dashboard/",
  "/services/hermes-connect/academy/reviewer/",
  "/services/hermes-connect/academy/submissions/",
];

for (const route of privateConnectRoutes) {
  assert.equal(isConnectPrivateRoute(route), true, `${route} must remain outside the public GEO/design stream`);
  const state = classifyPublicRoute(route);
  assert.equal(state.surfaceClass, "connect_private_excluded");
  assert.equal(state.action, "do_not_modify");
}

for (const route of [
  "/services/hermes-connect/",
  "/services/hermes-connect/repair-shops/",
  "/services/hermes-connect/ai-command-center/",
]) {
  const state = classifyPublicRoute(route);
  assert.equal(state.family, "hermes_connect_public");
  assert.equal(state.action, "truth_review_only");
}

for (const route of ["/demos/ai-visibility-scorecard/", "/demos/content-pipeline/"]) {
  const state = classifyPublicRoute(route);
  assert.equal(state.surfaceClass, "demo_preview");
  assert.notEqual(state.action, "audit_and_converge");
}

for (const route of ["/", "/paths/logistics/", "/paths/marketing/", "/paths/academy/", "/paths/technology/"]) {
  const state = classifyPublicRoute(route);
  assert.equal(state.surfaceClass, "public_indexable");
  assert.notEqual(state.action, "do_not_modify");
}

assert.equal(publicGeoDesignExecutionOrder[0], "home");
assert.ok(publicGeoDesignExecutionOrder.includes("hermes_connect_public"));
assert.match(publicGeoDesignGuardrails.connectBoundary, /application code is excluded/i);
assert.match(publicGeoDesignGuardrails.visualApproval, /390px/i);

console.log("public GEO/design inventory boundary: OK");
