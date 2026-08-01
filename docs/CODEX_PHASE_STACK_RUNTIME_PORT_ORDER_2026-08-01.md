# Safe runtime port order

1. Inventory PR #36–#38 filenames and identify isolated Shipment History model/test files.
2. Inventory PR #39 documentation and confirm whether equivalent official-only research already exists on `main`.
3. Inventory PR #40 registry files and preserve disabled-by-default behavior.
4. Inventory PR #41 adapter files and preserve approval, size, row-count, privacy, and no-side-effect gates.
5. Inventory private synthetic UI and default-deny authorization files.
6. Reconcile `package.json` only by adding missing test commands; never replace it wholesale.
7. Reconcile shared validators and Playwright tests by adding focused assertions without weakening newer checks.
8. Run full CI order and repair failures before any review recommendation.
