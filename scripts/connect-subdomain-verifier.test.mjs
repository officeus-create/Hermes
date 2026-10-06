import assert from "node:assert/strict";
import * as connectVerifier from "./connect-subdomain-verifier.mjs";

const {
  classifyConnectObservations,
  classifyConnectRootAssetObservations,
  canShortCircuitConnectVerification,
  connectVerificationExitCode,
} = connectVerifier;

assert.equal(
  typeof classifyConnectRootAssetObservations,
  "function",
  "Connect verification must expose a root-asset quorum classifier",
);
assert.equal(
  typeof connectVerificationExitCode,
  "function",
  "Connect verification must expose its release acceptance decision",
);
assert.equal(
  typeof canShortCircuitConnectVerification,
  "function",
  "Connect verification must expose a stable-quorum short-circuit decision",
);

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

const healthyRobots = () => ({
  status: 200,
  finalUrl: "https://connect.hermeslogisticsus.com/robots.txt",
  contentType: "text/plain; charset=utf-8",
  body: "User-agent: *\nAllow: /\nSitemap: https://hermeslogisticsus.com/sitemapindex.xml\n",
  error: null,
});
const missingRobots = () => ({
  status: 404,
  finalUrl: "https://connect.hermeslogisticsus.com/robots.txt",
  contentType: "text/html; charset=utf-8",
  body: "Not found",
  error: null,
});

const robotsHealthy = classifyConnectRootAssetObservations([
  ...Array.from({ length: 5 }, healthyRobots),
  networkFailure(),
]);
assert.equal(robotsHealthy.classification, "ROOT_ASSET_HEALTHY");
assert.equal(robotsHealthy.healthyCount, 5);
assert.equal(robotsHealthy.requiredHealthyCount, 5);

const robotsMissing = classifyConnectRootAssetObservations([
  ...Array.from({ length: 5 }, missingRobots),
  healthyRobots(),
]);
assert.equal(robotsMissing.classification, "ROOT_ASSET_UNHEALTHY");
assert.equal(robotsMissing.healthyCount, 1);

const wrongContent = classifyConnectRootAssetObservations([
  ...Array.from({ length: 6 }, () => ({
    ...healthyRobots(),
    contentType: "text/html; charset=utf-8",
    body: "<html><title>Not robots</title></html>",
  })),
]);
assert.equal(wrongContent.classification, "ROOT_ASSET_UNHEALTHY");

const redirectedRobots = classifyConnectRootAssetObservations([
  ...Array.from({ length: 6 }, () => ({
    ...healthyRobots(),
    finalUrl: "https://hermeslogisticsus.com/robots.txt",
  })),
]);
assert.equal(redirectedRobots.classification, "ROOT_ASSET_UNHEALTHY");

assert.equal(connectVerificationExitCode({
  expectation: "approved_web_app",
  classification: "LIVE_APPROVED_WEB_APP",
  rootAssetClassification: "ROOT_ASSET_HEALTHY",
}), 0);
assert.equal(connectVerificationExitCode({
  expectation: "approved_web_app",
  classification: "LIVE_APPROVED_WEB_APP",
  rootAssetClassification: "ROOT_ASSET_UNHEALTHY",
}), 7);
assert.equal(connectVerificationExitCode({
  expectation: "release_pending",
  classification: "LIVE_PREVIOUS_CONNECT",
  rootAssetClassification: "ROOT_ASSET_UNHEALTHY",
}), 0);
assert.equal(connectVerificationExitCode({
  expectation: "approved_web_app",
  classification: "LIVE_PREVIOUS_CONNECT",
  rootAssetClassification: "ROOT_ASSET_HEALTHY",
}), 4);

assert.equal(canShortCircuitConnectVerification({
  expectation: "approved_web_app",
  classification: "LIVE_APPROVED_WEB_APP",
  rootAssetClassification: "ROOT_ASSET_HEALTHY",
}), true);
assert.equal(canShortCircuitConnectVerification({
  expectation: "approved_web_app",
  classification: "LIVE_APPROVED_WEB_APP",
  rootAssetClassification: "ROOT_ASSET_UNHEALTHY",
}), false);
assert.equal(canShortCircuitConnectVerification({
  expectation: "approved_web_app",
  classification: "LIVE_MIXED_CONNECT_STATE",
  rootAssetClassification: "ROOT_ASSET_HEALTHY",
}), false);
assert.equal(canShortCircuitConnectVerification({
  expectation: "isolation",
  classification: "LIVE_PREVIOUS_CONNECT",
  rootAssetClassification: "ROOT_ASSET_UNHEALTHY",
}), true);
assert.equal(canShortCircuitConnectVerification({
  expectation: "isolation",
  classification: "LIVE_PR_HEAD_EXPOSED",
  rootAssetClassification: "ROOT_ASSET_HEALTHY",
}), false);

console.log("Connect subdomain verifier quorum contract passed.");
