import {
  cleanHrAttribution,
  cleanHrLongText,
  cleanHrText,
  ensureHrSchema,
  getLatestHrReview,
  isHrCandidateId,
  isHrEmail,
  isHrEventId,
  isHrEvidenceId,
  isHrLanguage,
  isHrTrack,
  normalizeHrEmail,
  sha256Hex,
} from "../_lib/hr.mjs";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  DB?: any;
  HR_RATE_LIMITS?: KvNamespace;
  LEAD_LIMITS?: KvNamespace;
};

type Context = { request: Request; env: Env };

const MAIN_ORIGIN = "https://hermeslogisticsus.com";
const CONNECT_ORIGIN = "https://connect.hermeslogisticsus.com";
const ALLOWED_ORIGINS = new Set([MAIN_ORIGIN, CONNECT_ORIGIN]);
const MAX_BODY_BYTES = 80_000;
const START_RATE_LIMIT = 12;
const RATE_WINDOW_SECONDS = 60 * 60;
const SIGNAL_KEYS = new Set(["clarity", "evidence", "learning", "discovery", "application"]);
const RECOMMENDATION_CODES = new Set(["REVIEW_FOR_SUPERVISED_TEST", "ACADEMY_PRACTICE_RECOMMENDED"]);

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key, X-HR-Candidate-Token",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
});

const json = (origin: string, status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders(origin) });

function requestOrigin(request: Request) {
  return request.headers.get("Origin") || "";
}

function allowedOrigin(request: Request) {
  const origin = requestOrigin(request);
  return ALLOWED_ORIGINS.has(origin) ? origin : "";
}

function candidateToken(request: Request) {
  const value = cleanHrText(request.headers.get("X-HR-Candidate-Token"), 220);
  return value.length >= 48 ? value : "";
}

function isIsoTime(value: unknown) {
  const text = cleanHrText(value, 48);
  return text && !Number.isNaN(Date.parse(text)) ? text : "";
}

function safeJson(value: unknown, max = 2400) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "{}";
  try {
    const text = JSON.stringify(value);
    return text.length <= max ? text : "{}";
  } catch {
    return "{}";
  }
}

function safeSignals(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!SIGNAL_KEYS.has(key)) continue;
    const number = Number(raw);
    if (Number.isFinite(number)) result[key] = Math.max(0, Math.min(100, Math.round(number)));
  }
  return Object.keys(result).length ? result : null;
}

async function readJson(request: Request, origin: string) {
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return { error: json(origin, 415, { success: false, error: "content_type_required" }) } as const;
  }
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return { error: json(origin, 413, { success: false, error: "request_too_large" }) } as const;
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return { error: json(origin, 413, { success: false, error: "request_too_large" }) } as const;
  }
  try {
    return { body: JSON.parse(raw) as Record<string, unknown> } as const;
  } catch {
    return { error: json(origin, 400, { success: false, error: "invalid_json" }) } as const;
  }
}

async function candidateById(db: any, candidateId: string) {
  return db.prepare(`
    SELECT id,access_token_hash,name,email,telegram_handle,country,language,source,track,
           specialist_id,status,created_at,updated_at
    FROM hr_candidates
    WHERE id = ?
    LIMIT 1
  `).bind(candidateId).first();
}

async function requireCandidate(request: Request, env: Env, origin: string, candidateId: string) {
  if (!env.DB) return { error: json(origin, 503, { success: false, error: "database_not_configured" }) } as const;
  if (!isHrCandidateId(candidateId)) return { error: json(origin, 400, { success: false, error: "candidate_id_invalid" }) } as const;
  const token = candidateToken(request);
  if (!token) return { error: json(origin, 401, { success: false, error: "candidate_token_required" }) } as const;
  await ensureHrSchema(env.DB);
  const candidate = await candidateById(env.DB, candidateId);
  if (!candidate) return { error: json(origin, 404, { success: false, error: "candidate_not_found" }) } as const;
  if (candidate.access_token_hash !== await sha256Hex(token)) {
    return { error: json(origin, 403, { success: false, error: "candidate_token_invalid" }) } as const;
  }
  return { candidate } as const;
}

