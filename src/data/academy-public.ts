import type { PathDetail } from "./site";

export const academyPublicPathOverrides: Partial<PathDetail> = {
  title: "Build practical skills in Russian, Ukrainian, or English across five Hermes Academy tracks.",
  body: "Apply from anywhere for a human-reviewed learning path in Logistics, Marketing, IT & AI, Sales, or COO / Operations. Country, language, schedule, and program fit are reviewed before participation.",
  points: [
    "Russian or Ukrainian learning coordination",
    "Five practical professional tracks",
    "Worldwide remote application review",
  ],
  audience: "For Russian-speaking, Ukrainian-speaking, and English-speaking adults worldwide who want practical capability in logistics, marketing, technology, sales, or operations.",
  overview: "As of September 2026, Hermes Academy accepts application previews from Russian-speaking and Ukrainian-speaking adults worldwide. Applicants choose one of five learning tracks: U.S. Logistics Operations, Marketing, IT & AI, Sales, or COO / Operations. Country, city, working languages, English level, experience, weekly availability, and time-zone fit are reviewed by a person before any participation decision. A visible track is not proof that a paid cohort or enrollment window is open. Exact dates, scope, capacity, prices, payment terms, and participation rules are shared only for an approved offer. Training and practice do not guarantee admission, employment, income, clients, certification, promotion, or future paid work.",
  seoTitle: "Russian & Ukrainian Learning Paths Worldwide | Hermes Academy",
  seoDescription: "Apply worldwide in Russian, Ukrainian, or English for practical Hermes Academy tracks in U.S. logistics, marketing, IT, sales, and operations.",
  seoServiceName: "Remote practical training for Russian- and Ukrainian-speaking learners",
  localFocus: "Worldwide remote application review · Russian, Ukrainian, or English · Email coordination only",
  offerings: [
    { title: "U.S. Logistics Operations", body: "Dispatch foundations, carrier and broker communication, documents, equipment logic, load lifecycle, negotiation practice, and operating routines for the U.S. market." },
    { title: "Marketing", body: "Positioning, content, campaigns, customer journeys, sales follow-up, analytics, and practical growth execution for U.S. and international service businesses." },
    { title: "IT & AI", body: "Product thinking, web systems, automation, AI workflows, data boundaries, testing, and practical implementation around real business processes." },
    { title: "Sales", body: "Prospecting, discovery, objection handling, follow-up, CRM discipline, negotiation, and practical customer communication." },
    { title: "COO / Operations", body: "Department design, KPI, SOPs, execution rhythm, cross-functional coordination, analytics, decision systems, and scaling operations." },
  ],
  serviceGroups: [
    { title: "U.S. Logistics path", items: ["Dispatch foundations", "Carrier and broker communication", "Documents and load lifecycle", "Equipment and lane logic", "Operational problem solving"] },
    { title: "Marketing path", items: ["Positioning and offer", "Content and campaigns", "Lead journey", "Sales follow-up", "Analytics and improvement"] },
    { title: "IT & AI path", items: ["Product and system thinking", "Web and data workflows", "Automation", "AI-assisted operations", "Testing and safe implementation"] },
    { title: "Sales path", items: ["Prospecting", "Discovery", "Objection handling", "Follow-up", "CRM and negotiation discipline"] },
    { title: "COO / Operations path", items: ["Department design", "KPI and dashboards", "SOP and process control", "Execution rhythm", "Scaling and decision systems"] },
  ],
  faq: [
    { question: "Which learning tracks are publicly presented?", answer: "Five learning tracks are visible: U.S. Logistics Operations, Marketing, IT & AI, Sales, and COO / Operations. A visible learning track does not by itself mean a paid cohort or enrollment window is open." },
    { question: "Are paid cohorts and free practice the same offer?", answer: "No. A paid cohort requires an approved public offer with scope, dates, price, payment, refund, capacity, and enrollment terms. Free practice is a separate application and eligibility process with its own participation rules." },
    { question: "Are current prices published?", answer: "No fixed price is published until a specific program and cohort are approved. The current website does not accept Academy enrollment or payment unless that exact offer is separately activated." },
    { question: "Is employment or income guaranteed?", answer: "No. Training and practice can build capability and evidence of readiness, but employment, income, clients, certification, promotion, access duration, and future paid work are not guaranteed." },
    { question: "Can Russian-speaking or Ukrainian-speaking applicants apply from any country?", answer: "Yes. The application accepts country, city, language, schedule, and program information from applicants worldwide. A person reviews program fit, current capacity, time-zone overlap, contact route, and applicable legal or sanctions restrictions before any participation decision." },
    { question: "Which language should I use for the Academy application?", answer: "You may prepare the application in Russian, Ukrainian, or English. U.S. Logistics and other communication-heavy work may also require functional English, while local-market languages can strengthen a Marketing path." },
    { question: "What information should an international applicant prepare?", answer: "Choose one learning track and provide country and city, working languages and levels, recent relevant experience, learning objective, weekly availability, U.S. time-zone availability where relevant, and the preferred contact route." },
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
  {
    id: "it",
    label: "IT & AI",
    problem: "Tools and AI experiments stay fragmented when product goals, data, automation, testing, and business ownership are not connected.",
    title: "Turn business workflows into reliable digital systems and AI-assisted operations.",
    body: academyPublicPathOverrides.offerings?.[2].body ?? "",
    practice: ["Product and workflow mapping", "Automation briefs", "AI use-case review", "Testing and implementation exercises"],
  },
  {
    id: "sales",
    label: "Sales",
    problem: "Outreach underperforms when prospecting, discovery, objections, follow-up, and CRM discipline are treated as separate activities.",
    title: "Practice the full sales conversation from first contact through disciplined follow-up.",
    body: academyPublicPathOverrides.offerings?.[3].body ?? "",
    practice: ["Prospecting scenarios", "Discovery questions", "Objection handling", "Follow-up and CRM review"],
  },
  {
    id: "operations",
    label: "COO / Operations",
    problem: "Teams lose speed when departments, KPI, ownership, SOPs, meetings, and decisions are not connected into one operating system.",
    title: "Learn to design, measure, and improve an operating system across departments.",
    body: academyPublicPathOverrides.offerings?.[4].body ?? "",
    practice: ["Department maps", "KPI and dashboard exercises", "SOP review", "Execution and decision scenarios"],
  },
] as const;

export const academyEnrollmentModels = [
  {
    id: "paid_cohort",
    label: "Paid cohort",
    status: "owner_approval_required",
    description: "Published only after the exact program, scope, dates, price, payment terms, refund terms, capacity, and contact workflow are approved.",
    boundary: "No fixed price, enrollment, payment, seat, certificate, employment, income, or result is represented unless that exact cohort is separately activated.",
  },
  {
    id: "free_practice",
    label: "Free practice opportunity",
    status: "application_and_eligibility_required",
    description: "A separate application-based practice model that may include orientation, exercises, feedback, attendance rules, quality review, and removal for inactivity or policy violations.",
    boundary: "Participation, access, duration, feedback, team placement, employment, income, clients, promotion, or future paid work are not guaranteed.",
  },
] as const;
