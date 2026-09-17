const hasMarker = (markers) => Object.values(markers ?? {}).some(Boolean);

export function classifyConnectObservations(observations, expectation) {
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new Error("Connect verification requires at least one observation.");
  }

  const healthyObservations = observations.filter(
    (observation) => observation?.status === 200 && !observation?.error,
  );
  const requiredHealthyCount = Math.min(
    observations.length,
    Math.max(3, Math.ceil(observations.length * 0.8)),
  );
  const networkFailureCount = observations.length - healthyObservations.length;

  const anyWebAppVisible = healthyObservations.some((observation) => hasMarker(observation.webAppMarkers));
  const anyPreviousVisible = healthyObservations.some((observation) => hasMarker(observation.previousMarkers));
  const anyUnknownHealthyContent = healthyObservations.some(
    (observation) => !hasMarker(observation.webAppMarkers) && !hasMarker(observation.previousMarkers),
  );
  const allHealthyWebApp = healthyObservations.length > 0
    && healthyObservations.every((observation) => hasMarker(observation.webAppMarkers));
  const allHealthyPrevious = healthyObservations.length > 0
    && healthyObservations.every((observation) => hasMarker(observation.previousMarkers));

  let classification = "LIVE_UNKNOWN_CONTENT";
  if (healthyObservations.length < requiredHealthyCount) {
    classification = "UNRESOLVED_NETWORK_ACCESS";
  } else if (anyWebAppVisible && anyPreviousVisible) {
    classification = "LIVE_MIXED_CONNECT_STATE";
  } else if (anyUnknownHealthyContent) {
    classification = "LIVE_UNKNOWN_CONTENT";
  } else if (allHealthyWebApp && expectation === "isolation") {
    classification = "LIVE_PR_HEAD_EXPOSED";
  } else if (allHealthyWebApp) {
    classification = "LIVE_APPROVED_WEB_APP";
  } else if (allHealthyPrevious) {
    classification = "LIVE_PREVIOUS_CONNECT";
  }

  return {
    classification,
    healthyCount: healthyObservations.length,
    networkFailureCount,
    requiredHealthyCount,
    totalCount: observations.length,
  };
}
