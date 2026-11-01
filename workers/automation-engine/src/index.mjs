import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorThreadsConfig,
} from "./windsor-threads.mjs";
import {
  HISTORICAL_READ_ONLY_JOB_TYPES,
  runHistoricalLearningPrimitive,
} from "./historical-learning.mjs";
import {
  CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES,
  ROLE_CONTRACTS,
  ROLE_CONTRACT_JOB_TYPES,
  buildRoleContractSemanticRequest,
  roleContractForJobType,
  roleContractSha256,
  runRoleContractPrimitive,
  validateRoleContractInput,
  validateRoleContractSemanticResult,
} from "./role-contracts.mjs";
import {
  FreeAiUnavailableError,
  freeAiProviderSnapshot,
  runFreeSemanticJson,
} from "./free-ai-runtime.mjs";
import {
  dlqRuntimeSnapshot,
  processDlqMessage,
  recoverPendingDlqOwnerAlerts,
} from "./dlq-runtime.mjs";
import {
  aiUsageLedgerSnapshot,
  recordAiUsage,
} from "./ai-usage-ledger.mjs";
import {
  CAPABILITY_GRAPH_LIMITS,
  bindCapabilityGraphNodeJob,
  createCapabilityGraph,
  getCapabilityGraph,
  listActiveCapabilityGraphIds,
  listCapabilityGraphJobBindings,
  markCapabilityGraphNodeDispatchFailure,
  readyCapabilityGraphNodes,
  settleCapabilityGraphNodeForJob,
} from "./capability-graph.mjs";
import { taskMigrationSnapshot } from "./schedule-migrations.mjs";
import {
  enqueueDueOwnerProcesses,
  ownerManagedJobTypes,
} from "./owner-process-runtime.mjs";
import {
  pluginRuntimeRegistryEvidenceStatus,
  pluginRuntimeRegistrySnapshot,
} from "./plugin-runtime-registry.mjs";
import { haeSelfRepairPacketReplayMatches } from "./hae-self-improvement.mjs";
import { verifyGithubCIQueueEnvelope } from "./github-ci-runtime-intake.mjs";
import { verifyGithubCIPatchProposalEnvelope } from "./github-ci-patch-runtime-intake.mjs";
import { verifyGithubCIIndependentQaEnvelope } from "./github-ci-independent-qa-runtime-intake.mjs";
import { materializeIndependentQaReceipt } from "./hae-independent-qa-receipt.mjs";

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

