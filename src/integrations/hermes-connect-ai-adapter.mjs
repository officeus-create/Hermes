const DEFAULT_MCP_URL = "https://hermeslogisticsus.com/api/hermes-connect/mcp";

const rpcHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

async function rpc(url, method, params = {}, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: rpcHeaders,
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
  });
  if (!response.ok) throw new Error(`Hermes MCP HTTP ${response.status}`);
  const payload = await response.json();
  if (payload?.error) throw new Error(payload.error.message || "Hermes MCP error");
  return payload.result;
}

export async function discoverHermesTools({
  mcpUrl = DEFAULT_MCP_URL,
  fetchImpl = fetch,
} = {}) {
  await rpc(
    mcpUrl,
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "hermes-connect-ai-adapter", version: "1.0.0" },
    },
    fetchImpl,
  );
  const result = await rpc(mcpUrl, "tools/list", {}, fetchImpl);
  const tools = Array.isArray(result?.tools) ? result.tools : [];
  return tools.map((tool) => ({
    name: tool.name,
    title: tool.title || tool.name,
    description: tool.description || "",
    inputSchema: tool.inputSchema || { type: "object", properties: {} },
    annotations: tool.annotations || {},
  }));
}

export async function callHermesTool(
  name,
  args = {},
  {
    mcpUrl = DEFAULT_MCP_URL,
    fetchImpl = fetch,
  } = {},
) {
  if (!name || typeof name !== "string") throw new Error("tool name required");
  if (!args || typeof args !== "object" || Array.isArray(args)) throw new Error("tool args must be an object");
  const result = await rpc(
    mcpUrl,
    "tools/call",
    { name, arguments: args },
    fetchImpl,
  );
  if (result?.isError) throw new Error(result?.content?.[0]?.text || "Hermes tool failed");
  return result?.structuredContent ?? result;
}

export function toOpenAIChatTools(tools) {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

export function toOpenAIResponsesTools(tools) {
  return tools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));
}

export function toGeminiRemoteMcpTool({
  mcpUrl = DEFAULT_MCP_URL,
  name = "hermes_connect",
  headers,
} = {}) {
  if (name.includes("-")) throw new Error("Gemini MCP server name must not contain '-'");
  return {
    type: "mcp_server",
    name,
    url: mcpUrl,
    ...(headers ? { headers } : {}),
  };
}

export function toXaiRemoteMcpTool({
  mcpUrl = DEFAULT_MCP_URL,
  serverLabel = "hermes_connect",
  serverDescription = "Hermes Connect CRM business, routing, onboarding, and product-learning tools.",
  authorization,
  headers,
  allowedTools,
} = {}) {
  return {
    type: "mcp",
    server_url: mcpUrl,
    server_label: serverLabel,
    server_description: serverDescription,
    ...(authorization ? { authorization } : {}),
    ...(headers ? { headers } : {}),
    ...(Array.isArray(allowedTools) && allowedTools.length ? { allowed_tools: allowedTools } : {}),
  };
}

export function createDeepSeekToolExecutor({
  tools,
  mcpUrl = DEFAULT_MCP_URL,
  fetchImpl = fetch,
} = {}) {
  const known = new Set((tools || []).map((tool) => tool.name));
  return async function execute(toolCall) {
    const fn = toolCall?.function;
    const name = fn?.name;
    if (!known.has(name)) throw new Error(`Unknown Hermes tool: ${name || "missing"}`);
    let args = {};
    if (typeof fn.arguments === "string" && fn.arguments.trim()) {
      try {
        args = JSON.parse(fn.arguments);
      } catch {
        throw new Error("Invalid JSON tool arguments");
      }
    }
    return callHermesTool(name, args, { mcpUrl, fetchImpl });
  };
}

export function createHermesActionSystemPrompt() {
  return [
    "You are using Hermes Connect as an action layer.",
    "Lead with 1–3 concrete next actions, not a long diagnosis.",
    "Recommend only connectors that materially reduce repeated input or improve evidence.",
    "Ask at most 5 missing questions and ask none when context already answers them.",
    "If CRM is justified, produce or execute the smallest CRM bootstrap/provisioning step.",
    "Do not claim background work without a durable Hermes ProvisioningRequest/ProvisioningJob ID.",
    "Installation, recommendation, conversation, or routing is not a lead, customer, payment, or revenue.",
  ].join(" ");
}

export { DEFAULT_MCP_URL };
