import json,sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import deepseek_output_guard as g

class DeepSeekOutputGuardTests(unittest.TestCase):
    def test_rejects_empty_then_accepts_fallback(self):
        payloads=[
            {"done":True,"message":{"content":"","thinking":"private reasoning"}},
            {"done":True,"message":{"content":"usable final answer"}},
        ]
        with patch.object(g,"_request",side_effect=payloads),patch.object(g,"_quarantine") as q:
            r=g.call_text("x",["deepseek-r1:1.5b","deepseek-r1:7b"],min_chars=5)
        self.assertTrue(r["ok"]); self.assertEqual(r["model"],"deepseek-r1:7b")
        self.assertEqual(q.call_count,1)

    def test_rejects_think_only(self):
        with patch.object(g,"_request",return_value={"done":True,"message":{"content":"<think>hidden"}}),patch.object(g,"_quarantine"):
            r=g.call_text("x",["deepseek-r1:1.5b"],min_chars=1)
        self.assertFalse(r["ok"]); self.assertEqual(r["status"],"MODEL_OUTPUT_REJECTED")

    def test_json_requires_schema_keys(self):
        schema={"type":"object","required":["verdict"],"properties":{"verdict":{"type":"string"}}}
        with patch.object(g,"_request",return_value={"done":True,"message":{"content":json.dumps({"verdict":"HOLD"})}}),patch.object(g,"_quarantine"):
            r=g.call_json("x",["deepseek-r1:1.5b"],schema)
        self.assertTrue(r["ok"]); self.assertEqual(r["data"]["verdict"],"HOLD")

if __name__=="__main__": unittest.main()

[executed on device: YuraValentyuk (b8401eca-2ffc-4516-9a60-2474a57035b8)]
