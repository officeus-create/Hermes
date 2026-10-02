import { expect, test } from "@playwright/test";
import {
  assertHermesCustomFieldScope,
  normalizeHermesCustomFieldKey,
  validateHermesCustomFieldDefinition,
  validateHermesCustomFieldValue,
  type HermesCustomFieldDefinition,
} from "../src/lib/hermes-connect-custom-fields";

const base = (overrides: Partial<HermesCustomFieldDefinition> = {}): HermesCustomFieldDefinition => ({
  id: "field-1",
  companyId: "company-1",
  entityType: "lead",
  key: "fleet_tier",
  label: "Fleet tier",
  type: "text",
  required: false,
  active: true,
  ...overrides,
});

test("normalizes safe extension keys and blocks core reserved fields", () => {
  expect(normalizeHermesCustomFieldKey(" Preferred Gate ")).toBe("preferred_gate");
  expect(validateHermesCustomFieldDefinition(base({ key: "company_id" }))).toEqual({
    ok: false,
    error: "reserved_field_key",
  });
  expect(validateHermesCustomFieldDefinition(base({ key: "payment_state" }))).toEqual({
    ok: false,
    error: "reserved_field_key",
  });
});

test("supports the six bounded V1 field types", () => {
  expect(validateHermesCustomFieldValue(base({ type: "text" }), "Priority fleet")).toEqual({ ok: true, value: "Priority fleet" });
  expect(validateHermesCustomFieldValue(base({ type: "number" }), "12.5")).toEqual({ ok: true, value: 12.5 });
  expect(validateHermesCustomFieldValue(base({ type: "boolean" }), "true")).toEqual({ ok: true, value: true });
  expect(validateHermesCustomFieldValue(base({ type: "date" }), "2026-10-02")).toEqual({ ok: true, value: "2026-10-02" });

  const select = base({ type: "select", options: ["Gold", "Silver"] });
  expect(validateHermesCustomFieldValue(select, "Gold")).toEqual({ ok: true, value: "Gold" });

  const multi = base({ type: "multi_select", options: ["Dealer", "Fleet", "Retail"] });
  expect(validateHermesCustomFieldValue(multi, ["Fleet", "Dealer", "Fleet"])).toEqual({
    ok: true,
    value: ["Fleet", "Dealer"],
  });
});

test("select definitions require explicit bounded options", () => {
  expect(validateHermesCustomFieldDefinition(base({ type: "select", options: [] }))).toEqual({
    ok: false,
    error: "select_options_required",
  });
  expect(validateHermesCustomFieldDefinition(base({ type: "text", options: ["wrong"] }))).toEqual({
    ok: false,
    error: "options_not_allowed_for_type",
  });
});

test("required, inactive and invalid values fail closed", () => {
  expect(validateHermesCustomFieldValue(base({ required: true }), "")).toEqual({ ok: false, error: "field_required" });
  expect(validateHermesCustomFieldValue(base({ active: false }), "anything")).toEqual({ ok: false, error: "field_inactive" });
  expect(validateHermesCustomFieldValue(base({ type: "number" }), "NaN")).toEqual({ ok: false, error: "invalid_number_value" });
  expect(validateHermesCustomFieldValue(base({ type: "boolean" }), "maybe")).toEqual({ ok: false, error: "invalid_boolean_value" });
  expect(validateHermesCustomFieldValue(base({ type: "date" }), "10/02/2026")).toEqual({ ok: false, error: "invalid_date_value" });
});

test("custom-field definition is company/workspace scoped", () => {
  const definition = base({ companyId: "company-1", workspaceId: "workspace-7" });
  expect(assertHermesCustomFieldScope(definition, { companyId: "company-1", workspaceId: "workspace-7" })).toBe(true);
  expect(assertHermesCustomFieldScope(definition, { companyId: "company-2", workspaceId: "workspace-7" })).toBe(false);
  expect(assertHermesCustomFieldScope(definition, { companyId: "company-1", workspaceId: "workspace-8" })).toBe(false);
});

test("unsupported field types and unsafe object text values are rejected", () => {
  const unsupported = base({ type: "formula" as never });
  expect(validateHermesCustomFieldDefinition(unsupported)).toEqual({ ok: false, error: "unsupported_field_type" });
  expect(validateHermesCustomFieldValue(base({ type: "text" }), { secret: "x" })).toEqual({
    ok: false,
    error: "invalid_text_value",
  });
});
