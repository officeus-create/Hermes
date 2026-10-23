// Approved Claude Design "Hermes Directions" page skeleton (owner export 2026-10-22).
// Copy, links and statuses come from the design CHANGELOG; statuses must stay truthful.

export type DirectionStoryId = "logistics" | "technology" | "academy" | "marketing" | "products";
export type ProofStatus = "LIVE" | "LIVE PILOT" | "SOURCE-GATED" | "PREVIEW" | "PRIVATE";

export interface DirectionStory {
  question: { kicker: string; title: string; lead: string; answers: Array<{ title: string; body: string; cta: string; href: string }> };
  pillars: { kicker: string; title: string; items: Array<{ title: string; body: string; points: string[] }>; chipsLabel: string; chips: string[] };
  steps: { kicker: string; title: string; items: Array<{ title: string; body: string }> };
  proof: { kicker: string; title: string; lead: string; items: Array<{ status: ProofStatus; title: string; body: string; href: string }> };
  ecosystem: { title: string; lead: string; items: Array<{ direction: "logistics" | "technology" | "academy" | "marketing" | "products"; label: string; title: string; body: string; href: string }> };
  faq: Array<{ question: string; answer: string }>;
  finalQuestion: string;
  finalCta: { label: string; href: string };
}

export const directionStories: Record<DirectionStoryId, DirectionStory> = {
  logistics: {
    question: {
      kicker: "Start here · One question",
      title: "Who are you today?",
      lead: "Pick the closest answer. You get the right page and one clear next step — no form first.",
      answers: [
        { title: "Carrier or owner-operator", body: "Load search, dispatch, documents and a clearer operating plan.", cta: "Find work and support", href: "/logistics/carrier/" },
        { title: "Shipper or dealer", body: "Move vehicles between dealerships, auctions and locations.", cta: "Move vehicles", href: "/logistics/shipper-dealer/" },
        { title: "Broker", body: "Compatible car-hauling capacity and clear communication.", cta: "Find carrier capacity", href: "/logistics/broker/" },
        { title: "Experienced operator", body: "Build an agency under the Hermes brand and standards.", cta: "Open an agency", href: "/logistics/agency/" },
      ],
    },
    pillars: {
      kicker: "What we take off your desk",
      title: "You drive. We handle the rest.",
      items: [
        { title: "Dispatch", body: "A dedicated dispatcher who finds, negotiates and follows through.", points: ["Dedicated dispatcher", "Load search and booking", "Rate negotiation", "Broker and shipper communication", "After-hours support"] },
        { title: "Documents & billing", body: "Paperwork done right, so you get paid on time.", points: ["Broker setup packets", "Insurance certificate coordination", "Invoicing and billing", "Accounts receivable follow-up"] },
        { title: "Carrier growth", body: "From one truck to a fleet with steady lanes.", points: ["Lane and equipment fit review", "New-authority onboarding", "Broker relationships", "Dedicated freight conversations"] },
      ],
      chipsLabel: "Equipment",
      chips: ["Car Hauling", "Dry Van", "Reefer", "Flatbed", "Step Deck", "Power Only", "Hotshot", "Box Truck", "Cargo Van"],
    },
    steps: {
      kicker: "How it starts",
      title: "Three steps to your first load.",
      items: [
        { title: "Request an agreement", body: "Tell us your authority, equipment, lanes and goals." },
        { title: "Send carrier documents", body: "Agreement, W-9, authority, insurance and driver details." },
        { title: "Meet your dispatcher", body: "Agree the plan, the routine and the first loads to pursue." },
      ],
    },
    proof: {
      kicker: "What is real today",
      title: "Tools you can open right now.",
      lead: "Every item carries its real status. We never present a preview as live.",
      items: [
        { status: "SOURCE-GATED", title: "Hermes Load Board", body: "Search by lane and equipment. Approved active records only; previews stay labelled.", href: "/load-board/" },
        { status: "LIVE", title: "Carrier plans & packet", body: "Plans, packet and agreement context for carriers.", href: "/carrier/" },
        { status: "LIVE", title: "Wisconsin transport guides", body: "Statewide and city guides: Appleton, Milwaukee, Madison, Green Bay and more.", href: "/logistics/wisconsin-vehicle-transport/" },
      ],
    },
    ecosystem: {
      title: "Logistics, powered by the whole Hermes.",
      lead: "Our technology runs the Load Board; our Academy trains dispatchers; our marketing brings shippers.",
      items: [
        { direction: "technology", label: "Technology", title: "Logistics technology", body: "Carrier validation, API connections, dispatch dashboards.", href: "/paths/technology/" },
        { direction: "academy", label: "Academy", title: "Train as a dispatcher", body: "U.S. logistics operations track with human feedback.", href: "/academy/us-logistics-operations/" },
        { direction: "marketing", label: "Marketing", title: "Logistics SEO", body: "Be found by shippers, dealers and brokers.", href: "/services/seo/" },
        { direction: "products", label: "Products", title: "Hermes Connect CRM", body: "Customers, bookings and follow-up in one place.", href: "/services/hermes-connect/" },
      ],
    },
    faq: [
      { question: "Is the service month-to-month?", answer: "The Hermes model has been month-to-month rather than a long-term commitment. Final terms are confirmed in your current agreement." },
      { question: "Which documents do I need?", answer: "Usually a signed dispatch agreement, W-9, MC authority, insurance information and driver or equipment details." },
      { question: "Do I keep control of load decisions?", answer: "Yes. The model is built around carrier approval and clear communication; booking rules are confirmed during onboarding." },
    ],
    finalQuestion: "Have a truck and want steady loads?",
    finalCta: { label: "Start carrier review", href: "/logistics/start-car-hauling-dispatch/" },
  },
  technology: {
    question: {
      kicker: "Start here · One question",
      title: "Where does work leak today?",
      lead: "Pick the closest answer. You get the right page and one clear next step — no form first.",
      answers: [
        { title: "The website brings no inquiries", body: "A fast, search-ready site with a clear path to contact.", cta: "Website development", href: "/services/website-development/" },
        { title: "Leads get lost between inbox and CRM", body: "One CRM with validation, pipelines and follow-up.", cta: "CRM & sales automation", href: "/paths/technology/#project-brief" },
        { title: "The team repeats the same tasks", body: "An AI assistant around one defined role, with human approval.", cta: "Design an AI assistant", href: "/paths/technology/#project-brief" },
        { title: "Tools do not talk to each other", body: "APIs, webhooks and data sync into one reliable flow.", cta: "Connect my systems", href: "/paths/technology/#project-brief" },
      ],
    },
    pillars: {
      kicker: "What we build",
      title: "One connected system, not ten disconnected tools.",
      items: [
        { title: "Websites & digital front doors", body: "Custom, fast, multilingual and built for search and AI discovery.", points: ["Information architecture", "Custom responsive build", "SEO/GEO foundation", "QA, launch and handoff"] },
        { title: "CRM & operations", body: "Shaped around your roles, statuses, approvals and dashboards.", points: ["Custom CRM development", "Lead validation and scoring", "Duplicate detection", "Management dashboards"] },
        { title: "AI assistants & automation", body: "Assistants grounded in your approved knowledge; people keep the final decision.", points: ["Telegram and messaging assistants", "Knowledge-base assistants", "Document automation", "Approval gates and audit logs"] },
      ],
      chipsLabel: "Stack",
      chips: ["TypeScript", "Python", "PostgreSQL", "Supabase", "FastAPI", "Webhooks", "Google Workspace", "Cloud deployment"],
    },
    steps: {
      kicker: "How it starts",
      title: "From audit to a working first release.",
      items: [
        { title: "Process audit", body: "The problem, users, data and the result you need." },
        { title: "Prototype", body: "A focused working version before expanding." },
        { title: "Integration", body: "APIs, databases and your existing tools." },
        { title: "Testing", body: "Workflows, permissions and failure scenarios." },
        { title: "Launch & improve", body: "Released, measured and improved from real use." },
      ],
    },
    proof: {
      kicker: "Our products · Real status",
      title: "We build products — and run them ourselves.",
      lead: "Every item carries its real status. We never present a preview as live.",
      items: [
        { status: "LIVE PILOT", title: "Hermes Connect · Repair Shops", body: "CRM and booking: shop profile, services, availability, bookings and customers.", href: "/services/hermes-connect/repair-shops/" },
        { status: "SOURCE-GATED", title: "Hermes Load Board", body: "Intake, normalization, permissions, freshness, search and alerts in one product.", href: "/load-board/" },
        { status: "LIVE", title: "This website", body: "Four directions, six languages, automated QA and a controlled release flow.", href: "/case/it-development/" },
        { status: "PRIVATE", title: "Website Factory", body: "A structured brief becomes a reviewable website build.", href: "/services/hermes-connect/website-factory/" },
        { status: "PREVIEW", title: "CRM validation queue", body: "Intake, duplicate checks and review queues before any CRM write.", href: "/demos/crm-validation/" },
        { status: "PREVIEW", title: "Automated website audit", body: "Structure, metadata, calls to action and usability signals.", href: "/demos/website-audit/" },
      ],
    },
    ecosystem: {
      title: "Technology for every Hermes direction.",
      lead: "Each direction runs on systems we built. Open the technology behind each one.",
      items: [
        { direction: "logistics", label: "Logistics", title: "Logistics technology", body: "Load Board, carrier validation, dispatch control.", href: "/paths/logistics/" },
        { direction: "academy", label: "Academy", title: "Learning technology", body: "Candidate validation, knowledge, learning dashboards.", href: "/paths/academy/" },
        { direction: "marketing", label: "Marketing", title: "Marketing technology", body: "Website audit, competitor monitoring, dashboards.", href: "/paths/marketing/" },
        { direction: "products", label: "Products", title: "All Hermes products", body: "Connect, Load Board, Catalog, Website Factory.", href: "/services/hermes-connect/" },
      ],
    },
    faq: [
      { question: "Do we have to build a large platform first?", answer: "No. We start with the smallest useful version of one workflow and test it in real work." },
      { question: "Can our existing tools be connected?", answer: "Where suitable: Google Workspace, CRM, booking, payments, messaging and reporting through supported integrations." },
      { question: "Who is it for?", answer: "Service businesses, logistics teams, sales and recruiting organisations, agencies and professional services." },
    ],
    finalQuestion: "Which workflow costs you the most today?",
    finalCta: { label: "Build your project brief", href: "/paths/technology/#project-brief" },
  },
  academy: {
    question: {
      kicker: "Start here · One question",
      title: "What do you want to become?",
      lead: "Pick the closest answer. You get the right track and one clear next step — no form first.",
      answers: [
        { title: "Dispatcher or logistics specialist", body: "Dispatch, documents, equipment logic and negotiation.", cta: "U.S. Logistics track", href: "/academy/us-logistics-operations/" },
        { title: "Marketer", body: "Research, websites, search, social, media planning.", cta: "Marketing track", href: "/academy/marketing/" },
        { title: "IT & AI builder", body: "Web systems, automation, AI workflows and testing.", cta: "IT & AI track", href: "/paths/academy/#academy-it" },
        { title: "Sales or operations leader", body: "Discovery, objections, CRM discipline, KPI and SOPs.", cta: "Sales & COO tracks", href: "/paths/academy/#academy-sales" },
      ],
    },
    pillars: {
      kicker: "The method",
      title: "One correction should change the next attempt.",
      items: [
        { title: "Explain & practise", body: "Understand the context, then try the work before live responsibility.", points: ["Explain in your own words", "Realistic scenarios", "First attempt is evidence, not a verdict"] },
        { title: "Review & retry", body: "Name your own gap, get one precise correction, try again.", points: ["Self-review first", "Human feedback from a reviewer", "A visible second attempt"] },
        { title: "Transfer & grow", body: "Use the skill in a new situation — then take the next level.", points: ["Changed scenario, ideally without notes", "Human progression gate", "Path toward real responsibility"] },
      ],
      chipsLabel: "Growth path",
      chips: ["Student", "Trainee", "Specialist", "Manager", "Director", "Executive"],
    },
    steps: {
      kicker: "How it starts",
      title: "Start small. Decide with evidence.",
      items: [
        { title: "Try one exercise", body: "Pick a public guide, write one observation and one question." },
        { title: "Apply", body: "Prepare your details for a preview-first human review." },
        { title: "Learn and practise", body: "Work through the track with feedback and retries." },
      ],
    },
    proof: {
      kicker: "What is open today",
      title: "Real entry points — no hidden promises.",
      lead: "Every item carries its real status. We never present a preview as live.",
      items: [
        { status: "LIVE", title: "Public exercises & guides", body: "Curated guides and checklists you can use today.", href: "/academy/resources/" },
        { status: "LIVE", title: "How training works", body: "Stages, exercises, feedback, rules and progression.", href: "/academy/how-training-works/" },
        { status: "LIVE", title: "London entry path", body: "U.S. logistics training routes for the UK.", href: "/gb/london/academy/" },
      ],
    },
    ecosystem: {
      title: "Learn inside a working company.",
      lead: "Every track connects to a real Hermes direction — and the technology it runs on.",
      items: [
        { direction: "logistics", label: "Logistics", title: "Logistics in practice", body: "The operations our dispatch team runs every day.", href: "/paths/logistics/" },
        { direction: "technology", label: "Technology", title: "Learning technology", body: "Learner workspace, candidate validation, dashboards.", href: "/paths/technology/" },
        { direction: "marketing", label: "Marketing", title: "Marketing in practice", body: "How ProgressoPro runs websites, SEO and social.", href: "/paths/marketing/" },
        { direction: "products", label: "Products", title: "Learner workspace", body: "Your Academy space inside Hermes Connect.", href: "/services/hermes-connect/" },
      ],
    },
    faq: [
      { question: "Are prices published?", answer: "Not until a specific program and cohort are approved. Enrollment and payment open only for an activated offer." },
      { question: "Are paid cohorts and free practice the same?", answer: "No. A paid cohort has an approved public offer; free practice is a separate application and eligibility process." },
      { question: "Is a job guaranteed?", answer: "No. Training builds capability and evidence of readiness; employment, income and clients are not guaranteed." },
    ],
    finalQuestion: "Ready to try your first exercise?",
    finalCta: { label: "Try a public exercise", href: "/academy/resources/" },
  },
  marketing: {
    question: {
      kicker: "Start here · One question",
      title: "Where do you lose customers?",
      lead: "Pick the closest answer. You get the right page and one clear next step — no form first.",
      answers: [
        { title: "Nobody finds us in search or AI", body: "Technical SEO, content architecture, local and AI-search visibility.", cta: "SEO & GEO", href: "/services/seo/" },
        { title: "Visitors come but do not call", body: "Offer, page structure and a clear conversion path.", cta: "Website & conversion", href: "/services/website-development/" },
        { title: "Social media feels random", body: "Channel strategy, content system, calendar and community.", cta: "Social media marketing", href: "/gb/london/social-media-management/" },
        { title: "Leads do not become sales", body: "Qualification, CRM handoff, follow-up and reporting.", cta: "Growth & sales system", href: "/business-growth/" },
      ],
    },
    pillars: {
      kicker: "Four connected pillars",
      title: "Start with one priority. Connect the rest as you grow.",
      items: [
        { title: "Website & conversion", body: "A clear path from attention to inquiry.", points: ["Landing-page strategy", "Message and journey", "Analytics plan"] },
        { title: "SEO & GEO", body: "Visibility in search and AI answers on a sound technical base.", points: ["Technical and on-page review", "Keyword and content architecture", "Local SEO and reporting"] },
        { title: "Social media marketing", body: "A repeatable presence around a business goal.", points: ["Channel and audience strategy", "Content system and calendar", "Campaign and community workflow"] },
        { title: "Growth & sales system", body: "Marketing connected to real conversations.", points: ["Positioning and offer", "Lead journey and CRM handoff", "Review and next actions"] },
      ],
      chipsLabel: "Planning horizons",
      chips: ["3 months · foundation", "6 months · build + learn", "9 months · compound", "12 months · operating system"],
    },
    steps: {
      kicker: "How it starts",
      title: "Commit only as far as the problem needs.",
      items: [
        { title: "Diagnostic", body: "Find the first growth problem worth solving." },
        { title: "Focused cycle", body: "One connected commercial improvement, with written deliverables." },
        { title: "Ongoing system", body: "Operate, measure and improve the growth workflow." },
      ],
    },
    proof: {
      kicker: "Proof you can see",
      title: "Judge our marketing by our own work.",
      lead: "Every item carries its real status. We never present a preview as live.",
      items: [
        { status: "LIVE", title: "This website", body: "Designed, built and optimised by Hermes — the page you are reading.", href: "/case/it-development/" },
        { status: "PREVIEW", title: "Hermes website audit", body: "An automated audit report of structure, metadata and calls to action.", href: "/demos/website-audit/" },
        { status: "LIVE", title: "Catalog profile bonus", body: "IT and Marketing clients get a search-ready Catalog profile included.", href: "/businesses/#catalog-client-benefit" },
      ],
    },
    ecosystem: {
      title: "Marketing that the whole Hermes stands behind.",
      lead: "Our developers build what we promote; our Academy trains the team that runs it.",
      items: [
        { direction: "technology", label: "Technology", title: "Marketing technology", body: "Audits, competitor monitoring, dashboards.", href: "/paths/technology/" },
        { direction: "logistics", label: "Logistics", title: "Logistics SEO", body: "Growth for trucking and transport companies.", href: "/paths/logistics/" },
        { direction: "academy", label: "Academy", title: "Learn marketing", body: "Three-month online marketing training.", href: "/academy/marketing/" },
        { direction: "products", label: "Products", title: "Hermes Catalog", body: "A public business profile customers can find.", href: "/businesses/" },
      ],
    },
    faq: [
      { question: "Do we need a full rebrand to start?", answer: "No. Start with one goal, offer, campaign or sales bottleneck." },
      { question: "Can you guarantee a Google position or leads?", answer: "No. We define the baseline, scope and measurements first — results depend on the market, offer and execution." },
      { question: "Can marketing connect to our CRM?", answer: "Yes. Marketing and IT define the lead journey and the technical handoff together." },
    ],
    finalQuestion: "Want more of the right customers?",
    finalCta: { label: "Request a growth review", href: "#contact" },
  },
  products: {
    question: {
      kicker: "Start here · One question",
      title: "What do you need?",
      lead: "Pick the closest answer. You get the right product and one clear next step — no form first.",
      answers: [
        { title: "Run customers and bookings", body: "CRM, booking and follow-up for service businesses.", cta: "Hermes Connect · CRM", href: "/services/hermes-connect/" },
        { title: "Find freight", body: "Lane and equipment search with verified access.", cta: "Load Board", href: "/load-board/" },
        { title: "Be found by customers", body: "A public, search-ready business profile.", cta: "Catalog", href: "/businesses/" },
        { title: "Join or partner with Hermes", body: "Vacancies, partnerships and ways to grow with us.", cta: "Opportunities", href: "/opportunities/" },
      ],
    },
    pillars: {
      kicker: "The family",
      title: "One product family, one standard.",
      items: [
        { title: "Hermes Connect", body: "CRM and AI assistant for leads, bookings, customers and operations.", points: ["Repair Shops · live pilot", "Learner workspace", "Website Factory · private"] },
        { title: "Hermes Load Board", body: "Freight marketplace with permissions and freshness controls.", points: ["Lane and equipment search", "Fresh-load alerts", "Verified access boundary"] },
        { title: "Catalog & Insights", body: "Discovery for businesses and the story of how we build.", points: ["Business directory", "News and case studies", "Vacancies and partnerships"] },
      ],
      chipsLabel: "",
      chips: [],
    },
    steps: {
      kicker: "How it starts",
      title: "Try it, then decide.",
      items: [
        { title: "Open a product", body: "See the live part and the clearly labelled previews." },
        { title: "Talk to us", body: "Tell us the workflow you want to run." },
        { title: "Start your space", body: "We set up the module that fits — and expand later." },
      ],
    },
    proof: {
      kicker: "Real status",
      title: "What exists today.",
      lead: "Every item carries its real status. We never present a preview as live.",
      items: [
        { status: "LIVE PILOT", title: "Hermes Connect · Repair Shops", body: "Shop profile, services, availability, booking and customers.", href: "/services/hermes-connect/repair-shops/" },
        { status: "SOURCE-GATED", title: "Hermes Load Board", body: "Approved active records; previews stay non-bookable.", href: "/load-board/" },
        { status: "LIVE", title: "Hermes Catalog", body: "Business directory with search-ready profiles.", href: "/businesses/" },
        { status: "PRIVATE", title: "Hermes Automatic Engineer", body: "Our cloud automation engine: scheduled jobs, retries, receipts and live readback.", href: "/insights/technology/hermes-automatic-engineer-business-automation/" },
      ],
    },
    ecosystem: {
      title: "Every product serves a direction.",
      lead: "Open the direction a product was built for.",
      items: [
        { direction: "logistics", label: "Logistics", title: "For logistics", body: "Load Board and carrier tools.", href: "/paths/logistics/" },
        { direction: "technology", label: "Technology", title: "For technology clients", body: "Connect, Website Factory, custom builds.", href: "/paths/technology/" },
        { direction: "academy", label: "Academy", title: "For learners", body: "Learner workspace and resources.", href: "/paths/academy/" },
        { direction: "marketing", label: "Marketing", title: "For growth", body: "Catalog profiles and audits.", href: "/paths/marketing/" },
      ],
    },
    faq: [
      { question: "Is Hermes Connect live?", answer: "Repair Shops is the current live pilot. Other modules are reference capabilities until verified." },
      { question: "Can I get my own version?", answer: "Yes — Hermes Technology adapts the same architecture for other businesses." },
      { question: "Where do I sign in?", answer: "Use Sign in at the top of every page." },
    ],
    finalQuestion: "Which product should run your business?",
    finalCta: { label: "Explore Hermes Connect", href: "/services/hermes-connect/" },
  },
};
