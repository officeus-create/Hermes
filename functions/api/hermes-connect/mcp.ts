type Env = { DB?: any; MCP_ALLOWED_ORIGINS?: string };
type Context = { request: Request; env: Env };

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, any>;
};

const SERVER_NAME = "hermes-connect";
const SERVER_VERSION = "1.0.0";
const LEGACY_PROTOCOL = "2025-06-18";
const MODERN_PROTOCOL = "2026-07-28";
const PRODUCT_URL = "https://hermeslogisticsus.com/services/hermes-connect/";
const SUPPORT_URL = "https://hermeslogisticsus.com/services/hermes-connect/support/";
const PRIVACY_URL = "https://hermeslogisticsus.com/privacy/";
const TERMS_URL = "https://hermeslogisticsus.com/terms/";
const REPAIR_URL = "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/";
const ACADEMY_URL = "https://hermeslogisticsus.com/services/hermes-connect/academy/";
const MARKETING_URL = "https://hermeslogisticsus.com/paths/marketing/";
const LOGISTICS_URL = "https://hermeslogisticsus.com/paths/logistics/";
const TECHNOLOGY_URL = "https://hermeslogisticsus.com/paths/technology/";

const HERMES_ROUTES = [
  {
    id: "CONNECT",
    name: "Hermes Connect / Technology",
    use_when: "CRM, workflow, automation, software, integrations, operating data, or product change requests are the main problem.",
    url: TECHNOLOGY_URL,
  },
  {
    id: "MARKETING",
    name: "Hermes Marketing",
    use_when: "Website, SEO/GEO/local/AI visibility, content, social, acquisition, CTA, or measurement readiness is the main problem.",
    url: MARKETING_URL,
  },
  {
    id: "LOGISTICS",
    name: "Hermes Logistics",
    use_when: "U.S. logistics operations, carriers, dispatch, car hauling, shippers, dealers, or related workflows are the main problem.",
    url: LOGISTICS_URL,
  },
  {
    id: "ACADEMY",
    name: "Hermes Academy",
    use_when: "Structured learning, practice, role development, course progression, or team capability is the main problem.",
    url: ACADEMY_URL,
  },
] as const;

const instructions =
  "Hermes Connect CRM starts with the least-privileged public mode. Help users understand the current product, choose a practical business/CRM starting path, and share privacy-safe product feedback only with explicit consent. Never claim private CRM access, internal Hermes access, or customer identity without authenticated server state.";

