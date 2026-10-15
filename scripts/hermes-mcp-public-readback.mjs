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

// Never send a consent=true probe to production: on a misconfigured host it
// could write a real D1 feedback row. A consent=false call is a safe negative
// probe: it must still be denied at the executable boundary when preview-only.
const assertPublicWriterDenied = async (modern, id) => {
  const params = {
    name: "submit_product_feedback",
    arguments: {
      business_type: "synthetic readback",
      problem_class: "release safety check",
      desired_capability: "no public writer",
      outcome: "other",
      consent_to_product_learning: false,
    },
    ...(modern ? { _meta: metadata } : {}),
  };
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": modern ? version : "2025-06-18",
    ...(modern ? { "Mcp-Method": "tools/call", "Mcp-Name": "submit_product_feedback" } : {}),
  };
  const response = await fetch(endpoint, {
    method: "POST", headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params }),
    redirect: "error", signal: AbortSignal.timeout(12000),
  });
  const payload = await response.json();
  if (response.status !== 403 || payload?.id !== id ||
      payload?.error?.code !== -32000 ||
      payload?.error?.message !== "Write tool unavailable in preview-only mode") {
    throw new Error(`Public MCP writer was not denied in ${modern ? "modern" : "legacy"} mode`);
  }
};

const fetchLegacyToolNames = async () => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 14, method: "tools/list", params: {} }),
    redirect: "error", signal: AbortSignal.timeout(12000),
  });
  const payload = await response.json();
  if (!response.ok || payload?.id !== 14 || !Array.isArray(payload?.result?.tools)) {
    throw new Error("Legacy public MCP tool listing not verified");
  }
  return payload.result.tools.map(t => t.name);
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
  if (names.includes("submit_product_feedback")) {
    throw new Error("Modern MCP still exposes a D1-writing public feedback tool");
  }
  const legacyNames = await fetchLegacyToolNames();
  if (legacyNames.includes("submit_product_feedback")) {
    throw new Error("Legacy MCP still exposes a D1-writing public feedback tool");
  }
  await assertPublicWriterDenied(true, 15);
  await assertPublicWriterDenied(false, 16);
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
  if (!names.includes("preview_agent_handoff")) {
    throw new Error("Agent routing preview not deployed on verified endpoint");
  }
  if (!legacyNames.includes("preview_agent_handoff")) {
    throw new Error("Legacy public agent routing is not exposed");
  }
  const handoff = await fetchRpc({ id: 13, method: "tools/call", params: {
    name: "preview_agent_handoff",
    arguments: {
      task_category: "identity_mcp",
      goal: "Verify social sign-in and public MCP compatibility",
    },
  } });
  const route = handoff.structuredContent;
  if (handoff.isError || route?.status !== "ROUTED_NOT_EXECUTED" ||
      route?.accountable_employee !== "Hermes Technology Developer" ||
      !Array.isArray(route?.actions_performed) || route.actions_performed.length !== 0) {
    throw new Error("Remote agent routing has not proved safe no-execution semantics");
  }
  if (!route.why_not_executed?.includes("cannot invoke private plugins")) {
    throw new Error("Remote agent routing hides essential private-tool limitation");
  }
  console.log(JSON.stringify({
    status: "MCP_PUBLIC_FUNNEL_AND_ROUTING_LIVE_VERIFIED",
    endpoint,
    version,
    tools: ["preview_crm_funnel", "preview_agent_handoff"],
    routedNotExecuted: route.status,
    stages: funnel.stages.length,
    publicWriter: "HIDDEN_AND_DIRECT_CALL_DENIED_BOTH_PROTOCOLS",
    writerNegativeProbe: "consent=false (zero write intent)",
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
