import {
  buildTrackedThreadsUrl,
  extractResponsesText,
  normalizeThreadsText,
} from "../../../../src/lib/threads-growth-engine.ts";

type Env = {
  DB?: any;
  THREADS_AUTOMATION_MODE?: string;
  THREADS_AUTOMATION_TOKEN?: string;
  THREADS_ACCESS_TOKEN?: string;
  THREADS_USER_ID?: string;
  THREADS_GRAPH_BASE?: string;
  OPENAI_API_KEY?: string;
  THREADS_AI_MODEL?: string;
  THREADS_CONTENT_LANGUAGE?: string;
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const clean = (value: unknown, max = 1000) => normalizeThreadsText(value, max);

const forbiddenClaimPattern =
  /\b(?:guaranteed|guarantee|#1|best in the world|millions? of views|thousands? of leads|double your revenue|triple your revenue|rank #?1|instant results|100% free forever)\b/i;

const themes = [
  {
    id: "free-crm-entry",
    brief: "Invite small-business owners to describe their workflow so Hermes can shape a CRM around real processes. Keep the offer low-friction and do not promise that every requested feature will be built.",
    destination: "/paths/technology/",
  },
  {
    id: "digitize-before-scale",
    brief: "Explain that a business is easier to scale after customer, sales, operations and follow-up processes are visible in one system. Ask a practical question.",
    destination: "/paths/technology/",
  },
  {
    id: "website-is-not-the-system",
    brief: "Make the point that a website alone does not fix lost leads. Connect website, search visibility, CRM and follow-up without overselling.",
    destination: "/business-growth/",
  },
  {
    id: "catalog-mini-site",
    brief: "Explain the Hermes model: connected businesses can have a catalog profile / mini presence that can become another discovery and inquiry surface. Avoid ranking guarantees.",
    destination: "/businesses/",
  },
  {
    id: "manual-work-automation",
    brief: "Ask business owners which repetitive manual task consumes the most staff time, and explain that this is often the best automation starting point.",
    destination: "/paths/technology/",
  },
  {
    id: "sales-leakage",
    brief: "Discuss the hidden cost of leads arriving from phone, social, email and web forms without one follow-up process. Ask where leads are currently tracked.",
    destination: "/business-growth/",
  },
  {
    id: "local-search",
    brief: "Explain in simple terms that local visibility is about being discoverable when nearby customers search for a service. No ranking or lead guarantees.",
    destination: "/paths/marketing/",
  },
  {
    id: "six-month-plan",
    brief: "Ask whether the business has a six-month operating/growth plan and understands customer LTV. Position systems work as staged improvement, not a one-shot project.",
    destination: "/business-growth/",
  },
];

async function ensureSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_content (
      id TEXT PRIMARY KEY,
      theme_id TEXT NOT NULL,
      language TEXT NOT NULL,
      post_text TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_post_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_threads_growth_content_status ON threads_growth_content(status, created_at)").run();
}

async function graphPost(env: Env, path: string, params: Record<string, string>) {
  const base = clean(env.THREADS_GRAPH_BASE, 200);
  if (!base) throw new Error("threads_graph_base_missing");
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  const body = new URLSearchParams({ ...params, access_token: String(env.THREADS_ACCESS_TOKEN || "") });
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`threads_graph_post_failed:${response.status}:${JSON.stringify(payload).slice(0, 300)}`);
  return payload;
}

function languageInstruction(value: string) {
  const language = clean(value, 20).toLowerCase();
  if (language === "ru" || language === "russian") return "Write in natural Russian.";
  if (language === "es" || language === "spanish") return "Write in natural Spanish.";
  if (language === "de" || language === "german") return "Write in natural German.";
  if (language === "it" || language === "italian") return "Write in natural Italian.";
  if (language === "pt-br" || language === "portuguese") return "Write in natural Brazilian Portuguese.";
  return "Write in natural American English.";
}

async function generatePost(env: Env, theme: typeof themes[number], contentId: string) {
  const trackedUrl = buildTrackedThreadsUrl(theme.destination, contentId);
  const includeLink = Number(contentId.split("-").pop() || "0") % 4 === 0;
  const prompt = [
    "You write organic Threads posts for ProgressoPro / Hermes Technology.",
    languageInstruction(env.THREADS_CONTENT_LANGUAGE || "en"),
    "Write ONE post, maximum 430 characters. It must read like a real operator, not an ad bot.",
    "Use a strong first sentence. Prefer a concrete observation, question, or useful disagreement.",
    "Do not fabricate clients, outcomes, revenue, rankings, view counts, case studies, prices, integrations, offices or guarantees.",
    "Do not use more than 1 emoji. Do not use more than 2 hashtags. Avoid corporate buzzwords.",
    "If you ask a question, make it specific enough that a business owner can answer.",
    includeLink ? `End naturally with this exact URL: ${trackedUrl}` : "Do not include a URL in this post.",
    `Theme: ${theme.brief}`,
    "Return only the post text.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: clean(env.THREADS_AI_MODEL, 80) || "gpt-5.6-luna",
      input: prompt,
      reasoning: { effort: "low" },
      max_output_tokens: 260,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`openai_failed:${response.status}:${JSON.stringify(payload).slice(0, 300)}`);
  const text = clean(extractResponsesText(payload), 500);
  if (!text || text.length > 460) throw new Error("generated_post_invalid_length");
  if (forbiddenClaimPattern.test(text)) throw new Error("generated_post_contains_forbidden_claim");
  return text;
}

async function publishPost(env: Env, text: string) {
  const userId = clean(env.THREADS_USER_ID, 120);
  const create = await graphPost(env, `${userId}/threads`, { media_type: "TEXT", text });
  const creationId = clean(create?.id, 160);
  if (!creationId) throw new Error("threads_creation_id_missing");
  const published = await graphPost(env, `${userId}/threads_publish`, { creation_id: creationId });
  return clean(published?.id, 160) || creationId;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return json(503, { success: false, error: "database_not_configured" });
  const token = request.headers.get("Authorization") || "";
  if (!env.THREADS_AUTOMATION_TOKEN || token !== `Bearer ${env.THREADS_AUTOMATION_TOKEN}`) {
    return json(401, { success: false, error: "unauthorized" });
  }
  const mode = env.THREADS_AUTOMATION_MODE === "live" ? "live" : "dry_run";
  if (!env.THREADS_ACCESS_TOKEN || !env.THREADS_USER_ID || !env.THREADS_GRAPH_BASE || !env.OPENAI_API_KEY) {
    return json(503, { success: false, error: "threads_growth_not_configured", mode });
  }

  await ensureSchema(env.DB);
  const slot = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  const theme = themes[slot % themes.length];
  const id = `threads-content-${theme.id}-${slot}`;

  const existing = await env.DB.prepare("SELECT status, post_text, provider_post_id FROM threads_growth_content WHERE id = ?").bind(id).first();
  if (existing) {
    return json(200, {
      success: true,
      duplicate: true,
      id,
      mode,
      status: existing.status,
      provider_post_id: existing.provider_post_id || null,
    });
  }

  let postText = "";
  try {
    postText = await generatePost(env, theme, id);
  } catch (error) {
    return json(502, { success: false, error: error instanceof Error ? error.message : "generation_failed", id, mode });
  }

  const now = new Date().toISOString();
  let status = "candidate";
  let providerPostId: string | null = null;

  if (mode === "live") {
    try {
      providerPostId = await publishPost(env, postText);
      status = "published";
    } catch (error) {
      status = "publish_failed";
      await env.DB.prepare(`
        INSERT INTO threads_growth_content (id, theme_id, language, post_text, status, provider_post_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, theme.id, clean(env.THREADS_CONTENT_LANGUAGE || "en", 20), postText, status, null, now, now).run();
      return json(502, { success: false, error: error instanceof Error ? error.message : "publish_failed", id, mode });
    }
  }

  await env.DB.prepare(`
    INSERT INTO threads_growth_content (id, theme_id, language, post_text, status, provider_post_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, theme.id, clean(env.THREADS_CONTENT_LANGUAGE || "en", 20), postText, status, providerPostId, now, now
  ).run();

  return json(200, {
    success: true,
    id,
    mode,
    theme: theme.id,
    status,
    provider_post_id: providerPostId,
    post_text: postText,
  });
}
