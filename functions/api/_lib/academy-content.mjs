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
};

export const ACADEMY_LESSON_CONTENT = {
  "us-logistics-operations": {
    "carrier-broker-communication": logisticsConversation,
    "negotiation-practice": negotiationPractice,
  },
  marketing: {
    "website-first-content": websiteFirstContent,
  },
};

export function getAcademyLessonContent(programSlug, lessonId) {
  const program = ACADEMY_LESSON_CONTENT[String(programSlug || "")];
  return program?.[String(lessonId || "")] || null;
}

export function hasAcademyLessonContent(programSlug, lessonId) {
  return Boolean(getAcademyLessonContent(programSlug, lessonId));
}
