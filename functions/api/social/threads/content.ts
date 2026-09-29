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
  /(?:\b(?:guaranteed|guarantee|#1|best in the world|millions? of views|thousands? of leads|double your revenue|triple your revenue|rank #?1|instant results|100% free forever)\b|ضمان|مضمون|الأفضل في العالم|رقم\s*1)/i;

const themes = [
  {
    id: "free-crm-entry",
    brief: "Invite small-business owners to describe their workflow so Hermes can shape a CRM around real processes. Keep the offer low-friction and do not promise that every requested feature will be built.",
    category: "technology" as const,
  },
  {
    id: "digitize-before-scale",
    brief: "Explain that a business is easier to scale after customer, sales, operations and follow-up processes are visible in one system. Ask a practical question.",
    category: "technology" as const,
  },
  {
    id: "website-is-not-the-system",
    brief: "Make the point that a website alone does not fix lost leads. Connect website, search visibility, CRM and follow-up without overselling.",
    category: "technology" as const,
  },
  {
    id: "catalog-mini-site",
    brief: "Explain the Hermes model: connected businesses can have a catalog profile / mini presence that can become another discovery and inquiry surface. Avoid ranking guarantees.",
    category: "technology" as const,
  },
  {
    id: "manual-work-automation",
    brief: "Ask business owners which repetitive manual task consumes the most staff time, and explain that this is often the best automation starting point.",
    category: "technology" as const,
  },
  {
    id: "sales-leakage",
    brief: "Discuss the hidden cost of leads arriving from phone, social, email and web forms without one follow-up process. Ask where leads are currently tracked.",
    category: "marketing" as const,
  },
  {
    id: "local-search",
    brief: "Explain in simple terms that local visibility is about being discoverable when nearby customers search for a service. No ranking or lead guarantees.",
    category: "marketing" as const,
  },
  {
    id: "six-month-plan",
    brief: "Ask whether the business has a six-month operating/growth plan and understands customer LTV. Position systems work as staged improvement, not a one-shot project.",
    category: "marketing" as const,
  },
];

const markets = [
  {
    code: "us-nyc",
    city: "New York",
    language: "en",
    languageInstruction: "Write in natural American English.",
    technology: "/paths/technology/",
    marketing: "/paths/marketing/",
  },
  {
    code: "es-madrid",
    city: "Madrid",
    language: "es",
    languageInstruction: "Write in natural Spanish used in Spain.",
    technology: "/es/tecnologia/",
    marketing: "/es/marketing/",
  },
  {
    code: "it-milano",
    city: "Milano",
    language: "it",
    languageInstruction: "Write in natural Italian.",
    technology: "/it/tecnologia/",
    marketing: "/it/marketing/",
  },
  {
    code: "fr-paris",
    city: "Paris",
    language: "fr",
    languageInstruction: "Write in natural French.",
    technology: "/fr/technologie/",
    marketing: "/fr/marketing/",
  },
  {
    code: "ua-kyiv",
    city: "Київ",
    language: "uk",
    languageInstruction: "Write in natural Ukrainian.",
    technology: "/ua/technology/",
    marketing: "/ua/marketing/",
  },
  {
    code: "ae-dubai",
    city: "دبي",
    language: "ar",
    languageInstruction: "Write in natural Modern Standard Arabic suitable for business owners in Dubai and the UAE.",
    technology: "/ar/technology/",
    marketing: "/ar/marketing/",
  },
] as const;

function destinationFor(theme: typeof themes[number], market: typeof markets[number]) {
  return theme.category === "marketing" ? market.marketing : market.technology;
}

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
  const base = clean(env.THREADS_GRAPH_BASE, 200) || "https://graph.threads.com/v1.0/";
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

async function generatePost(
  env: Env,
  theme: typeof themes[number],
  market: typeof markets[number],
  contentId: string,
) {
  const trackedUrl = buildTrackedThreadsUrl(destinationFor(theme, market), contentId);
  const prompt = [
    "You write organic sales-oriented Threads posts for ProgressoPro / Hermes Technology.",
    "This account covers ONLY websites, CRM, business automation, SEO/GEO, local visibility, social media, marketing, sales systems and related IT. Never mention logistics.",
    market.languageInstruction,
    "Write ONE post, maximum 500 characters INCLUDING the URL.",
    `The first line must be exactly: ${market.city}?`,
    "Then ask whether the business has the capability/problem described by the theme, or whether the owner wants to add/fix it.",
    "Make the offer concrete and low-pressure: if they want this capability or want the problem solved, they can contact us / read the detailed page.",
    "End with the exact URL provided below.",
    "Do not fabricate clients, outcomes, revenue, rankings, view counts, case studies, prices, integrations, offices or guarantees.",
    "Do not claim a local office or local team in the named city.",
    "Use no more than 1 emoji and no more than 2 hashtags. Avoid generic AI/corporate phrasing.",
    `Detailed page: ${trackedUrl}`,
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
  const published = await graphPost(env, `${userId}/threads`, {
    media_type: "TEXT",
    text,
    auto_publish_text: "true",
  });
  const providerId = clean(published?.id, 160);
  if (!providerId) throw new Error("threads_post_id_missing");
  return providerId;
}

async function chooseTheme(db: any, slot: number) {
  const exploration = themes[slot % themes.length];
  if (slot % 10 >= 7) return exploration;
  try {
    const winner = await db.prepare(`
      SELECT
        theme_id,
        COUNT(*) AS samples,
        AVG(views) AS avg_views,
        AVG(replies) AS avg_replies,
        AVG(likes) AS avg_likes
      FROM threads_growth_insights
      GROUP BY theme_id
      HAVING COUNT(*) >= 2
      ORDER BY (AVG(views) + AVG(replies) * 25 + AVG(likes) * 5) DESC, theme_id ASC
      LIMIT 1
    `).first();
    const matched = themes.find((theme) => theme.id === clean(winner?.theme_id, 100));
    return matched || exploration;
  } catch {
    return exploration;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return json(503, { success: false, error: "database_not_configured" });
  const token = request.headers.get("Authorization") || "";
  if (!env.THREADS_AUTOMATION_TOKEN || token !== `Bearer ${env.THREADS_AUTOMATION_TOKEN}`) {
    return json(401, { success: false, error: "unauthorized" });
  }
  const mode = env.THREADS_AUTOMATION_MODE === "live" ? "live" : "dry_run";
  if (!env.THREADS_ACCESS_TOKEN || !env.THREADS_USER_ID || !env.OPENAI_API_KEY) {
    return json(503, { success: false, error: "threads_growth_not_configured", mode });
  }

  await ensureSchema(env.DB);
  const slot = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  const theme = await chooseTheme(env.DB, slot);
  const market = markets[slot % markets.length];
  const id = `threads-content-${market.code}-${theme.id}-${slot}`;

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
    postText = await generatePost(env, theme, market, id);
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
    id, theme.id, market.language, postText, status, providerPostId, now, now
  ).run();

  return json(200, {
    success: true,
    id,
    mode,
    theme: theme.id,
    market: market.code,
    city: market.city,
    language: market.language,
    status,
    provider_post_id: providerPostId,
    post_text: postText,
  });
}