async function sha256HexText(value) {
  const bytes = new TextEncoder().encode(String(value ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
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
      source_sha TEXT,
      automation_mode TEXT,
      publication_config TEXT,
      publication_enabled INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_heartbeats_scheduled ON hermes_automation_heartbeats(scheduled_at)").run();
}

function runtimeEventId(eventType) {
  return `runtime:${eventType}:${crypto.randomUUID()}`;
}

function metricNumberOrNull(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
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

async function recordCronHeartbeat(env, scheduledAt, observedAt, eligible, cronExpression = null) {
  const db = env?.DB;
  if (!db) throw new Error("database_not_configured");
  const scheduledIso = scheduledAt.toISOString();
  const observedIso = observedAt.toISOString();
  const slotKey = chicagoSlotKey(scheduledAt);
  const lagMs = Math.max(0, observedAt.getTime() - scheduledAt.getTime());
  const sourceShaRaw = String(env?.HERMES_AUTOMATION_SOURCE_SHA || "").trim();
  const sourceSha = /^[0-9a-f]{40}$/.test(sourceShaRaw) ? sourceShaRaw : null;
  const automationMode = clean(env?.HERMES_AUTOMATION_MODE, 40) || "UNKNOWN";
  const publicationConfig = clean(env?.HERMES_AUTOMATION_PUBLISH, 40) || "UNKNOWN";
  await db.prepare(`
    INSERT OR IGNORE INTO hermes_automation_heartbeats
      (heartbeat_id,trigger_type,cron_expression,scheduled_at,observed_at,execution_lag_ms,chicago_slot_key,eligible,source_sha,automation_mode,publication_config,publication_enabled,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    `heartbeat:cron:${scheduledIso.slice(0, 13)}Z`,
    "cron",
    clean(cronExpression, 80) || null,
    scheduledIso,
    observedIso,
    lagMs,
    slotKey,
    eligible ? 1 : 0,
    sourceSha,
    automationMode,
    publicationConfig,
    publicationEnabled(env) ? 1 : 0,
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
  ...ROLE_CONTRACT_JOB_TYPES,
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
  const roleContract = roleContractForJobType(jobType);
  const requestedBusinessLane = clean(input?.business_lane, 120);
  const businessLane = requestedBusinessLane || clean(roleContract?.business_lane, 120);
  const idempotencyKey = clean(input?.idempotency_key, 240);
  const accountKey = clean(input?.account_key, 120) || null;
  const projectKey = clean(input?.project_key, 120) || null;
  const policyVersion = clean(input?.policy_version, 120) || "hae-readonly-v1";
  const rawPriority = metricNumberOrNull(input?.priority);
  const rawMaxAttempts = metricNumberOrNull(input?.max_attempts);
  const priority = rawPriority === null ? 50 : Math.max(0, Math.min(100, Math.trunc(rawPriority)));
  const maxAttempts = rawMaxAttempts === null ? 3 : Math.max(1, Math.min(5, Math.trunc(rawMaxAttempts)));
  if (!READ_ONLY_GENERIC_JOB_TYPES.has(jobType)) throw new Error("job_type_not_allowed");
  if (!businessLane) throw new Error("business_lane_required");
  if (roleContract && businessLane !== roleContract.business_lane) throw new Error("role_contract_business_lane_mismatch");
  if (roleContract?.semantic_required && input?.internal_submission !== true) throw new Error("semantic_job_internal_only");
  if (!idempotencyKey) throw new Error("idempotency_key_required");
  let payload = input?.payload ?? {};
  if (HISTORICAL_READ_ONLY_JOB_TYPES.includes(jobType)) {
    runHistoricalLearningPrimitive(jobType, payload);
  }
  if (ROLE_CONTRACT_JOB_TYPES.includes(jobType)) {
    validateRoleContractInput(jobType, payload);
    const contract = roleContract;
    if (!contract) throw new Error("role_contract_missing");
    const roleContractSha = await roleContractSha256(contract);
    payload = {
      ...payload,
      _role_contract: {
        role_id: contract.role_id,
        plugin_version: contract.plugin_version,
        contract_version: contract.contract_version,
        sha256: roleContractSha,
      },
    };
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
  const initialDispatchLeaseUntil = addSecondsIso(now, 15 * 60);
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
    initialDispatchLeaseUntil,
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

async function dispatchCapabilityGraphReadyNodes(env, graphId) {
  const ready = await readyCapabilityGraphNodes(env, graphId);
  const outcomes = await Promise.all(ready.map(async (node) => {
    try {
      const created = await createGenericJob(env, {
        job_type: node.job_type,
        account_key: ACCOUNT_KEY,
        project_key: `hae-graph:${graphId}`,
        priority: 50,
        max_attempts: 3,
        internal_submission: true,
        idempotency_key: `hae:graph:${graphId}:node:${node.node_id}`,
        policy_version: "hae-capability-graph-v1",
        payload: {
          ...node.payload,
          _graph: {
            graph_id: graphId,
            node_id: node.node_id,
          },
        },
      });
      const jobId = clean(created?.job?.job_id, 160);
      if (!jobId) throw new Error("graph_node_job_missing");
      await bindCapabilityGraphNodeJob(env, graphId, node.node_id, jobId);
      return 1;
    } catch (error) {
      await markCapabilityGraphNodeDispatchFailure(
        env,
        graphId,
        node.node_id,
        safeRuntimeErrorClass(error, "graph_node_dispatch_failed"),
      );
      return 0;
    }
  }));
  return outcomes.reduce((sum, value) => sum + value, 0);
}

async function syncCapabilityGraphJobBestEffort(env, {
  jobId,
  jobState,
  result = null,
  errorClass = null,
}) {
  try {
    const settled = await settleCapabilityGraphNodeForJob(env, {
      job_id: jobId,
      job_state: jobState,
      result,
      error_class: errorClass,
    });
    if (settled?.graph_id && ["SUCCEEDED", "FAILED"].includes(jobState)) {
      await dispatchCapabilityGraphReadyNodes(env, settled.graph_id);
    }
  } catch (error) {
    await recordRuntimeEvent(env, {
      eventType: "graph.job_sync_failed",
      messageType: "job.execute",
      jobId,
      errorClass: safeRuntimeErrorClass(error, "graph_job_sync_failed"),
    });
  }
}

async function recoverCapabilityGraphs(env, limit = 20) {
  if (!env?.DB || !env?.AUTOMATION_QUEUE) return 0;
  const graphIds = await listActiveCapabilityGraphIds(env, limit);
  let touched = 0;
  for (const graphId of graphIds) {
    const bindings = await listCapabilityGraphJobBindings(env, graphId);
    for (const binding of bindings) {
      if (binding.job_state === "SUCCEEDED") {
        let result = null;
        try {
          result = binding.result_json ? JSON.parse(String(binding.result_json)) : null;
        } catch {
          result = null;
        }
        await settleCapabilityGraphNodeForJob(env, {
          job_id: binding.job_id,
          job_state: "SUCCEEDED",
          result,
        });
      } else if (binding.job_state === "FAILED") {
        await settleCapabilityGraphNodeForJob(env, {
          job_id: binding.job_id,
          job_state: "FAILED",
          error_class: binding.last_error_class,
        });
      } else if (binding.job_state === "WAITING_FREE_AI") {
        await settleCapabilityGraphNodeForJob(env, {
          job_id: binding.job_id,
          job_state: "WAITING_FREE_AI",
          error_class: binding.last_error_class,
        });
      }
    }
    touched += await dispatchCapabilityGraphReadyNodes(env, graphId);
  }
  return touched;
}

async function submitRuntimeProofJob(env, message) {
  if (!env.DB || !env.AUTOMATION_QUEUE) throw new Error("runtime_not_configured");
  const automationMode = clean(env.HERMES_AUTOMATION_MODE, 40) || "UNKNOWN";
  const publicationConfig = clean(env.HERMES_AUTOMATION_PUBLISH, 40) || "UNKNOWN";
  if (automationMode !== "dry_run" || publicationConfig !== "disabled" || publicationEnabled(env)) {
    throw new Error("runtime_proof_requires_dry_run");
  }
  const jobType = clean(message?.job_type, 120);
  if (jobType !== "system.health.snapshot") throw new Error("runtime_proof_job_type_not_allowed");
  const idempotencyKey = clean(message?.idempotency_key, 240);
  if (!idempotencyKey) throw new Error("idempotency_key_required");
  return createGenericJob(env, {
    job_type: jobType,
    business_lane: "automation",
    account_key: ACCOUNT_KEY,
    project_key: "hae-runtime-proof",
    priority: 50,
    max_attempts: 1,
    idempotency_key: idempotencyKey,
    policy_version: "hae-readonly-v1",
    payload: {},
  });
}

async function runReadOnlyGenericCapability(env, job) {
  if (ROLE_CONTRACT_JOB_TYPES.includes(job.job_type)) {
    let payload = {};
    try {
      payload = JSON.parse(String(job.payload_json || "{}"));
    } catch {
      throw new Error("generic_job_payload_invalid");
    }
    const contract = roleContractForJobType(job.job_type);
    if (!contract) throw new Error("role_contract_missing");
    const currentRoleContractSha = await roleContractSha256(contract);
    const bound = payload?._role_contract;
    if (
      !bound ||
      bound.role_id !== contract.role_id ||
      bound.plugin_version !== contract.plugin_version ||
      bound.contract_version !== contract.contract_version ||
      bound.sha256 !== currentRoleContractSha
    ) {
      throw new Error("role_contract_stale");
    }
    const executionPayload = { ...payload };
    delete executionPayload._role_contract;
    const observedAt = new Date().toISOString();
    let result;
    let semanticExecution = null;
    if (contract.semantic_required) {
      const semanticRequest = buildRoleContractSemanticRequest(job.job_type, executionPayload);
      const budgetUsd = Number(contract?.runtime_config?.max_cost_usd);
      if (!Number.isFinite(budgetUsd) || budgetUsd < 0) throw new Error("semantic_budget_invalid");
      const freeResult = await runFreeSemanticJson(env, semanticRequest);
      const actualCostUsd = Number(freeResult.cost_usd || 0);
      if (!Number.isFinite(actualCostUsd) || actualCostUsd < 0) throw new Error("ai_usage_cost_invalid");
      if (actualCostUsd > budgetUsd + 1e-9) throw new Error("ai_budget_exceeded");
      const usageReceipt = await recordAiUsage(env, {
        job_id: job.job_id,
        role_id: contract.role_id,
        contract_version: contract.contract_version,
        contract_sha256: currentRoleContractSha,
        provider_id: freeResult.provider_id,
        model: freeResult.model,
        budget_usd: budgetUsd,
        cost_usd: actualCostUsd,
        usage: freeResult.usage,
        status: "PROVIDER_RETURNED",
      });
      if (actualCostUsd !== 0) throw new Error("paid_inference_forbidden");
      result = validateRoleContractSemanticResult(job.job_type, executionPayload, freeResult.result);
      semanticExecution = {
        provider_id: clean(freeResult.provider_id, 120),
        model: clean(freeResult.model, 200),
        budget_usd: budgetUsd,
        cost_usd: actualCostUsd,
        usage_id: usageReceipt.usage_id,
        input_tokens: usageReceipt.input_tokens,
        output_tokens: usageReceipt.output_tokens,
        input_chars: usageReceipt.input_chars,
        output_chars: usageReceipt.output_chars,
      };
    } else {
      result = runRoleContractPrimitive(job.job_type, executionPayload, observedAt);
    }
    return {
      capability: job.job_type,
      observed_at: observedAt,
      external_write: false,
      role_contract: {
        role_id: contract.role_id,
        plugin_version: contract.plugin_version,
        contract_version: contract.contract_version,
        sha256: currentRoleContractSha,
        semantic_required: contract.semantic_required,
        free_ai_policy: contract.free_ai_policy,
      },
      semantic_execution: semanticExecution,
      result,
    };
  }
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
  if (String(before.state) === "SUCCEEDED") {
    try {
      await appendGenericJobEvent(env.DB, {
        jobId,
        eventType: "job.duplicate_suppressed",
        fromState: "SUCCEEDED",
        toState: "SUCCEEDED",
        step: "execute",
        createdAt: new Date().toISOString(),
      });
    } catch {
      await recordRuntimeEvent(env, {
        eventType: "job.duplicate_receipt_write_failed",
        messageType: "job.execute",
        jobId,
        errorClass: "duplicate_receipt_write_failed",
      });
    }
    return { status: "SUCCEEDED", duplicate: true, job_id: jobId };
  }
  const now = new Date().toISOString();
  const currentAttempt = Number(before.attempt_count || 0) + 1;
  const claimed = await transitionGenericJobWithEvent(env.DB, {
    updateStatement: env.DB.prepare(`
      UPDATE hermes_automation_jobs
      SET state='RUNNING',current_step='execute',attempt_count=attempt_count+1,last_error_class=NULL,updated_at=?
      WHERE job_id=? AND (
        state='QUEUED' OR
        (state IN ('RETRY_SCHEDULED','WAITING_FREE_AI') AND (available_at IS NULL OR available_at<=?))
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
function searchDefectsFromSnapshotResult(result) {
  if (result?.capability !== "search.snapshot.evaluate") return [];
  const defects = result?.result?.defects || {};
  const output = [];
  for (const [defectType, urls] of [
    ["http_error", defects.http_errors],
    ["missing_canonical", defects.missing_canonical],
    ["canonical_mismatch", defects.canonical_mismatch],
    ["sitemap_indexability_conflict", defects.sitemap_indexability_conflict],
  ]) {
    for (const url of Array.isArray(urls) ? urls : []) {
      if (output.length >= 20) break;
      output.push({ defect_type: defectType, url });
    }
    if (output.length >= 20) break;
  }
  return output;
}

async function ensureSearchSemanticFollowup(env, parentJob, result) {
  if (parentJob?.job_type !== "search.snapshot.evaluate") return null;
  const defects = searchDefectsFromSnapshotResult(result);
  if (!defects.length) return null;
  return createGenericJob(env, {
    job_type: "search.defect.prioritize",
    account_key: parentJob.account_key || ACCOUNT_KEY,
    project_key: "hae-search-semantic-followup",
    priority: Math.min(100, Math.max(0, Number(parentJob.priority || 50) + 5)),
    max_attempts: 1,
    internal_submission: true,
    idempotency_key: `hae:followup:search.defect.prioritize:${parentJob.job_id}`,
    policy_version: "hae-free-ai-v1",
    payload: {
      parent_job_id: parentJob.job_id,
      defects,
    },
  });
}

async function existingHaeSelfRepairFollowup(env, idempotencyKey, audit) {
  const existing = await env.DB.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 1"
  ).bind(idempotencyKey).first();
  if (!existing) return null;
  let payload = null;
  try {
    payload = JSON.parse(String(existing.payload_json || "{}"));
  } catch {
    throw new Error("hae_self_repair_idempotency_conflict");
  }
  if (
    String(existing.job_type || "") !== "hae.self.repair.packet"
    || !haeSelfRepairPacketReplayMatches(payload, audit)
  ) {
    throw new Error("hae_self_repair_idempotency_conflict");
  }
  return { created: false, duplicate: true, frozen_contract_reused: true, job: existing };
}

async function ensureHaeSelfRepairFollowup(env, parentJob, result) {
  if (parentJob?.job_type !== "hae.self.improvement.audit") return null;
  const audit = result?.result;
  if (
    audit?.next_action !== "HOLD_REPAIR"
    || !audit?.next_work_id
    || !audit?.next_finding_id
    || !audit?.next_artifact_key
  ) {
    return null;
  }
  const idempotencyKey = `hae:followup:self.repair:${audit.next_work_id}`;
  const frozen = await existingHaeSelfRepairFollowup(env, idempotencyKey, audit);
  if (frozen) return frozen;
  return createGenericJob(env, {
    job_type: "hae.self.repair.packet",
    account_key: parentJob.account_key || ACCOUNT_KEY,
    project_key: "hae-self-repair",
    priority: Math.min(100, Math.max(80, Number(parentJob.priority || 80) + 5)),
    max_attempts: 1,
    internal_submission: true,
    idempotency_key: idempotencyKey,
    policy_version: "hae-self-improvement-v1",
    payload: {
      work_id: audit.next_work_id,
      finding_id: audit.next_finding_id,
      artifact_key: audit.next_artifact_key,
    },
  });
}

  try {
    const result = await runReadOnlyGenericCapability(env, before);
    await ensureSearchSemanticFollowup(env, before, result);
    await ensureHaeSelfRepairFollowup(env, before, result);
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
    await syncCapabilityGraphJobBestEffort(env, {
      jobId,
      jobState: "SUCCEEDED",
      result,
    });
    return { status: "SUCCEEDED", job_id: jobId, result };
  } catch (error) {
    const failedAt = new Date().toISOString();
    if (error instanceof FreeAiUnavailableError || error?.code === "free_ai_unavailable") {
      const waitSeconds = Math.max(60, Math.min(24 * 60 * 60, Number(error?.retrySeconds || 900)));
      const waitUntil = addSecondsIso(failedAt, waitSeconds);
      const waitReason = clean(error?.reason, 160) || "free_ai_unavailable";
      const waiting = await transitionGenericJobWithEvent(env.DB, {
        updateStatement: env.DB.prepare(
          "UPDATE hermes_automation_jobs SET state='WAITING_FREE_AI',current_step='free_ai',available_at=?,attempt_count=MAX(0,attempt_count-1),last_error_class=?,updated_at=? WHERE job_id=? AND state='RUNNING' AND attempt_count=?"
        ).bind(waitUntil, waitReason, failedAt, jobId, currentAttempt),
        jobId,
        eventType: "job.waiting_free_ai",
        fromState: "RUNNING",
        toState: "WAITING_FREE_AI",
        step: "free_ai",
        errorClass: waitReason,
        createdAt: failedAt,
        expectedAttemptCount: Math.max(0, currentAttempt - 1),
      });
      if (!waiting) return { status: "transition_conflict", job_id: jobId, error_class: "job_transition_conflict" };
      await syncCapabilityGraphJobBestEffort(env, {
        jobId,
        jobState: "WAITING_FREE_AI",
        errorClass: waitReason,
      });
      return {
        status: "WAITING_FREE_AI",
        job_id: jobId,
        available_at: waitUntil,
        error_class: waitReason,
        attempt_consumed: false,
      };
    }
    const errorClass = safeRuntimeErrorClass(error, "generic_job_failed");
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
    await syncCapabilityGraphJobBestEffort(env, {
      jobId,
      jobState: "FAILED",
      errorClass,
    });
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
    WHERE state IN ('QUEUED','RETRY_SCHEDULED','WAITING_FREE_AI')
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
        "UPDATE hermes_automation_jobs SET last_error_class=NULL,updated_at=? WHERE job_id=? AND state IN ('QUEUED','RETRY_SCHEDULED','WAITING_FREE_AI')"
      ).bind(now, jobId).run();
      recovered += 1;
    } catch {
      const retryAt = addSecondsIso(now, 5 * 60);
      await transitionGenericJobWithEvent(env.DB, {
        updateStatement: env.DB.prepare(
          "UPDATE hermes_automation_jobs SET state='RETRY_SCHEDULED',available_at=?,last_error_class='job_enqueue_failed',updated_at=? WHERE job_id=? AND state IN ('QUEUED','RETRY_SCHEDULED','WAITING_FREE_AI')"
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
  } catch {
    await env.DB.prepare(
      "UPDATE hermes_automation_runs SET status='plan_enqueue_failed',last_error_class='plan_enqueue_failed',updated_at=? WHERE id=? AND status IN ('queued','plan_enqueue_failed')"
    ).bind(now, runIdForSlot(slotKey)).run();
    return false;
  }

  try {
    await env.DB.prepare(
      "UPDATE hermes_automation_runs SET status='plan_enqueued',last_error_class=NULL,updated_at=? WHERE id=? AND status IN ('queued','plan_enqueue_failed')"
    ).bind(now, runIdForSlot(slotKey)).run();
  } catch (error) {
    // Queue.send() resolving means Cloudflare has durably accepted the message.
    // A later D1 status-write failure must never be reclassified as a send failure.
    await recordRuntimeEvent(env, {
      eventType: "plan.enqueue_state_write_failed",
      messageType: "content.plan",
      slotKey,
      errorClass: safeRuntimeErrorClass(error, "enqueue_state_write_failed"),
    });
  }
  return true;
}

async function recoverPendingPlanRuns(env, limit = 20) {
  if (!env.DB || !env.AUTOMATION_QUEUE) return 0;
  await ensureSchema(env.DB);
  const queuedStaleCutoff = addSecondsIso(new Date().toISOString(), -2 * 60);
  const rows = await env.DB.prepare(
    "SELECT slot_key FROM hermes_automation_runs WHERE account_key=? AND platform=? AND (status='plan_enqueue_failed' OR (status='queued' AND created_at<=?)) ORDER BY created_at ASC LIMIT ?"
  ).bind(ACCOUNT_KEY, PLATFORM, queuedStaleCutoff, Math.max(1, Math.min(50, Number(limit) || 20))).all();
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
    const completedAt = new Date().toISOString();
    const completed = await env.DB.prepare(
      "UPDATE hermes_automation_runs SET status='dry_run_ready',updated_at=? WHERE id=? AND status!='dry_run_ready'"
    ).bind(completedAt, runIdForSlot(slotKey)).run();
    return {
      status: "dry_run_ready",
      duplicate: Number(completed?.meta?.changes || 0) === 0,
      candidate,
    };
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
      const nextReadbackAt = addSecondsIso(now, 4200 + 15 * 60);
      await env.DB.batch([
        env.DB.prepare("UPDATE hermes_automation_publications SET status=?,readback_attempt=0,next_readback_at=?,last_error_class=?,updated_at=? WHERE idempotency_key=?")
          .bind(status, nextReadbackAt, published.error_class, now, candidate.idempotency_key),
        env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
          .bind(status, published.error_class, now, candidate.content_id),
        env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
          .bind(status, published.error_class, now, runIdForSlot(slotKey)),
      ]);
      try {
        await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: candidate.content_id }, { delaySeconds: 4200 });
      } catch {
        const recoveryAt = addSecondsIso(new Date().toISOString(), 5 * 60);
        await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='unknown_outcome_readback_enqueue_failed',updated_at=? WHERE content_id=?")
          .bind(recoveryAt, new Date().toISOString(), candidate.content_id).run();
      }
      return { status, candidate, error_class: published.error_class };
    }

    const status = "failed";
    await env.DB.batch([
      env.DB.prepare("UPDATE hermes_automation_publications SET status=?,last_error_class=?,updated_at=? WHERE idempotency_key=?")
        .bind(status, published.error_class, now, candidate.idempotency_key),
      env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
        .bind(status, published.error_class, now, candidate.content_id),
      env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
        .bind(status, published.error_class, now, runIdForSlot(slotKey)),
    ]);
    return { status, candidate, error_class: published.error_class };
  }

  const nextReadbackAt = addSecondsIso(now, 4200 + 15 * 60);
  await env.DB.batch([
    env.DB.prepare("UPDATE hermes_automation_publications SET status='provider_accepted_readback_pending',readback_attempt=0,next_readback_at=?,updated_at=? WHERE idempotency_key=?")
      .bind(nextReadbackAt, now, candidate.idempotency_key),
    env.DB.prepare("UPDATE hermes_automation_content SET state='provider_accepted_readback_pending',updated_at=? WHERE content_id=?")
      .bind(now, candidate.content_id),
    env.DB.prepare("UPDATE hermes_automation_runs SET status='provider_accepted_readback_pending',updated_at=? WHERE id=?")
      .bind(now, runIdForSlot(slotKey)),
  ]);

  try {
    await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: candidate.content_id }, { delaySeconds: 4200 });
  } catch {
    // Provider write has already happened. Never retry the publish step merely
    // because queue scheduling failed; move only the readback recovery deadline forward.
    const recoveryAt = addSecondsIso(new Date().toISOString(), 5 * 60);
    await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='readback_enqueue_failed',updated_at=? WHERE content_id=?")
      .bind(recoveryAt, new Date().toISOString(), candidate.content_id).run();
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
    await env.DB.batch([
      env.DB.prepare("UPDATE hermes_automation_publications SET status='published_verified',provider_post_id=?,permalink=?,last_error_class=NULL,updated_at=? WHERE content_id=?")
        .bind(readback.provider_post_id, readback.permalink || null, now, contentId),
      env.DB.prepare("UPDATE hermes_automation_content SET state='published_verified',provider_post_id=?,permalink=?,last_error_class=NULL,updated_at=? WHERE content_id=?")
        .bind(readback.provider_post_id, readback.permalink || null, now, contentId),
      env.DB.prepare("UPDATE hermes_automation_runs SET status='published_verified',last_error_class=NULL,updated_at=? WHERE id=?")
        .bind(now, runIdForSlot(String(row.slot_key || ""))),
    ]);
    return { status: "published_verified", provider_post_id: readback.provider_post_id, permalink: readback.permalink || null };
  }

  if (attempt < 4) {
    const errorClass = readback.ok ? "post_not_visible_yet" : readback.error_class;
    const nextReadbackAt = addSecondsIso(now, 3600 + 15 * 60);
    await env.DB.prepare("UPDATE hermes_automation_publications SET readback_attempt=?,next_readback_at=?,last_error_class=?,updated_at=? WHERE content_id=? AND status=?")
      .bind(attempt, nextReadbackAt, errorClass, now, contentId, pendingStatus).run();
    try {
      await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: contentId }, { delaySeconds: 3600 });
    } catch {
      // The provider write is already immutable; only accelerate the readback recovery scan.
      const recoveryAt = addSecondsIso(new Date().toISOString(), 5 * 60);
      await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='readback_enqueue_failed',updated_at=? WHERE content_id=? AND status=?")
        .bind(recoveryAt, new Date().toISOString(), contentId, pendingStatus).run();
    }
    return { status: "provider_accepted_readback_pending", readback_attempt: attempt, error_class: errorClass };
  }

  const errorClass = readback.ok ? "provider_readback_not_found" : readback.error_class;
  const terminalStatus = pendingStatus === "unknown_outcome_readback_pending"
    ? "unknown_outcome_unresolved"
    : "readback_unverified";
  await env.DB.batch([
    env.DB.prepare("UPDATE hermes_automation_publications SET status=?,readback_attempt=?,next_readback_at=NULL,last_error_class=?,updated_at=? WHERE content_id=?")
      .bind(terminalStatus, attempt, errorClass, now, contentId),
    env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?")
      .bind(terminalStatus, errorClass, now, contentId),
    env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?")
      .bind(terminalStatus, errorClass, now, runIdForSlot(String(row.slot_key || ""))),
  ]);
  return { status: terminalStatus, error_class: errorClass };
}

