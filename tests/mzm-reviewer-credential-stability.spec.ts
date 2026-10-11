import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("MZM reviewer create is one-time and cannot silently rotate a delivered password", () => {
  const src = readFileSync("functions/api/internal/mzm-reviewer-access.ts", "utf8");
  expect(src).toContain("reviewer_already_exists_rotation_requires_separate_authorization");
  expect(src).toContain("account_exists: true");
  expect(src).toContain("credentials_rotated: false");
  expect(src).toContain("account_created: true");
  expect(src).not.toContain("UPDATE specialists");
  expect(src).not.toContain("DELETE FROM sessions");
  const guard = src.indexOf("if (existing) {");
  const generator = src.indexOf("const random = new Uint8Array(18)");
  expect(guard).toBeGreaterThan(0);
  expect(guard).toBeLessThan(generator);
});

test("create replay failure occurs before password generation and session invalidation", () => {
  const src = readFileSync("functions/api/internal/mzm-reviewer-access.ts", "utf8");
  const start = src.indexOf('SELECT id,email,name,role FROM specialists');
  const guard = src.indexOf("reviewer_already_exists_rotation_requires_separate_authorization");
  const keygen = src.indexOf("const temporaryPassword =");
  expect(start).toBeGreaterThan(0);
  expect(start).toBeLessThan(guard);
  expect(guard).toBeLessThan(keygen);
});
