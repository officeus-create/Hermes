import { expect, test } from "@playwright/test";
import {
  canReadHermesBusinessEvent,
  dealerActivityToHermesBusinessEvent,
  filterHermesBusinessEvents,
  internalAiToHermesBusinessEvent,
  sanitizeHermesBusinessEventMetadata,
} from "../src/lib/hermes-connect-business-events";

test("dealer activity adapts to one company-scoped business event", () => {
  const event = dealerActivityToHermesBusinessEvent({
    id: "dact-1",
    company_id: "company-1",
    actor_specialist_id: "user-1",
    event_type: "lead_updated",
    entity_type: "lead",
    entity_id: "lead-7",
    summary: "Lead stage changed",
    created_at: "2026-10-02T16:00:00Z",
  });

  expect(event).toMatchObject({
    eventId: "dact-1",
    eventType: "lead_updated",
    entityType: "lead",
    entityId: "lead-7",
    companyId: "company-1",
    actorId: "user-1",
    source: "dealer_crm_activity",
    visibility: "company",
  });
  expect(canReadHermesBusinessEvent(event, { companyIds: ["company-1"] })).toBe(true);
  expect(canReadHermesBusinessEvent(event, { companyIds: ["company-2"] })).toBe(false);
});

test("internal AI event maps to internal-owner scope without copying free-form message", () => {
  const event = internalAiToHermesBusinessEvent({
    id: 41,
    task_id: "hcai-task-9",
    event_type: "approval_granted",
    message: "Owner approved bounded gate",
    created_at: "2026-10-02T16:01:00Z",
  });

  expect(event.eventId).toBe("internal-ai:41");
  expect(event.entityId).toBe("hcai-task-9");
  expect(event.visibility).toBe("internal_owner");
  expect(event).not.toHaveProperty("summary");
  expect(event.metadata).toEqual({});
  expect(canReadHermesBusinessEvent(event, { internalOwner: true })).toBe(true);
  expect(canReadHermesBusinessEvent(event, {})).toBe(false);
});

test("generic metadata is allowlisted and excludes sensitive fields", () => {
  const safe = sanitizeHermesBusinessEventMetadata({
    status: "completed",
    stage: "won",
    count: 3,
    channel: "crm",
    email: "private@example.com",
    phone: "+1 555 555 5555",
    raw_message_body: "private text",
    token: "secret",
    vin: "1ABC",
    custom_unknown: "drop me",
  });
  expect(safe).toEqual({
    status: "completed",
    stage: "won",
    count: 3,
    channel: "crm",
  });
});

test("event list is filtered by scope before presentation", () => {
  const dealerOne = dealerActivityToHermesBusinessEvent({
    id: "d1",
    company_id: "company-1",
    event_type: "customer_created",
    entity_type: "customer",
    entity_id: "customer-1",
    created_at: "2026-10-02T16:02:00Z",
  });
  const dealerTwo = dealerActivityToHermesBusinessEvent({
    id: "d2",
    company_id: "company-2",
    event_type: "customer_created",
    entity_type: "customer",
    entity_id: "customer-2",
    created_at: "2026-10-02T16:03:00Z",
  });
  const ai = internalAiToHermesBusinessEvent({
    id: 42,
    task_id: "hcai-task-10",
    event_type: "runner_started",
    created_at: "2026-10-02T16:04:00Z",
  });

  expect(filterHermesBusinessEvents([dealerOne, dealerTwo, ai], { companyIds: ["company-1"] }).map((event) => event.eventId))
    .toEqual(["d1"]);
  expect(filterHermesBusinessEvents([dealerOne, dealerTwo, ai], { companyIds: ["company-1"], internalOwner: true }).map((event) => event.eventId))
    .toEqual(["d1", "internal-ai:42"]);
});

test("adapter fails closed when tenant identity is absent", () => {
  expect(() => dealerActivityToHermesBusinessEvent({
    id: "d3",
    company_id: "",
    event_type: "lead_updated",
    created_at: "2026-10-02T16:05:00Z",
  })).toThrow("dealer_event_identity_required");
});
