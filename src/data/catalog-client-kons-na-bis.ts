// Source-bounded prepared intake. Null IDs are deliberately not fabricated CRM records.
export const konsNaBisClient = Object.freeze({
  name: "Конс на Бі$",
  website: "https://kons-na-bis.com/",
  programmeUrl: "https://biznes-club-knb.com/zrostannia-u-biznesi-ads",
  programmeName: "Стратегія керованого зростання у бізнесі",
  durationWeeks: 7,
  format: "online",
  businessType: "business_club_and_business_training",
  countryCode: "UA",
  relationship: "client_owner_confirmed",
  billing: "not_confirmed",
  designApproval: "pending_owner_approval",
  claimStatus: "not_confirmed",
  technicalReadiness: "isolated_demo_prepared",
  connectRecordId: null,
  crmRecordId: null,
  assignedSalesOwnerId: null,
  sourceVerifiedAt: "2026-10-01",
  verifiedNeeds: {
    programme: ["online_lessons","assignments","weekly_review","vip_sessions","private_group","recordings"],
    sales: ["warm_leads","consultations","needs_discovery","purchase_follow_through","sales_plan","crm_reporting"],
    marketing: ["funnel_analytics","cac","ltv","romi","revenue_alignment","content_and_media"],
    hr: ["recruiting_pipeline","candidate_stage_tracking"]
  },
  evidence: {
    warmLeadsPerSalesManager: "20-25",
    exactClientTestAssignment: "not_recovered_from_source_thread"
  }
});
