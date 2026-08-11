# Hermes Connect Agent Readiness — 2026-08-11

Status: authenticated Cloudflare Agent Readiness evidence captured for both the preserved legacy prototype (`app.hermeslogisticsus.com`) and the approved current Hermes Connect Web App (`connect.hermeslogisticsus.com`). This document exists to prevent score-chasing, fake protocol placeholders, or duplicate work across concurrent SEO/Claude/Codex sessions.

## 1. Hostname boundary

Repository deployment ownership currently defines:

- `connect.hermeslogisticsus.com` — approved current Hermes Connect Web App, served by the main `hermes` Cloudflare Pages project and routed by `functions/_middleware.js` to `public/demos/hermes-connect/`;
- `app.hermeslogisticsus.com` — preserved legacy booking/profile prototype on the separate `hermes-connect-prototype` Pages project.

The owner first supplied a full authenticated scan of `app.` and then, at approximately 17:08–17:09 local time on 2026-08-11, supplied the requested authenticated scan of the correct current hostname `connect.hermeslogisticsus.com`.

The `connect.` scan is now the authoritative Agent Readiness baseline for current Hermes Connect work.

## 2. Current authoritative Cloudflare diagnostics — `connect.hermeslogisticsus.com`

### Level 1 — Quick Wins: 3/5

PASS:

- `robots.txt` — valid format detected;
- AI Crawler Rules — AI crawler rules detected;
- Content Signals — signals detected in `robots.txt`.

FAIL:

- Sitemap — `sitemap.xml not found`;
- Markdown Negotiation — `Site does not support Markdown for Agents`.

Cloudflare's UI states its managed "Markdown for Agents" switch requires Pro or higher. A repository implementation for equivalent content negotiation is being evaluated separately; Cloudflare may or may not recognize a custom implementation in this beta scanner.

### Level 2 — Technical Groundwork: 0/3

- API Catalog — `API Catalog not found`;
- Link Headers — `No Link headers found on homepage`;
- `auth.md` — `auth.md not found`.

Important interpretation:

- Cloudflare explicitly says to skip API Catalog if the site has no API;
- `auth.md` should describe a real registration/sign-in contract and should not be fabricated before such a flow exists;
- Link Headers should point to real structured/API resources, not placeholders created only for the score.

### Level 3 — Advanced Integration: 0/8

- OAuth Discovery — no OAuth/OIDC discovery metadata found;
- OAuth Protected Resource — no protected-resource metadata found;
- A2A Agent Card — `A2A Agent Card not found`;
- Agent Skills Index — `Agent Skills Index not found`;
- MCP Server Card — `MCP Server Card not found`;
- Web Bot Auth — directory returned informational-only/non-usable discovery output;
- WebMCP — `No WebMCP tools detected on page load`;
- DNS-AID — `DNS for AI Discovery (DNS-AID) well-known entrypoint records not found`.

These are not eight bugs. Most are capability-discovery checks that should pass only after Hermes Connect genuinely offers the corresponding capability.

### Commerce: 0/5 — Optional

- ACP — discovery document not found; scanner identifies the target as not a commerce site;
- AP2 — not detected / no A2A Agent Card; scanner identifies the target as not a commerce site;
- MPP — payment discovery not detected; scanner identifies the target as not a commerce site;
- UCP — profile not found; scanner identifies the target as not a commerce site;
- x402 — payment protocol not detected; scanner identifies the target as not a commerce site.

Commerce is not an implementation target merely to increase Agent Readiness score.

## 3. Comparison with the legacy `app.` scan

The score shape is the same on both hosts:

- Quick Wins: 3/5;
- Technical Groundwork: 0/3;
- Advanced Integration: 0/8;
- Commerce: 0/5 optional.

However the current `connect.` host is cleaner at several discovery paths: instead of some legacy paths falling through to generic HTML, the scanner reports several resources as simply not found (for example API Catalog, `auth.md`, A2A card and Skills Index). This is still a fail in the beta score, but it is a more accurate representation of absent capabilities than serving unrelated HTML.

The legacy `app.` scan remains historical evidence only and must not drive current product implementation.

## 4. Current `connect.` product boundary from repository

The approved Hermes Connect Web App is currently a controlled single-page access-request experience under `public/demos/hermes-connect/`.

Its reviewed page currently declares:

- `meta robots="noindex,nofollow"`;
- canonical URL `https://hermeslogisticsus.com/demos/hermes-connect/`;
- current boundary that the page accepts Web App access requests only and does not automatically create an account, booking, payment, calendar event, or subscription.

This means publishing a `connect.hermeslogisticsus.com/sitemap.xml` that advertises the Connect root as an indexable canonical page would conflict with the present noindex/canonical contract. Do not add such a sitemap only to make Cloudflare show 4/5.

A sitemap becomes appropriate only after an explicit product/indexability decision defines which Connect URLs are intended to be public canonical discovery surfaces.

## 5. Implementation decisions after the correct-host rescan

### Safe now

- preserve current `robots.txt`, AI Crawler Rules and Content Signals behavior;
- keep the correct-host baseline fixed at `connect.`;
- test a bounded Markdown content-negotiation implementation without changing browser HTML or the noindex boundary;
- keep root-site SEO/Agentic Browsing work separate from Hermes Connect product-agent work;
- document future machine interfaces only after a real endpoint or tool contract exists.

### Do not create placeholders for score

Do not create:

- API Catalog without a stable public API;
- Link Headers pointing to nonexistent catalogs or tools;
- `auth.md` without a real supported registration/login flow for agents;
- OAuth metadata without a working authorization server and protected-resource contract;
- A2A card before Hermes Connect actually exposes an agent endpoint;
- Skills Index before there are real, versioned agent skills;
- MCP Server Card before a live MCP server exists;
- WebMCP declarations before reviewed browser actions exist;
- DNS-AID before Hermes operates outbound/discoverable AI agents;
- ACP/AP2/MPP/UCP/x402 before an approved agent-commerce use case and payment backend exist.

## 6. Recommended execution order

### Phase A — bounded Quick Win

1. Validate the Markdown-negotiation branch/preview.
2. Keep normal browser HTML unchanged.
3. Keep `noindex,nofollow` unchanged.
4. If approved and merged, re-scan `connect.` to see whether Cloudflare recognizes the standards-based response.
5. Do not treat scanner recognition as the only success criterion; verify the actual HTTP behavior directly.

### Phase B — public discovery decision

Before adding a Connect sitemap or changing canonical/indexability, make one explicit product decision:

- remain a noindex controlled-access Web App; or
- make a defined subset of Connect public/indexable.

If the app remains noindex, a sitemap score is not worth contradicting the product boundary.

### Phase C — real machine capabilities

When Hermes Connect gains stable machine capabilities, use this sequence:

1. stable API/tool contract;
2. API Catalog and truthful discovery Link headers for those real resources;
3. authentication/authorization metadata if required;
4. MCP or WebMCP only when corresponding tools exist;
5. A2A/Skills/DNS-AID only when Hermes operates an actual discoverable agent;
6. commerce protocols only when a real approved agent-payment flow exists.

## 7. Relationship to concurrent work

This Agent Readiness track must not overlap or override:

- SEO 10 / SEO 11 root-site measurement, performance or conversion work;
- root-site Agentic Browsing task #354;
- Bing/GSC/GA4 work;
- factoring calculator work;
- Casablanca Academy work;
- IndexNow/Crawler Hints work.

Tracking issue: #393.
