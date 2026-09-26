import assert from "node:assert/strict";
import {
  coldFairPlannedActionKey,
  evaluateColdFairPreSend,
} from "../workers/lead-email/src/cold-fair-outbound-guard.mjs";

const base = {
  contact: {
    contactId: "CT-SYNTH-001",
    email: "synthetic@example.com",
    emailEligibility: "ELIGIBLE",
    contactPermission: "Unknown",
    duplicateStatus: "New",
  },
  message: {
    classification: "FIRST_TOUCH",
    businessLine: "MARKETING",
    campaign: "synthetic-campaign",
    templateVersion: "v1",
    plannedActionId: "plan-001",
    requiredFactsPresent: true,
    freshInboundNeed: false,
    authorizedTransaction: false,
    containsPromotion: true,
  },
  counters: {
    firstTouch24h: 0,
    firstTouchCap24h: 5,
    nonReplyPromotional24h: 0,
    nonReplyPromotionalCap24h: 10,
  },
  promotionalSendGate: "ALLOW",
  provider: { state: "NOT_ATTEMPTED" },
};

const merge = (patch = {}) => ({
  ...base,
  ...patch,
  contact: { ...base.contact, ...(patch.contact || {}) },
  message: { ...base.message, ...(patch.message || {}) },
  counters: { ...base.counters, ...(patch.counters || {}) },
  provider: { ...base.provider, ...(patch.provider || {}) },
});

const decision = (patch) => evaluateColdFairPreSend(merge(patch));

assert.equal(decision({ contact: { contactId: "" } }).reason, "missing_contact_id");
assert.equal(decision({ contact: { emailEligibility: "SUPPRESSED" } }).reason, "suppressed_or_do_not_contact");
assert.equal(decision({ contact: { emailEligibility: "HOLD" } }).reason, "contact_hold");
assert.equal(decision({
  contact: { emailEligibility: "REPLY_ONLY" },
  message: { classification: "FIRST_TOUCH" },
}).reason, "reply_only_contact");

const reply = decision({
  contact: { emailEligibility: "REPLY_ONLY" },
  message: {
    classification: "REPLY",
    freshInboundNeed: true,
    providerThreadId: "thread-1",
    replyToMessageId: "message-1",
    containsPromotion: false,
  },
});
assert.equal(reply.decision, "ALLOW");
assert.equal(reply.reason, "narrow_same_thread_reply");

assert.equal(decision({
  contact: { emailEligibility: "TRANSACTIONAL_ONLY" },
  message: { classification: "TRANSACTIONAL", authorizedTransaction: true, containsPromotion: true },
}).reason, "transactional_cross_sell_blocked");

const transaction = decision({
  contact: { emailEligibility: "TRANSACTIONAL_ONLY" },
  message: { classification: "TRANSACTIONAL", authorizedTransaction: true, containsPromotion: false },
});
assert.equal(transaction.decision, "ALLOW");

assert.equal(decision({ message: { requiredFactsPresent: false } }).reason, "missing_required_facts");
assert.equal(decision({ promotionalSendGate: "BLOCKED" }).reason, "global_promotional_gate_blocked");
assert.equal(decision({ counters: { firstTouch24h: 5 } }).reason, "first_touch_cap_reached");
assert.equal(decision({ counters: { nonReplyPromotional24h: 10 } }).reason, "non_reply_promotional_cap_reached");

const key1 = coldFairPlannedActionKey({
  contactId: "CT-1",
  businessLine: "Marketing",
  campaign: "Repair Shops",
  templateVersion: "V1",
  plannedActionId: "Action-1",
});
const key2 = coldFairPlannedActionKey({
  contactId: "ct-1",
  businessLine: "  marketing  ",
  campaign: "Repair   Shops",
  templateVersion: "v1",
  plannedActionId: "action-1",
});
assert.equal(key1, key2, "idempotency identity must be deterministic across casing/spacing");

const ambiguous = decision({ provider: { state: "AMBIGUOUS" } });
assert.equal(ambiguous.decision, "RECONCILE");
assert.equal(ambiguous.would_send, false);

const delivered = decision({
  provider: {
    state: "DELIVERED",
    plannedActionKey: key1,
  },
  contact: { contactId: "CT-1" },
  message: {
    businessLine: "Marketing",
    campaign: "Repair Shops",
    templateVersion: "V1",
    plannedActionId: "Action-1",
  },
});
assert.equal(delivered.reason, "already_delivered");
assert.equal(delivered.would_send, false);

const allowed = decision({});
assert.equal(allowed.decision, "ALLOW");
assert.equal(allowed.reason, "promotional_pre_send_allowed");
assert.equal(allowed.would_send, true);

const possibleDuplicate = decision({ contact: { duplicateStatus: "Possible Duplicate" } });
assert.equal(possibleDuplicate.reason, "identity_review_required");

console.log("Cold Fair pre-send policy guard contract passed.");
