const TERMINAL_STATES = new Set([
  "SUCCEEDED",
  "COMPLETED",
  "FAILED",
  "published_verified",
  "unknown_outcome_unresolved",
  "readback_unverified",
]);

const PRE_SIDE_EFFECT_STATES = new Set([
  "QUEUED",
  "RETRY_SCHEDULED",
  "reserved",
  "plan_enqueue_failed",
]);

const READ_ONLY_MESSAGE_TYPES = new Set(["job.execute", "publication.readback"]);
const EXTERNAL_WRITE_MESSAGE_TYPES = new Set(["publication.write"]);
const CANONICAL_D1_RECOVERY_STATES = new Set(["RUNNING", "WAITING_FREE_AI"]);
const READBACK_RETRYABLE_STATES = new Set([
  "provider_accepted_readback_pending",
  "unknown_outcome_readback_pending",
]);

export function classifyDlqDisposition(input = {}) {
  const messageType = String(input.message_type || "").trim();
  const state = String(input.d1_state || "").trim();
  const providerOutcome = typeof input.provider_outcome === "string"
    ? input.provider_outcome.trim().toUpperCase()
    : "";
  const hasKey = Boolean(String(input.idempotency_key || "").trim());
  const hasExternalEffect = typeof input.external_effect === "boolean";
  const externalEffect = input.external_effect === true;

  if (!messageType) return { disposition: "QUARANTINE", reason: "message_type_missing" };
  if (!hasKey) return { disposition: "QUARANTINE", reason: "idempotency_key_missing" };
  if (!state) return { disposition: "OWNER_ACTION", reason: "d1_state_missing" };
  if (!hasExternalEffect) return { disposition: "OWNER_ACTION", reason: "external_effect_unknown" };

  if (!READ_ONLY_MESSAGE_TYPES.has(messageType) && !EXTERNAL_WRITE_MESSAGE_TYPES.has(messageType)) {
    return { disposition: "OWNER_ACTION", reason: "message_type_untrusted" };
  }

  if (READ_ONLY_MESSAGE_TYPES.has(messageType) && externalEffect) {
    return { disposition: "OWNER_ACTION", reason: "read_only_message_external_effect_ambiguous" };
  }
  if (messageType === "job.execute" && !externalEffect && CANONICAL_D1_RECOVERY_STATES.has(state)) {
    return { disposition: "CANONICAL_RECOVERY", reason: "d1_state_owns_recovery" };
  }
  if (messageType === "publication.readback" && !externalEffect && READBACK_RETRYABLE_STATES.has(state)) {
    return { disposition: "SAFE_REDRIVE", reason: "readback_retryable" };
  }
  if (EXTERNAL_WRITE_MESSAGE_TYPES.has(messageType) && !externalEffect) {
    return { disposition: "OWNER_ACTION", reason: "external_write_classification_ambiguous" };
  }

  if (externalEffect) {
    if (
      ["UNKNOWN", "ACCEPTED_PENDING", "READBACK_PENDING"].includes(providerOutcome)
      || ["publishing", "provider_accepted_readback_pending", "unknown_outcome_readback_pending"].includes(state)
    ) {
      return { disposition: "READBACK_ONLY", reason: "external_outcome_not_proven" };
    }
    if (TERMINAL_STATES.has(state)) {
      return { disposition: "QUARANTINE", reason: "terminal_state_no_replay" };
    }
    if (PRE_SIDE_EFFECT_STATES.has(state) && providerOutcome === "NONE") {
      return { disposition: "SAFE_REDRIVE", reason: "proven_pre_side_effect_state" };
    }
    if (PRE_SIDE_EFFECT_STATES.has(state) && !providerOutcome) {
      return { disposition: "OWNER_ACTION", reason: "provider_outcome_unknown" };
    }
    return { disposition: "OWNER_ACTION", reason: "external_write_state_ambiguous" };
  }

  if (TERMINAL_STATES.has(state)) {
    return { disposition: "QUARANTINE", reason: "terminal_state_no_replay" };
  }
  if (PRE_SIDE_EFFECT_STATES.has(state)) {
    return { disposition: "SAFE_REDRIVE", reason: "read_only_retryable" };
  }
  return { disposition: "OWNER_ACTION", reason: "unclassified_state" };
}
