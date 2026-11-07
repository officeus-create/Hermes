const NORMALIZED_URL=/^https:\/\/hermeslogisticsus\.com\//;

function invalid(code){const error=new Error(code);error.code=code;throw error;}
function validIso(value){
  return typeof value==="string"&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
}
function routeKey(url){
  const parsed=new URL(url);
  if(parsed.origin!=="https://hermeslogisticsus.com")invalid("website_audit_target_origin_invalid");
  const raw=parsed.pathname==="/"? "home" : parsed.pathname.replace(/^\/+|\/+$/g,"").replace(/[^a-z0-9]+/gi,"-").toLowerCase();
  return raw.slice(0,100)||"home";
}
function normalized(url){
  if(typeof url!=="string"||!NORMALIZED_URL.test(url))return null;
  try{
    const parsed=new URL(url);
    parsed.hash="";
    return parsed.toString();
  }catch{return null;}
}
function finding(id,category,severity,status="OPEN"){
  return {finding_id:id,category,severity,status};
}

export function buildWebsiteAuditSnapshot({
  pages=[],
  canonicalUrls=[],
  statusOnlyUrls=[],
  observedAt,
}={}){
  if(!validIso(observedAt))invalid("website_audit_observed_at_invalid");
  if(!Array.isArray(pages)||!Array.isArray(canonicalUrls)||!Array.isArray(statusOnlyUrls))
    invalid("website_audit_input_invalid");

  const targets=[...canonicalUrls,...statusOnlyUrls];
  if(targets.length<1||targets.length>20||new Set(targets).size!==targets.length)
    invalid("website_audit_targets_invalid");

  const pageByUrl=new Map();
  for(const page of pages){
    const url=normalized(page?.url);
    if(!url||pageByUrl.has(url))invalid("website_audit_page_invalid");
    pageByUrl.set(url,page);
  }

  const findings=[];
  let coverageComplete=true;
  for(const target of targets){
    const normalizedTarget=normalized(target);
    if(!normalizedTarget)invalid("website_audit_target_invalid");
    const key=routeKey(normalizedTarget);
    const page=pageByUrl.get(normalizedTarget);
    if(!page){
      coverageComplete=false;
      findings.push(finding("website-"+key+"-probe-missing","PROBE_MISSING","P1","UNKNOWN"));
      continue;
    }

    const status=Number(page.status);
    if(!Number.isInteger(status)||status<100||status>599||status===599){
      coverageComplete=false;
      findings.push(finding("website-"+key+"-probe-unavailable","PROBE_UNAVAILABLE","P1","UNKNOWN"));
      continue;
    }
    if(status<200||status>=400){
      findings.push(finding(
        "website-"+key+"-http",
        "HTTP_ERROR",
        key==="home"||normalizedTarget.endsWith("/sitemap.xml")?"P0":"P1"
      ));
      continue;
    }

    const finalUrl=normalized(page.final_url||page.url);
    if(!finalUrl){
      coverageComplete=false;
      findings.push(finding("website-"+key+"-final-url","PROBE_METADATA_INVALID","P1"));
    }else if(finalUrl!==normalizedTarget){
      findings.push(finding("website-"+key+"-redirect","UNEXPECTED_REDIRECT","P1"));
    }

    if(canonicalUrls.includes(target)){
      const canonical=normalized(page.canonical||"");
      if(!canonical){
        findings.push(finding("website-"+key+"-canonical-missing","MISSING_CANONICAL","P1"));
      }else if(canonical!==normalizedTarget){
        findings.push(finding("website-"+key+"-canonical-mismatch","CANONICAL_MISMATCH","P1"));
      }
    }
  }

  return {
    observed_at:observedAt,
    coverage_complete:coverageComplete,
    source_authenticated:false,
    source_trusted:true,
    findings,
  };
}
