import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// A narrow fail-closed adapter for the existing Pa11y CI text report.
// Pa11y+axe remains the source of violations; do not imply WCAG success
// just because this temporary debt ceiling is not exceeded.
export function parsePa11yReport(text) {
  const started = text.match(/Running Pa11y on (\d+) URLs:/);
  if (!started) throw new Error("pa11y_report_missing_run_header");
  const expectedCount = Number(started[1]);
  const results = new Map();
  const row = /^\s*> (https?:\/\/\S+) - (\d+) errors\s*$/gm;
  for (const match of text.matchAll(row)) {
    const path = new URL(match[1]).pathname;
    if (results.has(path)) throw new Error(`pa11y_report_duplicate_path:${path}`);
    results.set(path, Number(match[2]));
  }
  if (results.size !== expectedCount) {
    throw new Error(`pa11y_report_incomplete:expected=${expectedCount}:actual=${results.size}`);
  }
  return results;
}

// A lower total must not silently replace a known issue with a *new* rule.
// Pa11y text includes exactly one axe rule link for every reported occurrence.
export function parsePa11yRules(text) {
  const rules = new Map();
  for (const match of text.matchAll(/\(https:\/\/dequeuniversity\.com\/rules\/axe\/[^/\s)]+\/([a-z0-9-]+)\?application=axeAPI\)/g)) {
    rules.set(match[1], (rules.get(match[1]) ?? 0) + 1);
  }
  return rules;
}

export function evaluatePa11yBudget(reportText, budget) {
  if (budget.schema_version !== 1 || !budget.paths || typeof budget.paths !== "object") {
    throw new Error("pa11y_baseline_invalid");
  }
  const observed = parsePa11yReport(reportText);
  const required = Object.keys(budget.paths);
  const changes = [];
  const failures = [];
  for (const path of required) {
    const actual = observed.get(path);
    const ceiling = budget.paths[path];
    if (!Number.isInteger(ceiling) || ceiling < 0) throw new Error(`pa11y_invalid_cap:${path}`);
    if (actual === undefined) {
      failures.push(`missing_required_route:${path}`);
      continue;
    }
    const delta = actual - ceiling;
    changes.push({ path, actual, ceiling, delta });
    if (delta > 0) failures.push(`a11y_regression:${path}:${actual}>${ceiling}`);
  }
  for (const path of observed.keys()) {
    if (!Object.hasOwn(budget.paths, path)) failures.push(`unexpected_audited_route:${path}`);
  }
  const observedTotal = [...observed.values()].reduce((sum, n) => sum + n, 0);
  const observedRules = parsePa11yRules(reportText);
  const ruleChanges = [];
  if (budget.rule_caps) {
    const ruleTotal = [...observedRules.values()].reduce((sum, count) => sum + count, 0);
    if (ruleTotal !== observedTotal) failures.push(`pa11y_rule_evidence_incomplete:${ruleTotal}!=${observedTotal}`);
    for (const [rule, ceiling] of Object.entries(budget.rule_caps)) {
      if (!Number.isInteger(ceiling) || ceiling < 0) throw new Error(`pa11y_invalid_rule_cap:${rule}`);
      const actual = observedRules.get(rule) ?? 0;
      ruleChanges.push({ rule, actual, ceiling });
      if (actual > ceiling) failures.push(`a11y_rule_regression:${rule}:${actual}>${ceiling}`);
    }
    for (const rule of observedRules.keys()) {
      if (!Object.hasOwn(budget.rule_caps, rule)) failures.push(`unexpected_a11y_rule:${rule}`);
    }
  }
  const ceilingTotal = required.reduce((sum, path) => sum + budget.paths[path], 0);
  return {
    passed: failures.length === 0,
    observedTotal, ceilingTotal,
    affectedRoutes: changes.filter((c) => c.actual > 0).length,
    comparedRoutes: changes.length,
    changes, ruleChanges, failures,
  };
}

export function formatPa11yBudgetSummary(result, budget) {
  const lines = [
    "## Accessibility debt non-regression (Pa11y/axe)",
    "",
    `- Status: **${result.passed ? "WITHIN_RECORDED_CEILINGS" : "REGRESSION_OR_EVIDENCE_GAP"}** — NOT WCAG COMPLIANT`,
    `- Violations: **${result.observedTotal}** occurrences (existing ceiling ${result.ceilingTotal}) across ${result.comparedRoutes} audited public routes.`,
    `- Routes still reporting violations: ${result.affectedRoutes}. Historic caps from PR ${budget.evidence_commit?.slice(0, 7) || "UNKNOWN"}.`,
    "- This gate fails on newly increased route totals, missing results or unexpected routes. It does not excuse or clear existing defects.",
    "",
    ...(result.ruleChanges?.length ? [
      "- Rule-class ceilings are also enforced; fewer total findings cannot mask a new issue type.",
      "",
      "| Axe rule | Current | Allowed ceiling |",
      "| --- | ---: | ---: |",
      ...result.ruleChanges.map(({ rule, actual, ceiling }) => `| \`${rule}\` | ${actual} | ${ceiling} |`),
      "",
    ] : []),
    "| Route | Current | Allowed ceiling | Change |",
    "| --- | ---: | ---: | ---: |",
    ...result.changes.map(({ path, actual, ceiling, delta }) =>
      `| \`${path}\` | ${actual} | ${ceiling} | ${delta > 0 ? "+" : ""}${delta} |`),
  ];
  if (result.failures.length) {
    lines.push("", "**Failures:**", ...result.failures.map((x) => `- \`${x}\``));
  }
  return lines.join("\n") + "\n";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const reportPath = process.argv[2] || "artifacts/web-quality/pa11y.txt";
  const baselinePath = process.argv[3] || "docs/qa/PA11Y_ACCESSIBILITY_BASELINE_2026-10-14.json";
  try {
    const budget = JSON.parse(readFileSync(baselinePath, "utf8"));
    const result = evaluatePa11yBudget(readFileSync(reportPath, "utf8"), budget);
    const summary = formatPa11yBudgetSummary(result, budget);
    console.log(summary);
    if (process.env.GITHUB_STEP_SUMMARY) {
      const { appendFileSync } = await import("node:fs");
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    }
    if (!result.passed) process.exitCode = 1;
  } catch (error) {
    console.error("Pa11y evidence gate failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