async function queueHealth(queue) {
  if (!queue || typeof queue.metrics !== "function") return { status: "unavailable" };
  try {
    const metrics = await queue.metrics();
    const backlogCount = metricNumberOrNull(metrics?.backlogCount);
    const backlogBytes = metricNumberOrNull(metrics?.backlogBytes);
    return {
      status: backlogCount === null || backlogBytes === null ? "partial_unknown" : "ok",
      backlog_count: backlogCount,
      backlog_bytes: backlogBytes,
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
    SELECT trigger_type,cron_expression,scheduled_at,observed_at,execution_lag_ms,chicago_slot_key,eligible,source_sha,automation_mode,publication_config,publication_enabled
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
  const normalizedLastHeartbeat = lastHeartbeat ? {
    ...lastHeartbeat,
    eligible: Number(lastHeartbeat.eligible) === 1,
    publication_enabled: Number(lastHeartbeat.publication_enabled) === 1,
  } : null;
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
    last_cron_wake: normalizedLastHeartbeat,
    last_success: lastSuccess || null,
    last_failure: lastFailure || null,
    last_run: last || null,
  };
}


function scheduledHealthSnapshotIdempotencyKey(scheduledAt) {
  return `hae:system.health.snapshot:${scheduledAt.toISOString().slice(0, 16)}`;
}

async function enqueueScheduledHealthSnapshot(env, scheduledAt) {
  return createGenericJob(env, {
    job_type: "system.health.snapshot",
    business_lane: "automation",
    account_key: ACCOUNT_KEY,
    project_key: "hae-hourly-health",
    priority: 40,
    max_attempts: 3,
    idempotency_key: scheduledHealthSnapshotIdempotencyKey(scheduledAt),
    policy_version: "hae-readonly-v1",
    payload: {
      trigger_type: "cron",
      scheduled_at: scheduledAt.toISOString(),
    },
  });
}

function roleContractScheduleEligible(contract, scheduledAt) {
  const cadence = Number(contract?.runtime_config?.cadence_hours || 0);
  if (!Number.isInteger(cadence) || cadence < 1 || cadence > 24) return false;
  return chicagoParts(scheduledAt).hour % cadence === 0;
}

function extractCanonicalFromHtml(html, pageUrl) {
  for (const tag of String(html || "").match(/<link\b[^>]*>/gi) || []) {
    if (!/\brel\s*=\s*["'][^"']*\bcanonical\b[^"']*["']/i.test(tag)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (!href) continue;
    try {
      return new URL(href, pageUrl).toString();
    } catch {
      return "";
    }
  }
  return "";
}

function htmlNoindex(html) {
  for (const tag of String(html || "").match(/<meta\b[^>]*>/gi) || []) {
    const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    if (name !== "robots") continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    if (/(^|[,\s])noindex([,\s]|$)/.test(content)) return true;
  }
  return false;
}

async function buildScheduledSearchPayload(contract) {
  const targets = Array.isArray(contract?.runtime_config?.target_urls)
    ? contract.runtime_config.target_urls.slice(0, 20)
    : [];
  if (!targets.length) throw new Error("search_contract_targets_missing");
  const pages = await Promise.all(targets.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "HermesAutomationEngine/1.0 search-readonly" },
      });
      const contentType = response.headers.get("content-type") || "";
      const html = contentType.toLowerCase().includes("text/html") ? await response.text() : "";
      const xRobots = String(response.headers.get("x-robots-tag") || "").toLowerCase();
      const canonical = extractCanonicalFromHtml(html, url);
      const indexable = response.status >= 200
        && response.status < 400
        && !/(^|[,\s])noindex([,\s]|$)/.test(xRobots)
        && !htmlNoindex(html);
      return {
        url,
        status: response.status,
        canonical,
        indexable,
        in_sitemap: null,
      };
    } catch {
      return {
        url,
        status: 599,
        canonical: "",
        indexable: false,
        in_sitemap: null,
      };
    }
  }));
  return { pages };
}

