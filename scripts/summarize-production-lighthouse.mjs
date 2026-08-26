import fs from "node:fs/promises";
import path from "node:path";

const artifactsDir = path.resolve("artifacts/lighthouse-production");
const baseline = {
  mobile: { performance: 90, accessibility: 96, bestPractices: 100, seo: 100, fcpMs: 2000, lcpMs: 3000, tbtMs: 20, cls: 0, speedIndexMs: 4400 },
  desktop: { performance: 100, accessibility: 96, bestPractices: 100, seo: 100, fcpMs: 400, lcpMs: 600, tbtMs: 0, cls: 0.004, speedIndexMs: 600 },
  agentic: { passed: 2, applicable: 3 },
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const round = (value, digits = 0) => Number(value.toFixed(digits));
const compactText = (value, max = 260) => {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, max) : null;
};

const findFirstNode = (value) => {
  const queue = [value];
  const seen = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    const node = current.node;
    if (node && typeof node === "object") {
      const selector = compactText(node.selector, 220);
      const snippet = compactText(node.snippet, 320);
      const nodeLabel = compactText(node.nodeLabel, 220);
      if (selector || snippet || nodeLabel) return { selector, snippet, nodeLabel };
    }

    for (const child of Object.values(current)) {
      if (child && typeof child === "object") queue.push(child);
    }
  }
  return null;
};

const collectLcpPhases = (value) => {
  const queue = [value];
  const seen = new Set();
  const phases = [];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    const label = compactText(current.phase ?? current.label ?? current.name, 120);
    const numeric = [current.timing, current.duration, current.value, current.numericValue]
      .find((candidate) => typeof candidate === "number" && Number.isFinite(candidate));
    if (label && typeof numeric === "number") {
      phases.push({ label, ms: round(numeric, 1) });
    }

    for (const child of Object.values(current)) {
      if (child && typeof child === "object") queue.push(child);
    }
  }

  const unique = [];
  const keys = new Set();
  for (const phase of phases) {
    const key = `${phase.label}:${phase.ms}`;
    if (keys.has(key)) continue;
    keys.add(key);
    unique.push(phase);
    if (unique.length >= 8) break;
  }
  return unique;
};

const auditSummary = (report, id) => {
  const audit = report.audits?.[id];
  if (!audit) return null;
  return {
    id,
    title: compactText(audit.title, 180),
    score: typeof audit.score === "number" ? audit.score : null,
    scoreDisplayMode: audit.scoreDisplayMode ?? null,
    displayValue: compactText(audit.displayValue, 180),
  };
};

const readLcpDiagnostics = (report) => {
  const elementAudit = report.audits?.["largest-contentful-paint-element"];
  const breakdownAudit = report.audits?.["lcp-breakdown-insight"];
  return {
    element: findFirstNode(elementAudit?.details ?? null),
    breakdown: breakdownAudit
      ? {
          title: compactText(breakdownAudit.title, 180),
          displayValue: compactText(breakdownAudit.displayValue, 180),
          phases: collectLcpPhases(breakdownAudit.details ?? null),
        }
      : null,
    audits: [
      auditSummary(report, "lcp-lazy-loaded"),
      auditSummary(report, "prioritize-lcp-image"),
      auditSummary(report, "uses-responsive-images"),
      auditSummary(report, "uses-optimized-images"),
    ].filter(Boolean),
  };
};

const nearestRun = (runs, metric, target) => [...runs]
  .sort((a, b) => Math.abs(Number(a[metric]) - target) - Math.abs(Number(b[metric]) - target))[0] ?? null;

