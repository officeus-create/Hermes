import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const script = await readFile("scripts/repair-locale-session-production-proof.mjs", "utf8");
const workflow = await readFile(".github/workflows/repair-locale-session-production-proof-command.yml", "utf8");
const concurrencyWorkflow = await readFile(".github/workflows/repair-booking-concurrency-production-smoke.yml", "utf8");

test("locale/session production proof stays on the canonical bounded Repair Shop QA lane", async () => {
  expect(script).toContain('repair-booking-production-smoke@hermesconnect.app');
  expect(script).toContain('/api/repair-shop/cleanup-booking-smoke');
  expect(script).toContain('Current-main Cloudflare Pages deployment is not successful');
  expect(script).toContain('.repair-crm-language');
  expect(script).toContain('a[lang="${locale}"]');
  expect(script).toContain('switchLocale(page, "ru"');
  expect(script).toContain('summary.waitFor({ state: "visible"');
  expect(script).toContain('summary.boundingBox()');
  expect(script).toContain('summary.evaluate((element) => element.click())');
  expect(script).not.toContain('force: true');
  expect(script).toContain('language menu did not open');
  expect(script).toContain('.repair-crm-nav-item[href^=\"${route.path}\"]');
  expect(script).not.toContain('href*=\"/${route.segment}/\"');
  expect(script).toContain('desktopLogoutButton.evaluate((element) => element.click())');
  expect(script).toContain('mobileMenuButton.evaluate((element) => element.click())');
  expect(script).toContain('hermes-connect-language');
  expect(script).toContain('page.goBack');
  expect(script).toContain('/api/auth/logout');
  expect(script).toContain('/api/repair-shop/profile');
  expect(script).toContain('!== 401');
  expect(script).toContain('width: 390');
  expect(script).toContain('REPAIR_LOCALE_SESSION_PRODUCTION_PROOF=PASS');
});

test("closed Repair proof issues are retired while the bounded production proofs remain runnable", async () => {
  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('group: repair-p0-production-closure-proof');
  expect(workflow).toContain('cancel-in-progress: false');
  expect(workflow).toContain('checks: read');
  expect(workflow).toContain('GITHUB_STEP_SUMMARY');
  expect(workflow).toContain('LIVE_REPAIR_LOCALE_SESSION_BOUNDARY_PASS');
  expect(workflow).not.toContain('issue_comment:');
  expect(workflow).not.toContain('#1192');
  expect(workflow).not.toContain('github.event.issue.number == 1192');
  expect(workflow).not.toContain("github.event.comment.body == '/verify-repair-locale-session-production'");
  expect(workflow).not.toContain('gh issue comment 1192');
  expect(workflow).not.toContain('issues: write');
  expect(workflow).not.toContain('password:');

  expect(concurrencyWorkflow).toContain('workflow_dispatch:');
  expect(concurrencyWorkflow).toContain('checks: read');
  expect(concurrencyWorkflow).toContain('id-token: write');
  expect(concurrencyWorkflow).toContain('GITHUB_STEP_SUMMARY');
  expect(concurrencyWorkflow).not.toContain('issue_comment:');
  expect(concurrencyWorkflow).not.toContain('github.event.issue.number == 939');
  expect(concurrencyWorkflow).not.toContain("github.event.comment.body == '/verify-repair-booking-concurrency'");
  expect(concurrencyWorkflow).not.toContain('gh issue comment 939');
  expect(concurrencyWorkflow).not.toContain('issues: write');
});
