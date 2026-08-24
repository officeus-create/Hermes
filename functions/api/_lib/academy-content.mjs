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

export const ACADEMY_LESSON_CONTENT = {
  "us-logistics-operations": {
    "carrier-broker-communication": logisticsConversation,
    "negotiation-practice": negotiationPractice,
  },
};

export function getAcademyLessonContent(programSlug, lessonId) {
  const program = ACADEMY_LESSON_CONTENT[String(programSlug || "")];
  return program?.[String(lessonId || "")] || null;
}

export function hasAcademyLessonContent(programSlug, lessonId) {
  return Boolean(getAcademyLessonContent(programSlug, lessonId));
}
