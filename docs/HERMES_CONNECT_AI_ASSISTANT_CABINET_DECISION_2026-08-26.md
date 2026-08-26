# Hermes Connect AI Assistant — Cabinet Decision

**Status:** `OWNER_DECISION_REQUIRED` — discovery complete; no runtime code was copied, merged, deployed, or exposed.

## Product decision already accepted

Hermes Connect AI must be a bounded internal capability inside the owner's **existing authenticated Hermes Connect cabinet**. It must not create or preserve:

- a separate AI Control Center or `/owner/` destination;
- an additional owner dashboard or navigation system;
- an `ai.hermes…` domain;
- a customer-facing Repair Shop AI experience in this wave;
- fake task progress, remote shell access, automatic merge/deploy, or implied approval for protected actions.

The first visible slice, once its shell is proven, is **AI Assistant**: task input; current task/role/title/status/phase/start time; sanitized activity; result/evidence links; and a `Needs approval` area only for actual autonomy-policy gates.

## Evidence-led cabinet inventory

| Candidate | Current-main evidence | Internal-owner fit | Decision |
| --- | --- | --- | --- |
| `/services/hermes-connect/repair-shops/dashboard/` | Authenticated D1 Repair Shop workspace. It accepts the shared `hermes_session` and identifies a `specialist`; Repair Shop APIs scope data to that specialist and several APIs allow the `Shop Owner` role. | **No.** This is the live customer Repair Shop owner product. Its role/session is not an internal Hermes owner binding, and adding internal execution to it would expose an owner-only capability to Repair Shop customers. | Do not use as the AI Assistant shell. |
| `/demos/hermes-connect/workspace.html` | Responsive visual demo with simulated workspace content and a Hermes Intelligence drawer. | **No.** It is not authenticated/internal runtime. | Visual reference only; do not turn it into an internal application. |
| `/services/hermes-connect/academy/*` | Authenticated learner/reviewer/support surfaces with Academy-specific authorization. | **No.** Different product and authorization contract. | Do not use as the AI Assistant shell. |
| `/services/hermes-connect/ai-command-center/` | Public, indexable reference-capability documentation explicitly stating that it is not a current live runtime. | **No.** Public documentation, not a private cabinet. | Keep as documentation; do not use as shell. |
| `/services/hermes-connect/owner/` from PR #865 | New stale PR-only route containing a standalone three-destination Owner Control Center. | **No.** It is the prohibited second owner destination, not a pre-existing canonical cabinet on current `main`. | Reject its standalone UI and route. |

**Conclusion:** Current `main` does not prove the existence or URL of an authenticated, internal Hermes owner cabinet into which an AI section can be embedded. The only current authenticated owner workspace is customer-facing Repair Shops. Creating a new route to fill that gap would contradict the accepted product correction.

## PR #865 technical recovery review

PR #865 is stale relative to current `main` and must not be merged wholesale. Its separate UI route is rejected, but these technical patterns are candidates for a fresh, minimal integration **after** a canonical internal shell is identified:

| Candidate | Value | Fresh adaptation needed |
| --- | --- | --- |
| `functions/api/_lib/owner-codex.mjs` | Explicit owner binding, input/output limits, redaction, task/event/runner schema helpers. | Rebuild against current `main`; validate sanitization coverage, retention, and the final internal authorization model. |
| `functions/api/owner-codex/tasks*` and `status.ts` | Owner-scoped one-active-task queue, task detail, cancellation, sanitized evidence/status receipt. | Preserve same-origin mutation guards and fail-closed behavior; expose only to the proven internal owner identity. |
| `functions/api/owner-codex/runner/*` | Outbound runner claim/heartbeat/event/completion lifecycle and restart-safe reconciliation. | Preserve runner ownership and no duplicate execution; do not create a browser-to-shell endpoint. |
| `scripts/ai/hermes-owner-codex-runner.py` | Outbound-only local runner; clean-current-main preflight; isolated task branch; bounded prompt; process-group cancellation. | Revalidate against the current `scripts/ai/codex-hermes` behavior and current autonomy policy. No credentials are to be configured or used in repository work. |

### UI explicitly rejected from #865

Do not copy `src/pages/services/hermes-connect/owner/index.astro`, its three-destination navigation, its standalone “Owner Control Center” framing, or its control-center-specific templates. The new product requirement is an **AI Assistant section inside one existing cabinet**, not a parallel product shell.

## Required decision before implementation

Provide the canonical authenticated internal owner-cabinet route already used by the owner, or explicitly approve creation of one protected internal shell with its intended identity/authorization contract.

