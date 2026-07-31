export type ClaimStatus =
  | "VERIFIED_PUBLIC"
  | "VERIFIED_INTERNAL"
  | "OWNER_APPROVED_PENDING_SOURCE"
  | "PLACEHOLDER_DO_NOT_PUBLISH";

export type PathDetail = {
  id: string;
  number: string;
  category: string;
  brandLabel: string;
  programLabel: string;
  title: string;
  body: string;
  shortValue: string;
  points: string[];
  cta: string;
  image: string;
  imageAlt: string;
  tone: string;
  audience: string;
  overview: string;
  seoTitle: string;
  seoDescription: string;
  seoServiceName: string;
  localFocus: string;
  offerings: { title: string; body: string }[];
  process: { title: string; body: string }[];
  equipment?: { title: string; body: string }[];
  serviceGroups?: { title: string; items: string[] }[];
  faq?: { question: string; answer: string }[];
  directContacts?: { label: string; value: string; href: string; note: string }[];
  socialLinks?: { label: string; handle: string; href: string }[];
  progression?: { level: string; focus: string; responsibility: string }[];
};

export const site = {
  brand: "Hermes",
  domain: "hermeslogisticsus.com",
  location: "USA · Europe · International email coordination",
  logisticsLocation: "United States",
  internationalOfficeLocations: ["Milan", "Berlin", "Paris", "Miami", "California", "New York", "England"],
  logisticsEmail: {
    label: "Logistics Email",
    value: "freight_301@hermeslogisticsus.com",
    href: "mailto:freight_301@hermeslogisticsus.com",
    note: "Email the U.S. Logistics team about freight, documents, dispatch, or operating support",
  },
  publicPhones: [
    {
      label: "Logistics Sales Department",
      value: "+1 (262) 302-3626",
      href: "tel:+12623023626",
      note: "Single public phone for all incoming Hermes Logistics calls in the United States",
    },
  ],
  telegramGroups: [
    {
      label: "Marketing community",
      href: "https://t.me/SMMProgressoPro",
      tracks: ["marketing"],
    },
    {
      label: "Logistics school",
      href: "https://t.me/+GL3L-WkP55NmYzVi",
      tracks: ["logistics", "academy"],
    },
  ],
  navigation: [
    { label: "Logistics", href: "paths/logistics/" },
    { label: "Marketing", href: "paths/marketing/" },
    { label: "Academy", href: "paths/academy/" },
    { label: "IT Development", href: "paths/technology/" },
    { label: "Careers", href: "careers/" },
  ],
  hero: {
    eyebrow: "Logistics · Growth · Education · Technology",
    title: "Four directions. One way forward.",
    body: "Choose what you need now: logistics operations, marketing and growth, practical business education, or custom digital systems.",
    primaryCta: { label: "Explore your path", href: "#paths" },
    secondaryCta: { label: "Talk to our team", href: "#contact" },
  },
  paths: [
    {
      id: "logistics",
      number: "01",
      category: "Logistics",
      brandLabel: "Hermes Logistics",
      programLabel: "U.S. freight operations",
      title: "Move freight with a clearer operating system.",
      body: "Dispatch, documents, broker and shipper communication, car hauling, carrier development, and operational support for the U.S. freight market.",
      shortValue: "Freight operations and carrier growth",
      points: ["Carrier and owner-operator support", "Shipper and dealer coordination", "Car hauling and freight operations"],
      cta: "Explore logistics",
      image: "/images/path-logistics-system.jpg",
      imageAlt: "Hermes logistics operations and route planning system",
      tone: "navy",
      audience: "For carriers, owner-operators, fleets, shippers, dealers, brokers, drivers, and logistics agency partners.",
      overview: "Hermes Logistics helps organize U.S. freight operations around clear information, communication, documentation, and controlled next steps. The exact service path depends on authority, equipment, geography, timing, and current market fit.",
      seoTitle: "Hermes Logistics | Dispatch, Car Hauling & Freight Support",
      seoDescription: "Explore Hermes Logistics support for carriers, owner-operators, fleets, shippers, dealers, brokers, and U.S. freight operations.",
      seoServiceName: "U.S. logistics operations support",
      localFocus: "Wisconsin first · United States",
      offerings: [
        { title: "Carrier operations", body: "Dispatch support, load research, broker communication, documents, and operating coordination." },
        { title: "Car hauling", body: "Vehicle-transport workflow support for carriers, dealers, shippers, auctions, and customers." },
        { title: "Business development", body: "Structured outreach and relationship development with relevant shippers, dealers, and partners." },
      ],
      process: [
        { title: "Choose the right path", body: "Identify whether you are a carrier, customer, broker, driver, candidate, or agency partner." },
        { title: "Share operational facts", body: "Provide equipment, authority, lane, shipment, timeline, and contact information relevant to the request." },
        { title: "Confirm the next step", body: "Hermes reviews fit and routes the request without promising a load, rate, pickup, delivery, or business outcome." },
      ],
      equipment: [
        { title: "Car hauling", body: "Open, enclosed, hotshot, and multi-car configurations can be discussed based on authority and equipment." },
        { title: "General freight", body: "Dry van, reefer, flatbed, step deck, power only, box truck, and cargo van paths depend on current scope." },
      ],
      serviceGroups: [
        { title: "Dispatch and operations", items: ["Load research", "Broker communication", "Document coordination", "Route and schedule support"] },
        { title: "Carrier growth", items: ["Carrier profile review", "Shipper/dealer outreach", "Process improvement", "Operational reporting"] },
      ],
      faq: [
        { question: "Does Hermes guarantee loads or revenue?", answer: "No. Availability, rates, capacity, and revenue depend on market conditions and the carrier's final decisions." },
        { question: "Who approves a load?", answer: "The carrier retains final control over load, rate, route, equipment, and operating decisions." },
      ],
      directContacts: [
        { label: "Logistics Sales Department", value: "+1 (262) 302-3626", href: "tel:+12623023626", note: "U.S. Logistics calls" },
        { label: "Logistics Email", value: "freight_301@hermeslogisticsus.com", href: "mailto:freight_301@hermeslogisticsus.com", note: "Freight and operating requests" },
      ],
      socialLinks: [
        { label: "Instagram", handle: "@hermes.logistics", href: "https://www.instagram.com/hermes.logistics/" },
        { label: "Threads", handle: "@hermes.logistics", href: "https://www.threads.com/@hermes.logistics" },
      ],
    },
    {
      id: "marketing",
      number: "02",
      category: "Marketing",
      brandLabel: "Hermes Marketing · ProgressoPro",
      programLabel: "Growth and client acquisition",
      title: "Turn attention into a measurable growth system.",
      body: "Positioning, content, organic growth, paid campaigns, lead generation, sales process, and connected reporting for service businesses and B2B companies.",
      shortValue: "Marketing, demand, and sales systems",
      points: ["Strategy and positioning", "Content and demand generation", "Sales, CRM, and analytics"],
      cta: "Explore marketing",
      image: "/images/path-marketing-system.jpg",
      imageAlt: "Marketing strategy, content, audience, and analytics system",
      tone: "burgundy",
      audience: "For service businesses, local companies, B2B teams, and international founders who need a clearer growth system.",
      overview: "ProgressoPro connects strategy, content, social platforms, websites, lead generation, and sales follow-up into a measurable operating rhythm.",
      seoTitle: "ProgressoPro | Marketing, SEO, Content & Growth Systems",
      seoDescription: "Explore ProgressoPro marketing services for positioning, websites, SEO, social media, lead generation, CRM, and sales growth.",
      seoServiceName: "Marketing and growth system development",
      localFocus: "United States · Europe · International email coordination",
      offerings: [
        { title: "Positioning and strategy", body: "Clarify the audience, offer, message, channel mix, and measurable commercial goal." },
        { title: "Content and visibility", body: "Develop websites, SEO, social content, publishing systems, and demand-generation campaigns." },
        { title: "Sales and analytics", body: "Connect lead capture, follow-up, CRM structure, reporting, and conversion improvement." },
      ],
      process: [
        { title: "Audit the current system", body: "Review positioning, website, content, channels, lead capture, follow-up, and measurement." },
        { title: "Prioritize the next stage", body: "Select the smallest useful combination of strategy, production, distribution, and sales support." },
        { title: "Measure and improve", body: "Track approved indicators and improve the process without guaranteeing traffic, leads, rankings, or revenue." },
      ],
      serviceGroups: [
        { title: "Digital presence", items: ["Websites", "SEO and Local SEO", "Content systems", "Social media marketing"] },
        { title: "Growth operations", items: ["Lead generation", "CRM structure", "Sales process", "Analytics and reporting"] },
      ],
      directContacts: [
        { label: "General Email", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com", note: "Marketing and growth inquiries" },
      ],
      socialLinks: [
        { label: "Instagram", handle: "@progressopro", href: "https://www.instagram.com/progressopro/" },
        { label: "Threads", handle: "@progressopro", href: "https://www.threads.com/@progressopro" },
        { label: "Telegram", handle: "SMMProgressoPro", href: "https://t.me/SMMProgressoPro" },
      ],
    },
    {
      id: "academy",
      number: "03",
      category: "Academy",
      brandLabel: "Hermes Business Academy",
      programLabel: "Practical business education",
      title: "Build skills through structured practical work.",
      body: "Learning paths in logistics, marketing, sales, AI automation, and operational leadership, with clear boundaries between education, practice, and employment.",
      shortValue: "Practical learning and operating capability",
      points: ["U.S. logistics", "Marketing and sales", "Operational leadership"],
      cta: "Explore the Academy",
      image: "/images/path-academy-system.jpg",
      imageAlt: "Practical business education and operating career system",
      tone: "sand",
      audience: "For individuals, employees, founders, and teams seeking practical business skills and structured development.",
      overview: "Hermes Business Academy focuses on practical learning connected to real business processes. Program availability, dates, price, assignments, and support are published before enrollment.",
      seoTitle: "Hermes Business Academy | Logistics, Marketing & Operations",
      seoDescription: "Explore practical Hermes Business Academy paths in U.S. logistics, marketing, sales, AI automation, and operational leadership.",
      seoServiceName: "Practical business education",
      localFocus: "Remote · International cohorts when announced",
      offerings: [
        { title: "Logistics", body: "Learn U.S. logistics communication, dispatch concepts, documents, carrier and customer workflows." },
        { title: "Marketing", body: "Learn websites, SEO, social media, content, lead generation, CRM, and sales process." },
        { title: "Operations", body: "Develop reporting, accountability, management rhythm, and cross-functional operating skills." },
      ],
      process: [
        { title: "Review the published program", body: "Confirm dates, curriculum, language, price, time commitment, and participation requirements." },
        { title: "Apply or enroll", body: "Submit factual background and goals through the published process for that program." },
        { title: "Complete the work", body: "Education and practice do not guarantee employment, client results, income, or a business outcome." },
      ],
      progression: [
        { level: "Foundation", focus: "Core terminology and workflow", responsibility: "Complete structured learning and practice tasks" },
        { level: "Practice", focus: "Guided business scenarios", responsibility: "Demonstrate communication, accuracy, and follow-through" },
        { level: "Advanced", focus: "Role-specific operating work", responsibility: "Meet published assessment and quality requirements" },
      ],
      directContacts: [
        { label: "Academy Email", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com", note: "Program and enrollment questions" },
      ],
    },
    {
      id: "technology",
      number: "04",
      category: "IT Development",
      brandLabel: "Hermes IT Development",
      programLabel: "Digital products and automation",
      title: "Build digital systems around how your company works.",
      body: "Websites, CRM and operations systems, automation, analytics, integrations, booking, payments, and AI assistants developed in controlled stages.",
      shortValue: "Websites, CRM, automation, and AI systems",
      points: ["Websites and portals", "CRM and operations control", "Automation, integrations, and AI"],
      cta: "Explore IT Development",
      image: "/images/path-technology-portal.jpg",
      imageAlt: "Hermes digital product, CRM, and automation portal",
      tone: "blue",
      audience: "For companies that need a website, internal operating system, CRM, automation, integration, or digital product.",
      overview: "Hermes IT Development designs and builds digital systems in stages: discovery, architecture, implementation, testing, controlled release, and continued improvement.",
      seoTitle: "Hermes IT Development | Websites, CRM, Automation & AI",
      seoDescription: "Explore Hermes IT Development for websites, CRM, operations systems, automation, integrations, analytics, and AI assistants.",
      seoServiceName: "Custom website and business software development",
      localFocus: "United States · Europe · International email coordination",
      offerings: [
        { title: "Websites and portals", body: "Corporate websites, service pages, multilingual experiences, client portals, and digital intake." },
        { title: "CRM and operations", body: "Lead intake, review, pipelines, dashboards, document workflows, and management reporting." },
        { title: "Automation and AI", body: "Integrations, messaging workflows, assistants, data processing, and controlled business automation." },
      ],
      process: [
        { title: "Describe the business problem", body: "Document users, current workflow, data, constraints, examples, and the desired operating result." },
        { title: "Define a buildable stage", body: "Separate live requirements, prototypes, integrations, credentials, and future ideas." },
        { title: "Build and verify", body: "Implement, test, review, and release only the approved scope without claiming unbuilt integrations or outcomes." },
      ],
      serviceGroups: [
        { title: "Digital presence", items: ["Corporate websites", "Multilingual sites", "Landing pages", "SEO-ready architecture"] },
        { title: "Business systems", items: ["CRM", "Operations dashboards", "Document workflows", "Booking and intake"] },
        { title: "Automation", items: ["API integrations", "Messaging assistants", "AI workflows", "Reporting automation"] },
      ],
      directContacts: [
        { label: "IT Development Email", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com", note: "Website, CRM, automation, and product inquiries" },
      ],
    },
  ] satisfies PathDetail[],
};
