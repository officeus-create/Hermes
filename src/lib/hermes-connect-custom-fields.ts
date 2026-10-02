export type HermesCustomFieldType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multi_select";

export type HermesCustomFieldDefinition = {
  id: string;
  companyId: string;
  workspaceId?: string;
  entityType: string;
  key: string;
  label: string;
  type: HermesCustomFieldType;
  required: boolean;
  options?: readonly string[];
  displayOrder?: number;
  active?: boolean;
};

export type HermesCustomFieldValidationResult =
  | { ok: true; value: string | number | boolean | string[] | null }
  | { ok: false; error: string };

const FIELD_TYPES = new Set<HermesCustomFieldType>([
  "text",
  "number",
  "boolean",
  "date",
  "select",
  "multi_select",
]);

const RESERVED_KEYS = new Set([
  "id",
  "company_id",
  "workspace_id",
  "owner_specialist_id",
  "specialist_id",
  "created_at",
  "updated_at",
  "password",
  "password_hash",
  "token",
  "secret",
  "credential",
  "payment_state",
  "billing_state",
  "permission",
  "role",
]);

const clean = (value: unknown, max = 160) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export function normalizeHermesCustomFieldKey(value: unknown) {
  return clean(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function validateHermesCustomFieldDefinition(
  input: HermesCustomFieldDefinition,
): { ok: true; definition: HermesCustomFieldDefinition } | { ok: false; error: string } {
  const id = clean(input.id, 120);
  const companyId = clean(input.companyId, 120);
  const workspaceId = clean(input.workspaceId, 120) || undefined;
  const entityType = normalizeHermesCustomFieldKey(input.entityType);
  const key = normalizeHermesCustomFieldKey(input.key);
  const label = clean(input.label, 120);

  if (!id || !companyId || !entityType || !key || !label) return { ok: false, error: "field_identity_required" };
  if (!FIELD_TYPES.has(input.type)) return { ok: false, error: "unsupported_field_type" };
  if (RESERVED_KEYS.has(key)) return { ok: false, error: "reserved_field_key" };

  const options = [...new Set((input.options ?? []).map((option) => clean(option, 120)).filter(Boolean))];
  if ((input.type === "select" || input.type === "multi_select") && options.length === 0) {
    return { ok: false, error: "select_options_required" };
  }
  if (input.type !== "select" && input.type !== "multi_select" && options.length > 0) {
    return { ok: false, error: "options_not_allowed_for_type" };
  }
  if (options.length > 100) return { ok: false, error: "too_many_select_options" };

  return {
    ok: true,
    definition: {
      ...input,
      id,
      companyId,
      workspaceId,
      entityType,
      key,
      label,
      options: options.length ? options : undefined,
      displayOrder: Number.isFinite(input.displayOrder) ? Math.max(0, Math.trunc(input.displayOrder!)) : 0,
      active: input.active !== false,
    },
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateHermesCustomFieldValue(
  definition: HermesCustomFieldDefinition,
  rawValue: unknown,
): HermesCustomFieldValidationResult {
  if (!definition.active) return { ok: false, error: "field_inactive" };
  const missing = rawValue === null || rawValue === undefined || rawValue === "";
  if (missing) return definition.required ? { ok: false, error: "field_required" } : { ok: true, value: null };

  switch (definition.type) {
    case "text": {
      if (Array.isArray(rawValue) || typeof rawValue === "object") return { ok: false, error: "invalid_text_value" };
      return { ok: true, value: clean(rawValue, 2000) };
    }
    case "number": {
      if (typeof rawValue === "boolean" || rawValue === "") return { ok: false, error: "invalid_number_value" };
      const value = typeof rawValue === "number" ? rawValue : Number(String(rawValue).trim());
      return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: "invalid_number_value" };
    }
    case "boolean": {
      if (typeof rawValue === "boolean") return { ok: true, value: rawValue };
      if (rawValue === "true" || rawValue === "1" || rawValue === 1) return { ok: true, value: true };
      if (rawValue === "false" || rawValue === "0" || rawValue === 0) return { ok: true, value: false };
      return { ok: false, error: "invalid_boolean_value" };
    }
    case "date": {
      const value = clean(rawValue, 32);
      if (!ISO_DATE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
        return { ok: false, error: "invalid_date_value" };
      }
      return { ok: true, value };
    }
    case "select": {
      const value = clean(rawValue, 120);
      return definition.options?.includes(value)
        ? { ok: true, value }
        : { ok: false, error: "invalid_select_option" };
    }
    case "multi_select": {
      if (!Array.isArray(rawValue)) return { ok: false, error: "invalid_multi_select_value" };
      const values = [...new Set(rawValue.map((value) => clean(value, 120)).filter(Boolean))];
      if (values.some((value) => !definition.options?.includes(value))) {
        return { ok: false, error: "invalid_select_option" };
      }
      return { ok: true, value: values };
    }
    default:
      return { ok: false, error: "unsupported_field_type" };
  }
}

export function assertHermesCustomFieldScope(
  definition: HermesCustomFieldDefinition,
  context: { companyId: string; workspaceId?: string },
) {
  if (definition.companyId !== context.companyId) return false;
  if (definition.workspaceId && definition.workspaceId !== context.workspaceId) return false;
  return true;
}
