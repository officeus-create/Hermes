#!/usr/bin/env python3
"""Apply reviewed Hermes compatibility patches for pinned FCC 5.14.5.

The pinned FCC revision has two Codex/Ollama integration defects that newer FCC
code has since corrected:

1. Unknown Ollama thinking capability is treated as reasoning-capable. This can
   make Codex send ``thinking`` to non-thinking models such as qwen2.5-coder.
2. ``fcc-codex`` selects the configured raw provider/model ref even when the
   generated catalog advertises that same model under a different no-thinking
   wire slug. Codex then cannot find metadata for the selected model and falls
   back to generic metadata.

Hermes keeps FCC pinned and isolated, so this script backports only the narrow
reviewed behavior needed for those two cases. It is fail-closed on unexpected
source shapes and idempotent on already-patched runtimes.
"""

from __future__ import annotations

import argparse
import importlib.metadata
import pathlib
import py_compile
import sys
from dataclasses import dataclass

EXPECTED_VERSION = "5.14.5"


@dataclass(frozen=True, slots=True)
class Replacement:
    relative_path: pathlib.Path
    old: str
    new: str


REPLACEMENTS = (
    Replacement(
        pathlib.Path("free_claude_code/api/model_catalog.py"),
        "        allows_reasoning = inventory_model.supports_thinking is not False\n",
        """        allows_reasoning = (\n            inventory_model.supports_thinking is True\n            if provider_model_ref.startswith(\"ollama/\")\n            else inventory_model.supports_thinking is not False\n        )\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/model_catalog.py"),
        "from collections.abc import Mapping\n",
        "from collections.abc import Mapping, Sequence\n",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/model_catalog.py"),
        """    return tuple(models)\n\n\ndef fetch_proxy_models_response(proxy_root_url: str, auth_token: str) -> JsonObject:\n""",
        """    return tuple(models)\n\n\ndef catalog_wire_slug_for_ref(\n    models: Sequence[ClientModel],\n    provider_model_ref: str | None,\n) -> str | None:\n    \"\"\"Return the catalog slug advertised for one configured provider ref.\n\n    Non-thinking gateway models can be advertised under a compatibility slug\n    instead of their bare provider ref. Selecting the advertised slug keeps\n    Codex metadata and request shaping aligned with the gateway catalog.\n    \"\"\"\n\n    if not provider_model_ref:\n        return provider_model_ref\n\n    for model in models:\n        if model.provider_model_ref == provider_model_ref:\n            return model.wire_slug\n    return provider_model_ref\n\n\ndef fetch_proxy_models_response(proxy_root_url: str, auth_token: str) -> JsonObject:\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        "from collections.abc import Mapping, Sequence\n",
        "from collections.abc import Mapping, Sequence\nfrom dataclasses import dataclass\n",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        "from .model_catalog import fetch_proxy_models_response\n",
        """from .model_catalog import (\n    ClientModel,\n    catalog_wire_slug_for_ref,\n    client_models_from_response,\n    fetch_proxy_models_response,\n)\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        """    catalog_args = codex_model_catalog_config_args(proxy_root_url, settings)\n    run_client_process(\n        command=build_codex_launcher_command(\n            binary_path=binary_path,\n            argv=args,\n            settings=settings,\n            proxy_root_url=proxy_root_url,\n            catalog_config_args=catalog_args,\n        ),\n""",
        """    catalog = codex_model_catalog_plan(proxy_root_url, settings)\n    run_client_process(\n        command=build_codex_launcher_command(\n            binary_path=binary_path,\n            argv=args,\n            settings=settings,\n            proxy_root_url=proxy_root_url,\n            catalog_config_args=catalog.config_args,\n            catalog_models=catalog.models,\n        ),\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        """\ndef codex_binary_name() -> str:\n""",
        """\n@dataclass(frozen=True, slots=True)\nclass CodexModelCatalogPlan:\n    \"\"\"The generated Codex catalog config args and advertised models.\"\"\"\n\n    config_args: tuple[str, ...] = ()\n    models: tuple[ClientModel, ...] = ()\n\n\ndef codex_binary_name() -> str:\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        """    catalog_config_args: Sequence[str] = (),\n) -> list[str]:\n""",
        """    catalog_config_args: Sequence[str] = (),\n    catalog_models: Sequence[ClientModel] = (),\n) -> list[str]:\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        """            api_url=_ensure_v1_url(proxy_root_url),\n            model=getattr(settings, \"model\", None),\n""",
        """            api_url=_ensure_v1_url(proxy_root_url),\n            model=catalog_wire_slug_for_ref(\n                catalog_models, getattr(settings, \"model\", None)\n            ),\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex.py"),
        """def codex_model_catalog_config_args(\n    proxy_root_url: str, settings: Settings\n) -> list[str]:\n    \"\"\"Prepare the generated Codex model catalog and return its config args.\"\"\"\n\n    try:\n        models_response = fetch_proxy_models_response(\n            proxy_root_url, settings.proxy_auth_token\n        )\n        catalog = build_codex_model_catalog(models_response)\n        models = catalog.get(\"models\")\n        if not isinstance(models, list) or not models:\n            print(\n                \"Free Claude Code warning: Codex model catalog is empty; \"\n                \"launching without model picker catalog.\",\n                file=sys.stderr,\n            )\n            return []\n        catalog_path = codex_model_catalog_path()\n        write_codex_model_catalog(catalog_path, catalog)\n    except Exception as exc:\n        print(\n            \"Free Claude Code warning: could not prepare Codex model catalog \"\n            f\"({exc}); launching without model picker catalog.\",\n            file=sys.stderr,\n        )\n        return []\n\n    return build_model_catalog_config_args(str(catalog_path))\n""",
        """def codex_model_catalog_plan(\n    proxy_root_url: str, settings: Settings\n) -> CodexModelCatalogPlan:\n    \"\"\"Prepare the generated Codex catalog and advertised model records.\"\"\"\n\n    try:\n        models_response = fetch_proxy_models_response(\n            proxy_root_url, settings.proxy_auth_token\n        )\n        models = client_models_from_response(models_response)\n        if not models:\n            print(\n                \"Free Claude Code warning: Codex model catalog is empty; \"\n                \"launching without model picker catalog.\",\n                file=sys.stderr,\n            )\n            return CodexModelCatalogPlan()\n        catalog_path = codex_model_catalog_path()\n        write_codex_model_catalog(\n            catalog_path, build_codex_model_catalog(models_response)\n        )\n    except Exception as exc:\n        print(\n            \"Free Claude Code warning: could not prepare Codex model catalog \"\n            f\"({exc}); launching without model picker catalog.\",\n            file=sys.stderr,\n        )\n        return CodexModelCatalogPlan()\n\n    return CodexModelCatalogPlan(\n        config_args=tuple(build_model_catalog_config_args(str(catalog_path))),\n        models=models,\n    )\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex_model_catalog.py"),
        "        \"default_reasoning_level\": \"medium\",\n        \"supported_reasoning_levels\": SUPPORTED_REASONING_LEVELS,\n",
        """        **(\n            {\"default_reasoning_level\": \"medium\"}\n            if candidate.allows_reasoning\n            else {}\n        ),\n        \"supported_reasoning_levels\": (\n            SUPPORTED_REASONING_LEVELS if candidate.allows_reasoning else []\n        ),\n""",
    ),
    Replacement(
        pathlib.Path("free_claude_code/cli/launchers/codex_model_catalog.py"),
        "        \"supports_reasoning_summaries\": True,\n        \"default_reasoning_summary\": \"none\",\n",
        """        \"supports_reasoning_summaries\": candidate.allows_reasoning,\n        **(\n            {\"default_reasoning_summary\": \"none\"}\n            if candidate.allows_reasoning\n            else {}\n        ),\n""",
    ),
)


def fail(message: str) -> "NoReturn":
    print(f"[fcc-ollama-thinking-patch] ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def _apply_replacements(
    site_packages: pathlib.Path, *, check: bool
) -> tuple[pathlib.Path, ...]:
    launcher_dir = site_packages / "free_claude_code/cli/launchers"
    active = [REPLACEMENTS[0]]

    # The repository CI fixture intentionally contains only the API catalog
    # expression. A real FCC 5.14.5 install always has the launcher directory;
    # once it exists, require and patch every reviewed Codex backport target.
    if launcher_dir.is_dir():
        active.extend(REPLACEMENTS[1:])

    originals: dict[pathlib.Path, str] = {}
    changed: set[pathlib.Path] = set()

    try:
        for replacement in active:
            target = site_packages / replacement.relative_path
            if not target.is_file():
                fail(f"target file is missing: {target}")

            text = originals.setdefault(target, target.read_text(encoding="utf-8"))
            current = target.read_text(encoding="utf-8")
            old_count = current.count(replacement.old)
            new_count = current.count(replacement.new)

            if new_count == 1 and old_count == 0:
                continue

            if check:
                if old_count == 1 and new_count == 0:
                    fail(f"required patch is not applied: {target}")
                fail(
                    f"unexpected source shape in {target} "
                    f"(old={old_count}, new={new_count})"
                )

            if old_count != 1 or new_count != 0:
                fail(
                    f"refusing to patch unexpected source shape in {target} "
                    f"(old={old_count}, new={new_count})"
                )

            target.write_text(current.replace(replacement.old, replacement.new, 1), encoding="utf-8")
            changed.add(target)

        targets = tuple(sorted({site_packages / r.relative_path for r in active}))
        for target in targets:
            py_compile.compile(str(target), doraise=True)
        return targets
    except BaseException:
        if not check:
            for target in changed:
                target.write_text(originals[target], encoding="utf-8")
        raise


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

    targets = _apply_replacements(args.site_packages, check=args.check)
    verb = "verified" if args.check else "applied/verified"
    print(
        f"[fcc-ollama-thinking-patch] PASS: {verb} {len(targets)} target(s)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
