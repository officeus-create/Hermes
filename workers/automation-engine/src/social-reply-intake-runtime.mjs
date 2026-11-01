import { ensureSocialReplyIntakeSchema } from "../../../src/lib/hae-social-reply-intake.mjs";

const SCOPE="hermes_internal";
const clean=(value,max=1000)=>String(value??"").trim().slice(0,max);
const safeError=(error)=>{
  const value=clean(error?.message||"social_reply_intake_dispatch_failed",80);
  return /^[a-z][a-z0-9_]{2,79}$/.test(value)?value:"social_reply_intake_dispatch_failed";
};

export async function drainSocialReplyPrepareIntake(env,{createJob,limit=20}={}){
  if(!env?.DB||!env?.AUTOMATION_QUEUE||typeof createJob!=="function")return 0;
  await ensureSocialReplyIntakeSchema(env.DB);
  const rows=await env.DB.prepare(`SELECT request_id,idempotency_key,business_lane,account_key,reply_to_id,root_post_id,text,requested_by,approval_class,source
    FROM hermes_automation_social_reply_intake
    WHERE organization_scope=? AND status='PENDING'
    ORDER BY created_at ASC LIMIT ?`).bind(SCOPE,Math.max(1,Math.min(50,Number(limit)||20))).all();
  let queued=0;
  for(const row of rows?.results||[]){
    const requestId=clean(row?.request_id,160);
    if(!requestId)continue;
    const now=new Date().toISOString();
    const claimed=await env.DB.prepare(`UPDATE hermes_automation_social_reply_intake
      SET status='CLAIMED',updated_at=? WHERE request_id=? AND organization_scope=? AND status='PENDING'`)
      .bind(now,requestId,SCOPE).run();
    if(Number(claimed?.meta?.changes||0)!==1)continue;
    try{
      const result=await createJob(env,{
        job_type:"social.reply.prepare",
        business_lane:String(row.business_lane),
        account_key:String(row.account_key),
        project_key:"command-center-social-inbox",
        priority:80,
        max_attempts:1,
        internal_submission:true,
        idempotency_key:String(row.idempotency_key),
        policy_version:"social-inbound-v1",
        payload:{
          platform:"threads",
          business_lane:String(row.business_lane),
          reply_to_id:String(row.reply_to_id),
          root_post_id:String(row.root_post_id),
          text:String(row.text),
          requested_by:String(row.requested_by),
          approval_class:String(row.approval_class),
          source:String(row.source),
        },
      });
      const jobId=clean(result?.job?.job_id,160);
      if(!jobId)throw new Error("social_reply_prepare_job_missing");
      await env.DB.prepare(`UPDATE hermes_automation_social_reply_intake
        SET status='QUEUED',job_id=?,last_error_class=NULL,updated_at=?
        WHERE request_id=? AND organization_scope=? AND status='CLAIMED'`)
        .bind(jobId,new Date().toISOString(),requestId,SCOPE).run();
      queued+=1;
    }catch(error){
      await env.DB.prepare(`UPDATE hermes_automation_social_reply_intake
        SET status='FAILED',last_error_class=?,updated_at=?
        WHERE request_id=? AND organization_scope=? AND status='CLAIMED'`)
        .bind(safeError(error),new Date().toISOString(),requestId,SCOPE).run();
    }
  }
  return queued;
}
