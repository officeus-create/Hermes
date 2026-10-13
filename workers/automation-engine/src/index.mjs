import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorThreadsConfig,
  WINDSOR_THREADS_DEFAULT_ACCOUNT_ID,
} from "./windsor-threads.mjs";

const ACCOUNT_KEY = "hermes_logistics";
const PLATFORM = "threads";
const CHICAGO_TZ = "America/Chicago";
const ALLOWED_HOURS = new Set([0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);

const CARRIER_THEMES = Object.freeze([
  {
    id: "load-board",
    destination: "/load-board/#carrier-access",
    hooks: [
      "Car haulers: what is the hardest part of finding your next compatible vehicle?",
      "Empty trailer space is expensive. Are you checking the next load before the current one delivers?",
      "A better car-hauling day often starts with better load visibility.",
      "Car haulers: how early do you start looking for the next vehicle?",
    ],
    points: [
      "Use the Load Board as another discovery surface, then verify equipment fit, route, timing, authority and insurance before committing.",
      "A load is only useful when the vehicle, route and timing actually fit your operation.",
      "More listings are not the goal. Better-fit freight with less wasted movement is.",
      "Treat every listing as a starting point for qualification, not a promise of freight.",
    ],
    questions: [
      "What matters most to you: route, rate, vehicle type or pickup timing?",
      "What information do you want to see first before you call on a vehicle?",
      "Which lane is hardest for you to keep loaded right now?",
      "What would make a load board more useful for your operation?",
    ],
  },
  {
    id: "deadhead",
    destination: "/logistics/car-hauling-dispatch/",
    hooks: [
      "Car haulers: deadhead can erase a good-looking rate fast.",
      "A strong load can still be a weak move after empty miles.",
      "Before chasing the highest rate, count the miles you are not getting paid for.",
      "The rate on the screen is only part of the car-hauling decision.",
    ],
    points: [
      "Compare paid miles, empty miles, pickup timing and the next likely reload before you decide.",
      "Deadhead belongs in the decision before booking, not after delivery.",
      "A slightly lower rate can be the better move when it protects the next reload and reduces empty travel.",
      "Route quality is about the whole sequence of moves, not one isolated load.",
    ],
    questions: [
      "How many empty miles are you willing to accept for the right load?",
      "Do you calculate deadhead before every booking?",
      "What is your biggest deadhead problem: pickup, delivery or reload?",
      "Would you take a lower rate for a cleaner reload position?",
    ],
  },
  {
    id: "rpm",
    destination: "/logistics/car-hauling-dispatch/",
    hooks: [
      "Car haulers: RPM is useful only when you calculate the real miles.",
      "A rate per mile can look great until deadhead enters the math.",
      "Do you compare gross RPM or true operating RPM?",
      "One number can change a car-hauling decision: paid miles versus total miles.",
    ],
    points: [
      "Use total route miles, not only loaded miles, when comparing two moves.",
      "RPM is one filter. Timing, equipment fit, reload position and operating cost still matter.",
      "The best-looking RPM is not automatically the best business decision.",
      "Use the same calculation method every time so two loads are actually comparable.",
    ],
    questions: [
      "What RPM calculation do you use before booking?",
      "Do you include deadhead in your RPM every time?",
      "What other number do you check next to RPM?",
      "Would a simple RPM + deadhead calculator help your dispatch process?",
    ],
  },
  {
    id: "broker-setup",
    destination: "/logistics/car-hauling-dispatch/",
    hooks: [
      "Car haulers: a good load can disappear while setup paperwork is still incomplete.",
      "Fast broker setup is part of dispatch, not an afterthought.",
      "How much time does your team lose repeating carrier setup information?",
      "A clean carrier packet can save time when the right vehicle appears.",
    ],
    points: [
      "Keep authority, insurance, W-9 and carrier details organized so setup does not become the bottleneck.",
      "The goal is not to rush verification. It is to have accurate documents ready when they are needed.",
      "Consistent paperwork reduces repeated calls and preventable delays.",
      "Organize the recurring documents once, then verify freshness before each setup.",
    ],
    questions: [
      "Which setup document causes the most delays for you?",
      "Do you keep one current carrier packet ready to send?",
      "How often do broker setups slow down your booking process?",
      "What part of setup would you automate first?",
    ],
  },
  {
    id: "paperwork",
    destination: "/logistics/car-hauling-dispatch/",
    hooks: [
      "Car haulers: the job is not finished when the vehicle is delivered.",
      "Missing paperwork can turn a completed move into a payment delay.",
      "Delivery is operationally complete only when the documents are complete too.",
      "Good dispatch includes the paperwork after the wheels stop moving.",
    ],
    points: [
      "Keep BOL, condition evidence, delivery confirmation and invoice follow-up tied to the same load record.",
      "A repeatable document checklist helps prevent completed loads from getting stuck in billing.",
      "The faster the paperwork is complete and accurate, the easier the billing handoff becomes.",
      "One load record should carry the operational trail from booking through delivery and invoicing.",
    ],
    questions: [
      "What paperwork step causes the most payment delays for your company?",
      "Do drivers and dispatch use one document checklist?",
      "How quickly after delivery does your invoice process start?",
      "Which document do you chase most often after delivery?",
    ],
  },
  {
    id: "route-planning",
    destination: "/logistics/car-hauling-dispatch/",
    hooks: [
      "Car haulers: one good load does not make a good route.",
      "The best dispatch decisions connect today’s delivery to tomorrow’s pickup.",
      "Route planning gets easier when you think one move ahead.",
      "A profitable-looking load can leave the truck in the wrong place next.",
    ],
    points: [
      "Look at delivery market, reload probability, timing and deadhead before choosing between similar loads.",
      "A route is a sequence. Optimize the next position, not only the current payment.",
      "The destination matters because it determines what the truck can realistically do next.",
      "Better planning means fewer isolated decisions and more connected moves.",
    ],
    questions: [
      "Which market is hardest for you to reload out of?",
      "How far ahead do you plan your next pickup?",
      "Do you choose loads differently when the delivery market is weak?",
      "What makes a destination attractive to your operation?",
    ],
  },
]);

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function clean(value, max = 1000) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function timingSafeEqualText(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    mismatch |= (a[index] || 0) ^ (b[index] || 0);
  }
  return mismatch === 0;
}

function chicagoParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return { year: value("year"), month: value("month"), day: value("day"), hour: Number(value("hour")) };
}

export function isEligibleChicagoSlot(date = new Date()) {
  return ALLOWED_HOURS.has(chicagoParts(date).hour);
}

export function chicagoSlotKey(date = new Date()) {
  const parts = chicagoParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${String(parts.hour).padStart(2, "0")}`;
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pick(list, seed, salt) {
  return list[fnv1a(`${seed}:${salt}`) % list.length];
}

export function buildTrackedUrl(destination, contentId) {
  const url = new URL(destination, "https://hermeslogisticsus.com");
  url.searchParams.set("utm_source", "threads");
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", "car_hauler_carrier_growth");
  url.searchParams.set("utm_content", contentId.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 80));
  return url.toString();
}

export function buildCarrierThreadsPost(slotKey) {
  const theme = CARRIER_THEMES[fnv1a(slotKey) % CARRIER_THEMES.length];
  const contentId = `hae-${theme.id}-${slotKey}`;
  const url = buildTrackedUrl(theme.destination, contentId);
  const hook = pick(theme.hooks, slotKey, "hook");
  const point = pick(theme.points, slotKey, "point");
  const question = pick(theme.questions, slotKey, "question");
  const body = `${hook}\n\n${point}\n\n${question}\n${url}`;
  if (body.length > 500) throw new Error("threads_post_too_long");
  return {
    content_id: `${ACCOUNT_KEY}:${PLATFORM}:${slotKey}`,
    account_key: ACCOUNT_KEY,
    platform: PLATFORM,
    slot_key: slotKey,
    template_id: theme.id,
    destination_url: url,
    body,
    idempotency_key: `hae:${ACCOUNT_KEY}:${PLATFORM}:${slotKey}`,
  };
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_runs (
      id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      slot_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_content (
      content_id TEXT PRIMARY KEY,
      account_key TEXT NOT NULL,
      platform TEXT NOT NULL,
      slot_key TEXT NOT NULL UNIQUE,
      template_id TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      body TEXT NOT NULL,
      state TEXT NOT NULL,
      provider_post_id TEXT,
      permalink TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_publications (
      idempotency_key TEXT PRIMARY KEY,
      content_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      provider_post_id TEXT,
      permalink TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_content_state ON hermes_automation_content(state, updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_publication_status ON hermes_automation_publications(status, updated_at)").run();
}

async function reserveRun(db, slotKey, triggerType) {
  const now = new Date().toISOString();
  const result = await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_runs
      (id, trigger_type, slot_key, status, created_at, updated_at)
    VALUES (?, ?, ?, 'queued', ?, ?)
  `).bind(`run:${slotKey}`, triggerType, slotKey, now, now).run();
  return Number(result?.meta?.changes || 0) === 1;
}

