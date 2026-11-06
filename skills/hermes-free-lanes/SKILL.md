---
name: hermes-free-lanes
description: >-
  Route heavy, repetitive, long-context or privacy-sensitive work off the orchestrator's own
  tokens onto free local or already-subscribed execution lanes on the owner Mac: the FCC router
  (Free Claude Code with ChatGPT OAuth), Codex CLI, Claude Code, local Ollama, One Brain Drive
  via rclone, and Gemini CLI. Use when a task is big, bulk, long-context, private, or when the
  owner asks to save tokens, quota or cost. Triggers on: free lane, cheap lane, save tokens,
  delegate, route, FCC, codex-hermes, ollama, local model, token budget.
---

# Hermes free lanes — token-frugal execution policy

Verified 2026-11-06 on the owner Mac. The orchestrator's own tokens are the scarcest resource in
this stack. Every lane below runs on an existing subscription or locally, so delegated work does
not consume orchestrator tokens. Use the lowest-cost capable lane and keep MiniMax for decisions,
synthesis and owner communication.

## Lanes

| Lane | Command | Owner cost | Best for | Limits |
| --- | --- | --- | --- | --- |
| **FCC router** (ChatGPT OAuth) | `scripts/ai/free-lanes ask fcc "<prompt>"` | ChatGPT plan quota | code, review, long context, second opinion | ChatGPT plan quota; needs FCC server |
| **FCC routed Codex** | `cd ~/Documents/hermes && ./scripts/ai/codex-hermes exec "<prompt>"` | ChatGPT plan quota | codex-native flows, isolated `CODEX_HOME` | FCC server must be up |
| **Codex CLI** | `codex exec "<prompt>"` | ChatGPT plan quota | quick bounded code tasks | ordinary codex, not routed |
| **Claude Code** | `claude -p "<prompt>" --allowedTools "Read,Grep,Glob" --permission-mode acceptEdits` | Claude Pro quota | broad repo reading, audit, independent review | session expires 2026-12-06 |
| **Ollama (local)** | `scripts/ai/free-lanes ask ollama "<prompt>"` | free, unlimited, private | bulk summarization, extraction, classification, drafts, anything touching internal documents | CPU-only on this Intel Mac: ~20 s cold start, a few tok/s |
| **One Brain / Drive** | `rclone cat "gdrive:<path>"` | free | knowledge lookup, source reading | bulk mirror hits the shared-client Drive API quota; targeted reads do not |
| **Gemini CLI** | `gemini -p "<prompt>"` | Workspace quota | very large context reading | needs API key or the one-click OAuth consent |

## Dispatcher

```bash
scripts/ai/free-lanes status                      # health of every lane
scripts/ai/free-lanes ask fcc "<prompt>"          # routed ChatGPT lane
scripts/ai/free-lanes ask ollama "<prompt>"       # local, private, unlimited
scripts/ai/free-lanes ask auto "<prompt>"         # heuristic pick
```

FCC also exposes plain HTTP, so a lane can be called without the wrapper:

```bash
curl -s http://127.0.0.1:8082/v1/messages \
  -H 'content-type: application/json' \
  -d '{"model":"openai/gpt-5.6-sol","max_tokens":4096,"messages":[{"role":"user","content":"..."}]}'
```

## Routing policy

1. **Never delegate**: owner decisions, merge to `main`, production deploy, DNS/Cloudflare/account/
   billing/permission changes, deletions, credential handling, messages and public communications.
   Those stay owner-gated regardless of lane.
2. **Delegate by task shape**, not by habit:
   - code / review / second opinion → `fcc` or `claude`
   - bulk, repetitive, long-corpus, or internal-document work → `ollama` (private + unlimited)
   - knowledge lookup → `drive`
   - everything else → `fcc`
3. **Keep MiniMax for the parts that need a model with context of the whole thread**: scoping,
   judgement, synthesis, owner communication, and the final acceptance decision.
4. **Batch, don't dribble**: one bounded lane call with a list of sub-questions beats five calls.
   Each call costs latency and context.
5. **Give a lane a bounded contract**: exact paths, exact question, expected output shape, and what
   *not* to touch. Lanes have no thread context — never paste a transcript; point at files.
6. **Read-only by default.** A lane that may write should get an explicit, narrow scope, and its
   diff must be reviewed before it counts as work.
