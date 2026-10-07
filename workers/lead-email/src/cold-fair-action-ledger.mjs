const RECORD_KEY = "planned-action";
const CAP_RECORD_KEY = "campaign-cap";
export const COLD_FAIR_LEDGER_SCHEMA_VERSION = 1;
export const COLD_FAIR_CAP_LEDGER_SCHEMA_VERSION = 1;
const RECEIPT_STATES = new Set(["ACCEPTED", "UNCERTAIN", "REJECTED"]);
const CAP_FINAL_STATES = new Set(["ACCEPTED", "UNCERTAIN", "RELEASED"]);

const clean = (value) => typeof value === "string" ? value.trim() : "";

const identityFrom = (input = {}) => ({
  contactId: clean(input.contactId),
  plannedActionId: clean(input.plannedActionId),
  plannedActionKey: clean(input.plannedActionKey),
  authorizationSnapshotVersion: clean(input.authorizationSnapshotVersion),
});

const validIdentity = (identity) => Object.values(identity).every(Boolean);

const nonNegativeInt = (value) => Number.isInteger(value) && value >= 0 ? value : null;

const capScopeFrom = (input = {}) => ({
  campaignOwnerId: clean(input.campaignOwnerId),
  businessLine: clean(input.businessLine),
  campaign: clean(input.campaign),
  windowKey: clean(input.windowKey),
});

const validCapScope = (scope) => Object.values(scope).every((value) => value && value.length <= 180);

const sameCapScope = (record, scope) =>
  record.campaignOwnerId === scope.campaignOwnerId
  && record.businessLine === scope.businessLine
  && record.campaign === scope.campaign
  && record.windowKey === scope.windowKey;

const capReservationIdentity = (input = {}) => ({
  plannedActionId: clean(input.plannedActionId),
  plannedActionKey: clean(input.plannedActionKey),
  authorizationSnapshotVersion: clean(input.authorizationSnapshotVersion),
});

const sameCapReservation = (record, identity) =>
  record.plannedActionId === identity.plannedActionId
  && record.plannedActionKey === identity.plannedActionKey
  && record.authorizationSnapshotVersion === identity.authorizationSnapshotVersion;

export function coldFairCapScopeKey(input = {}) {
  const scope = capScopeFrom(input);
  if (!validCapScope(scope)) return null;
  return `cold-fair-cap:v1:${Object.values(scope)
    .map((part) => `${part.length}:${part.toLowerCase()}`)
    .join("|")}`;
}

const sameIdentity = (record, identity) =>
  record.contactId === identity.contactId
  && record.plannedActionId === identity.plannedActionId
  && record.plannedActionKey === identity.plannedActionKey
  && record.authorizationSnapshotVersion === identity.authorizationSnapshotVersion;

const publicRecord = (record) => record ? structuredClone(record) : null;
const json = (status, payload) => Response.json(payload, {
  status,
  headers: { "Cache-Control": "no-store" },
});

export class ColdFairActionLedgerCore {
  constructor(ctx, { now = () => Date.now() } = {}) {
    if (!ctx?.storage || typeof ctx.storage.transaction !== "function") {
      throw new TypeError("Durable Object storage is required");
    }
    this.storage = ctx.storage;
    this.now = now;
  }

  async read(input = {}) {
    const identity = identityFrom(input);
    if (!validIdentity(identity)) throw new TypeError("complete planned action identity is required");
    const record = await this.storage.get(RECORD_KEY);
    if (!record) return { ...identity, state: "NOT_ATTEMPTED" };
    if (!sameIdentity(record, identity)) throw new Error("planned_action_identity_conflict");
    return publicRecord(record);
  }

