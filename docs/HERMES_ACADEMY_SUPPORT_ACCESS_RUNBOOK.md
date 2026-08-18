# Hermes Academy — Manual Support Access Runbook

Status: **A3.1 operator runbook / no self-service provisioning**

Academy support is a separate permission from learner identity and from A3/A4 reviewer power. This document intentionally contains no real specialist IDs, credentials, tokens, learner questions, or production database identifiers.

## Authorization rule

A support responder must have:

1. a valid shared Hermes identity/session; and
2. an active row in `academy_support_access`.

`specialists.role`, display name, email domain, Academy enrollment, `academy_reviewer_access`, or a browser-controlled field must never grant support power by themselves.

There is no public/browser API for creating or broadening `academy_support_access`.

## Before provisioning

- Confirm the person already has the intended Hermes identity.
- Resolve the exact `specialists.id` through an authorized private operator workflow.
- Decide whether support access is limited to one current Academy program or explicitly covers both.
- Keep the specialist ID out of public issues, screenshots, analytics, and repository documentation.

## Grant one-program support access

```sql
INSERT INTO academy_support_access
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

## Grant access to both current programs

Use `NULL` only when the person is deliberately approved to answer questions for both programs.

```sql
INSERT INTO academy_support_access
  (specialist_id, active, program_scope, created_at, updated_at)
VALUES
  ('<SPECIALIST_ID>', 1, NULL, datetime('now'), datetime('now'))
ON CONFLICT(specialist_id) DO UPDATE SET
  active = 1,
  program_scope = NULL,
  updated_at = datetime('now');
```

## Revoke access

Prefer disabling the row so the authorization history remains inspectable.

```sql
UPDATE academy_support_access
SET active = 0,
    updated_at = datetime('now')
WHERE specialist_id = '<SPECIALIST_ID>';
```

## Verification

After grant/scope change:

1. sign in as the exact Hermes identity;
2. open `/services/hermes-connect/academy/reviewer/support/`;
3. confirm only the intended program queue is available;
4. confirm an ordinary account receives `403 academy_support_not_authorized` even if its role/display text says reviewer or support;
5. confirm the support responder cannot answer their own learner thread;
6. confirm a support answer changes only `academy_support_threads.state` and appends an `academy_support_messages` row;
7. confirm enrollment, lesson progress, A3 submissions, A4 progression, employment, certification, payment and operational access remain unchanged.

## Private data boundary

Authorized support may see learner identity plus the course question needed to answer it. Learner email, question text, support replies and support authorization identity must not be sent to GA4/dataLayer, public logs, URLs, or screenshots intended for public use.

## No automatic privilege expansion

Adding a future Academy program does not automatically expand existing support scope. Update the allowlist contract and operator authorization deliberately first.
