const TASK_ROUTES = Object.freeze({
  telegram_classification: { tier: "economy", cacheable: false, loggable: false },
  translation: { tier: "economy", cacheable: false, loggable: false },
  carrier_field_extraction: { tier: "economy", cacheable: false, loggable: false },
  call_summary: { tier: "economy", cacheable: false, loggable: false },
  negotiation_analysis: { tier: "reasoning", cacheable: false, loggable: false },
  sales_coach: { tier: "reasoning", cacheable: false, loggable: false },
  academy_tutor: { tier: "conversational", cacheable: false, loggable: false },
  seo_geo_analysis: { tier: "reasoning", cacheable: true, loggable: true },
  ai_entity_analysis: { tier: "reasoning", cacheable: true, loggable: true },
  hermes_connect_assistant: { tier: "conversational", cacheable: false, loggable: false },
});

const MAX_PROMPT_LENGTH = 16000;
const MAX_SYSTEM_LENGTH = 6000;

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function timingSafeEqualText(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    mismatch |= (a[index] || 0) ^ (b[index] || 0);
  }
  return mismatch === 0;
}

function cleanText(value, limit) {
  const text = String(value || "").replace(/\u0000/g, "").trim();
  if (!text || text.length > limit) return null;
  return text;
}

function routeModel(env, tier) {
  if (tier === "economy") return String(env.AI_MODEL_ECONOMY || "").trim();
  if (tier === "reasoning") return String(env.AI_MODEL_REASONING || "").trim();
  if (tier === "conversational") return String(env.AI_MODEL_CONVERSATIONAL || "").trim();
  return "";
}

async function runModel(env, model, messages, gateway, metadata, cacheOptions, collectLog) {
  return env.AI.run(
    model,
    { messages },
    {
      gateway: {
        id: gateway,
        collectLog,
        metadata,
        ...cacheOptions,
      },
    },
  );
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return json(405, { success: false, error: "method_not_allowed" });
    if (!env.AI) return json(503, { success: false, error: "workers_ai_binding_missing" });

    const expectedToken = String(env.HERMES_AI_CONTROL_TOKEN || "");
    if (!expectedToken) return json(503, { success: false, error: "control_token_not_configured" });
    const authorization = request.headers.get("Authorization") || "";
    const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!suppliedToken || !timingSafeEqualText(suppliedToken, expectedToken)) {
      return json(401, { success: false, error: "unauthorized" });
    }

    const gateway = String(env.AI_GATEWAY_ID || "").trim();
    if (!gateway) return json(503, { success: false, error: "ai_gateway_not_configured" });

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { success: false, error: "invalid_json" });
    }

    const taskType = String(body?.task_type || "").trim();
    const route = TASK_ROUTES[taskType];
    if (!route) return json(400, { success: false, error: "unsupported_task_type" });

    const prompt = cleanText(body?.prompt, MAX_PROMPT_LENGTH);
    const system = body?.system ? cleanText(body.system, MAX_SYSTEM_LENGTH) : null;
    if (!prompt || (body?.system && !system)) return json(400, { success: false, error: "invalid_prompt" });

    const primaryModel = routeModel(env, route.tier);
    const fallbackModel = String(env.AI_MODEL_FALLBACK || "").trim();
    if (!primaryModel) return json(503, { success: false, error: `model_not_configured:${route.tier}` });

    const publicSafe = body?.public_safe === true;
    const collectLog = route.loggable === true && publicSafe;
    const canCache = route.cacheable && publicSafe;
    const cacheOptions = canCache ? { skipCache: false, cacheTtl: 300 } : { skipCache: true };
    const messages = [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ];
    const metadata = {
      hermes_task_type: taskType,
      hermes_tier: route.tier,
      public_safe: publicSafe ? "true" : "false",
    };

    let response;
    let modelUsed = primaryModel;
    let fallbackUsed = false;
    try {
      response = await runModel(env, primaryModel, messages, gateway, metadata, cacheOptions, collectLog);
    } catch (primaryError) {
      if (!fallbackModel || fallbackModel === primaryModel) {
        return json(502, { success: false, error: "primary_model_failed" });
      }
      try {
        response = await runModel(
          env,
          fallbackModel,
          messages,
          gateway,
          { ...metadata, fallback: "true" },
          { skipCache: true },
          collectLog,
        );
        modelUsed = fallbackModel;
        fallbackUsed = true;
      } catch {
        return json(502, { success: false, error: "primary_and_fallback_failed" });
      }
    }

    return json(200, {
      success: true,
      task_type: taskType,
      tier: route.tier,
      model: modelUsed,
      fallback_used: fallbackUsed,
      gateway_log_id: collectLog ? env.AI.aiGatewayLogId || null : null,
      result: response,
    });
  },
};

export { TASK_ROUTES };
