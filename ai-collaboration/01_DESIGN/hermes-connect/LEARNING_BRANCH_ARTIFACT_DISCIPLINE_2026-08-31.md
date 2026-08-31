# Learning: branch artifact discipline — 2026-08-31

## Observed
During a fresh-main replay of the Repair Shop Pearl visual slice, an unnecessary temporary branch (`tmp-noop-check`) was created while checking the current head.

## Root cause
A read-only verification step was expressed as a branch-creation action even though no new writer was required.

## Rule
Before every GitHub mutation, classify the intent as READ / WRITE / RELEASE. Never create a branch for a read-only head verification. Reuse the single active writer branch for the task.

## Regression guard
- ONE TASK / ONE ACTIVE WRITER BRANCH.
- Branch creation requires a named mutation scope.
- Read-only verification uses compare/fetch/status tools only.
- A mistakenly created branch must never become a second source of truth.

## Current task
Canonical writer branch remains `fix/repair-private-pearl-shell-fresh-2026-08-31`; the temporary branch has no unique changes and must not be used.
