#!/usr/bin/env python3
"""Outbound-only local runner for Hermes Owner Codex tasks.

Required local environment:
  HERMES_OWNER_CODEX_API=https://hermeslogisticsus.com
  HERMES_OWNER_CODEX_RUNNER_TOKEN=<scoped secret stored locally only>

The runner never opens an inbound listener and never interpolates task text into a shell.
"""

from __future__ import annotations

import json
import os
import selectors
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

POLL_SECONDS = max(5, int(os.environ.get("HERMES_OWNER_CODEX_POLL_SECONDS", "10")))
STATE_POLL_SECONDS = max(5, int(os.environ.get("HERMES_OWNER_CODEX_STATE_POLL_SECONDS", "10")))
EVENT_FLUSH_SECONDS = 2.0
MAX_EVENT_CHARS = 3500
MAX_SUMMARY_CHARS = 18000
RUNNER_TIMEOUT_SECONDS = max(60, int(os.environ.get("HERMES_OWNER_CODEX_TASK_TIMEOUT_SECONDS", "3600")))

SCRIPT = Path(__file__).resolve()
REPO = SCRIPT.parents[2]
CODEX_HERMES = REPO / "scripts" / "ai" / "codex-hermes"
API_BASE = os.environ.get("HERMES_OWNER_CODEX_API", "").rstrip("/")
TOKEN = os.environ.get("HERMES_OWNER_CODEX_RUNNER_TOKEN", "")
MODEL = os.environ.get("HERMES_CODEX_MODEL", "")
FALLBACKS = os.environ.get("HERMES_CODEX_FALLBACKS", "")

REDACTION_MARKERS = ("api_key", "apikey", "authorization", "bearer", "token", "secret")


