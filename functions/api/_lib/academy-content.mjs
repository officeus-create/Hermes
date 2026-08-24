const dispatchFoundations = {
  program_slug: "us-logistics-operations",
  lesson_id: "dispatch-foundations",
  version: "2026-08-24-v1",
  title: "Dispatch foundations: roles, control and the load workflow",
  purpose: "Understand the main responsibilities in a carrier dispatch workflow, who controls each decision and which information must be confirmed before work moves forward.",
  objectives: [
    "Distinguish carrier control from dispatcher coordination and support.",
    "Map load search, communication, route review, setup, documents, booking approval and follow-up into one workflow.",
    "Identify which facts a dispatcher can organize and which decisions remain with the motor carrier.",
    "Separate a useful operating question from an unsupported promise about loads, rates, utilization or revenue.",
    "Record a clear owner and next action when information is missing or a workflow breaks.",
  ],
  sections: [
    {
      title: "Assign responsibilities before acting",
      summary: "A reliable workflow makes search, calls, route review, setup, documents and approval ownership explicit instead of assuming that one person controls everything.",
      actions: [
        "Carrier: controls the truck, driver, safety, compliance and final load approval.",
        "Dispatcher: may research, organize information, coordinate approved communication and prepare follow-up within the agreed scope.",
        "Broker or shipper: provides the opportunity, requirements and commercial information they control.",
        "When a responsibility is unclear, stop and identify the decision owner before proceeding.",
      ],
    },
    {
      title: "Follow the information flow",
      summary: "A load opportunity becomes useful only after the relevant equipment, area, timing, access, document and approval questions are understood.",
      actions: [
        "Search or receive an opportunity without treating availability as a promise.",
        "Confirm the facts needed to review operating fit.",
        "Surface conflicts or missing information rather than hiding uncertainty.",
        "Preserve the carrier's final approval before any booking action.",
      ],
    },
    {
      title: "Separate coordination from authority",
      summary: "Support can reduce repeatable workload, but it does not transfer the carrier's legal, safety or operating responsibility.",
      actions: [
        "Document what communication the dispatcher may handle.",
        "Define what always requires carrier confirmation.",
        "Keep credentials, security codes, shipment details and payment data out of public URLs or learner fixtures.",
        "Measure workflow quality without promising market outcomes.",
      ],
    },
  ],
  approved_sources: [
    { title: "Dispatch Service vs Self-Dispatch", path: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
  ],
  scenario: "Synthetic case: a small car-hauling carrier wants help organizing load search and back-office work but has not yet defined who may discuss a load, who reviews route fit, who handles setup documents or who gives final booking approval.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 300,
    prompt: "Create a responsibility map for the synthetic carrier workflow.",
    parts: [
      "Workflow — list search, communication, route/equipment review, setup/documents and booking/follow-up in a sensible sequence.",
      "Owner — assign each step to carrier, dispatcher/support, broker/shipper or shared review.",
      "Carrier-control boundary — identify at least three decisions that must remain with the carrier.",
      "Missing-information rule — state what happens when a critical fact or approval is missing.",
      "Claim-safety note — give one example of a useful operating statement and one outcome claim that should not be made.",
    ],
  },
  rubric: [
    { key: "workflow_sequence", label: "Workflow sequence", pass: "The main operating steps are ordered coherently and no booking is implied before review." },
    { key: "role_clarity", label: "Role clarity", pass: "Carrier, dispatcher/support and external-party responsibilities are distinguished." },
    { key: "carrier_control", label: "Carrier control", pass: "Truck, driver, safety and final approval remain explicitly with the carrier." },
    { key: "missing_information", label: "Missing-information handling", pass: "The learner pauses, escalates or verifies rather than inventing an answer." },
    { key: "privacy_boundary", label: "Privacy boundary", pass: "Sensitive credentials, payment and shipment values are not exposed in public or learner systems." },
    { key: "claim_safety", label: "Claim safety", pass: "No guaranteed load, rate, utilization, profit or revenue claim is used." },
  ],
  boundaries: [
    "Use the synthetic carrier and approved public resource only; do not paste a real load, carrier, broker, driver or customer record.",
    "This lesson teaches responsibility and information flow. It does not authorize a learner to dispatch, book freight, sign documents or represent a carrier.",
    "Human review is required for the assignment and remains separate from self-tracked lesson progress.",
  ],
  next: {
    lesson_id: "carrier-broker-communication",
    label: "Continue to carrier and broker communication",
  },
};