async function insertCandidate(db, candidate) {
  const now = new Date().toISOString();
  const result = await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_content
      (content_id, account_key, platform, slot_key, template_id, destination_url, body, state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)
  `).bind(
    candidate.content_id,
    candidate.account_key,
    candidate.platform,
    candidate.slot_key,
    candidate.template_id,
    candidate.destination_url,
    candidate.body,
    now,
    now,
  ).run();
  return Number(result?.meta?.changes || 0) === 1;
}

async function reservePublication(db, candidate) {
  const now = new Date().toISOString();
  const result = await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_publications
      (idempotency_key, content_id, status, attempt_count, created_at, updated_at)
    VALUES (?, ?, 'reserved', 0, ?, ?)
  `).bind(candidate.idempotency_key, candidate.content_id, now, now).run();
  return Number(result?.meta?.changes || 0) === 1;
}

function publicationEnabled(env) {
  return String(env.HERMES_AUTOMATION_MODE || "dry_run") === "live"
    && String(env.HERMES_AUTOMATION_PUBLISH || "disabled") === "enabled";
}

async function processPlanMessage(env, message) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const slotKey = clean(message?.slot_key, 32);
  if (!/^\\d{4}-\\d{2}-\\d{2}T\\d{2}$/.test(slotKey)) throw new Error("slot_key_invalid");
  const candidate = buildCarrierThreadsPost(slotKey);
  await insertCandidate(env.DB, candidate);

  if (!publicationEnabled(env)) {
    await env.DB.prepare("UPDATE hermes_automation_runs SET status='dry_run_ready',updated_at=? WHERE slot_key=?")
      .bind(new Date().toISOString(), slotKey).run();
    return { status: "dry_run_ready", candidate };
  }

  const reserved = await reservePublication(env.DB, candidate);
  if (!reserved) {
    await env.DB.prepare("UPDATE hermes_automation_runs SET status='duplicate_suppressed',updated_at=? WHERE slot_key=?")
      .bind(new Date().toISOString(), slotKey).run();
    return { status: "duplicate_suppressed", candidate };
  }

  const startedAt = new Date().toISOString();
  await env.DB.prepare("UPDATE hermes_automation_publications SET status='publishing',attempt_count=1,updated_at=? WHERE idempotency_key=?")
    .bind(startedAt, candidate.idempotency_key).run();

  const published = await publishThreadsTextViaWindsor(env, candidate.body);
  const now = new Date().toISOString();
  if (!published.ok) {
    const status = published.error_class === "provider_outcome_unknown" ? "unknown_outcome" : "failed";
    await env.DB.prepare("UPDATE hermes_automation_publications SET status=?,last_error_class=?,updated_at=? WHERE idempotency_key=?")
      .bind(status, published.error_class, now, candidate.idempotency_key).run();
    await env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
      .bind(status, published.error_class, now, candidate.content_id).run();
    await env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE slot_key=?")
      .bind(status, published.error_class, now, slotKey).run();
    return { status, candidate, error_class: published.error_class };
  }

  await env.DB.prepare("UPDATE hermes_automation_publications SET status='provider_accepted_readback_pending',updated_at=? WHERE idempotency_key=?")
    .bind(now, candidate.idempotency_key).run();
  await env.DB.prepare("UPDATE hermes_automation_content SET state='provider_accepted_readback_pending',updated_at=? WHERE content_id=?")
    .bind(now, candidate.content_id).run();
  await env.DB.prepare("UPDATE hermes_automation_runs SET status='provider_accepted_readback_pending',updated_at=? WHERE slot_key=?")
    .bind(now, slotKey).run();

  await env.AUTOMATION_QUEUE.send({
    type: "publication.readback",
    content_id: candidate.content_id,
    slot_key: slotKey,
    readback_attempt: 1,
  }, { delaySeconds: 4200 });

  return { status: "provider_accepted_readback_pending", candidate, provider_result: published.provider_result || null };
}

