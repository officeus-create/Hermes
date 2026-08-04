export const connectCurrentMarkers = [
  "Hermes Connect Web App · Request Access",
  "One clear client path for",
  "Request Web App access",
  "Hermes Connect · web-first product",
];

export const connectPreviousMarkers = [
  "Hermes Connect · Profile & Availability v0.3",
  "Hermes Connect — Profile and Availability Workspace",
  "Create specialist profile",
  "Profile preview ready",
];

export const overviewCurrentMarkers = [
  "Hermes Connect Web App for Service Businesses",
  "Give clients one clear place to understand, choose, and request your service.",
  "https://connect.hermeslogisticsus.com/#apply",
];

function markerCount(markers = {}) {
  return Object.values(markers).filter(Boolean).length;
}

function requestHealthy(result) {
  return result?.status === 200 && !result?.error;
}

export function classifyConnectDeployment({ expectation, observations }) {
  if (!Array.isArray(observations) || observations.length === 0) {
    return "UNRESOLVED_NETWORK_ACCESS";
  }

  if (expectation === "isolation") {
    const allHealthy = observations.every((observation) => requestHealthy(observation.connect));
    if (!allHealthy) return "UNRESOLVED_NETWORK_ACCESS";
    if (observations.some((observation) => markerCount(observation.connect?.currentMarkers) === connectCurrentMarkers.length)) {
      return "LIVE_CURRENT_CONNECT";
    }
    if (observations.some((observation) => markerCount(observation.connect?.previousMarkers) > 0)) {
      return "LIVE_PREVIOUS_CONNECT";
    }
    return "LIVE_UNKNOWN_CONTENT";
  }

  if (expectation !== "release") return "INVALID_EXPECTATION";

  const stableWindow = observations.slice(-Math.min(3, observations.length));
  const allRequestsHealthy = stableWindow.every(
    (observation) => requestHealthy(observation.connect) && requestHealthy(observation.overview),
  );
  if (!allRequestsHealthy) return "UNRESOLVED_NETWORK_ACCESS";

  const connectCurrent = stableWindow.every(
    (observation) => markerCount(observation.connect?.currentMarkers) === connectCurrentMarkers.length,
  );
  const connectPrevious = stableWindow.some(
    (observation) => markerCount(observation.connect?.previousMarkers) > 0,
  );
  const overviewCurrent = stableWindow.every(
    (observation) => markerCount(observation.overview?.currentMarkers) === overviewCurrentMarkers.length,
  );

  if (connectCurrent && overviewCurrent && !connectPrevious) return "LIVE_RELEASE_CURRENT";
  if (connectPrevious) return "LIVE_RELEASE_STALE_CONNECT";
  if (!overviewCurrent) return "LIVE_RELEASE_STALE_OVERVIEW";
  return "LIVE_RELEASE_UNKNOWN";
}

export function exitCodeForClassification(classification) {
  if (["LIVE_CURRENT_CONNECT", "LIVE_PREVIOUS_CONNECT", "LIVE_UNKNOWN_CONTENT", "LIVE_RELEASE_CURRENT"].includes(classification)) return 0;
  if (classification === "UNRESOLVED_NETWORK_ACCESS") return 3;
  if (classification === "INVALID_EXPECTATION") return 4;
  return 5;
}
