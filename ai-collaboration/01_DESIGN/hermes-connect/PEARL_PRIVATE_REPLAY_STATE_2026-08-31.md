# Repair Shop private Pearl replay — current-main state

- Writer branch: `fix/repair-private-pearl-shell-fresh-2026-08-31`
- Base: current `main` after PR #931 (`9a976da558e9441cd743744430eb4899393b8cbe`)
- Scope: presentation-only Pearl/Repair-blue convergence for private Repair Shop Dashboard, Availability and Customers.
- Preserved: PR #928 September 15 registration policy, PR #931 deterministic browser contract, and all operational API/runtime behavior.
- Evidence gate: `repair-shop-private-design-contract.test.mjs` is imported from the existing Repair Shop growth contract, so the normal repository test suite executes it.
- Supersedes: stale/conflicted PR #911 after clean replay.