export async function onRequestOptions({ request }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN, 403, { success: false, error: "origin_not_allowed" });
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost({ request, env }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN, 403, { success: false, error: "origin_not_allowed" });
  if (!env.DB) return json(origin, 503, { success: false, error: "database_not_configured" });
  const rateLimits = env.HR_RATE_LIMITS || env.LEAD_LIMITS;
  if (!rateLimits) return json(origin, 503, { success: false, error: "rate_limit_not_configured" });

  const parsed = await readJson(request, origin);
  if ("error" in parsed) return parsed.error;
  const input = parsed.body;

  const candidateId = cleanHrText(input.candidate_id, 120);
  const headerId = cleanHrText(request.headers.get("Idempotency-Key"), 120);
  const token = candidateToken(request);
  const name = cleanHrText(input.name, 120);
  const email = normalizeHrEmail(input.email);
  const telegramHandle = cleanHrText(input.telegram_handle, 120) || null;
  const country = cleanHrText(input.country, 120);
  const language = cleanHrText(input.language, 8);
  const source = cleanHrText(input.source, 80);
  const track = cleanHrText(input.track, 40);
  const consent = input.consent === true;
  const attribution = cleanHrAttribution(input.attribution);
  const submittedAt = isIsoTime(input.submitted_at) || new Date().toISOString();

  if (!isHrCandidateId(candidateId) || candidateId !== headerId) {
    return json(origin, 400, { success: false, error: "candidate_id_invalid" });
  }
  if (!token) return json(origin, 401, { success: false, error: "candidate_token_required" });
  if (name.length < 2 || !isHrEmail(email) || !country || !source || !isHrLanguage(language) || !isHrTrack(track) || !consent) {
    return json(origin, 400, { success: false, error: "candidate_intake_invalid" });
  }

  await ensureHrSchema(env.DB);
  const tokenHash = await sha256Hex(token);
  const existing = await candidateById(env.DB, candidateId);
  if (existing) {
    if (existing.access_token_hash !== tokenHash || existing.email !== email) {
      return json(origin, 409, { success: false, error: "candidate_id_conflict" });
    }
    return json(origin, 200, { success: true, duplicate: true, candidate_id: candidateId, status: existing.status });
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `hr:start:${await sha256Hex(clientAddress)}`;
  const currentRate = Number(await rateLimits.get(rateKey) || "0");
  if (currentRate >= START_RATE_LIMIT) {
    return json(origin, 429, { success: false, error: "rate_limit_exceeded" });
  }

  const now = new Date().toISOString();
  const sessionId = `hr-session-${crypto.randomUUID()}`;
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO hr_candidates
        (id,access_token_hash,name,email,telegram_handle,country,language,source,track,
         attribution_json,consent_at,specialist_id,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,NULL,'interviewing',?,?)
    `).bind(
      candidateId, tokenHash, name, email, telegramHandle, country, language, source, track,
      JSON.stringify(attribution), submittedAt, now, now,
    ),
    env.DB.prepare(`
      INSERT INTO hr_interview_sessions
        (id,candidate_id,track,state,started_at,completed_at,practice_signals_json,recommendation_code,updated_at)
      VALUES (?,?,?,'in_progress',?,NULL,NULL,NULL,?)
    `).bind(sessionId, candidateId, track, submittedAt, now),
  ]);
  await rateLimits.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS });

  return json(origin, 201, { success: true, duplicate: false, candidate_id: candidateId, session_id: sessionId, status: "interviewing" });
}

export async function onRequestPut({ request, env }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN, 403, { success: false, error: "origin_not_allowed" });
  const parsed = await readJson(request, origin);
  if ("error" in parsed) return parsed.error;
  const input = parsed.body;
  const candidateId = cleanHrText(input.candidate_id, 120);
  const required = await requireCandidate(request, env, origin, candidateId);
  if ("error" in required) return required.error;

  const candidate = required.candidate;
  const session = await env.DB.prepare(`
    SELECT id,state FROM hr_interview_sessions WHERE candidate_id = ? LIMIT 1
  `).bind(candidateId).first();
  if (!session) return json(origin, 409, { success: false, error: "interview_session_missing" });

  const answers = Array.isArray(input.answers) ? input.answers.slice(0, 24) : [];
  const events = Array.isArray(input.events) ? input.events.slice(0, 100) : [];
  const statements: any[] = [];

  for (const raw of answers) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const evidenceId = cleanHrText(row.evidence_id, 140);
    const questionId = cleanHrText(row.id || row.question_id, 120);
    const phase = cleanHrText(row.phase, 80);
    const parentQuestionId = cleanHrText(row.parent_question_id, 120) || null;
    const answerText = cleanHrLongText(row.answer, 4000);
    const submittedAt = isIsoTime(row.answered_at || row.submitted_at);
    if (!isHrEvidenceId(evidenceId) || !questionId || !phase || answerText.length < 15 || !submittedAt) continue;
    statements.push(env.DB.prepare(`
      INSERT OR IGNORE INTO hr_interview_answers
        (id,candidate_id,session_id,question_id,phase,parent_question_id,answer_text,submitted_at)
      VALUES (?,?,?,?,?,?,?,?)
    `).bind(evidenceId, candidateId, session.id, questionId, phase, parentQuestionId, answerText, submittedAt));
  }

  for (const raw of events) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const eventId = cleanHrText(row.event_id, 140);
    const type = cleanHrText(row.type, 100);
    const occurredAt = isIsoTime(row.occurred_at);
    if (!isHrEventId(eventId) || !type || !occurredAt) continue;
    statements.push(env.DB.prepare(`
      INSERT OR IGNORE INTO hr_events
        (id,candidate_id,session_id,type,occurred_at,payload_json)
      VALUES (?,?,?,?,?,?)
    `).bind(eventId, candidateId, session.id, type, occurredAt, safeJson(row.payload)));
  }

  if (statements.length) await env.DB.batch(statements);

  const signals = safeSignals(input.practice_signals);
  const recommendationCode = cleanHrText((input.development_recommendation as Record<string, unknown> | undefined)?.code, 80);
  const completedAt = isIsoTime(input.completed_at);
  const now = new Date().toISOString();

  if (completedAt) {
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE hr_interview_sessions
        SET state='completed',completed_at=?,practice_signals_json=?,recommendation_code=?,updated_at=?
        WHERE candidate_id=?
      `).bind(
        completedAt,
        signals ? JSON.stringify(signals) : null,
        RECOMMENDATION_CODES.has(recommendationCode) ? recommendationCode : null,
        now,
        candidateId,
      ),
      env.DB.prepare(`
        UPDATE hr_candidates
        SET status=CASE WHEN status='interviewing' THEN 'completed' ELSE status END,updated_at=?
        WHERE id=?
      `).bind(now, candidateId),
    ]);
  } else {
    await env.DB.prepare(`UPDATE hr_interview_sessions SET updated_at=? WHERE candidate_id=?`).bind(now, candidateId).run();
  }

  return json(origin, 200, {
    success: true,
    candidate_id: candidateId,
    accepted_answers: answers.length,
    accepted_events: events.length,
    completed: Boolean(completedAt),
    status: completedAt && candidate.status === "interviewing" ? "completed" : candidate.status,
  });
}

export async function onRequestGet({ request, env }: Context) {
  const origin = allowedOrigin(request);
  if (!origin) return json(MAIN_ORIGIN, 403, { success: false, error: "origin_not_allowed" });
  const candidateId = cleanHrText(new URL(request.url).searchParams.get("candidate_id"), 120);
  const required = await requireCandidate(request, env, origin, candidateId);
  if ("error" in required) return required.error;
  const candidate = required.candidate;
  const review = await getLatestHrReview(env.DB, candidateId);
  const academyLink = await env.DB.prepare(`
    SELECT program_slug,enrollment_id,state,updated_at
    FROM hr_academy_links
    WHERE candidate_id=?
    LIMIT 1
  `).bind(candidateId).first();
  return json(origin, 200, {
    success: true,
    candidate_id: candidateId,
    status: candidate.status,
    claimed: Boolean(candidate.specialist_id),
    review: review ? { outcome: review.outcome, created_at: review.created_at } : null,
    academy_link: academyLink || null,
  });
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "GET") return onRequestGet(context);
  const origin = allowedOrigin(context.request) || MAIN_ORIGIN;
  return json(origin, 405, { success: false, error: "method_not_allowed" });
}
