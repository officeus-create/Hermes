export type PathOption = {
  id: string;
  label: string;
  description?: string;
  nextNodeId?: string;
  recommendationId?: string;
};

export type PathNode = {
  id: string;
  step: number;
  question: string;
  helperText: string;
  selectionMode: "single" | "multiple";
  options: PathOption[];
  nextNodeId?: string;
  resolver?: "carrier" | "customer";
};

export type PathSelections = Record<string, string | string[]>;

export type LogisticsRecommendation = {
  id: string;
  route: string;
  eyebrow: string;
  title: string;
  summary: string;
  /** Optional dedicated <title> text (without the " | Hermes Logistics" suffix). Falls back to `title` when unset. Keep under ~41 characters so the rendered tag stays within Google's ~60-character display limit. */
  seoTitle?: string;
  /** Optional dedicated meta description. Falls back to `summary` when unset. Keep under ~155 characters to avoid truncation in search results. */
  seoDescription?: string;
  reasons: string[];
  included: string[];
  nextSteps: string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  eligibilityNote?: string;
  caseStudy?: { label: string; title: string; body: string; checks: string[] };
};

const carrierCta = { label: "Start carrier onboarding", href: "/load-board/?role=carrier#carrier-access" };
const customerCta = { label: "Request transportation", href: "/load-board/?role=shipper#post-load" };
const callCta = { label: "Call Logistics Sales", href: "tel:+12623023626" };

const equipmentOptions: PathOption[] = [
  ["car-hauling", "Car Hauler", "Open or enclosed vehicle transport."],
  ["hotshot", "Hotshot", "Gooseneck or compatible expedited capacity."],
  ["box-truck", "Box Truck", "Straight-truck local or regional capacity."],
  ["cargo-van", "Cargo Van", "Smaller expedited and final-mile capacity."],
  ["power-only", "Power Only", "Tractor capacity for customer or broker trailers."],
  ["dry-van", "Dry Van", "Enclosed general-freight capacity."],
  ["reefer", "Reefer", "Temperature-controlled freight capacity."],
  ["flatbed", "Flatbed", "Open-deck freight and securement requirements."],
  ["step-deck", "Step Deck", "Open-deck capacity for taller freight."],
  ["other-equipment", "Other equipment", "Discuss equipment fit with Logistics Sales."],
].map(([id, label, description]) => ({ id, label, description }));

