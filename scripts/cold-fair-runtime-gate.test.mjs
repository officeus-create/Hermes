import assert from "node:assert/strict";
import worker from "../workers/lead-email/src/index.mjs";
import { ColdFairActionLedgerCore } from "../workers/lead-email/src/cold-fair-action-ledger.mjs";

let createColdFairCanonicalAdapter;
try {
  ({ createColdFairCanonicalAdapter } = await import("../workers/lead-email/src/cold-fair-canonical-adapter.mjs"));
} catch {
  // The first RED run proves the canonical runtime adapter has not been ported yet.
}

const SERVICE_TOKEN = "synthetic-cold-fair-private-service-token";
const NOW = Date.parse("2026-10-08T12:00:00.000Z");
const SNAPSHOT = "snapshot-v1";
const receipt = (source, value) => ({
  source,
  observedAt: "2026-10-08T11:59:30.000Z",
  snapshotVersion: SNAPSHOT,
  value,
});

class DurableStorage {
  constructor() {
    this.values = new Map();
    this.tail = Promise.resolve();
  }
  async get(key) {
    const value = this.values.get(key);
    return value === undefined ? undefined : structuredClone(value);
  }
  async put(key, value) { this.values.set(key, structuredClone(value)); }
  async transaction(callback) {
    const previous = this.tail;
    let release;
    this.tail = new Promise((resolve) => { release = resolve; });
    await previous;
    try {
      return await callback({ get: (key) => this.get(key), put: (key, value) => this.put(key, value) });
    } finally {
      release();
    }
  }
}

class LedgerNamespace {
  constructor() { this.ledgers = new Map(); }
  getByName(name) {
    if (!this.ledgers.has(name)) {
      const core = new ColdFairActionLedgerCore({ storage: new DurableStorage() });
      this.ledgers.set(name, { fetch: (request) => core.fetch(request) });
    }
    return this.ledgers.get(name);
  }
}

const canonicalBinding = ({ message, proof = null, gate = "ALLOW", counters = null }) => ({
  async fetch(request) {
    const input = await request.json();
    return Response.json({
      ok: true,
      source: "hermes-contacts-canonical",
      observed_at: new Date(Date.now() - 1_000).toISOString(),
      snapshot_version: "runtime-snapshot-v1",
      contact: {
        contactId: input.contact_id,
        email: "synthetic@example.invalid",
        emailEligibility: "ELIGIBLE",
        contactPermission: "UNKNOWN",
        duplicateStatus: "NEW",
      },
      planned_action: {
        contactId: input.contact_id,
        plannedActionId: input.planned_action_id,
        templateApproved: true,
        contentApproved: true,
        message: { ...message, plannedActionId: input.planned_action_id },
        authorizationProof: proof,
      },
      suppressions: { status: "CLEAR" },
      counters: {
        campaignOwnerId: "OWNER-SYNTH-001",
        windowKey: "2026-10-08T00:00:00Z/PT24H",
        firstTouch24h: 0,
        firstTouchCap24h: 5,
        nonReplyPromotional24h: 0,
        nonReplyPromotionalCap24h: 10,
        ...counters,
      },
      promotional_send_gate: gate,
    });
  },
});

const runtimeEnv = ({ canonical, ledger = new LedgerNamespace() }) => ({
  LEAD_SERVICE_TOKEN: SERVICE_TOKEN,
  SALES_SENDER: "officeus@hermeslogisticsus.com",
  COLD_FAIR_RUNTIME_MODE: "enabled",
  COLD_FAIR_PROMOTIONAL_SEND_GATE: "ALLOW",
  COLD_FAIR_CANONICAL_SOURCE: canonical,
  COLD_FAIR_ACTION_LEDGER: ledger,
  GMAIL_OAUTH_CLIENT_ID: "synthetic-client",
  GMAIL_OAUTH_CLIENT_SECRET: "synthetic-secret",
  GMAIL_OAUTH_REFRESH_TOKEN: "synthetic-refresh",
});

