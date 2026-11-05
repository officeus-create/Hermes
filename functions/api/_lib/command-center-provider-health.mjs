const clean=(value,max=500)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g,"").trim().slice(0,max);

const normalizeCheckedAt=(value)=>{
  const raw=clean(value,80);
  const ms=Date.parse(raw);
  return Number.isFinite(ms)?new Date(ms).toISOString():null;
};

const authenticationState=(state,credentialConfigured)=>{
  const value=clean(state,80).toUpperCase();
  if(!credentialConfigured) return value==="CONNECTED_PUBLIC" ? "PUBLIC_NO_CREDENTIAL" : "NOT_CONFIGURED";
  if(["CONNECTED","CONNECTED_PARTIAL","CONNECTED_AUTHENTICATED"].includes(value)) return "SUCCEEDED";
  if(["AUTH_FAILED","AUTH_OR_RATE_LIMIT_FAILED"].includes(value)) return "FAILED_OR_RATE_LIMITED";
  return "UNKNOWN";
};

const statusClass=(state)=>{
  const value=clean(state,80).toUpperCase();
  if(["CONNECTED","CONNECTED_AUTHENTICATED","CONNECTED_PUBLIC"].includes(value)) return "HEALTHY";
  if(["CONNECTED_PARTIAL","PARTIAL_SCOPE"].includes(value)) return "DEGRADED";
  if(["NOT_CONFIGURED","INVALID_LIST_CONFIG"].includes(value)) return "NOT_CONFIGURED";
  if(["AUTH_FAILED","AUTH_OR_RATE_LIMIT_FAILED","REPOSITORY_NOT_FOUND","PRIVATE_OR_NOT_FOUND","RATE_LIMITED","PROVIDER_UNAVAILABLE","PROVIDER_ERROR","PUBLIC_RATE_LIMIT_OR_PRIVATE"].includes(value)) return "UNAVAILABLE";
  return "UNKNOWN";
};

export function buildProviderHealth({clickup={},github={},checkedAt=new Date().toISOString()}={}){
  return [
    {
      id:"clickup",
      label:"ClickUp",
      provider_class:"EXTERNAL_TASK_SOURCE",
      health:statusClass(clickup.source_state),
      source_state:clean(clickup.source_state,80)||"UNKNOWN",
      checked_at:normalizeCheckedAt(clickup.checked_at)||checkedAt,
      scope:clickup.list_id?("list:"+clean(clickup.list_id,120)):"UNKNOWN",
      credential_configured:clickup.source_state!=="NOT_CONFIGURED",
      authentication_state:authenticationState(clickup.source_state,clickup.source_state!=="NOT_CONFIGURED"),
      http_status:Number.isInteger(clickup.http_status)?clickup.http_status:null,
      item_count:Array.isArray(clickup.tasks)?clickup.tasks.length:null,
      truncated:clickup.truncated===true,
      credential_exposed:false,
      writable:false,
      note:"Read-only task projection. Token value is never returned.",
    },
    {
      id:"github",
      label:"GitHub",
      provider_class:"EXTERNAL_DEVELOPMENT_SOURCE",
      health:statusClass(github.source_state),
      source_state:clean(github.source_state,80)||"UNKNOWN",
      checked_at:normalizeCheckedAt(github.checked_at)||checkedAt,
      scope:clean(github.repository,240)||"UNKNOWN",
      credential_configured:github.authenticated===true,
      authentication_state:authenticationState(github.source_state,github.authenticated===true),
      http_status:Number.isInteger(github.http_status)?github.http_status:null,
      item_count:Array.isArray(github.pulls)?github.pulls.length:null,
      truncated:github.truncated===true,
      rate_limit_remaining:Number.isFinite(Number(github.rate_limit_remaining))?Number(github.rate_limit_remaining):null,
      credential_exposed:false,
      writable:false,
      note:"Read-only development projection. Credential presence and authentication outcome are distinct; token material is never returned.",
    },
  ];
}
