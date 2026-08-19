import { isAcademyProgram } from "./academy.mjs";

export const ACADEMY_SUPPORT_THREAD_STATES = ["open", "answered", "closed"];
export const ACADEMY_SUPPORT_ACTIONS = ["answer", "close"];
export const ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR = 20;
export const ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR = 60;

export function isAcademySupportThreadState(value) {
  return ACADEMY_SUPPORT_THREAD_STATES.includes(String(value || ""));
}

export function isAcademySupportAction(value) {
  return ACADEMY_SUPPORT_ACTIONS.includes(String(value || ""));
}

export async function ensureAcademySupportSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_support_access (
      specialist_id TEXT PRIMARY KEY,
      active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
      program_scope TEXT CHECK (program_scope IS NULL OR program_scope IN ('us-logistics-operations','marketing')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_support_threads (
      id TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL CHECK (program_slug IN ('us-logistics-operations','marketing')),
      lesson_id TEXT,
      subject TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('open','answered','closed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS academy_support_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      author_specialist_id TEXT NOT NULL,
      author_kind TEXT NOT NULL CHECK (author_kind IN ('learner','authorized_support')),
      body_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_support_threads_learner ON academy_support_threads(specialist_id, updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_support_threads_program_state ON academy_support_threads(program_slug, state, updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_support_messages_thread ON academy_support_messages(thread_id, created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_support_messages_author_rate ON academy_support_messages(author_specialist_id, author_kind, created_at)").run();
}

export async function getAcademySupportAccess(db, specialistId) {
  return db.prepare(`
    SELECT specialist_id, active, program_scope, created_at, updated_at
    FROM academy_support_access
    WHERE specialist_id = ? AND active = 1
    LIMIT 1
  `).bind(specialistId).first();
}

export function academySupportCanAccessProgram(access, programSlug) {
  if (!access || Number(access.active) !== 1) return false;
  if (!isAcademyProgram(programSlug)) return false;
  return access.program_scope == null || access.program_scope === programSlug;
}

export async function academySupportMessageRateExceeded(db, specialistId, authorKind, limit, nowMs = Date.now()) {
  const since = new Date(nowMs - 60 * 60 * 1000).toISOString();
  const row = await db.prepare(`
    SELECT COUNT(*) AS message_count
    FROM academy_support_messages
    WHERE author_specialist_id = ? AND author_kind = ? AND created_at >= ?
  `).bind(specialistId, authorKind, since).first();
  return Number(row?.message_count || 0) >= Number(limit || 0);
}

export async function listAcademySupportMessages(db, threadIds) {
  if (!Array.isArray(threadIds) || threadIds.length === 0) return [];
  const placeholders = threadIds.map(() => "?").join(",");
  const result = await db.prepare(`
    SELECT id, thread_id, author_kind, body_text, created_at
    FROM academy_support_messages
    WHERE thread_id IN (${placeholders})
    ORDER BY created_at ASC
  `).bind(...threadIds).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export function attachAcademySupportMessages(threads, messages) {
  const byThread = new Map();
  for (const message of messages || []) {
    const list = byThread.get(message.thread_id) || [];
    list.push({
      id: message.id,
      author_kind: message.author_kind,
      body_text: message.body_text,
      created_at: message.created_at,
    });
    byThread.set(message.thread_id, list);
  }
  return (threads || []).map((thread) => ({
    ...thread,
    messages: byThread.get(thread.id) || [],
  }));
}

export async function listLearnerAcademySupportThreads(db, specialistId) {
  const result = await db.prepare(`
    SELECT id, program_slug, lesson_id, subject, state, created_at, updated_at
    FROM academy_support_threads
    WHERE specialist_id = ?
    ORDER BY updated_at DESC
    LIMIT 50
  `).bind(specialistId).all();
  const threads = Array.isArray(result?.results) ? result.results : [];
  const messages = await listAcademySupportMessages(db, threads.map((thread) => thread.id));
  return attachAcademySupportMessages(threads, messages);
}
