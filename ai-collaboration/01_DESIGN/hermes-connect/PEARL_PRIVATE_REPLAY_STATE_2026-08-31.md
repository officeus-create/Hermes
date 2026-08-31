# Repair Shop private Pearl replay — current-main state

- Writer branch: `fix/repair-private-pearl-shell-fresh-2026-08-31`
- Base: current `main` after PR #928 (`c1de76aed3b8a88df93a6ea31bb78cf5cb0c4af5`)
- Scope: presentation-only Pearl/Repair-blue convergence for private Repair Shop Dashboard, Availability and Customers.
- Preserved: PR #928 September 15 registration policy and all operational API/runtime behavior.
- Evidence gate: `repair-shop-private-design-contract.test.mjs` is imported from the existing Repair Shop growth contract, so the normal repository test suite executes it.
- Supersedes: stale/conflicted PR #911 after clean replay.