7. **A lane answer is input, never truth.** Same evidence rules as any agent: no claim of
   completion from a lane's "done"; no merge from a lane's "looks good".

## Bounded delegation contract

```
CONTEXT:  <repo path / file list>  ·  <what already exists, 2-4 lines>
TASK:     <one bounded question or edit>
SCOPE:    read-only | files: <exact paths you may change>
OUT:      <exact shape: bullet list / diff / JSON>
DON'T:    no merge, no deploy, no credentials, no new tasks/PRs
```

## Measured on this Mac (2026-11-06)

Same bounded read-and-cite task on three lanes, same repository tree (`origin/main` worktree):

| Lane | Wall time | Result vs ground truth |
| --- | --- | --- |
| Claude Code | 25 s | correct — all three sites, plus the projection-vs-storage distinction |
| Codex (official CLI) | 29 s | correct — all three sites, cited precisely |
| Ollama `qwen2.5-coder:7b` (local) | 74 s | 2 of 3 sites; mis-attributed the write location (readback quoted as write) |

Read: on this Intel Mac the local model is ~2.5-3x slower and less precise on repo-reading work.
Use it for bulk, private, repetitive work; do not route design or citation-critical reasoning to it.
The local lane was additionally given grep output as context, so its accuracy was partly supplied.

### HAE semantic-node lane (VIKTOR-WINDOWS role, measured 2026-11-06)

Same model class, different task: the HAE node contract requires strict JSON
(`disposition`, `recommended_job_type`, `rationale`, `next_action`), validated by the runtime.

| Lane | Wall time | Result vs contract |
| --- | --- | --- |
| Ollama `deepseek-r1:1.5b` (canonical VIKTOR model) | ~40 s | **failed** — reasoning noise, output not parseable as JSON on both attempts |
| Ollama `qwen2.5-coder:7b` | ~65 s | passed — contract-valid JSON, accepted by `completeWindowsNodeJob`, receipt at cost 0 |

Read: a reasoning model is not a contract model. Until DeepSeek runs with JSON-constrained decoding
or a repair prompt, the working free node lane is `qwen2.5-coder:7b` — still $0, still read-only.
Full proof: `docs/AI_HAE_CHAIN_PROOF.md`, artifact `docs/evidence/hae-chain-proof-2026-11-06.json`.

## Provider-policy note

The FCC router's ChatGPT lane authenticates with a ChatGPT session token and proxies it as a
generic model API. That mechanism pre-dates this work (it was configured on 2026-10-05), but the
default route was changed on 2026-11-06 to the **local Ollama model** so no ChatGPT-token proxying
is a system dependency by default. Re-enabling it as a default is an owner decision that depends
on OpenAI's terms for session-token use, so it is opt-in only
(`HERMES_FCC_MODEL=openai/gpt-5.6-sol`). The exposed token from the 2026-11-06 session was revoked
through OpenAI's `oauth/revoke` and replaced with a freshly issued one.

## Startup state on this Mac

Both local services auto-start at login and are safe to leave running:

| Service | Mechanism | Endpoint |
| --- | --- | --- |
| Ollama | `~/Library/LaunchAgents/com.ollama.server.plist` | `http://127.0.0.1:11434` |
| FCC router | `~/Library/LaunchAgents/com.hermes.fcc-router.plist` | `http://127.0.0.1:8082` (admin UI `/admin`) |

Routing chain is owned by the FCC Admin config: `MODEL=openai/gpt-5.6-sol`,
`MODEL_FALLBACKS=openai/gpt-6.1-sol,ollama/qwen2.5-coder:7b`. The local Ollama route answers
correctly even though the admin model catalog does not list it — verify a route by calling it, not
by reading the catalog. Change the chain in the Admin UI or `POST /admin/api/config/apply`, never
by editing the repository.

## Governance

This is a runtime adapter only. It does not replace HAE (the single scheduler), One Brain, the
owner backlog, `AGENTS.md`, task ownership, branch rules or the evidence gates. A provider or
model is a replaceable executor, not a source of truth. Provider keys live in their own stores
(`~/.fcc`, `~/.config/rclone/rclone.conf`, the OS credential store) and must never enter the
repository, a Drive document, a prompt, or a PR.
