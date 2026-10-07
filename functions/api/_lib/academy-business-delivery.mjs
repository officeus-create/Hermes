import { getAcademyBusinessCrmContext } from "./academy-business-crm.mjs";
import { ensureAcademyBusinessParticipantsSchema } from "./academy-business-participants.mjs";

const DELIVERY_KINDS = new Set([
  "lesson_portal",
  "assignment_hub",
  "weekly_review",
  "vip_session",
  "private_group",
  "recording_library",
  "reviewer_feedback",
  "support_channel",
  "calendar",
  "other",
]);
const URL_REQUIRED_KINDS = new Set([
  "lesson_portal",
  "assignment_hub",
  "private_group",
  "recording_library",
  "reviewer_feedback",
  "support_channel",
]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]","g");

const clean=(value,max=240)=>String(value??"").replace(CONTROL_CHARS,"").trim().slice(0,max);
const enumValue=(value,allowed,fallback)=>{
  const normalized=clean(value,80).toLowerCase().replace(/[\s-]+/g,"_");
  return allowed.has(normalized)?normalized:fallback;
};
const cleanUrl=(value)=>{
  const text=clean(value,1000);
  if(!text)return "";
  try{
    const url=new URL(text);
    return url.protocol==="https:" && !url.username && !url.password ? url.toString().slice(0,1000) : "";
  }catch{return "";}
};
const cleanObservedAt=(value)=>{
  const text=clean(value,48);
  return text&&Number.isFinite(Date.parse(text))?new Date(text).toISOString():"";
};

export async function ensureAcademyBusinessDeliverySchema(db){
  await ensureAcademyBusinessParticipantsSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_delivery_refs (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      cohort_id TEXT,
      participant_id TEXT,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      reference_url TEXT,
      schedule_text TEXT,
      source_ref TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_delivery_company ON hermes_academy_business_delivery_refs(company_id,kind,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_delivery_program ON hermes_academy_business_delivery_refs(company_id,program_id,cohort_id,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_delivery_participant ON hermes_academy_business_delivery_refs(company_id,participant_id,updated_at)").run();
}

export async function getAcademyBusinessDeliveryContext(request,env){
  const ctx=await getAcademyBusinessCrmContext(request,env);
  if(ctx.error)return ctx;
  await ensureAcademyBusinessDeliverySchema(env.DB);
  return ctx;
}

export function normalizeAcademyBusinessDelivery(body,existing={}){
  const kind=enumValue(body.kind??existing.kind??"other",DELIVERY_KINDS,"other");
  return {
    programId:clean(body.programId??existing.program_id,140),
    cohortId:clean(body.cohortId??existing.cohort_id,140),
    participantId:clean(body.participantId??existing.participant_id,160),
    kind,
    title:clean(body.title??existing.title,220),
    referenceUrl:cleanUrl(body.referenceUrl??existing.reference_url),
    scheduleText:clean(body.scheduleText??existing.schedule_text,1000),
    sourceRef:clean(body.sourceRef??existing.source_ref,800),
    observedAt:cleanObservedAt(body.observedAt??existing.observed_at),
    notes:clean(body.notes??existing.notes,2400),
  };
}

export function academyBusinessDeliveryErrors(value){
  const errors=[];
  if(!value.programId)errors.push("delivery_program_required");
  if(value.title.length<2)errors.push("delivery_title_required");
  if(!value.sourceRef)errors.push("delivery_source_ref_required");
  if(!value.observedAt)errors.push("delivery_observed_at_required");
  if(URL_REQUIRED_KINDS.has(value.kind)&&!value.referenceUrl)errors.push("delivery_reference_url_required");
  if(["weekly_review","vip_session","calendar"].includes(value.kind)&&!value.referenceUrl&&!value.scheduleText){
    errors.push("delivery_schedule_or_url_required");
  }
  return errors;
}

export async function validateAcademyBusinessDeliveryScope(db,companyId,ownerId,value){
  const program=await db.prepare(`
    SELECT id,name,status,archived_at
    FROM hermes_academy_business_programs
    WHERE id=? AND company_id=? AND owner_specialist_id=? AND archived_at IS NULL
    LIMIT 1
  `).bind(value.programId,companyId,ownerId).first();
  if(!program)return {error:"delivery_program_not_found"};

  let cohort=null;
  if(value.cohortId){
    cohort=await db.prepare(`
      SELECT id,name,code,program_id,archived_at
      FROM hermes_academy_business_cohorts
      WHERE id=? AND program_id=? AND company_id=? AND owner_specialist_id=? AND archived_at IS NULL
      LIMIT 1
    `).bind(value.cohortId,value.programId,companyId,ownerId).first();
    if(!cohort)return {error:"delivery_cohort_not_found"};
  }

  let participant=null;
  if(value.participantId){
    participant=await db.prepare(`
      SELECT id,program_id,cohort_id,specialist_id,state
      FROM hermes_academy_business_participants
      WHERE id=? AND company_id=? AND owner_specialist_id=?
      LIMIT 1
    `).bind(value.participantId,companyId,ownerId).first();
    if(!participant)return {error:"delivery_participant_not_found"};
    if(String(participant.program_id)!==value.programId)return {error:"delivery_participant_program_mismatch"};
    if(value.cohortId&&String(participant.cohort_id)!==value.cohortId)return {error:"delivery_participant_cohort_mismatch"};
  }
  return {program,cohort,participant};
}

export function safeAcademyBusinessDelivery(row){
  if(!row)return null;
  return {
    id:String(row.id),
    programId:String(row.program_id),
    programName:row.program_name||"",
    cohortId:row.cohort_id||null,
    cohortName:row.cohort_name||"",
    cohortCode:row.cohort_code||"",
    participantId:row.participant_id||null,
    participantSpecialistId:row.participant_specialist_id||null,
    kind:row.kind,
    title:row.title,
    referenceUrl:row.reference_url||"",
    scheduleText:row.schedule_text||"",
    sourceRef:row.source_ref||"",
    observedAt:row.observed_at,
    notes:row.notes||"",
    archivedAt:row.archived_at||null,
    createdAt:row.created_at,
    updatedAt:row.updated_at,
  };
}