The answer must establish all of the following without placing private values in the repository:

1. **Canonical route/shell:** exact existing in-repository route where the owner signs in and works internally.
2. **Authorization contract:** an internal-only allow-list/binding model distinct from public Repair Shop `Shop Owner` accounts.
3. **Deployment configuration owner:** who will later configure the external owner binding and scoped runner credential. Repository work must remain fail-closed until that configuration exists.
4. **Privacy/retention boundary:** permitted task prompt/evidence classes and retention rule for the internal queue.

This is a material product and access boundary, not a choice between equivalent CSS/layout options. It must not be guessed from customer-facing session roles.

## Bounded implementation immediately after that decision

1. Rebuild only the necessary PR #865 queue/runner/API components from current `main`; do not merge its branch.
2. Add one native **AI Assistant** section to the confirmed existing cabinet using its current layout, navigation, responsive behavior, and authorization guard.
3. Start in an honest empty/unconfigured state: `REMOTE_BROWSER_TO_CODEX = UNVERIFIED`; do not invent tasks, activity, completion, users, or progress percentages.
4. Show `Needs approval` only when a real task reaches the gates in `AGENTS.md`: delete/archive, credentials/secrets, merge/deploy, money/billing/permissions, external communication, legal/commercial commitment, destructive database change, material scope expansion, or unresolvable evidence ambiguity.
5. Add focused desktop and 390px Playwright coverage plus API security/contract tests. Run the required current-head build, static tests, and E2E suite before a review-only PR.

## Current safe state

```text
CURRENT_CABINET_LOCATION = NOT_PROVEN_ON_CURRENT_MAIN
PR_865_BACKEND_REUSABLE = TECHNICAL_PATTERNS_ONLY_PENDING_FRESH_ADAPTATION
PR_865_UI_TO_REJECT_OR_ADAPT = REJECT_SEPARATE_/owner/_CONTROL_CENTER_UI
AI_SECTION_LOCATION = BLOCKED_PENDING_CANONICAL_INTERNAL_SHELL_DECISION
AI_TASK_FLOW = NOT_IMPLEMENTED
AI_APPROVAL_FLOW = AGENTS.md_GATES_ONLY; NO_BROWSER_IMPLICIT_APPROVAL
AI_EVIDENCE_FLOW = SANITIZED_QUEUE/EVENT/PR_RECEIPT_PATTERN_CANDIDATE_ONLY
REMOTE_BROWSER_TO_CODEX = UNVERIFIED
```

## Verification receipt

- `git diff --check`: passed.
- `npm run build`: passed (`astro check`: 0 errors; build completed).
- `npm test`: passed.
- `npm run test:e2e`: **not green on unchanged current main** — `1044 passed / 1 failed / 11 skipped`. The only failure was the previously investigated desktop parallel-execution candidate `tests/business-lead-form.spec.ts:85`, where a consent checkbox click did not change state.
- Focused reproduction: `npx playwright test tests/business-lead-form.spec.ts --project=desktop --grep 'requires a messenger' --repeat-each=5 --workers=1` passed `5/5`.

No test assertion, page, or runtime behavior was changed for this documentation-only decision. The full-suite result remains an existing verification blocker and needs its own bounded parallel-test diagnosis; it is not evidence that this AI Assistant discovery changed the product.

## Organizational lesson

**PROBLEM**
A technically capable stale PR proposed a standalone owner control center while the product decision requires AI inside an existing internal cabinet.

**ROOT_CAUSE**
The repository has authenticated customer and Academy surfaces, but no current-main evidence of a distinct authenticated internal Hermes owner cabinet.

**FAILED_APPROACH**
Treating PR #865’s newly introduced `/owner/` route as the existing canonical cabinet would create the very parallel destination the product decision rejects.

**WORKING_APPROACH**
Inventory actual current-main identity, route, and authorization boundaries before UI implementation; retain only safe technical patterns from the stale branch.

**EVIDENCE**
Current-main routes, `functions/api/_lib/session.mjs`, Repair Shop role checks, public AI Command Center copy, and PR #865 diff at `c90f7dae0651d5de2b15e497d0430a78f8c88bd2`.

**LESSON**
“Embed in the existing cabinet” requires a proven canonical authenticated shell and owner authorization contract; a demo, a customer workspace, or a stale PR route is not enough.

**REUSE_RULE**
Before adapting a private control UI, prove its canonical shell, identity boundary, and current-main ownership. If any is absent, record the exact decision needed rather than silently creating a second product.