const readMode = async (mode) => {
  const files = (await fs.readdir(artifactsDir))
    .filter((name) => name.startsWith(`${mode}-`) && name.endsWith(".json"))
    .sort();
  if (!files.length) throw new Error(`No ${mode} Lighthouse JSON files found in ${artifactsDir}`);

  const runs = [];
  for (const file of files) {
    const report = JSON.parse(await fs.readFile(path.join(artifactsDir, file), "utf8"));
    const score = (id) => Math.round((report.categories?.[id]?.score ?? 0) * 100);
    const audit = (id) => report.audits?.[id]?.numericValue;
    runs.push({
      file,
      lighthouseVersion: report.lighthouseVersion,
      finalDisplayedUrl: report.finalDisplayedUrl,
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
      fcpMs: audit("first-contentful-paint"),
      lcpMs: audit("largest-contentful-paint"),
      tbtMs: audit("total-blocking-time"),
      cls: audit("cumulative-layout-shift"),
      speedIndexMs: audit("speed-index"),
      lcpDiagnostics: readLcpDiagnostics(report),
    });
  }

  const metricNames = ["performance", "accessibility", "bestPractices", "seo", "fcpMs", "lcpMs", "tbtMs", "cls", "speedIndexMs"];
  const medians = Object.fromEntries(metricNames.map((metric) => [metric, median(runs.map((run) => Number(run[metric])))]));
  const representativeLcpRun = nearestRun(runs, "lcpMs", medians.lcpMs);
  return { files, runs, medians, representativeLcpRun };
};

const readAgentic = async () => {
  const report = JSON.parse(await fs.readFile(path.join(artifactsDir, "agentic.json"), "utf8"));
  const category = report.categories?.["agentic-browsing"];
  if (!category) throw new Error("Agentic Browsing category is missing from Lighthouse report");

  const applicable = [];
  const notApplicable = [];
  for (const ref of category.auditRefs ?? []) {
    const audit = report.audits?.[ref.id];
    if (!audit) continue;
    if (audit.scoreDisplayMode === "notApplicable" || audit.score === null || typeof audit.score !== "number") {
      notApplicable.push({ id: ref.id, title: audit.title ?? ref.id, scoreDisplayMode: audit.scoreDisplayMode ?? null });
      continue;
    }
    applicable.push({
      id: ref.id,
      title: audit.title ?? ref.id,
      score: audit.score,
      displayValue: audit.displayValue ?? null,
      explanation: audit.explanation ?? null,
    });
  }

  const passedAudits = applicable.filter((audit) => audit.score === 1);
  const failedAudits = applicable.filter((audit) => audit.score !== 1);
  return {
    lighthouseVersion: report.lighthouseVersion,
    finalDisplayedUrl: report.finalDisplayedUrl,
    passed: passedAudits.length,
    applicable: applicable.length,
    fraction: `${passedAudits.length}/${applicable.length}`,
    passedAudits,
    failedAudits,
    notApplicable,
  };
};

await fs.mkdir(artifactsDir, { recursive: true });
const mobile = await readMode("mobile");
const desktop = await readMode("desktop");
const agentic = await readAgentic();

const formatSeconds = (ms) => `${round(ms / 1000, 2)}s`;
const delta = (current, before, digits = 0) => round(current - before, digits);
const deltaText = (current, before, digits = 0) => {
  const value = delta(current, before, digits);
  return `${value > 0 ? "+" : ""}${value}`;
};
const auditState = (audit) => {
  if (!audit) return "not reported";
  if (audit.score === 1) return "pass";
  if (audit.score === 0) return "fail";
  return audit.scoreDisplayMode ?? "informational";
};

const result = {
  checkedAt: new Date().toISOString(),
  url: "https://hermeslogisticsus.com/",
  methodology: {
    lighthouseVersion: mobile.runs[0]?.lighthouseVersion ?? desktop.runs[0]?.lighthouseVersion ?? agentic.lighthouseVersion ?? null,
    mobileRuns: mobile.runs.length,
    desktopRuns: desktop.runs.length,
    agenticRuns: 1,
    statistic: "median for performance; representative LCP diagnostic uses the run nearest the median LCP; deterministic single pass for Agentic Browsing",
    note: "GitHub-hosted Lighthouse lab runs. Compare directionally with the owner-supplied 2026-08-11 PSI baseline; these are not CrUX field metrics and do not guarantee identical PSI infrastructure conditions. Agentic Browsing is experimental and reported as pass/applicable audits, not a 0-100 ranking score.",
  },
  baseline,
  mobile,
  desktop,
  agentic,
};

