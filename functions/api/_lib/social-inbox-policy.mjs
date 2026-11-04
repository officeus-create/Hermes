// Deterministic Social Inbox policy gate.
// VIKTOR may propose semantic classification and copy, but this module decides
// whether that proposal is eligible for automation. It never calls a provider.

export const SOCIAL_BUSINESS_LANES = Object.freeze(["HERMES_LOGISTICS", "PROGRESSOPRO"]);
export const SOCIAL_INBOX_CLASSIFICATIONS = Object.freeze([
  "CARRIER_LEAD",
  "SHIPPER_DEALER",
  "JOB_CANDIDATE",
  "QUESTION",
  "COMPLAINT",
  "SPAM",
  "UNKNOWN",
]);
export const SOCIAL_INBOX_DECISIONS = Object.freeze([
  "SAFE_AUTO_REPLY",
  "DRAFT_FOR_REVIEW",
  "HUMAN_REVIEW",
  "IGNORE",
  "OPPORTUNITY_REVIEW",
]);

const CLASS_SET = new Set(SOCIAL_INBOX_CLASSIFICATIONS);
const LANE_SET = new Set(SOCIAL_BUSINESS_LANES);
const HIGH_RISK_FLAGS = new Set([
  "RATES",
  "INCOME",
  "GUARANTEE",
  "CONTRACT",
  "LEGAL",
  "COMPLIANCE",
  "COMPLAINT",
  "PRIVACY",
  "PAYMENT",
  "SAFETY",
]);

const clean = (value, max = 160) => String(value ?? "").trim().slice(0, max);

export function normalizeSocialBusinessLane(value) {
  const lane=clean(value,64).toUpperCase();
  return LANE_SET.has(lane) ? lane : null;
}

export function normalizeSocialInboxClassification(value) {
  const type=clean(value,64).toUpperCase();
  return CLASS_SET.has(type) ? type : "UNKNOWN";
}

export function socialInboxPolicyDecision(input = {}) {
  const lane=normalizeSocialBusinessLane(input.business_lane);
  if (!lane) {
    return { ok:false, decision:"HUMAN_REVIEW", reason:"business_lane_invalid", reply_authorized:false };
  }

  const source=clean(input.source,64).toLowerCase();
  const classification=normalizeSocialInboxClassification(input.classification);
  const flags=new Set((Array.isArray(input.risk_flags) ? input.risk_flags : [])
    .map(value=>clean(value,64).toUpperCase()).filter(Boolean));
  const confidence=Number.isFinite(Number(input.confidence)) ? Number(input.confidence) : null;
  const approvedFaqPolicy=clean(input.approved_faq_policy_id,120);
  const approvedTemplate=clean(input.approved_reply_template_id,120);
  const secureIntakeUrl=clean(input.secure_intake_url,1200);

  // Public keyword discovery is research only. It can create a review candidate,
  // never an autonomous reply to a stranger.
  if (source === "keyword_search") {
    return {
      ok:true, lane, classification, decision:"OPPORTUNITY_REVIEW",
      reason:"keyword_search_never_auto_reply", reply_authorized:false,
    };
  }

  if ([...flags].some(flag=>HIGH_RISK_FLAGS.has(flag))) {
    return {
      ok:true, lane, classification, decision:"HUMAN_REVIEW",
      reason:"high_risk_flag", reply_authorized:false,
    };
  }

  if (classification === "COMPLAINT" || classification === "UNKNOWN") {
    return {
      ok:true, lane, classification, decision:"HUMAN_REVIEW",
      reason:classification === "COMPLAINT" ? "complaint_requires_human" : "unknown_requires_human",
      reply_authorized:false,
    };
  }

  if (classification === "SPAM") {
    return {
      ok:true, lane, classification, decision:"IGNORE",
      reason:"spam_no_reply", reply_authorized:false,
      moderation_action_requires_policy:true,
    };
  }

  if (classification === "SHIPPER_DEALER" || classification === "JOB_CANDIDATE") {
    return {
      ok:true, lane, classification, decision:"DRAFT_FOR_REVIEW",
      reason:"business_or_employment_intent_requires_review", reply_authorized:false,
    };
  }

  if (classification === "CARRIER_LEAD") {
    if (lane !== "HERMES_LOGISTICS") {
      return {
        ok:true, lane, classification, decision:"HUMAN_REVIEW",
        reason:"carrier_intent_cross_lane_mismatch", reply_authorized:false,
      };
    }
    return {
      ok:true, lane, classification, decision:"DRAFT_FOR_REVIEW",
      reason:secureIntakeUrl ? "carrier_intake_draft_requires_review" : "secure_intake_required",
      reply_authorized:false,
      secure_intake_required:true,
    };
  }

  // SAFE_AUTO is intentionally narrow: a QUESTION only, no risky flags, high
  // confidence, and both an independently approved FAQ policy and reply template.
  if (
    classification === "QUESTION"
    && confidence !== null
    && confidence >= 0.95
    && approvedFaqPolicy
    && approvedTemplate
  ) {
    return {
      ok:true, lane, classification, decision:"SAFE_AUTO_REPLY",
      reason:"approved_low_risk_faq",
      reply_authorized:true,
      approved_faq_policy_id:approvedFaqPolicy,
      approved_reply_template_id:approvedTemplate,
    };
  }

  return {
    ok:true, lane, classification, decision:"DRAFT_FOR_REVIEW",
    reason:"faq_not_independently_approved",
    reply_authorized:false,
  };
}