async function buildScheduledMarketingPayload(env, contract) {
  const requestedLimit = Number(contract?.runtime_config?.lookback_limit || 200);
  const limit = Math.max(1, Math.min(500, Number.isInteger(requestedLimit) ? requestedLimit : 200));
  const rows = await env.DB.prepare(
    "SELECT content_id,slot_key,body FROM hermes_automation_content ORDER BY updated_at DESC LIMIT ?"
  ).bind(limit).all();
  const items = [];
  for (const row of rows?.results || []) {
    const contentId = clean(row?.content_id, 200);
    const slotKey = clean(row?.slot_key, 200);
    if (!contentId || !slotKey || typeof row?.body !== "string" || !row.body.trim()) continue;
    items.push({
      content_id: contentId,
      slot_key: slotKey,
      body_fingerprint: await sha256HexText(row.body.replace(/\s+/g, " ").trim().toLowerCase()),
    });
  }
  return { items };
}

async function requiredTablesPresent(db, tableNames) {
  const names = tableNames.map((name) => clean(name, 120)).filter(Boolean);
  if (!names.length) return true;
  const placeholders = names.map(() => "?").join(",");
  const rows = await db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`
  ).bind(...names).all();
  const present = new Set((rows?.results || []).map((row) => String(row.name || "")));
  return names.every((name) => present.has(name));
}

async function buildScheduledLogisticsPayload(env, contract) {
  if (!await requiredTablesPresent(env.DB, ["hermes_load_sources", "hermes_load_records"])) {
    throw new Error("logistics_source_tables_missing");
  }
  const rows = await env.DB.prepare(`
    SELECT
      s.id AS source_id,
      COALESCE(MAX(r.last_seen_at), s.last_successful_sync) AS last_seen_at,
      MAX(r.expires_at) AS expires_at
    FROM hermes_load_sources s
    LEFT JOIN hermes_load_records r
      ON r.source_id = s.id AND r.status = 'active'
    WHERE s.read_enabled = 1
      AND s.ingest_enabled = 1
      AND s.status != 'revoked'
    GROUP BY s.id, s.last_successful_sync
    ORDER BY MAX(s.updated_at) DESC
    LIMIT 500
  `).all();
  return {
    sources: (rows?.results || []).map((row) => ({
      source_id: clean(row?.source_id, 200),
      last_seen_at: row?.last_seen_at || null,
      expires_at: row?.expires_at || null,
    })),
    max_age_minutes: Number(contract?.runtime_config?.max_age_minutes || 1440),
  };
}

function buildScheduledHaeSelfImprovementPayload(scheduledAt) {
  const observedAt = scheduledAt.toISOString();
  const registryEvidence = pluginRuntimeRegistryEvidenceStatus(observedAt, 24);
  const findings = [];
  const seenJobTypes = new Set();

  for (const contract of ROLE_CONTRACTS) {
    const sourceRef = `github://officeus-create/Hermes/runtime/role-contract/${contract.job_type}`;
    if (seenJobTypes.has(contract.job_type)) {
      findings.push({ finding_id: `duplicate-job-type:${contract.job_type}`, source_ref: sourceRef, category: "CONTRACT_DRIFT", severity: "P0", status: "OPEN", artifact_key: "workers/automation-engine/src/role-contracts.mjs", verified: true, writer_active: false, writer_state_verified: false, observed_at: observedAt });
    }
    seenJobTypes.add(contract.job_type);
    if (contract.permission_class !== "READ_ONLY") {
      findings.push({ finding_id: `permission-drift:${contract.job_type}`, source_ref: sourceRef, category: "CONTRACT_DRIFT", severity: "P0", status: "OPEN", artifact_key: "workers/automation-engine/src/role-contracts.mjs", verified: true, writer_active: false, writer_state_verified: false, observed_at: observedAt });
    }
    if (contract.semantic_required && Number(contract?.runtime_config?.max_cost_usd) !== 0) {
      findings.push({ finding_id: `semantic-budget-drift:${contract.job_type}`, source_ref: sourceRef, category: "CONTRACT_DRIFT", severity: "P0", status: "OPEN", artifact_key: "workers/automation-engine/src/role-contracts.mjs", verified: true, writer_active: false, writer_state_verified: false, observed_at: observedAt });
    }
  }

  if (!registryEvidence.fresh) {
    findings.push({
      finding_id: "plugin-runtime-registry-evidence-stale",
      source_ref: "github://officeus-create/Hermes/runtime/plugin-runtime-registry",
      category: "EVIDENCE_OVERCLAIM",
      severity: "P1",
      status: "OPEN",
      artifact_key: "workers/automation-engine/src/plugin-runtime-registry.mjs",
      verified: true,
      writer_active: false,
      writer_state_verified: false,
      observed_at: observedAt,
    });
  }

  return { observed_at: observedAt, coverage_complete: true, findings };
}

