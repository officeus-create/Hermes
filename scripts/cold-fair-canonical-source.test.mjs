import assert from "node:assert/strict";

let createColdFairCanonicalSource;
try {
  ({ createColdFairCanonicalSource } = await import("../workers/lead-email/src/cold-fair-canonical-source.mjs"));
} catch {
  // The first RED run proves the canonical binding does not exist yet.
}
assert.equal(typeof createColdFairCanonicalSource, "function", "canonical source binding must exist");

const snapshot = {
  ok: true,
  source: "hermes-contacts-canonical",
  observed_at: "2026-10-08T11:59:30.000Z",
  snapshot_version: "snapshot-v1",
  contact: {
    contactId: "CT-SYNTH-001",
    email: "synthetic@example.invalid",
    emailEligibility: "ELIGIBLE",
    contactPermission: "UNKNOWN",
    duplicateStatus: "NEW",
  },
  planned_action: {
    contactId: "CT-SYNTH-001",
    plannedActionId: "PA-SYNTH-001",
    templateApproved: true,
    contentApproved: true,
    message: {
      classification: "FIRST_TOUCH",
      businessLine: "MARKETING",
      campaign: "synthetic",
      templateVersion: "v1",
      plannedActionId: "PA-SYNTH-001",
      requiredFactsPresent: true,
      containsPromotion: true,
      subject: "Canonical subject",
      body: "Canonical approved body",
    },
  },
  suppressions: { status: "CLEAR" },
  counters: {
    campaignOwnerId: "OWNER-SYNTH-001",
    windowKey: "2026-10-08T00:00:00Z/PT24H",
    firstTouch24h: 0,
    firstTouchCap24h: 5,
    nonReplyPromotional24h: 0,
    nonReplyPromotionalCap24h: 10,
  },
  promotional_send_gate: "BLOCKED",
};

let snapshotCalls = 0;
const binding = {
  async fetch(request) {
    snapshotCalls += 1;
    assert.equal(new URL(request.url).pathname, "/v1/cold-fair/snapshot");
    assert.equal(request.method, "POST");
    assert.deepEqual(await request.json(), {
      contact_id: "CT-SYNTH-001",
      planned_action_id: "PA-SYNTH-001",
    });
    return Response.json(snapshot);
  },
};

const ledgerCalls = [];
const ledger = {
  async read(identity) {
    ledgerCalls.push(["read", identity]);
    return { ...identity, state: "NOT_ATTEMPTED" };
  },
  async claim(identity) {
    ledgerCalls.push(["claim", identity]);
    return { ...identity, claimed: true, state: "SENDING", attemptToken: "attempt-1" };
  },
  async recordProviderReceipt(receipt) {
    ledgerCalls.push(["receipt", receipt]);
    return { ...receipt, persisted: true };
  },
};

const capLedgerCalls = [];
const capLedger = {
  async reserveCampaignCap(input) {
    capLedgerCalls.push(["reserve", input]);
    return { ...input, reserved: true, state: "RESERVED", reservationToken: "reservation-1" };
  },
  async finalizeCampaignCap(input) {
    capLedgerCalls.push(["finalize", input]);
    return { ...input, persisted: true };
  },
};
const capScopes = [];
const capLedgerFor = (scope) => {
  capScopes.push(scope);
  return capLedger;
};

const source = createColdFairCanonicalSource({ binding, ledger, capLedgerFor });
const identity = { contactId: "CT-SYNTH-001", plannedActionId: "PA-SYNTH-001" };
const contact = await source.readContact(identity);
const plan = await source.readPlannedAction(identity);
const suppression = await source.readSuppressions(identity);
const counters = await source.readCounters(identity);
const gate = await source.readPromotionalSendGate(identity);

assert.equal(snapshotCalls, 1, "one immutable canonical snapshot must back every authorization read");
for (const read of [contact, plan, suppression, counters, gate]) {
  assert.equal(read.source, "hermes-contacts-canonical");
  assert.equal(read.snapshotVersion, "snapshot-v1");
  assert.equal(read.observedAt, "2026-10-08T11:59:30.000Z");
}
assert.equal(contact.value.email, "synthetic@example.invalid");
assert.equal(plan.value.message.body, "Canonical approved body");
assert.equal(suppression.value.status, "CLEAR");
assert.equal(counters.value.firstTouchCap24h, 5);
assert.equal(gate.value, "BLOCKED");

const ledgerIdentity = {
  ...identity,
  plannedActionKey: "ct-synth-001::marketing::synthetic::v1::pa-synth-001",
  authorizationSnapshotVersion: "snapshot-v1",
};
assert.equal((await source.readProviderState(ledgerIdentity)).value.state, "NOT_ATTEMPTED");
assert.equal((await source.claimPlannedAction(ledgerIdentity)).value.attemptToken, "attempt-1");
assert.equal((await source.recordProviderReceipt({
  ...ledgerIdentity,
  attemptToken: "attempt-1",
  state: "UNCERTAIN",
  providerMessageId: null,
  providerThreadId: null,
})).value.persisted, true);
assert.deepEqual(ledgerCalls.map(([name]) => name), ["read", "claim", "receipt"]);

const capIdentity = {
  ...identity,
  plannedActionKey: ledgerIdentity.plannedActionKey,
};
const reservation = await source.reserveCampaignCap(capIdentity);
assert.equal(reservation.value.reservationToken, "reservation-1");
const finalization = await source.finalizeCampaignCap({
  ...capIdentity,
  reservationToken: "reservation-1",
  state: "UNCERTAIN",
});
assert.equal(finalization.value.persisted, true);
assert.deepEqual(capScopes, [
  {
    campaignOwnerId: "OWNER-SYNTH-001",
    businessLine: "MARKETING",
    campaign: "synthetic",
    windowKey: "2026-10-08T00:00:00Z/PT24H",
  },
  {
    campaignOwnerId: "OWNER-SYNTH-001",
    businessLine: "MARKETING",
    campaign: "synthetic",
    windowKey: "2026-10-08T00:00:00Z/PT24H",
  },
]);
assert.deepEqual(capLedgerCalls.map(([name]) => name), ["reserve", "finalize"]);
assert.equal(capLedgerCalls[0][1].authorizationSnapshotVersion, "snapshot-v1");
assert.equal(capLedgerCalls[0][1].firstTouch24h, 0);
assert.equal(capLedgerCalls[1][1].state, "UNCERTAIN");

{
  const missingScopeSnapshot = structuredClone(snapshot);
  delete missingScopeSnapshot.counters.windowKey;
  let missingScopeCapCalls = 0;
  const missingScopeSource = createColdFairCanonicalSource({
    binding: { async fetch() { return Response.json(missingScopeSnapshot); } },
    ledger,
    capLedgerFor() {
      missingScopeCapCalls += 1;
      return capLedger;
    },
    identity,
  });
  await assert.rejects(
    missingScopeSource.reserveCampaignCap(capIdentity),
    /canonical_campaign_cap_scope_missing/,
  );
  assert.equal(missingScopeCapCalls, 0, "missing canonical owner/window identity must fail closed before ledger access");
}

console.log("Cold Fair canonical service binding shares one snapshot and delegates durable action/cap ledger operations.");
