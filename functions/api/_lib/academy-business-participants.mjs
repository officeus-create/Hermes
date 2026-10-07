import { ensureAcademyLearnerProfile, ensureAcademySchema } from "./academy.mjs";
import { getAcademyBusinessCrmContext } from "./academy-business-crm.mjs";
import { ensureAcademyBusinessProgramsSchema } from "./academy-business-programs.mjs";

const INVITE_STATES = new Set(["issued","claimed","revoked","expired"]);
const PARTICIPANT_STATES = new Set(["enrolled","active","completed","alumni","withdrawn"]);
const SALE_STAGES = new Set(["enrolled","active","completed","renewal"]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

const clean = (value, max = 240) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const enumValue = (value, allowed, fallback) => {
  const normalized = clean(value, 60).toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.has(normalized) ? normalized : fallback;
};

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export async function ensureAcademyBusinessParticipantsSchema(db) {
  await ensureAcademyBusinessProgramsSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_participant_invites (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      crm_lead_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      cohort_id TEXT NOT NULL,
      claim_token_hash TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('issued','claimed','revoked','expired')),
      expires_at TEXT NOT NULL,
      claimed_specialist_id TEXT,
      claimed_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_participants (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      crm_lead_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      cohort_id TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('enrolled','active','completed','alumni','withdrawn')),
      source_invite_id TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, specialist_id, cohort_id)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_invites_company ON hermes_academy_business_participant_invites(company_id,state,expires_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_invites_lead ON hermes_academy_business_participant_invites(company_id,crm_lead_id,cohort_id,state)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_participants_company ON hermes_academy_business_participants(company_id,cohort_id,state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_participants_lead ON hermes_academy_business_participants(company_id,crm_lead_id,updated_at)").run();
}

export async function getAcademyBusinessParticipantsContext(request, env) {
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return ctx;
  await ensureAcademyBusinessParticipantsSchema(env.DB);
  return ctx;
}

export async function createParticipantClaimToken() {
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  return { token, hash: await sha256Hex(token) };
}

export function normalizeInviteInput(body) {
  const rawExpires = clean(body.expiresAt, 48);
  const parsed = rawExpires && Number.isFinite(Date.parse(rawExpires)) ? new Date(rawExpires).toISOString() : "";
  return {
    crmLeadId: clean(body.crmLeadId, 140),
    programId: clean(body.programId, 140),
    cohortId: clean(body.cohortId, 140),
    expiresAt: parsed,
  };
}

export function inviteInputErrors(value) {
  const errors = [];
  if (!value.crmLeadId) errors.push("participant_invite_lead_required");
  if (!value.programId) errors.push("participant_invite_program_required");
  if (!value.cohortId) errors.push("participant_invite_cohort_required");
  if (!value.expiresAt) errors.push("participant_invite_expiry_required");
  else if (Date.parse(value.expiresAt) <= Date.now()) errors.push("participant_invite_expiry_must_be_future");
  else if (Date.parse(value.expiresAt) > Date.now() + 90 * 24 * 60 * 60 * 1000) errors.push("participant_invite_expiry_too_far");
  return errors;
}

export function normalizeParticipantState(value, fallback = "enrolled") {
  return enumValue(value, PARTICIPANT_STATES, fallback);
}

export function safeParticipantInvite(row) {
  if (!row) return null;
  const now = Date.now();
  const derivedState = row.state === "issued" && Date.parse(String(row.expires_at || "")) <= now ? "expired" : row.state;
  return {
    id: String(row.id),
    crmLeadId: String(row.crm_lead_id),
    leadContactName: row.lead_contact_name || "",
    programId: String(row.program_id),
    programName: row.program_name || "",
    cohortId: String(row.cohort_id),
    cohortName: row.cohort_name || "",
    cohortCode: row.cohort_code || "",
    state: derivedState,
    expiresAt: row.expires_at,
    claimedSpecialistId: row.claimed_specialist_id || null,
    claimedAt: row.claimed_at || null,
    revokedAt: row.revoked_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function safeBusinessParticipant(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    specialistId: String(row.specialist_id),
    crmLeadId: String(row.crm_lead_id),
    leadContactName: row.lead_contact_name || "",
    programId: String(row.program_id),
    programName: row.program_name || "",
    cohortId: String(row.cohort_id),
    cohortName: row.cohort_name || "",
    cohortCode: row.cohort_code || "",
    state: row.state,
    joinedAt: row.joined_at,
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function requireParticipantInviteRelations(db, companyId, ownerId, value) {
  const lead = await db.prepare(`
    SELECT id,contact_name,business_stage,archived_at
    FROM hermes_academy_business_leads
    WHERE id=? AND company_id=? AND owner_specialist_id=? AND archived_at IS NULL
    LIMIT 1
  `).bind(value.crmLeadId, companyId, ownerId).first();
  if (!lead) return { error: "participant_invite_lead_not_found" };
  if (!SALE_STAGES.has(String(lead.business_stage))) return { error: "participant_invite_requires_enrolled_sale_stage" };

  const program = await db.prepare(`
    SELECT id,name,status,archived_at
    FROM hermes_academy_business_programs
    WHERE id=? AND company_id=? AND owner_specialist_id=? AND archived_at IS NULL
    LIMIT 1
  `).bind(value.programId, companyId, ownerId).first();
  if (!program) return { error: "participant_invite_program_not_found" };
  if (String(program.status) !== "active") return { error: "participant_invite_program_not_active" };

  const cohort = await db.prepare(`
    SELECT id,name,code,status,capacity,program_id,archived_at
    FROM hermes_academy_business_cohorts
    WHERE id=? AND program_id=? AND company_id=? AND owner_specialist_id=? AND archived_at IS NULL
    LIMIT 1
  `).bind(value.cohortId, value.programId, companyId, ownerId).first();
  if (!cohort) return { error: "participant_invite_cohort_not_found" };
  if (!["enrolling","active"].includes(String(cohort.status))) return { error: "participant_invite_cohort_not_open" };

  if (cohort.capacity !== null && cohort.capacity !== undefined) {
    const [participantCount, inviteCount] = await Promise.all([
      db.prepare(`
        SELECT COUNT(*) AS count
        FROM hermes_academy_business_participants
        WHERE company_id=? AND cohort_id=? AND state<>'withdrawn'
      `).bind(companyId,value.cohortId).first(),
      db.prepare(`
        SELECT COUNT(*) AS count
        FROM hermes_academy_business_participant_invites
        WHERE company_id=? AND cohort_id=? AND state='issued' AND expires_at>?
      `).bind(companyId,value.cohortId,new Date().toISOString()).first(),
    ]);
    if (Number(participantCount?.count || 0) + Number(inviteCount?.count || 0) >= Number(cohort.capacity)) {
      return { error: "participant_invite_cohort_capacity_reached" };
    }
  }

  return { lead, program, cohort };
}

export async function ensureBusinessLearnerProfile(db, specialistId) {
  await ensureAcademySchema(db);
  await ensureAcademyLearnerProfile(db, specialistId);
}
