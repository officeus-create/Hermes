import fs from "node:fs/promises";
import path from "node:path";

const artifactsDir = path.resolve("artifacts/lighthouse-production");

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const round = (value, digits = 0) => Number(value.toFixed(digits));
const seconds = (ms) => `${round(ms / 1000, 2)}s`;
const milliseconds = (ms) => `${round(ms)}ms`;

const readBreakdown = (report) => {
  const items = report.audits?.["lcp-breakdown-insight"]?.details?.items ?? [];
  const table = items.find((item) => item?.type === "table");
  const rows = table?.items ?? [];
  const value = (subpart) => Number(rows.find((row) => row?.subpart === subpart)?.duration ?? 0);
  return {
    timeToFirstByteMs: value("timeToFirstByte"),
    resourceLoadDelayMs: value("resourceLoadDelay"),
    resourceLoadDurationMs: value("resourceLoadDuration"),
    elementRenderDelayMs: value("elementRenderDelay"),
  };
};

const readRuns = async (prefix) => {
  const files = (await fs.readdir(artifactsDir))
    .filter((name) => name.startsWith(`${prefix}-`) && name.endsWith(".json"))
    .sort();
  if (!files.length) throw new Error(`No ${prefix} Lighthouse reports found`);

  const runs = [];
  for (const file of files) {
    const report = JSON.parse(await fs.readFile(path.join(artifactsDir, file), "utf8"));
    const score = Math.round((report.categories?.performance?.score ?? 0) * 100);
    const audit = (id) => Number(report.audits?.[id]?.numericValue ?? 0);
    runs.push({
      file,
      url: report.finalDisplayedUrl,
      performance: score,
      fcpMs: audit("first-contentful-paint"),
      lcpMs: audit("largest-contentful-paint"),
      speedIndexMs: audit("speed-index"),
      ...readBreakdown(report),
    });
  }

  const metricNames = [
    "performance",
    "fcpMs",
    "lcpMs",
    "speedIndexMs",
    "timeToFirstByteMs",
    "resourceLoadDelayMs",
    "resourceLoadDurationMs",
    "elementRenderDelayMs",
  ];
  const medians = Object.fromEntries(metricNames.map((metric) => [metric, median(runs.map((run) => run[metric]))]));
  return { files, runs, medians };
};

const range = (runs, metric) => {
  const values = runs.map((run) => run[metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max, spread: max - min };
};

const firstVisit = await readRuns("mobile");
const regularHome = await readRuns("regular-mobile");
const first = firstVisit.medians;
const regular = regularHome.medians;
const lcpDeltaMs = first.lcpMs - regular.lcpMs;
const renderDeltaMs = first.elementRenderDelayMs - regular.elementRenderDelayMs;
const firstRenderRange = range(firstVisit.runs, "elementRenderDelayMs");
const regularRenderRange = range(regularHome.runs, "elementRenderDelayMs");
const firstLcpRange = range(firstVisit.runs, "lcpMs");
const regularLcpRange = range(regularHome.runs, "lcpMs");

let interpretation = "The paired modes do not yet isolate a large intro-specific render penalty; keep the result diagnostic and avoid causal production changes from this run alone.";
if (lcpDeltaMs >= 300 && renderDeltaMs >= 300) {
  interpretation = "The first-visit intro lifecycle is a material contributor: both total LCP and element render delay are at least 300ms slower than regular Home in the same runner.";
} else if (lcpDeltaMs >= 300) {
  interpretation = "First-visit LCP is materially slower, but the LCP phase medians do not attribute most of the difference to element render delay; inspect the remaining phases before changing the intro.";
}

const lines = [
  "## First-visit vs regular-home diagnostic",
  "",
  "The regular-home pass uses `/#regular-home-lab`. Current product logic only enables the first-visit intro on `/` when no hash is present, so this preserves the same homepage document while bypassing the intro lifecycle for measurement only.",
  "",
  "| Metric | First visit / intro | Regular Home | Delta first - regular |",
  "|---|---:|---:|---:|",
  `| Performance | ${round(first.performance)} | ${round(regular.performance)} | ${round(first.performance - regular.performance)} |`,
  `| FCP | ${seconds(first.fcpMs)} | ${seconds(regular.fcpMs)} | ${milliseconds(first.fcpMs - regular.fcpMs)} |`,
  `| LCP | **${seconds(first.lcpMs)}** | **${seconds(regular.lcpMs)}** | **${milliseconds(lcpDeltaMs)}** |`,
  `| Speed Index | ${seconds(first.speedIndexMs)} | ${seconds(regular.speedIndexMs)} | ${milliseconds(first.speedIndexMs - regular.speedIndexMs)} |`,
  "",
  "### LCP phase medians",
  "",
  "| Phase | First visit / intro | Regular Home | Delta first - regular |",
  "|---|---:|---:|---:|",
  `| TTFB | ${milliseconds(first.timeToFirstByteMs)} | ${milliseconds(regular.timeToFirstByteMs)} | ${milliseconds(first.timeToFirstByteMs - regular.timeToFirstByteMs)} |`,
  `| Resource load delay | ${milliseconds(first.resourceLoadDelayMs)} | ${milliseconds(regular.resourceLoadDelayMs)} | ${milliseconds(first.resourceLoadDelayMs - regular.resourceLoadDelayMs)} |`,
  `| Resource load duration | ${milliseconds(first.resourceLoadDurationMs)} | ${milliseconds(regular.resourceLoadDurationMs)} | ${milliseconds(first.resourceLoadDurationMs - regular.resourceLoadDurationMs)} |`,
  `| Element render delay | **${milliseconds(first.elementRenderDelayMs)}** | **${milliseconds(regular.elementRenderDelayMs)}** | **${milliseconds(renderDeltaMs)}** |`,
  "",
  "### Within-run variance",
  "",
  `- First-visit LCP range: ${seconds(firstLcpRange.min)}–${seconds(firstLcpRange.max)} (spread ${milliseconds(firstLcpRange.spread)}).`,
  `- Regular-home LCP range: ${seconds(regularLcpRange.min)}–${seconds(regularLcpRange.max)} (spread ${milliseconds(regularLcpRange.spread)}).`,
  `- First-visit element render delay range: ${milliseconds(firstRenderRange.min)}–${milliseconds(firstRenderRange.max)} (spread ${milliseconds(firstRenderRange.spread)}).`,
  `- Regular-home element render delay range: ${milliseconds(regularRenderRange.min)}–${milliseconds(regularRenderRange.max)} (spread ${milliseconds(regularRenderRange.spread)}).`,
  "",
  `**Interpretation:** ${interpretation}`,
  "",
  "> Diagnostic only. The regular-home hash is a measurement control, not a proposed user-facing URL or SEO change.",
  "",
];

await fs.writeFile(path.join(artifactsDir, "mode-diagnostic.json"), `${JSON.stringify({
  checkedAt: new Date().toISOString(),
  firstVisit,
  regularHome,
  deltas: { lcpMs: lcpDeltaMs, elementRenderDelayMs: renderDeltaMs },
  ranges: { firstLcpRange, regularLcpRange, firstRenderRange, regularRenderRange },
  interpretation,
}, null, 2)}\n`);
await fs.writeFile(path.join(artifactsDir, "mode-diagnostic.md"), lines.join("\n"));
console.log(lines.join("\n"));
