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

const first5ActivationClaims = {
  ...baseClaims,
  aud: "hermes-connect-first5-activation",
  workflow_ref: "officeus-create/Hermes/.github/workflows/kittles-first5-activation.yml@refs/heads/main",
  event_name: "issue_comment",
};

const mzmManagedClientClaims = {
  ...baseClaims,
  aud: "hermes-connect-mzm-managed-client",
  workflow_ref: "officeus-create/Hermes/.github/workflows/mzm-managed-client.yml@refs/heads/main",
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

test("First-5 activation accepts only the exact main issue-comment workflow identity", async () => {
  expect(oidc.validateGitHubFirst5ActivationOidcClaims(first5ActivationClaims, now)).toBe(true);
  expect(oidc.validateGitHubFirst5ActivationOidcClaims({ ...first5ActivationClaims, aud: cabinetAuditClaims.aud }, now)).toBe(false);
  expect(oidc.validateGitHubFirst5ActivationOidcClaims({ ...first5ActivationClaims, workflow_ref: cabinetAuditClaims.workflow_ref }, now)).toBe(false);
  expect(oidc.validateGitHubFirst5ActivationOidcClaims({ ...first5ActivationClaims, event_name: "workflow_dispatch" }, now)).toBe(false);
  expect(oidc.validateGitHubFirst5ActivationOidcClaims({ ...first5ActivationClaims, ref: "refs/heads/feature" }, now)).toBe(false);
});

test("First-5 activation identity cannot be substituted with reminder or cabinet audit identities", async () => {
  expect(oidc.validateGitHubFirst5ActivationOidcClaims(baseClaims, now)).toBe(false);
  expect(oidc.validateGitHubFirst5ActivationOidcClaims(cabinetAuditClaims, now)).toBe(false);
  expect(oidc.validateGitHubCabinetAuditOidcClaims(first5ActivationClaims, now)).toBe(false);
  expect(oidc.validateGitHubOidcClaims(first5ActivationClaims, now)).toBe(false);
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

test("First-5 activation uses short-lived OIDC and cannot invent a Repair Shop login", async () => {
  const workflow = await readFile(".github/workflows/kittles-first5-activation.yml", "utf8");
  const endpoint = await readFile("functions/api/internal/repair-shop-first5-activation.ts", "utf8");

  expect(workflow).toContain("id-token: write");
  expect(workflow).toContain("OIDC_AUDIENCE: hermes-connect-first5-activation");
  expect(workflow).toContain("Authorization: Bearer ${OIDC_TOKEN}");
  expect(workflow).toContain("/api/internal/repair-shop-first5-activation");
  expect(workflow).not.toContain("CLOUDFLARE_D1_API_TOKEN");
  expect(workflow).not.toContain("CLOUDFLARE_ACCOUNT_ID");
  expect(workflow).not.toContain("/api/auth/login");

  expect(endpoint).toContain("verifyGitHubFirst5ActivationOidcToken");
  expect(endpoint).toContain('const OPERATION_ID = "activate_kittles_garage_2026_09_23"');
  expect(endpoint).toContain("UPDATE repair_shops");
  expect(endpoint).toContain("catalog_opt_in=1");
  expect(endpoint).toContain("repair_shop_access");
  expect(endpoint).not.toContain("INSERT INTO specialists");
  expect(endpoint).not.toContain("INSERT INTO repair_shops");
});



test("First-5 trial provisioning reuses bounded OIDC and keeps credentials out of GitHub", async () => {
  const workflow = await readFile(".github/workflows/kittles-first5-activation.yml", "utf8");
  const endpoint = await readFile("functions/api/internal/repair-shop-first5-provision.ts", "utf8");

  expect(workflow).toContain("/provision-kittles-trial");
  expect(workflow).toContain("/api/internal/repair-shop-first5-provision");
  expect(workflow).toContain("provision_kittles_garage_trial_2026_09_23");
  expect(workflow).not.toContain("Temporary password:");
  expect(workflow).not.toContain("Friday-");

  expect(endpoint).toContain("verifyGitHubFirst5ActivationOidcToken");
  expect(endpoint).toContain('const OPERATION_ID = "provision_kittles_garage_trial_2026_09_23"');
  expect(endpoint).toContain("hashPassword");
  expect(endpoint).toContain("verifyPassword");
  expect(endpoint).toContain("DELETE FROM sessions");
  expect(endpoint).toContain("credential_delivery: \"internal_admin_mailbox\"");
  expect(endpoint).toContain("credential_delivery_failed_password_restored");
  expect(endpoint).not.toContain("INSERT INTO specialists");
  expect(endpoint).not.toContain("erik@kittlesgarage.com");
});

test("MZM managed-client operator accepts only the exact main issue-comment workflow identity", async () => {
  expect(oidc.validateGitHubMzmManagedClientOidcClaims(mzmManagedClientClaims, now)).toBe(true);
  expect(oidc.validateGitHubMzmManagedClientOidcClaims({ ...mzmManagedClientClaims, aud: first5ActivationClaims.aud }, now)).toBe(false);
  expect(oidc.validateGitHubMzmManagedClientOidcClaims({ ...mzmManagedClientClaims, workflow_ref: first5ActivationClaims.workflow_ref }, now)).toBe(false);
  expect(oidc.validateGitHubMzmManagedClientOidcClaims({ ...mzmManagedClientClaims, event_name: "workflow_dispatch" }, now)).toBe(false);
  expect(oidc.validateGitHubMzmManagedClientOidcClaims({ ...mzmManagedClientClaims, ref: "refs/heads/feature" }, now)).toBe(false);
});

test("MZM managed-client workflow uses bounded OIDC and never impersonates the client owner", async () => {
  const workflow = await readFile(".github/workflows/mzm-managed-client.yml", "utf8");
  const endpoint = await readFile("functions/api/internal/mzm-managed-client.ts", "utf8");

  expect(workflow).toContain("id-token: write");
  expect(workflow).toContain("OIDC_AUDIENCE: hermes-connect-mzm-managed-client");
  expect(workflow).toContain("Authorization: Bearer ${OIDC_TOKEN}");
  expect(workflow).toContain("/api/internal/mzm-managed-client");
  expect(workflow).toContain("/provision-mzm-managed");
  expect(workflow).not.toContain("CLOUDFLARE_D1_API_TOKEN");
  expect(workflow).not.toContain("CLOUDFLARE_ACCOUNT_ID");
  expect(workflow).not.toContain("/api/auth/login");

  expect(endpoint).toContain("verifyGitHubMzmManagedClientOidcToken");
  expect(endpoint).toContain('const DATA_OWNER_ID = "hermes-managed:mzm-junk-removal"');
  expect(endpoint).toContain('const MANAGEMENT_MODE = "hermes_managed"');
  expect(endpoint).toContain('const PUBLICATION_BASIS = "hermes_client_publication_approved"');
  expect(endpoint).toContain("catalog_owner_consent_claimed: false");
  expect(endpoint).toContain("owner_authentication_claimed: false");
  expect(endpoint).toContain('internal_operator_capability: "HERMES_INTERNAL_OWNER"');
  expect(endpoint).toContain('internal_operator_ui_readback: "REQUIRED_SEPARATELY"');
  expect(endpoint).toContain("catalog_publication_eligible: true");
  expect(endpoint).toContain("public_profile_path: PUBLIC_PROFILE_PATH");
  expect(endpoint).toContain("reviewer_authentication_claimed: false");
  expect(endpoint).toContain('reviewer_access_state: reviewer.accessState');
  expect(endpoint).toContain('credential_delivery: reviewer.credentialDelivery');
  expect(endpoint).toContain("real_leads_tracked");
  expect(workflow).toContain("public_catalog_readback_failed");
  expect(workflow).toContain("catalog_sitemap_readback_failed");
  expect(workflow).toContain("catalog_api_readback_failed");
  expect(workflow).toContain("credential_delivery_unverified");
  expect(workflow).toContain("internal_owner_receipt_boundary_failed");
  expect(workflow).toContain(`if (.catalog_owner_consent_claimed | type) == "boolean" then .catalog_owner_consent_claimed else "__invalid__" end`);
  expect(workflow).toContain(`if (.owner_authentication_claimed | type) == "boolean" then .owner_authentication_claimed else "__invalid__" end`);
  expect(workflow).not.toContain(".catalog_owner_consent_claimed // true");
  expect(workflow).not.toContain(".owner_authentication_claimed // true");
  expect(workflow).toContain("publication basis \\`${BASIS}\\`");
  expect(workflow).toContain("read-only scoped access");
  expect(endpoint).toContain("INSERT INTO specialists");
  expect(endpoint).toContain("Hermes Client Reviewer");
  expect(endpoint).toContain("hashPassword");
  expect(endpoint).toContain("verifyPassword");
  expect(endpoint).toContain("DELETE FROM sessions");
  expect(endpoint).toContain("internal_admin_mailbox");
  expect(endpoint).not.toContain("reviewer_password");
  expect(workflow).not.toContain("Temporary password:");
});
