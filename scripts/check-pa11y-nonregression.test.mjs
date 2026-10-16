import assert from "node:assert/strict";
import {
  parsePa11yReport, parsePa11yRules, evaluatePa11yBudget, formatPa11yBudgetSummary,
} from "./check-pa11y-nonregression.mjs";

const budget = {
  schema_version: 1,
  evidence_commit: "967e1e95746e0cf3bcd4d910f1942b090eeb54ad",
  paths: { "/": 4, "/ru/": 2 },
};
const report = (home = 4, russian = 2) =>
  `Running Pa11y on 2 URLs:
 > http://127.0.0.1:4321/ - ${home} errors
 > http://127.0.0.1:4321/ru/ - ${russian} errors

✘ 0/2 URLs passed
`;

assert.equal(parsePa11yReport(report()).size, 2);
const same = evaluatePa11yBudget(report(), budget);
assert.equal(same.passed, true);
assert.equal(same.observedTotal, 6);
assert.equal(same.comparedRoutes, 2);
assert.match(formatPa11yBudgetSummary(same, budget), /NOT WCAG COMPLIANT/);
const reduced = evaluatePa11yBudget(report(0, 1), budget);
assert.equal(reduced.passed, true, "remediation must never be blocked");
assert.equal(reduced.affectedRoutes, 1);
const increased = evaluatePa11yBudget(report(5, 2), budget);
assert.equal(increased.passed, false);
assert.deepEqual(increased.failures, ["a11y_regression:/:5>4"]);

assert.throws(() => parsePa11yReport("unrelated command output"), /missing_run_header/);
assert.throws(() => parsePa11yReport("Running Pa11y on 2 URLs:\n > http://127.0.0.1:4321/ - 4 errors"),
  /report_incomplete/);
assert.throws(() => parsePa11yReport(
  "Running Pa11y on 2 URLs:\n > http://127.0.0.1:4321/ - 4 errors\n > http://localhost:4321/ - 4 errors"),
  /duplicate_path/);

const differentRoute = evaluatePa11yBudget(
  "Running Pa11y on 2 URLs:\n > http://localhost:4321/ - 4 errors\n > http://localhost:4321/es/ - 2 errors",
  budget,
);
assert.equal(differentRoute.passed, false);
assert.ok(differentRoute.failures.some((f) => f.includes("missing_required_route:/ru/")));
assert.ok(differentRoute.failures.some((f) => f.includes("unexpected_audited_route:/es/")));

assert.throws(() => evaluatePa11yBudget(report(), { schema_version: 2, paths: budget.paths }),
  /baseline_invalid/);
// Two exact-rule evidence cases with an unchanged route error total.
// Introduce a new aria finding while a previous contrast finding disappears:
// the route total stays 2, but this must fail the new rule-level gate.
const twoRules = (second = "color-contrast") => `Running Pa11y on 1 URLs:
 > http://127.0.0.1:4321/ - 2 errors

Errors in http://127.0.0.1:4321/:
 • Contrast issue
   (https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=axeAPI)
 • Other rule
   (https://dequeuniversity.com/rules/axe/4.11/${second}?application=axeAPI)

✘ 0/1 URLs passed
`;
const ruleBudget = { schema_version: 1, paths: { "/": 2 }, rule_caps: { "color-contrast": 2 } };
assert.equal(parsePa11yRules(twoRules()).get("color-contrast"), 2);
assert.equal(evaluatePa11yBudget(twoRules(), ruleBudget).passed, true);
const replacedRule = evaluatePa11yBudget(twoRules("aria-prohibited-attr"), ruleBudget);
assert.equal(replacedRule.observedTotal, 2);
assert.equal(replacedRule.passed, false);
assert.ok(replacedRule.failures.includes("unexpected_a11y_rule:aria-prohibited-attr"));
const missingRuleEvidence = evaluatePa11yBudget(twoRules().replaceAll(/\(https:\/\/dequeuniversity\.com[^\n]+\)/g, ""), ruleBudget);
assert.equal(missingRuleEvidence.passed, false);
assert.ok(missingRuleEvidence.failures.some((x) => x.startsWith("pa11y_rule_evidence_incomplete:")));
console.log("Pa11y non-regression parsing, remediation, increased debt and fail-closed evidence tests PASS");
