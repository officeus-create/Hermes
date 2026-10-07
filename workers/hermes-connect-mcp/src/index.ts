import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

type Env = {
  OPENAI_APPS_CHALLENGE_TOKEN?: string;
};

const URLS = {
  product: "https://hermeslogisticsus.com/services/hermes-connect/",
  website: "https://hermeslogisticsus.com/",
  contacts: "https://hermeslogisticsus.com/contacts/",
  privacy: "https://hermeslogisticsus.com/privacy/",
  terms: "https://hermeslogisticsus.com/terms/",
  company: "https://hermeslogisticsus.com/company-information/",
  security: "https://hermeslogisticsus.com/data-security/",
} as const;

const ROUTES = [
  {
    id: "CONNECT",
    name: "Hermes Connect / Technology",
    use_when:
      "CRM, workflow, automation, software, integrations, operating data, or product change requests are the main problem.",
  },
  {
    id: "MARKETING",
    name: "Hermes Marketing",
    use_when:
      "Website, SEO/GEO/local/AI visibility, content, social, acquisition, CTA, or measurement readiness is the main problem.",
  },
  {
    id: "LOGISTICS",
    name: "Hermes Logistics",
    use_when:
      "U.S. logistics operations, carriers, dispatch, car hauling, shippers, dealers, or related workflows are the main problem.",
  },
  {
    id: "ACADEMY",
    name: "Hermes Academy",
    use_when:
      "Structured learning, practice, role development, course progression, or team capability is the main problem.",
  },
] as const;

const PRODUCT_STATE = {
  product: "Hermes Connect CRM",
  developer: "Hermes Logistics LLC",
  audience:
    "Business owners, operators, teams, and Hermes customers who want to understand, design, improve, or operate business workflows and CRM systems.",
  public_boundary:
    "Public discovery tools do not expose private Hermes One Brain data, customer CRM records, credentials, or cross-tenant information.",
  customer_boundary:
    "Customer-specific reads and writes require future authenticated Hermes identity, Company, Workspace, Role, and Capability checks. Public tools do not grant those privileges.",
  evidence_rule:
    "Interest, plugin installation, a conversation, a Catalog action, and a lead are separate states. None is treated as payment or revenue without corresponding evidence.",
  sources: [
    URLS.product,
    URLS.company,
    URLS.privacy,
    URLS.security,
  ],
} as const;

const businessReviewSteps = [
  "Clarify the business, role, current workflow, bottleneck, and desired outcome.",
  "Separate observed facts from assumptions.",
  "Map the customer or operating flow from trigger to outcome.",
  "Identify the highest-value friction or handoff failure.",
  "Define one measurable next step before expanding scope.",
  "Route to CRM/Technology, Marketing, Logistics, Academy, or advisory-only only when the evidence supports it.",
] as const;

function createServer() {
  const server = new McpServer(
    {
      name: "hermes-connect-crm",
      version: "1.0.0",
    },
    {
      instructions:
        "Public Hermes Connect discovery only. Never claim private CRM access, Hermes owner/staff status, customer status, payment, revenue, or background work from these tools. Use the user's language in the final answer. Give useful business guidance before suggesting a Hermes route.",
    },
  );

  server.registerTool(
    "get_product_overview",
    {
      title: "Get Hermes Connect overview",
      description:
        "Use when a user asks what Hermes Connect CRM is, who it is for, or what its current public trust and access boundaries are.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        product: z.string(),
        developer: z.string(),
        audience: z.string(),
        public_boundary: z.string(),
        customer_boundary: z.string(),
        evidence_rule: z.string(),
        sources: z.array(z.string()),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => ({
      structuredContent: PRODUCT_STATE,
      content: [
        {
          type: "text",
          text: "Hermes Connect CRM public product overview and trust boundaries.",
        },
      ],
    }),
  );

  server.registerTool(
    "get_business_review_framework",
    {
      title: "Get business review framework",
      description:
        "Use when a new user wants a structured way to understand their business, workflow, CRM needs, bottlenecks, priorities, or automation opportunities.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        steps: z.array(z.string()),
        rule: z.string(),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => ({
      structuredContent: {
        steps: [...businessReviewSteps],
        rule:
          "Use only task-relevant context the user intentionally makes available. Do not request or reconstruct complete raw ChatGPT history.",
      },
      content: [
        {
          type: "text",
          text: "Business review framework ready.",
        },
      ],
    }),
  );

  server.registerTool(
    "get_hermes_business_routes",
    {
      title: "Get Hermes business routes",
      description:
        "Use when the user's need may belong to Hermes Connect/Technology, Marketing, U.S. Logistics, Academy, or a justified combination. Returns routing boundaries, not a sales commitment.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        routes: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            use_when: z.string(),
          }),
        ),
        contact_url: z.string(),
        rule: z.string(),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => ({
      structuredContent: {
        routes: [...ROUTES],
        contact_url: URLS.contacts,
        rule:
          "Recommend the smallest route supported by the user's actual problem. Do not invent pricing, availability, licensing, partnership, customer status, or guaranteed outcomes.",
      },
      content: [
        {
          type: "text",
          text: "Hermes business routing map ready.",
        },
      ],
    }),
  );

  server.registerTool(
    "get_public_trust_links",
    {
      title: "Get Hermes trust links",
      description:
        "Use when a user wants official Hermes product, company, support, privacy, terms, or data-security information.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        product: z.string(),
        company: z.string(),
        support: z.string(),
        privacy: z.string(),
        terms: z.string(),
        security: z.string(),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => ({
      structuredContent: {
        product: URLS.product,
        company: URLS.company,
        support: URLS.contacts,
        privacy: URLS.privacy,
        terms: URLS.terms,
        security: URLS.security,
      },
      content: [
        {
          type: "text",
          text: "Official Hermes trust and support links.",
        },
      ],
    }),
  );

  server.registerTool(
    "get_product_learning_policy",
    {
      title: "Get product learning policy",
      description:
        "Use when a user asks how Hermes Connect can improve from usage, feedback, recurring requests, or customer patterns without copying private conversations into shared memory.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        reusable_learning: z.array(z.string()),
        excluded_data: z.array(z.string()),
        release_rule: z.string(),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => ({
      structuredContent: {
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
          "Reusable learning may create a SkillCandidate or CapabilityCandidate. Public privileged behavior is changed only through reviewed versioned releases or approved hosted MCP tool updates.",
      },
      content: [
        {
          type: "text",
          text: "Hermes Connect product-learning policy ready.",
        },
      ],
    }),
  );

  return server;
}

const mcpHandler = createMcpHandler(createServer);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Hermes Connect CRM MCP", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    if (url.pathname === "/.well-known/openai-apps-challenge") {
      const token = String(env.OPENAI_APPS_CHALLENGE_TOKEN || "").trim();
      if (!token) {
        return new Response("Not configured", {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        });
      }
      return new Response(token, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    if (url.pathname === "/mcp") {
      return mcpHandler.fetch(request);
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  },
};
