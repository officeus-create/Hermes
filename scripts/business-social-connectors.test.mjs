import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  businessSocialProviderConfigured,
  businessSocialScopes,
  decryptBusinessSocialPayload,
  encryptBusinessSocialPayload,
  normalizeBusinessSocialProvider,
  publicBusinessSocialConnection,
  validBusinessSocialIdempotencyKey,
} from "../functions/api/_lib/business-social.mjs";

const tokenKey = Buffer.alloc(32, 13).toString("base64");
const metaEnv = {
  HERMES_SOCIAL_TOKEN_KEY: tokenKey,
  HERMES_META_APP_ID: "123456",
  HERMES_META_APP_SECRET: "private-secret",
  HERMES_META_OAUTH_REDIRECT_URI: "https://hermeslogisticsus.com/api/hermes-connect/social/oauth/callback",
};
const threadsEnv = {
  HERMES_SOCIAL_TOKEN_KEY: tokenKey,
  THREADS_BRAND_APP_ID: "654321",
  THREADS_BRAND_APP_SECRET: "threads-secret",
  THREADS_BRAND_REDIRECT_URI: "https://hermeslogisticsus.com/api/internal/social/threads/callback",
  THREADS_BRAND_TOKEN_KEY: tokenKey,
};

assert.equal(normalizeBusinessSocialProvider("facebook"), "facebook");
assert.equal(normalizeBusinessSocialProvider("instagram"), "instagram");
assert.equal(normalizeBusinessSocialProvider("threads"), "threads");
assert.equal(normalizeBusinessSocialProvider("linkedin"), null);
assert.equal(businessSocialProviderConfigured(metaEnv, "facebook"), true);
assert.equal(businessSocialProviderConfigured(metaEnv, "instagram"), true);
assert.equal(businessSocialProviderConfigured(metaEnv, "threads"), false);
assert.equal(businessSocialProviderConfigured(threadsEnv, "threads"), true);
assert.deepEqual(businessSocialScopes("facebook"), ["pages_show_list","pages_read_engagement","pages_manage_posts"]);
assert.ok(businessSocialScopes("instagram").includes("instagram_content_publish"));
assert.ok(businessSocialScopes("threads").includes("threads_content_publish"));

const encrypted = await encryptBusinessSocialPayload(metaEnv, {
  access_token:"synthetic-secret-token",
  page_id:"123",
});
assert.match(encrypted, /^v1\./);
assert.doesNotMatch(encrypted, /synthetic-secret-token/);
assert.equal((await decryptBusinessSocialPayload(metaEnv, encrypted)).access_token, "synthetic-secret-token");

const publicConnection = publicBusinessSocialConnection({
  provider:"instagram",
  state:"connected_write",
  account_name:"Business",
  username:"business",
  token_ciphertext:"MUST_NOT_LEAK",
  token_expires_at:"2026-12-01T00:00:00Z",
  candidate_labels_json:"[]",
}, metaEnv, "instagram");
assert.equal(publicConnection.state, "connected_write");
assert.equal(publicConnection.username, "business");
assert.equal("token_ciphertext" in publicConnection, false);
assert.ok(validBusinessSocialIdempotencyKey("hc-social-20260930-0001"));
assert.equal(validBusinessSocialIdempotencyKey("short"), null);

const core = await readFile(new URL("../functions/api/_lib/business-social.mjs", import.meta.url), "utf8");
const connections = await readFile(new URL("../functions/api/hermes-connect/social/connections.ts", import.meta.url), "utf8");
const start = await readFile(new URL("../functions/api/hermes-connect/social/oauth/start.ts", import.meta.url), "utf8");
const callback = await readFile(new URL("../functions/api/hermes-connect/social/oauth/callback.ts", import.meta.url), "utf8");
const select = await readFile(new URL("../functions/api/hermes-connect/social/select.ts", import.meta.url), "utf8");
const disconnect = await readFile(new URL("../functions/api/hermes-connect/social/disconnect.ts", import.meta.url), "utf8");
const publish = await readFile(new URL("../functions/api/hermes-connect/social/publish.ts", import.meta.url), "utf8");
const threadsCallback = await readFile(new URL("../functions/api/internal/social/threads/callback.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/BusinessSocialConnectionsWorkspace.astro", import.meta.url), "utf8");
const repairRoute = await readFile(new URL("../src/pages/services/hermes-connect/repair-shops/social.astro", import.meta.url), "utf8");
const dealerRoute = await readFile(new URL("../src/pages/services/hermes-connect/dealers/social.astro", import.meta.url), "utf8");
const repairNav = await readFile(new URL("../src/components/RepairShopOwnerNavEnhancer.astro", import.meta.url), "utf8");
const repairSettings = await readFile(new URL("../src/pages/services/hermes-connect/repair-shops/settings.astro", import.meta.url), "utf8");
const dealerWorkspace = await readFile(new URL("../src/pages/services/hermes-connect/dealers/workspace/index.astro", import.meta.url), "utf8");
const releaseDelta = await readFile(new URL("../docs/release-manifest-deltas/2026-09-30-business-social-connectors.json", import.meta.url), "utf8");

assert.match(core, /AES-GCM/);
assert.match(core, /hermes_business_social_oauth_states/);
assert.match(core, /OAUTH_STATE_TTL_MS = 10 \* 60 \* 1000/);
assert.match(core, /INSERT OR IGNORE INTO hermes_business_social_publications/);
assert.match(core, /selection_required/);
assert.match(core, /pages_manage_posts/);
assert.match(core, /instagram_content_publish/);
assert.match(core, /media_type: "CAROUSEL"/);
assert.match(core, /media_publish/);
assert.match(core, /pageId}\/feed/);
assert.match(core, /publishThreadsText/);
assert.match(core, /COALESCE\(excluded\.token_ciphertext/);

for (const source of [connections,start,callback,select,disconnect,publish]) {
  assert.match(source, /getAuthenticatedSpecialist/);
}
assert.match(start, /sameOriginMutation/);
assert.match(select, /sameOriginMutation/);
assert.match(disconnect, /sameOriginMutation/);
assert.match(publish, /sameOriginMutation/);
assert.match(publish, /idempotency_key/);
assert.match(publish, /provider_outcome_unknown/);
assert.match(threadsCallback, /consumeBusinessSocialOAuthState/);
assert.match(threadsCallback, /connectBusinessThreadsFromCode/);

assert.match(component, /Facebook/);
assert.match(component, /Instagram/);
assert.match(component, /Threads/);
assert.match(component, /Publish carousel/);
assert.match(component, /Publish to Threads/);
assert.match(component, /canonical Hermes Social Publisher/);
assert.doesNotMatch(component, /setInterval\(/);
assert.match(repairRoute, /noindex,nofollow,noarchive/);
assert.match(dealerRoute, /noindex,nofollow,noarchive/);
assert.match(repairNav, /repairShopRoot}\/"social"/);
assert.match(repairNav, /repair-shops\/social\//);
assert.doesNotMatch(repairNav, /api\/internal\/social\/threads\/connections/);
assert.match(repairSettings, /repair-shops\/social\//);
assert.match(dealerWorkspace, /dealers\/social\/\?provider=/);
assert.doesNotMatch(dealerWorkspace, /data-prepare-provider/);
assert.match(releaseDelta, /repair-shops\/social/);
assert.match(releaseDelta, /dealers\/social/);

console.log("business social connectors contract: PASS");
