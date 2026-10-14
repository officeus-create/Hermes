#!/usr/bin/env node
// Read-only remote MCP proof. No credentials, CRM writes, emails or actions.
// A successful source test cannot stand in for this independent deployed readback.
const endpoint = "https://hermeslogisticsus.com/api/hermes-connect/mcp";
const version = "2026-07-28";
const metadata = {
  "io.modelcontextprotocol/protocolVersion": version,
  "io.modelcontextprotocol/clientInfo": { name: "hermes-public-readback", version: "1.0.0" },
  "io.modelcontextprotocol/clientCapabilities": {},
};
const fetchRpc = async ({ id, method, params = {} }) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": version,
    "Mcp-Method": method,
  };
  if (method === "tools/call") headers["Mcp-Name"] = String(params.name);
  const body = { jsonrpc: "2.0", id, method, params: { ...params, _meta: metadata } };
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`MCP ${method} returned HTTP ${response.status}: ${raw.slice(0, 150)}`);
  const data = JSON.parse(raw);
  if (data.jsonrpc !== "2.0" || data.id !== id || data.error) {
    throw new Error(`MCP ${method} JSON-RPC error: ${data.error?.message || "malformed_response"}`);
  }
  return data.result;
};

try {
  const discovery = await fetchRpc({ id: 10, method: "server/discover" });
  if (!Array.isArray(discovery.supportedVersions) || !discovery.supportedVersions.includes(version)) {
    throw new Error("Remote MCP does not advertise verified modern protocol");
  }
  if (discovery.resultType !== "complete" || discovery.ttlMs !== 0 ||
      discovery.cacheScope !== "private") {
    throw new Error("Modern MCP server/discover is missing required private no-cache contract");
  }
  const tools = await fetchRpc({ id: 11, method: "tools/list" });
  if (!Array.isArray(tools.tools)) throw new Error("Remote tools/list is not a tool collection");
  if (tools.resultType !== "complete" || tools.ttlMs !== 0 ||
      tools.cacheScope !== "private") {
    throw new Error("Modern MCP tools/list lacks required private no-cache contract");
  }
  const names = tools.tools.map((t) => t.name);
  if (!names.includes("preview_crm_funnel")) throw new Error("MCP funnel preview not deployed on verified endpoint");
  const preview = await fetchRpc({ id: 12, method: "tools/call", params: {
    name: "preview_crm_funnel",
    arguments: {
      business_type: "US car hauling carriers",
      goal: "Increase qualified opt-in carriers",
      entry_channel: "website",
    },
  } });
  if (preview.isError || preview.structuredContent?.status !== "PREVIEW_ONLY") {
    throw new Error("Remote MCP funnel preview has no safe PREVIEW_ONLY receipt");
  }
  const funnel = preview.structuredContent;
  if (!Array.isArray(funnel.stages) || funnel.stages.length !== 5 ||
      funnel.stages.some((stage) => stage.automation_state !== "NOT_CONNECTED")) {
    throw new Error("Remote MCP preview has unexpected stages or claims active automation");
  }
  if (!Array.isArray(funnel.not_performed) || !funnel.not_performed.some(x => /No emails/i.test(x))) {
    throw new Error("Remote MCP preview lacks explicit no-outbound declaration");
  }
  console.log(JSON.stringify({
    status: "MCP_PUBLIC_PREVIEW_LIVE_VERIFIED",
    endpoint,
    version,
    tool: "preview_crm_funnel",
    stages: funnel.stages.length,
    noCustomerWrite: true,
    authenticatedCrm: "NOT_TESTED",
  }, null, 2));
} catch (err) {
  console.error(JSON.stringify({
    status: "MCP_PUBLIC_PREVIEW_NOT_VERIFIED",
    endpoint,
    reason: err instanceof Error ? err.message : "unknown_error",
    productionResult: "NOT_PROVEN",
  }));
  process.exitCode = 1;
}