const logisticsConversation = {
  program_slug: "us-logistics-operations",
  lesson_id: "carrier-broker-communication",
  version: "2026-08-24-v1",
  title: "Professional logistics conversation: five stages",
  purpose: "Recognize the current stage of a professional logistics conversation and choose a useful next question without unsupported promises or pressure.",
  objectives: [
    "Separate first-contact clarity from diagnosis, next-step agreement, objection clarification and follow-up.",
    "Ask a relevant next question instead of delivering a long generic pitch.",
    "Explain scope and next steps without promising loads, rates, revenue, acceptance, employment or timing.",
    "Respond to hesitation by clarifying the underlying concern.",
    "Document the current stage, next action and unresolved question for human review.",
  ],
  sections: [
    {
      title: "Stage 1 — first-contact clarity",
      summary: "Establish who is speaking, why the conversation may be relevant and whether the other person is willing to continue.",
      actions: [
        "Keep the opening short enough for the other person to respond.",
        "State the purpose in plain language.",
        "Ask permission to continue or one simple relevance question.",
        "Do not claim guaranteed loads, rates, direct shippers, savings or results.",
      ],
    },
    {
      title: "Stage 2 — diagnosis",
      summary: "Understand the current situation, problem, impact, desired outcome and decision process before proposing a next step.",
      actions: [
        "Ask how the work is handled today.",
        "Identify where uncertainty, delays, missed follow-up or unnecessary work appear.",
        "Clarify what a better process would need to make easier or clearer.",
        "Summarize what you heard before moving forward.",
      ],
    },
    {
      title: "Stage 3 — scope and next-step clarity",
      summary: "Explain the reviewed next step, what each side controls and what information is actually required.",
      actions: [
        "Clarify what is included and excluded.",
        "Separate information needed now from data that belongs in a secure approved route later.",
        "Name who makes the final operational, booking, safety or financial decision.",
        "Do not invent urgency, acceptance, timing or financial outcomes.",
      ],
    },
    {
      title: "Stage 4 — objection clarification",
      summary: "Understand the reason behind hesitation and determine whether a useful next step exists; the goal is not to defeat or manipulate the person.",
      actions: [
        "Acknowledge the concern without arguing.",
        "Ask one clarifying question.",
        "Respond only to the stated concern.",
        "Restate the boundary or next option and accept a clear no.",
      ],
    },
    {
      title: "Stage 5 — pressure-free follow-up",
      summary: "Preserve context and complete an agreed next action without repetitive or unwanted contact.",
      actions: [
        "State the reason for the follow-up and summarize the prior discussion briefly.",
        "Provide the promised resource or question and one clear next action.",
        "Make it easy to decline or change timing.",
        "Record the next action and stop condition; do not rotate accounts or wording to bypass a decline.",
      ],
    },
  ],
  boundaries: [
    "Use synthetic or explicitly approved anonymized examples only.",
    "Do not submit credentials, banking data, identity documents, contracts, shipment records, private contact details or live customer/carrier information.",
    "A learner may prepare a draft response; a person controls every real external message, offer, agreement or operational decision.",
    "Self-tracked completion is not reviewer acceptance, Academy completion, employment, certification, income or permission to work with live operations.",
  ],
  next: {
    lesson_id: "equipment-lane-logic",
    label: "Continue to equipment and lane logic",
  },
};

const equipmentLaneLogic = {
  program_slug: "us-logistics-operations",
  lesson_id: "equipment-lane-logic",
  version: "2026-08-24-v1",
  title: "Equipment and lane logic: verify fit before recommendation",
  purpose: "Review equipment, capacity, deadhead, timing, route and pickup/delivery constraints without pretending that an opportunity is safe, profitable or bookable before the carrier approves it.",
  objectives: [
    "Identify the operating facts required before recommending that a carrier review an opportunity.",
    "Separate equipment fit, route fit, timing fit and commercial information instead of collapsing them into one guess.",
    "Recognize deadhead and pickup/delivery access as review inputs rather than universal decision rules.",
    "Label facts, assumptions and unanswered questions explicitly.",
    "Keep safety, operating judgment and final approval with the carrier.",
  ],
  sections: [
    {
      title: "Check equipment and practical capacity",
      summary: "Truck/trailer type, practical capacity, dimensions, specialty capability and operating restrictions must be understood before fit can be discussed.",
      actions: [
        "Use the carrier's approved equipment profile rather than guessing from a general truck class.",
        "Confirm capacity and restrictions relevant to the opportunity.",
        "Treat uncertain dimensions, operability or specialty requirements as questions to resolve.",
      ],
    },
    {
      title: "Check route, deadhead and timing",
      summary: "A route is more than origin and destination; operating area, current location, empty miles, pickup/delivery timing and access constraints can change the fit review.",
      actions: [
        "Separate current location from pickup location and loaded route.",
        "Confirm pickup and delivery windows or constraints when available.",
        "Surface deadhead and access considerations without inventing a universal acceptable threshold.",
      ],
    },
    {
      title: "Return the decision to the carrier",
      summary: "Dispatch support can organize facts and conflicts, but the carrier controls safety, operating cost judgment and final acceptance.",
      actions: [
        "Summarize confirmed facts.",
        "List unresolved questions and material assumptions.",
        "Do not describe an opportunity as profitable, safe or approved without the relevant decision and evidence.",
      ],
    },
  ],
  approved_sources: [
    { title: "Dispatch Service vs Self-Dispatch", path: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
  ],
  scenario: "Synthetic opportunity: a carrier has an approved equipment profile and preferred operating area, but the opportunity summary is missing one access constraint and the learner does not know whether the current deadhead or timing works for the carrier.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 300,
    prompt: "Produce a fact-assumption-question fit review for the synthetic opportunity.",
    parts: [
      "Confirmed facts — list only what is actually known about equipment, route and timing.",
      "Assumptions — identify anything the learner is tempted to infer but cannot yet prove.",
      "Questions — list the minimum questions needed to review equipment, route, access and timing fit.",
      "Carrier decision — state which judgment stays with the carrier before any booking.",
      "Recommendation wording — write one safe sentence that surfaces the opportunity without calling it profitable, guaranteed or approved.",
    ],
  },
  rubric: [
    { key: "equipment_facts", label: "Equipment facts", pass: "Equipment and capacity are based on the approved profile, not guessed." },
    { key: "route_timing", label: "Route and timing", pass: "Deadhead, operating area, windows and access are treated as separate review inputs." },
    { key: "fact_assumption", label: "Fact vs assumption", pass: "Unknowns are not presented as facts." },
    { key: "useful_questions", label: "Useful questions", pass: "Questions are necessary and specific enough to resolve fit uncertainty." },
    { key: "carrier_decision", label: "Carrier decision", pass: "Safety, operating judgment and final approval remain with the carrier." },
    { key: "claim_safety", label: "Claim safety", pass: "No profitability, rate, utilization, safety or booking guarantee is introduced." },
  ],
  boundaries: [
    "Use synthetic opportunity data only; do not submit a live load, rate, VIN, driver location or private route record.",
    "This exercise is a review method, not dispatch authority or safety advice.",
    "Human review is required before the assignment can count as accepted evidence.",
  ],
  next: {
    lesson_id: "documents-setup",
    label: "Continue to documents and setup",
  },
};

