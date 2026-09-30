import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  decryptThreadsTokenPayload,
  encryptThreadsTokenPayload,
  normalizeThreadsBrand,
  publicThreadsConnection,
  threadsAuthorizationUrl,
  threadsBrandExpectedUsername,
  threadsBrandPublishEnabled,
  threadsBrandRuntimeConfig,
  threadsBrandScopes,
  validThreadsIdempotencyKey,
  validateThreadsText,
} from "../functions/api/_lib/threads-brand-connector.mjs";

assert.equal(normalizeThreadsBrand("office_test"), "office_test");
assert.equal(normalizeThreadsBrand("progressopro"), "progressopro");
assert.equal(normalizeThreadsBrand("business_academy"), "business_academy");
assert.equal(normalizeThreadsBrand("hermes_logistics"), null);
assert.equal(normalizeThreadsBrand("../hermes_logistics"), null);

assert.equal(threadsBrandExpectedUsername("progressopro"), "progressopro");
assert.equal(threadsBrandExpectedUsername("office_test"), null);
assert.equal(
  threadsBrandExpectedUsername("office_test", { THREADS_OFFICE_TEST_EXPECTED_USERNAME:"@Office.Test" }),
  "office.test",
);
assert.equal(
  threadsBrandExpectedUsername("business_academy", { THREADS_BUSINESS_ACADEMY_EXPECTED_USERNAME:"academy_owner" }),
  "academy_owner",
);

assert.equal(threadsBrandRuntimeConfig({}), null);
const configEnv = {
  THREADS_BRAND_APP_ID: "123456",
  THREADS_BRAND_APP_SECRET: "private-secret",
  THREADS_BRAND_REDIRECT_URI: "https://hermeslogisticsus.com/api/internal/social/threads/callback",
  THREADS_BRAND_TOKEN_KEY: Buffer.alloc(32, 7).toString("base64"),
};
assert.ok(threadsBrandRuntimeConfig(configEnv));
assert.equal(threadsBrandRuntimeConfig({ ...configEnv, THREADS_BRAND_TOKEN_KEY: Buffer.alloc(31, 7).toString("base64") }), null);
assert.equal(threadsBrandRuntimeConfig({ ...configEnv, THREADS_BRAND_REDIRECT_URI: "http://example.com/callback" }), null);

const encryptedPayload = await encryptThreadsTokenPayload(configEnv, {
  access_token: "synthetic-access-token",
  token_type: "bearer",
  expires_at: "2026-12-01T00:00:00Z",
});
assert.match(encryptedPayload, /^v1\./);
assert.doesNotMatch(encryptedPayload, /synthetic-access-token/);
const decryptedPayload = await decryptThreadsTokenPayload(configEnv, encryptedPayload);
assert.equal(decryptedPayload.access_token, "synthetic-access-token");

const authUrl = new URL(threadsAuthorizationUrl(configEnv, "synthetic.state"));
assert.equal(authUrl.origin + authUrl.pathname, "https://threads.com/oauth/authorize");
assert.equal(authUrl.searchParams.get("client_id"), "123456");
assert.equal(authUrl.searchParams.get("redirect_uri"), configEnv.THREADS_BRAND_REDIRECT_URI);
assert.equal(authUrl.searchParams.get("response_type"), "code");
assert.equal(authUrl.searchParams.get("state"), "synthetic.state");
for (const scope of ["threads_basic","threads_content_publish","threads_read_replies","threads_manage_replies","threads_manage_insights"]) {
  assert.ok(authUrl.searchParams.get("scope").split(",").includes(scope));
}
const keywordScopes = threadsBrandScopes({ THREADS_BRAND_SCOPES:"threads_basic threads_keyword_search" });
assert.deepEqual(keywordScopes, ["threads_basic","threads_keyword_search"]);

assert.equal(threadsBrandPublishEnabled({ THREADS_OFFICE_TEST_PUBLISH_ENABLED:"true" }, "office_test"), true);
assert.equal(threadsBrandPublishEnabled({ THREADS_PROGRESSOPRO_PUBLISH_ENABLED:"1" }, "progressopro"), false);
assert.equal(threadsBrandPublishEnabled({ THREADS_PROGRESSOPRO_PUBLISH_ENABLED:"1", THREADS_SECONDARY_BRAND_PUBLISH_ENABLED:"true" }, "progressopro"), true);
assert.equal(threadsBrandPublishEnabled({ THREADS_OFFICE_TEST_PUBLISH_ENABLED:"true" }, "hermes_logistics"), false);

assert.equal(validateThreadsText("").ok, false);
assert.equal(validateThreadsText("hello").ok, true);
assert.equal(validateThreadsText("a".repeat(500)).ok, true);
assert.equal(validateThreadsText("a".repeat(501)).error, "threads_text_too_long");
assert.equal(validateThreadsText("🚛").bytes, 4);
assert.equal(validateThreadsText("🚛".repeat(126)).error, "threads_text_too_long");
assert.ok(validThreadsIdempotencyKey("office-threads-canary-20260929-01"));
assert.equal(validThreadsIdempotencyKey("short"), null);

