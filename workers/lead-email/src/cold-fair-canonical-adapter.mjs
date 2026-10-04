import {
  coldFairPlannedActionKey,
  evaluateColdFairPreSend,
} from "./cold-fair-outbound-guard.mjs";

const DEFAULT_MAX_READ_AGE_MS = 5 * 60 * 1000;
const REQUIRED_SOURCE_READS = [
  "readContact",
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
const stopped = (result) => ({ result, contact: null });

/**
 * Builds the Cold Fair decision snapshot from server-owned reads only.
 *
 * canonicalSource is the boundary for the existing canonical Contacts registry,
 * SUPPRESSIONS, rolling counters, global gate and outbound-ledger/provider state.
 * Caller-supplied contact, suppression, counter, gate or provider fields are
 * intentionally ignored.
 *
 * This adapter is not wired to a route or live provider. Atomic claim, provider
 * receipt writeback and reconciliation remain separate runtime acceptance gates.
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
    const message = request.message && typeof request.message === "object" ? request.message : {};
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
    const receipts = { contact: contactReceipt };
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

    return { result: publicDecision(result, receipts), contact: canonicalContact };
  };

  const evaluate = async (request = {}) => (await evaluateCanonical(request)).result;

  const send = async (request = {}, providerCall) => {
    const { result, contact } = await evaluateCanonical(request);
    if (result.decision !== "ALLOW") return result;
    if (typeof providerCall !== "function") {
      return block("provider_not_configured", { canonical_receipts: result.canonical_receipts });
    }

    const providerResult = await providerCall({
      recipient: contact.email,
      message: request.message,
      plannedActionKey: result.planned_action_key,
    });
    return {
      ...result,
      provider_called: true,
      provider_result: providerResult,
    };
  };

  return Object.freeze({ evaluate, send });
}