  async claim(input = {}) {
    const identity = identityFrom(input);
    if (!validIdentity(identity)) throw new TypeError("complete planned action identity is required");
    return this.storage.transaction(async (transaction) => {
      const existing = await transaction.get(RECORD_KEY);
      if (existing) {
        if (!sameIdentity(existing, identity)) throw new Error("planned_action_identity_conflict");
        return { ...publicRecord(existing), claimed: false };
      }

      const now = this.now();
      const record = {
        schemaVersion: COLD_FAIR_LEDGER_SCHEMA_VERSION,
        ...identity,
        state: "SENDING",
        attemptToken: crypto.randomUUID(),
        providerMessageId: null,
        providerThreadId: null,
        createdAt: now,
        updatedAt: now,
      };
      await transaction.put(RECORD_KEY, record);
      return { ...publicRecord(record), claimed: true };
    });
  }

  async recordProviderReceipt(input = {}) {
    const identity = identityFrom(input);
    const attemptToken = clean(input.attemptToken);
    const state = clean(input.state).toUpperCase();
    const providerMessageId = clean(input.providerMessageId) || null;
    const providerThreadId = clean(input.providerThreadId) || null;
    if (!validIdentity(identity) || !attemptToken || !RECEIPT_STATES.has(state)) {
      throw new TypeError("valid provider receipt is required");
    }
    if (state === "ACCEPTED" && (!providerMessageId || !providerThreadId)) {
      throw new TypeError("accepted provider identity is required");
    }

    return this.storage.transaction(async (transaction) => {
      const record = await transaction.get(RECORD_KEY);
      if (!record || !sameIdentity(record, identity) || record.state !== "SENDING" || record.attemptToken !== attemptToken) {
        throw new Error("receipt_compare_and_swap_failed");
      }
      record.state = state;
      record.providerMessageId = providerMessageId;
      record.providerThreadId = providerThreadId;
      record.updatedAt = this.now();
      await transaction.put(RECORD_KEY, record);
      return { ...publicRecord(record), persisted: true };
    });
  }

