import {
  coldFairPlannedActionKey,
  evaluateColdFairPreSend,
} from "./cold-fair-outbound-guard.mjs";

const DEFAULT_MAX_READ_AGE_MS = 5 * 60 * 1000;
const REQUIRED_SOURCE_READS = [
  "readContact",
  "readPlannedAction",
  "readSuppressions",
  "readCounters",
  "readPromotionalSendGate",
  "readProviderState",
];

const clean = (value) => typeof value === "string" ? value.trim() : "";
const block = (reason, extra = {}) => ({
  decision: "BLOCK",
  reason,
  would_send: false,
  provider_called: false,
  ...extra,
});

const sourceReceipt = (read, label, now, maxReadAgeMs) => {
  if (!read || typeof read !== "object" || !("value" in read)) {
    throw new Error(`${label}_read_missing`);
  }

  const source = clean(read.source);
  const snapshotVersion = clean(read.snapshotVersion);
  const observedAt = Date.parse(clean(read.observedAt));
  if (!source || !snapshotVersion || !Number.isFinite(observedAt)) {
    throw new Error(`${label}_provenance_missing`);
  }
  if (observedAt > now || now - observedAt > maxReadAgeMs) {
    throw new Error(`${label}_read_stale`);
  }

  return {
    source,
    snapshot_version: snapshotVersion,
    observed_at: new Date(observedAt).toISOString(),
  };
};

const sameSnapshot = (receipts) => new Set(
  Object.values(receipts).map((receipt) => receipt.snapshot_version),
).size === 1;

const publicDecision = (result, receipts) => ({
  ...result,
  provider_called: false,
  canonical_receipts: receipts,
});
const stopped = (result) => ({ result, contact: null, message: null });
const needsReconcile = (reason, extra = {}) => ({ ...block(reason, extra), decision: "RECONCILE" });

/**
 * Builds the Cold Fair decision snapshot from server-owned reads only.
 *
 * canonicalSource is the boundary for the existing canonical Contacts registry,
 * SUPPRESSIONS, rolling counters, global gate and outbound-ledger/provider state.
 * Caller-supplied contact, suppression, counter, gate or provider fields are
 * intentionally ignored.
 *
 * This adapter is not wired to a route or live provider. The injected canonical
 * source must implement atomic claim and durable compare-and-swap receipt writes;
 * no memory fallback or live transport is created here. claimPlannedAction must
 * atomically reject an already claimed ID or changed authorizationSnapshotVersion
 * (including contact, suppression, gate, counters and approved action content).
 * recordProviderReceipt must compare-and-swap the exact SENDING attempt token.
 */
