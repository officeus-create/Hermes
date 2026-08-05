import fs from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("artifacts");
const jsonPath = path.join(outputDir, "production-custom-domain-check.json");
const markdownPath = path.join(outputDir, "production-custom-domain-check.md");
const baseUrl = "https://hermeslogisticsus.com";

await import("./check-production-custom-domain.mjs");

const result = JSON.parse(await fs.readFile(jsonPath, "utf8"));
let markdown = await fs.readFile(markdownPath, "utf8");

const additionalStaleMarkers = [
  "Your information was not sent or stored",
  "Contact delivery is not connected",
  "contact delivery is not connected",
];

let homepageBody = "";
let supplementaryError = null;
try {
  const response = await fetch(`${baseUrl}/?production-domain-command=${Date.now()}`, {
    redirect: "follow",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": "HermesProductionIssueVerifier/1.0 (+public read-only check)",
    },
    signal: AbortSignal.timeout(20_000),
  });
  homepageBody = await response.text();
  if (response.status !== 200) supplementaryError = `Supplementary homepage status ${response.status}`;
} catch (error) {
  supplementaryError = error instanceof Error ? error.message : String(error);
}

const additionalChecks = Object.fromEntries(
  additionalStaleMarkers.map((marker) => [marker, homepageBody.includes(marker)]),
);
const additionalPresent = Object.entries(additionalChecks)
  .filter(([, present]) => present)
  .map(([marker]) => marker);

result.homepage.additionalStaleMarkerChecks = additionalChecks;
result.homepage.additionalPresentStaleMarkers = additionalPresent;
result.homepage.supplementaryError = supplementaryError;

if (supplementaryError) {
  result.classification = "UNRESOLVED_NETWORK_ACCESS";
  result.classificationReasons.push(`Supplementary homepage check failed: ${supplementaryError}`);
} else if (additionalPresent.length > 0) {
  result.classification = "LIVE_STALE_DEPLOYMENT";
  result.classificationReasons.push(
    `Additional stale homepage markers are present: ${additionalPresent.join(" | ")}`,
  );
} else if (result.classification === "LIVE_CURRENT") {
  result.classification = "LIVE_CURRENT_CRAWL_STALE";
  result.classificationReasons.push(
    "The live custom domain is current; the previously recorded bounded crawl snapshot is stale. Authenticated Search Console and Bing inspection remains tracked in Issue #206.",
  );
}

markdown = markdown.replace(
  /- Classification: \*\*[^*]+\*\*/,
  `- Classification: **${result.classification}**`,
);
markdown += [
  "",
  "## Supplementary stale-copy check",
  "",
  ...Object.entries(additionalChecks).map(
    ([marker, present]) => `- ${present ? "⚠️ present" : "✅ absent"}: \`${marker}\``,
  ),
  supplementaryError ? `- Supplementary request error: \`${supplementaryError}\`` : "- Supplementary homepage request completed.",
  "",
  "## Issue #220 classification",
  "",
  `- Final classification: **${result.classification}**`,
  ...result.classificationReasons.map((reason) => `- ${reason}`),
  "",
].join("\n");

await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(markdownPath, markdown);
console.log(markdown);

const exitCodes = {
  LIVE_CURRENT_CRAWL_STALE: 0,
  LIVE_STALE_DEPLOYMENT: 4,
  MIXED_EDGE_OR_CACHE_STATE: 5,
  CUSTOM_DOMAIN_ASSIGNMENT_MISMATCH: 6,
  UNRESOLVED_NETWORK_ACCESS: 3,
};
process.exitCode = exitCodes[result.classification] ?? 7;