const sendColdFair = async (env, body = {}) => {
  const response = await worker.fetch(coldFairRequest("/v1/cold-fair/send", {
    contact_id: "CT-SYNTH-001",
    planned_action_id: "PA-SYNTH-001",
    ...body,
  }), env);
  return { status: response.status, payload: await response.json() };
};

const coldFairRequest = (path, body) => new Request(`https://lead-email.internal${path}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SERVICE_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

{
  let canonicalCalls = 0;
  let ledgerCalls = 0;
  const env = {
    LEAD_SERVICE_TOKEN: SERVICE_TOKEN,
    COLD_FAIR_RUNTIME_MODE: "blocked",
    COLD_FAIR_CANONICAL_SOURCE: {
      async fetch() {
        canonicalCalls += 1;
        throw new Error("blocked runtime must not read canonical state");
      },
    },
    COLD_FAIR_ACTION_LEDGER: {
      getByName() {
        ledgerCalls += 1;
        throw new Error("blocked runtime must not claim a ledger action");
      },
    },
  };

  const response = await worker.fetch(coldFairRequest("/v1/cold-fair/send", {
    contact_id: "CT-SYNTH-001",
    planned_action_id: "PA-SYNTH-001",
  }), env);
  const payload = await response.json();

  assert.equal(response.status, 423);
  assert.deepEqual(payload, {
    ok: false,
    decision: "BLOCK",
    reason: "cold_fair_runtime_blocked",
    provider_called: false,
  });
  assert.equal(canonicalCalls, 0);
  assert.equal(ledgerCalls, 0);

  const capabilityResponse = await worker.fetch(new Request("https://lead-email.internal/v1/capabilities", {
    method: "GET",
    headers: { Authorization: `Bearer ${SERVICE_TOKEN}` },
  }), env);
  const capability = await capabilityResponse.json();
  assert.deepEqual(capability.cold_fair, {
    contract: "v1",
    runtime_mode: "blocked",
    promotional_send_gate: "BLOCKED",
    canonical_source_configured: true,
    durable_ledger_configured: true,
    provider_configured: false,
  });
  assert.equal(canonicalCalls, 0, "capability readback must not touch canonical customer data");
  assert.equal(ledgerCalls, 0, "capability readback must not create or claim a ledger action");
}

{
  let providerCalls = 0;
  const response = await worker.fetch(coldFairRequest("/v1/cold-fair/send", {
    contact_id: "CT-SYNTH-001",
    planned_action_id: "PA-SYNTH-001",
  }), {
    LEAD_SERVICE_TOKEN: SERVICE_TOKEN,
    COLD_FAIR_RUNTIME_MODE: "enabled",
    COLD_FAIR_PROMOTIONAL_SEND_GATE: "ALLOW",
    EMAIL: { async send() { providerCalls += 1; } },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    decision: "BLOCK",
    reason: "cold_fair_runtime_not_configured",
    provider_called: false,
  });
  assert.equal(providerCalls, 0, "an enabled flag without canonical and durable bindings must fail closed");
}

{
  let legacyProviderCalls = 0;
  const response = await worker.fetch(new Request("https://lead-email.internal/v1/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      request_id: "coldfair_legacy_bypass_001",
      planned_action_id: "PA-SYNTH-001",
      contact_id: "CT-SYNTH-001",
      subject: "[HERMES INQUIRY] [MARKETING]",
      text: "Synthetic Cold Fair bypass attempt. It must be rejected before the legacy provider binding is called.",
    }),
  }), {
    LEAD_SERVICE_TOKEN: SERVICE_TOKEN,
    SALES_SENDER: "website@hermeslogisticsus.com",
    SALES_DESTINATION: "officeus@hermeslogisticsus.com",
    EMAIL: { async send() { legacyProviderCalls += 1; } },
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "cold_fair_route_required" });
  assert.equal(legacyProviderCalls, 0, "Cold Fair actions cannot bypass the atomic route through a legacy send path");
}

assert.equal(typeof createColdFairCanonicalAdapter, "function", "canonical adapter must be available to the runtime");

{
  let providerCalls = 0;
  const canonicalMessage = {
    classification: "FIRST_TOUCH",
    businessLine: "MARKETING",
    campaign: "synthetic",
    templateVersion: "v1",
    plannedActionId: "PA-SYNTH-001",
    requiredFactsPresent: true,
    containsPromotion: true,
    subject: "Canonical subject",
    body: "Canonical approved message",
  };
  const canonicalSource = {
    async readContact() {
      return receipt("contacts", {
        contactId: "CT-SYNTH-001",
        email: "synthetic@example.invalid",
        emailEligibility: "ELIGIBLE",
        contactPermission: "UNKNOWN",
        duplicateStatus: "NEW",
      });
    },
    async readPlannedAction() {
      return receipt("planned-actions", {
        contactId: "CT-SYNTH-001",
        plannedActionId: "PA-SYNTH-001",
        templateApproved: true,
        contentApproved: true,
        message: canonicalMessage,
        authorizationProof: null,
      });
    },
    async readSuppressions() { return receipt("suppressions", { status: "CLEAR" }); },
    async readCounters() {
      return receipt("counters", {
        firstTouch24h: 0,
        firstTouchCap24h: 5,
        nonReplyPromotional24h: 0,
        nonReplyPromotionalCap24h: 10,
      });
    },
    async readPromotionalSendGate() { return receipt("config", "BLOCKED"); },
    async readProviderState() { return receipt("ledger", { state: "NOT_ATTEMPTED" }); },
  };
  const adapter = createColdFairCanonicalAdapter({ canonicalSource, now: () => NOW });

  for (const classification of ["REPLY", "TRANSACTIONAL"]) {
    const result = await adapter.send({
      contactId: "CT-SYNTH-001",
      plannedActionId: "PA-SYNTH-001",
      message: {
        ...canonicalMessage,
        classification,
        containsPromotion: false,
        freshInboundNeed: true,
        authorizedTransaction: true,
        providerThreadId: "forged-thread",
        replyToMessageId: "forged-message",
      },
    }, async () => {
      providerCalls += 1;
      return { state: "ACCEPTED", providerMessageId: "must-not-exist", providerThreadId: "must-not-exist" };
    });
    assert.equal(result.decision, "BLOCK");
  }
  assert.equal(providerCalls, 0, "caller-controlled classification and thread proof cannot bypass BLOCKED");
}

{
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url) === "https://oauth2.googleapis.com/token") {
      return Response.json({ access_token: "synthetic-access" });
    }
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      providerCalls += 1;
      await new Promise((resolve) => setImmediate(resolve));
      return Response.json({ id: `provider-message-${providerCalls}`, threadId: `provider-thread-${providerCalls}` });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  try {
    const message = {
      classification: "FIRST_TOUCH",
      businessLine: "MARKETING",
      campaign: "synthetic-shared-cap",
      templateVersion: "v1",
      requiredFactsPresent: true,
      containsPromotion: true,
      subject: "Canonical shared-cap subject",
      body: "Canonical shared-cap body. This is test-only content and not a real external message.",
    };
    const counters = {
      firstTouch24h: 4,
      firstTouchCap24h: 5,
      nonReplyPromotional24h: 9,
      nonReplyPromotionalCap24h: 10,
    };
    const env = runtimeEnv({ canonical: canonicalBinding({ message, counters }) });
    const results = await Promise.all([
      sendColdFair(env, { planned_action_id: "PA-SYNTH-CAP-001" }),
      sendColdFair(env, { planned_action_id: "PA-SYNTH-CAP-002" }),
    ]);
    assert.equal(providerCalls, 1,
      `one shared 24-hour campaign slot must permit at most one provider call across different actions: ${JSON.stringify(results)}`);
    assert.equal(results.filter(({ status, payload }) => status === 202 && payload.delivery_state === "ACCEPTED").length, 1);
    assert.equal(results.filter(({ status, payload }) => status === 403
      && payload.decision === "BLOCK" && payload.reason === "first_touch_cap_reached").length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

{
  const sharedCap = new ColdFairActionLedgerCore({ storage: new DurableStorage() }, { now: () => NOW });
  let capReleaseCalls = 0;
  let providerCalls = 0;
  const campaign = "synthetic-preexisting-sending";
  const messageFor = (plannedActionId) => ({
    classification: "FIRST_TOUCH",
    businessLine: "MARKETING",
    campaign,
    templateVersion: "v1",
    plannedActionId,
    requiredFactsPresent: true,
    containsPromotion: true,
    subject: "Canonical pre-existing claim subject",
    body: "Canonical pre-existing claim body. This is test-only content and not a real external message.",
  });
  const source = {
    async readContact() {
      return receipt("contacts", {
        contactId: "CT-SYNTH-001",
        email: "synthetic@example.invalid",
        emailEligibility: "ELIGIBLE",
        contactPermission: "UNKNOWN",
        duplicateStatus: "NEW",
      });
    },
    async readPlannedAction(input) {
      return receipt("planned-actions", {
        contactId: "CT-SYNTH-001",
        plannedActionId: input.plannedActionId,
        templateApproved: true,
        contentApproved: true,
        message: messageFor(input.plannedActionId),
        authorizationProof: null,
      });
    },
    async readSuppressions() { return receipt("suppressions", { status: "CLEAR" }); },
    async readCounters() {
      return receipt("counters", {
        firstTouch24h: 4,
        firstTouchCap24h: 5,
        nonReplyPromotional24h: 9,
        nonReplyPromotionalCap24h: 10,
      });
    },
    async readPromotionalSendGate() { return receipt("config", "ALLOW"); },
    async readProviderState() { return receipt("ledger", { state: "NOT_ATTEMPTED" }); },
    async reserveCampaignCap(input) {
      const value = await sharedCap.reserveCampaignCap({
        campaignOwnerId: "OWNER-SYNTH-001",
        businessLine: "MARKETING",
        campaign,
        windowKey: "2026-10-08T00:00:00Z/PT24H",
        ...input,
        authorizationSnapshotVersion: SNAPSHOT,
        classification: "FIRST_TOUCH",
        firstTouch24h: 4,
        firstTouchCap24h: 5,
        nonReplyPromotional24h: 9,
        nonReplyPromotionalCap24h: 10,
      });
      return receipt("cap-ledger", value);
    },
    async finalizeCampaignCap(input) {
      if (input.state === "RELEASED") capReleaseCalls += 1;
      const value = await sharedCap.finalizeCampaignCap({
        campaignOwnerId: "OWNER-SYNTH-001",
        businessLine: "MARKETING",
        campaign,
        windowKey: "2026-10-08T00:00:00Z/PT24H",
        ...input,
        authorizationSnapshotVersion: SNAPSHOT,
      });
      return receipt("cap-ledger", value);
    },
    async claimPlannedAction(input) {
      return receipt("ledger", {
        ...input,
        claimed: false,
        state: "SENDING",
        attemptToken: "pre-existing-attempt",
      });
    },
    async recordProviderReceipt() { throw new Error("provider receipt must not be reached"); },
  };
  const adapter = createColdFairCanonicalAdapter({ canonicalSource: source, now: () => NOW });
  const first = await adapter.send({
    contactId: "CT-SYNTH-001",
    plannedActionId: "PA-SYNTH-PRECLAIM-001",
  }, async () => { providerCalls += 1; });
  assert.equal(first.decision, "RECONCILE");
  assert.equal(first.reason, "planned_action_already_claimed");

  const second = await adapter.send({
    contactId: "CT-SYNTH-001",
    plannedActionId: "PA-SYNTH-PRECLAIM-002",
  }, async () => { providerCalls += 1; });
  assert.equal(second.decision, "BLOCK");
  assert.equal(second.reason, "first_touch_cap_reached",
    "an existing SENDING action must retain the shared reservation and block a different action");
  assert.equal(capReleaseCalls, 0, "claim ambiguity is not a definitive provider rejection and must never release capacity");
  assert.equal(providerCalls, 0);
}

{
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url) === "https://oauth2.googleapis.com/token") {
      return Response.json({ access_token: "synthetic-access" });
    }
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      providerCalls += 1;
      await new Promise((resolve) => setImmediate(resolve));
      return Response.json({ id: "provider-message-1", threadId: "provider-thread-1" });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  try {
    const message = {
      classification: "FIRST_TOUCH",
      businessLine: "MARKETING",
      campaign: "synthetic",
      templateVersion: "v1",
      requiredFactsPresent: true,
      containsPromotion: true,
      subject: "Canonical synthetic subject",
      body: "Canonical synthetic body. This is test-only content and not a real external message.",
    };
    const env = runtimeEnv({ canonical: canonicalBinding({ message }) });
    const results = await Promise.all([
      sendColdFair(env, { message: { classification: "REPLY", body: "forged caller body" } }),
      sendColdFair(env, { classification: "TRANSACTIONAL", transaction_id: "forged" }),
    ]);
    assert.equal(providerCalls, 1, `atomic PlannedActionID claim permits exactly one provider call: ${JSON.stringify(results)}`);
    assert.ok(results.some(({ status, payload }) => status === 202 && payload.delivery_state === "ACCEPTED"));
    const blockedConcurrentReplay = results.find(({ status }) => status === 409)?.payload;
    assert.ok(blockedConcurrentReplay, "the concurrent replay must be rejected");
    assert.ok(
      (blockedConcurrentReplay.decision === "RECONCILE" && blockedConcurrentReplay.reason === "planned_action_already_claimed")
      || (blockedConcurrentReplay.decision === "RECONCILE" && blockedConcurrentReplay.reason === "provider_state_not_sendable"
        && blockedConcurrentReplay.delivery_state === "SENDING")
      || (blockedConcurrentReplay.decision === "BLOCK" && blockedConcurrentReplay.reason === "already_delivered"),
      `the rejected replay must reflect an active claim, a sending receipt, or its accepted receipt: ${JSON.stringify(results)}`,
    );

    const replay = await sendColdFair(env);
    assert.equal(replay.status, 409);
    assert.equal(replay.payload.decision, "BLOCK");
    assert.equal(replay.payload.reason, "already_delivered");
    assert.equal(providerCalls, 1, "restart/replay readback cannot resend an accepted action");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

{
  const originalFetch = globalThis.fetch;
  let gmailPayload;
  globalThis.fetch = async (url, init = {}) => {
    if (String(url) === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "synthetic-access" });
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      gmailPayload = JSON.parse(init.body);
      return Response.json({ id: "provider-reply-1", threadId: "canonical-thread-1" });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  try {
    const message = {
      classification: "REPLY",
      businessLine: "MARKETING",
      campaign: "synthetic-reply",
      templateVersion: "v1",
      requiredFactsPresent: true,
      containsPromotion: false,
      freshInboundNeed: true,
      providerThreadId: "canonical-thread-1",
      replyToMessageId: "<canonical-inbound-1@example.invalid>",
      subject: "Canonical reply subject",
      body: "Canonical reply body. This is test-only content and not a real external message.",
    };
    const proof = {
      verified: true,
      type: "REPLY",
      contactId: "CT-SYNTH-001",
      plannedActionId: "PA-SYNTH-001",
      providerThreadId: "canonical-thread-1",
      replyToMessageId: "<canonical-inbound-1@example.invalid>",
    };
    const env = runtimeEnv({ canonical: canonicalBinding({ message, proof, gate: "BLOCKED" }) });
    const reply = await sendColdFair(env, {
      message: {
        classification: "FIRST_TOUCH",
        providerThreadId: "forged-thread",
        replyToMessageId: "<forged@example.invalid>",
        body: "forged caller body",
      },
    });
    assert.equal(reply.status, 202);
    assert.equal(gmailPayload.threadId, "canonical-thread-1");
    const raw = Buffer.from(gmailPayload.raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    assert.match(raw, /In-Reply-To: <canonical-inbound-1@example\.invalid>/);
    assert.match(raw, /References: <canonical-inbound-1@example\.invalid>/);
    const encodedBody = raw.match(/Content-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=\r\n]+)\r\n--/)?.[1] || "";
    assert.equal(Buffer.from(encodedBody.replace(/\s+/g, ""), "base64").toString("utf8"), message.body,
      "provider MIME must use canonical approved body");
    assert.equal(raw.includes("forged caller body"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

{
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url) === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "synthetic-access" });
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      providerCalls += 1;
      throw new Error("synthetic timeout after possible provider acceptance");
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  try {
    const message = {
      classification: "FIRST_TOUCH",
      businessLine: "MARKETING",
      campaign: "synthetic-uncertain",
      templateVersion: "v1",
      requiredFactsPresent: true,
      containsPromotion: true,
      subject: "Canonical uncertainty subject",
      body: "Canonical uncertainty body. This is test-only content and not a real external message.",
    };
    const env = runtimeEnv({ canonical: canonicalBinding({ message, counters: {
      firstTouch24h: 4,
      firstTouchCap24h: 5,
      nonReplyPromotional24h: 9,
      nonReplyPromotionalCap24h: 10,
    } }) });
    const uncertain = await sendColdFair(env);
    assert.equal(uncertain.status, 409);
    assert.equal(uncertain.payload.delivery_state, "UNCERTAIN");
    assert.equal(uncertain.payload.decision, "RECONCILE");
    const differentAction = await sendColdFair(env, { planned_action_id: "PA-SYNTH-UNCERTAIN-002" });
    assert.equal(differentAction.status, 403);
    assert.equal(differentAction.payload.reason, "first_touch_cap_reached");
    const sameAction = await sendColdFair(env);
    assert.equal(sameAction.status, 409);
    assert.equal(providerCalls, 1, "uncertain provider outcome must hold the shared cap and never auto-resend");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

{
  const originalFetch = globalThis.fetch;
  let tokenCalls = 0;
  let providerCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url) === "https://oauth2.googleapis.com/token") {
      tokenCalls += 1;
      return Response.json({ error: "invalid_grant" }, { status: 401 });
    }
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      providerCalls += 1;
      throw new Error("provider endpoint must not be reached when OAuth is definitively rejected");
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  try {
    const message = {
      classification: "FIRST_TOUCH",
      businessLine: "MARKETING",
      campaign: "synthetic-definitive-rejection",
      templateVersion: "v1",
      requiredFactsPresent: true,
      containsPromotion: true,
      subject: "Canonical rejected subject",
      body: "Canonical rejected body. This is test-only content and not a real external message.",
    };
    const counters = {
      firstTouch24h: 4,
      firstTouchCap24h: 5,
      nonReplyPromotional24h: 9,
      nonReplyPromotionalCap24h: 10,
    };
    const env = runtimeEnv({ canonical: canonicalBinding({ message, counters }) });
    const first = await sendColdFair(env, { planned_action_id: "PA-SYNTH-REJECTED-001" });
    assert.equal(first.status, 409);
    assert.equal(first.payload.reason, "provider_definitively_rejected");
    assert.equal(first.payload.delivery_state, "REJECTED");
    assert.equal(first.payload.provider_called, false);

    const second = await sendColdFair(env, { planned_action_id: "PA-SYNTH-REJECTED-002" });
    assert.equal(second.status, 409);
    assert.equal(second.payload.reason, "provider_definitively_rejected",
      "a definitive pre-provider rejection must release the shared cap for another action");
    const replay = await sendColdFair(env, { planned_action_id: "PA-SYNTH-REJECTED-001" });
    assert.equal(replay.status, 409);
    assert.equal(replay.payload.reason, "provider_state_not_sendable");
    assert.equal(replay.payload.delivery_state, "REJECTED");
    assert.equal(tokenCalls, 2, "the terminal rejected action must not be blindly retried");
    assert.equal(providerCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

console.log("Cold Fair runtime gate keeps the live send route blocked without provider access.");
