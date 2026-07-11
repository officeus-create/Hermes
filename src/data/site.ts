export type ClaimStatus =
  | "VERIFIED_PUBLIC"
  | "VERIFIED_INTERNAL"
  | "OWNER_APPROVED_PENDING_SOURCE"
  | "PLACEHOLDER_DO_NOT_PUBLISH";

export type PathDetail = {
  id: string;
  number: string;
  category: string;
  title: string;
  body: string;
  points: string[];
  cta: string;
  image: string;
  imageAlt: string;
  tone: string;
  audience: string;
  overview: string;
  offerings: { title: string; body: string }[];
  process: { title: string; body: string }[];
};

export const site = {
  brand: "Hermes",
  domain: "hermeslogisticus.com",
  navigation: [
    { label: "Paths", href: "#paths" },
    { label: "How it works", href: "#journey" },
    { label: "About", href: "#about" },
  ],
  hero: {
    eyebrow: "Logistics · Growth · Education · Technology",
    title: "Hermes. One ecosystem. Four ways forward.",
    body: "Choose the path that fits your next move: logistics operations, business growth, practical education, or custom digital systems.",
    primaryCta: { label: "Explore your path", href: "#paths" },
    secondaryCta: { label: "Talk to our team", href: "#contact" },
    image: "/images/hermes-hero.jpg",
    imageAlt: "Modern logistics fulfillment center",
  },
  paths: [
    {
      id: "logistics",
      number: "01",
      category: "Hermes Logistics",
      title: "Move freight with a team built around clear operations.",
      body: "A practical route for carriers, shippers, and logistics partners looking for coordinated support in the U.S. market.",
      points: ["Carrier-focused support", "Clear communication", "Operational follow-through"],
      cta: "Explore logistics",
      image: "/images/path-logistics.jpg",
      imageAlt: "Professional freight truck on an open highway",
      tone: "violet",
      audience: "For carriers, shippers, and logistics partners operating in the U.S. market.",
      overview: "Hermes Logistics focuses on the practical work behind freight movement: clear coordination, useful communication, and disciplined follow-through. The exact scope is defined with the team before work begins.",
      offerings: [
        { title: "Carrier support", body: "Operational coordination shaped around the carrier's equipment, lanes, and current needs." },
        { title: "Shipper coordination", body: "A clear starting point for discussing freight requirements and the right operational route." },
        { title: "Partner communication", body: "Structured follow-up that keeps responsibilities and next actions visible." },
      ],
      process: [
        { title: "Share the need", body: "Tell us what you move, where you operate, and what support you are looking for." },
        { title: "Confirm the fit", body: "The logistics team reviews the request and clarifies the workable scope." },
        { title: "Set the next action", body: "If there is a fit, both sides agree on the immediate operational step." },
      ],
    },
    {
      id: "marketing",
      number: "02",
      category: "ProgressoPro",
      title: "Turn attention into a repeatable growth system.",
      body: "A marketing path for teams that want clearer positioning, useful content, and a disciplined way to learn from results.",
      points: ["Organic growth systems", "Campaign structure", "Practical automation"],
      cta: "Explore marketing",
      image: "/images/path-marketing.jpg",
      imageAlt: "Marketing team reviewing analytics on a laptop",
      tone: "magenta",
      audience: "For companies and specialists who need a clearer, more consistent growth system.",
      overview: "ProgressoPro connects positioning, content, campaigns, and practical automation. Work begins with the business objective and current constraints, then moves toward a focused plan rather than a collection of disconnected tactics.",
      offerings: [
        { title: "Positioning and message", body: "Clarify the offer, audience, and language people should understand quickly." },
        { title: "Content and campaigns", body: "Organize useful communication and campaign work around a measurable business goal." },
        { title: "Marketing workflows", body: "Reduce avoidable manual work with practical processes and lightweight automation." },
      ],
      process: [
        { title: "Define the goal", body: "Start with the business outcome, audience, and current marketing reality." },
        { title: "Choose the focus", body: "Identify the smallest useful set of priorities for the next working cycle." },
        { title: "Review and improve", body: "Use actual results to refine the message, workflow, and next actions." },
      ],
    },
    {
      id: "academy",
      number: "03",
      category: "Hermes Business Academy",
      title: "Learn skills that connect to real business work.",
      body: "A structured education path focused on practical operations, sales, leadership, and modern digital workflows.",
      points: ["Logistics Program", "Marketing Program", "COO / Operational Director Program"],
      cta: "Explore the Academy",
      image: "/images/path-academy.jpg",
      imageAlt: "Professional learner working on a laptop in a bright study space",
      tone: "gold",
      audience: "For learners and working professionals building practical business capabilities.",
      overview: "Hermes Business Academy is designed around applied learning. Programs connect concepts to real workflows, decisions, and communication used in logistics, marketing, and operational leadership.",
      offerings: [
        { title: "Logistics Program", body: "Practical foundations for understanding logistics work, communication, and operating routines." },
        { title: "Marketing Program", body: "A structured path through positioning, content, campaigns, and business-focused marketing work." },
        { title: "COO / Operational Director", body: "Systems thinking, KPI, departments, process control, decision-making, and scaling operations." },
      ],
      process: [
        { title: "Choose a direction", body: "Select the program that matches the role or capability you want to develop." },
        { title: "Learn through practice", body: "Work with structured material, examples, and business-oriented exercises." },
        { title: "Apply the system", body: "Turn the learning into a repeatable workflow for real professional work." },
      ],
    },
    {
      id: "technology",
      number: "04",
      category: "IT Development",
      title: "Build the digital system your business actually needs.",
      body: "Practical software for service businesses, from customer journeys and payments to the internal workflows behind them.",
      points: ["CRM systems", "Websites, apps, and online booking", "Automation and internal tools"],
      cta: "Explore IT Development",
      image: "/images/path-technology.jpg",
      imageAlt: "Product team designing a business workflow and mobile application",
      tone: "teal",
      audience: "For service businesses that need software shaped around their actual customer and internal workflows.",
      overview: "IT Development turns a defined business process into a practical digital tool. Initial focus areas include CRM systems, websites and applications, online booking, prepayments, automation, and internal operations.",
      offerings: [
        { title: "CRM and internal tools", body: "Systems for tracking customer work, responsibilities, status, and operational information." },
        { title: "Websites and applications", body: "Digital experiences designed around a specific service, audience, and conversion path." },
        { title: "Booking and automation", body: "Workflows for appointments, prepayments, notifications, and repetitive internal tasks." },
      ],
      process: [
        { title: "Map the workflow", body: "Document the users, steps, information, and business result the system must support." },
        { title: "Build the smallest useful version", body: "Create and review a focused prototype before expanding the scope." },
        { title: "Test in real work", body: "Validate the workflow, correct weak points, and decide what should be developed next." },
      ],
    },
  ] satisfies PathDetail[],
  journey: [
    { number: "01", title: "Choose", body: "Start with the outcome you want, not a generic funnel." },
    { number: "02", title: "Connect", body: "Meet the right team, program, or business direction." },
    { number: "03", title: "Build", body: "Turn the next step into a clear, workable plan." },
    { number: "04", title: "Grow", body: "Review results and keep improving what works." },
  ],
  principles: [
    { title: "People first", body: "Clear communication and practical support shape every path." },
    { title: "Built for action", body: "We favor useful systems over complicated promises." },
    { title: "One connected view", body: "Logistics, growth, education, and technology reinforce each other without losing focus." },
  ],
  contact: {
    eyebrow: "Not sure where to begin?",
    title: "Tell us what you are building.",
    body: "Share your goal and we will help identify the most relevant Hermes path. Until contact delivery is connected, the form remains in preview mode and does not send or store data.",
  },
  claimRegister: [
    { claim: "Hermes operates as a multi-division business ecosystem", status: "VERIFIED_INTERNAL" as ClaimStatus },
    { claim: "Specific performance metrics and partner counts", status: "PLACEHOLDER_DO_NOT_PUBLISH" as ClaimStatus },
  ],
};
