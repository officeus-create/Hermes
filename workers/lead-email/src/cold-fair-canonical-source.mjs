const SNAPSHOT_URL = "https://cold-fair-canonical.internal/v1/cold-fair/snapshot";

const clean = (value) => typeof value === "string" ? value.trim() : "";

export function createColdFairCanonicalSource({ binding, ledger, capLedgerFor, identity } = {}) {
  if (!binding || typeof binding.fetch !== "function") throw new TypeError("canonical service binding is required");
  if (!ledger || !["read", "claim", "recordProviderReceipt"].every((method) => typeof ledger[method] === "function")) {
    throw new TypeError("durable ledger binding is required");
  }
  if (typeof capLedgerFor !== "function") throw new TypeError("campaign cap ledger factory is required");

  let snapshotPromise;
  let canonicalIdentity = clean(identity?.contactId) && clean(identity?.plannedActionId)
    ? { contactId: clean(identity.contactId), plannedActionId: clean(identity.plannedActionId) }
    : undefined;

  const loadSnapshot = async (input = {}) => {
    const contactId = clean(input.contactId) || canonicalIdentity?.contactId;
    const plannedActionId = clean(input.plannedActionId) || canonicalIdentity?.plannedActionId;
    if (!contactId || !plannedActionId) throw new Error("canonical_snapshot_identity_missing");
    if (canonicalIdentity && (canonicalIdentity.contactId !== contactId || canonicalIdentity.plannedActionId !== plannedActionId)) {
      throw new Error("canonical_snapshot_identity_conflict");
    }
    canonicalIdentity ||= { contactId, plannedActionId };
    snapshotPromise ||= (async () => {
      const response = await binding.fetch(new Request(SNAPSHOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contactId, planned_action_id: plannedActionId }),
      }));
      if (!response?.ok) throw new Error("canonical_snapshot_unavailable");
      const snapshot = await response.json();
      if (snapshot?.ok !== true || clean(snapshot.source) === "" || clean(snapshot.observed_at) === ""
        || clean(snapshot.snapshot_version) === "" || snapshot.contact?.contactId !== contactId
        || snapshot.planned_action?.contactId !== contactId
        || snapshot.planned_action?.plannedActionId !== plannedActionId) {
        throw new Error("canonical_snapshot_invalid");
      }
      return structuredClone(snapshot);
    })();
    return snapshotPromise;
  };

  const canonicalRead = async (input, select) => {
    const snapshot = await loadSnapshot(input);
    return {
      source: snapshot.source,
      observedAt: snapshot.observed_at,
      snapshotVersion: snapshot.snapshot_version,
      value: structuredClone(select(snapshot)),
    };
  };

  const ledgerRead = async (input, operation) => {
    const snapshot = await loadSnapshot(input);
    const identity = {
      ...input,
      contactId: canonicalIdentity.contactId,
      plannedActionId: canonicalIdentity.plannedActionId,
      authorizationSnapshotVersion: snapshot.snapshot_version,
    };
    const value = await operation(identity);
    return {
      source: "cold-fair-action-ledger",
      observedAt: snapshot.observed_at,
      snapshotVersion: snapshot.snapshot_version,
      value: structuredClone(value),
    };
  };

  const capLedgerRead = async (input, operation) => {
    const snapshot = await loadSnapshot(input);
    const message = snapshot.planned_action?.message || {};
    const counters = snapshot.counters || {};
    const scope = {
      campaignOwnerId: clean(counters.campaignOwnerId),
      businessLine: clean(message.businessLine),
      campaign: clean(message.campaign),
      windowKey: clean(counters.windowKey),
    };
    if (Object.values(scope).some((value) => !value)) throw new Error("canonical_campaign_cap_scope_missing");
    const capLedger = capLedgerFor(scope);
    const capOperation = capLedger && operation(capLedger);
    if (typeof capOperation !== "function") throw new Error("campaign_cap_ledger_unavailable");
    const value = await capOperation({
      ...scope,
      plannedActionId: canonicalIdentity.plannedActionId,
      plannedActionKey: clean(input.plannedActionKey),
      authorizationSnapshotVersion: snapshot.snapshot_version,
      classification: clean(message.classification).toUpperCase(),
      firstTouch24h: counters.firstTouch24h,
      firstTouchCap24h: counters.firstTouchCap24h,
      nonReplyPromotional24h: counters.nonReplyPromotional24h,
      nonReplyPromotionalCap24h: counters.nonReplyPromotionalCap24h,
      ...(clean(input.reservationToken) ? { reservationToken: clean(input.reservationToken) } : {}),
      ...(clean(input.state) ? { state: clean(input.state).toUpperCase() } : {}),
    });
    return {
      source: "cold-fair-campaign-cap-ledger",
      observedAt: snapshot.observed_at,
      snapshotVersion: snapshot.snapshot_version,
      value: structuredClone(value),
    };
  };

  return Object.freeze({
    readContact: (input) => canonicalRead(input, (snapshot) => snapshot.contact),
    readPlannedAction: (input) => canonicalRead(input, (snapshot) => snapshot.planned_action),
    readSuppressions: (input) => canonicalRead(input, (snapshot) => snapshot.suppressions),
    readCounters: (input) => canonicalRead(input, (snapshot) => snapshot.counters),
    readPromotionalSendGate: (input) => canonicalRead(input, (snapshot) => snapshot.promotional_send_gate),
    readProviderState: (input) => ledgerRead(input, (identity) => ledger.read(identity)),
    claimPlannedAction: (input) => ledgerRead(input, (identity) => ledger.claim(identity)),
    recordProviderReceipt: (input) => ledgerRead(input, (identity) => ledger.recordProviderReceipt(identity)),
    reserveCampaignCap: (input) => capLedgerRead(input, (capLedger) => capLedger.reserveCampaignCap.bind(capLedger)),
    finalizeCampaignCap: (input) => capLedgerRead(input, (capLedger) => capLedger.finalizeCampaignCap.bind(capLedger)),
  });
}
