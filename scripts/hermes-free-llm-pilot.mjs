// Hermes internal-only FreeLLMAPI pilot. Default OFF; no customer data or outbound actions.
const departments=new Set(["coordinator","sales","news","catalog","technology","academy","hr","network","automation","dispatch","design","marketing","logistics","finance"]);
const purposes=new Set(["synthetic-regression-example","public-source-outline","public-copy-draft","sanitized-training-example","non-sensitive-code-explanation"]);
const classes=new Set(["PUBLIC","SYNTHETIC","SANITIZED_NON_SENSITIVE"]);
const models=new Set(["auto","auto:fast","auto:smart"]);
const deny=(s)=>{throw new Error("HERMES_FREE_LLM_"+s);};
export function validatePilotRequest({department,purpose,dataClass,externalAction=false,messages,model="auto:fast"}) {
  if(!departments.has(department))deny("DEPARTMENT_NOT_ALLOWED");
  if(!purposes.has(purpose))deny("PURPOSE_NOT_ALLOWED");
  if(!classes.has(dataClass))deny("DATA_CLASS_NOT_ALLOWED");
  if(externalAction!==false)deny("EXTERNAL_ACTION_NOT_ALLOWED");
  if(!models.has(model))deny("MODEL_NOT_ALLOWED");
  if(!Array.isArray(messages)||!messages.length||messages.length>12||messages.some(m=>!m||!["system","user","assistant"].includes(m.role)||typeof m.content!=="string"||!m.content.trim()))deny("INVALID_MESSAGES");
  if(JSON.stringify(messages).length>15000)deny("INPUT_TOO_LARGE");
  return {model,messages};
}
export function validateLoopbackGateway(urlString){
  let u;
  try{u=new URL(urlString);}catch{deny("INVALID_URL");}
  if(u.protocol!=="http:"||!["127.0.0.1","localhost","[::1]"].includes(u.hostname)||u.port!=="3001"||u.pathname!=="/v1"||u.username||u.password||u.search||u.hash)deny("NON_LOCAL_GATEWAY");
  return u.toString().replace(/\/$/,"");
}
export async function callHermesFreeLlm(input,{env=process.env,fetchImpl=fetch,timeoutMs=12000}={}){
  if(env.HERMES_FREE_LLM_ENABLED!=="true")deny("DISABLED");
  const payload=validatePilotRequest(input);
  const base=validateLoopbackGateway(env.HERMES_FREE_LLM_BASE_URL??"http://127.0.0.1:3001/v1");
  const key=env.HERMES_FREE_LLM_API_KEY;
  if(typeof key!=="string"||!key.startsWith("freellmapi-")||key.length<=12)deny("MISSING_KEY");
  if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>30000)deny("INVALID_TIMEOUT");
  let response;
  try{
    response=await fetchImpl(base+"/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({...payload,stream:false}),redirect:"error",signal:AbortSignal.timeout(timeoutMs)});
  }catch{deny("TRANSPORT_ERROR");}
  if(!response?.ok)deny("UPSTREAM_UNAVAILABLE");
  let result;try{result=await response.json();}catch{deny("BAD_RESPONSE");}
  const value=result?.choices?.[0]?.message?.content;
  if(typeof value!=="string")deny("BAD_RESPONSE");
  return {text:value,model:result.model??payload.model,routedVia:response.headers?.get?.("x-routed-via")??null,status:"INTERNAL_DRAFT_ONLY"};
}