async function buildScheduledRoleContractPayload(env, contract, scheduledAt) {
  if (contract.job_type === "search.snapshot.evaluate") return buildScheduledSearchPayload(contract);
  if (contract.job_type === "marketing.content.dedupe.audit") return buildScheduledMarketingPayload(env, contract);
  if (contract.job_type === "logistics.source.freshness.audit") return buildScheduledLogisticsPayload(env, contract);
  if (contract.job_type === "ai.gateway.readiness.audit") {
    const providers = freeAiProviderSnapshot(env);
    return {
      binding_ready: Boolean(env?.AI && typeof env.AI.run === "function"),
      gateway_id_present: Boolean(clean(env?.AI_GATEWAY_ID, 200)),
      free_provider_ready: providers.some((provider) => provider.available),
      paid_fallback_enabled: false,
      budget_usd: 0,
    };
  }
  if (contract.job_type === "academy.english.practice.build") {
    const parts = chicagoParts(scheduledAt);
    return {
      lesson_date: `${parts.year}-${parts.month}-${parts.day}`,
      track: "LOGISTICS",
    };
  }
  if (contract.job_type === "hae.self.improvement.audit") {
    return buildScheduledHaeSelfImprovementPayload(scheduledAt);
  }
  throw new Error("scheduled_role_contract_not_supported");
}