def die(message: str) -> None:
    print(f"[hermes-owner-runner] ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def sanitize(text: str, limit: int = MAX_EVENT_CHARS) -> str:
    value = (text or "").replace("\x00", "").strip()
    safe_lines: list[str] = []
    for raw in value.splitlines():
        lower = raw.lower()
        if any(marker in lower and (":" in raw or "=" in raw) for marker in REDACTION_MARKERS):
            key = raw.split(":", 1)[0].split("=", 1)[0].strip()
            safe_lines.append(f"{key}: [REDACTED]")
        else:
            safe_lines.append(raw)
    return "\n".join(safe_lines)[:limit]


def git(*args: str) -> str:
    try:
        return subprocess.check_output(["git", "-C", str(REPO), *args], text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def codex_version() -> str:
    try:
        return subprocess.check_output(["codex", "--version"], text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return "unknown"


def current_pr_url() -> str:
    """Return the PR for the current branch when gh is authenticated; otherwise stay empty."""
    try:
        return subprocess.check_output(
            ["gh", "pr", "view", "--json", "url", "--jq", ".url"],
            cwd=REPO,
            text=True,
            stderr=subprocess.DEVNULL,
            timeout=15,
        ).strip()
    except Exception:
        return ""


def tracked_worktree_changes() -> str:
    """Return tracked changes only; known local untracked tool state must not be destroyed."""
    return git("status", "--porcelain", "--untracked-files=no")


def repo_execution_preflight() -> str | None:
    """Require a clean, current canonical starting point before accepting remote execution."""
    branch = git("branch", "--show-current")
    if branch != "main":
        return f"Local runner requires the canonical main branch before starting a browser task; current branch is {branch or 'unknown'}."
    if tracked_worktree_changes():
        return "Local runner requires a clean tracked working tree before starting a browser task. Untracked files are left untouched."
    try:
        subprocess.run(
            ["git", "-C", str(REPO), "fetch", "origin", "main", "--quiet"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=60,
        )
    except Exception:
        return "Local runner could not refresh origin/main; refusing to start a browser task from unverified repository state."
    head = git("rev-parse", "HEAD")
    origin_main = git("rev-parse", "origin/main")
    if not head or not origin_main or head != origin_main:
        return "Local main is not exactly aligned with origin/main. Reconcile it manually before starting a browser task; the runner will not reset or overwrite local history."
    return None


def task_branch_name(task_id: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in task_id)[:80]
    return f"owner-codex/{safe or 'task'}"


def prepare_task_branch(task_id: str) -> tuple[str, str]:
    """Create one isolated branch for the claimed owner task; never let remote work start on main."""
    starting_sha = git("rev-parse", "HEAD")
    branch = task_branch_name(task_id)
    subprocess.run(
        ["git", "-C", str(REPO), "switch", "-c", branch],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=30,
    )
    return branch, starting_sha


def restore_main_if_safe(task_branch: str | None = None, starting_sha: str | None = None) -> None:
    """Return to main after a task only when the task left no tracked work in progress."""
    if tracked_worktree_changes():
        print("[hermes-owner-runner] tracked task changes remain; leaving checkout untouched for review", file=sys.stderr)
        return
    current_branch = git("branch", "--show-current")
    current_sha = git("rev-parse", "HEAD")
    if current_branch == "main":
        return
    try:
        subprocess.run(
            ["git", "-C", str(REPO), "switch", "main"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=30,
        )
        if task_branch and current_branch == task_branch and starting_sha and current_sha == starting_sha:
            subprocess.run(
                ["git", "-C", str(REPO), "branch", "-d", task_branch],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=30,
            )
    except Exception:
        print("[hermes-owner-runner] unable to restore main automatically; next task will fail closed until reconciled", file=sys.stderr)


def bounded_owner_prompt(prompt: str, task_branch: str) -> str:
    """Preserve governance regardless of what free-form text is typed into the browser."""
    return f"""HERMES OWNER BROWSER TASK — BOUNDED EXECUTION CONTRACT

You are Hermes-Codex operating inside ~/Hermes on isolated task branch `{task_branch}`.
Read and obey AGENTS.md, docs/AI_START_HERE.md and current HOS/HUEG/one-writer rules before acting.

This browser task is authorization to investigate and perform ordinary low-risk repository work only. It is NOT, by itself, authorization to merge, deploy, change DNS, modify credentials/billing, perform destructive production actions, or send external communications. If the requested work reaches one of those gates, prepare evidence and stop at the exact gate.

Do not switch to `main` for implementation. Keep writes on the isolated task branch (or a more specific non-main branch if governance requires it), run relevant tests, and create a PR where justified. Never delete or overwrite unrelated local/untracked work.

OWNER TASK:
{prompt}
"""


def request_json(path: str, *, method: str = "GET", payload: dict[str, Any] | None = None) -> dict[str, Any]:
    url = f"{API_BASE}{path}"
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "HermesOwnerCodexRunner/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read().decode("utf-8")
        return json.loads(body or "{}")


def post_event(task_id: str, event_type: str, message: str) -> None:
    safe = sanitize(message)
    if not safe:
        return
    request_json(
        "/api/owner-codex/runner/event",
        method="POST",
        payload={"task_id": task_id, "event_type": event_type, "message": safe},
    )


def task_state(task_id: str) -> dict[str, Any] | None:
    query = urllib.parse.urlencode({"id": task_id})
    response = request_json(f"/api/owner-codex/runner/task?{query}")
    return response.get("task") if response.get("success") else None


def claim() -> dict[str, Any] | None:
    payload = {
        "repo_sha": git("rev-parse", "HEAD"),
        "runtime_version": codex_version(),
        "model": MODEL or None,
        "fallback_route": FALLBACKS or None,
    }
    response = request_json("/api/owner-codex/runner/claim", method="POST", payload=payload)
    if not response.get("success"):
        raise RuntimeError(response.get("error") or "claim_failed")
    return response.get("task")


def complete(task_id: str, *, status: str, output: str, return_code: int | None) -> None:
    branch = git("branch", "--show-current")
    repo_sha = git("rev-parse", "HEAD")
    summary = sanitize(output, MAX_SUMMARY_CHARS)
    if return_code is not None:
        summary = f"exit_code={return_code}\n{summary}"[:MAX_SUMMARY_CHARS]
    request_json(
        "/api/owner-codex/runner/complete",
        method="POST",
        payload={
            "task_id": task_id,
            "status": status,
            "repo_sha": repo_sha or None,
            "branch": branch or None,
            "pr_url": current_pr_url() or None,
            "model": MODEL or None,
            "fallback_route": FALLBACKS or None,
            "evidence_class": "LOCAL_RUNNER_EXECUTION",
            "output_summary": summary,
        },
    )


def terminate_owned_process(process: subprocess.Popen[str]) -> None:
    """Terminate only the Codex process group created by this runner."""
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            pass


def execute_task(task: dict[str, Any]) -> None:
    task_id = str(task.get("id") or "")
    prompt = str(task.get("prompt") or "")
    if not task_id or not prompt:
        raise RuntimeError("invalid_claimed_task")
    if not CODEX_HERMES.exists() or not os.access(CODEX_HERMES, os.X_OK):
        complete(task_id, status="failed", output="Hermes Codex launcher is missing or not executable.", return_code=None)
        return

    preflight_error = repo_execution_preflight()
    if preflight_error:
        complete(task_id, status="failed", output=preflight_error, return_code=None)
        return

    task_branch: str | None = None
    starting_sha: str | None = None
    try:
        task_branch, starting_sha = prepare_task_branch(task_id)
    except Exception:
        complete(task_id, status="failed", output="Unable to create an isolated non-main task branch; no Codex task was started.", return_code=None)
        return

    post_event(task_id, "runner_started", f"Runner accepted task on repo SHA {starting_sha or 'unknown'} and isolated branch {task_branch}.")
    guarded_prompt = bounded_owner_prompt(prompt, task_branch)
    command = [str(CODEX_HERMES), "exec", guarded_prompt]
    env = os.environ.copy()
    process = subprocess.Popen(
        command,
        cwd=REPO,
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        start_new_session=True,
    )

    selector = selectors.DefaultSelector()
    assert process.stdout is not None
    selector.register(process.stdout, selectors.EVENT_READ)
    started = time.monotonic()
    last_state_check = 0.0
    last_flush = time.monotonic()
    buffered: list[str] = []
    summary_tail = ""
    cancelled = False

    try:
        while process.poll() is None:
            now = time.monotonic()
            if now - started > RUNNER_TIMEOUT_SECONDS:
                post_event(task_id, "timeout", "Task exceeded the configured local runner timeout and was terminated.")
                terminate_owned_process(process)
                break

            if now - last_state_check >= STATE_POLL_SECONDS:
                last_state_check = now
                try:
                    state = task_state(task_id)
                    if state and state.get("cancel_requested"):
                        cancelled = True
                        post_event(task_id, "cancel_requested", "Owner requested cancellation; terminating only the owned Codex process group.")
                        terminate_owned_process(process)
                        break
                except Exception as exc:
                    print(f"[hermes-owner-runner] cancel/heartbeat poll warning: {sanitize(str(exc), 300)}", file=sys.stderr)

            for key, _ in selector.select(timeout=0.5):
                line = key.fileobj.readline()
                if line:
                    summary_tail = (summary_tail + line)[-MAX_SUMMARY_CHARS:]
                    buffered.append(line)

            if buffered and (time.monotonic() - last_flush >= EVENT_FLUSH_SECONDS or sum(map(len, buffered)) >= MAX_EVENT_CHARS):
                chunk = sanitize("".join(buffered))
                buffered.clear()
                last_flush = time.monotonic()
                if chunk:
                    try:
                        post_event(task_id, "output", chunk)
                    except Exception as exc:
                        print(f"[hermes-owner-runner] event upload warning: {sanitize(str(exc), 300)}", file=sys.stderr)

        if process.stdout:
            remainder = process.stdout.read()
            if remainder:
                summary_tail = (summary_tail + remainder)[-MAX_SUMMARY_CHARS:]
                buffered.append(remainder)
        if buffered:
            try:
                post_event(task_id, "output", sanitize("".join(buffered)))
            except Exception:
                pass

        try:
            return_code = process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            terminate_owned_process(process)
            return_code = process.poll() if process.poll() is not None else -9

        remaining_tracked = tracked_worktree_changes()
        if cancelled:
            complete(task_id, status="cancelled", output=summary_tail or "Cancelled by owner.", return_code=return_code)
        elif remaining_tracked:
            complete(
                task_id,
                status="failed",
                output=(summary_tail + "\n\nGovernance gate: tracked working-tree changes remain uncommitted; checkout was left untouched for review."),
                return_code=return_code,
            )
        elif return_code == 0:
            complete(task_id, status="completed", output=summary_tail, return_code=return_code)
        else:
            complete(task_id, status="failed", output=summary_tail, return_code=return_code)
    finally:
        # KeyboardInterrupt, terminal closure or an unexpected runner exception must
        # never leave the owned Codex child running detached in the background.
        terminate_owned_process(process)
        selector.close()
        restore_main_if_safe(task_branch, starting_sha)


def main() -> None:
    if not API_BASE.startswith("https://"):
        die("HERMES_OWNER_CODEX_API must be an https:// origin.")
    if not TOKEN:
        die("HERMES_OWNER_CODEX_RUNNER_TOKEN is required and must stay local.")
    if not (REPO / "AGENTS.md").exists():
        die(f"Hermes repository not found at {REPO}")

    print(f"[hermes-owner-runner] outbound poller started for {API_BASE}; repo={REPO}")
    while True:
        try:
            task = claim()
            if task:
                execute_task(task)
            else:
                time.sleep(POLL_SECONDS)
        except KeyboardInterrupt:
            print("\n[hermes-owner-runner] stopped by user")
            return
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:500]
            print(f"[hermes-owner-runner] HTTP {exc.code}: {sanitize(detail, 500)}", file=sys.stderr)
            time.sleep(POLL_SECONDS)
        except Exception as exc:
            print(f"[hermes-owner-runner] warning: {sanitize(str(exc), 500)}", file=sys.stderr)
            time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
