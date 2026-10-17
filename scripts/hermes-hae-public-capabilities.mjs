import {isIP} from "node:net";
const fail = reason => { throw new Error("HERMES_HAE_STATUS_" + reason); };
export function verifyStatusUrl(value, hostname) {
  if(typeof hostname !== "string" || !/^[a-z0-9.-]+$/i.test(hostname) || !hostname.includes(".") || isIP(hostname)) fail("HOST_REQUIRED");
  let u;
  try {u=new URL(value);} catch {fail("BAD_URL");}
  if(u.protocol!=="https:" || u.hostname!==hostname.toLowerCase() || isIP(u.hostname) || u.port
      || u.username || u.password || u.search || u.hash || u.pathname!=="/v1/capabilities")
    fail("DISALLOWED_URL");
  return u.toString();
}
export async function readHaECapabilities({enabled=false,url,allowedHost,fetchImpl=fetch,timeoutMs=5000}={}) {
  if(enabled!==true) fail("DISABLED");
  const dest=verifyStatusUrl(url,allowedHost);
  if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000) fail("TIMEOUT_INVALID");
  let res;
  try {
    res=await fetchImpl(dest,{method:"GET",headers:{accept:"application/json"},
      cache:"no-store",redirect:"error",signal:AbortSignal.timeout(timeoutMs)});
  } catch {fail("UNAVAILABLE");}
  if(!res?.ok) fail("NOT_READY");
  if(Number(res.headers?.get?.("content-length")??0)>8192) fail("RESPONSE_TOO_LARGE");
  let body;
  try {body=await res.text();} catch {fail("BAD_RESPONSE");}
  if(body.length>8192) fail("RESPONSE_TOO_LARGE");
  let data;
  try {data=JSON.parse(body);} catch {fail("BAD_RESPONSE");}
  if(data?.success!==true || data?.engine!=="hermes-automation-engine" || data?.version!=="v1") fail("WRONG_ENGINE");
  return Object.freeze({
    status:"PUBLIC_CAPABILITY_ONLY",health:"UNVERIFIED",
    engine:"hermes-automation-engine",version:"v1",
    genericJobExecutor:data.generic_job_executor===true,
    readOnlyTypes:Array.isArray(data.read_only_job_types)
      ? data.read_only_job_types.filter(x=>["system.health.snapshot","history.coverage.audit"].includes(x)):[],
    publishedEnabledReported:data.publication_enabled===true,
    nextAction:"Ask HAE owner to verify private health separately; never submit jobs."
  });
}
if(process.argv[1] && process.argv[1].split(/[\\/]/).at(-1)==="hermes-hae-public-capabilities.mjs") {
  readHaECapabilities({
    enabled:process.env.HERMES_HAE_CAPABILITIES_ENABLED==="true",
    url:process.env.HERMES_HAE_CAPABILITIES_URL,
    allowedHost:process.env.HERMES_HAE_ALLOWED_HOST
  }).then(v=>process.stdout.write(JSON.stringify(v)+"\n"))
    .catch(e=>{process.stderr.write(e.message+"\n");process.exitCode=1;});
}
