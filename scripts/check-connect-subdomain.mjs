import fs from "node:fs/promises";
import path from "node:path";

const targetUrl = "https://connect.hermeslogisticsus.com/";
const outputDir = path.resolve("artifacts");
const expectation = process.env.CONNECT_EXPECTATION === "approved_web_app"
  ? "approved_web_app"
  : "isolation";
const attempts = Number.parseInt(process.env.CONNECT_CHECK_ATTEMPTS || "6", 10);
const delayMs = Number.parseInt(process.env.CONNECT_CHECK_DELAY_MS || "10000", 10);

if (!Number.isInteger(attempts) || attempts < 1 || attempts > 24) {
  throw new Error("CONNECT_CHECK_ATTEMPTS must be an integer between 1 and 24.");
}
if (!Number.isInteger(delayMs) || delayMs < 1000 || delayMs > 30000) {
  throw new Error("CONNECT_CHECK_DELAY_MS must be an integer between 1000 and 30000.");
}

const webAppMarkers = [
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
        "user-agent": "HermesConnectReleaseVerifier/1.1 (+public read-only deployment check)",
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
  const liveWebAppMarkers = Object.fromEntries(webAppMarkers.map((marker) => [marker, fetched.body.includes(marker)]));
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
    webAppMarkers: liveWebAppMarkers,
    previousMarkers: oldMarkers,
    error: fetched.error,
  });
  if (attempt < attempts) await sleep(delayMs);
}

const anyWebAppVisible = observations.some((observation) =>
  Object.values(observation.webAppMarkers).some(Boolean),
);
const anyPreviousVisible = observations.some((observation) =>
  Object.values(observation.previousMarkers).some(Boolean),
);
const allRequestsHealthy = observations.every((observation) => observation.status === 200 && !observation.error);

let classification = "LIVE_UNKNOWN_CONTENT";
if (!allRequestsHealthy) classification = "UNRESOLVED_NETWORK_ACCESS";
else if (expectation === "approved_web_app" && anyWebAppVisible) classification = "LIVE_APPROVED_WEB_APP";
else if (expectation === "isolation" && anyWebAppVisible) classification = "LIVE_PR_HEAD_EXPOSED";
else if (anyPreviousVisible) classification = "LIVE_PREVIOUS_CONNECT";

const result = {
  checkedAt: new Date().toISOString(),
  targetUrl,
  expectation,
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
const interpretation = classification === "LIVE_APPROVED_WEB_APP"
  ? "- The custom subdomain serves the approved web-only Hermes Connect release."
  : classification === "LIVE_PR_HEAD_EXPOSED"
    ? "- The custom subdomain exposed at least one Web App marker from an unmerged pull request during the observation window. Treat preview/production isolation as failed until Cloudflare configuration is corrected."
    : classification === "LIVE_PREVIOUS_CONNECT"
      ? expectation === "approved_web_app"
        ? "- The approved release has not reached the custom subdomain; the previous Hermes Connect experience is still live."
        : "- The custom subdomain continued to serve the previous Hermes Connect experience during the observation window. This supports preview isolation for this specific check, but authenticated Cloudflare branch/binding inventory is still required."
      : classification === "UNRESOLVED_NETWORK_ACCESS"
        ? "- At least one required public request failed; no deployment conclusion is safe."
        : "- The subdomain returned healthy but unrecognized content. Inspect the sanitized artifact before drawing a deployment conclusion.";

const markdown = [
  "# Hermes Connect custom-domain verification",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Target: ${targetUrl}`,
  `- Expected state: **${expectation}**`,
  `- Classification: **${classification}**`,
  `- HTTP status: ${last?.status ?? "unavailable"}`,
  `- Final URL: ${last?.finalUrl ?? "unavailable"}`,
  `- Last observed title: ${last?.title ?? "unavailable"}`,
  `- Cloudflare cache status: ${last?.cacheStatus ?? "not exposed"}`,
  "",
  "## Interpretation",
  "",
  interpretation,
  "",
  "## Observations",
  "",
  "| Attempt | Status | Title | Web App marker visible | Previous marker visible |",
  "| ---: | ---: | --- | --- | --- |",
  ...observations.map((observation) => `| ${observation.attempt} | ${observation.status ?? "—"} | ${observation.title ?? "—"} | ${Object.values(observation.webAppMarkers).some(Boolean) ? "yes" : "no"} | ${Object.values(observation.previousMarkers).some(Boolean) ? "yes" : "no"} |`),
  "",
  "> Read-only public verification. No application, account, booking, payment, subscription, cookie, credential, or private infrastructure identifier was created or accessed.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "connect-subdomain-isolation.md"), markdown);
console.log(markdown);

if (classification === "UNRESOLVED_NETWORK_ACCESS") process.exitCode = 3;
if (expectation === "isolation" && classification === "LIVE_PR_HEAD_EXPOSED") process.exitCode = 2;
if (expectation === "approved_web_app" && classification !== "LIVE_APPROVED_WEB_APP") process.exitCode = 4;
