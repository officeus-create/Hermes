# Hermes AI Benchmark

## Purpose

Compare the ordinary official Codex route with the isolated Hermes routed route on the **same bounded task**. This is a local decision tool, not a production automation, model-ranking claim, or a source of business facts.

## Routes

```text
DIRECT          codex
HERMES PRIMARY  ./scripts/ai/codex-hermes
```

The routed execution model and any fallback are recorded only when the run transcript reports them. A successful run does not prove fallback behavior.

## Safe first run

```bash
cd ~/Hermes
node scripts/ai/hermes-ai-benchmark.mjs --case current-state
```

Both runners receive the same prompt, use the Codex `read-only` sandbox, and run as ephemeral sessions. The result directory is local-only under `~/.hermes-ai/benchmarks/`; it is not written to Git, the website, CRM, analytics, or any external system.

The benchmark prompt also uses a repository-only execution protocol: runners may use only repository-relative paths, must limit reads to task-relevant repository sources, must not enumerate worktrees or branches, and must not inspect user configuration, memories, local transcript directories, or other projects. Each response must list the repository-relative sources it actually read. This is a prompt-and-ledger safeguard, not a claim that the underlying read-only sandbox supplies a cryptographic filesystem boundary.

Every prompt includes the repository-only execution protocol. The ledger records `evidenceScope`; outside-workspace paths and forbidden-location mentions both require review. A pair is valid for comparison only when both routes report `REPOSITORY_ONLY_OBSERVED`; `REVIEW_REQUIRED_OUTSIDE_REPOSITORY_READ` means the transcript must not be used to rank the routes until the scope issue is understood.

Available read-only cases:

- `current-state` — priority and evidence understanding;
- `bug-triage` — local, repository-verifiable problem framing;
- `code-review` — bounded review of current runtime-related work;
- `seo-planning` — evidence-gated action for existing canonical SEO owners.

Use `--prompt-file <path>` only for a sanitized, bounded prompt. Do not put credentials, customer information, contracts, raw conversations, submitted forms, or other private records into benchmark prompts.

## Ledger fields

`ledger.json` records route, success, elapsed time, reported model, prompt hash, and transcript filename. It deliberately sets factual accuracy, evidence quality, code quality, human interventions, and final score to `NOT_REVIEWED` until a reviewer compares the local transcripts.

Review each pair with:

1. task completion;
2. elapsed time;
3. factual errors;
4. evidence quality;
5. code/test quality where applicable;
6. owner interventions;
7. model reported;
8. fallback evidence.

Do not aggregate results or claim one route is better after a single run. Compare at least several equivalent cases, and keep write-capable implementation tests in isolated worktrees with their own branch, verification, and reviewer.

## Fallback rule

The active Hermes route must contain only authenticated providers. A provider missing a key is a configuration error, not a valid fallback test. Verify fallback only with two real providers and a controlled retryable runtime failure, then retain the relevant local transcript or FCC log evidence.