export const logisticsPathNodes: Record<string, PathNode> = {
  role: {
    id: "role",
    step: 1,
    question: "Who are you?",
    helperText: "Choose the role that best describes the work you need to do today.",
    selectionMode: "single",
    options: [
      { id: "carrier", label: "Carrier", description: "A motor carrier looking for freight or operating support.", nextNodeId: "equipment" },
      { id: "owner-operator", label: "Owner-Operator", description: "You own and operate your truck.", nextNodeId: "equipment" },
      { id: "fleet-owner", label: "Fleet Owner", description: "You manage multiple trucks or equipment types.", nextNodeId: "equipment" },
      { id: "shipper", label: "Shipper", description: "You need freight or vehicles transported.", nextNodeId: "customer-cargo" },
      { id: "dealer", label: "Dealer", description: "You move dealership or auction inventory.", nextNodeId: "customer-cargo" },
      { id: "private-customer", label: "Private Customer", description: "You need a personal vehicle transported.", nextNodeId: "customer-cargo" },
      { id: "broker", label: "Broker", description: "You need verified carrier capacity.", nextNodeId: "broker-situation" },
      { id: "driver", label: "Driver", description: "You are looking for a driving or logistics career path.", nextNodeId: "driver-situation" },
      { id: "agency-partner", label: "Future Agency Partner", description: "You want to discuss building under the Hermes system.", nextNodeId: "agency-situation" },
      { id: "unsure", label: "I am not sure yet", description: "Get a safe general recommendation.", recommendationId: "logistics-guidance" },
    ],
  },
  equipment: {
    id: "equipment",
    step: 2,
    question: "What do you operate?",
    helperText: "Choose every equipment type that applies. Exact truck details are collected only after the recommendation.",
    selectionMode: "multiple",
    options: equipmentOptions,
    nextNodeId: "carrier-need",
  },
  "carrier-need": {
    id: "carrier-need",
    step: 3,
    question: "What do you need most?",
    helperText: "Choose the primary need. Additional services can be connected after qualification.",
    selectionMode: "single",
    options: [
      ["loads-now", "Loads right now", "Search and evaluate current freight."],
      ["dispatch", "Full dispatch service", "Daily search, negotiation, booking, and coordination."],
      ["negotiation", "Negotiation and booking", "Professional rate and booking support."],
      ["back-office", "Documents and billing", "Setup packets, invoicing, and follow-up."],
      ["direct-freight", "Direct shippers and dealers", "Build a pipeline around verified capacity."],
      ["dedicated-lanes", "Dedicated-lane development", "Research repeatable lanes without guarantees."],
      ["reduce-deadhead", "Reduce deadhead and downtime", "Plan around total miles and schedule constraints."],
      ["fleet-growth", "Grow my fleet", "Build controls for multiple trucks."],
      ["new-authority", "Support for a new authority", "Prepare before expecting mature freight access."],
      ["trusted-network", "Trusted Carrier Network", "Understand qualification requirements."],
      ["unsure", "I am not sure yet", "Start with the broadest suitable carrier path."],
    ].map(([id, label, description]) => ({ id, label, description, nextNodeId: "carrier-situation" })),
  },
  "carrier-situation": {
    id: "carrier-situation",
    step: 4,
    question: "What best describes the operation today?",
    helperText: "Do not enter MC, DOT, contact details, exact lanes, or other private data here.",
    selectionMode: "single",
    resolver: "carrier",
    options: [
      ["active-ready", "Active authority and insurance", "The operation is ready for fit review."],
      ["active-needs-support", "Active, but needs stronger operations", "Dispatch or back-office support is inconsistent."],
      ["new-pending", "New or pending authority", "The authority is not yet ready for a mature freight plan."],
      ["fleet-transition", "Adding trucks or changing the model", "The operation needs clearer controls before scaling."],
      ["unsure", "I am not sure yet", "Use a general fit review without assuming eligibility."],
    ].map(([id, label, description]) => ({ id, label, description })),
  },
  "customer-cargo": {
    id: "customer-cargo",
    step: 2,
    question: "What needs to move?",
    helperText: "Exact addresses, VINs, names, and private documents are requested only after qualification.",
    selectionMode: "single",
    options: [
      ["one-vehicle", "One vehicle", "Personal, dealer, or business vehicle transport."],
      ["multiple-vehicles", "Multiple vehicles", "Dealer, auction, or fleet movement."],
      ["luxury-classic", "Luxury or classic vehicle", "May require enclosed or specialized handling."],
      ["auction", "Auction purchase", "Release, condition, and gate requirements matter."],
      ["dealer-inventory", "Dealer inventory", "One-time or repeat dealership movement."],
      ["port-pickup", "Port or airport pickup", "Release, customs, access, and storage risk matter."],
      ["general-freight", "General freight", "Requires a separate equipment and scope review."],
      ["other", "Other", "Let Logistics Sales determine the correct route."],
    ].map(([id, label, description]) => ({ id, label, description, nextNodeId: "customer-situation" })),
  },
  "customer-situation": {
    id: "customer-situation",
    step: 3,
    question: "What is the current timing?",
    helperText: "This qualifies the next action without putting private route information in the URL.",
    selectionMode: "single",
    resolver: "customer",
    options: [
      ["ready-now", "Ready or released now", "Pickup can be qualified immediately."],
      ["date-known", "The ready date is known", "Timing can be reviewed before matching."],
      ["planning", "Still planning", "Start with scope and requirements."],
      ["special-handling", "Special handling is likely", "Access, equipment, or cargo risk needs review."],
      ["unsure", "I am not sure yet", "Use the general transportation-request route."],
    ].map(([id, label, description]) => ({ id, label, description })),
  },
  "broker-situation": {
    id: "broker-situation",
    step: 2,
    question: "What kind of capacity do you need?",
    helperText: "Carrier availability is verified before any operational commitment.",
    selectionMode: "single",
    options: [
      ["car-hauling", "Car-hauling capacity", "Vehicle transport and equipment fit."],
      ["repeat-lanes", "Repeat or dedicated lanes", "Verified capacity and operating requirements."],
      ["specialized", "Specialized capacity", "Authority, insurance, and handling review."],
      ["unsure", "I am not sure yet", "Start with a capacity qualification."],
    ].map(([id, label, description]) => ({ id, label, description, recommendationId: "broker-carrier-capacity" })),
  },
  "driver-situation": {
    id: "driver-situation",
    step: 2,
    question: "What path are you looking for?",
    helperText: "Driver employment remains separate from carrier dispatch and owner-operator onboarding.",
    selectionMode: "single",
    options: [
      ["driving", "Driving role", "Discuss CDL, experience, location, and OTR fit."],
      ["operations", "Dispatch or operations role", "Explore current role needs."],
      ["training", "Training before applying", "Build practical capability first."],
      ["unsure", "I am not sure yet", "Start with careers and training."],
    ].map(([id, label, description]) => ({ id, label, description, recommendationId: "driver-careers" })),
  },
  "agency-situation": {
    id: "agency-situation",
    step: 2,
    question: "What do you already have?",
    helperText: "An agency path starts with responsibilities, controls, assessment, and measurable expectations.",
    selectionMode: "single",
    options: [
      ["experience-team", "Experience and an existing team", "Discuss a controlled pilot."],
      ["experience-solo", "Experience, but no team yet", "Assess the hiring plan and available time."],
      ["sales-management", "Sales or management background", "Assess transferability to logistics."],
      ["starting", "Starting from zero", "The Academy may be a better first step."],
      ["unsure", "I am not sure yet", "Begin with a fit review."],
    ].map(([id, label, description]) => ({ id, label, description, recommendationId: "agency-development" })),
  },
};

