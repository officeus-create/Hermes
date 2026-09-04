import type { PathDetail } from "./site";

export const academyPublicPathOverrides: Partial<PathDetail> = {
  title: "Learn practical skills across the departments that run a real business.",
  body: "Five connected learning tracks cover U.S. logistics, marketing, IT and AI, sales, and operating leadership.",
  points: [
    "U.S. Logistics Operations",
    "Marketing · IT & AI · Sales",
    "COO / Operations and leadership",
  ],
  audience: "For learners and working professionals building practical capability for U.S.-market and international business work.",
  overview: "Hermes Academy is the education layer of the Hermes ecosystem. The public learning system now presents five connected tracks: U.S. Logistics Operations, Marketing, IT & AI, Sales, and COO / Operations. Logistics and Marketing already have dedicated detailed course pages; IT & AI, Sales, and COO / Operations are currently presented as Academy learning tracks and will receive dedicated course pages as their exact public curriculum and cohort offers are approved. Paid cohorts and free practice opportunities remain separate participation models. Training and practice do not guarantee employment, income, clients, certification, promotion, or future paid work.",
  seoTitle: "Logistics, Marketing, IT, Sales & Operations Training | Hermes Academy",
  seoDescription: "Practical Academy tracks in U.S. logistics, marketing, IT and AI, sales, and operating leadership with review-based learning and no employment or income guarantee.",
  seoServiceName: "Practical logistics, marketing, IT, sales, and operations education",
  localFocus: "U.S.-market and international professional learning · Email coordination only",
  offerings: [
    { title: "U.S. Logistics Operations", body: "Dispatch foundations, carrier and broker communication, documents, equipment logic, load lifecycle, negotiation practice, and operating routines for the U.S. market." },
    { title: "Marketing", body: "Positioning, websites, SEO/GEO, content, campaigns, customer journeys, analytics, and practical growth execution." },
    { title: "IT & AI", body: "Web products, internal systems, automation, integrations, AI-assisted workflows, data thinking, and review-based product delivery." },
    { title: "Sales", body: "Discovery, qualification, scripts, objections, offer presentation, follow-up, CRM discipline, and measurable sales execution." },
    { title: "COO / Operations", body: "Department design, KPI, SOP, dashboards, execution control, decision systems, leadership, and scaling operating teams." },
  ],
  serviceGroups: [
    { title: "U.S. Logistics path", items: ["Dispatch foundations", "Carrier and broker communication", "Documents and load lifecycle", "Equipment and lane logic", "Operational problem solving"] },
    { title: "Marketing path", items: ["Positioning and offer", "Websites and SEO/GEO", "Content and campaigns", "Lead journey", "Analytics and improvement"] },
    { title: "IT & AI path", items: ["Web products", "Automation", "AI-assisted workflows", "Integrations", "Product and data thinking"] },
    { title: "Sales path", items: ["Discovery and qualification", "Scripts and objections", "Offer presentation", "Follow-up", "CRM and outcome review"] },
    { title: "COO / Operations path", items: ["Department design", "KPI and dashboards", "SOP and process control", "Execution rhythm", "Scaling and decision systems"] },
  ],
  faq: [
    { question: "Which Academy tracks are publicly presented?", answer: "Five tracks: U.S. Logistics Operations, Marketing, IT & AI, Sales, and COO / Operations. Logistics and Marketing already have dedicated course pages; the other three currently live as Academy learning tracks while their detailed public course pages and exact cohort offers are prepared." },
    { question: "Are paid cohorts and free practice the same offer?", answer: "No. A paid cohort requires an approved public offer with scope, dates, price, payment, refund, capacity, and enrollment terms. Free practice is a separate application and eligibility process with its own participation rules." },
    { question: "Are current prices published?", answer: "No fixed price is published until a specific program and cohort are approved. The current website does not accept Academy enrollment or payment." },
    { question: "Is employment or income guaranteed?", answer: "No. Training and practice can build capability and evidence of readiness, but employment, income, clients, certification, promotion, access duration, and future paid work are not guaranteed." },
  ],
};

export const academyPublicTracks = [
  {
    id: "logistics",
    label: "U.S. Logistics Operations",
    problem: "Freight work feels unclear because communication, documents, equipment logic, and the load lifecycle are not connected into one operating rhythm.",
    title: "Learn how U.S. freight work moves from first conversation to completed load.",
    body: academyPublicPathOverrides.offerings?.[0].body ?? "",
    practice: ["Call and message review", "Load lifecycle exercises", "Documents and exception scenarios", "Carrier-controlled negotiation practice"],
  },
  {
    id: "marketing",
    label: "Marketing",
    problem: "Attention does not convert because positioning, websites, search, content, campaigns, qualification, and sales follow-up are disconnected.",
    title: "Connect positioning, content, distribution, customer journeys, and measurement.",
    body: academyPublicPathOverrides.offerings?.[1].body ?? "",
    practice: ["Offer and audience diagnosis", "Website and SEO/GEO briefs", "Content and campaign exercises", "Reporting and improvement reviews"],
  },
  {
    id: "it",
    label: "IT & AI",
    problem: "Technology projects stall when business workflows, product scope, integrations, data, automation, and human review are designed separately.",
    title: "Learn to turn a business workflow into a useful digital system.",
    body: academyPublicPathOverrides.offerings?.[2].body ?? "",
    practice: ["Workflow mapping", "Product briefs", "Automation and integration scenarios", "AI review and safety boundaries"],
  },
  {
    id: "sales",
    label: "Sales",
    problem: "Sales becomes inconsistent when discovery, qualification, objections, follow-up, CRM, and measurement are treated as separate activities.",
    title: "Build a repeatable path from first conversation to a clear next step.",
    body: academyPublicPathOverrides.offerings?.[3].body ?? "",
    practice: ["Discovery scripts", "Objection review", "Offer presentation", "Follow-up and CRM exercises"],
  },
  {
    id: "operations",
    label: "COO / Operations",
    problem: "Teams lose speed when departments, ownership, KPI, SOP, dashboards, handoffs, and management decisions are not connected into one operating system.",
    title: "Learn how departments become one accountable operating system.",
    body: academyPublicPathOverrides.offerings?.[4].body ?? "",
    practice: ["Department maps", "KPI and dashboard exercises", "SOP and handoff review", "Execution and decision-system scenarios"],
  },
] as const;

export const academyEnrollmentModels = [
  {
    id: "paid_cohort",
    label: "Paid cohort",
    status: "owner_approval_required",
    description: "Published only after the exact program, scope, dates, price, payment terms, refund terms, capacity, and contact workflow are approved.",
    boundary: "No fixed price, enrollment, payment, seat, certificate, employment, income, or result is represented on the current website.",
  },
  {
    id: "free_practice",
    label: "Free practice opportunity",
    status: "application_and_eligibility_required",
    description: "A separate application-based practice model that may include orientation, exercises, feedback, attendance rules, quality review, and removal for inactivity or policy violations.",
    boundary: "Participation, access, duration, feedback, team placement, employment, income, clients, promotion, or future paid work are not guaranteed.",
  },
] as const;
