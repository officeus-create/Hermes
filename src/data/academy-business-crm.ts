import { konsNaBisClient } from "./catalog-client-kons-na-bis";

export type AcademyCrmEvidence =
  | "official_program"
  | "public_vacancy"
  | "existing_hermes_capability"
  | "hermes_inference"
  | "demo_placeholder";

export const academyBusinessCrmTemplate = Object.freeze({
  version: "academy-business-crm-v1",
  purpose: "Reusable CRM workspace for business academies, clubs and course operators.",
  stages: [
    "New lead",
    "Qualified",
    "Consultation booked",
    "Consultation completed",
    "Program selected",
    "Decision / follow-up",
    "Enrolled",
    "Active learner / member",
    "Completed / alumni",
    "Renewal / next program"
  ],
  modules: [
    { key: "overview", label: "Executive overview" },
    { key: "marketing", label: "Marketing & attribution" },
    { key: "sales", label: "Sales CRM" },
    { key: "programs", label: "Programs & cohorts" },
    { key: "students", label: "Students / members" },
    { key: "learning", label: "Learning & reviews" },
    { key: "hr", label: "HR & vacancies" },
    { key: "analytics", label: "Analytics" },
    { key: "catalog", label: "Catalog & website" }
  ],
  metrics: [
    { key: "revenue", label: "Revenue", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "profit", label: "Profit", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "lead_to_sale", label: "Lead → sale conversion", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "average_check", label: "Average check", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "sales_productivity", label: "Sales productivity", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "cac", label: "CAC", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "ltv", label: "LTV", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "romi", label: "ROMI", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "channel_efficiency", label: "Channel efficiency", evidence: "public_vacancy" as AcademyCrmEvidence, value: null },
    { key: "enrollment", label: "Enrollment conversion", evidence: "hermes_inference" as AcademyCrmEvidence, value: null },
    { key: "completion", label: "Program completion", evidence: "existing_hermes_capability" as AcademyCrmEvidence, value: null },
    { key: "renewal", label: "Renewal / next program", evidence: "hermes_inference" as AcademyCrmEvidence, value: null }
  ]
});

export const konsNaBisAcademyCrm = Object.freeze({
  template: academyBusinessCrmTemplate.version,
  client: konsNaBisClient,
  demoOnly: true,
  liveWrites: false,
  exactClientTestAssignmentRecovered: false,
  sourceBoundary: "Public operating signals + already prepared Hermes concept. Unknown private requirements are not invented.",
  programs: [
    {
      id: "managed-growth",
      name: "Стратегія керованого зростання у бізнесі",
      duration: "7 weeks",
      format: "online",
      features: ["online lessons", "practical assignments", "weekly homework review", "weekly expert / VIP sessions", "private participant group", "recordings in personal cabinet"],
      evidence: "official_program" as AcademyCrmEvidence,
      source: "https://biznes-club-knb.com/zrostannia-u-biznesi-ads"
    },
    {
      id: "hiring",
      name: "Найм під ключ",
      duration: "5 weeks",
      format: "online",
      features: ["recruiting system", "adaptation", "team building"],
      evidence: "official_program" as AcademyCrmEvidence,
      source: "public KNB program page"
    },
    {
      id: "instagram",
      name: "Instagram під ключ 3.0",
      duration: "5 weeks",
      format: "video / practical",
      features: ["Instagram sales system", "content / traffic workflow"],
      evidence: "official_program" as AcademyCrmEvidence,
      source: "public KNB program page"
    },
    {
      id: "sales-system",
      name: "Продажі як система",
      duration: "program",
      format: "online",
      features: ["lead flow", "conversion to purchase", "fulfillment / customer base"],
      evidence: "official_program" as AcademyCrmEvidence,
      source: "public KNB program page"
    }
  ],
  vacancySignals: [
    {
      id: "head-of-marketing",
      title: "Керівник відділу маркетингу",
      published: "2026-09-25",
      compensation: "250 000–500 000 UAH",
      source: "https://robota.ua/company4890229/vacancy11308040",
      crmNeeds: ["marketing strategy", "team ownership", "channels and funnels", "hypothesis backlog", "budget efficiency", "analytics", "brand / content / media", "marketing ↔ sales ↔ product sync", "CAC", "LTV", "ROMI", "revenue", "profit"]
    },
    {
      id: "head-of-sales",
      title: "Керівник відділу продажу",
      published: "2026-09-25",
      compensation: "250 000–500 000 UAH",
      source: "https://robota.ua/company4890229/vacancy11308016",
      crmNeeds: ["four-level sales structure", "sales strategy", "manager hierarchy", "conversion", "average check", "productivity", "profitability", "management analytics", "department synchronization"]
    },
    {
      id: "sales-manager",
      title: "Менеджер з продажу / куратор навчальної програми",
      published: "2026-09-29",
      compensation: "60 000–120 000 UAH",
      source: "https://robota.ua/company4890229/vacancy11196301",
      crmNeeds: ["warm leads", "program matching", "deal stages", "CRM notes", "long-term relationship", "KPI", "next action"]
    },
    {
      id: "sales-education",
      title: "Sales-менеджер (освітні послуги)",
      published: "2026-09-20",
      compensation: "60 000–120 000 UAH",
      source: "https://robota.ua/company4890229/vacancy11224797",
      crmNeeds: ["consultation", "needs discovery", "solution selection", "decision follow-up", "personal sales plan", "CRM reporting"]
    },
    {
      id: "recruiter",
      title: "Рекрутер",
      published: "2026-09-29",
      compensation: "from 40 000 UAH",
      source: "https://robota.ua/company4890229/vacancy11342667",
      crmNeeds: ["vacancy pipeline", "initial communication", "interview", "potential / thinking / culture assessment", "candidate stages", "adaptation"]
    }
  ],
  demoEntities: {
    leads: [
      { name: "Demo lead A", source: "Instagram", stage: "Qualified", program: "Managed growth", owner: "Sales 01", next: "Consultation" },
      { name: "Demo lead B", source: "Referral", stage: "Consultation completed", program: "Sales system", owner: "Sales 02", next: "Follow-up" },
      { name: "Demo lead C", source: "Website", stage: "Program selected", program: "Hiring", owner: "Sales 03", next: "Decision" }
    ],
    cohorts: [
      { name: "Demo cohort", program: "Managed growth", state: "Planning", learners: "—", completion: "—" }
    ],
    candidates: [
      { role: "Sales manager", stage: "Interview", score: "demo", next: "Structured review" },
      { role: "Recruiter", stage: "Screening", score: "demo", next: "Interview" }
    ]
  }
});

export const hermesAcademyCrmSeed = Object.freeze({
  template: academyBusinessCrmTemplate.version,
  business: "Hermes Business Academy",
  reuse: [
    "/services/hermes-connect/academy/dashboard/",
    "/services/hermes-connect/academy/submissions/",
    "/services/hermes-connect/academy/progression/",
    "/services/hermes-connect/academy/support/",
    "/services/hermes-connect/academy/reviewer/"
  ],
  rule: "Reuse existing Academy identity, curriculum, evidence, support and reviewer boundaries. Do not create a second Academy runtime."
});