const mobileM = mobile.medians;
const desktopM = desktop.medians;
const representative = mobile.representativeLcpRun;
const lcpElement = representative?.lcpDiagnostics?.element ?? null;
const lcpBreakdown = representative?.lcpDiagnostics?.breakdown ?? null;
const lcpAudits = representative?.lcpDiagnostics?.audits ?? [];
const lcpAuditById = Object.fromEntries(lcpAudits.map((audit) => [audit.id, audit]));
const lines = [
  "# Production Lighthouse comparison",
  "",
  `- Checked: ${result.checkedAt}`,
  `- URL: ${result.url}`,
  `- Lighthouse: ${result.methodology.lighthouseVersion ?? "unknown"}`,
  `- Statistic: median of ${mobile.runs.length} mobile / ${desktop.runs.length} desktop runs + 1 deterministic Agentic Browsing pass`,
  "- Evidence class: Lighthouse lab only; not CrUX field data",
  "",
  "## Mobile median",
  "",
  `- Performance: **${round(mobileM.performance)}** (owner PSI baseline 90; Δ ${deltaText(mobileM.performance, baseline.mobile.performance)})`,
  `- Accessibility: **${round(mobileM.accessibility)}** (baseline 96; Δ ${deltaText(mobileM.accessibility, baseline.mobile.accessibility)})`,
  `- Best Practices: **${round(mobileM.bestPractices)}** (baseline 100; Δ ${deltaText(mobileM.bestPractices, baseline.mobile.bestPractices)})`,
  `- SEO: **${round(mobileM.seo)}** (baseline 100; Δ ${deltaText(mobileM.seo, baseline.mobile.seo)})`,
  `- FCP: **${formatSeconds(mobileM.fcpMs)}** (baseline 2.0s; Δ ${formatSeconds(delta(mobileM.fcpMs, baseline.mobile.fcpMs))})`,
  `- LCP: **${formatSeconds(mobileM.lcpMs)}** (baseline 3.0s; Δ ${formatSeconds(delta(mobileM.lcpMs, baseline.mobile.lcpMs))})`,
  `- TBT: **${round(mobileM.tbtMs)}ms** (baseline 20ms; Δ ${deltaText(mobileM.tbtMs, baseline.mobile.tbtMs)}ms)`,
  `- CLS: **${round(mobileM.cls, 4)}** (baseline 0; Δ ${deltaText(mobileM.cls, baseline.mobile.cls, 4)})`,
  `- Speed Index: **${formatSeconds(mobileM.speedIndexMs)}** (baseline 4.4s; Δ ${formatSeconds(delta(mobileM.speedIndexMs, baseline.mobile.speedIndexMs))})`,
  "",
  "## Mobile LCP diagnostic",
  "",
  `- Representative run nearest median LCP: **${representative?.file ?? "not reported"}**${representative?.lcpMs ? ` (${formatSeconds(representative.lcpMs)})` : ""}`,
  `- LCP element selector: ${lcpElement?.selector ? `\`${lcpElement.selector}\`` : "not reported by Lighthouse"}`,
  `- LCP element snippet: ${lcpElement?.snippet ? `\`${lcpElement.snippet.replace(/`/g, "'")}\`` : "not reported by Lighthouse"}`,
  `- LCP lazy-load audit: **${auditState(lcpAuditById["lcp-lazy-loaded"])}**${lcpAuditById["lcp-lazy-loaded"]?.displayValue ? ` — ${lcpAuditById["lcp-lazy-loaded"].displayValue}` : ""}`,
  `- LCP image priority audit: **${auditState(lcpAuditById["prioritize-lcp-image"])}**${lcpAuditById["prioritize-lcp-image"]?.displayValue ? ` — ${lcpAuditById["prioritize-lcp-image"].displayValue}` : ""}`,
  `- Responsive image audit: **${auditState(lcpAuditById["uses-responsive-images"])}**${lcpAuditById["uses-responsive-images"]?.displayValue ? ` — ${lcpAuditById["uses-responsive-images"].displayValue}` : ""}`,
  `- Optimized image audit: **${auditState(lcpAuditById["uses-optimized-images"])}**${lcpAuditById["uses-optimized-images"]?.displayValue ? ` — ${lcpAuditById["uses-optimized-images"].displayValue}` : ""}`,
  ...(lcpBreakdown?.phases?.length
    ? ["- LCP breakdown phases:", ...lcpBreakdown.phases.map((phase) => `  - ${phase.label}: ${phase.ms}ms`)]
    : [`- LCP breakdown: ${lcpBreakdown?.displayValue ?? "not reported by Lighthouse"}`]),
  "",
  "## Desktop median",
  "",
  `- Performance: **${round(desktopM.performance)}** (owner PSI baseline 100; Δ ${deltaText(desktopM.performance, baseline.desktop.performance)})`,
  `- Accessibility: **${round(desktopM.accessibility)}** (baseline 96; Δ ${deltaText(desktopM.accessibility, baseline.desktop.accessibility)})`,
  `- Best Practices: **${round(desktopM.bestPractices)}** (baseline 100; Δ ${deltaText(desktopM.bestPractices, baseline.desktop.bestPractices)})`,
  `- SEO: **${round(desktopM.seo)}** (baseline 100; Δ ${deltaText(desktopM.seo, baseline.desktop.seo)})`,
  `- FCP: **${formatSeconds(desktopM.fcpMs)}** (baseline 0.4s)`,
  `- LCP: **${formatSeconds(desktopM.lcpMs)}** (baseline 0.6s)`,
  `- TBT: **${round(desktopM.tbtMs)}ms** (baseline 0ms)`,
  `- CLS: **${round(desktopM.cls, 4)}** (baseline 0.004)`,
  `- Speed Index: **${formatSeconds(desktopM.speedIndexMs)}** (baseline 0.6s)`,
  "",
  "## Agentic Browsing readiness",
  "",
  `- Passed applicable audits: **${agentic.fraction}** (owner PSI baseline ${baseline.agentic.passed}/${baseline.agentic.applicable})`,
  `- Applicable audits: **${agentic.applicable}**`,
  `- Not applicable/informational audits: **${agentic.notApplicable.length}**`,
  ...(agentic.failedAudits.length
    ? ["- Failed audits:", ...agentic.failedAudits.map((audit) => `  - \`${audit.id}\` — ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ""}`)]
    : ["- Failed audits: **none**"]),
  "",
  "## Decision guard",
  "",
  `- Mobile LCP <= 2.5s in this median lab: **${mobileM.lcpMs <= 2500 ? "yes" : "no"}**`,
  `- Mobile TBT <= 100ms: **${mobileM.tbtMs <= 100 ? "yes" : "no"}**`,
  `- Mobile CLS <= 0.1: **${mobileM.cls <= 0.1 ? "yes" : "no"}**`,
  `- Desktop performance >= 95: **${desktopM.performance >= 95 ? "yes" : "no"}**`,
  `- Agentic Browsing all applicable audits pass: **${agentic.passed === agentic.applicable ? "yes" : "no"}**`,
  "",
  "> This lab comparison is repeatable and useful for regression direction, but it is not a substitute for PageSpeed/CrUX field evidence. Agentic Browsing is experimental. A score/fraction change alone is not a ranking guarantee.",
  "",
];

await fs.writeFile(path.join(artifactsDir, "summary.json"), `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(path.join(artifactsDir, "summary.md"), lines.join("\n"));
console.log(lines.join("\n"));
