#!/usr/bin/env python3
"""Offline regression contract for the source-synced Windows VIKTOR HAE client.

No HAE provider requests, key material, real Ollama calls, or D1 mutations.
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
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

ROOT = Path(__file__).resolve().parent
NODE = ROOT / "hermes_hae_windows_node.py"
LOOP = ROOT / "hermes_hae_windows_node_loop.py"


def load_node(host="127.0.0.1:11434"):
    env = {
        "OLLAMA_HOST": host,
        "HERMES_HAE_WINDOWS_NODE_ENABLED": "1",
        # Dummy unit-test marker. No real bearer token is read or used.
        "HERMES_HAE_WINDOWS_NODE_TOKEN": "T" * 32,
    }
    with patch.dict(os.environ, env):
        spec = importlib.util.spec_from_file_location("hae_windows_viktor_test", NODE)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    return module


def synthetic_lease():
    return {
        "job_id": "job:test-only",
        "work_id": "W-test-only",
        "node_id": "VIKTOR-WINDOWS",
        "node_contract_version": "windows-node-v1",
        "job_type": "work.item.plan",
        "lease_id": "lease:test-only",
        "fence": 8,
        "role_contract": {
            "permission_class": "READ_ONLY",
            "semantic_required": True,
            "max_cost_usd": 0,
        },
        "semantic_request": {
            "system_prompt": "Return a structured plan.",
            "user_prompt": json.dumps({
                "available_execution_job_types": ["ai.gateway.readiness.audit"]
            }),
            "max_output_tokens": 700,
        },
    }


class WindowsViktorSourceRegression(unittest.TestCase):
    def test_loopback_normalization_and_external_denial(self):
        accepted = {
            "127.0.0.1:11434": "http://127.0.0.1:11434",
            "localhost:11434": "http://localhost:11434",
            "http://127.0.0.1:11434": "http://127.0.0.1:11434",
            "http://localhost:11434": "http://localhost:11434",
        }
        rejected = ["0.0.0.0:11434", "http://0.0.0.0:11434",
                    "https://remote.invalid:11434", "http://127.0.0.1:11500"]
        for raw, expected in accepted.items():
            with self.subTest(host=raw):
                module = load_node(raw)
                self.assertEqual(module.OLLAMA, expected)
                self.assertIsNone(module.config_error())
        for raw in rejected:
            with self.subTest(host=raw):
                self.assertEqual(load_node(raw).config_error(),
                                 "OLLAMA_NOT_LOCALHOST")

    def test_invalid_plan_json_fails_closed_other_roles_reject(self):
        module = load_node()
        request = synthetic_lease()["semantic_request"]
        calls = []

        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            calls.append((url, method))
            self.assertEqual(url, module.OLLAMA + "/api/chat")
            return 200, {
                "message": {"content": "invalid-json"},
                "prompt_eval_count": 25,
                "eval_count": 700,
            }

        module.http_json = fake_http
        result, usage = module.ollama(request, "work.item.plan")
        disposition = module.normalize_semantic_result(
            "work.item.plan", request, result
        )
        self.assertEqual(disposition["disposition"], "NEEDS_CAPABILITY")
        self.assertIsNone(disposition["recommended_job_type"])
        self.assertEqual(usage["output_tokens"], 700)
        with self.assertRaises(ValueError):
            module.ollama(request, "search.defect.prioritize")
        self.assertEqual(len(calls), 2)

    def test_valid_owner_plan_is_not_downgraded(self):
        module = load_node()
        request = synthetic_lease()["semantic_request"]
        result = {
            "disposition": "EXECUTE_EXISTING_CAPABILITY",
            "recommended_job_type": "ai.gateway.readiness.audit",
            "rationale": "Verified allowed capability.",
            "next_action": "Perform deterministic read-only audit.",
        }
        actual = module.normalize_semantic_result("work.item.plan", request, result)
        self.assertEqual(actual, result)
        fake = dict(result, recommended_job_type="dangerous.provider.write")
        downgraded = module.normalize_semantic_result("work.item.plan", request, fake)
        self.assertEqual(downgraded["disposition"], "NEEDS_CAPABILITY")
        self.assertIsNone(downgraded["recommended_job_type"])

    def test_stale_replay_never_calls_model_or_completion(self):
        module = load_node()
        lease = synthetic_lease()
        observed = []

        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            observed.append(url.rsplit("/", 1)[-1])
            if url.endswith("/claim"):
                return 200, {
                    "success": True,
                    "status": "LEASE_REPLAY",
                    "lease": lease,
                }
            if url.endswith("/heartbeat"):
                return 200, {"success": True}
            raise AssertionError("Completion must not be attempted")

        module.http_json = fake_http
        module.replay_lease_seconds_left = lambda item: 75
        module.ollama = lambda *args: self.fail("No model call on expired replay")
        with contextlib.redirect_stdout(io.StringIO()):
            result = module.run_once()
        self.assertEqual(result["status"], "LEASE_REPLAY_TTL_LOW")
        self.assertEqual(result["remaining_seconds"], 75)
        self.assertEqual(observed, ["heartbeat", "claim"])
        self.assertEqual(result["cost_usd"], 0)

    def test_complete_once_for_fresh_replay(self):
        module = load_node()
        lease = synthetic_lease()
        calls = []
        allowed_plan = {
            "disposition": "NEEDS_CAPABILITY",
            "recommended_job_type": None,
            "rationale": "Cannot safely choose a capability.",
            "next_action": "Request reviewed contract.",
        }

        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            action = url.rsplit("/", 1)[-1]
            calls.append(action)
            if action == "claim":
                return 200, {"success": True, "status": "LEASE_REPLAY", "lease": lease}
            if action == "complete":
                self.assertEqual(payload["semantic_result"], allowed_plan)
                self.assertEqual(payload["output_sha256"], module.digest(allowed_plan))
                self.assertEqual(payload["cost_usd"], 0)
                self.assertEqual(payload["fence"], 8)
                return 200, {"success": True, "status": "SUCCEEDED"}
            return 200, {"success": True}

        module.http_json = fake_http
        module.replay_lease_seconds_left = lambda item: 250
        module.ollama = lambda request, kind: (allowed_plan,
                         {"input_tokens": 16, "output_tokens": 12})
        with contextlib.redirect_stdout(io.StringIO()):
            result = module.run_once()
        self.assertEqual(result["status"], "SUCCEEDED")
        self.assertEqual(calls, ["heartbeat", "claim", "heartbeat", "complete"])

    def test_http409_records_machine_code_not_body(self):
        module = load_node()
        lease = synthetic_lease()
        secret = "PRIVATE_OUTPUT_MUST_NOT_BE_LOGGED"

        def fake_http(url, method="GET", payload=None, token=None, timeout=30):
            action = url.rsplit("/", 1)[-1]
            if action == "claim":
                return 200, {"success": True, "status": "LEASE_ACCEPTED", "lease": lease}
            if action == "complete":
                raise urllib.error.HTTPError(
                    url, 409, "Conflict", None,
                    io.BytesIO(json.dumps({
                        "error": "lease_expired",
                        "secret": secret,
                    }).encode()),
                )
            return 200, {"success": True}

        module.http_json = fake_http
        module.ollama = lambda request, kind: (
            {"disposition": "NEEDS_CAPABILITY",
             "recommended_job_type": None,
             "rationale": "Not yet approved.",
             "next_action": "Review job contract."}, {},
        )
        with contextlib.redirect_stdout(io.StringIO()):
            result = module.run_once()
        self.assertEqual(result["status"], "COMPLETION_REJECTED")
        self.assertEqual(result["http_status"], 409)
        self.assertEqual(result["server_error_code"], "lease_expired")
        self.assertNotIn(secret, json.dumps(result))

    def test_ttl_parser(self):
        module = load_node()
        now = datetime.datetime.now(datetime.timezone.utc)
        future = (now + datetime.timedelta(seconds=240)).isoformat()
        self.assertGreater(module.replay_lease_seconds_left({"lease_until": future}), 230)
        self.assertIsNone(module.replay_lease_seconds_left({"lease_until": "bad"}))

    def test_sanitized_rotating_history_and_idle_dedupe(self):
        sys.path.insert(0, str(ROOT))
        try:
            namespace = runpy.run_path(str(LOOP), run_name="source_contract_test")
        finally:
            sys.path.remove(str(ROOT))
        save = namespace["save"]
        with tempfile.TemporaryDirectory(prefix="viktor_history_test_") as directory:
            run_dir = Path(directory)
            save.__globals__.update({
                "RUN": run_dir,
                "RECEIPT": run_dir / "hae_node_runtime_receipt.json",
                "HISTORY": run_dir / "hae_node_history.jsonl",
                "HISTORY_ROTATED": run_dir / "hae_node_history.jsonl.1",
                "last_history_identity": None,
            })
            save({"at": "2026-11-06T00:00:00Z",
                  "status": "NO_ELIGIBLE_WORK",
                  "raw_secret": "MUST_NOT_LEAK"})
            save({"at": "2026-11-06T00:00:05Z",
                  "status": "NO_ELIGIBLE_WORK",
                  "raw_secret": "MUST_NOT_LEAK"})
            save({"at": "2026-11-06T00:00:06Z",
                  "status": "COMPLETION_REJECTED",
                  "job_id": "job:synthetic",
                  "http_status": 409,
                  "error_stage": "hae_completion",
                  "raw_prompt": "MUST_NOT_LEAK"})
            history = (run_dir / "hae_node_history.jsonl").read_text()
            self.assertEqual(len(history.splitlines()), 2)
            self.assertNotIn("MUST_NOT_LEAK", history)
            self.assertIn("hae_completion", history)
            save.__globals__["HISTORY_BYTES_LIMIT"] = 8
            save({"at": "2026-11-06T00:00:10Z",
                  "status": "NO_ELIGIBLE_WORK"})
            self.assertTrue((run_dir / "hae_node_history.jsonl.1").exists())

    @unittest.skipUnless(shutil.which("node"), "Node.js required for signer test")
    def test_signer_uses_ephemeral_key_and_verifies_signature(self):
        signer = ROOT / "hae_node_signer.mjs"
        with tempfile.TemporaryDirectory(prefix="hae_signer_test_") as directory:
            key_path = Path(directory) / "test-only-ed25519.pem"
            js = r"""const crypto=require('node:crypto');const fs=require('node:fs');
const {privateKey,publicKey}=crypto.generateKeyPairSync('ed25519');
fs.writeFileSync(process.argv[1],privateKey.export({type:'pkcs8',format:'pem'}));
console.log(publicKey.export({type:'spki',format:'pem'}));"""
            generated = subprocess.run(
                ["node", "-e", js, str(key_path)],
                capture_output=True, text=True, check=True,
            )
            message = b"HAE-CONTRACT-TEST-ONLY"
            signed = subprocess.run(
                ["node", str(signer)],
                env={**os.environ, "HERMES_HAE_WINDOWS_NODE_PRIVATE_KEY": str(key_path)},
                input=message, capture_output=True, check=True,
            )
            verify_js = r"""const crypto=require('node:crypto');
const p=process.argv[1],s=process.argv[2],m=process.argv[3];
if(!crypto.verify(null,Buffer.from(m),p,Buffer.from(s,'base64url')))process.exit(1);"""
            subprocess.run([
                "node", "-e", verify_js, "--", generated.stdout.strip(),
                signed.stdout.decode().strip(), message.decode(),
            ], capture_output=True, check=True)


if __name__ == "__main__":
    unittest.main()