const publicToolDefinitions = [
  {
    name: "get_product_overview",
    title: "Get Hermes Connect product overview",
    description:
      "Use this when the user asks what Hermes Connect CRM is, what is live today, how to start, or whether private account data is available. Returns public product truth and official Hermes links only; it never returns private CRM or internal Hermes data.",
    inputSchema: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          description: "Optional language hint such as en, ru, uk, es, it, de, pt-BR, fr, or vi.",
          maxLength: 16,
        },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        product: { type: "string" },
        developer: { type: "string" },
        public_status: { type: "string" },
        live_paths: { type: "array", items: { type: "string" } },
        product_url: { type: "string" },
        support_url: { type: "string" },
        privacy_url: { type: "string" },
        terms_url: { type: "string" },
        account_linking_status: { type: "string" },
      },
      required: [
        "product",
        "developer",
        "public_status",
        "live_paths",
        "product_url",
        "support_url",
        "privacy_url",
        "terms_url",
        "account_linking_status",
      ],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "recommend_start_path",
    title: "Recommend a Hermes Connect starting path",
    description:
      "Use this after the user describes their business, role, and operational goal. Recommends the smallest truthful Hermes Connect next step without claiming an unreleased vertical or forcing a sale. Do not include names, emails, phone numbers, addresses, customer lists, or other personal data in the inputs.",
    inputSchema: {
      type: "object",
      properties: {
        business_type: { type: "string", minLength: 2, maxLength: 80 },
        role: { type: "string", maxLength: 60 },
        primary_goal: { type: "string", minLength: 3, maxLength: 240 },
        existing_hermes_customer: { type: "boolean" },
      },
      required: ["business_type", "primary_goal"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        route: { type: "string" },
        status: { type: "string" },
        reason: { type: "string" },
        next_step: { type: "string" },
        url: { type: "string" },
      },
      required: ["route", "status", "reason", "next_step", "url"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "build_crm_onboarding_plan",
    title: "Build a connector-guided CRM onboarding plan",
    description:
      "Use this after the user explains the business problem and wants a concrete setup path. Returns the smallest useful connector/integration plan, minimum onboarding questions, a ready CRM bootstrap prompt, and an execution sequence. It never installs third-party apps itself, never asks for passwords/API keys, and never claims background CRM work unless an authenticated durable provisioning job exists.",
    inputSchema: {
      type: "object",
      properties: {
        business_type: { type: "string", minLength: 2, maxLength: 80 },
        primary_problem: { type: "string", minLength: 3, maxLength: 240 },
        desired_outcome: { type: "string", maxLength: 240 },
        current_stack: {
          type: "array",
          maxItems: 8,
          items: { type: "string", minLength: 1, maxLength: 80 },
        },
        existing_crm: { type: "boolean" },
      },
      required: ["business_type", "primary_problem"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        strategy: { type: "string" },
        do_now: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
        recommended_connections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              capability: { type: "string" },
              priority: { type: "string", enum: ["required", "recommended", "optional"] },
              reason: { type: "string" },
              host_action: { type: "string" },
            },
            required: ["capability", "priority", "reason", "host_action"],
            additionalProperties: false,
          },
        },
        minimum_questions: { type: "array", maxItems: 5, items: { type: "string" } },
        need_from_you: { type: "array", maxItems: 5, items: { type: "string" } },
        build_execute: { type: "string" },
        crm_bootstrap_prompt: { type: "string" },
        execution_sequence: { type: "array", items: { type: "string" } },
        continuity_rule: { type: "string" },
        authorization_rule: { type: "string" },
      },
      required: [
        "strategy",
        "do_now",
        "recommended_connections",
        "minimum_questions",
        "need_from_you",
        "build_execute",
        "crm_bootstrap_prompt",
        "execution_sequence",
        "continuity_rule",
        "authorization_rule",
      ],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "preview_crm_funnel",
    title: "Preview a Hermes CRM funnel before connecting accounts",
    description:
      "Build a tangible read-only five-stage funnel preview from a generic business type, goal, and intake channel. No real customer data, account linking, messages, CRM writes, or background jobs. The response is an illustration of what an approved authenticated agent could later execute.",
    inputSchema: {
      type: "object",
      properties: {
        business_type: { type: "string", minLength: 2, maxLength: 80 },
        goal: { type: "string", minLength: 3, maxLength: 160 },
        entry_channel: {
          type: "string",
          enum: ["website", "phone", "email", "instagram", "marketplace", "other"],
        },
      },
      required: ["business_type", "goal"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["PREVIEW_ONLY"] },
        business_type: { type: "string" },
        goal: { type: "string" },
        entry_channel: { type: "string" },
        stages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              trigger: { type: "string" },
              owner: { type: "string" },
              next_action: { type: "string" },
              automation_state: { type: "string" },
            },
            required: ["name", "trigger", "owner", "next_action", "automation_state"],
            additionalProperties: false,
          },
        },
        first_connection: { type: "string" },
        first_kpi: { type: "string" },
        trial_in_chat: { type: "string" },
        not_performed: { type: "array", items: { type: "string" } },
        live_activation_gate: { type: "string" },
      },
      required: [
        "status", "business_type", "goal", "entry_channel", "stages",
        "first_connection", "first_kpi", "trial_in_chat", "not_performed", "live_activation_gate",
      ],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "preview_agent_handoff",
    title: "Preview a safe Hermes digital-employee handoff",
    description:
      "Show which existing Hermes digital employee would own a generic task and what evidence a real handoff would need. This is a read-only routing PREVIEW, not plugin invocation or task creation. Do not provide names, emails, phone numbers, passwords, customer data or credentials.",
    inputSchema: {
      type: "object",
      properties: {
        task_category: {
          type: "string",
          enum: ["identity_mcp", "carriers", "sales", "hr", "academy", "marketing", "design", "dispatch", "catalog", "infrastructure"],
        },
        goal: { type: "string", minLength: 3, maxLength: 160 },
      },
      required: ["task_category", "goal"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["ROUTED_NOT_EXECUTED"] },
        task_category: { type: "string" },
        goal: { type: "string" },
        accountable_employee: { type: "string" },
        consulted_employee: { type: "string" },
        done_condition: { type: "string" },
        first_safe_action: { type: "string" },
        owner_gate: { type: "string" },
        source_of_truth: { type: "string" },
        actions_performed: { type: "array", maxItems: 0, items: { type: "string" } },
        why_not_executed: { type: "string" },
      },
      required: [
        "status", "task_category", "goal", "accountable_employee", "consulted_employee",
        "done_condition", "first_safe_action", "owner_gate", "source_of_truth",
        "actions_performed", "why_not_executed",
      ],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_hermes_business_routes",
    title: "Get Hermes business routes",
    description:
      "Use when a user's need may belong to Hermes Connect/Technology, Marketing, U.S. Logistics, Academy, or a justified combination. Returns public routing guidance only; it does not create a customer record or commercial commitment.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        routes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              use_when: { type: "string" },
              url: { type: "string" },
            },
            required: ["id", "name", "use_when", "url"],
            additionalProperties: false,
          },
        },
        rule: { type: "string" },
      },
      required: ["routes", "rule"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_product_learning_policy",
    title: "Get Hermes Connect product-learning policy",
    description:
      "Use when a user asks how Hermes Connect improves from recurring usage and feedback without copying raw private conversations into shared product memory.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        reusable_learning: { type: "array", items: { type: "string" } },
        excluded_data: { type: "array", items: { type: "string" } },
        release_rule: { type: "string" },
      },
      required: ["reusable_learning", "excluded_data", "release_rule"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "submit_product_feedback",
    title: "Submit privacy-safe Hermes Connect product feedback",
    description:
      "Use only after the user explicitly consents to share concise product feedback with Hermes. Stores a small structured product-learning event. Never include raw chat text, names, emails, phone numbers, addresses, credentials, customer records, private rates, or secrets.",
    inputSchema: {
      type: "object",
      properties: {
        business_type: { type: "string", minLength: 2, maxLength: 80 },
        problem_class: { type: "string", minLength: 3, maxLength: 120 },
        desired_capability: { type: "string", minLength: 3, maxLength: 120 },
        outcome: {
          type: "string",
          enum: ["missing_capability", "workflow_friction", "useful_pattern", "confusing", "other"],
        },
        consent_to_product_learning: { type: "boolean", const: true },
      },
      required: ["business_type", "problem_class", "desired_capability", "outcome", "consent_to_product_learning"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        accepted: { type: "boolean" },
        status: { type: "string" },
      },
      required: ["accepted", "status"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
];

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function responseJson(status: number, payload: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), { status, headers: { ...jsonHeaders, ...extraHeaders } });
}

