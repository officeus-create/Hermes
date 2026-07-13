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
  navigation: [
    { label: "Logistics", href: "paths/logistics/" },
    { label: "Marketing", href: "paths/marketing/" },
    { label: "Academy", href: "paths/academy/" },
    { label: "IT Development", href: "paths/technology/" },
  ],
  hero: {
    eyebrow: "Logistics · Growth · Education · Technology",
    title: "Four businesses. One place to move forward.",
    body: "Choose what you need now: logistics operations, marketing and growth, practical business education, or custom digital systems.",
    primaryCta: { label: "Explore your path", href: "#paths" },
    secondaryCta: { label: "Talk to our team", href: "#contact" },
    image: "/images/hermes-ecosystem-hero.jpg",
    imageAlt: "Four illuminated architectural portals representing the Hermes business directions",
  },
  paths: [
    {
      id: "logistics",
      number: "01",
      category: "Hermes Logistics",
      brandLabel: "Hermes Logistics",
      programLabel: "Freight operations",
      title: "Move freight with a team built around clear operations.",
      body: "Dispatch, back-office, and Car Hauling support for carriers, shippers, dealers, fleets, and owner-operators in the U.S. market.",
      shortValue: "Move freight",
      points: ["Shippers and dealers", "Carriers and fleets", "Owner-operators"],
      cta: "Explore logistics",
      image: "/images/path-logistics-system.jpg",
      imageAlt: "Abstract logistics operations network with connected route lines",
      tone: "violet",
      audience: "For carriers, shippers, and logistics partners operating in the U.S. market.",
      overview: "Hermes Logistics provides dispatch and back-office support for owner-operators and small fleets. The team coordinates loads, broker paperwork, rate negotiation, invoicing, and day-to-day communication around the carrier's equipment and operating goals.",
      seoTitle: "Truck Dispatch Services Wisconsin | Hermes Logistics",
      seoDescription: "Wisconsin-first truck dispatch, carrier back-office support, freight coordination, and car hauling for owner-operators and small fleets across the USA.",
      seoServiceName: "Truck dispatch and carrier operations support",
      localFocus: "Wisconsin first · Supporting eligible carriers and freight partners across the United States",
      offerings: [
        { title: "Dispatch operations", body: "Dedicated load search, broker communication, rate negotiation, and operational follow-through." },
        { title: "Carrier back office", body: "Support with setup packets, insurance certificates, documents, invoicing, and accounts receivable." },
        { title: "Shippers and brokers", body: "A structured point of contact for freight requirements, carrier coordination, and load updates." },
      ],
      process: [
        { title: "Request an agreement", body: "Tell us about your authority, equipment, preferred lanes, and current operating needs." },
        { title: "Send carrier documents", body: "The team reviews the signed agreement, W-9, authority, insurance, and driver information required for setup." },
        { title: "Meet your dispatcher", body: "Confirm the working plan, communication routine, and the first loads the team should pursue." },
      ],
      equipment: [
        { title: "Dry Van", body: "53 ft trailers, with equipment details confirmed during onboarding." },
        { title: "Reefer", body: "Temperature-controlled freight support based on trailer and lane requirements." },
        { title: "Flatbed", body: "Open-deck freight coordination, including equipment and securement requirements." },
        { title: "Step Deck", body: "Dispatch support for loads that need additional height clearance." },
        { title: "Power Only", body: "Hook-and-drop, trailer moves, round trips, and other compatible power-only work." },
        { title: "Hotshot", body: "Load search and dispatch coordination for eligible hotshot equipment." },
        { title: "Box Truck", body: "Dedicated support route for straight trucks and local or regional opportunities." },
        { title: "Cargo Van", body: "Expedited and smaller-load opportunities based on equipment and operating area." },
        { title: "Car Hauling", body: "Vehicle transport support for eligible car haulers, with trailer type, capacity, lanes, and operating requirements confirmed before onboarding." },
      ],
      serviceGroups: [
        { title: "Dispatch", items: ["Dedicated dispatcher", "Load search and booking", "Rate negotiation", "Broker and shipper communication", "After-hours support"] },
        { title: "Documents and billing", items: ["Broker setup packets", "Insurance certificate coordination", "Invoicing and billing", "Accounts receivable follow-up", "Carrier document organization"] },
        { title: "Carrier growth", items: ["Lane and equipment fit review", "New-authority onboarding review", "Broker relationship support", "Dedicated freight conversations", "Operational reputation focus"] },
      ],
      faq: [
        { question: "Is the service month-to-month?", answer: "The historical Hermes service model was month-to-month rather than a long-term commitment. Final commercial terms are confirmed in the current agreement." },
        { question: "What documents are usually needed?", answer: "Typical onboarding includes a signed dispatch agreement, W-9, MC authority, insurance information, and driver or equipment details relevant to the service." },
        { question: "Do carriers keep control of load decisions?", answer: "The operating model is built around carrier approval and clear communication. Specific booking and approval rules are confirmed during onboarding." },
        { question: "Can I choose only part of the service?", answer: "Requests can begin with dispatch, documents, invoicing, or another defined need. The team confirms the available scope before work starts." },
      ],
      directContacts: [
        { label: "General Inquiries", value: "+1 (351) 777-5337", href: "tel:+13517775337", note: "Public contact listed by Hermes Logistics on Instagram" },
        { label: "Freight Department", value: "(718) 223-4736", href: "tel:+17182234736", note: "Carrier, shipper, and freight inquiries" },
        { label: "Box Truck Department", value: "(475) 441-4301", href: "tel:+14754414301", note: "Box truck and cargo van inquiries" },
        { label: "Dispatch Operations", value: "freight_301@hermeslogisticsus.com", href: "mailto:freight_301@hermeslogisticsus.com", note: "Documents and dispatch questions" },
      ],
    },
    {
      id: "marketing",
      number: "02",
      category: "ProgressoPro",
      brandLabel: "Hermes Marketing",
      programLabel: "ProgressoPro · Organic Target",
      title: "Turn attention into a repeatable growth system.",
      body: "A marketing path for teams that want clearer positioning, useful content, and a disciplined way to learn from results.",
      shortValue: "Grow demand",
      points: ["Organic content and distribution", "Targeted campaigns", "3/6/9/12-month media plans"],
      cta: "Explore marketing",
      image: "/images/path-marketing-system.jpg",
      imageAlt: "Architectural marketing system connecting content, audiences, and analytics",
      tone: "magenta",
      audience: "For companies and specialists who need a clearer, more consistent growth system.",
      overview: "ProgressoPro connects positioning, content, campaigns, and practical automation. Work begins with the business objective and current constraints, then moves toward a focused plan rather than a collection of disconnected tactics.",
      seoTitle: "Digital Marketing Agency Wisconsin | ProgressoPro",
      seoDescription: "Wisconsin digital marketing strategy, social content, lead generation, sales workflows, and practical automation for service businesses across the USA.",
      seoServiceName: "Digital marketing, content, and sales systems",
      localFocus: "Wisconsin first · Available to service businesses and specialists across the United States",
      offerings: [
        { title: "Strategy and positioning", body: "Clarify the offer, audience, market position, and language people should understand quickly." },
        { title: "Content and demand", body: "Build useful communication, organic distribution, and campaigns around a measurable business goal." },
        { title: "Sales and automation", body: "Connect lead generation, qualification, follow-up, analytics, and practical automation into one workflow." },
      ],
      process: [
        { title: "Define the goal", body: "Start with the business outcome, audience, and current marketing reality." },
        { title: "Choose the focus", body: "Identify the smallest useful set of priorities for the next working cycle." },
        { title: "Review and improve", body: "Use actual results to refine the message, workflow, and next actions." },
      ],
      serviceGroups: [
        { title: "Brand and strategy", items: ["Market and audience research", "Positioning and offer design", "Brand message architecture", "Go-to-market priorities", "Competitive review"] },
        { title: "Growth execution", items: ["Organic content systems", "Social media operations", "Campaign planning", "Lead generation journeys", "Conversion-focused landing pages"] },
        { title: "Sales operations", items: ["Lead qualification", "CRM pipeline design", "Follow-up sequences", "Sales scripts and SOP", "Performance reporting"] },
      ],
      faq: [
        { question: "Do we need a complete rebrand to begin?", answer: "No. Work can begin with one business goal, offer, campaign, or sales bottleneck before a wider brand decision." },
        { question: "Is this only social media management?", answer: "No. ProgressoPro connects positioning, content, lead generation, sales workflow, and measurement around the selected outcome." },
        { question: "Can marketing connect to our CRM?", answer: "Yes. The marketing and IT teams can define the lead journey and the technical handoff into a CRM or internal workflow." },
      ],
      directContacts: [
        { label: "Marketing Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=ProgressoPro%20Marketing%20Inquiry", note: "Email your business goal, channels, timeline, and current marketing challenge" },
      ],
      socialLinks: [
        { label: "Instagram", handle: "@progressopro", href: "https://www.instagram.com/progressopro/" },
        { label: "Threads", handle: "@progressopro", href: "https://www.threads.com/@progressopro" },
        { label: "Telegram", handle: "@SMMProgressoPro", href: "https://t.me/SMMProgressoPro" },
      ],
    },
    {
      id: "academy",
      number: "03",
      category: "Hermes Business Academy",
      brandLabel: "Hermes Academy",
      programLabel: "LearnSkill",
      title: "Learn skills that connect to real business work.",
      body: "A structured education path focused on practical operations, sales, leadership, and modern digital workflows.",
      shortValue: "Build capability",
      points: ["LearnSkill practical model", "Logistics and marketing tracks", "COO / Operational Director Program"],
      cta: "Explore the Academy",
      image: "/images/path-academy-system.jpg",
      imageAlt: "Architectural learning environment with connected workspaces and an ascending path",
      tone: "gold",
      audience: "For learners and working professionals building practical business capabilities.",
      overview: "Hermes Business Academy is designed around applied learning. Programs connect concepts to real workflows, decisions, and communication used in logistics, marketing, and operational leadership.",
      seoTitle: "Business & Logistics Training Wisconsin | Hermes Academy",
      seoDescription: "Practical Wisconsin-first training in logistics operations, marketing, and operational leadership, with programs available to learners across the USA.",
      seoServiceName: "Practical logistics, marketing, and operations education",
      localFocus: "Wisconsin first · Practical online learning available across the United States",
      offerings: [
        { title: "Logistics Operations", body: "Dispatch, communication, documents, equipment logic, and operating routines connected to real logistics work." },
        { title: "Marketing Worldwide", body: "Positioning, content, campaigns, sales workflow, and practical growth execution for international work." },
        { title: "COO / Operational Director", body: "Departments, KPI, processes, execution control, analytics, decision-making, and scaling operations." },
      ],
      process: [
        { title: "Awareness", body: "Understand the role, operating environment, terminology, responsibilities, and the standard of professional work." },
        { title: "Understanding", body: "Work through systems, examples, decisions, reviews, and the connections between departments." },
        { title: "Application", body: "Practice tasks, receive correction, and learn to perform a defined responsibility inside an operating system." },
      ],
      serviceGroups: [
        { title: "Logistics path", items: ["Dispatch foundations", "Carrier and broker communication", "Documents and load lifecycle", "Equipment and lane logic", "Operational problem solving"] },
        { title: "Marketing path", items: ["Positioning and offer", "Content and campaigns", "Lead generation", "Sales workflow", "Analytics and improvement"] },
        { title: "COO path", items: ["Department design", "KPI and dashboards", "SOP and process control", "Execution rhythm", "Scaling and decision systems"] },
      ],
      faq: [
        { question: "Is this a generic course marketplace?", answer: "No. The Academy is structured around three professional paths and the operating systems, responsibilities, and practice behind them." },
        { question: "How does the methodology work?", answer: "Each path moves through awareness, understanding, and application, with progressively more practical responsibility." },
        { question: "When are program prices confirmed?", answer: "Program dates, scope, and prices are published before enrollment for each available program or cohort. The current website does not accept enrollment or payment." },
        { question: "Is employment guaranteed?", answer: "No employment promise is made. The goal is to build practical capability and evidence of readiness for the selected professional path." },
      ],
      directContacts: [
        { label: "Academy Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20Business%20Academy%20Inquiry", note: "Email the program, role, or practical skill you want to develop" },
      ],
      progression: [
        { level: "Student", focus: "Language and context", responsibility: "Understand the role, terminology, and how work moves through the operating system." },
        { level: "Trainee", focus: "Guided execution", responsibility: "Complete defined tasks with examples, review, and correction." },
        { level: "Specialist", focus: "Reliable ownership", responsibility: "Perform a repeatable area of work and communicate status clearly." },
        { level: "Manager", focus: "Team coordination", responsibility: "Control priorities, quality, handoffs, and performance inside a department." },
        { level: "Director", focus: "Operating system", responsibility: "Connect departments, KPI, process control, resources, and execution rhythm." },
        { level: "Executive", focus: "Business decisions", responsibility: "Use systems thinking, analytics, and leadership to guide the wider organization." },
      ],
    },
    {
      id: "technology",
      number: "04",
      category: "IT Development",
      brandLabel: "Hermes IT Development",
      programLabel: "Systems for service businesses",
      title: "Build the digital system your business actually needs.",
      body: "Practical software for service businesses, from customer journeys and payments to the internal workflows behind them.",
      shortValue: "Build systems",
      points: ["Fitness trainers and studios", "Beauty professionals and salons", "Booking, prepayments, and CRM"],
      cta: "Explore IT Development",
      image: "/images/path-technology-portal.jpg",
      imageAlt: "Sculptural glass ribbon with blue light accents",
      tone: "teal",
      audience: "For service businesses that need software shaped around their actual customer and internal workflows.",
      overview: "IT Development turns a defined business process into a practical digital tool. Initial focus areas include CRM systems, websites and applications, online booking, prepayments, automation, and internal operations.",
      seoTitle: "CRM, AI & Web Development Wisconsin | Hermes",
      seoDescription: "Wisconsin CRM development, AI-assisted automation, websites, applications, and connected business systems for service companies across the USA.",
      seoServiceName: "CRM, AI automation, and web development",
      localFocus: "Wisconsin first · Building digital systems for service companies across the United States",
      offerings: [
        { title: "CRM and business systems", body: "Systems for customer pipelines, responsibilities, status, documents, and operational information." },
        { title: "Websites and applications", body: "Digital products designed around a specific service, audience, conversion path, and internal workflow." },
        { title: "Booking, payments, automation", body: "Workflows for appointments, prepayments, notifications, integrations, and repetitive internal tasks." },
      ],
      process: [
        { title: "Map the workflow", body: "Document the users, steps, information, and business result the system must support." },
        { title: "Build the smallest useful version", body: "Create and review a focused prototype before expanding the scope." },
        { title: "Test in real work", body: "Validate the workflow, correct weak points, and decide what should be developed next." },
      ],
      serviceGroups: [
        { title: "Customer experience", items: ["Websites and landing pages", "Client portals", "Mobile and web applications", "Online booking", "Prepayments and payment journeys"] },
        { title: "Operations systems", items: ["CRM implementation", "Client pipelines", "Internal dashboards", "Task and status workflows", "Documents and approvals"] },
        { title: "Automation and integration", items: ["Notifications and reminders", "Google Workspace workflows", "API integrations", "Reporting automation", "AI-assisted internal tools"] },
      ],
      faq: [
        { question: "Who is IT Development for?", answer: "Initial solutions are designed for service businesses such as fitness clubs, trainers, coaches, salons, cosmetologists, logistics teams, and professional services." },
        { question: "Do we have to build a large platform first?", answer: "No. Work begins with the smallest useful version of the customer or internal workflow, followed by real testing." },
        { question: "Can existing tools be connected?", answer: "Where suitable, the system can connect Google Workspace, CRM, booking, payment, communication, and reporting tools through supported integrations." },
      ],
      directContacts: [
        { label: "IT Development Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=IT%20Development%20Inquiry", note: "Email the workflow, system, or automation you want to build" },
      ],
    },
  ] satisfies PathDetail[],
  journey: [
    { number: "01", title: "Choose", body: "Start with the outcome you need, not a generic package." },
    { number: "02", title: "Connect", body: "Reach the team, program, or business direction built for that goal." },
    { number: "03", title: "Plan", body: "Define the smallest useful next step, responsibilities, and expected result." },
    { number: "04", title: "Build", body: "Put the plan into practical work with clear communication and review." },
    { number: "05", title: "Improve", body: "Use real feedback and results to decide what should happen next." },
  ],
  principles: [
    { title: "People first", body: "Clear communication and practical support shape every path." },
    { title: "Built for action", body: "We favor useful systems over complicated promises." },
    { title: "One connected view", body: "Logistics, growth, education, and technology reinforce each other without losing focus." },
  ],
  contact: {
    eyebrow: "Not sure where to begin?",
    title: "Tell us what you are building.",
    body: "Use the preview to organize your request, copy the summary, and open the matching contact route below. Until contact delivery is connected, the form does not send or store data.",
    previewStatus: "Your information was not sent or stored.",
    handoffTitle: "Next step: copy and contact",
    handoffBody: "Copy the request summary, then open the approved contact route for your direction.",
    copyRequestLabel: "Copy request",
    copySuccess: "Request copied. Paste it into your email or message.",
    copyFailure: "Copy did not work in this browser. Select the summary below and copy it manually.",
    unsureRoute: "Choose a business direction above to reveal the matching contact route.",
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/hermes.logistics/" },
    { label: "Threads", href: "https://www.threads.com/@hermes.logistics" },
    { label: "Telegram", href: "https://t.me/+R-GepRJDbEQ1NjVi" },
  ],
  claimRegister: [
    { claim: "Hermes operates as a multi-division business ecosystem", status: "VERIFIED_INTERNAL" as ClaimStatus },
    { claim: "Specific performance metrics and partner counts", status: "PLACEHOLDER_DO_NOT_PUBLISH" as ClaimStatus },
  ],
};