async function processReadbackMessage(env, message) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const contentId = clean(message?.content_id, 240);
  const attempt = Math.max(1, Math.min(4, Number(message?.readback_attempt || 1) || 1));
  if (!contentId) throw new Error("content_id_invalid");

  const row = await env.DB.prepare("SELECT content_id,account_key,platform,slot_key,template_id,destination_url,body,state FROM hermes_automation_content WHERE content_id=? LIMIT 1")
    .bind(contentId).first();
  if (!row) return { status: "readback_missing_content" };
  if (String(row.state) === "published_verified") return { status: "published_verified", duplicate: true };

  const readback = await readbackThreadsTextViaWindsor(env, String(row.body || ""));
  const now = new Date().toISOString();
  if (readback.ok && readback.found) {
    await env.DB.prepare("UPDATE hermes_automation_publications SET status='published_verified',provider_post_id=?,permalink=?,last_error_class=NULL,updated_at=? WHERE content_id=?")
      .bind(readback.provider_post_id, readback.permalink || null, now, contentId).run();
    await env.DB.prepare("UPDATE hermes_automation_content SET state='published_verified',provider_post_id=?,permalink=?,last_error_class=NULL,updated_at=? WHERE content_id=?")
      .bind(readback.provider_post_id, readback.permalink || null, now, contentId).run();
    await env.DB.prepare("UPDATE hermes_automation_runs SET status='published_verified',last_error_class=NULL,updated_at=? WHERE slot_key=?")
      .bind(now, String(row.slot_key || "")).run();
    return { status: "published_verified", provider_post_id: readback.provider_post_id, permalink: readback.permalink || null };
  }

  if (attempt < 4) {
    await env.AUTOMATION_QUEUE.send({
      type: "publication.readback",
      content_id: contentId,
      slot_key: String(row.slot_key || ""),
      readback_attempt: attempt + 1,
    }, { delaySeconds: 3600 });
    return { status: "provider_accepted_readback_pending", readback_attempt: attempt, error_class: readback.ok ? "post_not_visible_yet" : readback.error_class };
  }

  const errorClass = readback.ok ? "provider_readback_not_found" : readback.error_class;
  await env.DB.prepare("UPDATE hermes_automation_publications SET status='readback_unverified',last_error_class=?,updated_at=? WHERE content_id=?")
    .bind(errorClass, now, contentId).run();
  await env.DB.prepare("UPDATE hermes_automation_content SET state='readback_unverified',last_error_class=?,updated_at=? WHERE content_id=?")
    .bind(errorClass, now, contentId).run();
  await env.DB.prepare("UPDATE hermes_automation_runs SET status='readback_unverified',last_error_class=?,updated_at=? WHERE slot_key=?")
    .bind(errorClass, now, String(row.slot_key || "")).run();
  return { status: "readback_unverified", error_class: errorClass };
}
async function health(db) {
  if (!db) return { database: "missing" };
  await ensureSchema(db);
  const ready = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_content WHERE state='ready'").first();
  const unknown = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE status='unknown_outcome'").first();
  const failed = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE status='failed'").first();
  const pendingReadback = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE status='provider_accepted_readback_pending'").first();
  const unverifiedReadback = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE status='readback_unverified'").first();
  const last = await db.prepare(`
    SELECT slot_key,status,updated_at,last_error_class
    FROM hermes_automation_runs
    ORDER BY updated_at DESC
    LIMIT 1
  `).first();
  return {
    database: "ok",
    ready_content: Number(ready?.count || 0),
    unknown_outcomes: Number(unknown?.count || 0),
    failed_publications: Number(failed?.count || 0),
    pending_readbacks: Number(pendingReadback?.count || 0),
    unverified_readbacks: Number(unverifiedReadback?.count || 0),
    last_run: last || null,
  };
}

