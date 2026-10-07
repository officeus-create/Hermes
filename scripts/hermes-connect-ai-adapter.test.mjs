import assert from "node:assert/strict";
import test from "node:test";
import {
  callHermesTool,
  createDeepSeekToolExecutor,
  createHermesActionSystemPrompt,
  discoverHermesTools,
  toGeminiRemoteMcpTool,
  toOpenAIChatTools,
  toOpenAIResponsesTools,
  toXaiRemoteMcpTool,
} from "../src/integrations/hermes-connect-ai-adapter.mjs";

const discovered = [
  {
    name: "build_crm_onboarding_plan",
    title: "Build CRM onboarding plan",
    description: "Action-first CRM onboarding.",
    inputSchema: {
      type: "object",
      properties: { business_type: { type: "string" } },
      required: ["business_type"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
];

function mockFetch(expectedToolResult = { route: "CRM_BLUEPRINT" }) {
  return async (_url, init) => {
    const req = JSON.parse(init.body);
    if (req.method === "initialize") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: req.id,
        result: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "hermes-connect", version: "1" },
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (req.method === "tools/list") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: req.id,
        result: { tools: discovered },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (req.method === "tools/call") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: req.id,
        result: {
          structuredContent: expectedToolResult,
          content: [{ type: "text", text: JSON.stringify(expectedToolResult) }],
          isError: false,
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    throw new Error("unexpected rpc");
  };
}

test("discovers Hermes MCP tools once and preserves input schemas", async () => {
  const tools = await discoverHermesTools({ fetchImpl: mockFetch() });
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, "build_crm_onboarding_plan");
  assert.equal(tools[0].inputSchema.required[0], "business_type");
});

test("maps Hermes MCP schemas to DeepSeek/OpenAI Chat Completions tools", () => {
  const tools = toOpenAIChatTools(discovered);
  assert.deepEqual(tools[0], {
    type: "function",
    function: {
      name: "build_crm_onboarding_plan",
      description: "Action-first CRM onboarding.",
      parameters: discovered[0].inputSchema,
    },
  });
});

test("maps Hermes MCP schemas to OpenAI-compatible Responses tools", () => {
  const tools = toOpenAIResponsesTools(discovered);
  assert.equal(tools[0].type, "function");
  assert.equal(tools[0].name, "build_crm_onboarding_plan");
  assert.equal(tools[0].parameters.required[0], "business_type");
});

test("builds Gemini remote MCP config and enforces its server-name constraint", () => {
  assert.equal(toGeminiRemoteMcpTool().type, "mcp_server");
  assert.equal(toGeminiRemoteMcpTool().name, "hermes_connect");
  assert.throws(() => toGeminiRemoteMcpTool({ name: "hermes-connect" }), /must not contain/);
});

test("builds xAI/Grok remote MCP config without forking schemas", () => {
  const tool = toXaiRemoteMcpTool({ allowedTools: ["build_crm_onboarding_plan"] });
  assert.equal(tool.type, "mcp");
  assert.equal(tool.server_label, "hermes_connect");
  assert.deepEqual(tool.allowed_tools, ["build_crm_onboarding_plan"]);
});

test("proxies a function-call result back to the canonical Hermes MCP", async () => {
  const exec = createDeepSeekToolExecutor({
    tools: discovered,
    fetchImpl: mockFetch({ do_now: ["Map follow-up stages"] }),
  });
  const result = await exec({
    function: {
      name: "build_crm_onboarding_plan",
      arguments: JSON.stringify({ business_type: "roofing" }),
    },
  });
  assert.deepEqual(result, { do_now: ["Map follow-up stages"] });
});

test("rejects hallucinated function names and invalid argument JSON", async () => {
  const exec = createDeepSeekToolExecutor({ tools: discovered, fetchImpl: mockFetch() });
  await assert.rejects(() => exec({ function: { name: "delete_everything", arguments: "{}" } }), /Unknown Hermes tool/);
  await assert.rejects(() => exec({ function: { name: "build_crm_onboarding_plan", arguments: "{" } }), /Invalid JSON/);
});

test("direct tool call returns structuredContent only", async () => {
  const result = await callHermesTool(
    "build_crm_onboarding_plan",
    { business_type: "repair shop" },
    { fetchImpl: mockFetch({ route: "LIVE_REPAIR_SHOPS" }) },
  );
  assert.deepEqual(result, { route: "LIVE_REPAIR_SHOPS" });
});

test("action prompt stays execution-first and truth-bounded", () => {
  const prompt = createHermesActionSystemPrompt();
  assert.match(prompt, /1–3 concrete next actions/);
  assert.match(prompt, /at most 5/);
  assert.match(prompt, /durable Hermes ProvisioningRequest\/ProvisioningJob ID/);
  assert.match(prompt, /not a lead, customer, payment, or revenue/);
});