const publicView = publicThreadsConnection({
  brand_key:"office_test",
  state:"connected_verified",
  threads_user_id:"123",
  username:"office",
  display_name:"Office",
  biography:"test",
  profile_picture_url:"https://example.com/p.jpg",
  token_ciphertext:"MUST_NOT_LEAK",
  token_expires_at:"2026-12-01T00:00:00Z",
  granted_scope:"threads_basic threads_content_publish",
  identity_verified:1,
  verified_at:"2026-09-29T00:00:00Z",
  updated_at:"2026-09-29T00:00:00Z",
}, { THREADS_OFFICE_TEST_PUBLISH_ENABLED:"true", THREADS_OFFICE_TEST_EXPECTED_USERNAME:"office" });
assert.equal("token_ciphertext" in publicView, false);
assert.equal(publicView.identity_verified, true);
assert.equal(publicView.publish_enabled, true);
assert.equal(publicView.expected_username, "office");

const coreSource = await readFile(new URL("../functions/api/_lib/threads-brand-connector.mjs", import.meta.url), "utf8");
const startSource = await readFile(new URL("../functions/api/internal/social/threads/start.ts", import.meta.url), "utf8");
const callbackSource = await readFile(new URL("../functions/api/internal/social/threads/callback.ts", import.meta.url), "utf8");
const connectionsSource = await readFile(new URL("../functions/api/internal/social/threads/connections.ts", import.meta.url), "utf8");
const publishSource = await readFile(new URL("../functions/api/internal/social/threads/publish.ts", import.meta.url), "utf8");
const verifySource = await readFile(new URL("../functions/api/internal/social/threads/verify.ts", import.meta.url), "utf8");
const disconnectSource = await readFile(new URL("../functions/api/internal/social/threads/disconnect.ts", import.meta.url), "utf8");
const metricsSource = await readFile(new URL("../functions/api/internal/social/threads/metrics.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/pages/services/hermes-connect/internal/social-connections/index.astro", import.meta.url), "utf8");
const navSource = await readFile(new URL("../src/components/RepairShopOwnerNavEnhancer.astro", import.meta.url), "utf8");
const vendorRegistry = await readFile(new URL("../docs/compliance/vendor-registry.json", import.meta.url), "utf8");
const releaseDelta = await readFile(new URL("../docs/release-manifest-deltas/2026-09-29-hermes-connect-social-connections.json", import.meta.url), "utf8");

assert.match(coreSource, /auto_publish_text/);
assert.match(coreSource, /threads\.com\/oauth\/authorize/);
assert.match(coreSource, /graph\.threads\.com\/oauth\/access_token/);
assert.match(coreSource, /th_exchange_token/);
assert.match(coreSource, /th_refresh_token/);
assert.match(coreSource, /AES-GCM/);
assert.match(coreSource, /hermes_social_threads_oauth_states/);
assert.match(startSource, /requireInternalOwner/);
assert.match(callbackSource, /requireInternalOwner/);
assert.match(callbackSource, /internal\/social-connections/);
assert.match(connectionsSource, /hermes_logistics_provider:\s*"windsor_only"/);

assert.match(publishSource, /INSERT OR IGNORE INTO hermes_social_threads_publications/);
assert.match(publishSource, /office_canary_required_before_secondary_publish/);
assert.match(publishSource, /retry_allowed:\s*false/);
assert.doesNotMatch(publishSource, /hermes_logistics/);

assert.match(verifySource, /threadsBrandExpectedUsername\(brand, env\)/);
assert.match(disconnectSource, /DELETE FROM hermes_social_threads_connections/);
assert.match(disconnectSource, /provider_access_revoked:\s*false/);
assert.match(metricsSource, /readThreadsMediaInsights/);

assert.match(pageSource, /noindex,nofollow,noarchive/);
assert.match(pageSource, /Hermes Logistics stays on Windsor/);
assert.match(pageSource, /Office Threads Test/);
assert.match(pageSource, /ProgressoPro/);
assert.match(pageSource, /Hermes Business Academy/);
assert.match(pageSource, /Publish Office canary/);
assert.match(pageSource, /Disconnect locally/);
assert.match(navSource, /\$\{repairShopRoot\}\/social/);
assert.match(navSource, /href:withLocale\(`\$\{repairShopRoot\}\/social\/`\)/);
assert.doesNotMatch(navSource, /\/api\/internal\/social\/threads\/connections/);
assert.doesNotMatch(navSource, /data-hc-social-connections-link/);
assert.match(vendorRegistry, /meta-threads-owner-oauth/);
assert.match(releaseDelta, /internal\/social-connections/);

console.log("threads brand connector contract: PASS");
