# GEO Completion Summary Template

Use this template for a completed autonomous GEO/SEO execution batch.

## 1. Executive status

- Backlog range:
- Exact head SHA:
- CI status:
- Measurement source of truth update:
- Production merge/deploy status:

Do not use `complete` unless the exact head has passed the repository-required build, test and e2e path.

## 2. Technical work completed

List only implemented/verified changes.

- Task IDs:
- Technical PR:
- Branch:
- Key contracts/modules:
- Tests added/updated:
- Privacy/security boundaries:
- Remaining external evidence gates:

## 3. Evidence state

Separate evidence classes rather than collapsing them.

- Repository verified:
- Production verified:
- Platform verified:
- Production receiver verified:
- Private operations verified:
- Owner-provided handoff:
- Unverified / missing / stale:

## 4. Measurement outcome

Use only evidence actually available.

- 7-day:
- 28-day:
- 90-day:
- Branded/non-branded:
- Funnel completeness:
- Qualified outcome reconciliation:
- AI visibility observation coverage:
- Index-state evidence:

Never fill a missing metric with a synthetic example or a different time window.

## 5. Autonomous fixes that did not require CEO review

Examples:

- tests/CI repairs;
- privacy guards;
- schema parity;
- internal-link corrections that preserve approved composition;
- metadata/canonical/hreflang fixes;
- small responsive/overflow/accessibility corrections;
- measurement/import/reconciliation changes;
- copy fit that does not change the approved visual language.

## 6. CEO Visual Approval Queue — material decisions only

This section is intentionally separate from technical PRs.

For each material visual item:

### V-XXX — title

- Direct preview link:
- PR link:
- Before/reference:
- Variant links (A/B/C/D if applicable):
- Decision required in one sentence:
- Scope affected:
- Recommendation:

If no material visual decision exists, write: `No new CEO visual decision required.`

Do not mix ordinary technical links into this section.

## 7. Remaining blockers

Classify each blocker:

- external authenticated evidence;
- receiver/private operational evidence;
- material visual approval;
- merge/deploy owner confirmation;
- third-party/provider limitation;
- unresolved technical defect.

## 8. Next autonomous batch

- Next task IDs:
- Why they are next:
- Whether any visual approval is expected:

## 9. Merge/deploy boundary

State explicitly:

- `Merge not performed without owner confirmation.`
- `Production deployment not performed without owner confirmation.`

If the owner later authorizes one or both, revalidate the current exact head before acting.
