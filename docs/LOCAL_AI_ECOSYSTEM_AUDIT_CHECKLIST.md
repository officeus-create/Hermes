# Local AI Ecosystem Audit Checklist

Status: non-destructive verification checklist for the owner Mac.

This checklist verifies the local Hermes AI ecosystem without printing secrets, deleting evidence, or conflating intentional isolation with duplication.

## Principles

- One Brain remains the canonical coordination and learning layer.
- `~/.codex-hermes` is intentional isolated Codex/FCC state and must not be merged into `~/.codex` merely for simplification.
- `~/.hermes/` is Hermes Agent working state, not canonical company truth.
- Local cleanup must preserve evidence until a component is proven unused.
- Never print `.env`, token, OAuth, Telegram session, or credential-store contents.

## 1. FCC listener

Verify only one FCC listener remains and that it is localhost-only:

```bash
lsof -nP -iTCP:8082 -sTCP:LISTEN
```

Expected canonical listener: `127.0.0.1:8082`.

If both wildcard and localhost listeners exist, identify exact PIDs and terminate only the verified stale FCC process.

## 2. Legacy runner checkout

Inspect without changing state:

```bash
du -sh ~/.hermes-ai/hermes-runner 2>/dev/null || true
git -C ~/.hermes-ai/hermes-runner status --short 2>/dev/null || true
git -C ~/.hermes-ai/hermes-runner branch --show-current 2>/dev/null || true
git -C ~/.hermes-ai/hermes-runner rev-parse HEAD 2>/dev/null || true
ps aux | grep '/.hermes-ai/hermes-runner' | grep -v grep || true
grep -RIl --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist '\.hermes-ai/hermes-runner' ~/Hermes ~/.hermes-ai ~/Library/LaunchAgents 2>/dev/null || true
```

Classify only after evidence:

- `KEEP` — active or intentionally isolated runtime checkout;
- `ARCHIVE` — clean, unused, stale checkout retained temporarily for rollback/evidence;
- `REMOVE_LATER` — archived copy has remained unused through an observation window.

Do not delete directly from the first audit.

## 3. Runner environment files

Compare metadata and variable names only. Do not print values:

```bash
for f in ~/.hermes-ai/runner.env ~/.hermes-ai/internal-ai-runner.env; do
  if [ -f "$f" ]; then
    printf '%s\n' "$f"
    stat -f 'mode=%Sp size=%z modified=%Sm' "$f"
    sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "$f" | sort -u
  fi
done
```

Different scoped secrets or different variable sets are not automatically duplication. Preserve privilege separation unless a single-owner contract is proven.

## 4. SQLite WAL

WAL files are normal for active SQLite databases. Inspect sizes and owning processes before any checkpoint:

```bash
find ~/.codex-hermes -maxdepth 2 -name '*.sqlite-wal' -exec ls -lh {} \; 2>/dev/null
lsof +D ~/.codex-hermes 2>/dev/null | head -100
```

Do not run `PRAGMA wal_checkpoint(TRUNCATE)` against a database that may be active merely to reduce file size.

## 5. Ollama

Verify service and configured models:

```bash
ollama list 2>/dev/null || true
curl -sS --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null && echo OLLAMA_HTTP=PASS || echo OLLAMA_HTTP=FAIL
```

FCC provider configuration evidence and a successful bounded inference smoke are needed before calling Ollama an active fallback. Service availability alone is not routing evidence.

## 6. Telegram / Sales Knowledge Hub processes

Inventory only:

```bash
ps aux | grep -E '[s]ales_coach_bot|[m]arketing_sales_coach_bot|[h]ermes_connect_bot|[p]rogressopro_assistant_bot'
launchctl list | grep 'com.hermes' || true
```

Do not consolidate bots solely because Hermes Agent has Telegram support. Domain logic, approvals, PII boundaries, state, and real workflow parity must be ported and proven first.

## 7. LaunchAgents

List current Hermes LaunchAgents and their referenced executables/working directories without printing environment secrets:

```bash
for f in ~/Library/LaunchAgents/com.hermes.*.plist; do
  [ -f "$f" ] || continue
  echo "===== $f ====="
  /usr/libexec/PlistBuddy -c 'Print :Label' "$f" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c 'Print :Program' "$f" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c 'Print :ProgramArguments' "$f" 2>/dev/null || true
  /usr/libexec/PlistBuddy -c 'Print :WorkingDirectory' "$f" 2>/dev/null || true
done
```

Classify each as `ACTIVE`, `REGISTERED_STOPPED`, `STALE_REFERENCE`, or `UNKNOWN`.

## 8. Stale artifacts

Candidates such as zero-byte lock/PID/log files, old invalid benchmarks, `.env` backups, and `FETCH_HEAD` remain evidence until their owning process/workflow is known.

For each candidate record:

```text
PATH
SIZE
MODIFIED_AT
REFERENCED_BY
ACTIVE_OWNER
ROLLBACK_VALUE
CLASSIFICATION
```

Prefer `ARCHIVE` before `DELETE` for the first cleanup pass.

## 9. Git branches

Do not bulk-delete old branches based on count alone.

Archive/close only after classifying whether the branch has:

- an open PR;
- unique unmerged commits;
- evidence/provenance value;
- an explicit superseded marker;
- a current execution owner.

Git history is cheap compared with losing provenance.

## 10. Canonical architecture

Target separation:

```text
One Brain
  ├─ ChatGPT — orchestration / reconciliation / connected sources
  ├─ Codex + FCC — isolated code and owner-Mac execution
  ├─ Hermes Agent — autonomous worker / reconnaissance / subagents / scheduling
  ├─ Gemini — second audit / knowledge curation
  └─ domain bots — specialized edge workflows until migration parity is proven
```

Hermes Agent memory is working memory. It must not become a second canonical truth store.

## Required output

A local audit run should finish with a sanitized table:

```text
COMPONENT | STATUS | EVIDENCE | ACTION | RISK | OWNER_GATE
```

Allowed actions:

`KEEP | FIX | ARCHIVE | REMOVE_LATER | MIGRATION_CANDIDATE | DO_NOT_TOUCH | ACCESS_GAP`

No cleanup action is complete without post-change evidence that the remaining runtime still works.
