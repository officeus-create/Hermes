import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const script = await readFile("scripts/repair-locale-session-production-proof.mjs", "utf8");
const workflow = await readFile(".github/workflows/repair-locale-session-production-proof-command.yml", "utf8");

test("locale/session production proof stays on the canonical bounded Repair Shop QA lane", async () => {
  expect(script).toContain('repair-booking-production-smoke@hermesconnect.app');
  expect(script).toContain('/api/repair-shop/cleanup-booking-smoke');
  expect(script).toContain('Current-main Cloudflare Pages deployment is not successful');
  expect(script).toContain('.repair-crm-language');
  expect(script).toContain('a[lang="${locale}"]');
  expect(script).toContain('switchLocale(page, "ru"');
  expect(script).toContain('hermes-connect-language');
  expect(script).toContain('page.goBack');
  expect(script).toContain('/api/auth/logout');
  expect(script).toContain('/api/repair-shop/profile');
  expect(script).toContain('!== 401');
  expect(script).toContain('width: 390');
  expect(script).toContain('REPAIR_LOCALE_SESSION_PRODUCTION_PROOF=PASS');
});

test("command is scoped to issue 1192 and serializes with existing Repair P0 synthetic cleanup", async () => {
  expect(workflow).toContain('github.event.issue.number == 1192');
  expect(workflow).toContain("github.event.comment.body == '/verify-repair-locale-session-production'");
  expect(workflow).toContain('group: repair-p0-production-closure-proof');
  expect(workflow).toContain('cancel-in-progress: false');
  expect(workflow).toContain('checks: read');
  expect(workflow).toContain('issues: write');
  expect(workflow).toContain('LIVE_REPAIR_LOCALE_SESSION_BOUNDARY_PASS');
  expect(workflow).not.toContain('password:');
});
