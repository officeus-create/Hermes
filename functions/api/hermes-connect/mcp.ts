type Env = { DB?: any };
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
  if (name === "get_hermes_business_routes") return getHermesBusinessRoutes();
  if (name === "get_product_learning_policy") return getProductLearningPolicy();
  if (name === "submit_product_feedback") return submitProductFeedback(env, args);
  throw new Error("tool_not_found");
}

export async function onRequest({ request, env }: Context) {
  if (request.method === "GET") {
    return responseJson(405, { error: "method_not_allowed", message: "Use MCP Streamable HTTP POST requests." }, { Allow: "POST" });
  }
  if (request.method !== "POST") {
    return responseJson(405, { error: "method_not_allowed" }, { Allow: "POST" });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || "0");
  if (declaredLength > 65536) return responseJson(413, rpcError(null, -32600, "Request body too large"));

  let message: JsonRpcRequest;
  try {
    message = (await request.json()) as JsonRpcRequest;
  } catch {
    return responseJson(400, rpcError(null, -32700, "Parse error"));
  }

  if (!message || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return responseJson(400, rpcError(message?.id ?? null, -32600, "Invalid Request"));
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
