import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  normalizeBusinessEvent,
  normalizeDealerActivityEvent,
  normalizeInternalAiEvent,
  sanitizeBusinessEventMetadata,
} from "../functions/api/_lib/business-events.mjs";

test("business event metadata is explicit allowlist and rejects sensitive keys", () => {
  expect(sanitizeBusinessEventMetadata({
    stage: "qualified",
    count: 2,
    email: "private@example.test",
    auth_token: "secret",
    nested: { unsafe: true },
  }, ["stage", "count", "email", "auth_token", "nested"])).toEqual({
    stage: "qualified",
    count: 2,
  });
});

test("event payload cannot self-authorize metadata fields", () => {
  const event = normalizeBusinessEvent({
    event_id: "evt-meta",
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: "lead-1",
    company_id: "company-1",
    occurred_at: "2026-10-02T10:00:00Z",
    source: "dealer_crm",
    visibility: "company",
    metadata: { stage: "qualified", email: "private@example.test" },
    allowed_metadata_keys: ["stage", "email"],
  });
  expect(event?.metadata).toEqual({});
  const explicitlyAllowed = normalizeBusinessEvent({
    event_id: "evt-meta-2",
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: "lead-1",
    company_id: "company-1",
    occurred_at: "2026-10-02T10:00:00Z",
    source: "dealer_crm",
    visibility: "company",
    metadata: { stage: "qualified", email: "private@example.test" },
  }, { allowedMetadataKeys: ["stage", "email"] });
  expect(explicitlyAllowed?.metadata).toEqual({ stage: "qualified" });
});

test("shared business event contract fails closed on missing scope or invalid time", () => {
  expect(normalizeBusinessEvent({
    event_id: "evt-1",
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: "lead-1",
    occurred_at: "not-a-date",
    source: "dealer_crm",
    visibility: "company",
    company_id: "company-1",
  })).toBeNull();

  expect(normalizeBusinessEvent({
    event_id: "evt-2",
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: "lead-1",
    occurred_at: "2026-10-02T10:00:00Z",
    source: "dealer_crm",
    visibility: "company",
  })).toBeNull();
});

test("dealer activity maps to one company-scoped canonical event", () => {
  const row = {
    id: "dact-1",
    company_id: "company-1",
    event_type: "leads_updated",
    entity_type: "leads",
    entity_id: "lead-1",
    summary: "Private leads record updated in dealer CRM.",
    created_at: "2026-10-02T10:00:00Z",
  };
  const event = normalizeDealerActivityEvent(row, "company-1");
  expect(event).toMatchObject({
    event_id: "dact-1",
    event_type: "leads_updated",
    entity_type: "leads",
    entity_id: "lead-1",
    company_id: "company-1",
    workspace_id: null,
    source: "dealer_crm",
    visibility: "company",
    summary: "Private leads record updated in dealer CRM.",
  });
  expect(event?.actor).toBeNull();
  expect(normalizeDealerActivityEvent(row, "company-2")).toBeNull();
});

test("internal AI remains a separate owner-scoped adapter, not Dealer storage", () => {
  const event = normalizeInternalAiEvent({
    id: 7,
    organization_scope: "hermes_internal",
    task_id: "hcai-task-1",
    event_type: "approval_granted",
    message: "Owner approved the bounded gate.",
    created_at: "2026-10-02T11:00:00Z",
  });
  expect(event).toMatchObject({
    event_id: "hcai_event_7",
    event_type: "approval_granted",
    entity_type: "ai_task",
    entity_id: "hcai-task-1",
    company_id: null,
    workspace_id: "internal_ai",
    source: "internal_ai",
    visibility: "internal_owner",
    correlation_id: "hcai-task-1",
  });
  expect(normalizeInternalAiEvent({
    organization_scope: "hermes_internal",
    task_id: "hcai-task-missing-event-id",
    event_type: "output",
    message: "No",
    created_at: "2026-10-02T11:00:00Z",
  })).toBeNull();
  expect(normalizeInternalAiEvent({
    id: 8,
    organization_scope: "another_org",
    task_id: "hcai-task-2",
    event_type: "output",
    message: "No",
    created_at: "2026-10-02T11:00:00Z",
  })).toBeNull();
});

test("Dealer API and timeline adopt projection without deleting legacy activity", async () => {
  const api = await readFile("functions/api/hermes-connect/dealer/crm.ts", "utf8");
  const page = await readFile("src/pages/services/hermes-connect/dealers/workspace/crm.astro", "utf8");
  expect(api).toContain("normalizeDealerActivityEvent");
  expect(api).toContain("activity:");
  expect(api).toContain("events:");
  expect(page).toContain("payload.events || payload.activity");
});
