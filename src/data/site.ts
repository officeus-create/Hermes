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
  ],
  hero: {
    eyebrow: "Logistics · Growth · Education · Technology",
    title: "Four directions. One way forward.",
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
        { label: "Logistics Sales Department", value: "+1 (262) 302-3626", href: "tel:+12623023626", note: "Single public phone for all incoming Hermes Logistics calls in the United States" },
        { label: "Logistics Email", value: "freight_301@hermeslogisticsus.com", href: "mailto:freight_301@hermeslogisticsus.com", note: "Freight, documents, dispatch, and operating-support questions" },
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
      points: ["Website and conversion", "SEO optimization", "Social media marketing"],
      cta: "Explore marketing",
      image: "/images/path-marketing-system.jpg",
      imageAlt: "Architectural marketing system connecting content, audiences, and analytics",
      tone: "magenta",
      audience: "For companies and specialists who need a clearer, more consistent growth system.",
      overview: "ProgressoPro connects website strategy, SEO, social media, positioning, campaigns, and sales workflow. Work begins with the business objective and current constraints, then moves toward a focused system rather than a collection of disconnected tactics.",
      seoTitle: "Website, SEO & Social Media Marketing | ProgressoPro",
      seoDescription: "International website marketing, SEO optimization, social media marketing, lead generation, and sales workflows coordinated by email.",
      seoServiceName: "Website marketing, SEO, social media, and growth systems",
      localFocus: "Milan · Berlin · Paris · Miami · California · New York · England · Email coordination only",
      offerings: [
        { title: "Website and SEO", body: "Shape the offer, conversion path, technical search foundation, page optimization, and content priorities around real customer intent." },
        { title: "Social media marketing", body: "Build channel strategy, useful content, production rhythm, campaigns, and community workflow around a measurable business goal." },
        { title: "Growth and sales system", body: "Connect positioning, lead generation, qualification, CRM handoff, follow-up, analytics, and improvement into one workflow." },
      ],
      process: [
        { title: "Define the goal", body: "Start with the business outcome, audience, and current marketing reality." },
        { title: "Choose the focus", body: "Identify the smallest useful set of priorities for the next working cycle." },
        { title: "Review and improve", body: "Use actual results to refine the message, workflow, and next actions." },
      ],
      serviceGroups: [
        { title: "Website and search", items: ["Website and landing-page strategy", "Conversion journey", "Technical and on-page SEO", "Keyword and content architecture", "Local SEO review"] },
        { title: "Social and demand", items: ["Channel and audience strategy", "Content systems", "Social media operations", "Campaign planning", "Community workflow"] },
        { title: "Growth operations", items: ["Positioning and offer", "Lead qualification", "CRM handoff", "Follow-up workflow", "Performance reporting"] },
      ],
      faq: [
        { question: "Do we need a complete rebrand to begin?", answer: "No. Work can begin with one business goal, offer, campaign, or sales bottleneck before a wider brand decision." },
        { question: "Is this only social media management?", answer: "No. ProgressoPro can connect website and landing-page strategy, SEO, social media, lead generation, sales workflow, and measurement around the selected outcome." },
        { question: "Can you guarantee a Google position or a fixed number of leads?", answer: "No. Search visibility and lead volume depend on the market, competition, offer, website, channels, investment, and execution. We define the baseline, scope, and useful measurements before making a plan." },
        { question: "Can marketing connect to our CRM?", answer: "Yes. The marketing and IT teams can define the lead journey and the technical handoff into a CRM or internal workflow." },
      ],
      directContacts: [
        { label: "Marketing Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=ProgressoPro%20Marketing%20Inquiry", note: "Email-only coordination · Milan · Berlin · Paris · Miami · California · New York · England" },
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
      seoTitle: "Practical Business & Logistics Training | Hermes Academy",
      seoDescription: "International practical training in logistics operations, marketing, and operational leadership, coordinated through email.",
      seoServiceName: "Practical logistics, marketing, and operations education",
      localFocus: "Milan · Berlin · Paris · Miami · California · New York · England · Email coordination only",
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
        { label: "Academy Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=Hermes%20Business%20Academy%20Inquiry", note: "Email-only coordination · Milan · Berlin · Paris · Miami · California · New York · England" },
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
      programLabel: "AI • APIs • CRM • Telegram Bots • Business Automation",
      title: "Custom AI, Automation and Business Systems.",
      body: "We design and integrate practical digital solutions for logistics, sales, recruiting, marketing, and business operations.",
      shortValue: "Build systems",
      points: ["Custom websites and portals", "CRM and operations systems", "Automation and industry platforms"],
      cta: "Explore IT Development",
      image: "/images/path-technology-portal.jpg",
      imageAlt: "Sculptural glass ribbon with blue light accents",
      tone: "teal",
      audience: "For service businesses that need software shaped around their actual customer and internal workflows.",
      overview: "IT Development turns a defined business process into custom software. Work can begin with a website, portal, CRM module, workflow automation, business assistant, or industry-specific product, then expand through tested stages.",
      seoTitle: "AI Automation, CRM and Custom Software Development | Hermes",
      seoDescription: "Hermes develops AI assistants, Telegram bots, CRM systems, logistics technology, recruiting automation, API integrations, and business dashboards.",
      seoServiceName: "Custom software, CRM, automation, and web development",
      localFocus: "Milan · Berlin · Paris · Miami · California · New York · England · Email coordination only",
      offerings: [
        { title: "Digital presence and portals", body: "Custom websites, landing journeys, multilingual content systems, client portals, and applications designed around a specific audience and action." },
        { title: "CRM and operations systems", body: "Software for intake, customer pipelines, responsibilities, status, documents, approvals, dashboards, and management visibility." },
        { title: "Automation and industry products", body: "Booking, payments, notifications, integrations, business assistants, logistics workspaces, and other vertical workflows built in controlled stages." },
      ],
      process: [
        { title: "Map the workflow", body: "Document the users, steps, information, and business result the system must support." },
        { title: "Build the smallest useful version", body: "Create and review a focused prototype before expanding the scope." },
        { title: "Test in real work", body: "Validate the workflow, correct weak points, and decide what should be developed next." },
      ],
      serviceGroups: [
        { title: "Digital presence", items: ["Websites and landing pages", "Multilingual content systems", "Client portals", "Mobile and web applications", "Conversion and payment journeys"] },
        { title: "CRM and operations", items: ["Structured intake", "Client pipelines", "Queues and approvals", "Internal dashboards", "Documents and management views"] },
        { title: "Automation and platforms", items: ["Notifications and reminders", "Google Workspace workflows", "API integrations", "Business assistants", "Industry-specific products"] },
      ],
      faq: [
        { question: "Who is IT Development for?", answer: "Initial solutions are designed for service businesses such as fitness clubs, trainers, coaches, salons, cosmetologists, logistics teams, and professional services." },
        { question: "Do we have to build a large platform first?", answer: "No. Work begins with the smallest useful version of the customer or internal workflow, followed by real testing." },
        { question: "Can existing tools be connected?", answer: "Where suitable, the system can connect Google Workspace, CRM, booking, payment, communication, and reporting tools through supported integrations." },
      ],
      directContacts: [
        { label: "IT Development Inquiries", value: "officeus@hermeslogisticsus.com", href: "mailto:officeus@hermeslogisticsus.com?subject=IT%20Development%20Inquiry", note: "Email-only coordination · Milan · Berlin · Paris · Miami · California · New York · England" },
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
    body: "Send your request securely to the Hermes team. Choose the right direction, add the details that matter, and we will respond through the approved contact channel.",
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

export const contacts = {
  phones: {
    logisticsSales: site.publicPhones[0].value,
  },
  telegram: {
    marketing: site.telegramGroups[0].href,
    logistics: site.telegramGroups[1].href,
  },
  logisticsLocation: site.logisticsLocation,
  internationalOfficeLocations: site.internationalOfficeLocations,
};