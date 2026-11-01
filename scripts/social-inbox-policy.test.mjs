import assert from "node:assert/strict";
import {
  normalizeSocialBusinessLane,
  normalizeSocialInboxClassification,
  socialInboxPolicyDecision,
} from "../functions/api/_lib/social-inbox-policy.mjs";

assert.equal(normalizeSocialBusinessLane("hermes_logistics"), "HERMES_LOGISTICS");
assert.equal(normalizeSocialBusinessLane("progressopro"), "PROGRESSOPRO");
assert.equal(normalizeSocialBusinessLane("academy"), null);
assert.equal(normalizeSocialInboxClassification("carrier_lead"), "CARRIER_LEAD");
assert.equal(normalizeSocialInboxClassification("not-real"), "UNKNOWN");

assert.deepEqual(
  socialInboxPolicyDecision({
    business_lane:"HERMES_LOGISTICS",
    source:"keyword_search",
    classification:"CARRIER_LEAD",
    confidence:0.99,
    approved_faq_policy_id:"faq-1",
    approved_reply_template_id:"tpl-1",
  }).decision,
  "OPPORTUNITY_REVIEW",
);

for (const flag of ["RATES","INCOME","GUARANTEE","CONTRACT","LEGAL","COMPLAINT","PRIVACY","PAYMENT"]) {
  const result=socialInboxPolicyDecision({
    business_lane:"HERMES_LOGISTICS",
    source:"owned_reply",
    classification:"QUESTION",
    confidence:0.99,
    approved_faq_policy_id:"faq-1",
    approved_reply_template_id:"tpl-1",
    risk_flags:[flag],
  });
  assert.equal(result.decision,"HUMAN_REVIEW",flag);
  assert.equal(result.reply_authorized,false,flag);
}

assert.equal(socialInboxPolicyDecision({
  business_lane:"PROGRESSOPRO",source:"mention",classification:"COMPLAINT",
}).decision,"HUMAN_REVIEW");
assert.equal(socialInboxPolicyDecision({
  business_lane:"PROGRESSOPRO",source:"mention",classification:"UNKNOWN",
}).decision,"HUMAN_REVIEW");
assert.equal(socialInboxPolicyDecision({
  business_lane:"PROGRESSOPRO",source:"owned_reply",classification:"SPAM",
}).decision,"IGNORE");
assert.equal(socialInboxPolicyDecision({
  business_lane:"PROGRESSOPRO",source:"owned_reply",classification:"CARRIER_LEAD",
}).decision,"HUMAN_REVIEW");

const carrier=socialInboxPolicyDecision({
  business_lane:"HERMES_LOGISTICS",
  source:"owned_reply",
  classification:"CARRIER_LEAD",
  secure_intake_url:"https://hermeslogisticsus.com/carriers/",
});
assert.equal(carrier.decision,"DRAFT_FOR_REVIEW");
assert.equal(carrier.secure_intake_required,true);
assert.equal(carrier.reply_authorized,false);

const safe=socialInboxPolicyDecision({
  business_lane:"PROGRESSOPRO",
  source:"owned_reply",
  classification:"QUESTION",
  confidence:0.97,
  approved_faq_policy_id:"faq:websites:v1",
  approved_reply_template_id:"reply:websites:v1",
});
assert.equal(safe.decision,"SAFE_AUTO_REPLY");
assert.equal(safe.reply_authorized,true);

for (const unsafe of [
  {confidence:0.94,approved_faq_policy_id:"faq-1",approved_reply_template_id:"tpl-1"},
  {confidence:0.99,approved_faq_policy_id:"",approved_reply_template_id:"tpl-1"},
  {confidence:0.99,approved_faq_policy_id:"faq-1",approved_reply_template_id:""},
]) {
  const result=socialInboxPolicyDecision({
    business_lane:"PROGRESSOPRO",source:"owned_reply",classification:"QUESTION",...unsafe,
  });
  assert.equal(result.decision,"DRAFT_FOR_REVIEW");
  assert.equal(result.reply_authorized,false);
}

const invalidLane=socialInboxPolicyDecision({
  business_lane:"academy",source:"owned_reply",classification:"QUESTION",
});
assert.equal(invalidLane.ok,false);
assert.equal(invalidLane.decision,"HUMAN_REVIEW");

console.log("social inbox deterministic policy PASS — SAFE_AUTO is narrow and keyword/high-risk fail closed");
