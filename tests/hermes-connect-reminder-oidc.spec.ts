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

test("bearer token parsing is strict", async () => {
  expect(oidc.bearerToken(new Request("https://example.test", { headers: { Authorization: "Bearer abc.def.ghi" } }))).toBe("abc.def.ghi");
  expect(oidc.bearerToken(new Request("https://example.test", { headers: { Authorization: "Basic abc" } }))).toBe("");
});