const equipmentResult: Record<string, string> = {
  "car-hauling": "carrier-car-hauling",
  hotshot: "carrier-hotshot",
  "box-truck": "carrier-box-truck",
  "cargo-van": "carrier-cargo-van",
  "power-only": "carrier-power-only",
  "dry-van": "carrier-dry-van",
  reefer: "carrier-reefer",
  flatbed: "carrier-flatbed",
  "step-deck": "carrier-step-deck",
};

export function resolveLogisticsRecommendation(selections: PathSelections): string {
  const role = String(selections.role ?? "");
  if (!role || role === "unsure") return "logistics-guidance";
  if (role === "broker") return "broker-carrier-capacity";
  if (role === "driver") return "driver-careers";
  if (role === "agency-partner") return "agency-development";
  if (["shipper", "dealer", "private-customer"].includes(role)) {
    const cargo = String(selections["customer-cargo"] ?? "");
    if (role === "dealer" || cargo === "dealer-inventory") return "shipper-dealer";
    if (cargo === "port-pickup") return "customer-port-pickup";
    if (cargo === "luxury-classic") return "customer-luxury-classic";
    if (["general-freight", "other"].includes(cargo)) return "logistics-guidance";
    return "customer-vehicle-transport";
  }
  const need = String(selections["carrier-need"] ?? "");
  const situation = String(selections["carrier-situation"] ?? "");
  if (situation === "new-pending" || need === "new-authority") return "carrier-new-authority";
  if (["direct-freight", "dedicated-lanes"].includes(need)) return "carrier-direct-freight";
  if (need === "trusted-network") return "carrier-trusted-network";
  if (role === "fleet-owner" || situation === "fleet-transition" || need === "fleet-growth") return "carrier-fleet-owners";
  const equipment = Array.isArray(selections.equipment) ? selections.equipment : [String(selections.equipment ?? "")];
  return equipment.map((item) => equipmentResult[item]).find(Boolean) ?? "carrier-owner-operators";
}

const carrierEquipment = (id: string, slug: string, label: string, fit: string): LogisticsRecommendation => ({
  id,
  route: `/paths/logistics/carriers/${slug}/`,
  eyebrow: `Hermes Logistics · ${label}`,
  title: `${label} dispatch and operating support built around total-mile economics.`,
  summary: `A fit-first path for ${label.toLowerCase()} carriers that need current freight support, professional negotiation, document control, and a clearer plan for repeatable lanes.`,
  seoTitle: `${label} Dispatch Support`,
  seoDescription: `A fit-first path for ${label.toLowerCase()} carriers needing freight support, negotiation, and document control for repeatable lanes.`,
  reasons: [`Your selected equipment is ${label}.`, "Private carrier details belong after the recommendation.", `The first review must confirm ${fit}.`],
  included: ["Daily load search and carrier approval workflow", "Rate negotiation using loaded and deadhead miles", "Broker setup, pickup, delivery, and exception coordination", "Documents, invoicing, and follow-up where included", "Optional direct-freight development after fit is confirmed"],
  nextSteps: ["Submit MC or USDOT, equipment, capacity, location, and availability privately.", "Hermes checks authority, insurance, equipment fit, and current capacity.", "Logistics Sales confirms the suitable path; no load is booked automatically."],
  primaryCta: carrierCta,
  secondaryCta: callCta,
  eligibilityNote: "Freight, rates, lanes, service availability, and business results are not guaranteed.",
});

