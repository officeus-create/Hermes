import assert from "node:assert/strict";
import {
  FreeAiUnavailableError,
  freeAiProviderSnapshot,
  runFreeSemanticJson,
  selectFreeAiProvider,
} from "../workers/automation-engine/src/free-ai-runtime.mjs";

const empty = freeAiProviderSnapshot({});
assert.equal(empty.length, 2);
assert.equal(empty.every((provider) => provider.available === false), true);
assert.equal(selectFreeAiProvider({}), null);

await assert.rejects(
  () => runFreeSemanticJson({}, { system_prompt: "Return JSON.", user_prompt: "{}", max_output_tokens: 64 }),
  (error) => error instanceof FreeAiUnavailableError && error.code === "free_ai_unavailable",
);

const officialDeepSeek = {
  HERMES_FREE_AI_DEEPSEEK_ENABLED: "enabled",
  HERMES_FREE_AI_DEEPSEEK_COST_CLASS: "zero",
  HERMES_FREE_AI_DEEPSEEK_BASE_URL: "https://api.deepseek.com",
  HERMES_FREE_AI_DEEPSEEK_MODEL: "deepseek-chat",
};
const officialState = freeAiProviderSnapshot(officialDeepSeek).find((provider) => provider.id === "deepseek-self-hosted");
assert.equal(officialState.available, false, "Official metered DeepSeek API must never enter the free router");
assert.equal(officialState.reason, "official_deepseek_api_is_not_free_router_eligible");

const selfHostedDeepSeek = {
  HERMES_FREE_AI_DEEPSEEK_ENABLED: "enabled",
  HERMES_FREE_AI_DEEPSEEK_COST_CLASS: "zero",
  HERMES_FREE_AI_DEEPSEEK_BASE_URL: "https://deepseek.internal.example",
  HERMES_FREE_AI_DEEPSEEK_MODEL: "deepseek-v4-local",
};
assert.equal(selectFreeAiProvider(selfHostedDeepSeek)?.id, "deepseek-self-hosted");

const cloudflareEnv = {
  HERMES_FREE_AI_CLOUDFLARE_ENABLED: "enabled",
  HERMES_FREE_AI_CLOUDFLARE_MODEL: "@cf/test/free-model",
  HERMES_FREE_AI_CLOUDFLARE_FREE_ASSERTION_EXPIRES_AT: "2099-01-01T00:00:00Z",
  AI: {
    async run(model, request) {
      assert.equal(model, "@cf/test/free-model");
      assert.equal(request.temperature, 0);
      assert.ok(Array.isArray(request.messages));
      return { response: '{"priorities":[]}' };
    },
  },
};
assert.equal(selectFreeAiProvider(cloudflareEnv)?.id, "cloudflare-workers-ai");
const expiredCloudflare = {
  ...cloudflareEnv,
  HERMES_FREE_AI_CLOUDFLARE_FREE_ASSERTION_EXPIRES_AT: "2020-01-01T00:00:00Z",
};
assert.equal(selectFreeAiProvider(expiredCloudflare), null, "Expired free eligibility must fail closed");
assert.equal(
  freeAiProviderSnapshot(expiredCloudflare).find((provider) => provider.id === "cloudflare-workers-ai").reason,
  "free_assertion_expired",
);
const cloudflareResult = await runFreeSemanticJson(cloudflareEnv, {
  system_prompt: "Return JSON only.",
  user_prompt: '{"defects":[]}',
  max_output_tokens: 128,
});
assert.equal(cloudflareResult.provider_id, "cloudflare-workers-ai");
assert.equal(cloudflareResult.cost_usd, 0);
assert.deepEqual(cloudflareResult.result, { priorities: [] });

const quotaEnv = {
  ...cloudflareEnv,
  AI: {
    async run() {
      throw new Error("429 quota exceeded");
    },
  },
};
await assert.rejects(
  () => runFreeSemanticJson(quotaEnv, {
    system_prompt: "Return JSON only.",
    user_prompt: '{"defects":[]}',
    max_output_tokens: 128,
  }),
  (error) => error instanceof FreeAiUnavailableError
    && error.code === "free_ai_unavailable"
    && error.reason === "cloudflare_free_capacity_unavailable",
);

assert.equal(
  freeAiProviderSnapshot({
    HERMES_FREE_AI_DEEPSEEK_ENABLED: "enabled",
    HERMES_FREE_AI_DEEPSEEK_COST_CLASS: "paid",
    HERMES_FREE_AI_DEEPSEEK_BASE_URL: "https://deepseek.internal.example",
    HERMES_FREE_AI_DEEPSEEK_MODEL: "deepseek-v4-local",
  }).find((provider) => provider.id === "deepseek-self-hosted").available,
  false,
  "DeepSeek endpoint needs explicit zero-cost attestation",
);

console.log("HAE free-AI runtime PASS: no provider -> durable wait candidate; paid DeepSeek API rejected");
