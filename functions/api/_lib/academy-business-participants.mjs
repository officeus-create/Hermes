import { ACADEMY_PROGRAMS, ensureAcademySchema, getAcademyEnrollment } from "./academy.mjs";
import { ensureAcademyProgressionSchema, getAcademyProgressionSummary } from "./academy-progression.mjs";
import { getAcademyBusinessCrmContext } from "./academy-business-crm.mjs";
import { ensureAcademyBusinessProgramsSchema } from "./academy-business-programs.mjs";

const PARTICIPANT_STATES = new Set(["planned","active","completed","withdrawn"]);
const DELIVERY_ADAPTERS = new Set(["unknown","external_reference","hermes_academy"]);
const COMPLETION_STATES = new Set(["unknown","in_progress","completed","withdrawn"]);
const RENEWAL_STATES = new Set(["unknown","not_due","eligible","offered","renewed","declined"]);
const DELIVERY_KINDS = new Set([
  "online_lesson","assignment","weekly_review","vip_session","private_group","recording",
  "learner_progress","reviewer_feedback","external_lms","other",
]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
const clean=(value,max=300)=>String(value??"").replace(CONTROL_CHARS,"").trim().slice(0,max);
const enumValue=(value,allowed,fallback)=>{
  const normalized=clean(value,60).toLowerCase().replace(/[\s-]+/g,"_");
  return allowed.has(normalized)?normalized:fallback;
};
const observedAt=(value)=>{
  const text=clean(value,40);
  if(!text)return "";
  const date=new Date(text);
  return Number.isFinite(date.getTime())?date.toISOString():"";
};

export async function ensureAcademyBusinessParticipantSchema(db){
  await ensureAcademyBusinessProgramsSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_participants (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      cohort_id TEXT NOT NULL,
      learner_specialist_id TEXT,
      claim_token_hash TEXT,
      claimed_at TEXT,
      state TEXT NOT NULL DEFAULT 'planned' CHECK (state IN ('planned','active','completed','withdrawn')),
      delivery_adapter TEXT NOT NULL DEFAULT 'unknown' CHECK (delivery_adapter IN ('unknown','external_reference','hermes_academy')),
      hermes_program_slug TEXT,
      completion_state TEXT NOT NULL DEFAULT 'unknown' CHECK (completion_state IN ('unknown','in_progress','completed','withdrawn')),
      completion_source_ref TEXT,
      completion_observed_at TEXT,
      renewal_state TEXT NOT NULL DEFAULT 'unknown' CHECK (renewal_state IN ('unknown','not_due','eligible','offered','renewed','declined')),
      renewal_source_ref TEXT,
      renewal_observed_at TEXT,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_delivery_refs (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('online_lesson','assignment','weekly_review','vip_session','private_group','recording','learner_progress','reviewer_feedback','external_lms','other')),
      label TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_academy_business_participant_active_link ON hermes_academy_business_participants(company_id,lead_id,program_id,cohort_id) WHERE archived_at IS NULL").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_participant_owner ON hermes_academy_business_participants(owner_specialist_id,company_id,state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_participant_learner ON hermes_academy_business_participants(learner_specialist_id,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_delivery_participant ON hermes_academy_business_delivery_refs(participant_id,updated_at)").run();
}

export async function getAcademyBusinessParticipantContext(request,env){
  const ctx=await getAcademyBusinessCrmContext(request,env);
  if(ctx.error)return ctx;
  await ensureAcademyBusinessParticipantSchema(env.DB);
  return ctx;
}

export function normalizeAcademyBusinessParticipant(body,existing={}){
  const completionState=enumValue(body.completionState??existing.completion_state??"unknown",COMPLETION_STATES,"unknown");
  const renewalState=enumValue(body.renewalState??existing.renewal_state??"unknown",RENEWAL_STATES,"unknown");
  return {
    leadId:clean(body.leadId??existing.lead_id,140),
    programId:clean(body.programId??existing.program_id,140),
    cohortId:clean(body.cohortId??existing.cohort_id,140),
    learnerSpecialistId:clean(existing.learner_specialist_id,140),
    state:enumValue(body.state??existing.state??"planned",PARTICIPANT_STATES,"planned"),
    deliveryAdapter:enumValue(body.deliveryAdapter??existing.delivery_adapter??"unknown",DELIVERY_ADAPTERS,"unknown"),
    hermesProgramSlug:clean(body.hermesProgramSlug??existing.hermes_program_slug,100),
    completionState,
    completionSourceRef:clean(body.completionSourceRef??existing.completion_source_ref,500),
    completionObservedAt:observedAt(body.completionObservedAt??existing.completion_observed_at),
    renewalState,
    renewalSourceRef:clean(body.renewalSourceRef??existing.renewal_source_ref,500),
    renewalObservedAt:observedAt(body.renewalObservedAt??existing.renewal_observed_at),
    notes:clean(body.notes??existing.notes,1600),
  };
}

export function academyBusinessParticipantErrors(value){
  const errors=[];
  if(!value.leadId)errors.push("participant_lead_required");
  if(!value.programId)errors.push("participant_program_required");
  if(!value.cohortId)errors.push("participant_cohort_required");
  if(value.state==="completed"&&value.completionState!=="completed")errors.push("participant_completed_state_requires_completion_evidence");
  if(value.state==="withdrawn"&&value.completionState!=="withdrawn")errors.push("participant_withdrawn_state_requires_completion_evidence");
  if(value.deliveryAdapter==="hermes_academy"&&!ACADEMY_PROGRAMS.includes(value.hermesProgramSlug))errors.push("participant_hermes_program_mapping_required");
  if(value.deliveryAdapter!=="hermes_academy"&&value.hermesProgramSlug)errors.push("participant_hermes_program_mapping_not_allowed");
  if(value.completionState!=="unknown"&&(!value.completionSourceRef||!value.completionObservedAt))errors.push("participant_completion_evidence_required");
  if(value.renewalState!=="unknown"&&(!value.renewalSourceRef||!value.renewalObservedAt))errors.push("participant_renewal_evidence_required");
  return errors;
}

export function normalizeAcademyBusinessDeliveryRef(body){
  return {
    participantId:clean(body.participantId,140),
    kind:enumValue(body.kind,DELIVERY_KINDS,"other"),
    label:clean(body.label,180),
    sourceRef:clean(body.sourceRef,500),
    observedAt:observedAt(body.observedAt),
    notes:clean(body.notes,1200),
  };
}
export function academyBusinessDeliveryRefErrors(value){
  const errors=[];
  if(!value.participantId)errors.push("delivery_participant_required");
  if(value.label.length<2)errors.push("delivery_label_required");
  if(!value.sourceRef)errors.push("delivery_source_ref_required");
  if(!value.observedAt)errors.push("delivery_observed_at_required");
  return errors;
}

export function safeAcademyBusinessParticipant(row){
  if(!row)return null;
  return {
    id:String(row.id),leadId:String(row.lead_id),programId:String(row.program_id),programName:row.program_name||"",
    cohortId:String(row.cohort_id),cohortName:row.cohort_name||"",learnerSpecialistId:row.learner_specialist_id?String(row.learner_specialist_id):null,claimedAt:row.claimed_at||null,
    state:row.state||"planned",deliveryAdapter:row.delivery_adapter||"unknown",hermesProgramSlug:row.hermes_program_slug||"",
    completionState:row.completion_state||"unknown",completionSourceRef:row.completion_source_ref||"",
    completionObservedAt:row.completion_observed_at||null,renewalState:row.renewal_state||"unknown",
    renewalSourceRef:row.renewal_source_ref||"",renewalObservedAt:row.renewal_observed_at||null,
    notes:row.notes||"",archivedAt:row.archived_at||null,createdAt:row.created_at,updatedAt:row.updated_at,
  };
}
export function safeAcademyBusinessDeliveryRef(row){
  if(!row)return null;
  return {id:String(row.id),participantId:String(row.participant_id),kind:row.kind||"other",label:row.label||"",
    sourceRef:row.source_ref||"",observedAt:row.observed_at,notes:row.notes||"",archivedAt:row.archived_at||null,
    createdAt:row.created_at,updatedAt:row.updated_at};
}

export async function validateAcademyBusinessParticipantLinks(db,value,ownerId,companyId){
  const [lead,program,cohort]=await Promise.all([
    db.prepare("SELECT id FROM hermes_academy_business_leads WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL LIMIT 1").bind(value.leadId,ownerId,companyId).first(),
    db.prepare("SELECT id FROM hermes_academy_business_programs WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL LIMIT 1").bind(value.programId,ownerId,companyId).first(),
    db.prepare("SELECT id,program_id FROM hermes_academy_business_cohorts WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL LIMIT 1").bind(value.cohortId,ownerId,companyId).first(),
  ]);
  if(!lead)return "participant_lead_not_found";
  if(!program)return "participant_program_not_found";
  if(!cohort||String(cohort.program_id)!==value.programId)return "participant_cohort_program_mismatch";
  return null;
}

export async function hashAcademyParticipantClaimToken(value){
  const bytes=new TextEncoder().encode(String(value||""));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map((byte)=>byte.toString(16).padStart(2,"0")).join("");
}
export function createAcademyParticipantClaimToken(){
  return `${crypto.randomUUID().replaceAll("-","")}${crypto.randomUUID().replaceAll("-","")}`;
}
export async function validateHermesAcademyParticipantClaim(db,learnerSpecialistId,hermesProgramSlug){
  if(!ACADEMY_PROGRAMS.includes(String(hermesProgramSlug||"")))return "participant_hermes_program_mapping_required";
  await ensureAcademySchema(db);
  const enrollment=await getAcademyEnrollment(db,learnerSpecialistId,hermesProgramSlug);
  return enrollment?null:"participant_hermes_enrollment_not_found";
}

export async function readCanonicalProgression(db,participant){
  if(!participant.learner_specialist_id||participant.delivery_adapter!=="hermes_academy"||!ACADEMY_PROGRAMS.includes(String(participant.hermes_program_slug||"")))return null;
  await ensureAcademySchema(db);
  await ensureAcademyProgressionSchema(db);
  const summary=await getAcademyProgressionSummary(db,String(participant.learner_specialist_id),String(participant.hermes_program_slug));
  if(!summary)return null;
  return {
    programSlug:summary.program_slug,
    enrollmentState:summary.enrollment_state,
    totalLessons:Number(summary.total_lessons||0),
    completedLessons:Number(summary.completed_lessons||0),
    evidence:{
      submitted:Number(summary.evidence?.submitted||0),
      changesRequested:Number(summary.evidence?.changes_requested||0),
      accepted:Number(summary.evidence?.accepted||0),
    },
    progressionState:summary.progression_state||"in_progress",
    latestDecision:summary.latest_review?.decision||null,
    latestDecisionAt:summary.latest_review?.created_at||null,
  };
}