function rpcResult(id: JsonRpcRequest["id"], result: Record<string, unknown>, modern = false) {
  const finalResult = modern
    ? {
        resultType: "complete",
        ...result,
        _meta: {
          ...(typeof result._meta === "object" && result._meta ? (result._meta as object) : {}),
          "io.modelcontextprotocol/serverInfo": { name: SERVER_NAME, version: SERVER_VERSION },
        },
      }
    : result;
  return { jsonrpc: "2.0", id: id ?? null, result: finalResult };
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string, data?: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function isModernRequest(request: Request, message: JsonRpcRequest) {
  const header = request.headers.get("MCP-Protocol-Version") || "";
  const meta = message.params?._meta?.["io.modelcontextprotocol/protocolVersion"];
  return header === MODERN_PROTOCOL || meta === MODERN_PROTOCOL || message.method === "server/discover";
}

function normalize(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function containsSensitivePattern(value: string) {
  const patterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /https?:\/\//i,
    /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
    /\b(?:sk-|ghp_|github_pat_|AKIA)[A-Za-z0-9_\-]{8,}\b/,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  ];
  return patterns.some((pattern) => pattern.test(value));
}

function getOverview() {
  return {
    product: "Hermes Connect CRM",
    developer: "Hermes Logistics LLC",
    public_status:
      "Hermes Connect is one adaptive business operating product. Repair Shops is the current public live vertical; other business configurations are introduced only with their actual verified status.",
    live_paths: ["Repair Shops — live public product", "Academy — bounded business/learner access"],
    product_url: PRODUCT_URL,
    support_url: SUPPORT_URL,
    privacy_url: PRIVACY_URL,
    terms_url: TERMS_URL,
    account_linking_status:
      "Public discovery is available. Private customer workspace access requires authenticated Hermes account linking and is not provided by this public tool.",
  };
}

function recommendStartPath(args: Record<string, unknown>) {
  const businessType = normalize(args.business_type, 80);
  const role = normalize(args.role, 60);
  const goal = normalize(args.primary_goal, 240);
  const existing = args.existing_hermes_customer === true;
  const combined = `${businessType} ${role} ${goal}`.toLowerCase();

  if (existing) {
    return {
      route: "CONNECT_EXISTING_WORKSPACE",
      status: "AUTHENTICATION_REQUIRED",
      reason: "Existing-customer private data must be scoped through authenticated Hermes account linking.",
      next_step: "Use the Hermes Connect support path to confirm the correct workspace/account route; do not share passwords or secrets in chat.",
      url: SUPPORT_URL,
    };
  }

  if (/repair|auto shop|auto service|mechanic|garage|body shop|collision|tire/.test(combined)) {
    return {
      route: "LIVE_REPAIR_SHOPS",
      status: "LIVE_PUBLIC_PRODUCT",
      reason: "Repair Shops is the current public live Hermes Connect vertical.",
      next_step: "Review the current Repair Shops product information and workflow to decide whether it fits the business.",
      url: REPAIR_URL,
    };
  }

  if (/academy|school|course|training|student|learner|education/.test(combined)) {
    return {
      route: "ACADEMY_DISCOVERY",
      status: "BOUNDED_ACCESS",
      reason: "Hermes Connect has an Academy business/learner path with bounded access and human-reviewed progression.",
      next_step: "Review the Academy path and confirm the business/learner workflow before requesting access.",
      url: ACADEMY_URL,
    };
  }

  if (/(?:\bseo\b|\bgeo\b|local search|\bgoogle\b|\bwebsite\b|\bsocial\b|\binstagram\b|\bfacebook\b|\bthreads\b|\bcontent\b|\bmarketing\b|\bads\b|\badvertising\b|\btraffic\b|\bvisibility\b)/.test(combined)) {
    return {
      route: "HERMES_MARKETING",
      status: "DISCOVERY",
      reason: "The primary problem is acquisition, visibility, content, or marketing-system readiness rather than CRM alone.",
      next_step: "Establish the offer, CTA, measurement, and organic baseline before deciding whether paid amplification or a larger growth program is justified.",
      url: MARKETING_URL,
    };
  }

  if (/carrier|dispatch|car haul|auto transport|shipper|dealer|freight|load board|trucking|logistics/.test(combined)) {
    return {
      route: "HERMES_LOGISTICS",
      status: "DISCOVERY",
      reason: "The primary problem belongs to U.S. logistics operations or transportation workflow.",
      next_step: "Clarify the equipment, lane or operating problem, responsible party, and desired business outcome before selecting a logistics service or workflow.",
      url: LOGISTICS_URL,
    };
  }

  if (/crm|lead|follow.?up|customer|pipeline|booking|operations|automation|sales|workflow/.test(combined)) {
    return {
      route: "CRM_BLUEPRINT",
      status: "DISCOVERY",
      reason: "The problem is operational and CRM-shaped, but an unreleased vertical should not be presented as already live.",
      next_step: "Map the current workflow, owners, stages, handoffs, and KPI gaps, then prepare the smallest useful CRM blueprint.",
      url: SUPPORT_URL,
    };
  }

  return {
    route: "BUSINESS_REVIEW",
    status: "DISCOVERY",
    reason: "The smallest useful starting point is a business/workflow review before deciding whether CRM, automation, or advisory work is needed.",
    next_step: "Describe the current workflow, the main bottleneck, who owns the work, and the result you want to improve.",
    url: PRODUCT_URL,
  };
}

function buildCrmOnboardingPlan(args: Record<string, unknown>) {
  const businessType = normalize(args.business_type, 80);
  const problem = normalize(args.primary_problem, 240);
  const desiredOutcome = normalize(args.desired_outcome, 240);
  const currentStack = Array.isArray(args.current_stack)
    ? args.current_stack.slice(0, 8).map((item) => normalize(item, 80)).filter(Boolean)
    : [];
  const existingCrm = args.existing_crm === true;
  const combined = `${businessType} ${problem} ${desiredOutcome} ${currentStack.join(" ")}`.toLowerCase();

  const connectAction =
    "If the AI host supports trusted plugins/connectors, surface its native Connect/Install action for this capability. Otherwise explain the exact integration needed. Never ask the user to paste passwords, API keys, recovery codes, or full private chat history.";

  const recommendedConnections: Array<{
    capability: string;
    priority: "required" | "recommended" | "optional";
    reason: string;
    host_action: string;
  }> = [];

  if (existingCrm || /crm|pipeline|lead|sales|follow.?up|customer/.test(combined)) {
    recommendedConnections.push({
      capability: "Current CRM or structured customer records",
      priority: existingCrm ? "required" : "recommended",
      reason: "Reuse the existing source of truth before creating a second customer database or duplicate pipeline.",
      host_action: connectAction,
    });
  }

  if (/lead|sales|follow.?up|customer|inbox|email|estimate|quote|support|dispatch|booking|appointment/.test(combined)) {
    recommendedConnections.push({
      capability: "Business email",
      priority: "recommended",
      reason: "Email history can reveal real intake, follow-up, objections, handoffs, and missed-response patterns without asking the user to retype them.",
      host_action: connectAction,
    });
  }

  if (/booking|appointment|schedule|meeting|dispatch|service|course|training/.test(combined)) {
    recommendedConnections.push({
      capability: "Calendar or scheduling system",
      priority: "recommended",
      reason: "Scheduling evidence helps model availability, handoffs, booking stages, reminders, and ownership.",
      host_action: connectAction,
    });
  }

  recommendedConnections.push({
    capability: "Business files / SOPs / forms",
    priority: "optional",
    reason: "Selected documents can speed up workflow mapping and CRM field design when the user chooses what to share.",
    host_action: connectAction,
  });

  if (/(?:\bseo\b|\bgeo\b|google ads|google analytics|search console|google business profile|google maps|\bwebsite\b|\bsocial\b|\bmarketing\b|\bads\b|\btraffic\b|\bvisibility\b|\bcontent\b)/.test(combined)) {
    recommendedConnections.push({
      capability: "Marketing / analytics sources",
      priority: "optional",
      reason: "Use measured acquisition and conversion evidence to connect CRM stages to traffic, inquiries, qualified actions, and outcomes.",
      host_action: connectAction,
    });
  }

  const minimumQuestions = [
    "What is the main customer journey from first contact to completed outcome?",
    "Where do new requests or leads arrive today?",
    "What step is currently slow, lost, duplicated, or dependent on one person?",
    "Who owns the next action at each critical handoff?",
    "Which one KPI should improve first?",
  ];

  const doNow = [
    existingCrm
      ? "Use the current CRM/source of truth and map the exact stage, owner, and follow-up gaps before creating any replacement system."
      : "Map one customer journey from first contact to completed outcome and turn it into one CRM pipeline before choosing extra software or modules.",
    recommendedConnections.length > 0
      ? `Approve only the first useful connections: ${recommendedConnections.slice(0, 3).map((item) => item.capability).join(", ")}.`
      : "Do not connect another system yet; the current information is enough to draft the first CRM blueprint.",
    "Choose one first KPI and one broken handoff to fix; postpone lower-value automation until readback proves this step works.",
  ];

  const outcomeText = desiredOutcome || "improve the main operating bottleneck and make ownership measurable";
  const crmBootstrapPrompt =
    `Build my Hermes Connect CRM blueprint for a ${businessType}. Main problem: ${problem}. Desired outcome: ${outcomeText}. Use only the sources and connectors I explicitly approve. First map the customer journey, pipeline stages, owners, handoffs, follow-up rules, KPIs, and missing automations. Reuse any existing CRM/source of truth instead of duplicating it. Ask only for facts you cannot infer safely. Do not ask for passwords, API keys, full chat history, or unrelated private data. Give me concrete next actions while the setup is being prepared.`;

  return {
    strategy:
      "Problem -> concrete actions -> minimum approved connections -> compact intake -> CRM blueprint -> authenticated ProvisioningRequest/Job when available -> readback -> improvement loop.",
    do_now: doNow,
    recommended_connections: recommendedConnections.slice(0, 5),
    minimum_questions: minimumQuestions,
    need_from_you: minimumQuestions,
    build_execute: existingCrm
      ? "Build the first blueprint around the existing CRM as source of truth. Change systems only if the evidence shows the current one cannot support the required workflow."
      : "Build the CRM blueprint now. Start a real ProvisioningRequest/Job only when authenticated Hermes tooling can return durable server state.",
    crm_bootstrap_prompt: crmBootstrapPrompt,
    execution_sequence: [
      "Recommend only the connectors that materially reduce repeated data entry or improve evidence quality.",
      "Use the AI host's native connector/plugin approval flow when available; otherwise stay advisory and describe the needed integration.",
      "Read only user-approved relevant sources and map one canonical Company/workflow before creating records.",
      "Create the CRM blueprint: stages, owners, fields, automations, KPIs, permissions, and acceptance criteria.",
      "If authenticated Hermes provisioning exists, create a durable ProvisioningRequest/Job and return its ID/state; otherwise return the blueprint/request without claiming work is running.",
      "Continue the business conversation immediately; later turns query durable job/readback state instead of asking the user to repeat context.",
    ],
    continuity_rule:
      "The user may keep talking while an authenticated durable provisioning job runs. Without a durable backend job, never claim asynchronous or background CRM population.",
    authorization_rule:
      "Connection and write permissions stay with the user and the server/host authorization layer. A model recommendation never grants access by itself.",
  };
}

function previewCrmFunnel(args: Record<string, unknown>) {
  const businessType = normalize(args.business_type, 80);
  const goal = normalize(args.goal, 160);
  const rawChannel = typeof args.entry_channel === "string" ? args.entry_channel : "website";
  const allowedChannels = new Set(["website", "phone", "email", "instagram", "marketplace", "other"]);
  // The preview must be safe for unauthenticated and customer/agent test users:
  // no raw leads, tenant identity, personal information or credentials.
  if (!allowedChannels.has(rawChannel) ||
      businessType.length < 2 || goal.length < 3 ||
      [businessType, goal].some(containsSensitivePattern)) {
    throw new Error("invalid_preview_input");
  }
  const subject = businessType.toLowerCase();
  const carrier = /car.?haul|carrier|trucking|dispatch|auto transport|logistics/.test(subject);
  const repair = /repair|auto shop|garage|mechanic|service center/.test(subject);
  const stages = carrier
    ? [
        ["Carrier inquiry", "New opt-in carrier inquiry", "Sales / carrier intake", "Record source, equipment and preferred lanes"],
        ["Qualification", "Carrier responds with operating facts", "Carrier operations", "Verify authority, insurance, equipment and contact before commercial access"],
        ["Offer", "Qualified carrier requests service", "Authorized sales owner", "Explain actual service model; do not promise available loads"],
        ["Agreement", "Carrier requests to proceed", "Contract owner", "Present approved contract for review; no autonomous sending"],
        ["Onboarding", "Signed approval recorded", "Dispatch coordinator", "Assign handoff only to permitted staff; keep dispatch inbox undisturbed"],
      ]
    : repair
      ? [
          ["New request", "Customer opts in through an intake channel", "Reception", "Capture requested service without duplicating existing CRM"],
          ["Qualification", "Service type and timing identified", "Service advisor", "Determine vehicle/service fit and priority"],
          ["Estimate", "Qualified inquiry requires quote", "Service advisor", "Prepare draft estimate; price approval stays with shop"],
          ["Booking", "Customer agrees to an offered slot", "Shop scheduler", "Confirm actual availability before creating appointment"],
          ["Follow-up", "Completed service is confirmed", "Shop owner", "Propose an opt-in feedback request; no messages sent by preview"],
        ]
      : [
          ["New inquiry", "Opt-in inquiry received", "Sales intake", "Capture source and requested result"],
          ["Qualification", "Problem and budget range understood", "Account manager", "Confirm scope, priority and decision owner"],
          ["Proposal", "Fit and scope validated", "Sales owner", "Draft a scoped offer for approval"],
          ["Delivery handoff", "Explicit acceptance recorded", "Operations", "Assign a task to the approved delivery team"],
          ["Outcome review", "Work has a measured outcome", "Account manager", "Record evidence and next improvement"],
        ];
  return {
    status: "PREVIEW_ONLY",
    business_type: businessType,
    goal,
    entry_channel: rawChannel,
    stages: stages.map(([name, trigger, owner, next_action]) => ({
      name, trigger, owner, next_action, automation_state: "NOT_CONNECTED",
    })),
    first_connection: carrier
      ? "Existing, owner-approved carrier CRM or intake table (read only)"
      : repair
        ? "Existing, owner-approved repair-shop CRM (read only)"
        : "Existing, owner-approved CRM or intake source (read only)",
    first_kpi: carrier
      ? "Verified qualified carrier inquiries per week (exclude synthetic leads)"
      : repair
        ? "Qualified inquiries that become confirmed appointments"
        : "Qualified inquiries converted to a recorded next action",
    trial_in_chat:
      "Review these five stages in ChatGPT or Claude, choose one bottleneck, and approve only the minimum relevant connector. A real CRM workflow requires separately authenticated and authorized Hermes MCP tools.",
    not_performed: [
      "No customer records were accessed, created or changed",
      "No emails, social messages, calls, invitations or contracts were sent",
      "No integrations were installed and no background job was started",
    ],
    live_activation_gate:
      "Authenticated Hermes identity -> active company/workspace membership -> explicit tool capability -> source connection consent -> reviewed write permissions -> audit and readback. No automatic production activation.",
  };
}

function previewAgentHandoff(args: Record<string, unknown>) {
  const category = typeof args.task_category === "string" ? args.task_category : "";
  const rawGoal = typeof args.goal === "string" ? args.goal.trim() : "";
  // Do not truncate private input before detecting account/email/phone or
  // credentials: a long string must not be converted into accepted data.
  if (rawGoal.length < 3 || rawGoal.length > 160 || containsSensitivePattern(rawGoal)) {
    throw new Error("invalid_handoff_input");
  }
  const routes: Record<string, [string, string, string, string]> = {
    identity_mcp: [
      "Hermes Technology Developer", "Hermes Agent Coordinator",
      "A tested and reviewed identity/MCP change, with exact-head CI and independently verified release state",
      "Read the current #1873 Identity or #1883 MCP issue and classify a single bounded engineering change",
    ],
    carriers: [
      "Hermes Sales", "Hermes Dispatch OS",
      "One verified, genuine US car-hauling carrier inquiry, with explicit qualification and no synthetic lead counted",
      "Review existing carrier qualification and record a source-valid, consented intake plan",
    ],
    sales: [
      "Hermes Sales", "Hermes Agent Coordinator",
      "A verifiable qualified opportunity and documented next action, not simply a prepared message",
      "Review current CRM status, objections, and a draft response without sending it",
    ],
    hr: [
      "Hermes HR", "Hermes Academy",
      "Candidate qualification and consent-backed progression to approved training or sales review",
      "Check the existing recruiting funnel and prepare a scoped candidate response draft",
    ],
    academy: [
      "Hermes Academy", "Hermes HR",
      "A versioned lesson or training exercise linked to real learner outcomes",
      "Check the existing curriculum and identify the next evidence-based training exercise",
    ],
    marketing: [
      "Hermes Marketing/SEO owner (confirm currently connected plugin)", "Hermes Sales",
      "Verified qualified acquisition improvement without regression in SEO/GEO visibility",
      "Read current search/landing-page proof and identify one measurable conversion gap",
    ],
    design: [
      "Hermes Design Hub", "Hermes Technology Developer",
      "Reviewed responsive design and accessibility acceptance on the existing component",
      "Inspect the current design system and prepare one mobile and desktop comparison",
    ],
    dispatch: [
      "Hermes Dispatch OS", "Hermes Sales",
      "An owner-approved operational improvement that does not interrupt current dispatchers",
      "Inspect the current dispatch/Load Board evidence in read-only mode",
    ],
    catalog: [
      "Hermes Catalog", "Hermes Technology Developer",
      "A correct, verified public Catalog projection without leaking customer workspace data",
      "Review existing Catalog records and publication permissions before proposing changes",
    ],
    infrastructure: [
      "Hermes Technology Developer", "Hermes Private Network",
      "Verified and reversible secure infrastructure change with explicit owner authorization",
      "Read existing GitHub/Cloudflare QA and identify the smallest isolated improvement",
    ],
  };
  const route = Object.prototype.hasOwnProperty.call(routes, category) ? routes[category] : null;
  if (!route) throw new Error("invalid_handoff_input");
  return {
    status: "ROUTED_NOT_EXECUTED",
    task_category: category,
    goal: rawGoal,
    accountable_employee: route[0],
    consulted_employee: route[1],
    done_condition: route[2],
    first_safe_action: route[3],
    owner_gate:
      "Read-only scoping is allowed; external writes, emails/DMs, provider credentials, production, permissions, paid resources and dispatch contact require separate authorization.",
    source_of_truth: "Existing Hermes One Brain and officeus-create/Hermes canonical issue/PR",
    actions_performed: [],
    why_not_executed:
      "This public MCP tool only describes responsibility. It cannot invoke private plugins, schedule background agents, grant access, write CRM records or assert another agent completed a task.",
  };
}

function getHermesBusinessRoutes() {
  return {
    routes: HERMES_ROUTES.map((route) => ({ ...route })),
    rule:
      "Recommend the smallest Hermes route supported by the user's actual problem. A conversation or route recommendation is not customer status, payment, revenue, or a promise of availability.",
  };
}

function getProductLearningPolicy() {
  return {
    reusable_learning: [
      "recurring problem class",
      "vertical or workflow pattern",
      "missing or useful capability",
      "failure pattern",
      "evidence state",
      "verified outcome",
      "reusable rule",
    ],
    excluded_data: [
      "raw full conversations",
      "passwords or access tokens",
      "unnecessary personal information",
      "private customer lists or notes",
      "private rates or confidential commercial data",
    ],
    release_rule:
      "Reusable learning may create a SkillCandidate or CapabilityCandidate. Shared privileged behavior changes only through reviewed versioned releases or approved hosted MCP updates.",
  };
}

async function submitProductFeedback(env: Env, args: Record<string, unknown>) {
  if (args.consent_to_product_learning !== true) {
    return { accepted: false, status: "explicit_consent_required" };
  }

  const businessType = normalize(args.business_type, 80);
  const problemClass = normalize(args.problem_class, 120);
  const desiredCapability = normalize(args.desired_capability, 120);
  const outcome = normalize(args.outcome, 40);
  const allowedOutcomes = new Set(["missing_capability", "workflow_friction", "useful_pattern", "confusing", "other"]);

  if (!businessType || !problemClass || !desiredCapability || !allowedOutcomes.has(outcome)) {
    return { accepted: false, status: "invalid_structured_feedback" };
  }

  if ([businessType, problemClass, desiredCapability].some(containsSensitivePattern)) {
    return { accepted: false, status: "feedback_contains_disallowed_sensitive_pattern" };
  }

  if (!env.DB) {
    return { accepted: false, status: "learning_store_unavailable" };
  }

  const id = `HC-LEARN-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS plugin_product_learning_events (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      business_type TEXT NOT NULL,
      problem_class TEXT NOT NULL,
      desired_capability TEXT NOT NULL,
      outcome TEXT NOT NULL,
      consent_state TEXT NOT NULL DEFAULT 'explicit'
    )`
  ).run();
  const retentionCutoff = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(`DELETE FROM plugin_product_learning_events WHERE created_at < ?`).bind(retentionCutoff).run();

  const hourlyCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentCount = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM plugin_product_learning_events WHERE created_at >= ?`
  ).bind(hourlyCutoff).first();
  if (Number(recentCount?.count || 0) >= 120) {
    return { accepted: false, status: "learning_rate_limited" };
  }

  const duplicateCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const duplicate = await env.DB.prepare(
    `SELECT id FROM plugin_product_learning_events
     WHERE business_type = ? AND problem_class = ? AND desired_capability = ? AND outcome = ? AND created_at >= ?
     LIMIT 1`
  )
    .bind(businessType, problemClass, desiredCapability, outcome, duplicateCutoff)
    .first();
  if (duplicate?.id) {
    return { accepted: true, status: "duplicate_product_learning_event" };
  }

  await env.DB.prepare(
    `INSERT INTO plugin_product_learning_events
      (id, created_at, business_type, problem_class, desired_capability, outcome, consent_state)
     VALUES (?, ?, ?, ?, ?, ?, 'explicit')`
  )
    .bind(id, now, businessType, problemClass, desiredCapability, outcome)
    .run();

  return { accepted: true, status: "stored_privacy_safe_product_learning_event" };
}

async function callTool(env: Env, name: string, args: Record<string, unknown>) {
  if (name === "get_product_overview") return getOverview();
  if (name === "recommend_start_path") return recommendStartPath(args);
  if (name === "build_crm_onboarding_plan") return buildCrmOnboardingPlan(args);
  if (name === "preview_crm_funnel") return previewCrmFunnel(args);
  if (name === "preview_agent_handoff") return previewAgentHandoff(args);
  if (name === "get_hermes_business_routes") return getHermesBusinessRoutes();
  if (name === "get_product_learning_policy") return getProductLearningPolicy();
  if (name === "submit_product_feedback") return submitProductFeedback(env, args);
  throw new Error("tool_not_found");
}

export async function onRequest({ request, env }: Context) {
  // MCP Streamable HTTP (2026-07-28) requires Origin checking for DNS-rebinding
  // resistance. Default to same-origin; additional host/browser origins must
  // be explicitly authorized in configuration. Remote server-to-server MCP
  // clients usually omit Origin and do not need any cross-origin allowance.
  const origin = request.headers.get("Origin");
  // Do not derive a trusted Origin from request.url or its Host header:
  // a malicious DNS-rebinding client can control both. The canonical public
  // domain is fixed, and additional HTTPS origins are operator-allowlisted.
  const allowed = new Set([
    "https://hermeslogisticsus.com",
    ...String(env.MCP_ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter((x) =>
      /^https:\/\/[^\/\s]+$/.test(x) && x !== "https://null"
    ),
  ]);
  if (origin !== null && !allowed.has(origin)) {
    return responseJson(403, rpcError(null, -32000, "Untrusted Origin"));
  }
  if (request.method === "GET") {
    return responseJson(405, { error: "method_not_allowed", message: "Use MCP Streamable HTTP POST requests." }, { Allow: "POST" });
  }
  if (request.method !== "POST") {
    return responseJson(405, { error: "method_not_allowed" }, { Allow: "POST" });
  }
  // Streamable HTTP accepts JSON-RPC as application/json only.
  // Reject browser form/text requests before parsing or invoking any tool.
  const mimeType = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  if (mimeType !== "application/json") {
    return responseJson(415, rpcError(null, -32600, "Unsupported Media Type"));
  }

  const declaredLength = Number(request.headers.get("Content-Length") || "0");
  if (declaredLength > 65536) return responseJson(413, rpcError(null, -32600, "Request body too large"));

  let message: JsonRpcRequest;
  try {
    // Content-Length is client-controlled and may be absent. Enforce the same
    // 64 KiB ceiling on actual streamed bytes before parsing public JSON-RPC.
    const reader = request.body?.getReader();
    if (!reader) return responseJson(400, rpcError(null, -32700, "Parse error"));
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let jsonText = "";
    let actualBytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      actualBytes += value.byteLength;
      if (actualBytes > 65536) {
        await reader.cancel().catch(() => {});
        return responseJson(413, rpcError(null, -32600, "Request body too large"));
      }
      jsonText += decoder.decode(value, { stream: true });
    }
    jsonText += decoder.decode();
    message = JSON.parse(jsonText) as JsonRpcRequest;
  } catch {
    return responseJson(400, rpcError(null, -32700, "Parse error"));
  }

  if (!message || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return responseJson(400, rpcError(message?.id ?? null, -32600, "Invalid Request"));
  }

  // Only modern 2026-07-28 requests require strict per-call header/body
  // matching. Keep legacy 2025 callers working until explicit migration.
  const headerVersion = request.headers.get("MCP-Protocol-Version");
  const payloadVersion = message.params?._meta?.["io.modelcontextprotocol/protocolVersion"];
  // Even if a client omits the modern version in both places, presence of a
  // modern routing header is a modern-protocol attempt, not a legacy escape.
  // Otherwise an attacker could bypass header/body parity by dropping _meta.
  const modernIntent = headerVersion === MODERN_PROTOCOL || payloadVersion === MODERN_PROTOCOL ||
    request.headers.has("Mcp-Method") || request.headers.has("Mcp-Name") ||
    message.method === "server/discover";
  if (modernIntent) {
    const expectedName = message.method === "tools/call" ? message.params?.name : undefined;
    const gotName = request.headers.get("Mcp-Name");
    if (headerVersion !== MODERN_PROTOCOL || payloadVersion !== MODERN_PROTOCOL ||
        request.headers.get("Mcp-Method") !== message.method ||
        (expectedName != null && (typeof expectedName !== "string" || gotName !== expectedName)) ||
        (expectedName == null && gotName !== null)) {
      return responseJson(400, rpcError(message.id, -32020, "HeaderMismatch"));
    }
    if (message.method === "initialize" || message.method === "notifications/initialized") {
      return responseJson(400, rpcError(message.id, -32601, "Legacy handshake is not part of MCP 2026-07-28"));
    }
  }

  if (message.id == null && message.method === "notifications/initialized") {
    return new Response(null, { status: 202, headers: { "Cache-Control": "no-store" } });
  }

  const modern = isModernRequest(request, message);

  if (message.method === "server/discover") {
    return responseJson(
      200,
      rpcResult(
        message.id,
        {
          supportedVersions: [MODERN_PROTOCOL, LEGACY_PROTOCOL],
          capabilities: { tools: { listChanged: false } },
          instructions,
        },
        true
      )
    );
  }

  if (message.method === "initialize") {
    return responseJson(
      200,
      rpcResult(message.id, {
        protocolVersion: LEGACY_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions,
      })
    );
  }

  if (message.method === "ping") return responseJson(200, rpcResult(message.id, {}, modern));

  if (message.method === "tools/list") {
    return responseJson(200, rpcResult(message.id, { tools: publicToolDefinitions }, modern));
  }

  if (message.method === "tools/call") {
    const name = normalize(message.params?.name, 80);
    const args = message.params?.arguments;
    if (!name || (args != null && (typeof args !== "object" || Array.isArray(args)))) {
      return responseJson(400, rpcError(message.id, -32602, "Invalid tool call parameters"));
    }
    try {
      const structuredContent = await callTool(env, name, (args || {}) as Record<string, unknown>);
      return responseJson(
        200,
        rpcResult(
          message.id,
          {
            structuredContent,
            content: [{ type: "text", text: JSON.stringify(structuredContent) }],
            isError: false,
          },
          modern
        )
      );
    } catch (error) {
      if (error instanceof Error && error.message === "tool_not_found") {
        return responseJson(200, rpcError(message.id, -32601, `Unknown tool: ${name}`));
      }
      return responseJson(
        200,
        rpcResult(
          message.id,
          {
            content: [{ type: "text", text: "Hermes Connect could not complete this tool call." }],
            isError: true,
          },
          modern
        )
      );
    }
  }

  return responseJson(200, rpcError(message.id, -32601, "Method not found"));
}
