import {
  extractResponsesText,
  normalizeThreadsText,
  parseThreadsAiDecision,
  type ThreadsAiDecision,
} from "../../../../src/lib/threads-growth-engine.ts";

type Env = {
  DB?: any;
  THREADS_AUTOMATION_MODE?: string;
  THREADS_AUTOMATION_TOKEN?: string;
  THREADS_ACCESS_TOKEN?: string;
  THREADS_USER_ID?: string;
  THREADS_USERNAME?: string;
  THREADS_GRAPH_BASE?: string;
  OPENAI_API_KEY?: string;
  THREADS_AI_MODEL?: string;
  THREADS_DISCOVERY_MAX_COMMENTS?: string;
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const clean = (value: unknown, max = 1000) => normalizeThreadsText(value, max);

const queries = [
  "small business CRM",
  "business automation",
  "website redesign",
  "local SEO",
  "Google Maps business",
  "lead follow up",
  "small business marketing",
  "CRM for small business",
  "أتمتة الأعمال",
  "نظام CRM",
  "تسويق دبي",
  "موقع إلكتروني دبي",
  "تحسين محركات البحث دبي",
  "إدارة العملاء",
];

async function ensureSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_discovery (
      post_id TEXT PRIMARY KEY,
      query_text TEXT NOT NULL,
      username TEXT,
      post_text TEXT NOT NULL,
      permalink TEXT,
      ai_action TEXT NOT NULL,
      ai_comment TEXT,
      ai_reason TEXT,
      status TEXT NOT NULL,
      provider_reply_id TEXT,
      discovered_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_threads_growth_discovery_status ON threads_growth_discovery(status, updated_at)"
  ).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_author_touch (
      username TEXT PRIMARY KEY,
      last_post_id TEXT NOT NULL,
      last_commented_at TEXT NOT NULL
    )
  `).run();
}

async function graphGet(env: Env, path: string, params: Record<string, string>) {
  const base = clean(env.THREADS_GRAPH_BASE, 200) || "https://graph.threads.com/v1.0/";
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", String(env.THREADS_ACCESS_TOKEN || ""));
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`threads_graph_get_failed:${response.status}:${JSON.stringify(payload).slice(0, 300)}`);
  return payload;
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

async function draftComment(env: Env, postText: string, username: string): Promise<ThreadsAiDecision> {
  const prompt = [
    "You are the ProgressoPro / Hermes Technology Threads community manager.",
    "Decide whether this public post is genuinely relevant to websites, CRM, automation, SEO/GEO, local visibility, social media, lead handling, sales systems, or business operations.",
    "We are NOT promoting logistics in this account.",
    "If it is not directly relevant, return action=skip.",
    "If relevant, write one natural comment in the SAME LANGUAGE as the post, maximum 300 characters.",
    "The comment must add a useful idea, a concrete observation, or one intelligent question.",
    "Do not paste a link. Do not say 'check our profile'. Do not use generic praise. Do not pretend to be a customer.",
    "Do not manufacture authority, results, numbers, clients, rankings, or guarantees.",
    "Do not argue aggressively or post political, medical, legal, financial, adult, or sensitive-topic engagement.",
    "A soft commercial angle is allowed only if the author is explicitly asking for help with a business problem.",
    "Return ONLY JSON: {\"action\":\"reply|skip|review\",\"reply\":\"...\",\"intent\":\"...\",\"reason\":\"...\"}.",
    `Author: @${clean(username, 120)}`,
    `Post: ${clean(postText, 1500)}`,
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
      max_output_tokens: 320,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`openai_failed:${response.status}`);
  return parseThreadsAiDecision(extractResponsesText(payload));
}

async function publishComment(env: Env, postId: string, text: string) {
  const userId = clean(env.THREADS_USER_ID, 120);
  const published = await graphPost(env, `${userId}/threads`, {
    media_type: "TEXT",
    text,
    reply_to_id: postId,
    auto_publish_text: "true",
  });
  const providerId = clean(published?.id, 160);
  if (!providerId) throw new Error("threads_discovery_reply_id_missing");
  return providerId;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return json(503, { success: false, error: "database_not_configured" });
  const auth = request.headers.get("Authorization") || "";
  if (!env.THREADS_AUTOMATION_TOKEN || auth !== `Bearer ${env.THREADS_AUTOMATION_TOKEN}`) {
    return json(401, { success: false, error: "unauthorized" });
  }
  if (!env.THREADS_ACCESS_TOKEN || !env.THREADS_USER_ID || !env.OPENAI_API_KEY) {
    return json(503, { success: false, error: "threads_discovery_not_configured" });
  }

  await ensureSchema(env.DB);
  const mode = env.THREADS_AUTOMATION_MODE === "live" ? "live" : "dry_run";
  const slot = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
  const query = queries[slot % queries.length];
  const maxComments = Math.max(1, Math.min(3, Number(env.THREADS_DISCOVERY_MAX_COMMENTS || "2") || 2));
  const since = String(Math.floor((Date.now() - 72 * 60 * 60 * 1000) / 1000));
  const ownUsername = clean(env.THREADS_USERNAME, 120).toLowerCase();

  const payload = await graphGet(env, "keyword_search", {
    q: query,
    search_type: "RECENT",
    search_mode: "KEYWORD",
    fields: "id,text,permalink,timestamp,username,is_reply",
    since,
    limit: "25",
  });

  const posts = Array.isArray(payload?.data) ? payload.data : [];
  let scanned = 0;
  let candidates = 0;
  let published = 0;
  let skipped = 0;
  let reviewRequired = 0;

  for (const post of posts) {
    if (published >= maxComments || candidates >= maxComments * 3) break;
    const postId = clean(post?.id, 160);
    const username = clean(post?.username, 120);
    const postText = clean(post?.text, 1500);
    const permalink = clean(post?.permalink, 500);
    if (!postId || !username || !postText || post?.is_reply === true) continue;
    if (ownUsername && username.toLowerCase() === ownUsername) continue;
    scanned += 1;

    const existing = await env.DB.prepare("SELECT status FROM threads_growth_discovery WHERE post_id = ?").bind(postId).first();
    if (existing) continue;

    const touched = await env.DB.prepare(
      "SELECT last_commented_at FROM threads_growth_author_touch WHERE username = ?"
    ).bind(username.toLowerCase()).first();
    if (touched?.last_commented_at) {
      const last = Date.parse(String(touched.last_commented_at));
      if (Number.isFinite(last) && Date.now() - last < 7 * 24 * 60 * 60 * 1000) continue;
    }

    let decision: ThreadsAiDecision;
    try {
      decision = await draftComment(env, postText, username);
    } catch {
      reviewRequired += 1;
      continue;
    }

    const now = new Date().toISOString();
    if (decision.action === "skip") {
      skipped += 1;
      await env.DB.prepare(`
        INSERT INTO threads_growth_discovery
          (post_id, query_text, username, post_text, permalink, ai_action, ai_comment, ai_reason, status, discovered_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(postId, query, username, postText, permalink, "skip", "", decision.reason, "skipped", now, now).run();
      continue;
    }
    if (decision.action === "review") {
      reviewRequired += 1;
      await env.DB.prepare(`
        INSERT INTO threads_growth_discovery
          (post_id, query_text, username, post_text, permalink, ai_action, ai_comment, ai_reason, status, discovered_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(postId, query, username, postText, permalink, "review", decision.reply, decision.reason, "review_required", now, now).run();
      continue;
    }

    candidates += 1;
    let status = "candidate";
    let providerReplyId: string | null = null;
    if (mode === "live" && published < maxComments) {
      try {
        providerReplyId = await publishComment(env, postId, decision.reply);
        status = "published";
        published += 1;
        await env.DB.prepare(`
          INSERT INTO threads_growth_author_touch (username, last_post_id, last_commented_at)
          VALUES (?, ?, ?)
          ON CONFLICT(username) DO UPDATE SET
            last_post_id = excluded.last_post_id,
            last_commented_at = excluded.last_commented_at
        `).bind(username.toLowerCase(), postId, now).run();
      } catch {
        status = "review_required";
        reviewRequired += 1;
      }
    }

    await env.DB.prepare(`
      INSERT INTO threads_growth_discovery
        (post_id, query_text, username, post_text, permalink, ai_action, ai_comment, ai_reason, status, provider_reply_id, discovered_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      postId, query, username, postText, permalink, "reply", decision.reply, decision.reason,
      status, providerReplyId, now, now
    ).run();
  }

  return json(200, {
    success: true,
    mode,
    query,
    scanned,
    candidates,
    published,
    skipped,
    review_required: reviewRequired,
  });
}
