import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { commandCenterProjectPortfolio } from "../_lib/command-center-projects.mjs";
import { commandCenterProjectCoverageSnapshot } from "../_lib/command-center-project-coverage.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

function project(id:string){
  return commandCenterProjectPortfolio().find((item:any)=>String(item.id)===id)||null;
}

function safeObject(value:any){
  if(!value) return null;
  try{
    const parsed=typeof value==="string"?JSON.parse(value):value;
    return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:null;
  }catch{return null;}
}

async function learningRuntimeSnapshot(db:any){
  const base={job_type:"knowledge.lesson.evaluate",source_state:"UNKNOWN",recent_job_count:null,succeeded_job_count:null,promotion_candidate_count:null,hold_count:null,runtime_consumption_state:"SEPARATE_RECEIPT_REQUIRED",items:[] as any[]};
  if(!db) return {...base,reason:"DB_UNAVAILABLE"};
  try{
    const rows=await db.prepare(`SELECT job_id,state,result_json,last_error_class,created_at,updated_at,completed_at
      FROM hermes_automation_jobs WHERE job_type='knowledge.lesson.evaluate'
      ORDER BY COALESCE(completed_at,updated_at,created_at) DESC LIMIT 20`).all();
    const items=(rows?.results||[]).map((row:any)=>{
      const result=safeObject(row.result_json);
      const num=(key:string)=>typeof result?.[key]==="number"&&Number.isFinite(result[key])?Number(result[key]):null;
      return {
        job_id:String(row.job_id||""),
        state:String(row.state||"UNKNOWN"),
        evaluated_count:num("evaluated_count"),
        promotion_candidate_count:num("promotion_candidate_count"),
        hold_count:num("hold_count"),
        independent_qa_required:result?.independent_qa_required===true,
        automatic_plugin_update_performed:result?.automatic_plugin_update_performed===true,
        automatic_one_brain_promotion_performed:result?.automatic_one_brain_promotion_performed===true,
        last_error_class:row.last_error_class?String(row.last_error_class):null,
        completed_at:row.completed_at||null,
        updated_at:row.updated_at||null,
        created_at:row.created_at||null,
      };
    });
    const succeeded=items.filter((item:any)=>item.state==="SUCCEEDED");
    const sum=(key:string)=>succeeded.reduce((total:number,item:any)=>total+(typeof item[key]==="number"?item[key]:0),0);
    return {
      ...base,
      source_state:"CONNECTED",
      recent_job_count:items.length,
      succeeded_job_count:succeeded.length,
      promotion_candidate_count:sum("promotion_candidate_count"),
      hold_count:sum("hold_count"),
      items,
    };
  }catch(error){
    return {...base,reason:"HAE_LEARNING_READ_UNAVAILABLE"};
  }
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env); if(owner.response) return owner.response;
  const coverage=commandCenterProjectCoverageSnapshot();
  const knowledgeSources=(coverage.sources||[]).map((source:any)=>({
    source_class:String(source.source_class||"UNKNOWN"),
    title:String(source.title||""),
    authority:String(source.authority||"UNKNOWN"),
    observed_at:source.observed_at||null,
  }));
  const selfLearning=project("self-learning");
  const oneBrain=project("one-brain");
  const investor=project("investor-intelligence");
  const learningRuntime=await learningRuntimeSnapshot(env.DB);
  return jsonResponse(200,{
    success:true,
    checked_at:new Date().toISOString(),
    knowledge:{
      source_state:knowledgeSources.length?"REVIEWED_SOURCE_REGISTRY":"UNKNOWN",
      source_method:String(coverage.source_method||"UNKNOWN"),
      coverage_status:String(coverage.coverage_status||"UNKNOWN"),
      coverage_reason:String(coverage.coverage_reason||""),
      sources:knowledgeSources,
      governance:{
        automatic_promotion:false,
        independent_review_required:true,
        runtime_consumption_requires_receipt:true,
      },
      learning_runtime:learningRuntime,
      one_brain_project:oneBrain,
      self_learning_project:selfLearning,
    },
    investor:{
      state:investor?.evidence_level||"UNKNOWN",
      trigger_policy:"EVENT_TRIGGER_ONLY",
      continuous_polling:false,
      fresh_evidence_required:true,
      project:investor,
    },
  },headers);
}
