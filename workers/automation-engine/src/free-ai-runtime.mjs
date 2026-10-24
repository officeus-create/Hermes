const DEFAULT_RETRY_SECONDS = 15 * 60;
const MAX_PROMPT_CHARS = 12000;
const MAX_SYSTEM_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 1200;

function clean(value, max = 1000) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function enabled(value) {
  return String(value || "").trim().toLowerCase() === "enabled";
}

function safeHttpsUrl(value) {
  const raw = clean(value, 1000);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function deepSeekSelfHostedState(env = {}) {
  const endpoint = safeHttpsUrl(env.HERMES_FREE_AI_DEEPSEEK_BASE_URL);
  const model = clean(env.HERMES_FREE_AI_DEEPSEEK_MODEL, 200);
  const explicitlyEnabled = enabled(env.HERMES_FREE_AI_DEEPSEEK_ENABLED);
  const zeroCost = String(env.HERMES_FREE_AI_DEEPSEEK_COST_CLASS || "").trim().toLowerCase() === "zero";
  const officialPaidHost = endpoint?.hostname?.toLowerCase() === "api.deepseek.com";
  return {
    id: "deepseek-self-hosted",
    kind: "openai_compatible_https",
    configured: Boolean(endpoint && model && explicitlyEnabled && zeroCost),
    available: Boolean(endpoint && model && explicitlyEnabled && zeroCost && !officialPaidHost),
    model: model || null,
    endpoint_origin: endpoint ? endpoint.origin : null,
    reason: !explicitlyEnabled
      ? "disabled"
      : !zeroCost
        ? "zero_cost_not_attested"
        : !endpoint
          ? "endpoint_missing_or_not_https"
          : officialPaidHost
            ? "official_deepseek_api_is_not_free_router_eligible"
            : !model
              ? "model_missing"
              : "ready",
  };
}

function cloudflareWorkersAiState(env = {}, nowMs = Date.now()) {
  const model = clean(env.HERMES_FREE_AI_CLOUDFLARE_MODEL, 200);
  const explicitlyEnabled = enabled(env.HERMES_FREE_AI_CLOUDFLARE_ENABLED);
  const bindingReady = Boolean(env?.AI && typeof env.AI.run === "function");
  const expiresAt = clean(env.HERMES_FREE_AI_CLOUDFLARE_FREE_ASSERTION_EXPIRES_AT, 80);
  const expiresMs = Date.parse(expiresAt);
  const freeAssertionFresh = Number.isFinite(expiresMs) && expiresMs > nowMs;
  return {
    id: "cloudflare-workers-ai",
    kind: "workers_ai_binding",
    configured: Boolean(explicitlyEnabled && model && expiresAt),
    available: Boolean(explicitlyEnabled && model && bindingReady && freeAssertionFresh),
    model: model || null,
    free_assertion_expires_at: Number.isFinite(expiresMs) ? new Date(expiresMs).toISOString() : null,
    reason: !explicitlyEnabled
      ? "disabled"
      : !model
        ? "model_missing"
        : !expiresAt || !Number.isFinite(expiresMs)
          ? "free_assertion_missing"
          : !freeAssertionFresh
            ? "free_assertion_expired"
            : !bindingReady
              ? "binding_missing"
              : "ready",
  };
}

export function freeAiProviderSnapshot(env = {}) {
  return [
    cloudflareWorkersAiState(env),
    deepSeekSelfHostedState(env),
  ];
}

export function selectFreeAiProvider(env = {}) {
  return freeAiProviderSnapshot(env).find((provider) => provider.available) || null;
}

export class FreeAiUnavailableError extends Error {
  constructor(reason = "free_ai_unavailable", retrySeconds = DEFAULT_RETRY_SECONDS) {
    super("free_ai_unavailable");
    this.name = "FreeAiUnavailableError";
    this.code = "free_ai_unavailable";
    this.reason = clean(reason, 160) || "free_ai_unavailable";
    this.retrySeconds = Math.max(60, Math.min(24 * 60 * 60, Number(retrySeconds) || DEFAULT_RETRY_SECONDS));
  }
}

function capacityLikeError(error) {
  const raw = String(error?.message || error || "").toLowerCase();
  return /(?:429|402|403|503|529|5035|quota|rate.?limit|capacity|overload|temporar(?:y|ily)|credits?|requires?.*paid|upgrade)/.test(raw);
}

function extractJsonObject(value) {
  if (value && typeof value === "object") return value;
  const text = String(value || "").trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first < 0 || last <= first) throw new Error("free_ai_response_json_missing");
  const slice = text.slice(first, last + 1);
  if (slice.length > 20000) throw new Error("free_ai_response_too_large");
  try {
    return JSON.parse(slice);
  } catch {
    throw new Error("free_ai_response_json_invalid");
  }
}

