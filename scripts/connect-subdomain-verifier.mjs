const hasMarker = (markers) => Object.values(markers ?? {}).some(Boolean);
const CONNECT_ROBOTS_URL = "https://connect.hermeslogisticsus.com/robots.txt";
const APEX_SITEMAP_INDEX_URL = "https://hermeslogisticsus.com/sitemapindex.xml";

function requiredHealthyObservationCount(totalCount) {
  return Math.min(totalCount, Math.max(3, Math.ceil(totalCount * 0.8)));
}

export function classifyConnectObservations(observations, expectation) {
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new Error("Connect verification requires at least one observation.");
  }

  const healthyObservations = observations.filter(
    (observation) => observation?.status === 200 && !observation?.error,
  );
  const requiredHealthyCount = requiredHealthyObservationCount(observations.length);
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

export function classifyConnectRootAssetObservations(observations) {
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new Error("Connect root-asset verification requires at least one observation.");
  }

  const healthyObservations = observations.filter((observation) => (
    observation?.status === 200
    && !observation?.error
    && observation?.finalUrl === CONNECT_ROBOTS_URL
    && observation?.contentType?.toLowerCase().startsWith("text/plain")
    && /^User-agent:\s*\*/mi.test(observation?.body ?? "")
    && (observation?.body ?? "").includes(`Sitemap: ${APEX_SITEMAP_INDEX_URL}`)
  ));
  const requiredHealthyCount = requiredHealthyObservationCount(observations.length);

  return {
    classification: healthyObservations.length >= requiredHealthyCount
      ? "ROOT_ASSET_HEALTHY"
      : "ROOT_ASSET_UNHEALTHY",
    healthyCount: healthyObservations.length,
    failureCount: observations.length - healthyObservations.length,
    requiredHealthyCount,
    totalCount: observations.length,
  };
}

export function canShortCircuitConnectVerification({
  expectation,
  classification,
  rootAssetClassification,
}) {
  if (classification === "UNRESOLVED_NETWORK_ACCESS") return false;
  if (classification === "LIVE_UNKNOWN_CONTENT") return false;
  if (classification === "LIVE_MIXED_CONNECT_STATE") return false;
  if (expectation === "approved_web_app") {
    return classification === "LIVE_APPROVED_WEB_APP"
      && rootAssetClassification === "ROOT_ASSET_HEALTHY";
  }
  if (expectation === "isolation") return classification === "LIVE_PREVIOUS_CONNECT";
  if (expectation === "release_pending") {
    return classification === "LIVE_PREVIOUS_CONNECT" || classification === "LIVE_APPROVED_WEB_APP";
  }
  return false;
}

export function connectVerificationExitCode({
  expectation,
  classification,
  rootAssetClassification,
}) {
  if (classification === "UNRESOLVED_NETWORK_ACCESS") return 3;
  if (classification === "LIVE_UNKNOWN_CONTENT") return 5;
  if (classification === "LIVE_MIXED_CONNECT_STATE") return 6;
  if (expectation === "isolation" && classification === "LIVE_PR_HEAD_EXPOSED") return 2;
  if (expectation === "approved_web_app" && classification !== "LIVE_APPROVED_WEB_APP") return 4;
  if (expectation === "approved_web_app" && rootAssetClassification !== "ROOT_ASSET_HEALTHY") return 7;
  return 0;
}
