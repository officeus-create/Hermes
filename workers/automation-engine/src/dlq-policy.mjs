const TERMINAL_STATES = new Set([
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

export function classifyDlqDisposition(input = {}) {
  const messageType = String(input.message_type || "").trim();
  const state = String(input.d1_state || "").trim();
  const providerOutcome = String(input.provider_outcome || "NONE").trim().toUpperCase();
  const hasKey = Boolean(String(input.idempotency_key || "").trim());
  const externalEffect = input.external_effect === true;

  if (!messageType) return { disposition: "QUARANTINE", reason: "message_type_missing" };
  if (!hasKey) return { disposition: "QUARANTINE", reason: "idempotency_key_missing" };

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
    return { disposition: "OWNER_ACTION", reason: "external_write_state_ambiguous" };
  }

  if (TERMINAL_STATES.has(state)) {
    return { disposition: "QUARANTINE", reason: "terminal_state_no_replay" };
  }
  if (PRE_SIDE_EFFECT_STATES.has(state) || !state) {
    return { disposition: "SAFE_REDRIVE", reason: "read_only_retryable" };
  }
  return { disposition: "OWNER_ACTION", reason: "unclassified_state" };
}