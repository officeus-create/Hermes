#!/usr/bin/env python3
"""Offline, cross-platform regressions for signed Windows VIKTOR HAE node.

Never opens a network connection, touches live HAE, or uses a paid model.
"""
import contextlib
import datetime
import importlib.util
import io
import json
import os
from pathlib import Path
import runpy
import shutil
import sys
import tempfile
import unittest
from unittest import mock
import urllib.error

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import hermes_hae_windows_node as node  # noqa: E402


def future_lease(seconds):
    return {
        "lease_until": (
            datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(seconds=seconds)
        ).isoformat().replace("+00:00", "Z")
    }


def lease(seconds=240):
    return {
        "job_id": "job:00000000-0000-4000-8000-000000000123",
        "work_id": "W-TEST-NOT-PRODUCTION",
        "node_id": node.NODE_ID,
        "node_contract_version": node.CONTRACT_VERSION,
        "job_type": "work.item.plan",
        "lease_id": "lease:00000000-0000-4000-8000-000000000456",
        "fence": 17,
        "role_contract": {
            "role_id": "hermes-agent-coordinator",
            "permission_class": "READ_ONLY",
            "semantic_required": True,
            "max_cost_usd": 0,
        },
        "semantic_request": {
            "system_prompt": "Local synthetic internal contract test.",
            "user_prompt": '{"available_execution_job_types":["ai.gateway.readiness.audit"]}',
            "max_output_tokens": 700,
        },
        **future_lease(seconds),
    }


