# Hermes Academy — Manual Reviewer Access Runbook

Status: **A3 operator runbook / no self-service provisioning**

This document defines the bounded manual path for authorizing the first Academy reviewers. It intentionally contains no real specialist IDs, credentials, tokens, private learner data, or production database identifiers.

## Security rule

Reviewer power does **not** come from `specialists.role`, display name, email domain, Academy enrollment, or any browser-controlled field.

A reviewer must have:

1. a valid shared Hermes identity/session; and
2. an active row in `academy_reviewer_access`.

No public/browser API may create, activate, broaden, or delete reviewer-access rows.

## Before provisioning

- Confirm the person already has the intended Hermes identity.
- Resolve the exact `specialists.id` through an authorized private operator workflow.
- Decide whether access is global across the two current Academy programs or limited to exactly one program.
- Do not copy the specialist ID into public issues, PR comments, analytics, screenshots, or documentation.

## Grant one-program reviewer access

Run through the authorized D1 administration path, replacing the placeholder privately:

```sql
INSERT INTO academy_reviewer_access
  (specialist_id, active, program_scope, created_at, updated_at)
VALUES
  ('<SPECIALIST_ID>', 1, 'us-logistics-operations', datetime('now'), datetime('now'))
ON CONFLICT(specialist_id) DO UPDATE SET
  active = 1,
  program_scope = 'us-logistics-operations',
  updated_at = datetime('now');
```

Allowed program scopes:

- `us-logistics-operations`
- `marketing`

## Grant reviewer access to both current programs

Use `NULL` scope only for a reviewer who is explicitly authorized for both current programs:

```sql
INSERT INTO academy_reviewer_access
  (specialist_id, active, program_scope, created_at, updated_at)
VALUES
  ('<SPECIALIST_ID>', 1, NULL, datetime('now'), datetime('now'))
ON CONFLICT(specialist_id) DO UPDATE SET
  active = 1,
  program_scope = NULL,
  updated_at = datetime('now');
```

## Revoke access

Prefer disabling the row so the authorization history remains inspectable:

```sql
UPDATE academy_reviewer_access
SET active = 0,
    updated_at = datetime('now')
WHERE specialist_id = '<SPECIALIST_ID>';
```

## Verification

After a grant or scope change:

1. sign in as that exact Hermes identity;
2. open the private Academy reviewer route;
3. confirm only the intended program queue is visible;
4. confirm an ordinary account — even one whose role text says `Academy Reviewer` — receives `403 academy_reviewer_not_authorized` without an allowlist row;
5. confirm review actions update only submission review state and do not modify Academy enrollment, lesson progress, candidate status, employment status, certification, or operational access.

## Reviewer data boundary

Authorized reviewers may see only the private learner identity and submitted evidence required for the review. Submission text, evidence URLs, learner email, reviewer feedback, and review decisions must not be sent to GA4/dataLayer or copied into public logs.

## No automatic privilege expansion

Adding a new Academy program does not automatically expand existing reviewer scope. Update the allowlist contract and operator authorization deliberately before granting access to a new program.
