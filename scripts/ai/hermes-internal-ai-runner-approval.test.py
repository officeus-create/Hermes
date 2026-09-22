#!/usr/bin/env python3
"""Repository-only contract tests for Internal AI approval transport."""

from __future__ import annotations

import importlib.util
from pathlib import Path


RUNNER_PATH = Path(__file__).with_name("hermes-internal-ai-runner.py")
SPEC = importlib.util.spec_from_file_location("hermes_internal_ai_runner", RUNNER_PATH)
assert SPEC and SPEC.loader
runner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(runner)

captured: dict[str, object] = {}


def fake_request(path: str, *, method: str = "GET", payload=None):
    captured.update(path=path, method=method, payload=payload)
    return {"success": True}


def fake_git(*args: str) -> str:
    if args == ("branch", "--show-current"):
        return "internal-ai/hcai-test"
    if args == ("rev-parse", "HEAD"):
        return "abc123"
    return ""


runner.request_json = fake_request
runner.git = fake_git
runner.current_pr_url = lambda: ""
runner.complete(
    "hcai-test",
    status="needs_approval",
    output="Stopped before merge.",
    return_code=0,
    approval_gate="merge_deploy",
)

assert captured["path"] == "/api/internal-ai/runner/complete"
assert captured["method"] == "POST"
payload = captured["payload"]
assert isinstance(payload, dict)
assert payload["status"] == "needs_approval"
assert payload["approval_gate"] == "merge_deploy"

prompt = runner.bounded_internal_prompt(
    "Prepare the harmless repository proof.",
    "internal-ai/hcai-test",
    "merge_deploy",
)
assert "SCOPED OWNER APPROVAL RECEIPT" in prompt
assert "exactly this gate" in prompt
assert "`merge_deploy`" in prompt
assert "does not authorize any other consequential gate" in prompt

ordinary_prompt = runner.bounded_internal_prompt(
    "Inspect the repository.",
    "internal-ai/hcai-new",
)
assert "SCOPED OWNER APPROVAL RECEIPT" not in ordinary_prompt

print("Hermes Internal AI runner approval transport: PASS")
