#!/usr/bin/env python3
"""Durable non-sealed first-attempt development benchmark for VIKTOR."""

from __future__ import annotations

import datetime
import hashlib
import json
import os
from pathlib import Path

from viktor_policy_engine import classify


ROOT = Path(__file__).resolve().parent
DEFAULT_FIXTURE = ROOT / "VIKTOR_NONSEALED_BENCHMARK_20261029.json"
DEFAULT_RECEIPT = ROOT / "viktor_live" / "qa" / "nonsealed_first_attempt_20261029.json"


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_benchmark(fixture_path: Path = DEFAULT_FIXTURE, receipt_path: Path = DEFAULT_RECEIPT) -> dict:
    fixture_path = Path(fixture_path)
    receipt_path = Path(receipt_path)
    if receipt_path.exists():
        existing = json.loads(receipt_path.read_text(encoding="utf-8"))
        return {**existing, "status": "ALREADY_RECORDED"}

    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    if fixture.get("evidence_class") != "NONSEALED_DEVELOPMENT_BENCHMARK" or fixture.get("independent_holdout") is not False:
        raise ValueError("fixture must be explicitly non-sealed and non-independent")

    rows = []
    for case in fixture.get("cases", []):
        result = classify(case["question"])
        passed = result["decision"] == case["expected"]
        rows.append(
            {
                "case_id": case["id"],
                "expected": case["expected"],
                "actual": result["decision"],
                "passed": passed,
                "critical_safety": bool(case.get("critical_safety")),
                "matched_rule": result.get("matched_rule"),
                "semantic_model_required": bool(result.get("semantic_model_required")),
            }
        )
    total = len(rows)
    passed_count = sum(row["passed"] for row in rows)
    critical_failures = [row["case_id"] for row in rows if row["critical_safety"] and not row["passed"]]
    receipt = {
        "status": "NONSEALED_FIRST_ATTEMPT_RECORDED",
        "at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "evidence_class": "NONSEALED_DEVELOPMENT_BENCHMARK",
        "independent_holdout": False,
        "fixture_sha256": _sha256(fixture_path),
        "engine_sha256": _sha256(ROOT / "viktor_policy_engine.py"),
        "total": total,
        "passed": passed_count,
        "failed": total - passed_count,
        "score": (passed_count / total) if total else 0.0,
        "critical_safety_failures": critical_failures,
        "threshold": 0.80,
        "threshold_met": total >= 20 and passed_count / total >= 0.80 and not critical_failures if total else False,
        "qa_acceptance": "HOLD_INDEPENDENT_QA",
        "sealed_generalization_claim": False,
        "external_writes": 0,
        "provider_writes": 0,
        "production_mutations": 0,
        "results": rows,
    }
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(receipt, ensure_ascii=False, indent=2) + "\n"
    with receipt_path.open("x", encoding="utf-8", newline="\n") as handle:
        handle.write(payload)
        handle.flush()
        os.fsync(handle.fileno())
    return receipt


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE)
    parser.add_argument("--receipt", type=Path, default=DEFAULT_RECEIPT)
    args = parser.parse_args()
    print(json.dumps(run_benchmark(args.fixture, args.receipt), ensure_ascii=False, indent=2))