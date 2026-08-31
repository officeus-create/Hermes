# Hermes Connect — Learning Loop: Option 02 PNG provenance failure

Date: 2026-08-31
Domain: IT / Hermes Connect / Design / CI
Status: LEARNED

## Observed
PR #927 built successfully, but Website checks failed in `media-provenance-gate.test.mjs` because `icon-192.png` repository bytes did not match the SHA-256 recorded in `docs/compliance/media-provenance.json`.

## Root cause
The provenance record was updated before the final binary bytes were guaranteed to be the exact bytes committed to GitHub. The artifact passed through a later optimization/serialization step, so evidence described an intermediate file rather than the final repository artifact.

## Changed
Use the final optimized PNG bytes as the source of truth, commit those exact bytes, and only then verify/update the provenance hashes.

## Rule for next time
For every generated or optimized binary asset:

`FINAL BYTES → SHA-256 → PROVENANCE RECORD → COMMIT → EXACT-HEAD CI`

Never hash an intermediate export and never assume two visually identical PNGs have identical bytes.

## Regression guard
- `media-provenance-gate.test.mjs` remains mandatory.
- Any asset-generation workflow should expose the final SHA-256 after optimization.
- A design task is not VERIFIED until the exact repository bytes pass provenance CI.

## Result
Pending exact-head CI on the corrected PR head.
