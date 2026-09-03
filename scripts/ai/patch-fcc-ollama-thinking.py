#!/usr/bin/env python3
"""Apply the reviewed Hermes compatibility patch for FCC 5.14.5 Ollama metadata.

FCC 5.14.5 treats unknown ``supports_thinking`` metadata as reasoning-capable in
its Responses model catalog. Ollama models discovered through the generic
OpenAI-compatible path can therefore be advertised as supporting reasoning even
when their capability is unknown, which causes Codex to send ``thinking`` and
Ollama to reject non-thinking models such as qwen2.5-coder.

This patch is intentionally narrow:
- only FCC 5.14.5 is accepted;
- only the exact reviewed source expression is replaced;
- only ``ollama/`` models change semantics;
- explicit ``supports_thinking=True`` remains enabled for Ollama thinking models;
- other providers preserve FCC's existing permissive behavior.
"""

from __future__ import annotations

import argparse
import importlib.metadata
import pathlib
import py_compile
import sys

EXPECTED_VERSION = "5.14.5"
RELATIVE_TARGET = pathlib.Path("free_claude_code/api/model_catalog.py")
OLD = "        allows_reasoning = inventory_model.supports_thinking is not False\n"
NEW = """        allows_reasoning = (\n            inventory_model.supports_thinking is True\n            if provider_model_ref.startswith(\"ollama/\")\n            else inventory_model.supports_thinking is not False\n        )\n"""


def fail(message: str) -> "NoReturn":
    print(f"[fcc-ollama-thinking-patch] ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-packages", type=pathlib.Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    try:
        version = importlib.metadata.version("free-claude-code")
    except importlib.metadata.PackageNotFoundError:
        fail("free-claude-code is not installed in this Python environment")

    if version != EXPECTED_VERSION:
        fail(f"expected free-claude-code {EXPECTED_VERSION}, got {version}")

    target = args.site_packages / RELATIVE_TARGET
    if not target.is_file():
        fail(f"target file is missing: {target}")

    text = target.read_text(encoding="utf-8")
    old_count = text.count(OLD)
    new_count = text.count(NEW)

    if new_count == 1 and old_count == 0:
        print(f"[fcc-ollama-thinking-patch] PASS: already applied to {target}")
        return 0

    if args.check:
        fail(
            "required patch is not applied"
            if old_count == 1 and new_count == 0
            else f"unexpected source shape (old={old_count}, new={new_count})"
        )

    if old_count != 1 or new_count != 0:
        fail(f"refusing to patch unexpected source shape (old={old_count}, new={new_count})")

    original = text
    patched = text.replace(OLD, NEW, 1)
    target.write_text(patched, encoding="utf-8")

    try:
        py_compile.compile(str(target), doraise=True)
    except Exception:
        target.write_text(original, encoding="utf-8")
        raise

    print(f"[fcc-ollama-thinking-patch] PASS: applied to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