export default {
  async scheduled(_controller, env, ctx) {
    if (!env.DB || !env.AUTOMATION_QUEUE) return;
    const now = new Date();
    if (!isEligibleChicagoSlot(now)) return;
    const slotKey = chicagoSlotKey(now);
    await ensureSchema(env.DB);
    const inserted = await reserveRun(env.DB, slotKey, "cron");
    if (!inserted) return;
    ctx.waitUntil(env.AUTOMATION_QUEUE.send({
      type: "content.plan",
      account_key: ACCOUNT_KEY,
      platform: PLATFORM,
      slot_key: slotKey,
    }));
  },

  async queue(batch, env) {
    for (const item of batch.messages) {
      const payload = item.body || {};
      try {
        if (payload.type === "content.plan") {
          await processPlanMessage(env, payload);
          item.ack();
          continue;
        }
        if (payload.type === "publication.readback") {
          await processReadbackMessage(env, payload);
          item.ack();
          continue;
        }
        item.ack();
      } catch {
        item.retry();
      }
    }
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/v1/capabilities") {
      return json(200, {
        success: true,
        engine: "hermes-automation-engine",
        version: "v1",
        account_key: ACCOUNT_KEY,
        pilot_platform: PLATFORM,
        normal_loop_requires_chatgpt_task: false,
        generation_mode: "deterministic_templates",
        provider_transport: "windsor_connectors_api",
        provider_account: clean(env.WINDSOR_THREADS_ACCOUNT_ID || WINDSOR_THREADS_DEFAULT_ACCOUNT_ID, 160),
        provider_configured: Boolean(windsorThreadsConfig(env)),
        publication_enabled: publicationEnabled(env),
      });
    }
    if (request.method === "GET" && url.pathname === "/v1/health") {
      return json(200, { success: true, ...(await health(env.DB)) });
    }
    if (request.method === "POST" && url.pathname === "/v1/tick") {
      const expected = clean(env.HERMES_AUTOMATION_TOKEN, 4096);
      const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      if (!expected || !supplied || !timingSafeEqualText(supplied, expected)) {
        return json(401, { success: false, error: "unauthorized" });
      }
      if (!env.DB || !env.AUTOMATION_QUEUE) return json(503, { success: false, error: "runtime_not_configured" });
      const body = await request.json().catch(() => ({}));
      const slotKey = clean(body?.slot_key, 32) || chicagoSlotKey(new Date());
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(slotKey)) return json(400, { success: false, error: "slot_key_invalid" });
      await ensureSchema(env.DB);
      const inserted = await reserveRun(env.DB, slotKey, "manual");
      if (!inserted) return json(200, { success: true, duplicate: true, slot_key: slotKey });
      await env.AUTOMATION_QUEUE.send({ type: "content.plan", account_key: ACCOUNT_KEY, platform: PLATFORM, slot_key: slotKey });
      return json(202, { success: true, queued: true, slot_key: slotKey });
    }
    return json(404, { success: false, error: "not_found" });
  },
};

export { ACCOUNT_KEY, PLATFORM, CARRIER_THEMES, publicationEnabled };
