import fs from "node:fs/promises";
import path from "node:path";
import {
  classifyConnectDeployment,
  connectCurrentMarkers,
  connectPreviousMarkers,
  exitCodeForClassification,
  overviewCurrentMarkers,
} from "./connect-deployment-state.mjs";

const connectUrl = "https://connect.hermeslogisticsus.com/";
const overviewUrl = "https://hermeslogisticsus.com/services/hermes-connect/";
const outputDir = path.resolve("artifacts");
const expectation = process.env.CONNECT_EXPECTATION || "isolation";
const releaseMode = expectation === "release";
const attempts = releaseMode ? 16 : 6;
const delayMs = releaseMode ? 15_000 : 10_000;

if (!["isolation", "release"].includes(expectation)) {
  console.error(`Unsupported CONNECT_EXPECTATION: ${expectation}`);
  process.exit(4);
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchPublic(url) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent": "HermesConnectDeploymentVerifier/2.0 (+public read-only deployment check)",
      },
      signal: AbortSignal.timeout(20_000),
    });
    return {
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      cacheStatus: response.headers.get("cf-cache-status"),
      age: response.headers.get("age"),
      durationMs: Date.now() - startedAt,
      body: await response.text(),
      error: null,
    };
  } catch (error) {
    return {
      status: null,
      finalUrl: null,
      contentType: null,
      cacheStatus: null,
      age: null,
      durationMs: Date.now() - startedAt,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function inspectFetched(fetched, currentMarkers, previousMarkers = []) {
  return {
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    contentType: fetched.contentType,
    cacheStatus: fetched.cacheStatus,
    age: fetched.age,
    durationMs: fetched.durationMs,
    title: fetched.body.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || null,
    currentMarkers: Object.fromEntries(currentMarkers.map((marker) => [marker, fetched.body.includes(marker)])),
    previousMarkers: Object.fromEntries(previousMarkers.map((marker) => [marker, fetched.body.includes(marker)])),
    error: fetched.error,
  };
}

const observations = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const [connectFetch, overviewFetch] = await Promise.all([
    fetchPublic(connectUrl),
    fetchPublic(overviewUrl),
  ]);
  observations.push({
    attempt,
    checkedAt: new Date().toISOString(),
    connect: inspectFetched(connectFetch, connectCurrentMarkers, connectPreviousMarkers),
    overview: inspectFetched(overviewFetch, overviewCurrentMarkers),
  });
  if (attempt < attempts) await sleep(delayMs);
}

const classification = classifyConnectDeployment({ expectation, observations });
const result = {
  checkedAt: new Date().toISOString(),
  expectation,
  connectUrl,
  overviewUrl,
  classification,
  observations,
  boundaries: {
    publicGetOnly: true,
    noFormsSubmitted: true,
    noCookiesUsed: true,
    noCredentialsUsed: true,
    noPrivateDataCollected: true,
    note: "This check identifies public HTML markers only. It does not reveal Cloudflare account, project, route, deployment, binding, or secret identifiers.",
  },
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  path.join(outputDir, "connect-subdomain-isolation.json"),
  `${JSON.stringify(result, null, 2)}\n`,
);

const last = observations.at(-1);
const interpretation = {
  LIVE_CURRENT_CONNECT: "The public Connect domain serves the approved Web App baseline. Preview observation remains healthy.",
  LIVE_PREVIOUS_CONNECT: "The public Connect domain still serves the previous v0.3 experience. Preview observation is healthy, but the Web App release is not yet live.",
  LIVE_UNKNOWN_CONTENT: "The public Connect domain is reachable but its content does not match a controlled baseline.",
  LIVE_RELEASE_CURRENT: "The Connect Web App and the indexed Hermes product overview were both stable and current for the final three observations.",
  LIVE_RELEASE_STALE_CONNECT: "The main-site overview may be current, but the Connect subdomain still serves the previous v0.3 experience.",
  LIVE_RELEASE_STALE_OVERVIEW: "The Connect subdomain may be current, but the indexed Hermes product overview is not yet serving all approved release markers.",
  LIVE_RELEASE_UNKNOWN: "Both URLs are reachable, but the final stable window does not match the approved release contract.",
  UNRESOLVED_NETWORK_ACCESS: "At least one required public request failed in the required observation window; no deployment conclusion is safe.",
  INVALID_EXPECTATION: "The workflow supplied an unsupported verification mode.",
}[classification] || "Inspect the sanitized artifact before drawing a deployment conclusion.";

const markdown = [
  "# Hermes Connect deployment verification",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Expectation: **${expectation}**`,
  `- Classification: **${classification}**`,
  `- Connect URL: ${connectUrl}`,
  `- Connect status/title: ${last?.connect.status ?? "unavailable"} · ${last?.connect.title ?? "unavailable"}`,
  `- Overview URL: ${overviewUrl}`,
  `- Overview status/title: ${last?.overview.status ?? "unavailable"} · ${last?.overview.title ?? "unavailable"}`,
  "",
  "## Interpretation",
  "",
  `- ${interpretation}`,
  "",
  "## Observations",
  "",
  "| Attempt | Connect | Connect title | Current Web App | Old v0.3 | Overview | Current overview |",
  "| ---: | ---: | --- | --- | --- | ---: | --- |",
  ...observations.map((observation) => {
    const connectCurrent = Object.values(observation.connect.currentMarkers).every(Boolean);
    const connectPrevious = Object.values(observation.connect.previousMarkers).some(Boolean);
    const overviewCurrent = Object.values(observation.overview.currentMarkers).every(Boolean);
    return `| ${observation.attempt} | ${observation.connect.status ?? "—"} | ${observation.connect.title ?? "—"} | ${connectCurrent ? "yes" : "no"} | ${connectPrevious ? "yes" : "no"} | ${observation.overview.status ?? "—"} | ${overviewCurrent ? "yes" : "no"} |`;
  }),
  "",
  "> Read-only public verification. No application, account, booking, payment, subscription, cookie, credential, or private infrastructure identifier was created or accessed.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "connect-subdomain-isolation.md"), markdown);
console.log(markdown);

process.exitCode = exitCodeForClassification(classification);
