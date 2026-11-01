const SCOPE="hermes_internal";
const LANES=new Set(["HERMES_LOGISTICS","PROGRESSOPRO"]);
const clean=(value,max=1000)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const numericId=(value)=>{const id=clean(value,80);return /^[0-9]{6,40}$/.test(id)?id:null};

export function normalizeSocialReplyPrepareIntake(input){
  const lane=clean(input?.business_lane,64).toUpperCase();
  const replyToId=numericId(input?.reply_to_id);
  const rootPostId=numericId(input?.root_post_id);
  const text=clean(input?.text,1000);
  const bytes=new TextEncoder().encode(text).byteLength;
  const requestedBy=clean(input?.requested_by,160);
  if(!LANES.has(lane))throw new Error("social_business_lane_invalid");
  if(!replyToId)throw new Error("social_reply_target_invalid");
  if(!rootPostId)throw new Error("social_reply_root_invalid");
  if(!text||bytes>500)throw new Error("social_reply_text_invalid");
  if(!requestedBy)throw new Error("social_reply_requested_by_required");
  return{
    business_lane:lane,
    account_key:lane==="HERMES_LOGISTICS"?"hermes_logistics":"progressopro",
    reply_to_id:replyToId,
    root_post_id:rootPostId,
    text,
    requested_by:requestedBy,
    approval_class:"OWNER_APPROVED",
    source:"threads_owned_reply",
  };
}

export async function ensureSocialReplyIntakeSchema(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_automation_social_reply_intake (
    request_id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK (organization_scope='hermes_internal'),
    idempotency_key TEXT NOT NULL UNIQUE,
    business_lane TEXT NOT NULL CHECK (business_lane IN ('HERMES_LOGISTICS','PROGRESSOPRO')),
    account_key TEXT NOT NULL,
    reply_to_id TEXT NOT NULL,
    root_post_id TEXT NOT NULL,
    text TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    approval_class TEXT NOT NULL CHECK (approval_class='OWNER_APPROVED'),
    source TEXT NOT NULL CHECK (source='threads_owned_reply'),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CLAIMED','QUEUED','FAILED')),
    job_id TEXT,
    last_error_class TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_social_reply_intake_pending
    ON hermes_automation_social_reply_intake(organization_scope,status,created_at)`).run();
}

/**
 * @param {any} db
 * @param {any} input
 * @param {{idempotencyKey:string,now?:string}} options
 */
export async function createSocialReplyPrepareIntake(db,input,{idempotencyKey,now=new Date().toISOString()}){
  if(!db)throw new Error("database_not_configured");
  const normalized=normalizeSocialReplyPrepareIntake(input);
  const key=clean(idempotencyKey,240);
  if(!/^hae:social:reply:prepare:[a-z0-9:_-]{16,220}$/.test(key))throw new Error("social_reply_idempotency_invalid");
  await ensureSocialReplyIntakeSchema(db);
  const requestId="hsri_"+crypto.randomUUID();
  const inserted=await db.prepare(`INSERT OR IGNORE INTO hermes_automation_social_reply_intake
    (request_id,organization_scope,idempotency_key,business_lane,account_key,reply_to_id,root_post_id,text,requested_by,approval_class,source,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'PENDING',?,?)`).bind(
      requestId,SCOPE,key,normalized.business_lane,normalized.account_key,normalized.reply_to_id,
      normalized.root_post_id,normalized.text,normalized.requested_by,normalized.approval_class,
      normalized.source,now,now
    ).run();
  const duplicate=Number(inserted?.meta?.changes||0)!==1;
  const row=duplicate
    ?await db.prepare(`SELECT request_id,status,job_id FROM hermes_automation_social_reply_intake
       WHERE organization_scope=? AND idempotency_key=? LIMIT 1`).bind(SCOPE,key).first()
    :{request_id:requestId,status:"PENDING",job_id:null};
  return{
    request_id:String(row?.request_id||requestId),
    status:String(row?.status||"PENDING"),
    job_id:row?.job_id?String(row.job_id):null,
    duplicate,
    idempotency_key:key,
    ...normalized,
  };
}
