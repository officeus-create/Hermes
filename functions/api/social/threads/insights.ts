import { normalizeThreadsText } from "../../../../src/lib/threads-growth-engine.ts";

type Env = {
  DB?: any;
  THREADS_AUTOMATION_TOKEN?: string;
  THREADS_ACCESS_TOKEN?: string;
  THREADS_GRAPH_BASE?: string;
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const clean = (value: unknown, max = 1000) => normalizeThreadsText(value, max);

async function ensureSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS threads_growth_insights (
      content_id TEXT PRIMARY KEY,
      provider_post_id TEXT NOT NULL,
      theme_id TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      replies INTEGER NOT NULL DEFAULT 0,
      reposts INTEGER NOT NULL DEFAULT 0,
      quotes INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      measured_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_threads_growth_insights_theme ON threads_growth_insights(theme_id, measured_at)").run();
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

function metricMap(payload: any) {
  const result: Record<string, number> = {
    views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0, shares: 0,
  };
  for (const item of payload?.data ?? []) {
    const name = clean(item?.name, 40);
    if (!(name in result)) continue;
    const firstValue = Array.isArray(item?.values) ? item.values[0]?.value : undefined;
    const totalValue = item?.total_value?.value;
    const value = Number(firstValue ?? totalValue ?? 0);
    result[name] = Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
  }
  return result;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return json(503, { success: false, error: "database_not_configured" });
  const token = request.headers.get("Authorization") || "";
  if (!env.THREADS_AUTOMATION_TOKEN || token !== `Bearer ${env.THREADS_AUTOMATION_TOKEN}`) {
    return json(401, { success: false, error: "unauthorized" });
  }
  if (!env.THREADS_ACCESS_TOKEN) {
    return json(503, { success: false, error: "threads_insights_not_configured" });
  }

  await ensureSchema(env.DB);
  const rows = await env.DB.prepare(`
    SELECT id, theme_id, provider_post_id
    FROM threads_growth_content
    WHERE status = 'published' AND provider_post_id IS NOT NULL AND TRIM(provider_post_id) <> ''
    ORDER BY created_at DESC
    LIMIT 30
  `).all();

  let measured = 0;
  let failed = 0;
  for (const row of rows?.results ?? []) {
    const postId = clean(row.provider_post_id, 160);
    if (!postId) continue;
    try {
      const payload = await graphGet(
        env,
        `${postId}/insights?metric=views,likes,replies,reposts,quotes,shares`,
      );
      const metrics = metricMap(payload);
      const measuredAt = new Date().toISOString();
      await env.DB.prepare(`
        INSERT INTO threads_growth_insights
          (content_id, provider_post_id, theme_id, views, likes, replies, reposts, quotes, shares, measured_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(content_id) DO UPDATE SET
          views = excluded.views,
          likes = excluded.likes,
          replies = excluded.replies,
          reposts = excluded.reposts,
          quotes = excluded.quotes,
          shares = excluded.shares,
          measured_at = excluded.measured_at
      `).bind(
        clean(row.id, 180),
        postId,
        clean(row.theme_id, 100),
        metrics.views,
        metrics.likes,
        metrics.replies,
        metrics.reposts,
        metrics.quotes,
        metrics.shares,
        measuredAt,
      ).run();
      measured += 1;
    } catch {
      failed += 1;
    }
  }

  const leaderboard = await env.DB.prepare(`
    SELECT
      theme_id,
      COUNT(*) AS samples,
      ROUND(AVG(views), 2) AS avg_views,
      ROUND(AVG(replies), 2) AS avg_replies,
      ROUND(AVG(likes), 2) AS avg_likes
    FROM threads_growth_insights
    GROUP BY theme_id
    ORDER BY (AVG(views) + AVG(replies) * 25 + AVG(likes) * 5) DESC, theme_id ASC
  `).all();

  return json(200, {
    success: true,
    measured,
    failed,
    leaderboard: leaderboard?.results ?? [],
  });
}
