import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../workers/ai-control-plane/src/index.mjs", import.meta.url), "utf8");
const wrangler = readFileSync(new URL("../workers/ai-control-plane/wrangler.jsonc.example", import.meta.url), "utf8");

for (const taskType of [
  "telegram_classification",
  "translation",
  "carrier_field_extraction",
  "call_summary",
  "negotiation_analysis",
  "sales_coach",
  "academy_tutor",
  "seo_geo_analysis",
  "ai_entity_analysis",
  "hermes_connect_assistant",
]) {
  assert.ok(worker.includes(`${taskType}:`), `Missing route ${taskType}`);
}

assert.ok(worker.includes("HERMES_AI_CONTROL_TOKEN"), "Worker must require a private control token");
assert.ok(worker.includes("AI_GATEWAY_ID"), "Worker must require an explicit AI Gateway ID");
assert.ok(worker.includes("env.AI.run"), "Worker must use the Workers AI binding through AI Gateway");
assert.ok(worker.includes("const collectLog = route.loggable === true && publicSafe"), "Gateway payload logging must require both an allowlisted route and an explicit public-safe signal");
assert.ok(worker.includes('telegram_classification: { tier: "economy", cacheable: false, loggable: false }'), "Telegram content must never become loggable by caller flag alone");
assert.ok(worker.includes('ai_entity_analysis: { tier: "reasoning", cacheable: true, loggable: true }'), "Public-safe entity analysis may opt into observability");
assert.ok(worker.includes("collectLog,"), "Gateway log collection must be controlled per request");
assert.ok(!worker.includes("collectLog: true"), "Private prompts must never be unconditionally persisted in AI Gateway logs");
assert.ok(worker.includes("gateway_log_id: collectLog ?"), "Responses must expose a gateway log id only when logging was explicitly allowed");
assert.ok(worker.includes("public_safe"), "Caching must be gated by an explicit public-safe signal");
assert.ok(worker.includes("skipCache: true"), "Private/sensitive tasks must bypass AI Gateway cache by default");
assert.ok(worker.includes("AI_MODEL_FALLBACK"), "A bounded fallback model must be configurable");

assert.ok(wrangler.includes('"binding": "AI"'), "Wrangler example must configure the AI binding");
assert.ok(wrangler.includes('"AI_GATEWAY_ID": "hermes-ai-control-plane"'));
assert.ok(!wrangler.includes('"HERMES_AI_CONTROL_TOKEN":'), "Secrets must not be committed as Wrangler vars");

for (const secretPattern of ["sk-", "ghp_", "AIza", "Bearer eyJ"]) {
  assert.ok(!worker.includes(secretPattern) && !wrangler.includes(secretPattern), `No secret-like value may be committed: ${secretPattern}`);
}

console.log("Cloudflare AI control plane contract passed");