export function createColdFairCanonicalAdapter({
  canonicalSource,
  now = () => Date.now(),
  maxReadAgeMs = DEFAULT_MAX_READ_AGE_MS,
} = {}) {
  if (!canonicalSource || typeof canonicalSource !== "object") {
    throw new TypeError("canonicalSource is required");
  }
  for (const method of REQUIRED_SOURCE_READS) {
    if (typeof canonicalSource[method] !== "function") {
      throw new TypeError(`canonicalSource.${method} is required`);
    }
  }
  if (typeof now !== "function" || !Number.isFinite(maxReadAgeMs) || maxReadAgeMs <= 0) {
    throw new TypeError("valid freshness controls are required");
  }

  const evaluateCanonical = async (request = {}) => {
    const contactId = clean(request.contactId);
    const plannedActionId = clean(request.plannedActionId || request.message?.plannedActionId);
    if (!plannedActionId) return stopped(block("missing_planned_action_identity"));
    if (!contactId) return stopped(block("missing_contact_id"));

    const readAt = now();
    let contactRead;
    let contactReceipt;
    try {
      contactRead = await canonicalSource.readContact({ contactId });
      contactReceipt = sourceReceipt(contactRead, "contact", readAt, maxReadAgeMs);
    } catch (error) {
      return stopped(block("canonical_state_unavailable", { source_error: clean(error?.message) || "contact_read_failed" }));
    }

    const contact = contactRead.value && typeof contactRead.value === "object" ? contactRead.value : {};
    if (clean(contact.contactId) !== contactId) {
      return stopped(block("canonical_contact_mismatch"));
    }

    let planRead;
    let planReceipt;
    let plan;
    try {
      planRead = await canonicalSource.readPlannedAction({ contactId, plannedActionId });
      planReceipt = sourceReceipt(planRead, "planned_action", readAt, maxReadAgeMs);
      plan = structuredClone(planRead.value);
    } catch {
      return stopped(block("canonical_planned_action_unavailable"));
    }
    if (!plan || clean(plan.contactId) !== contactId || clean(plan.plannedActionId) !== plannedActionId
      || clean(plan.message?.plannedActionId) !== plannedActionId) return stopped(block("canonical_planned_action_mismatch"));
    if (plan.templateApproved !== true || plan.contentApproved !== true) return stopped(block("canonical_content_not_approved"));
    const message = plan.message;
    const classification = clean(message.classification).toUpperCase();
    const proof = plan.authorizationProof;
    if (classification === "REPLY" && !(proof?.verified === true && proof.type === "REPLY"
      && proof.contactId === contactId && proof.plannedActionId === plannedActionId && clean(proof.providerThreadId) && clean(proof.replyToMessageId)
      && proof.providerThreadId === message.providerThreadId && proof.replyToMessageId === message.replyToMessageId)) {
      return stopped(block("canonical_reply_proof_missing"));
    }
    if (classification === "TRANSACTIONAL" && !(proof?.verified === true && proof.type === "TRANSACTIONAL"
      && proof.contactId === contactId && proof.plannedActionId === plannedActionId && clean(proof.transactionId) && proof.transactionId === message.transactionId)) {
      return stopped(block("canonical_transaction_proof_missing"));
    }

    const plannedActionKey = coldFairPlannedActionKey({
      contactId,
      businessLine: message.businessLine,
      campaign: message.campaign,
      templateVersion: message.templateVersion,
      plannedActionId: message.plannedActionId,
    });

    let suppressionRead;
    let countersRead;
    let gateRead;
    let providerRead;
    const receipts = { contact: contactReceipt, planned_action: planReceipt };
    try {
      [suppressionRead, countersRead, gateRead, providerRead] = await Promise.all([
        canonicalSource.readSuppressions({ contactId, email: contact.email }),
        canonicalSource.readCounters({ contactId, classification: message.classification }),
        canonicalSource.readPromotionalSendGate({ contactId }),
        canonicalSource.readProviderState({ contactId, plannedActionKey }),
      ]);
      receipts.suppressions = sourceReceipt(suppressionRead, "suppressions", readAt, maxReadAgeMs);
      receipts.counters = sourceReceipt(countersRead, "counters", readAt, maxReadAgeMs);
      receipts.gate = sourceReceipt(gateRead, "gate", readAt, maxReadAgeMs);
      receipts.provider = sourceReceipt(providerRead, "provider", readAt, maxReadAgeMs);
    } catch (error) {
      return stopped(block("canonical_state_unavailable", {
        source_error: clean(error?.message) || "canonical_read_failed",
        canonical_receipts: receipts,
      }));
    }

    if (!sameSnapshot(receipts)) {
      return stopped(block("canonical_snapshot_mismatch", { canonical_receipts: receipts }));
    }

    const suppression = suppressionRead.value && typeof suppressionRead.value === "object"
      ? suppressionRead.value
      : {};
    const suppressionStatus = clean(suppression.status).toUpperCase();
    if (!["CLEAR", "SUPPRESSED"].includes(suppressionStatus)) {
      return stopped(block("canonical_suppression_state_unknown", { canonical_receipts: receipts }));
    }

    const counters = countersRead.value && typeof countersRead.value === "object" ? countersRead.value : {};
    const provider = providerRead.value && typeof providerRead.value === "object" ? providerRead.value : {};
    const promotionalSendGate = typeof gateRead.value === "string" ? gateRead.value : "";
    const canonicalContact = {
      ...contact,
      doNotContact: suppressionStatus === "SUPPRESSED" || contact.doNotContact === true,
    };

    const result = evaluateColdFairPreSend({
      contact: canonicalContact,
      message,
      counters,
      promotionalSendGate,
      provider,
    });

    if (result.decision === "ALLOW") {
      const state = clean(provider.state).toUpperCase();
      if (provider.plannedActionKey && clean(provider.plannedActionKey).toLowerCase() !== plannedActionKey) {
        return stopped(block("canonical_provider_identity_mismatch", {canonical_receipts: receipts}));
      }
      if (["ACCEPTED", "DELIVERED"].includes(state)) return stopped(block("already_delivered", {canonical_receipts: receipts, delivery_state: state}));
      if (state !== "NOT_ATTEMPTED") return stopped(needsReconcile("provider_state_not_sendable", {canonical_receipts: receipts, delivery_state: state || "UNKNOWN"}));
    }
    return { result: publicDecision(result, receipts), contact: canonicalContact, message, plannedActionId };
  };

  const evaluate = async (request = {}) => (await evaluateCanonical(request)).result;

  const send = async (request = {}, providerCall) => {
    const { result, contact, message, plannedActionId } = await evaluateCanonical(request);
    if (result.decision !== "ALLOW") return result;
    if (typeof providerCall !== "function") return block("provider_not_configured", {canonical_receipts: result.canonical_receipts});
    if (typeof canonicalSource.claimPlannedAction !== "function" || typeof canonicalSource.recordProviderReceipt !== "function") {
      return block("durable_ledger_unavailable", {canonical_receipts: result.canonical_receipts});
    }
    const identity = {contactId: contact.contactId, plannedActionId, plannedActionKey: result.planned_action_key};
    let claim;
    try {
      const read = await canonicalSource.claimPlannedAction({...identity,
        authorizationSnapshotVersion: result.canonical_receipts.planned_action.snapshot_version});
      sourceReceipt(read, "claim", now(), maxReadAgeMs);
      claim = read.value;
      if (claim?.claimed !== true) return needsReconcile("planned_action_already_claimed");
      if (claim.state !== "SENDING" || !clean(claim.attemptToken) || claim.plannedActionId !== plannedActionId
        || claim.plannedActionKey !== identity.plannedActionKey
        || claim.authorizationSnapshotVersion !== result.canonical_receipts.planned_action.snapshot_version) {
        return needsReconcile("canonical_claim_unverified");
      }
    } catch { return needsReconcile("canonical_claim_unavailable"); }

    let providerResult;
    let state = "UNCERTAIN";
    try {
      providerResult = await providerCall({recipient: contact.email, message, ...identity, attemptToken: claim.attemptToken});
      if (clean(providerResult?.state).toUpperCase() === "ACCEPTED" && clean(providerResult.providerMessageId)) state = "ACCEPTED";
    } catch { /* Provider failure may have happened after acceptance: never resend. */ }
    const providerMessageId = state === "ACCEPTED" ? clean(providerResult.providerMessageId) : null;
    try {
      const written = await canonicalSource.recordProviderReceipt({...identity, attemptToken: claim.attemptToken, state, providerMessageId});
      sourceReceipt(written, "receipt_write", now(), maxReadAgeMs);
      if (written.value?.persisted !== true) throw new Error("receipt_not_persisted");
      const read = await canonicalSource.readProviderState(identity);
      sourceReceipt(read, "receipt_readback", now(), maxReadAgeMs);
      const stored = read.value;
      if (stored?.state !== state || stored.plannedActionId !== plannedActionId || stored.plannedActionKey !== identity.plannedActionKey
        || stored.attemptToken !== claim.attemptToken || (state === "ACCEPTED" && stored.providerMessageId !== providerMessageId)) {
        throw new Error("receipt_readback_mismatch");
      }
    } catch {
      return {...needsReconcile("provider_receipt_unverified"), provider_called: true, delivery_state: "UNCERTAIN", receipt_persisted: false};
    }
    return {...result, decision: state === "ACCEPTED" ? "ALLOW" : "RECONCILE", would_send: false,
      reason: state === "ACCEPTED" ? "provider_acceptance_persisted" : "provider_outcome_uncertain",
      provider_called: true, delivery_state: state, receipt_persisted: true, provider_result: {state, providerMessageId}};
  };
  const reconcile = async (request = {}) => (await evaluateCanonical(request)).result;

  return Object.freeze({ evaluate, send, reconcile });
}