const documentsSetup = {
  program_slug: "us-logistics-operations",
  lesson_id: "documents-setup",
  version: "2026-08-24-v1",
  title: "Documents and setup: verify, submit, record and refresh",
  purpose: "Understand how a controlled carrier setup packet is prepared and maintained while keeping credentials, unnecessary personal data and unverified payment changes out of the workflow.",
  objectives: [
    "Recognize the main setup areas: business identity, tax information, authority, insurance, equipment, payment/factoring, communication ownership and document control.",
    "Use a controlled core packet while reviewing each broker's requirements separately.",
    "Follow a verify → request review → secure submission → status record → refresh cycle.",
    "Identify information that should never appear in a setup packet, public URL, analytics event or ordinary learner fixture.",
    "Keep carrier authorization and final responsibility explicit throughout document handling.",
  ],
  sections: [
    {
      title: "Build a verified core packet",
      summary: "A consistent core packet reduces conflicting business names, expired certificates, incorrect payment instructions, unclear dispatch authority and unnecessary data exposure.",
      actions: [
        "Verify business identity and authorized signer role.",
        "Confirm authority and insurance status through appropriate sources.",
        "Keep equipment profile and operating restrictions current.",
        "Document payment/factoring and communication ownership without trusting unexpected changes blindly.",
      ],
    },
    {
      title: "Adapt to the broker request",
      summary: "One packet does not guarantee acceptance or satisfy every broker; review the stated requirements and share only what is required through an approved route.",
      actions: [
        "Compare the request with the controlled core packet.",
        "Resolve missing, expired or uncertain items.",
        "Use the broker's approved portal or controlled route for required documents.",
        "Record what was sent, current status and the responsible owner.",
      ],
    },
    {
      title: "Protect sensitive information",
      summary: "Setup work must not become a credential, identity or payment-data dump.",
      actions: [
        "Never include passwords, API keys, authentication or recovery codes.",
        "Do not add identity documents or sensitive personal values unless a specific approved secure process requires them.",
        "Independently verify unexpected banking or payment changes.",
        "Keep load-specific rate confirmations and transport documents separate from a reusable core setup packet.",
      ],
    },
  ],
  approved_sources: [
    { title: "Broker Setup Packet Checklist", path: "/logistics/resources/broker-setup-packet-checklist/" },
  ],
  scenario: "Synthetic case: a broker requests setup from a carrier whose core packet contains current business and authority information, but an insurance document needs refresh and an unexpected message proposes new payment instructions.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 350,
    prompt: "Create a safe setup-review plan for the synthetic request.",
    parts: [
      "Packet areas — identify which of the eight core areas are relevant to the request.",
      "Verify — state which facts or document versions must be checked before submission.",
      "Secure submission — state what should be shared and through what kind of approved route.",
      "Payment-change control — explain how the unexpected instruction should be handled before any change.",
      "Status record — define what submission/status metadata may be recorded without exposing private documents.",
      "Refresh rule — state what triggers replacement or re-verification later.",
    ],
  },
  rubric: [
    { key: "packet_scope", label: "Packet scope", pass: "Relevant setup areas are identified without assuming one universal broker packet." },
    { key: "verification", label: "Verification", pass: "Identity, authority, insurance, equipment or payment uncertainty is resolved before representation." },
    { key: "secure_submission", label: "Secure submission", pass: "Only required information is routed through an approved secure process." },
    { key: "credential_boundary", label: "Credential boundary", pass: "Passwords, codes, recovery information and unnecessary identity data are excluded." },
    { key: "payment_control", label: "Payment control", pass: "Unexpected payment changes require independent verification." },
    { key: "status_refresh", label: "Status and refresh", pass: "The learner records non-sensitive status metadata and defines a refresh trigger." },
    { key: "approval_boundary", label: "Approval boundary", pass: "A complete packet is not described as guaranteed broker approval." },
  ],
  boundaries: [
    "Use synthetic documents and statuses only; do not paste a real W-9, insurance certificate, bank instruction, identity document, rate confirmation or broker credential.",
    "This lesson is operational education, not legal, tax, insurance, banking, safety, regulatory or accounting advice.",
    "Passing the rubric does not authorize a learner to submit documents or change carrier payment information.",
  ],
  next: {
    lesson_id: "negotiation-practice",
    label: "Continue to negotiation practice",
  },
};

const negotiationPractice = {
  program_slug: "us-logistics-operations",
  lesson_id: "negotiation-practice",
  version: "2026-08-24-v1",
  title: "Negotiation practice: clarify the objection",
  purpose: "Apply the conversation-stage method to a synthetic objection and submit a bounded written response for human review.",
  objectives: [
    "Identify the current conversation stage and explain why.",
    "Acknowledge a concern without attacking the existing arrangement.",
    "Ask one focused diagnostic question.",
    "Offer a claim-safe next option while preserving the other person's control.",
  ],
  scenario: "Synthetic case: a car-hauling owner-operator says they already have dispatch help, do not want to change a working process, prefer direct-shipper freight and do not want to pay twice for the same responsibilities.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 120,
    prompt: "Write one response containing exactly four parts.",
    parts: [
      "Conversation stage — identify the stage and explain why in one sentence.",
      "Acknowledgment — recognize the concern without agreeing to an unsupported claim.",
      "Next question — ask one question that identifies the primary issue behind the objection.",
      "Boundary and option — explain what can be reviewed next without promising direct shippers, rates, savings, revenue or a contract.",
    ],
  },
  rubric: [
    { key: "stage_identification", label: "Stage identification", pass: "Correctly identifies objection clarification and gives a defensible reason." },
    { key: "acknowledgment", label: "Acknowledgment", pass: "Recognizes the concern without criticizing the current provider or claiming agreement." },
    { key: "diagnostic_question", label: "Diagnostic question", pass: "Asks one focused question that reveals the primary concern." },
    { key: "claim_safety", label: "Claim safety", pass: "Does not promise direct shippers, loads, rates, savings, revenue, acceptance, timing or outcomes." },
    { key: "control_next_step", label: "Control and next step", pass: "Offers a comparison or reviewed option and preserves the person's final decision." },
    { key: "tone_length", label: "Tone and length", pass: "Clear, professional, respectful and within 120 words." },
  ],
  boundaries: [
    "Use the synthetic scenario only; do not paste a real call, contact, rate, route, contract or customer/carrier record.",
    "All six rubric items require human review. Revision may be submitted again through the existing Evidence workspace.",
    "Passing this exercise means only that the response met the learning rubric.",
  ],
  next: {
    lesson_id: "operating-rhythm",
    label: "Continue to operating rhythm",
  },
};

