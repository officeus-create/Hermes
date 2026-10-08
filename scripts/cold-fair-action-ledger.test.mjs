import assert from "node:assert/strict";

let ColdFairActionLedgerCore;
let createColdFairActionLedgerClient;
let coldFairCapScopeKey;
try {
  ({ ColdFairActionLedgerCore, createColdFairActionLedgerClient, coldFairCapScopeKey } = await import("../workers/lead-email/src/cold-fair-action-ledger.mjs"));
} catch {
  // The first RED run proves the durable ledger implementation does not exist yet.
}
assert.equal(typeof ColdFairActionLedgerCore, "function", "Cold Fair durable ledger core must exist");
assert.equal(typeof createColdFairActionLedgerClient, "function", "Cold Fair Durable Object client must exist");
assert.equal(typeof coldFairCapScopeKey, "function", "Cold Fair shared cap scope key must exist");

class DurableStorage {
  constructor() {
    this.values = new Map();
    this.tail = Promise.resolve();
  }

  async get(key) {
    const value = this.values.get(key);
    return value === undefined ? undefined : structuredClone(value);
  }

  async put(key, value) {
    this.values.set(key, structuredClone(value));
  }

  async transaction(callback) {
    const previous = this.tail;
    let release;
    this.tail = new Promise((resolve) => { release = resolve; });
    await previous;
    try {
      return await callback({
        get: (key) => this.get(key),
        put: (key, value) => this.put(key, value),
      });
    } finally {
      release();
    }
  }
}

const identity = {
  contactId: "CT-SYNTH-001",
  plannedActionId: "PA-SYNTH-001",
  plannedActionKey: "ct-synth-001::marketing::synthetic::v1::pa-synth-001",
  authorizationSnapshotVersion: "snapshot-v1",
};

const capScope = {
  campaignOwnerId: "OWNER-SYNTH-001",
  businessLine: "MARKETING",
  campaign: "synthetic",
  windowKey: "2026-10-08T00:00:00Z/PT24H",
};
const capInput = (plannedActionId, classification = "FIRST_TOUCH") => ({
  ...capScope,
  plannedActionId,
  plannedActionKey: `ct-synth-001::marketing::synthetic::v1::${plannedActionId.toLowerCase()}`,
  authorizationSnapshotVersion: "snapshot-v1",
  classification,
  firstTouch24h: 4,
  firstTouchCap24h: 5,
  nonReplyPromotional24h: 9,
  nonReplyPromotionalCap24h: 10,
});

