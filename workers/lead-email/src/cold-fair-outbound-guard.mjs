const EMAIL_ELIGIBILITY = new Set(["ELIGIBLE", "HOLD", "SUPPRESSED", "REPLY_ONLY", "TRANSACTIONAL_ONLY"]);
const MESSAGE_CLASSES = new Set(["FIRST_TOUCH", "PROMOTIONAL_FOLLOW_UP", "REPLY", "TRANSACTIONAL"]);

const clean = (value) => typeof value === "string" ? value.trim() : "";
const normalizedEmail = (value) => clean(value).toLowerCase();
const nonNegativeInt = (value) => Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;

export const COLD_FAIR_MESSAGE_CLASSES = Object.freeze([...MESSAGE_CLASSES]);

export function coldFairPlannedActionKey(input = {}) {
  const contactId = clean(input.contactId);
  const businessLine = clean(input.businessLine);
  const campaign = clean(input.campaign);
  const templateVersion = clean(input.templateVersion);
  const plannedActionId = clean(input.plannedActionId);
  if (![contactId, businessLine, campaign, templateVersion, plannedActionId].every(Boolean)) return null;
  return [contactId, businessLine, campaign, templateVersion, plannedActionId]
    .map((part) => part.replace(/\s+/g, " ").toLowerCase())
    .join("::");
}

const block = (reason, extra = {}) => ({ decision: "BLOCK", reason, would_send: false, ...extra });
const allow = (reason, extra = {}) => ({ decision: "ALLOW", reason, would_send: true, ...extra });
const reconcile = (reason, extra = {}) => ({ decision: "RECONCILE", reason, would_send: false, ...extra });

export function evaluateColdFairPreSend(snapshot = {}) {
  const contact = snapshot.contact && typeof snapshot.contact === "object" ? snapshot.contact : {};
  const message = snapshot.message && typeof snapshot.message === "object" ? snapshot.message : {};
  const counters = snapshot.counters && typeof snapshot.counters === "object" ? snapshot.counters : {};
  const provider = snapshot.provider && typeof snapshot.provider === "object" ? snapshot.provider : {};

  const contactId = clean(contact.contactId);
  const email = normalizedEmail(contact.email);
  const eligibility = clean(contact.emailEligibility).toUpperCase();
  const permission = clean(contact.contactPermission).toUpperCase();
  const duplicateStatus = clean(contact.duplicateStatus).toUpperCase();
  const messageClass = clean(message.classification).toUpperCase();
  const plannedActionKey = coldFairPlannedActionKey({
    contactId,
    businessLine: message.businessLine,
    campaign: message.campaign,
    templateVersion: message.templateVersion,
    plannedActionId: message.plannedActionId,
  });

  if (!contactId) return block("missing_contact_id");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return block("missing_or_invalid_email");
  if (!EMAIL_ELIGIBILITY.has(eligibility)) return block("unknown_email_eligibility");
  if (!MESSAGE_CLASSES.has(messageClass)) return block("unknown_message_class");
  if (!plannedActionKey) return block("missing_planned_action_identity");

  if (/POSSIBLE DUPLICATE|DUPLICATE HOLD|AMBIGUOUS/.test(duplicateStatus)) {
    return block("identity_review_required", { planned_action_key: plannedActionKey });
  }

  if (
    eligibility === "SUPPRESSED" ||
    permission === "OPTED OUT" ||
    permission === "EXPLICIT NO" ||
    contact.doNotContact === true ||
    contact.permanentBounce === true ||
    contact.notInterested === true ||
    contact.campaignHold === true
  ) {
    return block("suppressed_or_do_not_contact", { planned_action_key: plannedActionKey });
  }

  if (message.requiredFactsPresent !== true) {
    return block("missing_required_facts", { planned_action_key: plannedActionKey });
  }

  if (provider.state === "AMBIGUOUS") {
    return reconcile("ambiguous_provider_state", { planned_action_key: plannedActionKey });
  }
  if (provider.state === "DELIVERED" && provider.plannedActionKey === plannedActionKey) {
    return block("already_delivered", { planned_action_key: plannedActionKey });
  }

  if (eligibility === "HOLD") {
    return block("contact_hold", { planned_action_key: plannedActionKey });
  }

  if (eligibility === "REPLY_ONLY") {
    if (messageClass !== "REPLY") return block("reply_only_contact", { planned_action_key: plannedActionKey });
    if (message.freshInboundNeed !== true || !clean(message.providerThreadId) || !clean(message.replyToMessageId)) {
      return block("reply_requires_fresh_inbound_thread", { planned_action_key: plannedActionKey });
    }
    return allow("narrow_same_thread_reply", { planned_action_key: plannedActionKey });
  }

  if (eligibility === "TRANSACTIONAL_ONLY") {
    if (messageClass !== "TRANSACTIONAL" || message.authorizedTransaction !== true) {
      return block("transactional_only_contact", { planned_action_key: plannedActionKey });
    }
    if (message.containsPromotion === true) {
      return block("transactional_cross_sell_blocked", { planned_action_key: plannedActionKey });
    }
    return allow("authorized_transaction", { planned_action_key: plannedActionKey });
  }

  if (messageClass === "REPLY") {
    if (message.freshInboundNeed !== true || !clean(message.providerThreadId) || !clean(message.replyToMessageId)) {
      return block("reply_requires_fresh_inbound_thread", { planned_action_key: plannedActionKey });
    }
    return allow("eligible_same_thread_reply", { planned_action_key: plannedActionKey });
  }

  if (messageClass === "TRANSACTIONAL") {
    if (message.authorizedTransaction !== true || message.containsPromotion === true) {
      return block("transaction_not_authorized", { planned_action_key: plannedActionKey });
    }
    return allow("eligible_authorized_transaction", { planned_action_key: plannedActionKey });
  }

  if (clean(snapshot.promotionalSendGate).toUpperCase() !== "ALLOW") {
    return block("global_promotional_gate_blocked", { planned_action_key: plannedActionKey });
  }

  const firstTouch = nonNegativeInt(counters.firstTouch24h);
  const firstTouchCap = nonNegativeInt(counters.firstTouchCap24h);
  const promotional = nonNegativeInt(counters.nonReplyPromotional24h);
  const promotionalCap = nonNegativeInt(counters.nonReplyPromotionalCap24h);
  if ([firstTouch, firstTouchCap, promotional, promotionalCap].some((value) => value === null)) {
    return block("counter_state_missing", { planned_action_key: plannedActionKey });
  }
  if (messageClass === "FIRST_TOUCH" && firstTouch >= firstTouchCap) {
    return block("first_touch_cap_reached", { planned_action_key: plannedActionKey });
  }
  if (promotional >= promotionalCap) {
    return block("non_reply_promotional_cap_reached", { planned_action_key: plannedActionKey });
  }

  return allow("promotional_pre_send_allowed", { planned_action_key: plannedActionKey });
}
