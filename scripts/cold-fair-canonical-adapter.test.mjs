import assert from "node:assert/strict";
import { createColdFairCanonicalAdapter } from "../workers/lead-email/src/cold-fair-canonical-adapter.mjs";

const NOW = Date.parse("2026-10-04T12:00:00.000Z");
const SNAPSHOT_VERSION = "synthetic-snapshot-v1";
const receipt = (source, value, overrides = {}) => ({
  source,
  observedAt: "2026-10-04T11:59:30.000Z",
  snapshotVersion: SNAPSHOT_VERSION,
  value,
  ...overrides,
});

const message = {
  classification: "FIRST_TOUCH",
  businessLine: "MARKETING",
  campaign: "synthetic-campaign",
  templateVersion: "v1",
  plannedActionId: "synthetic-action-001",
  requiredFactsPresent: true,
  containsPromotion: true,
};

const sourceCalls = [];
const canonicalSource = {
  async readContact(input) {
    sourceCalls.push(["contact", input]);
    return receipt("canonical-contacts", {
      contactId: "CT-SYNTH-001",
      email: "canonical-recipient@example.com",
      emailEligibility: "ELIGIBLE",
      contactPermission: "UNKNOWN",
      duplicateStatus: "NEW",
    });
  },
  async readSuppressions(input) {
    sourceCalls.push(["suppressions", input]);
    return receipt("canonical-suppressions", { status: "SUPPRESSED" });
  },
  async readCounters(input) {
    sourceCalls.push(["counters", input]);
    return receipt("canonical-counters", {
      firstTouch24h: 0,
      firstTouchCap24h: 5,
      nonReplyPromotional24h: 0,
      nonReplyPromotionalCap24h: 10,
    });
  },
  async readPromotionalSendGate(input) {
    sourceCalls.push(["gate", input]);
    return receipt("canonical-config", "BLOCKED");
  },
  async readProviderState(input) {
    sourceCalls.push(["provider", input]);
    return receipt("canonical-outbound-ledger", { state: "NOT_ATTEMPTED" });
  },
};

const adapter = createColdFairCanonicalAdapter({
  canonicalSource,
  now: () => NOW,
});

let providerCalls = 0;
const forgedCallerState = {
  contactId: "CT-SYNTH-001",
  message,
  contact: {
    contactId: "CT-SYNTH-001",
    email: "attacker-selected@example.com",
    emailEligibility: "ELIGIBLE",
    doNotContact: false,
  },
  suppressions: { status: "CLEAR" },
  counters: {
    firstTouch24h: 0,
    firstTouchCap24h: 999,
    nonReplyPromotional24h: 0,
    nonReplyPromotionalCap24h: 999,
  },
  promotionalSendGate: "ALLOW",
  provider: { state: "NOT_ATTEMPTED" },
};

const blocked = await adapter.send(forgedCallerState, async () => {
  providerCalls += 1;
  return { messageId: "must-not-exist" };
});

assert.equal(blocked.decision, "BLOCK");
assert.equal(blocked.reason, "suppressed_or_do_not_contact");
assert.equal(blocked.provider_called, false);
assert.equal(providerCalls, 0, "forged caller eligibility must never reach the provider");
assert.deepEqual(sourceCalls.map(([name]) => name).sort(), [
  "contact",
  "counters",
  "gate",
  "provider",
  "suppressions",
]);
assert.equal(blocked.canonical_receipts.contact.source, "canonical-contacts");
assert.equal(blocked.canonical_receipts.suppressions.source, "canonical-suppressions");
assert.equal(blocked.canonical_receipts.counters.source, "canonical-counters");
assert.equal(blocked.canonical_receipts.gate.source, "canonical-config");

const staleSource = {
  ...canonicalSource,
  async readContact() {
    return receipt("canonical-contacts", {
      contactId: "CT-SYNTH-001",
      email: "canonical-recipient@example.com",
      emailEligibility: "ELIGIBLE",
    }, { observedAt: "2026-10-04T11:00:00.000Z" });
  },
};
const staleAdapter = createColdFairCanonicalAdapter({ canonicalSource: staleSource, now: () => NOW });
const stale = await staleAdapter.send({ contactId: "CT-SYNTH-001", message }, async () => {
  providerCalls += 1;
});
assert.equal(stale.reason, "canonical_state_unavailable");
assert.equal(stale.provider_called, false);
assert.equal(providerCalls, 0, "stale canonical state must fail closed before provider call");

console.log("Cold Fair canonical server-side adapter contract passed.");

