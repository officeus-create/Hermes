# Hermes Connect Agent Readiness — 2026-08-11

Status: evidence captured from authenticated Cloudflare Agent Readiness screenshots supplied by the owner. This document is intentionally implementation-neutral and exists to prevent score-chasing or duplicate work across concurrent SEO/Claude/Codex sessions.

## 1. Hostname boundary

Cloudflare Diagnostics was run against:

- `app.hermeslogisticsus.com`

Repository deployment ownership currently defines:

- `connect.hermeslogisticsus.com` — approved current Hermes Connect Web App, served by the main `hermes` Cloudflare Pages project and routed by `functions/_middleware.js` to `public/demos/hermes-connect/`;
- `app.hermeslogisticsus.com` — preserved legacy booking/profile prototype on the separate `hermes-connect-prototype` Pages project.

Therefore Agent Readiness improvements for `app.` must not be treated automatically as improvements to the current Hermes Connect product. The next meaningful Cloudflare scan should target `connect.hermeslogisticsus.com` unless the owner explicitly decides that the legacy `app.` prototype remains an active agent surface.

## 2. Exact Cloudflare diagnostics captured for `app.`

### Level 1 — Quick Wins: 3/5

PASS:

- `robots.txt` — valid format detected;
- AI Crawler Rules — rules detected for AI crawlers;
- Content Signals — signals detected in `robots.txt`.

FAIL:

- Sitemap — `sitemap.xml not found`;
- Markdown Negotiation — site does not support Markdown for Agents. The Cloudflare UI states that the managed Cloudflare feature requires Pro or higher.

### Level 2 — Technical Groundwork: 0/3

- API Catalog — discovery path returned HTML instead of JSON;
- Link Headers — no discovery Link headers found on the homepage;
- `auth.md` — path returned HTML instead of Markdown.

Cloudflare's own guidance says the API Catalog should be skipped when the site has no API. `auth.md` is only meaningful when a real protected API/login contract exists.

### Level 3 — Advanced Integration: 0/8

- OAuth Discovery — no OAuth/OIDC discovery metadata;
- OAuth Protected Resource — no protected-resource metadata;
- A2A Agent Card — returned HTML instead of JSON;
- Agent Skills Index — returned HTML instead of JSON;
- MCP Server Card — not found;
- Web Bot Auth — directory returned HTML instead of JSON; scanner labels this informational;
- WebMCP — no WebMCP tools detected on page load;
- DNS-AID — well-known entrypoint records not found.

### Commerce: 0/5 — Optional

- ACP — discovery document returned HTML instead of JSON; scanner notes this is not a commerce site;
- AP2 — not detected; scanner notes this is not a commerce site;
- MPP — payment discovery not detected; scanner notes this is not a commerce site;
- UCP — profile returned HTML instead of expected format; scanner notes this is not a commerce site;
- x402 — payment protocol not detected; scanner notes this is not a commerce site.

Commerce is not an implementation target merely to increase Agent Readiness score.

## 3. Current `connect.` product boundary from repository

The approved Hermes Connect Web App is currently a controlled single-page access-request experience under `public/demos/hermes-connect/`.

Its reviewed page currently declares:

- `meta robots="noindex,nofollow"`;
- canonical URL `https://hermeslogisticsus.com/demos/hermes-connect/`;
- current boundary that the page accepts Web App access requests only and does not automatically create an account, booking, payment, calendar event, or subscription.

This means publishing a `connect.hermeslogisticsus.com/sitemap.xml` that advertises the Connect root as an indexable canonical page would conflict with the present noindex/canonical contract. Do not add such a sitemap only to make Cloudflare show 4/5.

## 4. Implementation decisions

### Safe now

- preserve current `robots.txt`, AI Crawler Rules and Content Signals behavior;
- use Cloudflare Diagnostics as an evidence source;
- re-scan the correct current hostname (`connect.`) before changing code;
- keep root-site SEO/Agentic Browsing work separate from Hermes Connect product-agent work;
- document future machine interfaces only after a real endpoint or tool contract exists.

### Not safe to implement yet

Do not create placeholders purely for score:

- API Catalog without a stable public API;
- `auth.md` without a real supported registration/login flow for agents;
- OAuth metadata without a working authorization server and protected-resource contract;
- A2A card before Hermes Connect actually exposes an agent endpoint;
- Skills Index before there are real, versioned agent skills;
- MCP Server Card before a live MCP server exists;
- WebMCP declarations before reviewed browser actions exist;
- DNS-AID before Hermes operates outbound/discoverable AI agents;
- ACP/AP2/MPP/UCP/x402 before an approved agent-commerce use case and payment backend exist.

## 5. Recommended execution order

### Phase A — verify the correct target

1. In Cloudflare Agent Readiness select `connect.hermeslogisticsus.com`.
2. Run Rescan.
3. Capture the exact pass/fail result for all levels.
4. Compare with this `app.` legacy baseline.

### Phase B — decide public discovery contract

Before adding a Connect sitemap or changing canonical/indexability, make one explicit product decision:

- remain a noindex controlled-access Web App; or
- make a defined subset of Connect public/indexable.

If the app remains noindex, a sitemap score is not worth contradicting the product boundary.

### Phase C — first real agent capability

When Hermes Connect gains a stable machine capability, implement discovery in this order:

1. stable API/tool contract;
2. machine-readable catalog/card for that real capability;
3. authentication/authorization metadata if required;
4. MCP or WebMCP only when the corresponding tools exist;
5. A2A/Skills/DNS-AID only when Hermes operates an actual discoverable agent.

## 6. Relationship to concurrent work

This report must not overlap or override:

- SEO 10 / SEO 11 root-site measurement, performance or conversion work;
- root-site Agentic Browsing task #354;
- Bing/GSC/GA4 work;
- factoring calculator work;
- Casablanca Academy work;
- IndexNow/Crawler Hints work.

Tracking issue: #393.
