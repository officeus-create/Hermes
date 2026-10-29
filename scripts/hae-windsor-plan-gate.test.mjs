import assert from "node:assert/strict";
import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorProviderResponseError,
} from "../workers/automation-engine/src/windsor-threads.mjs";

const env = {
  WINDSOR_API_KEY: "synthetic-test-key-never-a-credential",
  WINDSOR_THREADS_ACCOUNT_ID: "28419597014385166",
};
const post = "Car haulers: which lane is hardest to reload?\n\nCheck route and equipment fit first.";
const providerWarning = "Uh-oh! These are not your real numbers: reads are paused because you have 3 accounts connected (googleanalytics4: 1, instagram: 1, threads: 1) and your Free plan includes 1 account. To resume, disconnect 2 accounts or upgrade at https://onboard.windsor.ai/app/pricing";
function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}
async function withFetch(fake, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = fake;
  try { return await fn(); } finally { globalThis.fetch = original; }
}

assert.equal(windsorProviderResponseError({ result: providerWarning }), "windsor_plan_account_limit");
assert.equal(windsorProviderResponseError({
  data: [{ post_id: providerWarning, post_text: providerWarning }],
}), "windsor_plan_account_limit");
assert.equal(windsorProviderResponseError({ success: false, message: "Account permission denied" }), "provider_rejected");
assert.equal(windsorProviderResponseError({ result: "Accepted by provider" }), null);

{
  let providerCalls = 0;
  const result = await withFetch(async (_url, options) => {
    providerCalls += 1;
    assert.equal(options.method, "POST");
    const sent = JSON.parse(options.body);
    assert.equal(sent.account, "28419597014385166");
    assert.equal(sent.action, "create_text_post");
    return jsonResponse({ result: providerWarning });
  }, () => publishThreadsTextViaWindsor(env, post));
  assert.equal(providerCalls, 1);
  assert.deepEqual(result, { ok: false, error_class: "windsor_plan_account_limit" });
  assert.equal(result.accepted, undefined);
}
{
  const result = await withFetch(async () => jsonResponse({
    data: [{ post_id: providerWarning, post_text: providerWarning, data_fetched_at: null }],
  }), () => readbackThreadsTextViaWindsor(env, post));
  assert.deepEqual(result, { ok: false, error_class: "windsor_plan_account_limit" });
}
{
  const result = await withFetch(async () => jsonResponse({ result: "Created successfully" }),
    () => publishThreadsTextViaWindsor(env, post));
  assert.equal(result.ok, true);
  assert.equal(result.accepted, true);
}
{
  const result = await withFetch(async () => jsonResponse({
    data: [{
      post_id: "18190933357397406",
      post_text: post,
      post_permalink: "https://www.threads.com/@hermes.logistics/post/Dd2dlMnjCwo",
      post_timestamp: "2026-10-28T12:00:00Z",
    }],
  }), () => readbackThreadsTextViaWindsor(env, post));
  assert.equal(result.ok, true);
  assert.equal(result.found, true);
  assert.equal(result.provider_post_id, "18190933357397406");
}
{
  const result = await withFetch(async () => jsonResponse({ error: "Forbidden" }, 403),
    () => publishThreadsTextViaWindsor(env, post));
  assert.equal(result.ok, false);
  assert.equal(result.error_class, "windsor_write_action_not_enabled");
}
{
  const result = await withFetch(async () => { throw new Error("synthetic network fault"); },
    () => publishThreadsTextViaWindsor(env, post));
  assert.deepEqual(result, { ok: false, error_class: "provider_outcome_unknown" });
}
console.log("HAE Windsor Threads plan-limit fail-closed PASS (7 cases; no real provider writes)");