assert.equal(
  coldFairCapScopeKey(capScope),
  "cold-fair-cap:v1:15:owner-synth-001|9:marketing|9:synthetic|26:2026-10-08t00:00:00z/pt24h",
);
assert.equal(coldFairCapScopeKey({ ...capScope, windowKey: "" }), null);

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_000_000 });
  assert.equal((await ledger.read(identity)).state, "NOT_ATTEMPTED");

  const [first, second] = await Promise.all([
    ledger.claim(identity),
    ledger.claim(identity),
  ]);
  assert.equal([first.claimed, second.claimed].filter(Boolean).length, 1, "one PlannedActionID may be claimed once");
  const acceptedClaim = first.claimed ? first : second;
  assert.equal(acceptedClaim.schemaVersion, 1, "durable ledger record must declare its additive schema version");
  assert.equal(acceptedClaim.state, "SENDING");
  assert.ok(acceptedClaim.attemptToken);

  await assert.rejects(
    ledger.recordProviderReceipt({
      ...identity,
      attemptToken: "wrong-token",
      state: "ACCEPTED",
      providerMessageId: "provider-message-1",
      providerThreadId: "provider-thread-1",
    }),
    /receipt_compare_and_swap_failed/,
  );

  const receipt = await ledger.recordProviderReceipt({
    ...identity,
    attemptToken: acceptedClaim.attemptToken,
    state: "ACCEPTED",
    providerMessageId: "provider-message-1",
    providerThreadId: "provider-thread-1",
  });
  assert.equal(receipt.persisted, true);

  const restarted = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_000_500 });
  const readback = await restarted.read(identity);
  assert.equal(readback.state, "ACCEPTED");
  assert.equal(readback.providerMessageId, "provider-message-1");
  assert.equal(readback.providerThreadId, "provider-thread-1");
  assert.equal((await restarted.claim(identity)).claimed, false, "restart replay must not create a second claim");
}

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_300_000 });
  const [first, second] = await Promise.all([
    ledger.reserveCampaignCap(capInput("PA-SYNTH-CAP-001")),
    ledger.reserveCampaignCap(capInput("PA-SYNTH-CAP-002")),
  ]);
  assert.equal([first.reserved, second.reserved].filter(Boolean).length, 1,
    "different actions competing for one canonical cap slot must atomically reserve at most one");
  const accepted = first.reserved ? first : second;
  const blocked = first.reserved ? second : first;
  assert.equal(blocked.reason, "first_touch_cap_reached");
  await ledger.finalizeCampaignCap({
    ...capInput(accepted.plannedActionId),
    reservationToken: accepted.reservationToken,
    state: "UNCERTAIN",
  });
  assert.equal((await ledger.reserveCampaignCap(capInput("PA-SYNTH-CAP-003"))).reason, "first_touch_cap_reached",
    "an uncertain provider outcome must continue consuming the shared slot");
}

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_400_000 });
  const rejected = await ledger.reserveCampaignCap(capInput("PA-SYNTH-CAP-004"));
  await assert.rejects(
    ledger.finalizeCampaignCap({
      ...capInput("PA-SYNTH-CAP-004"),
      reservationToken: "wrong-token",
      state: "RELEASED",
    }),
    /campaign_cap_compare_and_swap_failed/,
  );
  await ledger.finalizeCampaignCap({
    ...capInput("PA-SYNTH-CAP-004"),
    reservationToken: rejected.reservationToken,
    state: "RELEASED",
  });
  assert.equal((await ledger.reserveCampaignCap(capInput("PA-SYNTH-CAP-005"))).reserved, true,
    "definitive pre-provider rejection must release the shared slot for another action");
}

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_500_000 });
  const first = await ledger.reserveCampaignCap(capInput("PA-SYNTH-PROMO-001", "PROMOTIONAL_FOLLOW_UP"));
  const second = await ledger.reserveCampaignCap(capInput("PA-SYNTH-PROMO-002", "PROMOTIONAL_FOLLOW_UP"));
  assert.equal(first.reserved, true);
  assert.equal(second.reason, "non_reply_promotional_cap_reached",
    "promotional follow-ups must share the non-reply campaign cap");
}

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_100_000 });
  const claim = await ledger.claim(identity);
  await ledger.recordProviderReceipt({
    ...identity,
    attemptToken: claim.attemptToken,
    state: "UNCERTAIN",
    providerMessageId: null,
    providerThreadId: null,
  });

  const restarted = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_100_500 });
  assert.equal((await restarted.read(identity)).state, "UNCERTAIN");
  assert.equal((await restarted.claim(identity)).claimed, false, "uncertain provider outcome must never auto-resend");
}

{
  const storage = new DurableStorage();
  const ledger = new ColdFairActionLedgerCore({ storage }, { now: () => 1_800_000_200_000 });
  const client = createColdFairActionLedgerClient({
    fetch: (request) => ledger.fetch(request),
  });
  assert.equal((await client.read(identity)).state, "NOT_ATTEMPTED");
  const claim = await client.claim(identity);
  assert.equal(claim.claimed, true);
  await client.recordProviderReceipt({
    ...identity,
    attemptToken: claim.attemptToken,
    state: "UNCERTAIN",
    providerMessageId: null,
    providerThreadId: null,
  });
  assert.equal((await client.read(identity)).state, "UNCERTAIN");
}

console.log("Cold Fair Durable Object ledger atomically reserves campaign caps, claims actions, CAS-writes receipts and blocks restart replay.");
