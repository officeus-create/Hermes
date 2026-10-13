import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorThreadsConfig,
} from "./windsor-threads.mjs";
import {
  HISTORICAL_READ_ONLY_JOB_TYPES,
  runHistoricalLearningPrimitive,
} from "./historical-learning.mjs";

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

function authorized(request, env) {
  const expected = clean(env.HERMES_AUTOMATION_TOKEN, 4096);
  const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return Boolean(expected && supplied && timingSafeEqualText(supplied, expected));
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

export function buildCarrierThreadsPost(slotKey, variantIndex = 0) {
  const variant = Math.max(0, Math.min(63, Number(variantIndex) || 0));
  const theme = CARRIER_THEMES[fnv1a(slotKey) % CARRIER_THEMES.length];
  const seed = `${slotKey}:v${variant}`;
  const contentId = `hae-${theme.id}-${slotKey}`;
  const url = buildTrackedUrl(theme.destination, contentId);
  // Derive all three dimensions from different bit ranges of one ordinal.
  // Independent FNV hashes modulo 4 share low-bit structure and collapse the
  // theoretical 64 combinations to only a few recurring triples.
  const variantOrdinal = fnv1a(seed);
  const hookIndex = variantOrdinal % theme.hooks.length;
  const pointIndex = Math.floor(variantOrdinal / theme.hooks.length) % theme.points.length;
  const questionIndex = Math.floor(
    variantOrdinal / (theme.hooks.length * theme.points.length)
  ) % theme.questions.length;
  const hook = theme.hooks[hookIndex];
  const point = theme.points[pointIndex];
  const question = theme.questions[questionIndex];
  const variantKey = `${theme.id}:${hookIndex}:${pointIndex}:${questionIndex}`;
  const body = `${hook}\n\n${point}\n\n${question}\n${url}`;
  const bytes = new TextEncoder().encode(body).byteLength;
  if (bytes > 500) throw new Error("threads_post_too_long");
  return {
    content_id: `${ACCOUNT_KEY}:${PLATFORM}:${slotKey}`,
    account_key: ACCOUNT_KEY,
    platform: PLATFORM,
    slot_key: slotKey,
    template_id: theme.id,
    variant_key: variantKey,
    destination_url: url,
    body,
    bytes,
    idempotency_key: `hae:${ACCOUNT_KEY}:${PLATFORM}:${slotKey}`,
  };
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_runs (
      id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      account_key TEXT NOT NULL,
      platform TEXT NOT NULL,
      slot_key TEXT NOT NULL,
      status TEXT NOT NULL,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(account_key, platform, slot_key)
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_content (
      content_id TEXT PRIMARY KEY,
      account_key TEXT NOT NULL,
      platform TEXT NOT NULL,
      slot_key TEXT NOT NULL,
      template_id TEXT NOT NULL,
      variant_key TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      body TEXT NOT NULL,
      state TEXT NOT NULL,
      provider_post_id TEXT,
      permalink TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(account_key, platform, slot_key)
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_publications (
      idempotency_key TEXT PRIMARY KEY,
      content_id TEXT NOT NULL UNIQUE,
      account_key TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      readback_attempt INTEGER NOT NULL DEFAULT 0,
      next_readback_at TEXT,
      provider_post_id TEXT,
      permalink TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_content_state ON hermes_automation_content(state, updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_publication_status ON hermes_automation_publications(status, updated_at)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_jobs (
      job_id TEXT PRIMARY KEY,
      job_type TEXT NOT NULL,
      business_lane TEXT NOT NULL,
      account_key TEXT,
      project_key TEXT,
      priority INTEGER NOT NULL DEFAULT 50,
      state TEXT NOT NULL,
      current_step TEXT,
      available_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      idempotency_key TEXT NOT NULL UNIQUE,
      policy_version TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      result_json TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_jobs_state_available ON hermes_automation_jobs(state, available_at, priority DESC)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_job_events (
      event_id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      from_state TEXT,
      to_state TEXT NOT NULL,
      step TEXT,
      evidence_ref TEXT,
      provider_ref TEXT,
      error_class TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(job_id) REFERENCES hermes_automation_jobs(job_id)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_job_events_job_created ON hermes_automation_job_events(job_id, created_at)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_runtime_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      queue_name TEXT,
      queue_message_id TEXT,
      message_sent_at TEXT,
      message_type TEXT,
      job_id TEXT,
      content_id TEXT,
      slot_key TEXT,
      attempt_count INTEGER,
      error_class TEXT,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_runtime_events_created ON hermes_automation_runtime_events(created_at)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_heartbeats (
      heartbeat_id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      cron_expression TEXT,
      scheduled_at TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      execution_lag_ms INTEGER NOT NULL,
      chicago_slot_key TEXT NOT NULL,
      eligible INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_heartbeats_scheduled ON hermes_automation_heartbeats(scheduled_at)").run();
}

function runtimeEventId(eventType) {
  return `runtime:${eventType}:${crypto.randomUUID()}`;
}

function metricNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeRuntimeErrorClass(error, fallback) {
  const raw = clean(error?.message, 80);
  return /^[a-z][a-z0-9_]{2,79}$/.test(raw) ? raw : fallback;
}

async function recordRuntimeEvent(env, {
  eventType,
  queueName = null,
  queueMessageId = null,
  messageSentAt = null,
  messageType = null,
  jobId = null,
  contentId = null,
  slotKey = null,
  attemptCount = null,
  errorClass = null,
  createdAt = new Date().toISOString(),
}) {
  if (!env?.DB) return false;
  const normalizedAttempt = metricNumberOrNull(attemptCount);
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare(`
      INSERT INTO hermes_automation_runtime_events
        (event_id,event_type,queue_name,queue_message_id,message_sent_at,message_type,job_id,content_id,slot_key,attempt_count,error_class,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      runtimeEventId(clean(eventType, 80) || "runtime.event"),
      clean(eventType, 80) || "runtime.event",
      clean(queueName, 120) || null,
      clean(queueMessageId, 160) || null,
      Number.isFinite(Date.parse(String(messageSentAt || ""))) ? new Date(messageSentAt).toISOString() : null,
      clean(messageType, 80) || null,
      clean(jobId, 160) || null,
      clean(contentId, 200) || null,
      clean(slotKey, 32) || null,
      normalizedAttempt === null ? null : Math.max(0, Math.trunc(normalizedAttempt)),
      clean(errorClass, 160) || null,
      createdAt,
    ).run();
    return true;
  } catch {
    return false;
  }
}

async function recordCronHeartbeat(db, scheduledAt, observedAt, eligible, cronExpression = null) {
  const scheduledIso = scheduledAt.toISOString();
  const observedIso = observedAt.toISOString();
  const slotKey = chicagoSlotKey(scheduledAt);
  const lagMs = Math.max(0, observedAt.getTime() - scheduledAt.getTime());
  await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_heartbeats
      (heartbeat_id,trigger_type,cron_expression,scheduled_at,observed_at,execution_lag_ms,chicago_slot_key,eligible,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).bind(
    `heartbeat:cron:${scheduledIso.slice(0, 13)}Z`,
    "cron",
    clean(cronExpression, 80) || null,
    scheduledIso,
    observedIso,
    lagMs,
    slotKey,
    eligible ? 1 : 0,
    observedIso,
  ).run();
}

function runIdForSlot(slotKey) {
  return `run:${ACCOUNT_KEY}:${PLATFORM}:${slotKey}`;
}

const READ_ONLY_GENERIC_JOB_TYPES = new Set([
  "system.health.snapshot",
  "history.coverage.audit",
  ...HISTORICAL_READ_ONLY_JOB_TYPES,
]);

function genericJobEventId(jobId, eventType) {
  return `evt:${jobId}:${eventType}:${crypto.randomUUID()}`;
}

function genericJobEventStatement(db, {
  jobId,
  eventType,
  fromState = null,
  toState,
  step = null,
  evidenceRef = null,
  providerRef = null,
  errorClass = null,
  createdAt = new Date().toISOString(),
}) {
  return db.prepare(`
    INSERT INTO hermes_automation_job_events
      (event_id, job_id, event_type, from_state, to_state, step, evidence_ref, provider_ref, error_class, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    genericJobEventId(jobId, eventType),
    jobId,
    eventType,
    fromState,
    toState,
    step,
    evidenceRef,
    providerRef,
    errorClass,
    createdAt,
  );
}

function conditionalGenericJobEventStatement(db, {
  jobId,
  eventType,
  fromState = null,
  toState,
  step = null,
  errorClass = null,
  createdAt,
  expectedAttemptCount = null,
}) {
  const attemptPredicate = expectedAttemptCount == null ? "" : " AND attempt_count=?";
  const statement = db.prepare(`
    INSERT INTO hermes_automation_job_events
      (event_id, job_id, event_type, from_state, to_state, step, evidence_ref, provider_ref, error_class, created_at)
    SELECT ?, job_id, ?, ?, ?, ?, NULL, NULL, ?, ?
    FROM hermes_automation_jobs
    WHERE job_id=? AND state=? AND updated_at=?${attemptPredicate}
  `);
  const bindings = [
    genericJobEventId(jobId, eventType),
    eventType,
    fromState,
    toState,
    step,
    errorClass,
    createdAt,
    jobId,
    toState,
    createdAt,
  ];
  if (expectedAttemptCount != null) bindings.push(expectedAttemptCount);
  return statement.bind(...bindings);
}

async function transitionGenericJobWithEvent(db, {
  updateStatement,
  jobId,
  eventType,
  fromState,
  toState,
  step,
  errorClass = null,
  createdAt,
  expectedAttemptCount = null,
}) {
  const [transition] = await db.batch([
    updateStatement,
    conditionalGenericJobEventStatement(db, {
      jobId,
      eventType,
      fromState,
      toState,
      step,
      errorClass,
      createdAt,
      expectedAttemptCount,
    }),
  ]);
  return Number(transition?.meta?.changes || 0) === 1;
}

async function appendGenericJobEvent(db, event) {
  await genericJobEventStatement(db, event).run();
}

function genericJobReplayMatches(existing, desired) {
  return String(existing?.job_type || "") === desired.jobType
    && String(existing?.business_lane || "") === desired.businessLane
    && String(existing?.account_key || "") === String(desired.accountKey || "")
    && String(existing?.project_key || "") === String(desired.projectKey || "")
    && Number(existing?.priority) === desired.priority
    && Number(existing?.max_attempts) === desired.maxAttempts
    && String(existing?.policy_version || "") === desired.policyVersion
    && String(existing?.payload_json || "{}") === desired.payloadJson;
}

function genericJobBackoffSeconds(attempt) {
  return Math.min(3600, Math.max(300, Number(attempt || 1) * 300));
}

async function enqueueGenericJobMessage(env, jobId, delaySeconds = 0) {
  if (!env.AUTOMATION_QUEUE) throw new Error("automation_queue_not_configured");
  if (delaySeconds > 0) {
    await env.AUTOMATION_QUEUE.send({ type: "job.execute", job_id: jobId }, { delaySeconds });
    return;
  }
  await env.AUTOMATION_QUEUE.send({ type: "job.execute", job_id: jobId });
}

async function createGenericJob(env, input) {
  if (!env.DB || !env.AUTOMATION_QUEUE) throw new Error("runtime_not_configured");
  await ensureSchema(env.DB);
  const jobType = clean(input?.job_type, 120);
  const businessLane = clean(input?.business_lane, 120);
  const idempotencyKey = clean(input?.idempotency_key, 240);
  const accountKey = clean(input?.account_key, 120) || null;
  const projectKey = clean(input?.project_key, 120) || null;
  const policyVersion = clean(input?.policy_version, 120) || "hae-readonly-v1";
  const rawPriority = Number(input?.priority ?? 50);
  const rawMaxAttempts = Number(input?.max_attempts ?? 3);
  const priority = Number.isFinite(rawPriority) ? Math.max(0, Math.min(100, Math.trunc(rawPriority))) : 50;
  const maxAttempts = Number.isFinite(rawMaxAttempts) ? Math.max(1, Math.min(5, Math.trunc(rawMaxAttempts))) : 3;
  if (!READ_ONLY_GENERIC_JOB_TYPES.has(jobType)) throw new Error("job_type_not_allowed");
  if (!businessLane) throw new Error("business_lane_required");
  if (!idempotencyKey) throw new Error("idempotency_key_required");
  const payload = input?.payload ?? {};
  if (HISTORICAL_READ_ONLY_JOB_TYPES.includes(jobType)) {
    runHistoricalLearningPrimitive(jobType, payload);
  }
  let payloadJson = "{}";
  try {
    payloadJson = JSON.stringify(payload);
  } catch {
    throw new Error("payload_not_serializable");
  }
  if (new TextEncoder().encode(payloadJson).byteLength > 32768) throw new Error("payload_too_large");

  const replayShape = { jobType, businessLane, accountKey, projectKey, priority, maxAttempts, policyVersion, payloadJson };
  const existing = await env.DB.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 1"
  ).bind(idempotencyKey).first();
  if (existing) {
    if (!genericJobReplayMatches(existing, replayShape)) throw new Error("idempotency_key_conflict");
    return { created: false, duplicate: true, job: existing };
  }

  const now = new Date().toISOString();
  const jobId = `job:${crypto.randomUUID()}`;
  const insertStatement = env.DB.prepare(`
    INSERT INTO hermes_automation_jobs
      (job_id, job_type, business_lane, account_key, project_key, priority, state, current_step, available_at,
       attempt_count, max_attempts, idempotency_key, policy_version, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'QUEUED', 'dispatch', ?, 0, ?, ?, ?, ?, ?, ?)
  `).bind(
    jobId,
    jobType,
    businessLane,
    accountKey,
    projectKey,
    priority,
    now,
    maxAttempts,
    idempotencyKey,
    policyVersion,
    payloadJson,
    now,
    now,
  );
  try {
    await env.DB.batch([
      insertStatement,
      genericJobEventStatement(env.DB, {
        jobId,
        eventType: "job.created",
        fromState: null,
        toState: "QUEUED",
        step: "dispatch",
        createdAt: now,
      }),
    ]);
  } catch (error) {
    const raced = await env.DB.prepare(
      "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 1"
    ).bind(idempotencyKey).first();
    if (!raced) throw error;
    if (!genericJobReplayMatches(raced, replayShape)) throw new Error("idempotency_key_conflict");
    return { created: false, duplicate: true, job: raced };
  }

  try {
    await enqueueGenericJobMessage(env, jobId);
    await env.DB.prepare(
      "UPDATE hermes_automation_jobs SET available_at=?,last_error_class=NULL,updated_at=? WHERE job_id=? AND state='QUEUED'"
    ).bind(addSecondsIso(now, 15 * 60), now, jobId).run();
  } catch {
    const retryAt = addSecondsIso(now, 5 * 60);
    await transitionGenericJobWithEvent(env.DB, {
      updateStatement: env.DB.prepare(
        "UPDATE hermes_automation_jobs SET state='RETRY_SCHEDULED',available_at=?,last_error_class='job_enqueue_failed',updated_at=? WHERE job_id=? AND state='QUEUED'"
      ).bind(retryAt, now, jobId),
      jobId,
      eventType: "job.enqueue_failed",
      fromState: "QUEUED",
      toState: "RETRY_SCHEDULED",
      step: "dispatch",
      errorClass: "job_enqueue_failed",
      createdAt: now,
      expectedAttemptCount: 0,
    });
  }

  const job = await env.DB.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,result_json,last_error_class,created_at,updated_at,completed_at FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
  ).bind(jobId).first();
  return { created: true, duplicate: false, job };
}

async function runReadOnlyGenericCapability(env, job) {
  if (HISTORICAL_READ_ONLY_JOB_TYPES.includes(job.job_type)) {
    let payload = {};
    try {
      payload = JSON.parse(String(job.payload_json || "{}"));
    } catch {
      throw new Error("generic_job_payload_invalid");
    }
    return {
      observed_at: new Date().toISOString(),
      ...runHistoricalLearningPrimitive(job.job_type, payload),
    };
  }
  if (job.job_type === "system.health.snapshot") {
    return {
      capability: job.job_type,
      observed_at: new Date().toISOString(),
      health: await health(env),
    };
  }
  if (job.job_type === "history.coverage.audit") {
    const expectedTables = [
      "hermes_automation_history_sources",
      "hermes_automation_history_candidates",
      "hermes_automation_history_coverage",
      "hermes_automation_social_observations",
      "hermes_automation_experiments",
    ];
    const rows = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'hermes_automation_%' ORDER BY name"
    ).all();
    const present = new Set((rows?.results || []).map((row) => String(row.name || "")));
    const missing = expectedTables.filter((name) => !present.has(name));
    return {
      capability: job.job_type,
      observed_at: new Date().toISOString(),
      coverage_runtime_status: missing.length === 0 ? "schema_present" : "not_implemented",
      expected_tables: expectedTables,
      present_tables: expectedTables.filter((name) => present.has(name)),
      missing_tables: missing,
      complete: false,
      completion_reason: "coverage_requires_ingested_sources_and_unclassified_relevant_gate",
    };
  }
  throw new Error("job_type_not_allowed");
}

async function processGenericJob(env, message) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const jobId = clean(message?.job_id, 160);
  if (!jobId) throw new Error("job_id_invalid");
  const before = await env.DB.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class,created_at,updated_at,completed_at FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
  ).bind(jobId).first();
  if (!before) return { status: "job_missing" };
  if (String(before.state) === "SUCCEEDED") return { status: "SUCCEEDED", duplicate: true, job_id: jobId };
  const now = new Date().toISOString();
  const currentAttempt = Number(before.attempt_count || 0) + 1;
  const claimed = await transitionGenericJobWithEvent(env.DB, {
    updateStatement: env.DB.prepare(`
      UPDATE hermes_automation_jobs
      SET state='RUNNING',current_step='execute',attempt_count=attempt_count+1,last_error_class=NULL,updated_at=?
      WHERE job_id=? AND (
        state='QUEUED' OR
        (state='RETRY_SCHEDULED' AND (available_at IS NULL OR available_at<=?))
      )
    `).bind(now, jobId, now),
    jobId,
    eventType: "job.started",
    fromState: String(before.state || "QUEUED"),
    toState: "RUNNING",
    step: "execute",
    createdAt: now,
    expectedAttemptCount: currentAttempt,
  });
  if (!claimed) {
    const current = await env.DB.prepare("SELECT state,available_at,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1").bind(jobId).first();
    return { status: String(current?.state || "not_claimed"), duplicate: true, job_id: jobId };
  }
  try {
    const result = await runReadOnlyGenericCapability(env, before);
    const completedAt = new Date().toISOString();
    const succeeded = await transitionGenericJobWithEvent(env.DB, {
      updateStatement: env.DB.prepare(
        "UPDATE hermes_automation_jobs SET state='SUCCEEDED',current_step='complete',available_at=NULL,result_json=?,last_error_class=NULL,updated_at=?,completed_at=? WHERE job_id=? AND state='RUNNING'"
      ).bind(JSON.stringify(result), completedAt, completedAt, jobId),
      jobId,
      eventType: "job.succeeded",
      fromState: "RUNNING",
      toState: "SUCCEEDED",
      step: "complete",
      createdAt: completedAt,
      expectedAttemptCount: currentAttempt,
    });
    if (!succeeded) throw new Error("job_transition_conflict");
    return { status: "SUCCEEDED", job_id: jobId, result };
  } catch (error) {
    const errorClass = safeRuntimeErrorClass(error, "generic_job_failed");
    const failedAt = new Date().toISOString();
    if (currentAttempt < Number(before.max_attempts || 3)) {
      const retryAt = addSecondsIso(failedAt, genericJobBackoffSeconds(currentAttempt));
      const retryScheduled = await transitionGenericJobWithEvent(env.DB, {
        updateStatement: env.DB.prepare(
          "UPDATE hermes_automation_jobs SET state='RETRY_SCHEDULED',current_step='execute',available_at=?,last_error_class=?,updated_at=? WHERE job_id=? AND state='RUNNING'"
        ).bind(retryAt, errorClass, failedAt, jobId),
        jobId,
        eventType: "job.retry_scheduled",
        fromState: "RUNNING",
        toState: "RETRY_SCHEDULED",
        step: "execute",
        errorClass,
        createdAt: failedAt,
        expectedAttemptCount: currentAttempt,
      });
      if (!retryScheduled) return { status: "transition_conflict", job_id: jobId, error_class: "job_transition_conflict" };
      try {
        await enqueueGenericJobMessage(env, jobId, genericJobBackoffSeconds(currentAttempt));
      } catch {
        // Durable RETRY_SCHEDULED state remains authoritative. Scheduled recovery
        // will enqueue it later; never lose the job because Queue.send failed.
      }
      return { status: "RETRY_SCHEDULED", job_id: jobId, retry_at: retryAt, error_class: errorClass };
    }
    const failed = await transitionGenericJobWithEvent(env.DB, {
      updateStatement: env.DB.prepare(
        "UPDATE hermes_automation_jobs SET state='FAILED',current_step='complete',available_at=NULL,last_error_class=?,updated_at=?,completed_at=? WHERE job_id=? AND state='RUNNING'"
      ).bind(errorClass, failedAt, failedAt, jobId),
      jobId,
      eventType: "job.failed",
      fromState: "RUNNING",
      toState: "FAILED",
      step: "complete",
      errorClass,
      createdAt: failedAt,
      expectedAttemptCount: currentAttempt,
    });
    if (!failed) return { status: "transition_conflict", job_id: jobId, error_class: "job_transition_conflict" };
    return { status: "FAILED", job_id: jobId, error_class: errorClass };
  }
}

async function recoverPendingGenericJobs(env, limit = 20) {
  if (!env.DB || !env.AUTOMATION_QUEUE) return 0;
  await ensureSchema(env.DB);
  const now = new Date().toISOString();
  const staleRunningCutoff = addSecondsIso(now, -15 * 60);

  const staleRows = await env.DB.prepare(`
    SELECT job_id,attempt_count,max_attempts
    FROM hermes_automation_jobs
    WHERE state='RUNNING' AND updated_at<=?
    ORDER BY updated_at ASC
    LIMIT ?
  `).bind(staleRunningCutoff, Math.max(1, Math.min(50, Number(limit) || 20))).all();

  for (const row of staleRows?.results || []) {
    const jobId = clean(row?.job_id, 160);
    if (!jobId) continue;
    const attempts = Number(row?.attempt_count || 0);
    const maxAttempts = Number(row?.max_attempts || 3);
    if (attempts < maxAttempts) {
      await transitionGenericJobWithEvent(env.DB, {
        updateStatement: env.DB.prepare(`
          UPDATE hermes_automation_jobs
          SET state='RETRY_SCHEDULED',
              available_at=?,
              last_error_class='stale_running_recovered',
              updated_at=?
          WHERE job_id=? AND state='RUNNING' AND updated_at<=?
        `).bind(now, now, jobId, staleRunningCutoff),
        jobId,
        eventType: "job.stale_running_recovered",
        fromState: "RUNNING",
        toState: "RETRY_SCHEDULED",
        step: "execute",
        errorClass: "stale_running_recovered",
        createdAt: now,
        expectedAttemptCount: attempts,
      });
      continue;
    }

    await transitionGenericJobWithEvent(env.DB, {
      updateStatement: env.DB.prepare(`
        UPDATE hermes_automation_jobs
        SET state='FAILED',
            current_step='complete',
            available_at=NULL,
            last_error_class='stale_running_attempts_exhausted',
            updated_at=?,
            completed_at=?
        WHERE job_id=? AND state='RUNNING' AND updated_at<=?
      `).bind(now, now, jobId, staleRunningCutoff),
      jobId,
      eventType: "job.stale_running_failed",
      fromState: "RUNNING",
      toState: "FAILED",
      step: "complete",
      errorClass: "stale_running_attempts_exhausted",
      createdAt: now,
      expectedAttemptCount: attempts,
    });
  }

  const rows = await env.DB.prepare(`
    SELECT job_id,state,attempt_count FROM hermes_automation_jobs
    WHERE state IN ('QUEUED','RETRY_SCHEDULED')
      AND (available_at IS NULL OR available_at<=?)
    ORDER BY priority DESC, created_at ASC
    LIMIT ?
  `).bind(now, Math.max(1, Math.min(50, Number(limit) || 20))).all();
  let recovered = 0;
  for (const row of rows?.results || []) {
    const jobId = clean(row?.job_id, 160);
    const fromState = clean(row?.state, 40);
    if (!jobId) continue;
    try {
      // Do not push available_at into the future after enqueue: RETRY_SCHEDULED
      // consumers must remain immediately claimable. Duplicate recovery messages
      // are harmless because the D1 state transition is the execution lock.
      await enqueueGenericJobMessage(env, jobId);
      await env.DB.prepare(
        "UPDATE hermes_automation_jobs SET last_error_class=NULL,updated_at=? WHERE job_id=? AND state IN ('QUEUED','RETRY_SCHEDULED')"
      ).bind(now, jobId).run();
      recovered += 1;
    } catch {
      const retryAt = addSecondsIso(now, 5 * 60);
      await transitionGenericJobWithEvent(env.DB, {
        updateStatement: env.DB.prepare(
          "UPDATE hermes_automation_jobs SET state='RETRY_SCHEDULED',available_at=?,last_error_class='job_enqueue_failed',updated_at=? WHERE job_id=? AND state IN ('QUEUED','RETRY_SCHEDULED')"
        ).bind(retryAt, now, jobId),
        jobId,
        eventType: "job.enqueue_failed",
        fromState: fromState || "QUEUED",
        toState: "RETRY_SCHEDULED",
        step: "dispatch",
        errorClass: "job_enqueue_failed",
        createdAt: now,
        expectedAttemptCount: Number(row?.attempt_count || 0),
      });
    }
  }
  return recovered;
}
async function getGenericJob(env, jobId) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const job = await env.DB.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class,created_at,updated_at,completed_at FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
  ).bind(jobId).first();
  if (!job) return null;
  const events = await env.DB.prepare(
    "SELECT event_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at FROM hermes_automation_job_events WHERE job_id=? ORDER BY created_at ASC LIMIT 100"
  ).bind(jobId).all();
  return { job, events: events?.results || [] };
}

async function reserveRun(db, slotKey, triggerType) {
  const now = new Date().toISOString();
  const result = await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_runs
      (id, trigger_type, account_key, platform, slot_key, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)
  `).bind(runIdForSlot(slotKey), triggerType, ACCOUNT_KEY, PLATFORM, slotKey, now, now).run();
  return Number(result?.meta?.changes || 0) === 1;
}

async function insertCandidate(db, candidate) {
  const now = new Date().toISOString();
  const result = await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_content
      (content_id, account_key, platform, slot_key, template_id, variant_key, destination_url, body, state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)
  `).bind(
    candidate.content_id,
    candidate.account_key,
    candidate.platform,
    candidate.slot_key,
    candidate.template_id,
    candidate.variant_key,
    candidate.destination_url,
    candidate.body,
    now,
    now,
  ).run();
  return Number(result?.meta?.changes || 0) === 1;
}

async function claimPublicationForProvider(db, candidate) {
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_publications
      (idempotency_key, content_id, account_key, platform, status, attempt_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'reserved', 0, ?, ?)
  `).bind(candidate.idempotency_key, candidate.content_id, candidate.account_key, candidate.platform, now, now).run();

  // Only a definitely pre-provider reservation may advance to a provider call.
  // This conditional transition is the concurrency lock: one consumer wins.
  const claimed = await db.prepare(`
    UPDATE hermes_automation_publications
    SET status='publishing',attempt_count=attempt_count+1,updated_at=?
    WHERE idempotency_key=? AND account_key=? AND platform=? AND status='reserved'
  `).bind(now, candidate.idempotency_key, candidate.account_key, candidate.platform).run();
  return Number(claimed?.meta?.changes || 0) === 1;
}

function publicationEnabled(env) {
  return String(env.HERMES_AUTOMATION_MODE || "dry_run") === "live"
    && String(env.HERMES_AUTOMATION_PUBLISH || "disabled") === "enabled";
}

function addSecondsIso(iso, seconds) {
  const base = Number.isFinite(Date.parse(String(iso || ""))) ? Date.parse(String(iso)) : Date.now();
  return new Date(base + seconds * 1000).toISOString();
}

async function enqueueDueReadbacks(env, limit = 20) {
  if (!env.DB || !env.AUTOMATION_QUEUE) return 0;
  await ensureSchema(env.DB);
  const now = new Date().toISOString();
  const stalePublishingCutoff = addSecondsIso(now, -10 * 60);
  await env.DB.prepare("UPDATE hermes_automation_publications SET status='provider_accepted_readback_pending',next_readback_at=?,last_error_class='stale_publish_requires_readback',updated_at=? WHERE account_key=? AND platform=? AND status='publishing' AND updated_at<=?")
    .bind(now, now, ACCOUNT_KEY, PLATFORM, stalePublishingCutoff).run();
  const rows = await env.DB.prepare("SELECT content_id FROM hermes_automation_publications WHERE account_key=? AND platform=? AND status IN ('provider_accepted_readback_pending','unknown_outcome_readback_pending') AND next_readback_at IS NOT NULL AND next_readback_at<=? ORDER BY next_readback_at ASC LIMIT ?")
    .bind(ACCOUNT_KEY, PLATFORM, now, Math.max(1, Math.min(50, Number(limit) || 20))).all();
  let queued = 0;
  for (const row of rows?.results || []) {
    const contentId = clean(row?.content_id, 240);
    if (!contentId) continue;
    const leaseUntil = addSecondsIso(now, 15 * 60);
    const leased = await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,updated_at=? WHERE content_id=? AND status IN ('provider_accepted_readback_pending','unknown_outcome_readback_pending') AND next_readback_at<=?")
      .bind(leaseUntil, now, contentId, now).run();
    if (Number(leased?.meta?.changes || 0) !== 1) continue;
    try {
      await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: contentId });
      queued += 1;
    } catch {
      await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='readback_enqueue_failed',updated_at=? WHERE content_id=? AND status IN ('provider_accepted_readback_pending','unknown_outcome_readback_pending')")
        .bind(addSecondsIso(now, 5 * 60), now, contentId).run();
    }
  }
  return queued;
}
async function selectFreshCarrierCandidate(db, slotKey) {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  for (let variantIndex = 0; variantIndex < 64; variantIndex += 1) {
    const candidate = buildCarrierThreadsPost(slotKey, variantIndex);
    const recent = await db.prepare(
      "SELECT content_id FROM hermes_automation_content WHERE account_key=? AND platform=? AND variant_key=? AND created_at>=? LIMIT 1"
    ).bind(ACCOUNT_KEY, PLATFORM, candidate.variant_key, cutoff).first();
    if (!recent) return candidate;
  }
  throw new Error("no_fresh_carrier_variant_available");
}

async function getPersistedCandidateBySlot(db, slotKey) {
  const row = await db.prepare(
    "SELECT content_id,account_key,platform,slot_key,template_id,variant_key,destination_url,body FROM hermes_automation_content WHERE account_key=? AND platform=? AND slot_key=? LIMIT 1"
  ).bind(ACCOUNT_KEY, PLATFORM, slotKey).first();
  if (!row) return null;
  return {
    content_id: String(row.content_id),
    account_key: String(row.account_key),
    platform: String(row.platform),
    slot_key: String(row.slot_key),
    template_id: String(row.template_id),
    variant_key: String(row.variant_key),
    destination_url: String(row.destination_url),
    body: String(row.body),
    bytes: new TextEncoder().encode(String(row.body)).byteLength,
    idempotency_key: `hae:${row.account_key}:${row.platform}:${row.slot_key}`,
  };
}

async function loadOrCreateCarrierCandidate(db, slotKey) {
  const existing = await getPersistedCandidateBySlot(db, slotKey);
  if (existing) return existing;
  const selected = await selectFreshCarrierCandidate(db, slotKey);
  await insertCandidate(db, selected);
  // Read back the persisted row. If another consumer raced us, this guarantees
  // every retry/provider reservation uses the exact body that won the D1 slot.
  const persisted = await getPersistedCandidateBySlot(db, slotKey);
  if (!persisted) throw new Error("candidate_persistence_failed");
  return persisted;
}

async function enqueuePlanRun(env, slotKey) {
  const now = new Date().toISOString();
  try {
    await env.AUTOMATION_QUEUE.send({
      type: "content.plan",
      account_key: ACCOUNT_KEY,
      platform: PLATFORM,
      slot_key: slotKey,
    });
    await env.DB.prepare(
      "UPDATE hermes_automation_runs SET status='plan_enqueued',last_error_class=NULL,updated_at=? WHERE id=? AND status IN ('queued','plan_enqueue_failed')"
    ).bind(now, runIdForSlot(slotKey)).run();
    return true;
  } catch {
    await env.DB.prepare(
      "UPDATE hermes_automation_runs SET status='plan_enqueue_failed',last_error_class='plan_enqueue_failed',updated_at=? WHERE id=? AND status IN ('queued','plan_enqueue_failed')"
    ).bind(now, runIdForSlot(slotKey)).run();
    return false;
  }
}

async function recoverPendingPlanRuns(env, limit = 20) {
  if (!env.DB || !env.AUTOMATION_QUEUE) return 0;
  await ensureSchema(env.DB);
  const rows = await env.DB.prepare(
    "SELECT slot_key FROM hermes_automation_runs WHERE account_key=? AND platform=? AND status IN ('queued','plan_enqueue_failed') ORDER BY created_at ASC LIMIT ?"
  ).bind(ACCOUNT_KEY, PLATFORM, Math.max(1, Math.min(50, Number(limit) || 20))).all();
  let recovered = 0;
  for (const row of rows?.results || []) {
    const slotKey = clean(row?.slot_key, 32);
    if (!slotKey) continue;
    if (await enqueuePlanRun(env, slotKey)) recovered += 1;
  }
  return recovered;
}

async function processPlanMessage(env, message) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const slotKey = clean(message?.slot_key, 32);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(slotKey)) throw new Error("slot_key_invalid");
  // Queue push can be used as a private Cloudflare control-plane canary without
  // exposing an HTTP route. Ensure the durable run row exists even when the
  // message did not originate from this Worker's scheduled producer.
  await reserveRun(env.DB, slotKey, clean(message?.trigger_type, 40) || "queue");
  if (publicationEnabled(env)) {
    const now = new Date();
    const currentSlotKey = chicagoSlotKey(now);
    if (!isEligibleChicagoSlot(now) || slotKey !== currentSlotKey) {
      await env.DB.prepare(
        "UPDATE hermes_automation_runs SET status='expired_live_slot',last_error_class='stale_live_slot_suppressed',updated_at=? WHERE id=?"
      ).bind(now.toISOString(), runIdForSlot(slotKey)).run();
      return { status: "expired_live_slot", slot_key: slotKey };
    }
  }
  const candidate = await loadOrCreateCarrierCandidate(env.DB, slotKey);

  if (!publicationEnabled(env)) {
    await env.DB.prepare("UPDATE hermes_automation_runs SET status='dry_run_ready',updated_at=? WHERE id=?")
      .bind(new Date().toISOString(), runIdForSlot(slotKey)).run();
    return { status: "dry_run_ready", candidate };
  }

  const claimed = await claimPublicationForProvider(env.DB, candidate);
  if (!claimed) {
    const existingPublication = await env.DB.prepare(
      "SELECT status FROM hermes_automation_publications WHERE idempotency_key=? AND account_key=? AND platform=? LIMIT 1"
    ).bind(candidate.idempotency_key, candidate.account_key, candidate.platform).first();
    return {
      status: "duplicate_suppressed",
      candidate,
      existing_publication_status: clean(existingPublication?.status, 80) || null,
    };
  }

  const published = await publishThreadsTextViaWindsor(env, candidate.body);
  const now = new Date().toISOString();
  if (!published.ok) {
    if (published.error_class === "provider_outcome_unknown") {
      // The request may have reached the provider. Never retry the publish call.
      // Move directly into readback-only recovery so HAE can determine whether
      // the post exists before asking a human to resolve the ambiguity.
      const status = "unknown_outcome_readback_pending";
      const nextReadbackAt = addSecondsIso(now, 4200);
      await env.DB.prepare("UPDATE hermes_automation_publications SET status=?,readback_attempt=0,next_readback_at=?,last_error_class=?,updated_at=? WHERE idempotency_key=?")
        .bind(status, nextReadbackAt, published.error_class, now, candidate.idempotency_key).run();
      await env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
        .bind(status, published.error_class, now, candidate.content_id).run();
      await env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
        .bind(status, published.error_class, now, runIdForSlot(slotKey)).run();
      try {
        await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: candidate.content_id }, { delaySeconds: 4200 });
      } catch {
        await env.DB.prepare("UPDATE hermes_automation_publications SET last_error_class='unknown_outcome_readback_enqueue_failed',updated_at=? WHERE content_id=?")
          .bind(new Date().toISOString(), candidate.content_id).run();
      }
      return { status, candidate, error_class: published.error_class };
    }

    const status = "failed";
    await env.DB.prepare("UPDATE hermes_automation_publications SET status=?,last_error_class=?,updated_at=? WHERE idempotency_key=?")
      .bind(status, published.error_class, now, candidate.idempotency_key).run();
    await env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
      .bind(status, published.error_class, now, candidate.content_id).run();
    await env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
      .bind(status, published.error_class, now, runIdForSlot(slotKey)).run();
    return { status, candidate, error_class: published.error_class };
  }

  const nextReadbackAt = addSecondsIso(now, 4200);
  await env.DB.prepare("UPDATE hermes_automation_publications SET status='provider_accepted_readback_pending',readback_attempt=0,next_readback_at=?,updated_at=? WHERE idempotency_key=?")
    .bind(nextReadbackAt, now, candidate.idempotency_key).run();
  await env.DB.prepare("UPDATE hermes_automation_content SET state='provider_accepted_readback_pending',updated_at=? WHERE content_id=?")
    .bind(now, candidate.content_id).run();
  await env.DB.prepare("UPDATE hermes_automation_runs SET status='provider_accepted_readback_pending',updated_at=? WHERE id=?")
    .bind(now, runIdForSlot(slotKey)).run();

  try {
    await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: candidate.content_id }, { delaySeconds: 4200 });
  } catch {
    // Provider write has already happened. Never retry the publish step merely
    // because queue scheduling failed; the hourly recovery scan will enqueue it.
    await env.DB.prepare("UPDATE hermes_automation_publications SET last_error_class='readback_enqueue_failed',updated_at=? WHERE content_id=?")
      .bind(new Date().toISOString(), candidate.content_id).run();
  }

  return { status: "provider_accepted_readback_pending", candidate, provider_result: published.provider_result || null };
}

async function processReadbackMessage(env, message) {
  if (!env.DB) throw new Error("database_not_configured");
  await ensureSchema(env.DB);
  const contentId = clean(message?.content_id, 240);
  if (!contentId) throw new Error("content_id_invalid");

  const publication = await env.DB.prepare("SELECT status,readback_attempt,next_readback_at FROM hermes_automation_publications WHERE content_id=? LIMIT 1").bind(contentId).first();
  if (!publication) return { status: "readback_missing_publication" };
  if (String(publication.status) === "published_verified") return { status: "published_verified", duplicate: true };
  const pendingStatus = String(publication.status || "");
  if (!["provider_accepted_readback_pending", "unknown_outcome_readback_pending"].includes(pendingStatus)) {
    return { status: pendingStatus || "terminal" };
  }
  const attempt = Math.max(1, Math.min(4, Number(publication.readback_attempt || 0) + 1));
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
    await env.DB.prepare("UPDATE hermes_automation_runs SET status='published_verified',last_error_class=NULL,updated_at=? WHERE id=?")
      .bind(now, runIdForSlot(String(row.slot_key || ""))).run();
    return { status: "published_verified", provider_post_id: readback.provider_post_id, permalink: readback.permalink || null };
  }

  if (attempt < 4) {
    const errorClass = readback.ok ? "post_not_visible_yet" : readback.error_class;
    const nextReadbackAt = addSecondsIso(now, 3600);
    await env.DB.prepare("UPDATE hermes_automation_publications SET readback_attempt=?,next_readback_at=?,last_error_class=?,updated_at=? WHERE content_id=? AND status=?")
      .bind(attempt, nextReadbackAt, errorClass, now, contentId, pendingStatus).run();
    try {
      await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: contentId }, { delaySeconds: 3600 });
    } catch {
      // Recovery cron will pick up next_readback_at; do not touch provider write state.
    }
    return { status: "provider_accepted_readback_pending", readback_attempt: attempt, error_class: errorClass };
  }

  const errorClass = readback.ok ? "provider_readback_not_found" : readback.error_class;
  const terminalStatus = pendingStatus === "unknown_outcome_readback_pending"
    ? "unknown_outcome_unresolved"
    : "readback_unverified";
  await env.DB.prepare("UPDATE hermes_automation_publications SET status=?,readback_attempt=?,next_readback_at=NULL,last_error_class=?,updated_at=? WHERE content_id=?")
    .bind(terminalStatus, attempt, errorClass, now, contentId).run();
  await env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
    .bind(terminalStatus, errorClass, now, contentId).run();
  await env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
    .bind(terminalStatus, errorClass, now, runIdForSlot(String(row.slot_key || ""))).run();
  return { status: terminalStatus, error_class: errorClass };
}

async function queueHealth(queue) {
  if (!queue || typeof queue.metrics !== "function") return { status: "unavailable" };
  try {
    const metrics = await queue.metrics();
    return {
      status: "ok",
      backlog_count: metricNumberOrNull(metrics?.backlogCount),
      backlog_bytes: metricNumberOrNull(metrics?.backlogBytes),
      oldest_message_at: metrics?.oldestMessageTimestamp
        ? new Date(metrics.oldestMessageTimestamp).toISOString()
        : null,
    };
  } catch {
    return { status: "metrics_unavailable" };
  }
}

async function health(env) {
  const db = env?.DB;
  if (!db) return { database: "missing", queue: { status: "unavailable" } };
  await ensureSchema(db);
  const ready = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_content WHERE account_key=? AND platform=? AND state='ready'").bind(ACCOUNT_KEY, PLATFORM).first();
  const unknown = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE account_key=? AND platform=? AND status IN ('unknown_outcome_readback_pending','unknown_outcome_unresolved')").bind(ACCOUNT_KEY, PLATFORM).first();
  const failed = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE account_key=? AND platform=? AND status='failed'").bind(ACCOUNT_KEY, PLATFORM).first();
  const pendingReadback = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE account_key=? AND platform=? AND status='provider_accepted_readback_pending'").bind(ACCOUNT_KEY, PLATFORM).first();
  const unverifiedReadback = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE account_key=? AND platform=? AND status='readback_unverified'").bind(ACCOUNT_KEY, PLATFORM).first();
  const planEnqueueFailed = await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_runs WHERE account_key=? AND platform=? AND status='plan_enqueue_failed'").bind(ACCOUNT_KEY, PLATFORM).first();
  const genericJobRows = await db.prepare("SELECT state,COUNT(*) AS count FROM hermes_automation_jobs GROUP BY state ORDER BY state").all();
  const genericJobsByState = Object.fromEntries(
    (genericJobRows?.results || []).map((row) => [String(row.state || "UNKNOWN"), metricNumberOrNull(row.count)])
  );
  const last = await db.prepare(`
    SELECT slot_key,status,updated_at,last_error_class
    FROM hermes_automation_runs
    WHERE account_key=? AND platform=?
    ORDER BY updated_at DESC
    LIMIT 1
  `).bind(ACCOUNT_KEY, PLATFORM).first();
  const lastSuccess = await db.prepare(`
    SELECT slot_key,status,updated_at
    FROM hermes_automation_runs
    WHERE account_key=? AND platform=? AND status IN ('dry_run_ready','published_verified')
    ORDER BY updated_at DESC
    LIMIT 1
  `).bind(ACCOUNT_KEY, PLATFORM).first();
  const lastFailure = await db.prepare(`
    SELECT slot_key,status,updated_at,last_error_class
    FROM hermes_automation_runs
    WHERE account_key=? AND platform=? AND status IN ('plan_enqueue_failed','failed','unknown_outcome_unresolved','readback_unverified')
    ORDER BY updated_at DESC
    LIMIT 1
  `).bind(ACCOUNT_KEY, PLATFORM).first();
  const lastHeartbeat = await db.prepare(`
    SELECT trigger_type,cron_expression,scheduled_at,observed_at,execution_lag_ms,chicago_slot_key,eligible
    FROM hermes_automation_heartbeats
    ORDER BY scheduled_at DESC
    LIMIT 1
  `).first();
  const runtimeEventRows = await db.prepare(
    "SELECT event_type,COUNT(*) AS count FROM hermes_automation_runtime_events GROUP BY event_type ORDER BY event_type"
  ).all();
  const runtimeEventsByType = Object.fromEntries(
    (runtimeEventRows?.results || []).map((row) => [String(row.event_type || "UNKNOWN"), metricNumberOrNull(row.count)])
  );
  const genericJobEventRows = await db.prepare(
    "SELECT event_type,COUNT(*) AS count FROM hermes_automation_job_events GROUP BY event_type ORDER BY event_type"
  ).all();
  const genericJobEventsByType = Object.fromEntries(
    (genericJobEventRows?.results || []).map((row) => [String(row.event_type || "UNKNOWN"), metricNumberOrNull(row.count)])
  );
  const sourceShaRaw = String(env?.HERMES_AUTOMATION_SOURCE_SHA || "").trim();
  return {
    database: "ok",
    source_sha: /^[0-9a-f]{40}$/.test(sourceShaRaw) ? sourceShaRaw : null,
    automation_mode: clean(env?.HERMES_AUTOMATION_MODE, 40) || "UNKNOWN",
    publication_config: clean(env?.HERMES_AUTOMATION_PUBLISH, 40) || "UNKNOWN",
    publication_enabled: publicationEnabled(env),
    ready_content: metricNumberOrNull(ready?.count),
    unknown_outcomes: metricNumberOrNull(unknown?.count),
    failed_publications: metricNumberOrNull(failed?.count),
    pending_readbacks: metricNumberOrNull(pendingReadback?.count),
    unverified_readbacks: metricNumberOrNull(unverifiedReadback?.count),
    plan_enqueue_failures: metricNumberOrNull(planEnqueueFailed?.count),
    generic_jobs_by_state: genericJobsByState,
    runtime_events_by_type: runtimeEventsByType,
    generic_job_events_by_type: genericJobEventsByType,
    queue: await queueHealth(env?.AUTOMATION_QUEUE),
    dlq: await queueHealth(env?.AUTOMATION_DLQ),
    last_cron_wake: lastHeartbeat || null,
    last_success: lastSuccess || null,
    last_failure: lastFailure || null,
    last_run: last || null,
  };
}

export default {
  async scheduled(controller, env, ctx) {
    if (!env.DB || !env.AUTOMATION_QUEUE) return;
    const observedAt = new Date();
    const rawScheduledTime = metricNumberOrNull(controller?.scheduledTime);
    const scheduledAt = rawScheduledTime === null
      ? observedAt
      : new Date(rawScheduledTime);
    await ensureSchema(env.DB);
    const eligible = isEligibleChicagoSlot(scheduledAt);
    try {
      await recordCronHeartbeat(env.DB, scheduledAt, observedAt, eligible, controller?.cron);
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.heartbeat_write_failed",
        slotKey: chicagoSlotKey(scheduledAt),
        errorClass: safeRuntimeErrorClass(error, "heartbeat_write_failed"),
      });
    }

    if (eligible) {
      const slotKey = chicagoSlotKey(scheduledAt);
      const inserted = await reserveRun(env.DB, slotKey, "cron");
      if (inserted) {
        try {
          const enqueued = await enqueuePlanRun(env, slotKey);
          if (!enqueued) {
            await recordRuntimeEvent(env, {
              eventType: "cron.current_slot_enqueue_failed",
              messageType: "content.plan",
              slotKey,
              errorClass: "current_slot_enqueue_failed",
            });
          }
        } catch (error) {
          await recordRuntimeEvent(env, {
            eventType: "cron.current_slot_enqueue_failed",
            messageType: "content.plan",
            slotKey,
            errorClass: safeRuntimeErrorClass(error, "current_slot_enqueue_failed"),
          });
        }
      }
    }

    for (const [eventType, maintenance] of [
      ["cron.recover_readbacks_failed", enqueueDueReadbacks],
      ["cron.recover_plan_runs_failed", recoverPendingPlanRuns],
      ["cron.recover_generic_jobs_failed", recoverPendingGenericJobs],
    ]) {
      try {
        await maintenance(env);
      } catch (error) {
        await recordRuntimeEvent(env, {
          eventType,
          errorClass: safeRuntimeErrorClass(error, "scheduled_maintenance_failed"),
        });
      }
    }
  },

  async queue(batch, env) {
    for (const item of batch.messages) {
      const payload = item.body || {};
      const messageType = clean(payload?.type, 80) || "UNKNOWN";
      try {
        if (messageType === "job.execute") {
          await processGenericJob(env, payload);
          item.ack();
          continue;
        }
        if (messageType === "content.plan") {
          await processPlanMessage(env, payload);
          item.ack();
          continue;
        }
        if (messageType === "publication.readback") {
          await processReadbackMessage(env, payload);
          item.ack();
          continue;
        }
        await recordRuntimeEvent(env, {
          eventType: "queue.message_unknown",
          queueName: batch?.queue,
          queueMessageId: item?.id,
          messageSentAt: item?.timestamp,
          messageType,
          jobId: payload?.job_id,
          contentId: payload?.content_id,
          slotKey: payload?.slot_key,
          attemptCount: item?.attempts,
          errorClass: "queue_message_type_unknown",
        });
        item.retry();
      } catch (error) {
        await recordRuntimeEvent(env, {
          eventType: "queue.message_retry",
          queueName: batch?.queue,
          queueMessageId: item?.id,
          messageSentAt: item?.timestamp,
          messageType,
          jobId: payload?.job_id,
          contentId: payload?.content_id,
          slotKey: payload?.slot_key,
          attemptCount: item?.attempts,
          errorClass: safeRuntimeErrorClass(error, "queue_handler_failed"),
        });
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
        generic_job_executor: true,
        read_only_job_types: Array.from(READ_ONLY_GENERIC_JOB_TYPES),
        provider_transport: "windsor_connectors_api",
        provider_configured: Boolean(windsorThreadsConfig(env)),
        publication_enabled: publicationEnabled(env),
      });
    }
    if (request.method === "GET" && url.pathname === "/v1/health") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      return json(200, { success: true, ...(await health(env)) });
    }
    if (request.method === "POST" && url.pathname === "/v1/jobs") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB || !env.AUTOMATION_QUEUE) return json(503, { success: false, error: "runtime_not_configured" });
      const body = await request.json().catch(() => ({}));
      try {
        const created = await createGenericJob(env, body);
        return json(created.created ? 202 : 200, { success: true, ...created });
      } catch (error) {
        const code = safeRuntimeErrorClass(error, "job_create_failed");
        const status = code === "idempotency_key_conflict"
          ? 409
          : code.startsWith("historical_") || ["job_type_not_allowed", "business_lane_required", "idempotency_key_required", "payload_not_serializable", "payload_too_large"].includes(code) ? 400 : 500;
        return json(status, { success: false, error: code });
      }
    }
    if (request.method === "GET" && url.pathname.startsWith("/v1/jobs/")) {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB) return json(503, { success: false, error: "runtime_not_configured" });
      let jobId = "";
      try {
        jobId = clean(decodeURIComponent(url.pathname.slice("/v1/jobs/".length)), 160);
      } catch {
        return json(400, { success: false, error: "job_id_invalid" });
      }
      if (!jobId) return json(400, { success: false, error: "job_id_invalid" });
      const record = await getGenericJob(env, jobId);
      if (!record) return json(404, { success: false, error: "job_not_found" });
      return json(200, { success: true, ...record });
    }
    if (request.method === "POST" && url.pathname === "/v1/tick") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB || !env.AUTOMATION_QUEUE) return json(503, { success: false, error: "runtime_not_configured" });
      const body = await request.json().catch(() => ({}));
      const now = new Date();
      const currentSlotKey = chicagoSlotKey(now);
      const slotKey = clean(body?.slot_key, 32) || currentSlotKey;
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(slotKey)) return json(400, { success: false, error: "slot_key_invalid" });
      if (publicationEnabled(env)) {
        if (!isEligibleChicagoSlot(now)) return json(409, { success: false, error: "live_outside_publish_window" });
        if (slotKey !== currentSlotKey) return json(409, { success: false, error: "live_slot_override_forbidden" });
      }
      await ensureSchema(env.DB);
      const inserted = await reserveRun(env.DB, slotKey, "manual");
      if (!inserted) return json(200, { success: true, duplicate: true, slot_key: slotKey });
      const queued = await enqueuePlanRun(env, slotKey);
      return json(queued ? 202 : 503, {
        success: queued,
        queued,
        recoverable: !queued,
        error: queued ? undefined : "plan_enqueue_failed",
        slot_key: slotKey,
      });
    }
    return json(404, { success: false, error: "not_found" });
  },
};

export { ACCOUNT_KEY, PLATFORM, CARRIER_THEMES, publicationEnabled };
