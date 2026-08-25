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

    post_event(task_id, "runner_started", f"Runner accepted task on repo SHA {git('rev-parse', 'HEAD') or 'unknown'}.")
    command = [str(CODEX_HERMES), "exec", prompt]
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

        if cancelled:
            complete(task_id, status="cancelled", output=summary_tail or "Cancelled by owner.", return_code=return_code)
        elif return_code == 0:
            complete(task_id, status="completed", output=summary_tail, return_code=return_code)
        else:
            complete(task_id, status="failed", output=summary_tail, return_code=return_code)
    finally:
        # KeyboardInterrupt, terminal closure or an unexpected runner exception must
        # never leave the owned Codex child running detached in the background.
        terminate_owned_process(process)
        selector.close()


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
