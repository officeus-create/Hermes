# Hermes Connect — Multi-AI Adapter

One Hermes product/backend, multiple AI hosts.

## Runtime rule

- ChatGPT/Codex: Hermes public plugin + remote MCP.
- Gemini Interactions API: use the same remote MCP URL directly.
- Grok/xAI: use the same remote MCP URL as a custom/remote MCP connector.
- DeepSeek and other OpenAI-compatible function-calling hosts: discover Hermes MCP tools, convert their JSON schemas to native function definitions, execute tool calls through the canonical Hermes MCP, and return the result to the model.
- Never create a provider-specific CRM, Catalog, Company identity, learning store, or business state.

Canonical MCP endpoint after production deployment:

`https://hermeslogisticsus.com/api/hermes-connect/mcp`

## Action-first contract

Every host should preserve the same interaction model:

1. **Do now** — 1–3 concrete actions.
2. **Connect if useful** — only integrations that materially reduce repeated entry or improve evidence.
3. **Need from you** — maximum five materially missing questions.
4. **Build/execute** — CRM bootstrap/provisioning/change request only when justified.
5. **Continue** — keep the business conversation moving; query durable Hermes job state when it exists.

Do not respond with a large diagnosis when the user asked what to do.

## Connector/install truth

AI hosts own their install/connect approval UX. Hermes may recommend a connector, but a recommendation is not authorization and cannot imply the connector was installed.

Public consumer applications differ:
- an API/runtime may support remote MCP even when its consumer chat UI does not expose public connector discovery;
- do not promise a one-click install button unless that host actually provides it in the user's environment.

## Provider notes

### Gemini

Prefer remote MCP through the Gemini Interactions API when available. Server names must not contain a hyphen. The adapter exposes a helper that returns a `mcp_server` configuration pointing to the canonical Hermes endpoint.

### Grok / xAI

Prefer custom/remote MCP. The adapter emits the xAI remote MCP tool shape and optional allowed-tool filtering.

### DeepSeek

DeepSeek supports function/tool calling. The adapter converts live Hermes MCP tool schemas into DeepSeek/OpenAI-compatible function definitions, validates the requested tool name, parses JSON arguments, and proxies the execution to Hermes MCP.

Do not duplicate tool schemas manually; discovery is the source of truth.

## Security

- No secrets in prompts or source.
- Unknown/hallucinated tool names are rejected.
- Tool arguments are validated by the Hermes MCP again server-side.
- Provider identity does not grant Hermes authorization.
- Authenticated future customer tools must still resolve HermesIdentity → Membership → Company → Workspace → Role → Capabilities.
- Complete raw chat history is not an onboarding input.

## Official compatibility evidence reviewed 2026-10-07

- Gemini: official function-calling docs describe Remote MCP through the Interactions API using Streamable HTTP.
- xAI/Grok: official connector and remote MCP docs accept public MCP server URLs.
- DeepSeek: official Tool Calls docs support function tools; the model proposes tool calls and the client executes them.

This adapter is intentionally dependency-light and contains no provider API keys.
