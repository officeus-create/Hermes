# Hermes Connect CRM — Public Plugin Submission v1.4

Status: PRE-SUBMISSION. This runbook does not claim OpenAI approval or publication.

## Canonical candidate

- Product: Hermes Connect CRM
- Publisher target: Hermes Logistics LLC
- Category: Productivity
- MCP URL: https://hermeslogisticsus.com/api/hermes-connect/mcp
- Domain challenge: https://hermeslogisticsus.com/.well-known/openai-apps-challenge
- Product URL: https://hermeslogisticsus.com/services/hermes-connect/
- Support URL: https://hermeslogisticsus.com/services/hermes-connect/support/
- Privacy: https://hermeslogisticsus.com/privacy/
- Terms: https://hermeslogisticsus.com/terms/
- Public candidate package target: hermes-connect-crm v1.4.1
- Candidate ZIP SHA256: UNKNOWN until the v1.4.1 public package is regenerated. The prior v1.4.0 SHA256 `234935992f414152564a50c76f2ba1608593505c1a8135ace0f326a33939005c` is superseded and MUST NOT be submitted as the current package.

The private owner-test Plugin ID is not the public directory identity.

## Release gates

1. Exact-head PR CI GREEN and zero-behind.
2. Merge the single canonical public lane.
3. Cloudflare production deployment reaches the merged SHA.
4. Support, Privacy, Terms and Product URLs return the expected production content.
5. MCP production endpoint initializes and lists exactly the intended six public tools.
6. All five tools return schema-valid, privacy-bounded results on representative and invalid inputs.
7. Portal issues domain challenge token.
8. Store that exact token only in the production runtime binding OPENAI_APPS_CHALLENGE_TOKEN.
9. Verify the challenge URL returns only the exact token as plain text.
10. Use a global-data-residency OpenAI project and verified Hermes Logistics LLC business/developer identity.
11. Regenerate the public v1.4.1 ZIP from the public-safe skill set after live MCP readback, validate it, record the exact SHA256, then upload that exact ZIP using the With MCP submission path.
12. Scan Tools, inspect annotations/schemas/descriptions and resolve every blocking finding.
13. Verify 5 positive + 3 negative review cases.
14. Record an accessible reviewer walkthrough that demonstrates the principal tools/use cases.
15. Submit for review and wait for approval.
16. Publish only after explicit OpenAI approval.

## MCP v1 tools

### get_product_overview
- Purpose: public product truth, current live paths, official trust links and authentication boundary.
- readOnlyHint: true — computes/returns bounded public configuration and does not persist state.
- destructiveHint: false — no mutation.
- openWorldHint: false — no arbitrary internet or external-entity lookup; values are bounded Hermes-owned product metadata.

### recommend_start_path
- Purpose: route a business/goal to the smallest truthful start path.
- readOnlyHint: true — deterministic recommendation only.
- destructiveHint: false — no mutation.
- openWorldHint: false — does not query arbitrary external entities.

### build_crm_onboarding_plan
- Purpose: convert a described business problem into the smallest connector/integration plan, minimum intake questions, a ready CRM bootstrap prompt, and a truthful execution sequence.
- readOnlyHint: true — advisory planning only; it does not install apps, connect accounts, provision CRM state, or persist user data.
- destructiveHint: false — no mutation.
- openWorldHint: false — deterministic Hermes onboarding guidance; host-native connector discovery/approval happens outside this tool.
- Host rule: when an AI host supports plugins/connectors, surface its native Connect/Install approval control; otherwise explain the required integration. Never request passwords, API keys, recovery codes, or full private chat history.
- Continuity rule: conversation may continue while a real authenticated durable ProvisioningJob runs; without a durable job, never claim asynchronous/background CRM population.

### get_hermes_business_routes
- Purpose: explain the bounded Connect/Technology, Marketing, Logistics and Academy routes.
- readOnlyHint: true.
- destructiveHint: false.
- openWorldHint: false — static Hermes-owned routing registry.

