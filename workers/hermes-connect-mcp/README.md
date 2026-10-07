# Hermes Connect CRM MCP

Public, least-privilege MCP surface for the Hermes Connect CRM plugin.

## Target production endpoint

`https://mcp.hermeslogisticsus.com/mcp`

The worker is intentionally read-only in v1. It exposes only public product, business-review, ecosystem-routing, trust, and product-learning-policy tools. It does **not** expose customer CRM data, One Brain, credentials, cross-tenant search, GitHub authority, billing, or mutations.

## Why MCP exists in the first public release

The OpenAI public plugin update flow currently does not support attaching a new MCP server to an already published skills-only plugin. Hermes Connect therefore ships its stable MCP origin from the first public submission, even while customer-authenticated tools remain gated.

## Deployment gates

1. Deploy this Worker to a stable HTTPS Hermes-owned host.
2. Attach the custom domain `mcp.hermeslogisticsus.com`.
3. Verify `GET /` health.
4. Verify Streamable HTTP MCP initialization and every tool with MCP Inspector.
5. Set `OPENAI_APPS_CHALLENGE_TOKEN` only after the submission portal issues the exact domain-verification token.
6. Connect the MCP server in the OpenAI plugin submission portal and run Scan Tools.
7. Do not add private/customer tools until OAuth + HermesIdentity → Membership → Company → Workspace → Role/Capabilities are live and tested.
8. Keep tool names/schemas backward compatible after publication.

## Local checks

```bash
npm install
npm test
npm run typecheck
```

Use the official `@modelcontextprotocol/server` v2 web-standard handler for Cloudflare Workers.