  async reserveCampaignCap(input = {}) {
    const scope = capScopeFrom(input);
    const reservationIdentity = capReservationIdentity(input);
    const classification = clean(input.classification).toUpperCase();
    const firstTouch24h = nonNegativeInt(input.firstTouch24h);
    const firstTouchCap24h = nonNegativeInt(input.firstTouchCap24h);
    const nonReplyPromotional24h = nonNegativeInt(input.nonReplyPromotional24h);
    const nonReplyPromotionalCap24h = nonNegativeInt(input.nonReplyPromotionalCap24h);
    if (!validCapScope(scope) || !validIdentity(reservationIdentity)
      || !["FIRST_TOUCH", "PROMOTIONAL_FOLLOW_UP"].includes(classification)
      || [firstTouch24h, firstTouchCap24h, nonReplyPromotional24h, nonReplyPromotionalCap24h]
        .some((value) => value === null)) {
      throw new TypeError("valid campaign cap reservation is required");
    }

    return this.storage.transaction(async (transaction) => {
      let state = await transaction.get(CAP_RECORD_KEY);
      if (!state) {
        state = {
          schemaVersion: COLD_FAIR_CAP_LEDGER_SCHEMA_VERSION,
          ...scope,
          firstTouch24h,
          firstTouchCap24h,
          nonReplyPromotional24h,
          nonReplyPromotionalCap24h,
          reservations: {},
          createdAt: this.now(),
          updatedAt: this.now(),
        };
      } else {
        if (!sameCapScope(state, scope)) throw new Error("campaign_cap_scope_conflict");
        state.firstTouch24h = Math.max(state.firstTouch24h, firstTouch24h);
        state.nonReplyPromotional24h = Math.max(state.nonReplyPromotional24h, nonReplyPromotional24h);
        state.firstTouchCap24h = Math.min(state.firstTouchCap24h, firstTouchCap24h);
        state.nonReplyPromotionalCap24h = Math.min(state.nonReplyPromotionalCap24h, nonReplyPromotionalCap24h);
      }

      const existing = state.reservations[reservationIdentity.plannedActionId];
      if (existing) {
        if (!sameCapReservation(existing, reservationIdentity)) throw new Error("campaign_cap_action_conflict");
        return { ...publicRecord(existing), reserved: false, reason: "campaign_cap_already_reserved" };
      }

      const active = Object.values(state.reservations).filter((reservation) => reservation.state !== "RELEASED");
      const reservedFirstTouch = active.filter((reservation) => reservation.classification === "FIRST_TOUCH").length;
      const reservedPromotional = active.length;
      if (classification === "FIRST_TOUCH" && state.firstTouch24h + reservedFirstTouch >= state.firstTouchCap24h) {
        return { reserved: false, reason: "first_touch_cap_reached" };
      }
      if (state.nonReplyPromotional24h + reservedPromotional >= state.nonReplyPromotionalCap24h) {
        return { reserved: false, reason: "non_reply_promotional_cap_reached" };
      }

      const now = this.now();
      const reservation = {
        ...reservationIdentity,
        classification,
        state: "RESERVED",
        reservationToken: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      state.reservations[reservationIdentity.plannedActionId] = reservation;
      state.updatedAt = now;
      await transaction.put(CAP_RECORD_KEY, state);
      return { ...publicRecord(reservation), reserved: true };
    });
  }

  async finalizeCampaignCap(input = {}) {
    const scope = capScopeFrom(input);
    const reservationIdentity = capReservationIdentity(input);
    const reservationToken = clean(input.reservationToken);
    const state = clean(input.state).toUpperCase();
    if (!validCapScope(scope) || !validIdentity(reservationIdentity) || !reservationToken || !CAP_FINAL_STATES.has(state)) {
      throw new TypeError("valid campaign cap finalization is required");
    }

    return this.storage.transaction(async (transaction) => {
      const capRecord = await transaction.get(CAP_RECORD_KEY);
      const reservation = capRecord?.reservations?.[reservationIdentity.plannedActionId];
      if (!capRecord || !sameCapScope(capRecord, scope) || !reservation
        || !sameCapReservation(reservation, reservationIdentity)
        || reservation.state !== "RESERVED" || reservation.reservationToken !== reservationToken) {
        throw new Error("campaign_cap_compare_and_swap_failed");
      }
      reservation.state = state;
      reservation.updatedAt = this.now();
      capRecord.updatedAt = reservation.updatedAt;
      await transaction.put(CAP_RECORD_KEY, capRecord);
      return { ...publicRecord(reservation), persisted: true };
    });
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    const operations = {
      "/internal/cold-fair-ledger/read": (input) => this.read(input),
      "/internal/cold-fair-ledger/claim": (input) => this.claim(input),
      "/internal/cold-fair-ledger/receipt": (input) => this.recordProviderReceipt(input),
      "/internal/cold-fair-ledger/cap-reserve": (input) => this.reserveCampaignCap(input),
      "/internal/cold-fair-ledger/cap-finalize": (input) => this.finalizeCampaignCap(input),
    };
    if (request.method !== "POST" || !operations[path]) return json(404, { ok: false, error: "not_found" });
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object") return json(400, { ok: false, error: "invalid_json" });
    try {
      return json(200, { ok: true, value: await operations[path](input) });
    } catch (error) {
      const message = clean(error?.message) || "ledger_unavailable";
      return json(message === "receipt_compare_and_swap_failed" || message === "planned_action_identity_conflict"
        || message === "campaign_cap_compare_and_swap_failed" || message === "campaign_cap_action_conflict"
        || message === "campaign_cap_scope_conflict" ? 409 : 400, {
        ok: false,
        error: message,
      });
    }
  }
}

export function createColdFairActionLedgerClient(stub) {
  if (!stub || typeof stub.fetch !== "function") throw new TypeError("Cold Fair Durable Object stub is required");
  const call = async (operation, input) => {
    const response = await stub.fetch(new Request(`https://cold-fair-ledger.internal/internal/cold-fair-ledger/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok !== true || !payload.value) throw new Error(payload.error || "cold_fair_ledger_unavailable");
    return payload.value;
  };
  return Object.freeze({
    read: (input) => call("read", input),
    claim: (input) => call("claim", input),
    recordProviderReceipt: (input) => call("receipt", input),
    reserveCampaignCap: (input) => call("cap-reserve", input),
    finalizeCampaignCap: (input) => call("cap-finalize", input),
  });
}
