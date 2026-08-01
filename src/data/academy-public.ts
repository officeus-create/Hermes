import type { PathDetail } from "./site";

export const academyPublicPathOverrides: Partial<PathDetail> = {
  title: "Learn practical U.S. logistics and marketing skills.",
  body: "Two applied programs connect professional concepts to real U.S. logistics and marketing workflows.",
  points: [
    "U.S. Logistics Operations",
    "Marketing for U.S. and international service businesses",
    "Separate paid cohort and free practice models",
  ],
  audience: "For learners and working professionals building practical capability for U.S. logistics or marketing work.",
  overview: "Hermes Business Academy currently presents two public program paths: U.S. Logistics Operations and Marketing. Leadership, systems thinking, and technology may support exercises inside those paths, but they are not separate public programs. Paid cohorts and free practice opportunities use different eligibility, scope, and participation rules. Program dates, scope, and prices are published only after the exact offer is approved. Training and practice do not guarantee employment, income, clients, certification, promotion, or future paid work.",
  seoTitle: "U.S. Logistics and Marketing Training | Hermes Academy",
  seoDescription: "Practical U.S. logistics and marketing education with separate paid cohort and free practice models, email coordination, and no employment or income guarantee.",
  seoServiceName: "Practical U.S. logistics and marketing education",
  localFocus: "U.S.-market programs · International learners · Email coordination only",
  offerings: [
    { title: "U.S. Logistics Operations", body: "Dispatch foundations, carrier and broker communication, documents, equipment logic, load lifecycle, negotiation practice, and operating routines for the U.S. market." },
    { title: "Marketing", body: "Positioning, content, campaigns, customer journeys, sales follow-up, analytics, and practical growth execution for U.S. and international service businesses." },
  ],
  serviceGroups: [
    { title: "U.S. Logistics path", items: ["Dispatch foundations", "Carrier and broker communication", "Documents and load lifecycle", "Equipment and lane logic", "Operational problem solving"] },
    { title: "Marketing path", items: ["Positioning and offer", "Content and campaigns", "Lead journey", "Sales follow-up", "Analytics and improvement"] },
  ],
  faq: [
    { question: "Which programs are publicly presented?", answer: "Two programs: U.S. Logistics Operations and Marketing. Leadership and technology topics may support exercises, but they are not separate public Academy programs on this page." },
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
    problem: "Attention does not convert because positioning, content, campaigns, qualification, and sales follow-up are disconnected.",
    title: "Connect positioning, content, campaigns, customer journeys, and sales follow-up.",
    body: academyPublicPathOverrides.offerings?.[1].body ?? "",
    practice: ["Offer and audience diagnosis", "Content and campaign briefs", "Lead journey exercises", "Reporting and improvement reviews"],
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
