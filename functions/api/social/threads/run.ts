import {
  buildThreadsReplyPrompt,
  deterministicReplyGate,
  extractResponsesText,
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
  THREADS_MAX_REPLIES_PER_RUN?: string;
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const clean = (value: unknown, max = 1000) =>
  typeof value === "string" ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

async function ensureSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_reply_state (
      reply_id TEXT PRIMARY KEY,
      parent_post_id TEXT NOT NULL,
      username TEXT,
      comment_text TEXT NOT NULL,
      ai_action TEXT NOT NULL,
      ai_reply TEXT,
      ai_intent TEXT,
      ai_reason TEXT,
      status TEXT NOT NULL,
      provider_reply_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_threads_growth_status ON threads_growth_reply_state(status, updated_at)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_runs (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      posts_scanned INTEGER NOT NULL DEFAULT 0,
      replies_scanned INTEGER NOT NULL DEFAULT 0,
      replies_published INTEGER NOT NULL DEFAULT 0,
      review_required INTEGER NOT NULL DEFAULT 0,
      skipped INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run();
}

async function graphGet(env: Env, path: string) {
  const base = clean(env.THREADS_GRAPH_BASE, 200) || "https://graph.threads.com/v1.0/";
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  url.searchParams.set("access_token", String(env.THREADS_ACCESS_TOKEN || ""));
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`threads_graph_get_failed:${response.status}:${JSON.stringify(payload).slice(0, 300)}`);
  return payload;
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

async function aiDecision(env: Env, comment: string, postText: string, username: string): Promise<ThreadsAiDecision> {
  const prompt = buildThreadsReplyPrompt(comment, { postText, username });
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
      max_output_tokens: 350,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`openai_failed:${response.status}:${JSON.stringify(payload).slice(0, 300)}`);
  return parseThreadsAiDecision(extractResponsesText(payload));
}

async function publishReply(env: Env, replyToId: string, text: string) {
  const userId = clean(env.THREADS_USER_ID, 120);
  const published = await graphPost(env, `${userId}/threads`, {
    media_type: "TEXT",
    text,
    reply_to_id: replyToId,
    auto_publish_text: "true",
  });
  const providerId = clean(published?.id, 160);
  if (!providerId) throw new Error("threads_reply_id_missing");
  return providerId;
}

async function saveState(env: Env, input: {
  replyId: string; parentPostId: string; username: string; commentText: string; decision: ThreadsAiDecision;
  status: string; providerReplyId?: string;
}) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO threads_growth_reply_state
      (reply_id, parent_post_id, username, comment_text, ai_action, ai_reply, ai_intent, ai_reason, status, provider_reply_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(reply_id) DO UPDATE SET
      ai_action = excluded.ai_action,
      ai_reply = excluded.ai_reply,
      ai_intent = excluded.ai_intent,
      ai_reason = excluded.ai_reason,
      status = excluded.status,
      provider_reply_id = COALESCE(excluded.provider_reply_id, threads_growth_reply_state.provider_reply_id),
      updated_at = excluded.updated_at
  `).bind(
    input.replyId, input.parentPostId, input.username, input.commentText,
    input.decision.action, input.decision.reply, input.decision.intent, input.decision.reason,
    input.status, input.providerReplyId || null, now, now,
  ).run();
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
  const runId = crypto.randomUUID();
  const maxReplies = Math.max(1, Math.min(25, Number(env.THREADS_MAX_REPLIES_PER_RUN || "8") || 8));
  const ownUsername = clean(env.THREADS_USERNAME, 120).toLowerCase();
  let postsScanned = 0;
  let repliesScanned = 0;
  let repliesPublished = 0;
  let reviewRequired = 0;
  let skipped = 0;

  const postsPayload = await graphGet(env, "me/threads?fields=id,text,timestamp,permalink&limit=20");
  const posts = Array.isArray(postsPayload?.data) ? postsPayload.data : [];

  for (const post of posts) {
    if (repliesScanned >= maxReplies) break;
    const postId = clean(post?.id, 160);
    if (!postId) continue;
    postsScanned += 1;
    const replyPayload = await graphGet(env, `${postId}/conversation?fields=id,text,username,timestamp,is_reply_owned_by_me&limit=50`);
    const replies = Array.isArray(replyPayload?.data) ? replyPayload.data : [];

    for (const reply of replies) {
      if (repliesScanned >= maxReplies) break;
      const replyId = clean(reply?.id, 160);
      const username = clean(reply?.username, 120);
      const commentText = clean(reply?.text, 1200);
      if (!replyId || !commentText) continue;
      if (reply?.is_reply_owned_by_me === true) continue;
      if (ownUsername && username.toLowerCase() === ownUsername) continue;

      const existing = await env.DB.prepare(
        "SELECT status FROM threads_growth_reply_state WHERE reply_id = ?"
      ).bind(replyId).first();
      if (existing?.status === "published" || existing?.status === "skipped" || existing?.status === "review_required") continue;

      repliesScanned += 1;
      const gate = deterministicReplyGate(commentText);
      if (gate === "skip") {
        skipped += 1;
        await saveState(env, {
          replyId, parentPostId: postId, username, commentText,
          decision: { action: "skip", reply: "", intent: "", reason: "Deterministic empty/invalid comment gate." },
          status: "skipped",
        });
        continue;
      }
      if (gate === "review") {
        reviewRequired += 1;
        await saveState(env, {
          replyId, parentPostId: postId, username, commentText,
          decision: { action: "review", reply: "", intent: "", reason: "Sensitive comment requires human review." },
          status: "review_required",
        });
        continue;
      }

      let decision: ThreadsAiDecision;
      try {
        decision = await aiDecision(env, commentText, clean(post?.text, 900), username);
      } catch (error) {
        reviewRequired += 1;
        decision = { action: "review", reply: "", intent: "", reason: error instanceof Error ? error.message.slice(0, 280) : "AI generation failed." };
        await saveState(env, { replyId, parentPostId: postId, username, commentText, decision, status: "review_required" });
        continue;
      }

      if (decision.action === "skip") {
        skipped += 1;
        await saveState(env, { replyId, parentPostId: postId, username, commentText, decision, status: "skipped" });
        continue;
      }
      if (decision.action === "review") {
        reviewRequired += 1;
        await saveState(env, { replyId, parentPostId: postId, username, commentText, decision, status: "review_required" });
        continue;
      }

      if (mode !== "live") {
        await saveState(env, { replyId, parentPostId: postId, username, commentText, decision, status: "candidate" });
        continue;
      }

      try {
        const providerReplyId = await publishReply(env, replyId, decision.reply);
        repliesPublished += 1;
        await saveState(env, { replyId, parentPostId: postId, username, commentText, decision, status: "published", providerReplyId });
      } catch (error) {
        reviewRequired += 1;
        await saveState(env, {
          replyId, parentPostId: postId, username, commentText,
          decision: { ...decision, action: "review", reason: error instanceof Error ? error.message.slice(0, 280) : "Threads publish failed." },
          status: "review_required",
        });
      }
    }
  }

  await env.DB.prepare(`
    INSERT INTO threads_growth_runs
      (id, mode, posts_scanned, replies_scanned, replies_published, review_required, skipped, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    runId, mode, postsScanned, repliesScanned, repliesPublished, reviewRequired, skipped, new Date().toISOString()
  ).run();

  return json(200, {
    success: true,
    run_id: runId,
    mode,
    posts_scanned: postsScanned,
    replies_scanned: repliesScanned,
    replies_published: repliesPublished,
    review_required: reviewRequired,
    skipped,
  });
}
