import assert from "node:assert/strict";
import {
  classifyConnectDeployment,
  connectCurrentMarkers,
  connectPreviousMarkers,
  exitCodeForClassification,
  overviewCurrentMarkers,
} from "./connect-deployment-state.mjs";

const markerMap = (markers, found = true) => Object.fromEntries(markers.map((marker) => [marker, found]));
const healthy = (currentMarkers, previousMarkers = {}) => ({
  status: 200,
  error: null,
  currentMarkers,
  previousMarkers,
});
const observation = ({ connectCurrent = false, connectPrevious = false, overviewCurrent = false } = {}) => ({
  connect: healthy(
    markerMap(connectCurrentMarkers, connectCurrent),
    markerMap(connectPreviousMarkers, connectPrevious),
  ),
  overview: healthy(markerMap(overviewCurrentMarkers, overviewCurrent)),
});

assert.equal(
  classifyConnectDeployment({ expectation: "isolation", observations: [observation({ connectPrevious: true })] }),
  "LIVE_PREVIOUS_CONNECT",
);
assert.equal(
  classifyConnectDeployment({ expectation: "isolation", observations: [observation({ connectCurrent: true })] }),
  "LIVE_CURRENT_CONNECT",
);
assert.equal(
  classifyConnectDeployment({
    expectation: "release",
    observations: Array.from({ length: 3 }, () => observation({ connectCurrent: true, overviewCurrent: true })),
  }),
  "LIVE_RELEASE_CURRENT",
);
assert.equal(
  classifyConnectDeployment({
    expectation: "release",
    observations: Array.from({ length: 3 }, () => observation({ connectPrevious: true, overviewCurrent: true })),
  }),
  "LIVE_RELEASE_STALE_CONNECT",
);
assert.equal(
  classifyConnectDeployment({
    expectation: "release",
    observations: Array.from({ length: 3 }, () => observation({ connectCurrent: true, overviewCurrent: false })),
  }),
  "LIVE_RELEASE_STALE_OVERVIEW",
);
assert.equal(
  classifyConnectDeployment({
    expectation: "release",
    observations: [{ connect: { status: null, error: "timeout" }, overview: healthy(markerMap(overviewCurrentMarkers)) }],
  }),
  "UNRESOLVED_NETWORK_ACCESS",
);
assert.equal(exitCodeForClassification("LIVE_RELEASE_CURRENT"), 0);
assert.equal(exitCodeForClassification("LIVE_RELEASE_STALE_CONNECT"), 5);
assert.equal(exitCodeForClassification("UNRESOLVED_NETWORK_ACCESS"), 3);

console.log("Hermes Connect deployment state classifications passed.");
