# HAE #2068 — PATCH_ONLY bounded repair executor

Status: **SOURCE_ONLY / DRAFT** until independent review, exact-head CI and a real HAE-SELF receipt are accepted.

## Why this exists

The live #2090 GitHub/CI sensor now proves:

`trusted GitHub CI failure -> existing HAE Queue -> Worker -> D1 -> stable HAE-SELF WORK_ID -> HOLD_REPAIR`.

This executor is the next bounded step. It does **not** add a second scheduler, database, agent runtime or GitHub writer.

Target v1:

`HOLD_REPAIR packet -> strict preflight -> ephemeral detached worktree -> deterministic failure x2 -> exact patch apply -> deterministic PASS x2 -> hashed receipt -> HOLD_INDEPENDENT_QA`.

## Hard limits

- exact base SHA must already exist in the local trusted repository;
- preflight still allows exactly one existing deterministic `scripts/hae-*.test.mjs` or `scripts/automation-engine-*.test.mjs`;
- maximum one changed file, two hunks, 50 changed lines and 8 KiB diff;
- source file must be a regular file, not a symlink;
- candidate diff is SHA-256 bound before execution;
- base test and patched test are scanned for network/process/dynamic-code primitives;
- Node runs with the permission system enabled and filesystem **read only** to the ephemeral detached worktree;
- child process/addon/filesystem write permissions are not granted to the candidate test;
- child environment is a minimal allowlist and excludes `GH_TOKEN`, Cloudflare tokens and provider credentials;
- the defect must fail twice before the patch and pass twice after the patch; inconsistent outcomes fail closed;
- primary worktree is never modified;
- no branch, commit, push, PR, merge, deploy, provider write, D1/Queue write or One Brain/plugin promotion;
- paid AI cost remains $0.

## Receipt

Successful source execution returns only bounded evidence:
- WORK_ID/finding/base SHA/artifact key;
- candidate patch SHA-256 and resulting file SHA-256;
- hashed/stdout-byte/stderr-byte summaries for two pre and two post attempts;
- executor and independent verifier role binding;
- explicit false flags for GitHub/provider/D1/Queue/merge/deploy/knowledge writes;
- next state: `HOLD_INDEPENDENT_QA`.

Raw test stdout/stderr is not persisted in the receipt.

## What is deliberately not implemented

Transport from D1 `HOLD_REPAIR` into a GitHub-side executor remains a separately reviewed capability. Do **not** put a broad or long-lived GitHub write token into the HAE Worker and do not add a cron poller. A later trusted-main verifier may consume a reviewed repair artifact, run this executor in an ephemeral checkout and upload a content-addressed evidence artifact.

Promotion to a GitHub branch/PR is outside #2068 v1 and must remain an explicit later capability.

## Acceptance

1. source test demonstrates no secret env leak, no primary-worktree mutation and no extra branch;
2. already-passing test is rejected as not reproduced;
3. patch that still fails is rejected;
4. unsafe/network-capable test source is rejected;
5. missing base SHA is rejected;
6. canonical HAE contract imports the executor test;
7. independent reviewer and exact-head CI PASS;
8. only then use one **new** eligible HAE-SELF repair packet; never resend the already-consumed live CI event.