const operatingRhythm = {
  program_slug: "us-logistics-operations",
  lesson_id: "operating-rhythm",
  version: "2026-08-24-v1",
  title: "Operating rhythm: plan, act, evidence, review, correct",
  purpose: "Turn day-to-day logistics work into a repeatable control loop with priorities, status updates, handoffs, evidence and correction instead of relying on memory or activity volume alone.",
  objectives: [
    "Define a small set of priorities before work begins.",
    "Record status and evidence in a way another authorized teammate or reviewer can understand.",
    "Use handoffs with owner, context, current state and next action.",
    "Interpret activity metrics as signals rather than guarantees of quality or business outcomes.",
    "Close the loop by reviewing errors, unresolved items and the next improvement target.",
  ],
  sections: [
    {
      title: "Plan the work around priorities",
      summary: "A useful plan identifies the most important work, prerequisites and fallback tasks instead of filling a schedule with arbitrary activity counts.",
      actions: [
        "Name the top operating priorities and why they matter.",
        "Identify information or approvals required before each priority can advance.",
        "Keep a fallback task for blocked work without hiding the blocker.",
      ],
    },
    {
      title: "Make status and handoffs reviewable",
      summary: "A teammate should be able to understand what happened, what remains unresolved and who owns the next action without reconstructing the whole day from messages.",
      actions: [
        "Record current state and material evidence.",
        "Name the responsible role for the next action.",
        "Preserve relevant context without copying unnecessary private data.",
        "Escalate blockers that require a carrier, supervisor or other authorized human decision.",
      ],
    },
    {
      title: "Review and correct",
      summary: "The end of the loop is not a report of activity; it is a decision about what to repeat, change, verify or stop next.",
      actions: [
        "Compare intended work with completed and blocked work.",
        "Separate quantity signals from quality and outcome evidence.",
        "Identify one recurring error or friction point.",
        "Define one bounded correction and the evidence that will show whether it helped.",
      ],
    },
  ],
  scenario: "Synthetic workday: several logistics tasks are planned, one opportunity becomes blocked by missing carrier approval, a setup item needs refreshed information, and a follow-up requires another authorized role. The learner must produce a plan and end-of-cycle review without using real operational records.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 350,
    prompt: "Create a synthetic operating plan and end-of-cycle review using the same control loop.",
    parts: [
      "Priorities — choose three tasks and identify the prerequisite or decision owner for each.",
      "Status format — show how completed, blocked and waiting states will be recorded.",
      "Handoff — write one role-based handoff with context, current state and next action.",
      "Evidence — name what can demonstrate that work occurred without exposing private records.",
      "Review — identify one friction point and one correction for the next cycle.",
      "Metric boundary — explain why activity volume alone does not prove quality, acceptance or business outcome.",
    ],
  },
  rubric: [
    { key: "priority_clarity", label: "Priority clarity", pass: "Tasks are ordered by a defensible operating reason rather than arbitrary activity volume." },
    { key: "state_visibility", label: "State visibility", pass: "Completed, blocked and waiting work can be distinguished." },
    { key: "handoff_quality", label: "Handoff quality", pass: "Responsible role, context, current state and next action are clear." },
    { key: "evidence_boundary", label: "Evidence boundary", pass: "Useful evidence is named without exposing live carrier, shipment or customer data." },
    { key: "correction_loop", label: "Correction loop", pass: "One friction point leads to a specific next-cycle correction." },
    { key: "metric_interpretation", label: "Metric interpretation", pass: "Activity counts are treated as signals, not proof of quality, revenue or progression." },
  ],
  boundaries: [
    "Use synthetic tasks and role names only; do not paste a real load board, CRM record, private message, customer/carrier identity or live KPI report.",
    "Historical schedules and activity quotas are reference material, not universal current Academy requirements.",
    "Completing this lesson does not create operational access, employment, promotion or permission to direct live logistics work.",
  ],
};

const positioningOffer = {
  program_slug: "marketing",
  lesson_id: "positioning-offer",
  version: "2026-08-24-v1",
  title: "Positioning and offer: define the useful next action",
  purpose: "Connect a specific audience and business problem to a bounded service scope, evidence boundary and useful next action without promising an outcome.",
  objectives: [
    "Define the business objective before choosing a channel or format.",
    "Name a specific audience and problem in language that can be checked against the approved offer.",
    "Separate useful scope from unsupported promises, assumptions and future possibilities.",
    "Identify what evidence is available and what still requires human verification.",
    "Choose one next action that the destination can actually fulfill.",
  ],
  sections: [
    {
      title: "Start with the business objective",
      summary: "A channel is not the objective. Define the action the business needs before deciding how to distribute the message.",
      actions: [
        "Name one primary audience and one problem worth solving.",
        "Define the useful next action: review, compare, prepare, apply, request or schedule only when the destination supports it.",
        "Avoid beginning with posting volume, follower targets or a platform tactic.",
      ],
    },
    {
      title: "Frame the offer around bounded scope",
      summary: "A useful offer explains what can be reviewed or delivered, what remains outside scope and which decision stays with the customer or human owner.",
      actions: [
        "Describe the service or learning scope in plain language.",
        "Separate current capability from future ideas.",
        "State the important exclusion or decision boundary.",
        "Use differentiation that can be demonstrated rather than a superlative that cannot be proved.",
      ],
    },
    {
      title: "Separate proof from promise",
      summary: "Evidence can support a claim, but it does not turn an uncertain future result into a guarantee.",
      actions: [
        "Identify which facts are visible on an approved source.",
        "Label assumptions, estimates and unresolved claims for human review.",
        "Do not convert historical results, platform behavior or a single case into a universal promise.",
      ],
    },
  ],
  scenario: "Synthetic case: a service business has a useful website and marketing capability, but its message currently mixes audience, features, broad outcome claims and several competing calls to action.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 250,
    prompt: "Create one six-part positioning and offer frame for the synthetic business.",
    parts: [
      "Audience — identify one specific audience and why the problem matters to them.",
      "Problem — describe the current friction without exaggeration.",
      "Useful scope — state what the offer can actually help review, build or improve.",
      "Evidence boundary — name what is supported and what still needs verification.",
      "Differentiation or objection — give one defensible distinction or address one likely concern.",
      "Next action — choose one CTA that the destination can fulfill now.",
    ],
  },
  rubric: [
    { key: "audience_problem", label: "Audience and problem", pass: "Audience and problem are specific, coherent and not inflated." },
    { key: "scope_boundary", label: "Scope boundary", pass: "Useful scope and important exclusions are clear." },
    { key: "differentiation", label: "Defensible differentiation", pass: "Difference is concrete and does not rely on unverifiable superiority claims." },
    { key: "evidence_safety", label: "Evidence safety", pass: "Supported facts, assumptions and review-needed claims are separated." },
    { key: "objection_clarity", label: "Objection clarity", pass: "Concern is answered without pressure, invented urgency or outcome promises." },
    { key: "cta_fit", label: "CTA fit", pass: "One next action matches the actual destination and current readiness." },
  ],
  boundaries: [
    "Use synthetic business context and approved public source material only.",
    "Do not promise reach, traffic, ranking, leads, sales, savings, response time, employment or other future outcomes.",
    "Passing this lesson means the positioning frame met the learning rubric; it does not authorize publication, pricing, an offer change or client communication.",
  ],
  next: {
    lesson_id: "website-first-content",
    label: "Continue to website-first content",
  },
};

