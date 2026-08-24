# Hermes Operating Stack (HOS)

Adopted: 2026-08-23  
Owner: Vladimir / Hermes  
Status: approved operating protocol

HOS turns the Hermes multi-AI workspace into one evidence-driven execution system. It borrows the useful specialist-workflow principle from modern AI engineering stacks, but applies it company-wide and keeps Hermes One Brain as the single task router.

## Default lifecycle

For material work use:

`DISCOVER → CEO/BUSINESS REVIEW → DOMAIN PLAN → EXECUTE → ADVERSARIAL REVIEW → QA → HUEG EVIDENCE → SHIP/APPLY → CANARY/MEASURE → RETRO → LEARN`

Use the smallest sufficient path for low-risk work. A typo or bounded documentation correction may be `EXECUTE → CHECK → DONE`; a production product release or consequential business change may need the complete chain.

## Skill first, agent second

Do not route work by model identity alone. Route by the skill and verified capability the task requires.

Examples of skills:
- business/CEO review;
- architecture/engineering review;
- design review;
- implementation;
- adversarial/paranoid review;
- browser/QA verification;
- security review;
- evidence collection;
- release/canary;
- measurement/retro.

An agent may perform different skills on different tasks. Agent availability or vendor identity does not define governance rank or technical capability.

Each task slice records:
- domain and objective;
- current lifecycle stage;
- autonomy/risk tier;
- primary executor;
- independent reviewer when required;
- write/branch scope;
- source of truth;
- required evidence;
- next gate;
- owner gate, if any.

One current writer per artifact. Multiple independent reviewers are allowed.

## HUEG — Hermes Universal Evidence Gate

Core rule: **NO_EVIDENCE_NO_PROMOTION**.

A task status, merge, deployment or AI narrative is not proof by itself. Evidence must match the claim and environment being promoted.

Allowed check results:
- `PASS`
- `FAIL`
- `UNVERIFIED`
- `NOT_APPLICABLE` (only when the domain requirement matrix explicitly permits it)

Promotion requires every required check to be `PASS`, with zero `FAIL` and zero `UNVERIFIED` checks. `LIVE_VERIFIED` additionally requires separate live proof tied to the target environment and observation time.

### HUEG invariant filters

1. `MERGED != LIVE_VERIFIED`.
2. Green CI on a stale head does not prove readiness on current main.
3. HTTP/Cloudflare success does not prove auth, database or business-flow integrity.
4. SEO engineering tests do not prove search traffic, indexation or ranking outcome.
5. GEO/entity contracts do not prove third-party AI mentions, citations or share-of-answer.
6. A Drive/document artifact existing does not prove its permission boundary is safe.
7. AI prose or JSON is not physical evidence unless it points to a real execution/source artifact.

Evidence should carry, where applicable:
- `evidence_id`
- `environment_id`
- `source_revision`
- `executor_agent`
- `verifier_agent`
- `evidence_ref`
- `observed_at`
- `live_proof`

Secrets, raw webhook URLs, customer PII and private operational payloads do not belong in public evidence.

## Capability and handoff rule

Before taking work, an agent must distinguish actual access from assumed access. If the current surface cannot perform a required check, do not fabricate it and do not block safe work unnecessarily. Emit a bounded `EVIDENCE_REQUEST` or takeover bundle for a capable peer.

An unavailable agent is not a blocker for reversible work. Take over only from the last physically proven state, preserve scope, and log the takeover.

## Mandatory agent sync handshake

Membership in the same account, workspace, repository or historical Hermes conversation is **not** proof that an agent is synchronized.

Before taking a write lock, every ChatGPT thread, Codex, Claude, Gemini, AntiGravity instance and future Hermes agent must:
1. read the current AI Master Operating Board and current task-specific source of truth;
2. read fresh GitHub `main` / PR state when repository work is involved; never rely on a remembered SHA;
3. declare `VERIFIED_CAPABILITIES`, `TASK`, `ARTIFACT_OR_WRITE_SCOPE`, `PRIMARY_WRITER`, `REVIEWER`, `CURRENT_STAGE`, `LAST_PROVEN_STATE` and `REQUIRED_EVIDENCE`;
4. check cross-chat and cross-agent work locks;
5. switch to `REVIEW_ONLY` or choose an independent slice if another active writer owns the same task/artifact;
6. mutate only after the handshake is current;
7. return exact artifact/revision/SHA, evidence, blocker and next stage to One Brain at handoff.

Sync status values: `SYNC_VERIFIED | SYNC_STALE | ACCESS_GAP | REVIEW_ONLY`.

Core concurrency rule: **ONE TASK / ONE ARTIFACT / ONE ACTIVE WRITER — MANY REVIEWERS.**

## Human owner gates

AI autonomy continues through safe reversible work. Explicit owner approval remains required for the applicable high-risk boundary, including:
- credentials, security ownership and access-control changes;
- destructive deletion or irreversible migration;
- billing/payments;
- contracts/legal activation;
- material pricing/commercial policy;
- consequential production/domain changes without standing authorization;
- real external outreach or publishing where no standing authorization exists;
- material hiring/business decisions.

## One Brain rule

The canonical AI Master Operating Board remains the active task router. GitHub technical state, current production/private evidence and approved owner directives outrank historical chat narratives. Do not create a parallel master board merely because a new agent or framework is introduced.

## Completion rule

`DONE` means the required outcome was implemented or applied, checked with claim-matching evidence, and moved through the required HOS gates. If outcome measurement has not matured yet (for example SEO/GEO or a real-user pilot), the engineering slice may be complete while the business outcome remains `MEASUREMENT_WAIT` or `CANARY_ACTIVE` rather than falsely `DONE`.