class VIKTORRuntimeTests(unittest.TestCase):
    def test_server_style_host_normalization_is_local_only(self):
        cases = (
            ("127.0.0.1:11434", "http://127.0.0.1:11434", None),
            ("localhost:11434", "http://localhost:11434", None),
            ("http://127.0.0.1:11434", "http://127.0.0.1:11434", None),
            ("http://localhost:11434", "http://localhost:11434", None),
            ("0.0.0.0:11434", "0.0.0.0:11434", "OLLAMA_NOT_LOCALHOST"),
            ("http://0.0.0.0:11434", "http://0.0.0.0:11434", "OLLAMA_NOT_LOCALHOST"),
            ("https://example.invalid:11434", "https://example.invalid:11434", "OLLAMA_NOT_LOCALHOST"),
        )
        for raw, expected, error in cases:
            with self.subTest(raw=raw), mock.patch.dict(os.environ, {
                "HERMES_HAE_WINDOWS_NODE_ENABLED": "1",
                "HERMES_HAE_WINDOWS_NODE_TOKEN": "FAKE_OFFLINE_UNIT_TEST_TOKEN_1234567890",
                "HERMES_HAE_API": "https://hae-node.hermeslogisticsus.com",
                "OLLAMA_HOST": raw,
            }):
                module = runpy.run_path(str(ROOT / "hermes_hae_windows_node.py"), run_name="unit_only")
                self.assertEqual(module["OLLAMA"], expected)
                self.assertEqual(module["config_error"](), error)

    def test_replay_ttl_guard_handles_bad_and_expiring_leases(self):
        self.assertGreater(node.replay_lease_seconds_left(future_lease(240)), 220)
        self.assertLess(node.replay_lease_seconds_left(future_lease(40)), 60)
        self.assertIsNone(node.replay_lease_seconds_left({"lease_until": "broken"}))
        self.assertIsNone(node.replay_lease_seconds_left({}))

    def test_no_paid_inference_on_short_replayed_lease(self):
        calls = []

        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            calls.append(url)
            if url.endswith("/heartbeat"):
                return 200, {"success": True}
            if url.endswith("/claim"):
                return 200, {"success": True, "status": "LEASE_REPLAY", "lease": lease(90)}
            raise AssertionError("A short replay must not call completion")

        with mock.patch.object(node, "ENABLED", True), \
             mock.patch.object(node, "TOKEN", "FAKE_OFFLINE_UNIT_TEST_TOKEN_1234567890"), \
             mock.patch.object(node, "OLLAMA", "http://127.0.0.1:11434"), \
             mock.patch.object(node, "http_json", side_effect=fake_http), \
             mock.patch.object(node, "ollama", side_effect=AssertionError("LOCAL_MODEL_MUST_NOT_RUN")):
            with contextlib.redirect_stdout(io.StringIO()):
                result = node.run_once()
        self.assertEqual(result["status"], "LEASE_REPLAY_TTL_LOW")
        self.assertEqual(result["cost_usd"], 0)
        self.assertEqual(result["external_write"], False)
        self.assertEqual(len(calls), 2)

    def test_invalid_model_json_is_fail_closed_for_owner_plan_only(self):
        prompt = lease()["semantic_request"]
        def invalid(*args, **kwargs):
            return 200, {"message": {"content": "invalid json from bounded local model"},
                         "prompt_eval_count": 10, "eval_count": 700}
        with mock.patch.object(node, "http_json", side_effect=invalid):
            result, usage = node.ollama(prompt, "work.item.plan")
            self.assertEqual(result, {})
            self.assertEqual(usage["input_tokens"], 10)
            norm = node.normalize_semantic_result("work.item.plan", prompt, result)
            self.assertEqual(norm["disposition"], "NEEDS_CAPABILITY")
            self.assertIsNone(norm["recommended_job_type"])
            with self.assertRaises(ValueError):
                node.ollama(prompt, "search.defect.prioritize")
        valid = {"disposition": "NEEDS_OWNER_GATE", "recommended_job_type": None,
                 "rationale": "Human gate needed.", "next_action": "Request approval."}
        with mock.patch.object(node, "http_json", return_value=(
                200, {"message": {"content": json.dumps(valid)}, "eval_count": 14})):
            self.assertEqual(node.ollama(prompt, "work.item.plan")[0], valid)

    def test_409_rejection_logs_only_machine_error_not_payload(self):
        l = lease(240)
        calls = []
        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            calls.append(url)
            if url.endswith("/heartbeat"):
                return 200, {"success": True}
            if url.endswith("/claim"):
                return 200, {"success": True, "status": "LEASE_ACCEPTED", "lease": l}
            if url.endswith("/complete"):
                raise urllib.error.HTTPError(
                    url, 409, "Conflict", None,
                    io.BytesIO(b'{"error":"lease_fence_stale","private":"DO_NOT_LOG_USER_DATA"}'))
            raise AssertionError("Unexpected network operation")

        safe_plan = {"disposition": "NEEDS_CAPABILITY", "recommended_job_type": None,
                     "rationale": "No safe capability.", "next_action": "Await approval."}
        with mock.patch.object(node, "ENABLED", True), \
             mock.patch.object(node, "TOKEN", "FAKE_OFFLINE_UNIT_TEST_TOKEN_1234567890"), \
             mock.patch.object(node, "OLLAMA", "http://127.0.0.1:11434"), \
             mock.patch.object(node, "http_json", side_effect=fake_http), \
             mock.patch.object(node, "ollama", return_value=(safe_plan, {"input_tokens": 8, "output_tokens": 10})):
            stream = io.StringIO()
            with contextlib.redirect_stdout(stream):
                result = node.run_once()
        self.assertEqual(result["status"], "COMPLETION_REJECTED")
        self.assertEqual(result["http_status"], 409)
        self.assertEqual(result["server_error_code"], "lease_fence_stale")
        self.assertNotIn("DO_NOT_LOG_USER_DATA", stream.getvalue())
        self.assertEqual(len([url for url in calls if url.endswith("/complete")]), 1)

    def test_local_history_redacts_sensitive_fields_and_rotates(self):
        with tempfile.TemporaryDirectory(prefix="hermes_hae_history_") as tmp:
            path = Path(tmp) / "hermes_hae_windows_node_loop.py"
            shutil.copyfile(ROOT / "hermes_hae_windows_node_loop.py", path)
            ns = runpy.run_path(str(path), run_name="offline_test_no_main")
            save = ns["save"]
            run = Path(tmp) / "viktor_live"
            idle = {"status": "NO_ELIGIBLE_WORK", "at": "2026-11-06T13:00:00Z",
                    "user_prompt": "SENSITIVE_TEST_STRING", "private_key": "SENSITIVE_TEST_STRING"}
            save(idle); save(idle)
            save({"status": "LOCAL_EXECUTION_ERROR", "at": "2026-11-06T13:01:00Z",
                  "job_id": "job:synthetic", "error_class": "ValueError", "error_stage": "ollama_model",
                  "raw_model_output": "SENSITIVE_TEST_STRING"})
            save({"status": "SUCCEEDED", "at": "2026-11-06T13:02:00Z",
                  "job_id": "job:synthetic", "cost_usd": 0, "output_sha256": "a" * 64})
            history_path = run / "hae_node_history.jsonl"
            history = history_path.read_text(encoding="utf-8")
            lines = [json.loads(row) for row in history.splitlines()]
            self.assertEqual(len(lines), 3)
            self.assertNotIn("SENSITIVE_TEST_STRING", history)
            self.assertEqual(lines[1]["error_stage"], "ollama_model")
            self.assertEqual(lines[2]["status"], "SUCCEEDED")
            self.assertEqual(json.loads((run / "hae_node_runtime_receipt.json").read_text())["status"], "SUCCEEDED")
            save.__globals__["HISTORY_BYTES_LIMIT"] = 1
            save({"status": "COMPLETION_REJECTED", "at": "2026-11-06T13:03:00Z",
                  "job_id": "job:synthetic", "http_status": 409})
            self.assertTrue((run / "hae_node_history.jsonl.1").exists())
            self.assertNotIn("SENSITIVE_TEST_STRING",
                             (run / "hae_node_history.jsonl.1").read_text())


if __name__ == "__main__":
    unittest.main(verbosity=2)