const websiteFirstContent = {
  program_slug: "marketing",
  lesson_id: "website-first-content",
  version: "2026-08-24-v1",
  title: "Website-first content: build a one-week distribution plan",
  purpose: "Turn approved public website assets into a coherent five-record organic distribution plan instead of inventing disconnected posts or sending every audience to the homepage.",
  objectives: [
    "Identify the correct canonical website owner for a topic.",
    "Match each topic to a specific audience and funnel stage.",
    "Create platform-appropriate concepts rather than copying one universal post.",
    "Write useful hooks and value statements without unsupported outcome claims.",
    "Choose one CTA that matches the destination page and one privacy-safe measurement path.",
    "Flag evidence, entity, freshness, privacy or platform uncertainty for human review.",
  ],
  sections: [
    {
      title: "Start with the canonical destination",
      summary: "Every content record begins with an approved public page that owns the topic. The homepage, private files, previews, redirects and draft routes are not substitutes.",
      actions: [
        "Name the exact public destination before writing the hook.",
        "Define the audience and funnel stage that fit that page.",
        "Choose one CTA that the destination can actually fulfill.",
      ],
    },
    {
      title: "Adapt to the platform",
      summary: "Facebook, Threads and Instagram require different presentation choices even when they distribute the same canonical source.",
      actions: [
        "Facebook: provide enough context to understand the problem before the CTA.",
        "Threads: lead with a clear observation, tension or useful opinion and keep the explanation concise.",
        "Instagram: begin with the visual idea and name a realistic destination strategy rather than assuming every caption link is clickable.",
        "Do not publish identical copy across platforms or treat an emoji change as a new content version.",
      ],
    },
    {
      title: "Keep measurement privacy-safe",
      summary: "UTM values may describe source, medium, campaign and a stable variant, but they must never carry personal or private operational information.",
      actions: [
        "Use utm_source=facebook|threads|instagram.",
        "Use utm_medium=organic_social.",
        "Use a controlled campaign value tied to the business direction.",
        "Use a stable safe variant ID in utm_content.",
        "Never put names, emails, phone numbers, identifiers, private routes, budgets or free-text messages in a URL.",
      ],
    },
  ],
  scenario: "Synthetic case: a U.S.-market logistics and business-services ecosystem has approved public pages in Logistics, Marketing, Technology and Academy and needs a one-week organic content plan. The learner receives no social credentials, customer data, private analytics, real leads, private routes, contracts, rates or internal conversations.",
  approved_sources: [
    { title: "Dispatch Service vs Self-Dispatch", path: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
    { title: "Broker Setup Packet Checklist", path: "/logistics/resources/broker-setup-packet-checklist/" },
    { title: "Search-to-Inquiry Conversion Checklist", path: "/resources/search-to-inquiry-conversion-checklist/" },
    { title: "Academy — U.S. Logistics Operations", path: "/academy/us-logistics-operations/" },
    { title: "Technical SEO Checklist", path: "/resources/technical-seo-checklist/" },
  ],
  assignment: {
    submission_type: "written_reflection",
    prompt: "Create exactly five content records — one for each approved source page.",
    parts: [
      "For each record include day/sequence, business direction, canonical destination, target audience and funnel stage.",
      "Choose one primary platform and format; write a hook, one claim-safe value statement, three key points and one CTA.",
      "Add privacy-safe UTM values, evidence/claim status, one related website asset, a KPI to observe and one human-review note.",
      "Vary topics, hooks, formats and CTAs meaningfully; do not repeat one template five times.",
    ],
  },
  rubric: [
    { key: "five_records", label: "Exactly five records", pass: "Five complete records, one per approved source page." },
    { key: "canonical_ownership", label: "Canonical ownership", pass: "Each record leads to the relevant public page rather than the homepage, preview or private route." },
    { key: "audience_funnel", label: "Audience and funnel stage", pass: "Audience and stage are specific and consistent with the source page and CTA." },
    { key: "platform_fit", label: "Platform fit", pass: "Format and copy concept fit the selected platform and do not assume impossible link behavior." },
    { key: "hook_value", label: "Useful hook and value", pass: "Hook and value are specific and educational without clickbait or unsupported outcomes." },
    { key: "cta_quality", label: "CTA quality", pass: "One action matches page readiness and visible functionality." },
    { key: "utm_safety", label: "UTM safety", pass: "UTM values are normalized, allowlisted and contain no PII or private operational data." },
    { key: "evidence_claims", label: "Evidence and claims", pass: "Facts are visible on the approved source or clearly framed as general education; uncertain claims are flagged for review." },
    { key: "non_duplication", label: "Non-duplication", pass: "Topics, hooks, formats and CTAs have meaningful variation rather than thin rewrites." },
    { key: "measurement_review", label: "Measurement and review", pass: "The KPI supports the business path and the human-review note identifies a real approval need." },
  ],
  boundaries: [
    "Use only approved public destinations and synthetic planning context; do not paste private source text, contacts, screenshots, conversations, credentials or operational data.",
    "Do not promise leads, rankings, traffic, lower acquisition cost, sales, income, employment, direct shippers, response times or other outcomes.",
    "All ten rubric items require human Pass/Revise review. Passing does not authorize publication, account access, advertising, external messages or work on behalf of a client.",
    "A learner draft remains inside the existing Evidence and Progression workflow until a separately authorized person makes any real publication decision.",
  ],
  next: {
    lesson_id: "platform-distribution",
    label: "Continue to platform distribution",
  },
};

const platformDistribution = {
  program_slug: "marketing",
  lesson_id: "platform-distribution",
  version: "2026-08-24-v1",
  title: "Platform distribution: adapt one source without duplicate cross-posting",
  purpose: "Turn one approved canonical asset into platform-specific distribution concepts while preserving source ownership, destination accuracy, claim safety and human approval.",
  objectives: [
    "Give each platform a distinct job instead of copying one universal post.",
    "Keep the website or approved public asset as the canonical source of the complete explanation.",
    "Match hook, format, visual idea and destination strategy to the platform context.",
    "Use normalized privacy-safe tracking without personal or operational values in URLs.",
    "Recognize duplicate distribution and review blockers before any external action.",
    "Keep publication, account access and external communication behind an authorized human decision.",
  ],
  sections: [
    {
      title: "Give each platform a different job",
      summary: "The same source can support several channels, but each derivative should match how that channel presents context, discussion or visual information.",
      actions: [
        "Facebook: provide context and discussion around the problem and next action.",
        "Threads: introduce a sharp observation, tension or useful question.",
        "Instagram: begin with a visual proof idea, demonstration, Reel, Story or carousel and use a realistic destination strategy.",
        "LinkedIn: use professional context, process insight or decision-maker framing when the approved account and format support it.",
        "X: keep a concise finding only when account ownership, format and destination behavior are verified.",
        "Video or email: use a substantial explanation or owned-audience follow-up only when rights, consent and the destination are approved.",
      ],
    },
    {
      title: "Keep the canonical owner and tracked destination",
      summary: "A derivative should summarize and distribute the source asset, not become an unreviewed replacement for it.",
      actions: [
        "Point to the most relevant service, resource, program or approved intake rather than the generic homepage.",
        "Use one CTA that matches the destination.",
        "Use a stable privacy-safe variant identifier for tracking.",
        "Do not put submitted values, names, contact details, private routes, budgets or messages in URL parameters.",
      ],
    },
    {
      title: "Review before external action",
      summary: "Hermes distribution logic separates generated drafts from reviewed, approved and manual-export-ready states; learning exercises preserve the same boundary.",
      actions: [
        "Check source freshness, claim approval, privacy and entity ownership.",
        "Detect thin duplicate variants before review.",
        "Flag unsupported platform behavior rather than guessing.",
        "A draft may be prepared in Academy; a person controls every real post, message, ad or account action.",
      ],
    },
  ],
  scenario: "Synthetic case: one approved public guide needs channel-specific distribution. No social account, publishing credential, customer list, private analytics, ad account or external messaging permission is available to the learner.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 450,
    prompt: "Create four meaningfully different distribution variants for one approved public asset.",
    parts: [
      "Create one Facebook variant with context, format, CTA and destination strategy.",
      "Create one Threads variant built around an observation or question rather than copied Facebook text.",
      "Create one Instagram variant with a visual-first concept and realistic profile/Story/destination behavior.",
      "Create one additional variant for LinkedIn, X, video or email and state the condition that must be verified before use.",
      "For all four, name the canonical source, one privacy-safe tracking idea and one human-review blocker to check.",
    ],
  },
  rubric: [
    { key: "canonical_source", label: "Canonical source", pass: "All variants preserve one approved public owner and relevant destination." },
    { key: "platform_roles", label: "Platform roles", pass: "Each platform has a defensible role rather than a copied universal purpose." },
    { key: "meaningful_adaptation", label: "Meaningful adaptation", pass: "Hooks, formats and presentation differ in substance, not only punctuation or emoji." },
    { key: "destination_accuracy", label: "Destination accuracy", pass: "CTA and link strategy reflect realistic platform behavior and page readiness." },
    { key: "tracking_privacy", label: "Tracking privacy", pass: "Tracking concept uses stable non-personal values and exposes no private operational data." },
    { key: "claim_safety", label: "Claim safety", pass: "No variant invents results, platform guarantees or unverifiable evidence." },
    { key: "duplicate_control", label: "Duplicate control", pass: "Learner identifies how thin cross-post duplicates would be detected or rejected." },
    { key: "human_gate", label: "Human approval gate", pass: "Real publication, account access and external action remain explicitly human-controlled." },
  ],
  boundaries: [
    "Do not sign in to a social account, publish, schedule, advertise, send a message or upload a customer list as part of this lesson.",
    "Use synthetic drafts and approved public source material only.",
    "Passing the lesson does not verify a platform account, authorize a campaign or prove that a channel will produce a business result.",
  ],
  next: {
    lesson_id: "lead-journey",
    label: "Continue to lead journey",
  },
};

