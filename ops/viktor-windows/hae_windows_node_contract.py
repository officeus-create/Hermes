#!/usr/bin/env python3
"""Fail-closed local proof harness for the canonical HAE Windows node contract.

This module does not claim or mutate Cloudflare D1/Queue state.  It proves the
lease, fencing, idempotency and receipt semantics that a future owner-approved
HAE integration must preserve.
"""

from __future__ import annotations

import datetime
import hashlib
import json
import os
import re
from pathlib import Path


CONTRACT_VERSION = "windows-node-v1"
PERMISSION_CLASS = "READ_ONLY_SEMANTIC"
WORK_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9:._-]{3,127}$")
HEX64_RE = re.compile(r"^[a-f0-9]{64}$")


def _canonical(value: dict) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _hash_receipt(row: dict) -> str:
    unsigned = {key: value for key, value in row.items() if key != "receipt_hash"}
    return hashlib.sha256(_canonical(unsigned)).hexdigest()


def _utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def verify_receipt_chain(path: Path) -> dict:
    previous = "GENESIS"
    count = 0
    if not Path(path).exists():
        return {"valid": True, "count": 0, "last_hash": previous}
    for line_number, raw in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        try:
            row = json.loads(raw)
        except ValueError:
            return {"valid": False, "count": count, "error": "INVALID_JSON", "line": line_number}
        if row.get("previous_hash") != previous:
            return {"valid": False, "count": count, "error": "CHAIN_BREAK", "line": line_number}
        observed = str(row.get("receipt_hash", ""))
        expected = _hash_receipt(row)
        if observed != expected:
            return {"valid": False, "count": count, "error": "HASH_MISMATCH", "line": line_number}
        previous = observed
        count += 1
    return {"valid": True, "count": count, "last_hash": previous}


class ContractMachine:
    """In-memory lease state with an append-only local evidence journal."""

    def __init__(self, receipt_path: Path, node_id: str):
        self.receipt_path = Path(receipt_path)
        self.node_id = str(node_id)
        self._leases: dict[str, dict] = {}
        chain = verify_receipt_chain(self.receipt_path)
        if not chain["valid"]:
            raise ValueError("receipt chain is not valid")
        self._previous_hash = chain["last_hash"]

    def _append(self, status: str, claim: dict, **details) -> dict:
        row = {
            "at_utc": _utc_now(),
            "status": status,
            "work_id": claim.get("work_id"),
            "lease_id": claim.get("lease_id"),
            "fence": claim.get("fence"),
            "node_id": claim.get("node_id"),
            "permission_class": claim.get("permission_class"),
            "contract_version": claim.get("contract_version"),
            "hae_d1_written": False,
            "external_writes": 0,
            "production_mutations": 0,
            "evidence_class": "LOCAL_CONTRACT_PROOF_ONLY",
            "previous_hash": self._previous_hash,
            **details,
        }
        row["receipt_hash"] = _hash_receipt(row)
        self.receipt_path.parent.mkdir(parents=True, exist_ok=True)
        with self.receipt_path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        self._previous_hash = row["receipt_hash"]
        return row

    def _validate(self, claim: dict) -> str | None:
        if claim.get("node_id") != self.node_id:
            return "NODE_ID_REJECTED"
        if claim.get("permission_class") != PERMISSION_CLASS:
            return "PERMISSION_CLASS_REJECTED"
        if claim.get("contract_version") != CONTRACT_VERSION:
            return "CONTRACT_VERSION_REJECTED"
        if not WORK_ID_RE.fullmatch(str(claim.get("work_id", ""))):
            return "WORK_ID_REJECTED"
        if not str(claim.get("lease_id", "")).strip():
            return "LEASE_ID_REJECTED"
        fence = claim.get("fence")
        if not isinstance(fence, int) or isinstance(fence, bool) or fence < 1:
            return "FENCE_REJECTED"
        return None

    def claim(self, claim: dict) -> dict:
        error = self._validate(claim)
        if error:
            return self._append(error, claim, accepted=False)
        work_id = claim["work_id"]
        active = self._leases.get(work_id)
        if active:
            if active["lease_id"] == claim["lease_id"] and active["fence"] == claim["fence"]:
                return self._append("IDEMPOTENT_REPLAY", claim, accepted=True)
            if claim["fence"] <= active["fence"]:
                return self._append("STALE_FENCE_REJECTED", claim, accepted=False, active_fence=active["fence"])
        self._leases[work_id] = {"lease_id": claim["lease_id"], "fence": claim["fence"]}
        return self._append("LEASE_ACCEPTED", claim, accepted=True)

    def complete(self, claim: dict, *, output_ref: str, output_sha256: str, qa_status: str) -> dict:
        error = self._validate(claim)
        if error:
            return self._append(error, claim, accepted=False)
        active = self._leases.get(claim["work_id"])
        if not active or active != {"lease_id": claim["lease_id"], "fence": claim["fence"]}:
            return self._append("COMPLETION_LEASE_REJECTED", claim, accepted=False)
        if not str(output_ref).startswith("local://") or not HEX64_RE.fullmatch(str(output_sha256)):
            return self._append("OUTPUT_PROOF_REJECTED", claim, accepted=False)
        if qa_status not in {"HOLD_INDEPENDENT_QA", "INDEPENDENT_QA_ACCEPTED"}:
            return self._append("QA_STATUS_REJECTED", claim, accepted=False)
        return self._append(
            "LOCAL_COMPLETION_RECORDED",
            claim,
            accepted=True,
            output_ref=output_ref,
            output_sha256=output_sha256,
            qa_status=qa_status,
            release_allowed=False,
            next_action="OWNER_APPROVED_HAE_D1_ADAPTER_AND_INDEPENDENT_READBACK",
        )


def selftest(receipt_path: Path) -> dict:
    if receipt_path.exists():
        receipt_path.unlink()
    machine = ContractMachine(receipt_path, node_id="VIKTOR-WINDOWS")
    claim = {
        "work_id": "HAE-SELF:windows-contract-selftest",
        "lease_id": "lease-selftest-001",
        "fence": 4,
        "node_id": "VIKTOR-WINDOWS",
        "permission_class": PERMISSION_CLASS,
        "contract_version": CONTRACT_VERSION,
    }
    statuses = [
        machine.claim(claim)["status"],
        machine.claim(claim)["status"],
        machine.claim({**claim, "lease_id": "stale", "fence": 3})["status"],
        machine.claim({**claim, "node_id": "internal-ai-mac-runner", "fence": 5})["status"],
        machine.complete(
            claim,
            output_ref="local://selftest/windows-contract",
            output_sha256=hashlib.sha256(b"windows-contract").hexdigest(),
            qa_status="HOLD_INDEPENDENT_QA",
        )["status"],
    ]
    expected = [
        "LEASE_ACCEPTED",
        "IDEMPOTENT_REPLAY",
        "STALE_FENCE_REJECTED",
        "NODE_ID_REJECTED",
        "LOCAL_COMPLETION_RECORDED",
    ]
    chain = verify_receipt_chain(receipt_path)
    return {
        "status": "LOCAL_WORK_CONTRACT_SELFTEST_PASS" if statuses == expected and chain["valid"] else "LOCAL_WORK_CONTRACT_SELFTEST_FAIL",
        "statuses": statuses,
        "chain": chain,
        "hae_d1_written": False,
        "release_allowed": False,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--receipt", default=str(Path(__file__).resolve().parent / "viktor_live" / "qa" / "work_contract_selftest.jsonl"))
    args = parser.parse_args()
    if args.self_test:
        print(json.dumps(selftest(Path(args.receipt)), ensure_ascii=False, indent=2))