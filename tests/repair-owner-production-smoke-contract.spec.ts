import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const source = await readFile("scripts/repair-owner-browser-production-smoke.mjs", "utf8");

test("production owner smoke verifies current CRM shell instead of stale heading copy", async () => {
  expect(source).toContain('waitForSelector(".repair-crm-shell"');
  expect(source).toContain('waitForSelector(".workspace-header h1"');
  expect(source).toContain('.repair-crm-context strong');
  expect(source).toContain('context !== "Today"');
  expect(source).not.toContain('=== "Repair Shop workspace"');
});
