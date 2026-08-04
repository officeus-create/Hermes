import fs from "node:fs/promises";
import path from "node:path";

const targetUrl = "https://connect.hermeslogisticsus.com/";
const outputDir = path.resolve("artifacts");
const attempts = 6;
const delayMs = 10_000;

const prHeadMarkers = [
  "Hermes Connect Web App · Request Access",
  "One clear client path for",
  "Request Web App access",
  "Hermes Connect · web-first product",
];

const previousMarkers = [
  "Hermes Connect · Profile & Availability v0.3",
  "Hermes Connect — Profile and Availability Workspace",
  "Create specialist profile",
  "Profile preview ready",
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchPublic() {
  const startedAt = Date.now();
  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent": "HermesConnectIsolationVerifier/1.0 (+public read-only deployment check)",
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

const observations = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const fetched = await fetchPublic();
  const prMarkers = Object.fromEntries(prHeadMarkers.map((marker) => [marker, fetched.body.includes(marker)]));
  const oldMarkers = Object.fromEntries(previousMarkers.map((marker) => [marker, fetched.body.includes(marker)]));
  const title = fetched.body.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || null;
  observations.push({
    attempt,
    checkedAt: new Date().toISOString(),
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    contentType: fetched.contentType,
    cacheStatus: fetched.cacheStatus,
    age: fetched.age,
    durationMs: fetched.durationMs,
    title,
    prMarkers,
    previousMarkers: oldMarkers,
    error: fetched.error,
  });
  if (attempt < attempts) await sleep(delayMs);
}

const anyPrHeadVisible = observations.some((observation) =>
  Object.values(observation.prMarkers).some(Boolean),
);
const anyPreviousVisible = observations.some((observation) =>
  Object.values(observation.previousMarkers).some(Boolean),
);
const allRequestsHealthy = observations.every((observation) => observation.status === 200 && !observation.error);

let classification = "LIVE_UNKNOWN_CONTENT";
if (!allRequestsHealthy) classification = "UNRESOLVED_NETWORK_ACCESS";
else if (anyPrHeadVisible) classification = "LIVE_PR_HEAD_EXPOSED";
else if (anyPreviousVisible) classification = "LIVE_PREVIOUS_CONNECT";

const result = {
  checkedAt: new Date().toISOString(),
  targetUrl,
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
const markdown = [
  "# Hermes Connect subdomain isolation check",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Target: ${targetUrl}`,
  `- Classification: **${classification}**`,
  `- HTTP status: ${last?.status ?? "unavailable"}`,
  `- Final URL: ${last?.finalUrl ?? "unavailable"}`,
  `- Last observed title: ${last?.title ?? "unavailable"}`,
  `- Cloudflare cache status: ${last?.cacheStatus ?? "not exposed"}`,
  "",
  "## Interpretation",
  "",
  classification === "LIVE_PR_HEAD_EXPOSED"
    ? "- The custom subdomain exposed at least one unique Web App marker from the current draft PR head during the observation window. Treat preview/production isolation as failed until Cloudflare configuration is corrected."
    : classification === "LIVE_PREVIOUS_CONNECT"
      ? "- The custom subdomain continued to serve the previous Hermes Connect experience during the observation window. This supports preview isolation for this specific check, but authenticated Cloudflare branch/binding inventory is still required."
      : classification === "UNRESOLVED_NETWORK_ACCESS"
        ? "- At least one required public request failed; no deployment conclusion is safe."
        : "- The subdomain returned healthy but unrecognized content. Inspect the sanitized artifact before drawing a deployment conclusion.",
  "",
  "## Observations",
  "",
  "| Attempt | Status | Title | Web App PR marker visible | Previous marker visible |",
  "| ---: | ---: | --- | --- | --- |",
  ...observations.map((observation) => `| ${observation.attempt} | ${observation.status ?? "—"} | ${observation.title ?? "—"} | ${Object.values(observation.prMarkers).some(Boolean) ? "yes" : "no"} | ${Object.values(observation.previousMarkers).some(Boolean) ? "yes" : "no"} |`),
  "",
  "> Read-only public verification. No application, account, booking, payment, subscription, cookie, credential, or private infrastructure identifier was created or accessed.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "connect-subdomain-isolation.md"), markdown);
console.log(markdown);

if (classification === "LIVE_PR_HEAD_EXPOSED") process.exitCode = 2;
if (classification === "UNRESOLVED_NETWORK_ACCESS") process.exitCode = 3;