function normalizedRequest(request = {}) {
  const systemPrompt = String(request.system_prompt || "").trim().slice(0, MAX_SYSTEM_CHARS);
  const userPrompt = String(request.user_prompt || "").trim().slice(0, MAX_PROMPT_CHARS);
  const requested = Number(request.max_output_tokens || 600);
  const maxOutputTokens = Math.max(64, Math.min(MAX_OUTPUT_TOKENS, Number.isFinite(requested) ? Math.trunc(requested) : 600));
  if (!systemPrompt || !userPrompt) throw new Error("free_ai_prompt_required");
  return { systemPrompt, userPrompt, maxOutputTokens };
}

function finiteNonnegativeInteger(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.trunc(numeric) : null;
}

function usageReceipt(rawUsage, request, result) {
  const usage = rawUsage && typeof rawUsage === "object" ? rawUsage : {};
  const inputTokens = finiteNonnegativeInteger(
    usage.input_tokens ?? usage.prompt_tokens ?? usage.inputTokens ?? usage.promptTokens
  );
  const outputTokens = finiteNonnegativeInteger(
    usage.output_tokens ?? usage.completion_tokens ?? usage.outputTokens ?? usage.completionTokens
  );
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    input_chars: request.systemPrompt.length + request.userPrompt.length,
    output_chars: JSON.stringify(result ?? null).length,
  };
}

async function runCloudflareWorkersAi(env, provider, request) {
  try {
    const response = await env.AI.run(provider.model, {
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: request.maxOutputTokens,
      temperature: 0,
    });
    const value = response?.response ?? response?.result ?? response;
    const result = extractJsonObject(value);
    return {
      provider_id: provider.id,
      model: provider.model,
      cost_usd: 0,
      usage: usageReceipt(response?.usage, request, result),
      result,
    };
  } catch (error) {
    if (capacityLikeError(error)) throw new FreeAiUnavailableError("cloudflare_free_capacity_unavailable");
    throw error;
  }
}

function deepSeekChatCompletionsUrl(originOrBase) {
  const url = new URL(originOrBase);
  const path = url.pathname.replace(/\/+$/, "");
  url.pathname = path.endsWith("/v1") ? `${path}/chat/completions` : `${path}/v1/chat/completions`;
  return url.toString();
}

async function runDeepSeekSelfHosted(env, provider, request) {
  const endpoint = safeHttpsUrl(env.HERMES_FREE_AI_DEEPSEEK_BASE_URL);
  if (!endpoint || endpoint.hostname.toLowerCase() === "api.deepseek.com") {
    throw new FreeAiUnavailableError("deepseek_self_hosted_endpoint_unavailable");
  }
  const headers = {
    "content-type": "application/json",
    "accept": "application/json",
  };
  const token = String(env.HERMES_FREE_AI_DEEPSEEK_TOKEN || "").trim();
  if (token) headers.authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(deepSeekChatCompletionsUrl(endpoint.toString()), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        temperature: 0,
        max_tokens: request.maxOutputTokens,
      }),
    });
  } catch (error) {
    throw new FreeAiUnavailableError("deepseek_self_hosted_network_unavailable");
  }
  if ([402, 429, 503, 529].includes(response.status)) {
    throw new FreeAiUnavailableError(`deepseek_self_hosted_http_${response.status}`);
  }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new Error("free_ai_provider_auth_invalid");
    throw new Error("free_ai_provider_request_failed");
  }
  const body = await response.json().catch(() => null);
  const text = body?.choices?.[0]?.message?.content;
  const result = extractJsonObject(text);
  return {
    provider_id: provider.id,
    model: provider.model,
    cost_usd: 0,
    usage: usageReceipt(body?.usage, request, result),
    result,
  };
}

export async function runFreeSemanticJson(env, request = {}) {
  const provider = selectFreeAiProvider(env);
  if (!provider) {
    const snapshot = freeAiProviderSnapshot(env);
    const reason = snapshot.map((item) => `${item.id}:${item.reason}`).join("|") || "no_free_provider";
    throw new FreeAiUnavailableError(reason);
  }
  const normalized = normalizedRequest(request);
  if (provider.id === "cloudflare-workers-ai") return runCloudflareWorkersAi(env, provider, normalized);
  if (provider.id === "deepseek-self-hosted") return runDeepSeekSelfHosted(env, provider, normalized);
  throw new FreeAiUnavailableError("free_ai_provider_not_supported");
}

export const FREE_AI_DEFAULT_RETRY_SECONDS = DEFAULT_RETRY_SECONDS;
