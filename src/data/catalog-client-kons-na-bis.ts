// Source-bounded prepared intake. Null IDs are deliberately not fabricated CRM records.
export const konsNaBisClient = Object.freeze({
  name: "Конс на Бі$",
  website: "https://kons-na-bis.com/",
  programmeUrl: "https://biznes-club-knb.com/zrostannia-u-biznesi",
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
    exactClientTestAssignment: "recovered_2026-10-01_18:24",
    candidateAssessment: {
      receivedAt: "2026-10-01T18:24:00+03:00",
      deadline: "2026-10-02T09:00:00+03:00",
      submissionFormat: "Google Docs",
      visualFormat: "MindMap_or_scheme",
      task1: "Analyze any KNB social channel and explain what you would implement immediately as the direction lead and which growth paths you see.",
      task2: "Build a marketing acquisition funnel and offer for the seven-week Managed Business Growth Strategy program.",
      socialSources: {
        instagram: "https://www.instagram.com/konsnabis",
        youtube: "https://youtube.com/@oleksandr_morozov_knb",
        tiktok: "https://www.tiktok.com/@konsnabis",
        facebook: "https://www.facebook.com/share/17jqya6Sot/?mibextid=wwXIfr",
        threads: "https://www.threads.com/@konsnabis",
        telegram: "https://t.me/+XSUYZOYC-Ws0OWFi"
      },
      referenceFormProvided: true,
      referenceFormMustNotBeSubmittedByHermes: true
    }
  }
});
