import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const oidc = await import("../functions/api/_lib/github-oidc.mjs");

const now = new Date("2026-09-01T12:00:00.000Z");
const baseClaims = {
  iss: "https://token.actions.githubusercontent.com",
  aud: "hermes-connect-weekly-inactivity-reminders",
  repository: "officeus-create/Hermes",
  ref: "refs/heads/main",
  workflow_ref: "officeus-create/Hermes/.github/workflows/hermes-connect-weekly-inactivity-reminders.yml@refs/heads/main",
  event_name: "schedule",
  iat: Math.floor(now.getTime() / 1000) - 30,
  nbf: Math.floor(now.getTime() / 1000) - 30,
  exp: Math.floor(now.getTime() / 1000) + 300,
};

const cabinetAuditClaims = {
  ...baseClaims,
  aud: "hermes-connect-cabinet-audit",
  workflow_ref: "officeus-create/Hermes/.github/workflows/hc-cabinet-audit.yml@refs/heads/main",
  event_name: "issue_comment",
};

test("weekly reminder scheduler accepts only the expected GitHub Actions identity", async () => {
  expect(oidc.validateGitHubOidcClaims(baseClaims, now)).toBe(true);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, event_name: "workflow_dispatch" }, now)).toBe(true);
});

test("weekly reminder scheduler rejects wrong audience, repository, ref, workflow, or event", async () => {
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, aud: "other-audience" }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, repository: "someone/else" }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, ref: "refs/heads/feature" }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, workflow_ref: "officeus-create/Hermes/.github/workflows/other.yml@refs/heads/main" }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, event_name: "pull_request" }, now)).toBe(false);
});

test("weekly reminder scheduler rejects expired or implausibly old/future tokens", async () => {
  const seconds = Math.floor(now.getTime() / 1000);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, exp: seconds - 1 }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, iat: seconds - 21 * 60 }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, iat: seconds + 60 }, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims({ ...baseClaims, nbf: seconds + 60 }, now)).toBe(false);
});

test("cabinet audit accepts only the exact main issue-comment workflow identity", async () => {
  expect(oidc.validateGitHubCabinetAuditOidcClaims(cabinetAuditClaims, now)).toBe(true);
  expect(oidc.validateGitHubCabinetAuditOidcClaims({ ...cabinetAuditClaims, aud: baseClaims.aud }, now)).toBe(false);
  expect(oidc.validateGitHubCabinetAuditOidcClaims({ ...cabinetAuditClaims, workflow_ref: baseClaims.workflow_ref }, now)).toBe(false);
  expect(oidc.validateGitHubCabinetAuditOidcClaims({ ...cabinetAuditClaims, event_name: "workflow_dispatch" }, now)).toBe(false);
  expect(oidc.validateGitHubCabinetAuditOidcClaims({ ...cabinetAuditClaims, ref: "refs/heads/feature" }, now)).toBe(false);
});

test("reminder and cabinet audit OIDC identities cannot be substituted for each other", async () => {
  expect(oidc.validateGitHubOidcClaims(cabinetAuditClaims, now)).toBe(false);
  expect(oidc.validateGitHubCabinetAuditOidcClaims(baseClaims, now)).toBe(false);
});

test("cabinet audit workflow no longer depends on password artifacts or login cookies", async () => {
  const workflow = await readFile(".github/workflows/hc-cabinet-audit.yml", "utf8");
  expect(workflow).toContain("id-token: write");
  expect(workflow).toContain("OIDC_AUDIENCE: hermes-connect-cabinet-audit");
  expect(workflow).toContain("Authorization: Bearer ${OIDC_TOKEN}");
  expect(workflow).not.toContain("hermes-connect-ceo-owner-qa");
  expect(workflow).not.toContain("Password:");
  expect(workflow).not.toContain("/api/auth/login");
  expect(workflow).not.toContain("session.cookies");
});

test("cabinet OIDC is confined to ledger GET while mutations still require internal owner", async () => {
  const source = await readFile("functions/api/internal/registrations.ts", "utf8");
  const getIndex = source.indexOf("export async function onRequestGet");
  const postIndex = source.indexOf("export async function onRequestPost");
  expect(getIndex).toBeGreaterThan(-1);
  expect(postIndex).toBeGreaterThan(getIndex);

  const getSection = source.slice(getIndex, postIndex);
  const postSection = source.slice(postIndex);
  expect(getSection).toContain("requireRegistrationLedgerReadAccess");
  expect(postSection).toContain("requireInternalOwner(request, env)");
  expect(postSection).not.toContain("verifyGitHubCabinetAuditOidcToken");
});

test("bearer token parsing is strict", async () => {
  expect(oidc.bearerToken(new Request("https://example.test", { headers: { Authorization: "Bearer abc.def.ghi" } }))).toBe("abc.def.ghi");
  expect(oidc.bearerToken(new Request("https://example.test", { headers: { Authorization: "Basic abc" } }))).toBe("");
});