const leadJourney = {
  program_slug: "marketing",
  lesson_id: "lead-journey",
  version: "2026-08-24-v1",
  title: "Lead journey: connect attention to an explicit human handoff",
  purpose: "Map a privacy-safe path from source and distribution to the correct destination, one CTA, minimal qualification, accountable human ownership and a measurable next step.",
  objectives: [
    "Route attention to the page that owns the promise rather than a generic destination.",
    "Choose one CTA that creates the next useful decision instead of unnecessary friction.",
    "Collect only the minimum information required for the next human action.",
    "Preserve source, campaign, owner, status and next action through the handoff.",
    "Keep submitted values out of URLs, analytics and public fixtures.",
    "Identify where journey friction should change the page, form, targeting or handoff process.",
  ],
  sections: [
    {
      title: "Route attention to the correct destination",
      summary: "A service topic should lead to the relevant service or guide; education to the relevant program; a technical workflow to the approved technical owner; a checklist directly to that checklist.",
      actions: [
        "Name the source asset and the destination separately.",
        "Confirm that the destination can fulfill the CTA.",
        "Avoid sending every user to the homepage or an unrelated form.",
      ],
    },
    {
      title: "Qualify only what the next decision needs",
      summary: "Qualification should reduce uncertainty for a human decision without turning a form or analytics event into a private-data dump.",
      actions: [
        "Ask only for fields needed to route or review the request.",
        "Keep personal and private operational values out of URLs and analytics payloads.",
        "Explain why a field is needed when the reason is not obvious.",
      ],
    },
    {
      title: "Create an explicit handoff",
      summary: "Every inquiry needs a responsible owner, source context, current status, next action, review history and a safe way to correct or close the request.",
      actions: [
        "Name the responsible business direction or human owner role.",
        "Preserve the source page and campaign context.",
        "Set a current status and one next action.",
        "Record a stop, correction or closure path rather than assuming endless follow-up.",
      ],
    },
  ],
  scenario: "Synthetic case: a visitor discovers a useful Hermes resource through an organic social concept, reads the page and considers asking for help. The learner must design the journey without receiving the visitor's real identity or private values.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 350,
    prompt: "Map one complete source-to-human-handoff journey for the synthetic visitor.",
    parts: [
      "Source and entry — name the canonical asset and distribution context.",
      "Destination and CTA — choose the exact destination and one next action.",
      "Qualification — list only the minimum fields needed for the next human decision and explain why.",
      "Human owner — name the responsible direction or role, not a private individual.",
      "Status and next action — define the initial status, next step and closure/stop condition.",
      "Measurement — name privacy-safe events that show where the journey progressed or broke.",
    ],
  },
  rubric: [
    { key: "source_destination", label: "Source and destination", pass: "The canonical source and destination are relevant and not collapsed into a generic homepage route." },
    { key: "cta_fit", label: "CTA fit", pass: "One CTA matches the destination's current capability and the visitor's stage." },
    { key: "minimal_qualification", label: "Minimal qualification", pass: "Requested fields are necessary for the next decision and avoid unnecessary sensitive detail." },
    { key: "privacy_boundary", label: "Privacy boundary", pass: "Submitted values remain out of URLs, analytics, screenshots and public fixtures." },
    { key: "handoff_owner", label: "Human handoff owner", pass: "A responsible role, status and next action are explicit." },
    { key: "closure_path", label: "Closure path", pass: "Journey includes a safe correction, decline or close condition." },
    { key: "friction_measurement", label: "Friction measurement", pass: "Events can identify the broken stage without pretending to prove causation or revenue." },
  ],
  boundaries: [
    "Do not use a real lead, real contact details, private CRM record or submitted form values in the exercise.",
    "Automation may prepare routing context, but a person controls real communication, offers, bookings, payments and commitments.",
    "A complete map is learning evidence only; it does not authorize a live form, CRM write or customer workflow change.",
  ],
  next: {
    lesson_id: "sales-follow-up",
    label: "Continue to sales follow-up",
  },
};

