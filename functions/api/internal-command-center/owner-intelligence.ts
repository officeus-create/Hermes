import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { commandCenterProjectPortfolio } from "../_lib/command-center-projects.mjs";
import { commandCenterProjectCoverageSnapshot } from "../_lib/command-center-project-coverage.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

function project(id:string){
  return commandCenterProjectPortfolio().find((item:any)=>String(item.id)===id)||null;
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