const simple = (value: LogisticsRecommendation) => value;

export const logisticsRecommendations: LogisticsRecommendation[] = [
  simple({
    id: "carrier-owner-operators",
    route: "/paths/logistics/carriers/owner-operators/",
    eyebrow: "Hermes Logistics · Owner-Operators",
    title: "You don’t get just a dispatcher. You get two departments.",
    seoTitle: "Owner-Operator Dispatch & Growth",
    summary: "One department helps keep the truck moving today. A second department can spend an initial working period of approximately 90 days developing direct relationships around verified capacity.",
    seoDescription: "One team keeps your truck moving today. A second spends an initial ~90-day period developing direct relationships around verified capacity.",
    reasons: ["You operate carrier capacity.", "Your choices point to daily support or a broad fit review.", "Authority, insurance, equipment, lanes, and current Hermes capacity must be verified."],
    included: ["Load search, negotiation, booking, and coordination", "Broker setup, documents, invoicing, and follow-up where included", "Deadhead and schedule planning", "Direct shipper and dealer research under an approved scope", "Potential Trusted Carrier Network qualification after verified performance"],
    nextSteps: ["Provide MC or USDOT, equipment, capacity, current area, and availability privately.", "Hermes verifies authority, insurance, equipment, communication, and fit.", "The team confirms the dispatch, back-office, or growth path before work begins."],
    primaryCta: carrierCta,
    secondaryCta: callCta,
    eligibilityNote: "Direct freight, dedicated lanes, rates, weekly gross, and Trusted Carrier Network eligibility are not guaranteed.",
  }),
  simple({
    id: "carrier-fleet-owners",
    route: "/paths/logistics/carriers/fleet-owners/",
    eyebrow: "Hermes Logistics · Fleet Owners",
    title: "Coordinate multiple trucks with one clear operating and growth system.",
    seoTitle: "Fleet Owner Dispatch & Growth System",
    summary: "A fleet path for dispatch controls, truck-level visibility, consistent handoffs, and a direct-freight pipeline around verified equipment and service areas.",
    reasons: ["Your choices indicate multiple trucks, growth, or an operating transition.", "Scaling requires repeatable approval, documents, and exception workflows.", "Capacity and responsibilities must be verified before expansion."],
    included: ["Truck and equipment profile review", "Dispatch ownership and approval controls", "Lane, deadhead, schedule, and home-time planning", "Document and billing workflows", "Direct-freight development by verified capacity"],
    nextSteps: ["List equipment types and truck counts in the private form.", "Review dispatch, documents, availability, and lane preferences.", "Define a controlled first fleet scope and measurable expectations."],
    primaryCta: carrierCta,
    secondaryCta: callCta,
    eligibilityNote: "Fleet growth, direct freight, and dedicated lanes depend on verified capacity, service quality, market conditions, and current Hermes capacity.",
  }),
  carrierEquipment("carrier-car-hauling", "car-hauling", "Car Hauling", "trailer configuration, vehicle count, open or enclosed capability, operability, and securement"),
  carrierEquipment("carrier-hotshot", "hotshot", "Hotshot", "deck length, payload, trailer type, securement, CDL status where applicable, and commodity fit"),
  carrierEquipment("carrier-box-truck", "box-truck", "Box Truck", "box dimensions, payload, liftgate, dock access, pallet count, and commodity restrictions"),
  carrierEquipment("carrier-cargo-van", "cargo-van", "Cargo Van", "interior dimensions, payload, expedited availability, and cargo handling"),
  carrierEquipment("carrier-power-only", "power-only", "Power Only", "tractor specification, trailer responsibility, interchange, insurance, and compatibility"),
  carrierEquipment("carrier-dry-van", "dry-van", "Dry Van", "trailer size, payload, commodity restrictions, and live or drop handling"),
  carrierEquipment("carrier-reefer", "reefer", "Reefer", "temperature range, washout, monitoring, and food-safety requirements"),
  carrierEquipment("carrier-flatbed", "flatbed", "Flatbed", "deck dimensions, payload, tarps, chains, straps, securement, and commodity dimensions"),
  carrierEquipment("carrier-step-deck", "step-deck", "Step Deck", "deck dimensions, payload, cargo height, permits, tarps, and securement"),
  simple({
    id: "carrier-new-authority",
    route: "/paths/logistics/carriers/new-authority/",
    eyebrow: "Hermes Logistics · New Authority",
    title: "Prepare the operation before expecting mature freight access.",
    seoTitle: "New Authority Carrier Readiness",
    summary: "Verify compliance, insurance, equipment, documents, operating area, and a realistic first freight strategy before dispatch promises are made.",
    reasons: ["Your authority is new, pending, or the primary concern.", "Brokers and customers may apply authority-age and history requirements.", "The correct first step is readiness, not guaranteed loads."],
    included: ["MC and USDOT normalization boundary", "Official FMCSA-source enrichment when connected", "Insurance and document checklist", "Equipment and operating-area review", "Realistic first dispatch and relationship-development plan"],
    nextSteps: ["Submit MC or USDOT and equipment details privately.", "Hermes reviews official data when the approved FMCSA adapter is available.", "The team confirms what can begin now and what must mature first."],
    primaryCta: carrierCta,
    secondaryCta: callCta,
    eligibilityNote: "Hermes does not guarantee freight, rates, broker approval, or business results for a new authority.",
  }),
  simple({
    id: "carrier-direct-freight",
    route: "/paths/logistics/carriers/direct-freight-development/",
    eyebrow: "Hermes Logistics · Direct Freight Development",
    title: "Build the freight network around verified carrier capacity.",
    seoTitle: "Direct Freight Network Development",
    summary: "After qualification, Hermes can define an initial working period—often approximately 90 days—to research and develop relevant direct relationships.",
    reasons: ["You selected direct shippers, dealers, or dedicated lanes.", "Direct freight requires a qualified prospect pipeline and follow-up.", "Repeatable lanes come from verified demand and performance, not preferences alone."],
    included: ["Equipment, capacity, home-market, and lane analysis", "Shipper, dealer, auction, port, manufacturer, warehouse, and broker research", "Decision-maker identification and structured outreach", "Load-list requests and opportunity handoff", "Demand-signal, objection, and follow-up tracking"],
    nextSteps: ["Complete private carrier qualification.", "Define target markets, verified capacity, and lanes to develop or avoid.", "Approve scope, measurement, and handoff between Direct Freight Development and Dispatch."],
    primaryCta: carrierCta,
    secondaryCta: callCta,
    eligibilityNote: "Not every prospect responds. Direct freight, dedicated lanes, rates, and timing are not guaranteed.",
  }),
  simple({
    id: "carrier-trusted-network",
    route: "/paths/logistics/carriers/trusted-carrier-network/",
    eyebrow: "Hermes Logistics · Trusted Carrier Network",
    title: "Trusted capacity is earned through verified operating performance.",
    seoTitle: "Trusted Carrier Network Eligibility",
    summary: "After approximately 60–90 days of successful work, a carrier may become eligible for matching direct inquiries and approved service-area visibility.",
    reasons: ["You asked about the Trusted Carrier Network.", "Eligibility requires verified authority, insurance, equipment, communication, documents, safety, and service.", "The network is not purchased or automatic."],
    included: ["MC and USDOT verification", "Insurance and equipment review", "Communication and document-quality review", "Pickup, delivery, claims, and customer-interaction review", "Lane and service coverage from Hermes history"],
    nextSteps: ["Start with approved carrier onboarding.", "Build verified performance and complete required documents.", "Hermes reviews eligibility and current network capacity."],
    primaryCta: carrierCta,
    secondaryCta: callCta,
    eligibilityNote: "Eligibility, direct inquiries, SEO visibility, and freight volume are not guaranteed.",
  }),
  simple({
    id: "customer-vehicle-transport",
    route: "/paths/logistics/customers/vehicle-transport/",
    eyebrow: "Hermes Logistics · Vehicle Transport",
    title: "Qualify the vehicle, route, timing, and handling before carrier matching.",
    seoTitle: "Vehicle Transport Qualification",
    summary: "A structured request for one or multiple vehicles moving between a private address, dealership, auction, business, or approved location.",
    reasons: ["You selected a vehicle move.", "Matching depends on route, readiness, condition, equipment, access, and timing.", "Private addresses, VINs, names, and documents stay out of the public path."],
    included: ["Pickup and delivery qualification", "Vehicle count, condition, and operability review", "Open or enclosed equipment discussion", "Ready date, access, and special handling", "Carrier fit and rate conversation after completion"],
    nextSteps: ["Submit vehicle, route, timing, condition, and contact information privately.", "Hermes reviews completeness and equipment fit.", "The team confirms the next step; submission does not book automatically."],
    primaryCta: customerCta,
    secondaryCta: callCta,
  }),
  simple({
    id: "customer-port-pickup",
    route: "/paths/logistics/customers/port-pickup/",
    eyebrow: "Hermes Logistics · Port and Airport Pickup",
    title: "Confirm release, access, timing, and storage risk before dispatch.",
    seoTitle: "Port & Airport Vehicle Pickup",
    summary: "A vehicle-transport path where customs, release, identification, access credentials, storage, or demurrage can affect pickup.",
    reasons: ["You selected a port or airport pickup.", "Release and access can block an otherwise suitable carrier.", "The request needs qualification before matching."],
    included: ["Release and customs-status checklist", "Terminal, port, airport, or warehouse access review", "Arrival, pickup window, storage, and demurrage review", "TWIC or escort discussion when applicable", "Vehicle condition, handling, and equipment fit"],
    nextSteps: ["Prepare release status, ready date, facility type, vehicle, and delivery market.", "Submit private documents only through the approved channel.", "Hermes confirms access requirements and begins fit review."],
    primaryCta: customerCta,
    secondaryCta: callCta,
  }),
  simple({
    id: "customer-luxury-classic",
    route: "/paths/logistics/customers/luxury-classic-vehicle/",
    eyebrow: "Hermes Logistics · Luxury and Classic Vehicles",
    title: "Specialized transport starts with handling, insurance, access, and equipment fit.",
    seoTitle: "Luxury & Classic Vehicle Transport",
    summary: "A qualification-first route for rare, luxury, classic, collector, or sensitive vehicles that may require enclosed transport or experienced handling.",
    reasons: ["You identified a luxury or classic vehicle.", "The lowest posted rate is not the only factor.", "Experience, authority, insurance, equipment, handling, and access must be verified."],
    included: ["Open versus enclosed review", "Operability, clearance, loading, securement, and handling", "Authority, insurance, and experience qualification", "Pickup access, release, storage, and timing", "Private handling of VINs, documents, names, and exact addresses"],
    nextSteps: ["Submit a non-sensitive route, timing, vehicle, operability, and handling summary.", "Share private documents only after approved contact.", "Hermes confirms equipment and qualification."],
    primaryCta: customerCta,
    secondaryCta: callCta,
    caseStudy: {
      label: "Real inbound request · not a completed case study",
      title: "A rare 1961 Maserati required direct carrier qualification.",
      body: "Hermes received an inbound request involving a 1961 Maserati 3500 Vignale Spyder arriving from Puerto Rico, with requested pickup near JFK Airport and delivery to Wilmington, North Carolina. It illustrates direct demand; completion is not claimed.",
      checks: ["Release, customs, and pickup access", "Open versus enclosed transport", "Luxury and classic vehicle experience", "Authority, insurance, handling, storage, and accessorials"],
    },
  }),
  simple({
    id: "shipper-dealer",
    route: "/paths/logistics/shippers-dealers/",
    eyebrow: "Hermes Logistics · Shippers and Dealers",
    title: "Move inventory through a qualified request, not a generic contact form.",
    seoTitle: "Shipper & Dealer Vehicle Intake",
    summary: "A B2B intake path for dealership inventory, auction purchases, repeat vehicle movement, and other approved shipper needs.",
    reasons: ["You identified as a dealer or selected dealership inventory.", "Repeat work needs consistent route, timing, vehicle, and condition data.", "Matching begins only after qualification."],
    included: ["Single and multi-vehicle requests", "Dealer, auction, and business pickup context", "Ready dates, delivery windows, operability, and fit", "Rate or budget context without automatic acceptance", "Routing to the Shipper/Dealer team"],
    nextSteps: ["Submit the first qualified request or representative lane.", "Hermes reviews completeness and current capacity.", "Define the operating process for approved repeat work."],
    primaryCta: customerCta,
    secondaryCta: callCta,
  }),
  simple({
    id: "broker-carrier-capacity",
    route: "/paths/logistics/brokers/carrier-capacity/",
    eyebrow: "Hermes Logistics · Broker Capacity",
    title: "Request verified carrier capacity with the details an operating team needs.",
    seoTitle: "Request Verified Carrier Capacity",
    summary: "A broker path requiring origin, destination, dates, equipment, commodity, rate, authority, insurance, and tracking expectations.",
    reasons: ["You identified as a broker.", "Capacity is not available until carrier and load fit are verified.", "Structured intake reduces repeated questions."],
    included: ["Load and broker identity review", "Origin, destination, timing, commodity, and equipment fit", "Rate, weight, dimensions, and special requirements", "Authority, insurance, and tracking expectations", "Handoff after verification"],
    nextSteps: ["Open the broker request and provide operational details.", "Hermes reviews compatibility and current capacity.", "The team confirms the action; no carrier is committed automatically."],
    primaryCta: { label: "Request verified carrier capacity", href: "/load-board/?role=broker#post-load" },
    secondaryCta: callCta,
  }),
  simple({
    id: "driver-careers",
    route: "/paths/logistics/drivers/",
    eyebrow: "Hermes Logistics · Drivers and Careers",
    title: "Keep driver employment, operations roles, and training on the correct path.",
    seoTitle: "Driver & Logistics Career Path",
    summary: "A career route for driving, dispatch, sales, operations, or an Academy path before applying.",
    reasons: ["You selected the driver or career path.", "Employment review is separate from carrier dispatch.", "Fit depends on qualifications, experience, availability, and current needs."],
    included: ["Driving and car-hauling experience review", "CDL and OTR discussion where relevant", "Dispatch, sales, and operations routing", "Languages, location, and availability", "Academy connection when training comes first"],
    nextSteps: ["Prepare factual experience, qualifications, location, languages, and availability.", "Submit the career application.", "Hermes may invite a suitable candidate to an interview, test, or training path."],
    primaryCta: { label: "Apply for a logistics role", href: "/logistics/apply/?for=career" },
    secondaryCta: { label: "Explore the Academy", href: "/paths/academy/" },
    eligibilityNote: "Hermes does not guarantee an interview, training place, employment, compensation, or placement.",
  }),
  simple({
    id: "agency-development",
    route: "/paths/logistics/agency-partners/",
    eyebrow: "Hermes Logistics · Agency Partners",
    title: "Discuss an agency path through a controlled fit assessment.",
    seoTitle: "Agency Partner Fit Assessment",
    summary: "A structured conversation for operators, sales leaders, or managers exploring a remote logistics agency under Hermes standards and controls.",
    reasons: ["You selected the agency-partner path.", "The model requires operating, sales, hiring, leadership, language, and time review.", "Any path starts with controls and measurable expectations."],
    included: ["Location, market, languages, and network review", "Logistics, sales, operations, and management experience", "Team or hiring-capacity assessment", "Available-time and responsibility assessment", "Pilot discussion only after fit"],
    nextSteps: ["Submit factual experience and current capacity.", "Hermes reviews fit before commercial terms.", "If suitable, define a controlled assessment or pilot."],
    primaryCta: { label: "Discuss a Hermes agency path", href: "/logistics/apply/?for=agency" },
    eligibilityNote: "Applying does not create a franchise, agency, partnership, territory, income, or approval guarantee.",
  }),
  simple({
    id: "logistics-guidance",
    route: "/paths/logistics/guidance/",
    eyebrow: "Hermes Logistics · Guided Fit Review",
    title: "Start with the request, not a guessed service.",
    seoTitle: "Logistics Sales Guided Fit Review",
    summary: "Use Logistics Sales when the role, equipment, cargo, authority, or service path is not yet clear.",
    reasons: ["You selected “I am not sure yet” or a request outside the current pilot.", "A general review is safer than the wrong route.", "No eligibility, freight, equipment fit, or scope is assumed."],
    included: ["Clarify freight, operations, transportation, careers, or agency intent", "Identify minimum qualification facts", "Route to the correct existing form or team", "Explain current preview and production boundaries"],
    nextSteps: ["Call Logistics Sales or restart with more information.", "Share private details only through the approved route.", "The team confirms the correct next action."],
    primaryCta: callCta,
    secondaryCta: { label: "Restart the Logistics Path", href: "/paths/logistics/find-your-path/" },
  }),
];

export const logisticsRecommendationsById = Object.fromEntries(
  logisticsRecommendations.map((recommendation) => [recommendation.id, recommendation]),
) as Record<string, LogisticsRecommendation>;
