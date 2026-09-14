import { ensureHrSchema } from "./hr.mjs";

export const HR_COMMUNICATION_CHANNELS = Object.freeze([
  "email",
  "telegram",
  "website",
  "academy",
  "meet",
  "internal",
]);

export const HR_COMMUNICATION_STAGES = Object.freeze([
  "EMAIL_RECEIVED",
  "NEEDS_REPLY",
  "WAITING_CANDIDATE",
  "MOVED_TO_TELEGRAM",
  "ASSESSMENT",
  "TRAINING_REVIEW",
  "ACADEMY_ROUTE",
  "DIRECT_HIRE_REVIEW",
  "ACCEPTED",
  "DECLINED",
  "CLOSED",
]);

export const HR_NEXT_ACTIONS = Object.freeze([
  "TRIAGE",
  "REPLY",
  "WAIT_CANDIDATE",
  "HANDOFF_TELEGRAM",
  "ASSIGN_ASSESSMENT",
  "REVIEW_ASSESSMENT",
  "ROUTE_ACADEMY",
  "REVIEW_DIRECT_HIRE",
  "FINALIZE_DECISION",
  "NONE",
]);

export const HR_NEXT_ACTION_OWNERS = Object.freeze([
  "HR",
  "CANDIDATE",
  "TRAINER",
  "ACADEMY",
  "HIRING_OWNER",
  "NONE",
]);

const TERMINAL_STAGES = new Set(["ACCEPTED", "DECLINED", "CLOSED"]);

const TRANSITIONS = new Map([
  ["EMAIL_RECEIVED", new Set(["NEEDS_REPLY", "WAITING_CANDIDATE", "MOVED_TO_TELEGRAM", "CLOSED"])],
  ["NEEDS_REPLY", new Set(["WAITING_CANDIDATE", "MOVED_TO_TELEGRAM", "ASSESSMENT", "CLOSED"])],
  ["WAITING_CANDIDATE", new Set(["NEEDS_REPLY", "MOVED_TO_TELEGRAM", "ASSESSMENT", "CLOSED"])],
  ["MOVED_TO_TELEGRAM", new Set(["ASSESSMENT", "TRAINING_REVIEW", "CLOSED"])],
  ["ASSESSMENT", new Set(["TRAINING_REVIEW", "CLOSED"])],
  ["TRAINING_REVIEW", new Set(["ACADEMY_ROUTE", "DIRECT_HIRE_REVIEW", "CLOSED"])],
  ["ACADEMY_ROUTE", new Set(["ACCEPTED", "DECLINED", "CLOSED"])],
  ["DIRECT_HIRE_REVIEW", new Set(["ACCEPTED", "DECLINED", "CLOSED"])],
  ["ACCEPTED", new Set()],
  ["DECLINED", new Set()],
  ["CLOSED", new Set()],
]);

export function isHrCommunicationChannel(value) {
  return HR_COMMUNICATION_CHANNELS.includes(String(value || ""));
}

export function isHrCommunicationStage(value) {
  return HR_COMMUNICATION_STAGES.includes(String(value || ""));
}

export function isHrNextAction(value) {
  return HR_NEXT_ACTIONS.includes(String(value || ""));
}

export function isHrNextActionOwner(value) {
  return HR_NEXT_ACTION_OWNERS.includes(String(value || ""));
}

export function isHrTerminalCommunicationStage(value) {
  return TERMINAL_STAGES.has(String(value || ""));
}

export function canHrCommunicationTransition(fromStage, toStage) {
  const from = String(fromStage || "");
  const to = String(toStage || "");
  return Boolean(TRANSITIONS.get(from)?.has(to));
}

export function validateHrCommunicationAction(stage, nextAction, nextActionOwner) {
  const terminal = isHrTerminalCommunicationStage(stage);
  if (terminal) return nextAction === "NONE" && nextActionOwner === "NONE";
  return isHrNextAction(nextAction)
    && nextAction !== "NONE"
    && isHrNextActionOwner(nextActionOwner)
    && nextActionOwner !== "NONE";
}

export async function ensureHrCommunicationSchema(db) {
  await ensureHrSchema(db);

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_candidate_communication_state (
      candidate_id TEXT PRIMARY KEY,
      source_channel TEXT NOT NULL CHECK (source_channel IN ('email','telegram','website','academy','meet','internal')),
      current_channel TEXT NOT NULL CHECK (current_channel IN ('email','telegram','website','academy','meet','internal')),
      current_stage TEXT NOT NULL CHECK (current_stage IN ('EMAIL_RECEIVED','NEEDS_REPLY','WAITING_CANDIDATE','MOVED_TO_TELEGRAM','ASSESSMENT','TRAINING_REVIEW','ACADEMY_ROUTE','DIRECT_HIRE_REVIEW','ACCEPTED','DECLINED','CLOSED')),
      next_action TEXT NOT NULL CHECK (next_action IN ('TRIAGE','REPLY','WAIT_CANDIDATE','HANDOFF_TELEGRAM','ASSIGN_ASSESSMENT','REVIEW_ASSESSMENT','ROUTE_ACADEMY','REVIEW_DIRECT_HIRE','FINALIZE_DECISION','NONE')),
      next_action_owner TEXT NOT NULL CHECK (next_action_owner IN ('HR','CANDIDATE','TRAINER','ACADEMY','HIRING_OWNER','NONE')),
      last_inbound_at TEXT,
      last_outbound_at TEXT,
      gmail_thread_ref TEXT,
      gmail_message_ref TEXT,
      telegram_handoff_ref TEXT,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_candidate_communication_events (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      from_stage TEXT,
      to_stage TEXT NOT NULL,
      from_channel TEXT,
      to_channel TEXT NOT NULL,
      next_action TEXT NOT NULL,
      next_action_owner TEXT NOT NULL,
      provider_ref TEXT,
      occurred_at TEXT NOT NULL,
      created_by_specialist_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_communication_stage ON hr_candidate_communication_state(current_stage,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_communication_events_candidate ON hr_candidate_communication_events(candidate_id,occurred_at)").run();
}

export async function getHrCommunicationState(db, candidateId) {
  await ensureHrCommunicationSchema(db);
  return db.prepare(`
    SELECT candidate_id,source_channel,current_channel,current_stage,next_action,next_action_owner,
           last_inbound_at,last_outbound_at,gmail_thread_ref,gmail_message_ref,telegram_handoff_ref,updated_at
    FROM hr_candidate_communication_state
    WHERE candidate_id = ?
    LIMIT 1
  `).bind(candidateId).first();
}

export async function getHrCommunicationEventByIdempotency(db, idempotencyKey) {
  await ensureHrCommunicationSchema(db);
  return db.prepare(`
    SELECT id,candidate_id,idempotency_key,from_stage,to_stage,from_channel,to_channel,
           next_action,next_action_owner,provider_ref,occurred_at,created_by_specialist_id,created_at
    FROM hr_candidate_communication_events
    WHERE idempotency_key = ?
    LIMIT 1
  `).bind(idempotencyKey).first();
}
