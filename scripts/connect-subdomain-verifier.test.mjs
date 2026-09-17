import assert from "node:assert/strict";
import { classifyConnectObservations } from "./connect-subdomain-verifier.mjs";

const webApp = () => ({
  status: 200,
  error: null,
  webAppMarkers: { "AI Operating System": true },
  previousMarkers: { "Profile preview ready": false },
});
const previous = () => ({
  status: 200,
  error: null,
  webAppMarkers: { "AI Operating System": false },
  previousMarkers: { "Profile preview ready": true },
});
const unknown = () => ({
  status: 200,
  error: null,
  webAppMarkers: { "AI Operating System": false },
  previousMarkers: { "Profile preview ready": false },
});
const networkFailure = () => ({
  status: null,
  error: "fetch failed",
  webAppMarkers: {},
  previousMarkers: {},
});

const resilient = classifyConnectObservations(
  [...Array.from({ length: 21 }, webApp), ...Array.from({ length: 3 }, networkFailure)],
  "approved_web_app",
);
assert.equal(resilient.classification, "LIVE_APPROVED_WEB_APP");
assert.equal(resilient.healthyCount, 21);
assert.equal(resilient.networkFailureCount, 3);
assert.equal(resilient.requiredHealthyCount, 20);

const degraded = classifyConnectObservations(
  [...Array.from({ length: 19 }, webApp), ...Array.from({ length: 5 }, networkFailure)],
  "approved_web_app",
);
assert.equal(degraded.classification, "UNRESOLVED_NETWORK_ACCESS");

const mixed = classifyConnectObservations(
  [...Array.from({ length: 5 }, webApp), previous()],
  "approved_web_app",
);
assert.equal(mixed.classification, "LIVE_MIXED_CONNECT_STATE");

const unrecognized = classifyConnectObservations(
  [...Array.from({ length: 5 }, webApp), unknown()],
  "approved_web_app",
);
assert.equal(unrecognized.classification, "LIVE_UNKNOWN_CONTENT");

const isolation = classifyConnectObservations(Array.from({ length: 6 }, webApp), "isolation");
assert.equal(isolation.classification, "LIVE_PR_HEAD_EXPOSED");

const previousOnly = classifyConnectObservations(Array.from({ length: 6 }, previous), "approved_web_app");
assert.equal(previousOnly.classification, "LIVE_PREVIOUS_CONNECT");

console.log("Connect subdomain verifier quorum contract passed.");
