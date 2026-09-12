#!/usr/bin/env python3
"""Deterministic local assistant contracts; no model or network access."""
import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).with_name("load-board-local-assistant.py")
spec = importlib.util.spec_from_file_location("load_board_assistant", path)
assistant = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assistant)
SOURCE = "Chicago, IL to Dallas, TX. Dry van. Monday morning. Wednesday afternoon. Boxed appliances. 25,000 lbs. Payment $2,100."

def sample():
    return dict(origin="Chicago, IL", destination="Dallas, TX", equipment="dry_van",
                rate_amount=2100, rate_quote="$2,100", pickup_window="Monday morning",
                delivery_window="Wednesday afternoon", commodity="Boxed appliances",
                weight_lbs=25000, weight_quote="25,000 lbs", missing_fields=[])

class AssistantContracts(unittest.TestCase):
    def test_grounded_fields_are_preserved(self):
        value = assistant.validate_extract(sample(), SOURCE)
        self.assertEqual(value["rate_amount"], 2100)
        self.assertEqual(value["weight_lbs"], 25000)
        self.assertEqual(value["missing_fields"], [])

    def test_invented_city_is_not_retained(self):
        value = sample(); value["origin"] = "Boston, MA"
        result = assistant.validate_extract(value, SOURCE)
        self.assertIsNone(result["origin"])
        self.assertIn("origin_not_grounded", result["missing_fields"])

    def test_ungrounded_rate_is_not_retained(self):
        value = sample(); value["rate_amount"] = 5000
        result = assistant.validate_extract(value, SOURCE)
        self.assertIsNone(result["rate_amount"])
        self.assertIn("rate_not_grounded", result["missing_fields"])

    def test_weight_without_pounds_is_not_converted(self):
        value = sample(); value["weight_quote"] = "25,000 kg"
        result = assistant.validate_extract(value, SOURCE.replace("25,000 lbs", "25,000 kg"))
        self.assertIsNone(result["weight_lbs"])

    def test_unknown_rate_is_explicitly_missing(self):
        value = sample(); value["rate_amount"] = None; value["rate_quote"] = None
        self.assertIn("rate_amount", assistant.validate_extract(value, SOURCE)["missing_fields"])

    def test_extra_fields_and_bad_equipment_fail_closed(self):
        for key, val in [("permission", "approved"), ("equipment", "invented")]:
            value = sample(); value[key] = val
            with self.assertRaises(ValueError): assistant.validate_extract(value, SOURCE)

    def test_nonfinite_and_boolean_economics_fail_closed(self):
        for invalid in [True, float("inf"), float("nan"), -1]:
            value = sample(); value["rate_amount"] = invalid
            with self.assertRaises(ValueError): assistant.validate_extract(value, SOURCE)

    def test_credentials_are_rejected_before_model_access(self):
        self.assertIsNotNone(assistant.SENSITIVE.search("password=EXAMPLE_NOT_A_REAL_SECRET"))
        self.assertEqual(assistant.LOCAL_ORIGIN, "http://127.0.0.1:11434")
        self.assertLessEqual(assistant.MAX_INPUT_BYTES, 16000)

if __name__ == "__main__": unittest.main()