async function enqueueScheduledRoleContracts(env, scheduledAt) {
  const slotKey = chicagoSlotKey(scheduledAt);
  const managedJobTypes = await ownerManagedJobTypes(env.DB);
  const eligibleContracts = ROLE_CONTRACTS.filter(
    (contract) => !contract.semantic_required && roleContractScheduleEligible(contract, scheduledAt)
      && !managedJobTypes.has(contract.job_type),
  );
  const outcomes = await Promise.all(eligibleContracts.map(async (contract) => {
    try {
      const payload = await buildScheduledRoleContractPayload(env, contract, scheduledAt);
      await createGenericJob(env, {
        job_type: contract.job_type,
        account_key: ACCOUNT_KEY,
        project_key: "hae-plugin-role-runtime",
        priority: 45,
        max_attempts: 3,
        idempotency_key: `hae:role:${contract.job_type}:${slotKey}`,
        policy_version: "hae-role-contract-v1",
        payload: {
          ...payload,
          trigger_type: "cron",
          scheduled_at: scheduledAt.toISOString(),
        },
      });
      return 1;
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.role_contract_submit_failed",
        messageType: `role:${contract.job_type}`,
        slotKey,
        errorClass: safeRuntimeErrorClass(error, "role_contract_submit_failed"),
      });
      return 0;
    }
  }));
  return outcomes.reduce((sum, value) => sum + value, 0);
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
      await recordCronHeartbeat(env, scheduledAt, observedAt, eligible, controller?.cron);
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.heartbeat_write_failed",
        slotKey: chicagoSlotKey(scheduledAt),
        errorClass: safeRuntimeErrorClass(error, "heartbeat_write_failed"),
      });
    }

    try {
      await enqueueScheduledHealthSnapshot(env, scheduledAt);
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.system_health_snapshot_failed",
        messageType: "job.execute",
        slotKey: chicagoSlotKey(scheduledAt),
        errorClass: safeRuntimeErrorClass(error, "scheduled_health_snapshot_failed"),
      });
    }

    try {
      await enqueueScheduledRoleContracts(env, scheduledAt);
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.role_contract_batch_failed",
        slotKey: chicagoSlotKey(scheduledAt),
        errorClass: safeRuntimeErrorClass(error, "scheduled_role_contract_batch_failed"),
      });
    }

    try {
      await enqueueDueOwnerProcesses(env, scheduledAt, {
        createJob: createGenericJob,
        buildPayload: buildScheduledRoleContractPayload,
        contractForJobType: roleContractForJobType,
        accountKey: ACCOUNT_KEY,
      });
    } catch (error) {
      await recordRuntimeEvent(env, {
        eventType: "cron.owner_process_batch_failed",
        slotKey: chicagoSlotKey(scheduledAt),
        errorClass: safeRuntimeErrorClass(error, "owner_process_batch_failed"),
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
      ["cron.recover_capability_graphs_failed", recoverCapabilityGraphs],
      ["cron.recover_dlq_owner_alerts_failed", recoverPendingDlqOwnerAlerts],
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
    if (batch?.queue === "hermes-automation-dlq") {
      for (const item of batch.messages) {
        try {
          const outcome = await processDlqMessage(env, item);
          await recordRuntimeEvent(env, {
            eventType: "dlq.processed",
            queueName: batch?.queue,
            queueMessageId: item?.id,
            messageSentAt: item?.timestamp,
            messageType: item?.body?.type,
            jobId: item?.body?.job_id,
            contentId: item?.body?.content_id,
            attemptCount: item?.attempts,
            errorClass: outcome?.disposition === "OWNER_ACTION" || outcome?.disposition === "QUARANTINE"
              ? `dlq_${String(outcome.disposition || "").toLowerCase()}`
              : null,
          });
          item.ack();
        } catch (error) {
          await recordRuntimeEvent(env, {
            eventType: "dlq.process_retry",
            queueName: batch?.queue,
            queueMessageId: item?.id,
            messageSentAt: item?.timestamp,
            messageType: item?.body?.type,
            jobId: item?.body?.job_id,
            contentId: item?.body?.content_id,
            attemptCount: item?.attempts,
            errorClass: safeRuntimeErrorClass(error, "dlq_runtime_failed"),
          });
          item.retry();
        }
      }
      return;
    }

    for (const item of batch.messages) {
      const payload = item.body || {};
      const messageType = clean(payload?.type, 80) || "UNKNOWN";
      try {
        if (messageType === "github.ci.audit") {
          // The canonical GitHub Actions producer authenticates the exact run and
          // commit with its ephemeral token, then sends only a minimized snapshot
          // through the private Cloudflare Queue. The Worker receives no GitHub
          // credential and independently enforces deployed-main + D1 writer lease.
          if (!env.DB) throw new Error("database_not_configured");
          await ensureSchema(env.DB);
          const authenticated = await verifyGithubCIQueueEnvelope(payload, {
            db: env.DB,
            deployedSourceSha: clean(env.HERMES_AUTOMATION_SOURCE_SHA, 80),
          });
          await createGenericJob(env, authenticated);
          item.ack();
          continue;
        }
        if (messageType === "github.ci.patch.propose") {
          // READ_ONLY patch proposal intake. The source must bind to a persisted
          // successful HOLD_REPAIR packet and the exact deployed HAE source SHA.
          // This can create only an internal semantic candidate job in D1/Queue.
          if (!env.DB) throw new Error("database_not_configured");
          await ensureSchema(env.DB);
          const authenticated = await verifyGithubCIPatchProposalEnvelope(payload, {
            db: env.DB,
            deployedSourceSha: clean(env.HERMES_AUTOMATION_SOURCE_SHA, 80),
          });
          await createGenericJob(env, authenticated);
          item.ack();
          continue;
        }
        if (messageType === "github.ci.qa.verify") {
          // Independent GitHub Actions QA runs in a separate job/context. The
          // Worker trusts no caller verdict until exact deployed-main, repair,
          // proposal, patch digest and QA identity all reconcile against D1.
          if (!env.DB) throw new Error("database_not_configured");
          await ensureSchema(env.DB);
          const authenticated = await verifyGithubCIIndependentQaEnvelope(payload, {
            db: env.DB,
            deployedSourceSha: clean(env.HERMES_AUTOMATION_SOURCE_SHA, 80),
          });
          await materializeIndependentQaReceipt(env.DB, authenticated);
          item.ack();
          continue;
        }
        if (messageType === "job.submit.runtime_proof") {
          await submitRuntimeProofJob(env, payload);
          item.ack();
          continue;
        }
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
        role_contract_job_types: Array.from(ROLE_CONTRACT_JOB_TYPES),
        normal_loop_requires_paid_ai: false,
        scheduled_role_contracts: true,
        role_contract_cadence: "per-contract; current deterministic slice every 6 hours",
        free_semantic_only: true,
        paid_ai_fallback_enabled: false,
        dlq_runtime_consumer: true,
        dlq_external_alert_delivery_verified: false,
        ai_cost_ledger: true,
        default_semantic_budget_usd: 0,
        capability_graphs: true,
        capability_graph_permission_class: CAPABILITY_GRAPH_LIMITS.permission_class,
        capability_graph_max_nodes: CAPABILITY_GRAPH_LIMITS.max_nodes,
        structured_kpi_completion: true,
        self_improvement_audit: true,
        self_improvement_automatic_source_changes: false,
        self_improvement_automatic_merge: false,
        self_improvement_automatic_deploy: false,
        free_ai_providers: freeAiProviderSnapshot(env).map(({ id, available, configured, model, reason }) => ({
          id, available, configured, model, reason,
        })),
        provider_transport: "windsor_connectors_api",
        provider_configured: Boolean(windsorThreadsConfig(env)),
        publication_enabled: publicationEnabled(env),
      });
    }
    if (request.method === "GET" && url.pathname === "/v1/plugin-runtime-registry") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      return json(200, { success: true, ...pluginRuntimeRegistrySnapshot() });
    }

    if (request.method === "POST" && url.pathname === "/v1/capability-graphs") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB || !env.AUTOMATION_QUEUE) return json(503, { success: false, error: "runtime_not_configured" });
      const body = await request.json().catch(() => ({}));
      try {
        const created = await createCapabilityGraph(env, body, CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES);
        await dispatchCapabilityGraphReadyNodes(env, created.graph_id);
        const snapshot = await getCapabilityGraph(env, created.graph_id);
        return json(created.created ? 202 : 200, {
          success: true,
          ...created,
          snapshot,
        });
      } catch (error) {
        const code = safeRuntimeErrorClass(error, "graph_create_failed");
        const status = code === "graph_idempotency_conflict" ? 409 : code.startsWith("graph_") ? 400 : 500;
        return json(status, { success: false, error: code });
      }
    }

    if (request.method === "GET" && url.pathname.startsWith("/v1/capability-graphs/")) {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB) return json(503, { success: false, error: "runtime_not_configured" });
      let graphId = "";
      try {
        graphId = clean(decodeURIComponent(url.pathname.slice("/v1/capability-graphs/".length)), 160);
      } catch {
        return json(400, { success: false, error: "graph_id_invalid" });
      }
      if (!graphId) return json(400, { success: false, error: "graph_id_invalid" });
      const snapshot = await getCapabilityGraph(env, graphId);
      if (!snapshot) return json(404, { success: false, error: "graph_not_found" });
      return json(200, { success: true, ...snapshot });
    }

    if (request.method === "GET" && url.pathname === "/v1/role-contracts") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      const contracts = await Promise.all(ROLE_CONTRACTS.map(async (contract) => ({
        role_id: contract.role_id,
        plugin_version: contract.plugin_version,
        contract_version: contract.contract_version,
        job_type: contract.job_type,
        business_lane: contract.business_lane,
        permission_class: contract.permission_class,
        semantic_required: contract.semantic_required,
        free_ai_policy: contract.free_ai_policy,
        sha256: await roleContractSha256(contract),
      })));
      return json(200, {
        success: true,
        engine: "hermes-automation-engine",
        paid_fallback_enabled: false,
        contracts,
      });
    }
    if (request.method === "GET" && url.pathname === "/v1/schedule-migrations") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      return json(200, {
        success: true,
        engine: "hermes-automation-engine",
        ...taskMigrationSnapshot(ROLE_CONTRACT_JOB_TYPES),
      });
    }
    if (request.method === "GET" && url.pathname === "/v1/ai-usage") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB) return json(503, { success: false, error: "runtime_not_configured" });
      const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50) || 50));
      return json(200, { success: true, ...(await aiUsageLedgerSnapshot(env, limit)) });
    }
    if (request.method === "GET" && url.pathname === "/v1/dlq-runtime") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB) return json(503, { success: false, error: "runtime_not_configured" });
      const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50) || 50));
      return json(200, { success: true, ...(await dlqRuntimeSnapshot(env, limit)) });
    }
    if (request.method === "GET" && url.pathname === "/v1/health") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      return json(200, { success: true, ...(await health(env)) });
    }
    if (request.method === "POST" && url.pathname === "/v1/jobs") {
      if (!authorized(request, env)) return json(401, { success: false, error: "unauthorized" });
      if (!env.DB || !env.AUTOMATION_QUEUE) return json(503, { success: false, error: "runtime_not_configured" });
      const body = await request.json().catch(() => ({}));
      if (Object.hasOwn(body || {}, "internal_submission")) {
        return json(400, { success: false, error: "internal_submission_forbidden" });
      }
      try {
        const created = await createGenericJob(env, body);
        return json(created.created ? 202 : 200, { success: true, ...created });
      } catch (error) {
        const code = safeRuntimeErrorClass(error, "job_create_failed");
        const status = code === "idempotency_key_conflict"
          ? 409
          : ["historical_", "search_", "marketing_", "source_", "work_", "dispatch_", "knowledge_", "technology_", "gateway_", "growth_", "market_", "mention_", "academy_"].some((prefix) => code.startsWith(prefix)) || ["job_type_not_allowed", "business_lane_required", "role_contract_business_lane_mismatch", "semantic_job_internal_only", "idempotency_key_required", "payload_not_serializable", "payload_too_large", "max_age_minutes_invalid"].includes(code) ? 400 : 500;
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
