// Source-bounded prepared intake. Null IDs are deliberately not fabricated CRM records.
export const konsNaBisClient = Object.freeze({
  name: "Конс на Бі$",
  website: "https://biznes-club-knb.com/",
  programmeUrl: "https://biznes-club-knb.com/zrostannia-u-biznesi-ads",
  policyUrl: "https://biznes-club-knb.com/policies",
  programmeName: "Стратегія керованого зростання у бізнесі",
  durationWeeks: 7,
  format: "online",
  businessType: "business_club_and_business_training",
  countryCode: "UA",
  publicContact: { email: "support@kons-na-bis.com", phone: "+380671155111" },
  relationship: "client_owner_confirmed",
  billing: "not_confirmed",
  designApproval: "pending_owner_approval",
  claimStatus: "not_confirmed",
  technicalReadiness: "demo_concept_prepared",
  connectRecordId: null,
  crmRecordId: null,
  assignedSalesOwnerId: null,
  sourceVerifiedAt: "2026-10-01",
  modules: [
    { key: "applicant_crm", status: "demo_template" },
    { key: "consultation_calendar", status: "demo_template" },
    { key: "cohort_members", status: "demo_template" },
    { key: "assignments_reviews", status: "existing_hermes_academy_capability_fit_unverified" },
    { key: "source_conversion_analytics", status: "demo_template" },
    { key: "hr_recruiting", status: "demo_template" },
    { key: "executive_kpis", status: "demo_template" }
  ]
});