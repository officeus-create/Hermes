import json,sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import deepseek_output_guard as g

class DeepSeekOutputGuardTests(unittest.TestCase):
    def test_chat_empty_generate_accepts_same_model(self):
        payloads=[
            {"done":True,"message":{"content":"","thinking":"private reasoning"}},
            {"done":True,"response":"usable final answer"},
        ]
        with patch.object(g,"_request",side_effect=payloads),patch.object(g,"_quarantine") as q:
            r=g.call_text("x",["deepseek-r1:1.5b","deepseek-r1:7b"],min_chars=5)
        self.assertTrue(r["ok"]); self.assertEqual(r["model"],"deepseek-r1:1.5b")
        self.assertEqual(r["attempts"][-1]["transport"],"generate")
        self.assertEqual(q.call_count,1)

    def test_both_transports_rejected_then_model_fallback(self):
        payloads=[
            {"done":True,"message":{"content":""}},
            {"done":True,"response":""},
            {"done":True,"message":{"content":"fallback final answer"}},
        ]
        with patch.object(g,"_request",side_effect=payloads),patch.object(g,"_quarantine"):
            r=g.call_text("x",["deepseek-r1:1.5b","qwen2.5:1.5b-instruct"],min_chars=5)
        self.assertTrue(r["ok"]); self.assertEqual(r["model"],"qwen2.5:1.5b-instruct")

    def test_rejects_think_only_both_transports(self):
        payload={"done":True,"message":{"content":"<think>hidden"}}
        with patch.object(g,"_request",side_effect=[payload,{"done":True,"response":"<think>hidden"}]),patch.object(g,"_quarantine"):
            r=g.call_text("x",["deepseek-r1:1.5b"],min_chars=1)
        self.assertFalse(r["ok"]); self.assertEqual(r["status"],"MODEL_OUTPUT_REJECTED")

    def test_json_requires_schema_keys(self):
        schema={"type":"object","required":["verdict"],"properties":{"verdict":{"type":"string"}}}
        with patch.object(g,"_request",return_value={"done":True,"message":{"content":json.dumps({"verdict":"HOLD"})}}),patch.object(g,"_quarantine"):
            r=g.call_json("x",["deepseek-r1:1.5b"],schema)
        self.assertTrue(r["ok"]); self.assertEqual(r["data"]["verdict"],"HOLD")

if __name__=="__main__": unittest.main()
