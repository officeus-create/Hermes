# TR-058 — broker weight intake slice

ai_name: Codex
role: delegated existing broker intake owner
department: Logistics / broker intake
date: 2026-10-08
contribution_type: Implementation Report
task_id: TR-058 / Project 10 10-IN-05
authority_scope: branch write / draft PR only
original_base_sha: 17dcbc16d567abd1db5bf5b4f2b4d0b312b75b17
fresh_base_sha: a7372ddf93f0f7f2e94922612d91218e53b01879
status: LOCAL_CONTRACT_VERIFIED; exact-head CI and release are separate gates

## Existing contract and ownership

- [One Brain Board](https://docs.google.com/document/d/1zblFM0EGsWqetFxTtDcKq0UFI-Pu8rdUgwrk5Kx-pIg/edit): TR-058 partial runtime mapping after #1752; structured authority/insurance/tracking/dimensions/weight and CRM persistence remain open.
- [Project 10 Restart Packet](https://docs.google.com/document/d/1Cz57RStKvVefUs1NIiMysY-bvNithWSQaxZAKUY3KJQ/edit): 10-IN-05 extends missing fields through the existing intake/receiver; no second CRM or broker form.
- [Broker source handoff](https://docs.google.com/document/d/1LTGNm5mqe17FnQZ3ExlmdXqodf4Toeq9q41rq0ZVKxk/edit): source authorization, provenance, dedupe, expiry and visibility gates remain independent of customer intake.
- Assignment acknowledged once. Prior connector NOT_FOUND is not another assignment or delivery/receipt evidence.
- All 19 open PRs checked, refreshed at 15:43 UTC: no broker writer/PR found. #1783's ContactLinkEnhancer/SeoIntakeEnhancer/shared journals and #1759's package.json/email Worker entry/index/configs are excluded. No overlap with this slice.

## One bounded change

Existing broker primary CTA routes to `/logistics/request-vehicle-transport/?role=broker#transport-intake`; the Load Board demo is separate. Add cargo weight only to that existing direct form.

`FormData → broker_weight → LogisticsSalesLead → /api/logistics-lead → existing email text`

- Broker-only fieldset, disabled for other roles.
- `{state:"known",value:"003500.50",unit:"lb"}` retains original decimal string and lb/kg, with no conversion, estimate or verification claim.
- `{state:"unknown",value:"",unit:""}` preserves explicit unknown. Older requests without the additive field remain compatible, never promoted to known.
- Duplicate structured FormData and decoded raw JSON object keys, wrong segment, unsupported units, malformed/nonpositive values and contradictory unknown data fail before handoff.
- Receiver revalidates, rejects conflicting/missing client summaries, removes the matching client summary and renders one authoritative weight block with deterministic `Broker weight record` JSON. This proves email-body preservation, not a database/CRM write.
- Trusted edits hide and invalidate prepared preview/email/send actions to prevent stale weight/role handoff.
- Existing request-id dedupe suppresses sequential same-object retries; no new atomic concurrency guarantee.

## Evidence

Original-main red fixture: `broker_weight` was undefined. Updated fixture/mock receiver passes original lb/kg strings, explicit unknown, invalid/duplicate FormData, broker/shipper/carrier isolation and zero extra handoffs on retry/invalid input. Imported by existing `scripts/load-board.test.mjs`, so required `npm test` executes it without changing package.json.

Build: 0 errors; full local `npm test`: pass. Added desktop/mobile test covers actual FormData, mock submitted receipt, unconfirmed delivery/human states, role toggle, invalid weight, stale-email invalidation and overflow. Initial local browser setup was blocked by a CDN returning 195-byte HTML. The same Chrome for Testing version was subsequently downloaded from official Google storage; all four new desktop/mobile cases pass using a fully intercepted HTTPS origin, local static pages and a mock endpoint. Required full exact-head CI remains a separate gate; terminal result is recorded in the PR receipt.

Read-only review found stale prepared email after edits; fixed in the existing enhancer. Independent audit then found a receiver ambiguity on initial head ab01c7723b21eed4a6be0fb46bf954ac3febf472; see rework below.

## Preserved and remaining

No URLs/canonical/robots/sitemaps/schema/search intent, CTA receiver, inventory, analytics consent, source rights/TTL/visibility, authority/insurance/tracking/dimensions, payments, credentials, permissions or DNS changed. No real sends, production records/accounts, merge or deploy.

This is one weight slice, not TR-058 closure. Remaining groups and existing CRM persistence/readback belong to their existing owners. Release approval, deployed exact-SHA smoke and authorized receiver/readback remain external gates. Submitted is endpoint acceptance only; provider delivery, human receipt, follow-up and payment remain unproven. Preserve CRM #1759 and Development #1783 ownership/release order.

## Independent audit rework — same PR #1788

Initial duplicate-input evidence covered FormData only. Raw duplicate nested JSON keys could collapse to the last value, while client email text carried a conflicting value/unit. This initial acceptance claim was too broad; no delivery or CRM claim follows from it.

A new endpoint red fixture reproduced 200 acceptance. Rework scans decoded JSON object keys before collapse (including escaped keys and nested arrays), rejects ambiguous/non-object envelopes, and retains the exact weight-key allowlist. A structured weight requires exactly one matching client summary; conflicting/missing/duplicate summaries or a client-supplied canonical record are rejected. The matching summary is removed, then rendered once by the server beside the sole JSON record. Original numeric strings/lb/kg and explicit unknown are unchanged. Legacy requests missing the new object remain compatible without a reserved structured summary; absence never means known.

Endpoint cases cover raw duplicates even when the last value matches the client summary (therefore ordinary payload validation cannot mask the duplicate bug), escaped duplicate keys, known/missing/invalid/contradictory/extra-key values, lb/kg mismatch and legacy compatibility. Invalid cases create zero extra mock handoffs. Evidence ceiling: mock Email Worker acceptance; CRM persistence, provider delivery, human receipt, qualification and revenue remain UNKNOWN.

Final release gate: after #1783 changes main, rebase this same PR and run full fresh exact-head CI. No merge/deploy or production form/event/IndexNow action is authorized.

#1783 merged as a7372ddf93f0f7f2e94922612d91218e53b01879. This same branch rebased cleanly onto that main without touching Development files. Post-rebase build passed (0 errors, 401 pages), full npm test passed, and targeted desktop/mobile passed 34/34. Terminal exact-head CI remains required; see the PR receipt for current completion evidence. Pre-rebase targeted set passed 34/34 and full npm test passed. Rework review: no remaining critical/important findings.
