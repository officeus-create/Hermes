import { jsonResponse } from "../../_lib/session.mjs";
import {
  createParticipantClaimToken,
  getAcademyBusinessParticipantsContext,
  inviteInputErrors,
  normalizeInviteInput,
  normalizeParticipantState,
  requireParticipantInviteRelations,
  safeBusinessParticipant,
  safeParticipantInvite,
} from "../../_lib/academy-business-participants.mjs";

type Env = { DB?: any };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

const parseBody = async (request: Request) => {
  try { return await request.json() as Record<string, unknown>; }
  catch { return null; }
};

const errorResponse = (error: { status: number; code: string }) =>
  jsonResponse(error.status, { success: false, error: error.code }, privateHeaders);

async function readInvite(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT i.*, l.contact_name AS lead_contact_name, p.name AS program_name,
           c.name AS cohort_name, c.code AS cohort_code
    FROM hermes_academy_business_participant_invites i
    JOIN hermes_academy_business_leads l
      ON l.id=i.crm_lead_id AND l.company_id=i.company_id AND l.owner_specialist_id=i.owner_specialist_id
    JOIN hermes_academy_business_programs p
      ON p.id=i.program_id AND p.company_id=i.company_id AND p.owner_specialist_id=i.owner_specialist_id
    JOIN hermes_academy_business_cohorts c
      ON c.id=i.cohort_id AND c.program_id=i.program_id AND c.company_id=i.company_id AND c.owner_specialist_id=i.owner_specialist_id
    WHERE i.id=? AND i.owner_specialist_id=? AND i.company_id=?
    LIMIT 1
  `).bind(id,ownerId,companyId).first();
}

async function readParticipant(db: any, id: string, ownerId: string, companyId: string) {
  return db.prepare(`
    SELECT x.*, l.contact_name AS lead_contact_name, p.name AS program_name,
           c.name AS cohort_name, c.code AS cohort_code
    FROM hermes_academy_business_participants x
    JOIN hermes_academy_business_leads l
      ON l.id=x.crm_lead_id AND l.company_id=x.company_id AND l.owner_specialist_id=x.owner_specialist_id
    JOIN hermes_academy_business_programs p
      ON p.id=x.program_id AND p.company_id=x.company_id AND p.owner_specialist_id=x.owner_specialist_id
    JOIN hermes_academy_business_cohorts c
      ON c.id=x.cohort_id AND c.program_id=x.program_id AND c.company_id=x.company_id AND c.owner_specialist_id=x.owner_specialist_id
    WHERE x.id=? AND x.owner_specialist_id=? AND x.company_id=?
    LIMIT 1
  `).bind(id,ownerId,companyId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const ctx = await getAcademyBusinessParticipantsContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hermes_academy_business_participant_invites
    SET state='expired',updated_at=?
    WHERE owner_specialist_id=? AND company_id=? AND state='issued' AND expires_at<=?
  `).bind(now,ownerId,companyId,now).run();

  const [inviteResult, participantResult] = await Promise.all([
    env.DB.prepare(`
      SELECT i.*, l.contact_name AS lead_contact_name, p.name AS program_name,
             c.name AS cohort_name, c.code AS cohort_code
      FROM hermes_academy_business_participant_invites i
      JOIN hermes_academy_business_leads l
        ON l.id=i.crm_lead_id AND l.company_id=i.company_id AND l.owner_specialist_id=i.owner_specialist_id
      JOIN hermes_academy_business_programs p
        ON p.id=i.program_id AND p.company_id=i.company_id AND p.owner_specialist_id=i.owner_specialist_id
      JOIN hermes_academy_business_cohorts c
        ON c.id=i.cohort_id AND c.program_id=i.program_id AND c.company_id=i.company_id AND c.owner_specialist_id=i.owner_specialist_id
      WHERE i.owner_specialist_id=? AND i.company_id=?
      ORDER BY i.updated_at DESC
      LIMIT 1000
    `).bind(ownerId,companyId).all(),
    env.DB.prepare(`
      SELECT x.*, l.contact_name AS lead_contact_name, p.name AS program_name,
             c.name AS cohort_name, c.code AS cohort_code
      FROM hermes_academy_business_participants x
      JOIN hermes_academy_business_leads l
        ON l.id=x.crm_lead_id AND l.company_id=x.company_id AND l.owner_specialist_id=x.owner_specialist_id
      JOIN hermes_academy_business_programs p
        ON p.id=x.program_id AND p.company_id=x.company_id AND p.owner_specialist_id=x.owner_specialist_id
      JOIN hermes_academy_business_cohorts c
        ON c.id=x.cohort_id AND c.program_id=x.program_id AND c.company_id=x.company_id AND c.owner_specialist_id=x.owner_specialist_id
      WHERE x.owner_specialist_id=? AND x.company_id=?
      ORDER BY x.updated_at DESC
      LIMIT 2000
    `).bind(ownerId,companyId).all(),
  ]);

  return jsonResponse(200, {
    success: true,
    invites: (inviteResult?.results || []).map(safeParticipantInvite),
    participants: (participantResult?.results || []).map(safeBusinessParticipant),
    identityBoundary: "explicit_authenticated_specialist_claim",
    sharedAcademyEnrollmentMutation: false,
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const ctx = await getAcademyBusinessParticipantsContext(request, env);
  if (ctx.error) return errorResponse(ctx.error);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = String(body.action || "");
  const ownerId = String(ctx.specialist.id);
  const companyId = String(ctx.company.id);
  const now = new Date().toISOString();

  if (action === "create_invite") {
    const forbidden = ["specialistId","specialist_id","email","learnerId","learner_id","participantId","participant_id"];
    if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body,key))) {
      return jsonResponse(400,{success:false,error:"participant_identity_must_claim_explicitly"},privateHeaders);
    }
    const value = normalizeInviteInput(body);
    const errors = inviteInputErrors(value);
    if (errors.length) return jsonResponse(400,{success:false,errors},privateHeaders);
    const relations = await requireParticipantInviteRelations(env.DB,companyId,ownerId,value);
    if (relations.error) return jsonResponse(409,{success:false,error:relations.error},privateHeaders);

    const existingIssued = await env.DB.prepare(`
      SELECT id
      FROM hermes_academy_business_participant_invites
      WHERE company_id=? AND owner_specialist_id=? AND crm_lead_id=? AND cohort_id=?
        AND state='issued' AND expires_at>?
      LIMIT 1
    `).bind(companyId,ownerId,value.crmLeadId,value.cohortId,now).first();
    if (existingIssued) return jsonResponse(409,{success:false,error:"participant_invite_already_open"},privateHeaders);

    const claim = await createParticipantClaimToken();
    const id = `academy-business-participant-invite-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_participant_invites (
        id,owner_specialist_id,company_id,crm_lead_id,program_id,cohort_id,claim_token_hash,
        state,expires_at,claimed_specialist_id,claimed_at,revoked_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,'issued',?,NULL,NULL,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.crmLeadId,value.programId,value.cohortId,claim.hash,value.expiresAt,now,now
    ).run();
    return jsonResponse(201,{
      success:true,
      invite:safeParticipantInvite(await readInvite(env.DB,id,ownerId,companyId)),
      inviteToken:claim.token,
      tokenReturnedOnce:true,
    },privateHeaders);
  }

  if (action === "revoke_invite") {
    const id = String(body.id || "").trim();
    const invite = await readInvite(env.DB,id,ownerId,companyId);
    if (!invite) return jsonResponse(404,{success:false,error:"participant_invite_not_found"},privateHeaders);
    if (invite.state !== "issued") return jsonResponse(409,{success:false,error:"participant_invite_not_revocable"},privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_participant_invites
      SET state='revoked',revoked_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND state='issued'
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200,{success:true,invite:safeParticipantInvite(await readInvite(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  if (action === "update_participant_state") {
    const id = String(body.id || "").trim();
    const existing = await readParticipant(env.DB,id,ownerId,companyId);
    if (!existing) return jsonResponse(404,{success:false,error:"participant_not_found"},privateHeaders);
    const state = normalizeParticipantState(body.state,String(existing.state || "enrolled"));
    if (!["active","completed","alumni","withdrawn"].includes(state)) {
      return jsonResponse(400,{success:false,error:"participant_state_invalid"},privateHeaders);
    }
    if (state === "alumni" && !existing.completed_at) {
      return jsonResponse(409,{success:false,error:"participant_must_complete_before_alumni"},privateHeaders);
    }
    const completedAt = state === "completed" && !existing.completed_at ? now : existing.completed_at;
    await env.DB.prepare(`
      UPDATE hermes_academy_business_participants
      SET state=?,completed_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=?
    `).bind(state,completedAt || null,now,id,ownerId,companyId).run();
    return jsonResponse(200,{success:true,participant:safeBusinessParticipant(await readParticipant(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  return jsonResponse(400,{success:false,error:"unknown_action"},privateHeaders);
}
