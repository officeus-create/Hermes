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
- Public candidate package: hermes-connect-crm v1.4.0
- Candidate ZIP SHA256: 234935992f414152564a50c76f2ba1608593505c1a8135ace0f326a33939005c

The private owner-test Plugin ID is not the public directory identity.

## Release gates

1. Exact-head PR CI GREEN and zero-behind.
2. Merge the single canonical public lane.
3. Cloudflare production deployment reaches the merged SHA.
4. Support, Privacy, Terms and Product URLs return the expected production content.
5. MCP production endpoint initializes and lists exactly the intended five public tools.
6. All five tools return schema-valid, privacy-bounded results on representative and invalid inputs.
7. Portal issues domain challenge token.
8. Store that exact token only in the production runtime binding OPENAI_APPS_CHALLENGE_TOKEN.
9. Verify the challenge URL returns only the exact token as plain text.
10. Use a global-data-residency OpenAI project and verified Hermes Logistics LLC business/developer identity.
11. Upload the public ZIP using the With MCP submission path.
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
2. Roofing/service business -> CRM blueprint, no fake live vertical.
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
5. Show four-direction ecosystem routing.
6. Show learning-policy boundaries.
7. Submit one synthetic privacy-safe consented feedback case.
8. Attempt a sensitive/cross-tenant case and show safe denial/no private tool.
9. Show Product, Support, Privacy and Terms URLs.
10. Show no authentication is required for public v1, and explicitly state that private customer CRM access is not part of this release.

Do not show real customer data, secrets, internal One Brain, private emails, credentials or unreleased commercial claims.

## Post-publication operating rule

Hosted MCP tool changes may be discovered by later OpenAI scans. Preserve backward compatibility, privacy boundaries and tool semantics. Bundled skill/listing changes remain versioned package changes. Product learning proposes SkillCandidate/CapabilityCandidate changes; user conversations do not directly rewrite privileged public instructions.