const salesFollowUp = {
  program_slug: "marketing",
  lesson_id: "sales-follow-up",
  version: "2026-08-24-v1",
  title: "Sales follow-up: preserve context and one useful next step",
  purpose: "Turn an inbound marketing response into a concise, pressure-free human follow-up that preserves source context, asks a useful question and records a clear next action.",
  objectives: [
    "Use the source page, CTA and prior response as context rather than restarting with a generic pitch.",
    "Ask one focused discovery question before assuming the buyer's need.",
    "Answer only what is supported and flag anything requiring human verification.",
    "Offer one next step without invented urgency or pressure.",
    "Record a useful status, next action and stop condition for review.",
  ],
  sections: [
    {
      title: "Preserve the marketing context",
      summary: "A follow-up should know which source, page and CTA created the conversation so the person does not have to repeat the entire journey.",
      actions: [
        "Summarize the relevant context briefly.",
        "Reference the question or action the person actually took.",
        "Do not invent intent from a page view or click alone.",
      ],
    },
    {
      title: "Clarify before proposing",
      summary: "Use one focused question to understand the current situation or decision before offering a detailed next step.",
      actions: [
        "Acknowledge the stated concern or goal.",
        "Ask one question that changes what the next useful action should be.",
        "Respond to the stated issue instead of delivering every service feature.",
      ],
    },
    {
      title: "Close the loop without pressure",
      summary: "The follow-up should end with one clear option and a visible stop or timing condition.",
      actions: [
        "Offer one review, comparison, call, brief or resource only when it is actually available.",
        "Make it easy to decline, pause or change timing.",
        "Record current status and next action so follow-up does not depend on memory.",
      ],
    },
  ],
  scenario: "Synthetic case: a service-business owner reaches an approved marketing intake after reading a website-first resource. They say they already publish content but cannot tell which activity is creating useful inquiries and are unsure whether another marketing project is worth reviewing.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 180,
    prompt: "Draft a bounded follow-up and a short handoff note for the synthetic inquiry.",
    parts: [
      "Context — summarize the source and stated concern in one or two sentences.",
      "Discovery — ask one focused question that would change the recommended next step.",
      "Claim-safe response — state what can be reviewed without promising a result.",
      "Next action — offer one useful option and preserve the person's control.",
      "Handoff note — record a role-owned status, next action and stop condition without private identifiers.",
    ],
  },
  rubric: [
    { key: "context_preserved", label: "Context preserved", pass: "Response uses the known source and concern without inventing intent." },
    { key: "discovery_question", label: "Discovery question", pass: "One focused question would materially improve the next decision." },
    { key: "claim_safety", label: "Claim safety", pass: "Response promises no traffic, lead, sales, ranking or other unsupported outcome." },
    { key: "next_step", label: "Useful next step", pass: "One available action is offered without pressure or invented urgency." },
    { key: "crm_discipline", label: "Handoff discipline", pass: "Status, responsible role, next action and stop condition are reviewable." },
    { key: "tone_length", label: "Tone and length", pass: "Professional, concise, respectful and within 180 words." },
  ],
  boundaries: [
    "Use the synthetic inquiry only. Do not copy a real email, direct message, call transcript, CRM record or customer identity into learner evidence.",
    "Do not send the drafted follow-up. Academy evidence remains a private draft for human review.",
    "Passing the rubric does not authorize sales activity, account access, an offer, a proposal or customer communication.",
  ],
  next: {
    lesson_id: "analytics-improvement",
    label: "Continue to analytics and improvement",
  },
};

