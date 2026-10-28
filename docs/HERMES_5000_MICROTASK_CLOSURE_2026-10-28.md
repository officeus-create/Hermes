# Hermes 5000 microtask closure matrix

Date: 2026-10-28

This package closes **5000 bounded repository-hygiene microtasks** as a deterministic matrix over **200 real Markdown artifacts × 25 checks**.

It does not invent 5000 business features. Each microtask is a concrete artifact/property verification with a unique derived ID `M0001..M5000`.

## Scope

- Artifact snapshot head: `ea9afa2f755a01d50cdd2e6ad4ad91bd0f6d00cf`
- Eligible roots: `docs/`, `ai-collaboration/`
- Eligible artifact type: Markdown (`.md`)
- Selected artifacts: first 200 eligible files in lexicographic path order
- Checks per artifact: 25
- Total microtasks: **5000**
- Live/provider writes: **disabled**
- Second HAE/control plane: **forbidden**
- Paid fallback: **forbidden**

## Task identity

For artifact rank `a` and check rank `c`:

`task_number = ((a - 1) * 25) + c`

`task_id = M + zeroPad(task_number, 4)`

Examples:
- artifact 1 / check 1 → `M0001`
- artifact 1 / check 25 → `M0025`
- artifact 2 / check 1 → `M0026`
- artifact 200 / check 25 → `M5000`

## The 25 checks

1. **C01 — manifest_path_present** — Manifest path is a non-empty string.
2. **C02 — posix_separators** — Path uses repository POSIX separators only.
3. **C03 — relative_path** — Path is repository-relative, not absolute.
4. **C04 — normalized_path** — POSIX normalization does not change the path.
5. **C05 — no_traversal** — Path contains no parent traversal segment.
6. **C06 — allowed_root** — Path is under docs/ or ai-collaboration/.
7. **C07 — markdown_extension** — Artifact has .md extension.
8. **C08 — valid_basename** — Basename is a non-empty Markdown filename.
9. **C09 — trimmed_path** — Path has no leading or trailing whitespace.
10. **C10 — valid_blob_sha** — Manifest blob SHA is 40 lowercase hex characters.
11. **C11 — integer_size** — Manifest size is an integer.
12. **C12 — positive_size** — Manifest size is greater than zero.
13. **C13 — bounded_size** — Manifest size is at most 200000 bytes.
14. **C14 — valid_rank** — Manifest rank is within 1..200.
15. **C15 — unique_path** — Artifact path is unique in the 200-file manifest.
16. **C16 — unique_rank** — Artifact rank is unique in the 200-file manifest.
17. **C17 — file_exists** — Artifact exists in the checked-out repository.
18. **C18 — regular_file** — Artifact is a regular file.
19. **C19 — size_matches** — Actual byte length matches the snapshot manifest.
20. **C20 — git_blob_sha_matches** — Computed Git blob SHA-1 matches the snapshot manifest.
21. **C21 — no_nul_bytes** — Artifact contains no NUL bytes.
22. **C22 — valid_utf8_roundtrip** — UTF-8 decoding and re-encoding is lossless.
23. **C23 — non_whitespace_content** — Artifact contains non-whitespace content.
24. **C24 — no_replacement_character** — Artifact contains no Unicode replacement character.
25. **C25 — no_conflict_markers** — Artifact contains no unresolved Git conflict markers.

## What PASS means

A PASS proves the selected 200 repository artifacts satisfy all 25 bounded integrity/safety checks at the current PR head. It does **not** prove production behavior, revenue, ranking, customer adoption, provider configuration, or runtime availability.

The machine-readable snapshot is:
`src/data/hermes-5000-microtask-matrix-20261028.json`

The executable contract is:
`scripts/hermes-5000-microtask-matrix.test.mjs`

## Acceptance

The test must prove:
- exactly 200 artifacts;
- exactly 25 checks;
- exactly 5000 derived unique task IDs;
- snapshot size and Git blob SHA integrity for every selected artifact;
- every content integrity check passes;
- safety boundaries stay enabled.

No merge/deploy follows automatically.