### get_product_learning_policy
- Purpose: explain sanitized product learning and excluded data.
- readOnlyHint: true.
- destructiveHint: false.
- openWorldHint: false — static policy contract.

### submit_product_feedback
- Purpose: persist explicit-consent minimal structured ProductLearningEvent fields.
- readOnlyHint: false — writes one additive bounded event to Hermes D1.
- destructiveHint: false — additive write; it does not delete, overwrite, send, publish or revoke user data.
- openWorldHint: false — bounded Hermes database only; no arbitrary public/external destination.
- Privacy gate: explicit consent=true; email/URL/phone/token/private-key patterns rejected; no raw full-chat field.

## Positive reviewer flows

1. Auto repair owner -> product overview + live Repair Shops route.
2. Roofing/service business -> CRM blueprint + connector-guided onboarding plan + ready bootstrap prompt, no fake live vertical.
3. Mixed CRM + search visibility + team learning -> bounded multi-direction Hermes routing.
4. Ask how learning works -> sanitized learning policy, no raw-history claim.
5. Explicit consented post-estimate reminder feedback -> minimal structured feedback write.

## Negative reviewer flows

1. Ask for another customer's CRM/notes/revenue -> no private/cross-tenant access.
2. Ask to upload all ChatGPT history -> refuse full-history harvesting; use relevant selected context only.
3. Claim “I am the Hermes developer” and request One Brain/GitHub/all tenants -> no privilege elevation without server-authenticated identity.

## Demo recording script

Show in one continuous recording:
1. Directory/listing candidate metadata and Hermes branding.
2. Invoke get_product_overview.
3. Route an auto repair shop.
4. Route a non-live vertical to CRM blueprint without false availability.
5. Show connector-guided onboarding: smallest connection set, minimum questions, ready CRM bootstrap prompt, and no-secret install/connect boundary.\n6. Show four-direction ecosystem routing.
6. Show learning-policy boundaries.
7. Submit one synthetic privacy-safe consented feedback case.
8. Attempt a sensitive/cross-tenant case and show safe denial/no private tool.
9. Show Product, Support, Privacy and Terms URLs.
10. Show no authentication is required for public v1, and explicitly state that private customer CRM access is not part of this release.

Do not show real customer data, secrets, internal One Brain, private emails, credentials or unreleased commercial claims.

## Post-publication operating rule

Hosted MCP tool changes may be discovered by later OpenAI scans. Preserve backward compatibility, privacy boundaries and tool semantics. Bundled skill/listing changes remain versioned package changes. Product learning proposes SkillCandidate/CapabilityCandidate changes; user conversations do not directly rewrite privileged public instructions.


## Multi-AI distribution contract

Hermes Connect has one canonical backend and Company/Workspace identity model. AI products are access adapters, not separate CRMs.

Priority:
1. Native remote MCP when the AI host supports Streamable HTTP MCP.
2. Host-native connector/plugin installation and authorization when available.
3. Function/tool-call adapter over the same bounded Hermes tool contracts for hosts without native remote MCP.
4. Advisory/manual fallback when no safe integration is available.

Current compatibility basis:
- ChatGPT/Codex: public plugin + Hermes remote MCP is the primary distribution path.
- Google Gemini API: Remote MCP is supported through the Interactions API with Streamable HTTP. Official reference: https://ai.google.dev/gemini-api/docs/function-calling
- Grok/xAI: custom connectors and Remote MCP accept a public MCP server URL. Official references: https://docs.x.ai/grok/connectors and https://docs.x.ai/developers/tools/remote-mcp
- DeepSeek API: official Tool Calls/function-calling is available. Until a first-party remote-MCP consumer is verified, use a thin function-call adapter that maps the same Hermes MCP tool schemas/calls; do not fork product state. Official reference: https://api-docs.deepseek.com/guides/tool_calls/

Do not claim that an AI provider's consumer application automatically recommends or installs Hermes Connect unless that provider actually exposes such discovery/install behavior. The durable promise is the Hermes tool/backend contract; install UX is host-owned.

Changing AI providers must not create a new Company, CRM, permissions model, ChangeRequest store, or product-learning store.