const analyticsImprovement = {
  program_slug: "marketing",
  lesson_id: "analytics-improvement",
  version: "2026-08-24-v1",
  title: "Analytics and improvement: measure the complete path",
  purpose: "Use privacy-safe evidence across source, landing, CTA, qualification and human handoff to choose the next improvement without treating vanity metrics or correlation as proof of a business outcome.",
  objectives: [
    "Define privacy-safe events for the complete path from source to reviewed handoff.",
    "Separate supporting indicators such as views or clicks from inquiry quality and human-reviewed outcomes.",
    "Distinguish an observation from a causal explanation.",
    "Use source, page, CTA and stage evidence to identify where friction occurs.",
    "Turn repeated questions or failures into a specific content, form, targeting or handoff improvement.",
  ],
  sections: [
    {
      title: "Measure the complete path",
      summary: "A useful measurement plan can connect a source and landing page to engagement, CTA action, qualification, handoff and an approved business outcome when lawful attribution exists.",
      actions: [
        "Track page view and meaningful engagement without submitted values.",
        "Track CTA action and form/application start as separate stages.",
        "Track approved handoff and qualified inquiry separately from simple clicks.",
        "Use a human-reviewed business outcome only when the attribution is lawful and actually available.",
      ],
    },
    {
      title: "Do not stop at vanity metrics",
      summary: "Followers, views, clicks and posting volume can support diagnosis, but they are not the final business result.",
      actions: [
        "Compare the metric to the stage it is supposed to represent.",
        "Do not say a channel caused a result when the evidence only shows correlation.",
        "Flag missing attribution instead of filling the gap with an assumption.",
      ],
    },
    {
      title: "Return evidence to the content system",
      summary: "Measurement becomes useful when it changes the next review decision.",
      actions: [
        "Turn repeated questions into FAQ or explanation improvements.",
        "Review pages with traffic but weak CTA engagement for clarity or offer mismatch.",
        "Use repeated qualification failure to review the page, form, audience or program description.",
        "Document what changed and what evidence would confirm or reject the next hypothesis.",
      ],
    },
  ],
  scenario: "Synthetic evidence: Content A attracts substantially more sessions but very few visitors reach its CTA. Content B attracts fewer sessions, but more visitors reach the CTA and a small number proceed to a human-reviewed qualified inquiry. No revenue attribution or causal experiment is available.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 300,
    prompt: "Create an evidence-safe measurement diagnosis and one next improvement for the synthetic scenario.",
    parts: [
      "Event chain — define the privacy-safe stages you would measure from source through human handoff.",
      "Observation — state what the synthetic evidence supports without adding a causal claim.",
      "Vanity-metric boundary — explain why the highest traffic number is not automatically the best outcome.",
      "Friction hypothesis — identify one stage that deserves review and label the explanation as a hypothesis.",
      "Next improvement — propose one bounded page, CTA, qualification or handoff change.",
      "Next evidence — state what observation would support or challenge that improvement decision.",
    ],
  },
  rubric: [
    { key: "complete_path", label: "Complete path", pass: "Measurement covers source, landing, CTA, qualification and human handoff rather than stopping at reach or clicks." },
    { key: "privacy_safe", label: "Privacy-safe events", pass: "Events contain no submitted values, private messages or personal identifiers." },
    { key: "observation_causation", label: "Observation vs causation", pass: "Learner states what is observed and labels unproven explanations as hypotheses." },
    { key: "vanity_boundary", label: "Vanity-metric boundary", pass: "Supporting metrics are not presented as the final business result." },
    { key: "friction_stage", label: "Friction stage", pass: "Diagnosis identifies a defensible stage of the journey to review." },
    { key: "bounded_improvement", label: "Bounded improvement", pass: "Recommendation changes one controllable element rather than promising a result." },
    { key: "next_evidence", label: "Next evidence", pass: "Learner defines evidence that could support or challenge the next decision." },
  ],
  boundaries: [
    "Use synthetic metrics only; do not paste private analytics exports, customer values, lead identities or revenue records into learner evidence.",
    "Do not claim that social activity directly improves search ranking, lowers acquisition cost or creates sales without appropriate evidence.",
    "A reviewer evaluates the reasoning. Completing this lesson does not authorize analytics access, tracking changes, publication or customer-data processing.",
  ],
};

export const ACADEMY_LESSON_CONTENT = {
  "us-logistics-operations": {
    "dispatch-foundations": dispatchFoundations,
    "carrier-broker-communication": logisticsConversation,
    "equipment-lane-logic": equipmentLaneLogic,
    "documents-setup": documentsSetup,
    "negotiation-practice": negotiationPractice,
    "operating-rhythm": operatingRhythm,
  },
  marketing: {
    "positioning-offer": positioningOffer,
    "website-first-content": websiteFirstContent,
    "platform-distribution": platformDistribution,
    "lead-journey": leadJourney,
    "sales-follow-up": salesFollowUp,
    "analytics-improvement": analyticsImprovement,
  },
};

export function getAcademyLessonContent(programSlug, lessonId) {
  const program = ACADEMY_LESSON_CONTENT[String(programSlug || "")];
  return program?.[String(lessonId || "")] || null;
}

export function hasAcademyLessonContent(programSlug, lessonId) {
  return Boolean(getAcademyLessonContent(programSlug, lessonId));
}
