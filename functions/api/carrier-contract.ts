type KvNamespace = { get(key: string): Promise<string | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> };
type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = {
  ASSETS?: ServiceFetcher;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_LIMITS?: KvNamespace;
  LEAD_SERVICE_TOKEN?: string;
  LEAD_DELIVERY_MODE?: string;
  ALLOWED_ORIGIN?: string;
  CARRIER_CONTRACT_MODE?: string;
  CARRIER_CONTRACT_APPROVED_VERSION?: string;
  CARRIER_CONTRACT_APPROVED_PDF_PATH?: string;
  CARRIER_CONTRACT_APPROVED_PDF_SHA256?: string;
  CARRIER_CONTRACT_ALLOWED_PERCENTAGES?: string;
};
type Context = { request: Request; env: Env };
type ContractInput = {
  request_id?: unknown;
  selected_plan?: unknown;
  service_percentage?: unknown;
  custom_scope?: unknown;
  legal_company_name?: unknown;
  dba_name?: unknown;
  mc_number?: unknown;
  usdot_number?: unknown;
  company_website?: unknown;
  signer_name?: unknown;
  signer_title?: unknown;
  signer_email?: unknown;
  signer_phone?: unknown;
  sales_contact?: unknown;
  offer_code?: unknown;
  typed_signature?: unknown;
  signature_jpeg?: unknown;
  signature_width?: unknown;
  signature_height?: unknown;
  consent_electronic_records?: unknown;
  consent_authority?: unknown;
  consent_document_review?: unknown;
  consent_selected_scope?: unknown;
  submitted_at?: unknown;
};
type NormalizedContract = {
  requestId: string;
  plan: "essential" | "pro" | "custom";
  planLabel: string;
  percentage: string;
  percentageKey: string;
  customScope: string;
  legalCompanyName: string;
  dbaName: string;
  mcNumber: string;
  usdotNumber: string;
  companyWebsite: string;
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signerPhone: string;
  salesContact: string;
  offerCode: string;
  typedSignature: string;
  signatureBytes: Uint8Array;
  signatureWidth: number;
  signatureHeight: number;
  submittedAt: string;
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send-contract";
const REVIEW_DOCUMENT_VERSION = "ATTORNEY-REVIEW-V3-2026-08-06";
const REVIEW_DOCUMENT_PATH = "/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf";
const REVIEW_DOCUMENT_SHA256 = "9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb";
// Issue #280 is the governing activation boundary. Keep the technically useful
// execution engine fail-closed until qualified Wisconsin transportation counsel
// approval and the remaining production gates are recorded in code review.
const LEGAL_EXECUTION_APPROVED = false;
const CONSENT_VERSION = "carrier-electronic-records-v2-2026-08-06";
const MAX_REQUEST_BYTES = 420_000;
const MAX_SIGNATURE_BYTES = 220_000;
const RATE_LIMIT = 3;
const RATE_WINDOW_SECONDS = 60 * 60;
const RECORD_TTL_SECONDS = 30 * 24 * 60 * 60;
const DELIVERY_TIMEOUT_MS = 15_000;
const encoder = new TextEncoder();

const responseHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  "Access-Control-Expose-Headers": "Content-Disposition, X-Hermes-Delivery, X-Hermes-Internal-Delivery, X-Hermes-Carrier-Copy, X-Hermes-Request-Id, X-Hermes-Pdf-Sha256, X-Hermes-Document-Mode",
  "Cache-Control": "no-store",
  "Vary": "Origin",
});
const json = (origin: string, status: number, payload: Record<string, unknown>) => new Response(JSON.stringify(payload), { status, headers: { ...responseHeaders(origin), "Content-Type": "application/json; charset=utf-8" } });
const clean = (value: unknown, max: number) => typeof value === "string" ? value.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";
const asciiSafe = (value: string) => value.replace(/[^\x20-\x7e]/g, "?");
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value: string) => /^[+()\-\s.0-9]{7,30}$/.test(value);
const isRequestId = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);
const isMcOrDot = (value: string) => value === "" || /^[0-9]{4,12}$/.test(value);
const forbiddenKeyPattern = /(password|passcode|pin|credential|secret|token|api[_-]?key|w-?9|cdl|bank|routing|account[_-]?number|payment|credit[_-]?card|vin)/i;
const unnecessaryPreSignatureFieldPattern = /^(business_address|city|state|zip|fleet_size|equipment_types|other_equipment|home_base|preferred_lanes|avoided_lanes|max_deadhead|availability_notes|load_boards|other_load_board|access_handoff_method)$/i;
const containsRejectedKey = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsRejectedKey);
  return Object.entries(value as Record<string, unknown>).some(([key, child]) => forbiddenKeyPattern.test(key) || unnecessaryPreSignatureFieldPattern.test(key) || containsRejectedKey(child));
};
const normalizeWebsite = (value: unknown) => {
  const raw = clean(value, 220);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return "";
    url.hash = "";
    return url.toString().slice(0, 220);
  } catch { return ""; }
};
const normalizePercentage = (value: unknown) => {
  const raw = clean(value, 8);
  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(raw)) return null;
  const number = Number(raw);
  if (!Number.isFinite(number) || number < 1 || number > 15) return null;
  const key = number.toFixed(2);
  return { key, display: `${key.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}%` };
};
const parseAllowedPercentages = (value: unknown) => new Set(clean(value, 300).split(/[;,\s]+/).map((item) => normalizePercentage(item)?.key ?? "").filter(Boolean));
const base64ToBytes = (value: string) => { const binary = atob(value); const bytes = new Uint8Array(binary.length); for (let i=0;i<binary.length;i+=1) bytes[i]=binary.charCodeAt(i); return bytes; };
const bytesToBase64 = (bytes: Uint8Array) => { let binary=""; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length))); return btoa(binary); };
const concatBytes = (...parts: Uint8Array[]) => { const output=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0)); let offset=0; for(const part of parts){output.set(part,offset);offset+=part.length;} return output; };
const sha256 = async (value: string | Uint8Array) => { const bytes=typeof value==="string"?encoder.encode(value):value; const digest=await crypto.subtle.digest("SHA-256",bytes); return [...new Uint8Array(digest)].map((item)=>item.toString(16).padStart(2,"0")).join(""); };

const normalizeInput = (input: ContractInput): NormalizedContract | null => {
  if (containsRejectedKey(input)) return null;
  const requestId=clean(input.request_id,80);
  const plan=clean(input.selected_plan,20) as NormalizedContract["plan"];
  if(!isRequestId(requestId)||!["essential","pro","custom"].includes(plan)) return null;
  const percentage=normalizePercentage(input.service_percentage);
  if(!percentage) return null;
  const legalCompanyName=clean(input.legal_company_name,140);
  const signerName=clean(input.signer_name,120);
  const signerTitle=clean(input.signer_title,100);
  const signerEmail=clean(input.signer_email,160).toLowerCase();
  const signerPhone=clean(input.signer_phone,40);
  const typedSignature=clean(input.typed_signature,120);
  const mcNumber=clean(input.mc_number,20).replace(/\D/g,"");
  const usdotNumber=clean(input.usdot_number,20).replace(/\D/g,"");
  const companyWebsite=normalizeWebsite(input.company_website);
  const rawWebsite=clean(input.company_website,220);
  const customScope=clean(input.custom_scope,1500);
  const salesContact=clean(input.sales_contact,80);
  const offerCode=clean(input.offer_code,40);
  if(legalCompanyName.length<2||signerName.length<2||signerTitle.length<2||!isEmail(signerEmail)||!isPhone(signerPhone)||typedSignature.toLowerCase()!==signerName.toLowerCase()||(!mcNumber&&!usdotNumber)||!isMcOrDot(mcNumber)||!isMcOrDot(usdotNumber)||(rawWebsite&&!companyWebsite)||!/^[A-Za-z0-9._ -]{0,80}$/.test(salesContact)||!/^[A-Za-z0-9._ -]{0,40}$/.test(offerCode)) return null;
  if(input.consent_electronic_records!==true||input.consent_authority!==true||input.consent_document_review!==true||input.consent_selected_scope!==true) return null;
  if(plan==="custom"&&customScope.length<20) return null;
  const signatureData=clean(input.signature_jpeg,300_000);
  const match=signatureData.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if(!match) return null;
  const signatureBytes=base64ToBytes(match[1]);
  const signatureWidth=Number(input.signature_width); const signatureHeight=Number(input.signature_height);
  if(signatureBytes.length<500||signatureBytes.length>MAX_SIGNATURE_BYTES||!Number.isInteger(signatureWidth)||signatureWidth<300||signatureWidth>1200||!Number.isInteger(signatureHeight)||signatureHeight<90||signatureHeight>500) return null;
  const submittedAtRaw=clean(input.submitted_at,40); const submittedAtDate=new Date(submittedAtRaw); const submittedAt=Number.isNaN(submittedAtDate.getTime())?new Date().toISOString():submittedAtDate.toISOString();
  return {
    requestId,plan,
    planLabel:plan==="essential"?"Dispatch Support":plan==="pro"?"Full Partnership":"Carrier Proposal",
    percentage:plan==="custom"?`${percentage.display} proposed - pending Hermes approval`:percentage.display,
    percentageKey:percentage.key,
    customScope,legalCompanyName,dbaName:clean(input.dba_name,140),mcNumber,usdotNumber,companyWebsite,signerName,signerTitle,signerEmail,signerPhone,salesContact,offerCode,typedSignature,signatureBytes,signatureWidth,signatureHeight,submittedAt,
  };
};

const pdfEscape = (value: string) => asciiSafe(value).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
const wrap = (value: string, max=82) => { const words=asciiSafe(value||"Not provided").split(/\s+/).filter(Boolean); const lines:string[]=[]; let line=""; for(const word of words){if(!line)line=word;else if(`${line} ${word}`.length<=max)line+=` ${word}`;else{lines.push(line);line=word;}}if(line)lines.push(line);return lines.length?lines:["Not provided"]; };
const pageStream = (title:string, sections:Array<{label:string;value:string}>, footer:string, signature?:{bytes:Uint8Array;width:number;height:number}) => {
  const commands:string[]=["0.03 0.06 0.22 rg",`BT /F2 17 Tf 1 0 0 1 48 748 Tm (${pdfEscape(title)}) Tj ET`,`0.40 0.36 1.00 RG 1.2 w 48 734 m 564 734 l S`]; let y=708;
  for(const section of sections){commands.push(`BT /F2 8.7 Tf 1 0 0 1 48 ${y} Tm (${pdfEscape(section.label.toUpperCase())}) Tj ET`);y-=14;for(const line of wrap(section.value)){commands.push(`BT /F1 9.7 Tf 1 0 0 1 58 ${y} Tm (${pdfEscape(line)}) Tj ET`);y-=13;}y-=8;}
  if(signature){const width=250;const height=Math.min(90,width*signature.height/signature.width);commands.push("0.75 0.78 0.88 RG 0.8 w 48 140 280 112 re S");commands.push(`q ${width} 0 0 ${height.toFixed(2)} 62 156 cm /Im1 Do Q`);}
  commands.push(`BT /F1 8 Tf 1 0 0 1 48 35 Tm (${pdfEscape(footer)}) Tj ET`);return encoder.encode(commands.join("\n"));
};
const createSignedAppendixPdf = (contract:NormalizedContract,mode:"review"|"live",documentVersion:string,documentSha:string,audit:{inputHash:string;ipHash:string;userAgentHash:string}) => {
  const status=mode==="live"?"EXECUTION PACKAGE - approved master plus signed carrier-specific Appendix A":"SIGNED REVIEW PACKET - not a final executed agreement";
  const page1=pageStream("Hermes Carrier Agreement - Appendix A",[
    {label:"Document status",value:status},{label:"Master agreement",value:`${documentVersion} | SHA-256 ${documentSha}`},{label:"Selected service model",value:contract.planLabel},{label:"Carrier-specific service fee",value:contract.percentage},{label:"Legal carrier company",value:contract.legalCompanyName},{label:"DBA",value:contract.dbaName||"None provided"},{label:"Authority identifiers",value:`MC ${contract.mcNumber||"N/A"} | USDOT ${contract.usdotNumber||"N/A"}`},{label:"Company website",value:contract.companyWebsite||"Not provided"},{label:"Authorized signer",value:`${contract.signerName}, ${contract.signerTitle}`},{label:"Signer contact",value:`${contract.signerEmail} | ${contract.signerPhone}`},{label:"Hermes representative / offer",value:[contract.salesContact,contract.offerCode].filter(Boolean).join(" | ")||"Not provided"},...(contract.plan==="custom"?[{label:"Custom scope proposed",value:contract.customScope}]:[])
  ],`Request ${contract.requestId} | Generated ${contract.submittedAt}`);
  const page2=pageStream("Electronic Consent, Carrier Control, and Signature Record",[
    {label:"Electronic-record consent",value:"Signer affirmatively consented to electronic records and signatures, confirmed access to a device capable of downloading and retaining PDF records, and may request a paper copy."},{label:"Signer authority",value:"Signer confirmed authority to act for the carrier company identified in this packet."},{label:"Document review",value:mode==="live"?"Signer confirmed review of the approved master agreement and this Appendix A.":"Signer confirmed review of the v3 attorney-review master and understands that final activation requires an approved execution version."},{label:"Selected commercial term",value:`${contract.planLabel} | ${contract.percentage}`},{label:"Carrier-control boundary",value:"Carrier approves every load and retains drivers, equipment, safety, insurance, routes, compliance, and final operating decisions. Hermes has limited administrative and dispatch support authority only."},{label:"Payment boundary",value:"Freight funds remain payable to the carrier or its factor. Hermes earns only the service fee stated in Appendix A."},{label:"No guarantee",value:"No load, rate, mileage, lane, customer, booking, payment, profit, revenue, or business outcome is guaranteed."},{label:"Typed signature",value:contract.typedSignature},{label:"Signature timestamp",value:contract.submittedAt},{label:"Consent version",value:CONSENT_VERSION},{label:"Audit fingerprints",value:`Input ${audit.inputHash} | Network ${audit.ipHash.slice(0,24)} | Device ${audit.userAgentHash.slice(0,24)}`}
  ],`Request ${contract.requestId} | Signature image below`,{bytes:contract.signatureBytes,width:contract.signatureWidth,height:contract.signatureHeight});
  const objects:Uint8Array[]=[];const asBytes=(v:string)=>encoder.encode(v);const stream=(data:Uint8Array,extra="")=>concatBytes(asBytes(`<< /Length ${data.length}${extra?` ${extra}`:""} >>\nstream\n`),data,asBytes("\nendstream"));
  objects[1]=asBytes("<< /Type /Catalog /Pages 2 0 R >>");objects[2]=asBytes("<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>");objects[3]=asBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>");objects[4]=asBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /Im1 9 0 R >> >> /Contents 8 0 R >>");objects[5]=asBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");objects[6]=asBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");objects[7]=stream(page1);objects[8]=stream(page2);objects[9]=stream(contract.signatureBytes,`/Type /XObject /Subtype /Image /Width ${contract.signatureWidth} /Height ${contract.signatureHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`);objects[10]=asBytes(`<< /Title (${pdfEscape("Hermes Carrier Agreement Appendix A")}) /Author (${pdfEscape("Hermes Logistics LLC")}) /Subject (${pdfEscape(status)}) /Keywords (${pdfEscape(`${contract.requestId} ${documentVersion}`)}) >>`);
  const header=asBytes("%PDF-1.4\n%Hermes\n");const parts:Uint8Array[]=[header];const offsets=[0];let total=header.length;for(let number=1;number<=10;number+=1){offsets[number]=total;const bytes=concatBytes(asBytes(`${number} 0 obj\n`),objects[number],asBytes("\nendobj\n"));parts.push(bytes);total+=bytes.length;}const xrefOffset=total;const lines=["xref","0 11","0000000000 65535 f "];for(let number=1;number<=10;number+=1)lines.push(`${String(offsets[number]).padStart(10,"0")} 00000 n `);parts.push(asBytes(`${lines.join("\n")}\ntrailer\n<< /Size 11 /Root 1 0 R /Info 10 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`));return concatBytes(...parts);
};
const safeFilename=(company:string,suffix:string)=>`Hermes_${asciiSafe(company).replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"Carrier"}_${suffix}.pdf`;
type DeliveryRecord = {
  pdf_base64: string;
  filename: string;
  delivery: string;
  internal_delivery?: string;
  carrier_copy?: string;
  pdf_sha: string;
  mode: string;
  request_payload_sha256?: string;
  delivery_attempts?: number;
  last_delivery_attempt_at?: string;
  last_delivery_error?: string | null;
};
type EmailServiceResult = {
  ok?: boolean;
  carrier_copy?: unknown;
  delivery_ledger?: {
    required_internal?: { status?: unknown };
    carrier?: { status?: unknown; error?: unknown };
  };
  error?: unknown;
};
const normalizeDeliveryStatus = (value: unknown, allowed: string[], fallback: string) => {
  const status = clean(value, 40).toLowerCase();
  return allowed.includes(status) ? status : fallback;
};
const pdfResponse = (
  origin: string,
  status: number,
  bytes: Uint8Array,
  metadata: { filename: string; delivery: string; internalDelivery: string; carrierCopy: string; requestId: string; pdfSha: string; mode: string },
) => new Response(bytes, {
  status,
  headers: {
    ...responseHeaders(origin),
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${metadata.filename}"`,
    "X-Hermes-Delivery": metadata.delivery,
    "X-Hermes-Internal-Delivery": metadata.internalDelivery,
    "X-Hermes-Carrier-Copy": metadata.carrierCopy,
    "X-Hermes-Request-Id": metadata.requestId,
    "X-Hermes-Pdf-Sha256": metadata.pdfSha,
    "X-Hermes-Document-Mode": metadata.mode,
  },
});

export async function onRequestOptions({request,env}:Context){const allowedOrigin=env.ALLOWED_ORIGIN||DEFAULT_ORIGIN;const origin=request.headers.get("Origin")||"";if(origin!==allowedOrigin)return json(allowedOrigin,403,{success:false,error:"origin_not_allowed"});return new Response(null,{status:204,headers:responseHeaders(allowedOrigin)});}
export async function onRequestPost({request,env}:Context){
  const allowedOrigin=env.ALLOWED_ORIGIN||DEFAULT_ORIGIN;
  const origin=request.headers.get("Origin")||"";
  if(origin!==allowedOrigin)return json(allowedOrigin,403,{success:false,error:"origin_not_allowed"});
  if(!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json"))return json(allowedOrigin,415,{success:false,error:"content_type_required"});
  if(!env.ASSETS||!env.LEAD_EMAIL_SERVICE||!env.LEAD_LIMITS||!env.LEAD_SERVICE_TOKEN||env.LEAD_DELIVERY_MODE!=="live")return json(allowedOrigin,503,{success:false,error:"contract_delivery_not_configured"});

  const contentLength=Number(request.headers.get("Content-Length")||"0");
  if(contentLength>MAX_REQUEST_BYTES)return json(allowedOrigin,413,{success:false,error:"request_too_large"});
  const raw=await request.text();
  if(encoder.encode(raw).length>MAX_REQUEST_BYTES)return json(allowedOrigin,413,{success:false,error:"request_too_large"});
  let input:ContractInput;
  try{input=JSON.parse(raw) as ContractInput;}catch{return json(allowedOrigin,400,{success:false,error:"invalid_json"});}

  const contract=normalizeInput(input);
  const headerRequestId=clean(request.headers.get("Idempotency-Key"),80);
  if(!contract||headerRequestId!==contract.requestId)return json(allowedOrigin,400,{success:false,error:"invalid_contract_packet"});

  const requestPayloadSha=await sha256(raw);
  const requestKeyHash=await sha256(contract.requestId);
  const requestKey=`contract:id:${requestKeyHash}`;
  let existingRecord: DeliveryRecord | null = null;
  const existing=await env.LEAD_LIMITS.get(requestKey);
  if(existing){
    try{
      existingRecord=JSON.parse(existing) as DeliveryRecord;
      if(existingRecord.request_payload_sha256&&existingRecord.request_payload_sha256!==requestPayloadSha){
        return json(allowedOrigin,409,{success:false,error:"idempotency_key_payload_mismatch"});
      }
      if(existingRecord.mode==="live"&&!LEGAL_EXECUTION_APPROVED){
        return json(allowedOrigin,409,{success:false,error:"execution_record_quarantined_pending_legal_review"});
      }
      const internalDelivery=normalizeDeliveryStatus(existingRecord.internal_delivery||existingRecord.delivery,["delivered","pending"],"pending");
      if(internalDelivery==="delivered"){
        const carrierCopy=normalizeDeliveryStatus(existingRecord.carrier_copy,["delivered","download_only","pending"],"pending");
        return pdfResponse(allowedOrigin,200,base64ToBytes(existingRecord.pdf_base64),{
          filename:existingRecord.filename,
          delivery:"delivered",
          internalDelivery,
          carrierCopy,
          requestId:contract.requestId,
          pdfSha:existingRecord.pdf_sha,
          mode:existingRecord.mode,
        });
      }
    }catch{return json(allowedOrigin,409,{success:false,error:"duplicate_record_unavailable"});}
  }

  const ipHash=await sha256(request.headers.get("CF-Connecting-IP")||"unknown");
  const rateKey=`contract:rate:${ipHash}`;
  const currentRate=Number(await env.LEAD_LIMITS.get(rateKey)||"0");
  if(!existingRecord&&currentRate>=RATE_LIMIT)return json(allowedOrigin,429,{success:false,error:"rate_limit_exceeded"});
  const requestedMode=clean(env.CARRIER_CONTRACT_MODE,20).toLowerCase();const approvedVersion=clean(env.CARRIER_CONTRACT_APPROVED_VERSION,80);const approvedPath=clean(env.CARRIER_CONTRACT_APPROVED_PDF_PATH,220);const approvedSha=clean(env.CARRIER_CONTRACT_APPROVED_PDF_SHA256,80).toLowerCase();const allowedPercentages=parseAllowedPercentages(env.CARRIER_CONTRACT_ALLOWED_PERCENTAGES);
  const liveApproved=LEGAL_EXECUTION_APPROVED&&requestedMode==="live"&&Boolean(approvedVersion)&&!/draft|review/i.test(approvedVersion)&&approvedPath.startsWith("/contracts/")&&/^[a-f0-9]{64}$/.test(approvedSha)&&contract.plan!=="custom"&&allowedPercentages.has(contract.percentageKey);
  const mode:"review"|"live"=liveApproved?"live":"review";const documentVersion=liveApproved?approvedVersion:REVIEW_DOCUMENT_VERSION;const documentPath=liveApproved?approvedPath:REVIEW_DOCUMENT_PATH;const documentSha=liveApproved?approvedSha:REVIEW_DOCUMENT_SHA256;
  const canonical=JSON.stringify({...contract,signatureBytes:undefined,signature_jpeg_sha256:await sha256(contract.signatureBytes),documentVersion,documentSha,mode});const inputHash=await sha256(canonical);const userAgentHash=await sha256(request.headers.get("User-Agent")||"unknown");const appendixPdf=createSignedAppendixPdf(contract,mode,documentVersion,documentSha,{inputHash,ipHash,userAgentHash});const appendixSha=await sha256(appendixPdf);const filename=safeFilename(contract.legalCompanyName,mode==="live"?"Signed_Appendix_A":"Signed_Review_Packet");
  const assetResponse=await env.ASSETS.fetch(new URL(documentPath,request.url));if(!assetResponse.ok||!assetResponse.headers.get("Content-Type")?.toLowerCase().includes("pdf"))return json(allowedOrigin,503,{success:false,error:"master_document_unavailable"});const masterBytes=new Uint8Array(await assetResponse.arrayBuffer());if(await sha256(masterBytes)!==documentSha)return json(allowedOrigin,503,{success:false,error:"master_document_hash_mismatch"});
  const emailText=[mode==="live"?"Hermes carrier agreement execution package":"Hermes carrier agreement signed review package","-----------------------------------------------",`Request ID: ${contract.requestId}`,`Document mode: ${mode}`,`Master version: ${documentVersion}`,`Master SHA-256: ${documentSha}`,`Appendix SHA-256: ${appendixSha}`,`Carrier: ${contract.legalCompanyName}`,`DBA: ${contract.dbaName||"not provided"}`,`MC: ${contract.mcNumber||"not provided"}`,`USDOT: ${contract.usdotNumber||"not provided"}`,`Website: ${contract.companyWebsite||"not provided"}`,`Signer: ${contract.signerName}, ${contract.signerTitle}`,`Email: ${contract.signerEmail}`,`Phone: ${contract.signerPhone}`,`Selected model: ${contract.planLabel}`,`Carrier-specific percentage: ${contract.percentage}`,`Hermes representative: ${contract.salesContact||"not provided"}`,`Offer code: ${contract.offerCode||"not provided"}`,"",mode==="live"?"The attached approved master agreement and signed Appendix A form the execution package.":"The attached files form a signed review packet and do not activate a final agreement until Hermes publishes and configures an approved execution version.","No password, PIN, API token, payment credential, W-9, CDL image, VIN list, full street address, lane profile, load-board access, or private shipment document was collected by the pre-signature form."].join("\n");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),DELIVERY_TIMEOUT_MS);
  let internalDelivery="pending";
  let carrierCopy="pending";
  let deliveryError:string|null=null;
  try{
    const serviceResponse=await env.LEAD_EMAIL_SERVICE.fetch(EMAIL_SERVICE_URL,{
      method:"POST",
      headers:{"Authorization":`Bearer ${env.LEAD_SERVICE_TOKEN}`,"Content-Type":"application/json","Cache-Control":"no-store"},
      body:JSON.stringify({request_id:contract.requestId,subject:"[HERMES CONTRACT] [CARRIER ONBOARDING]",text:emailText,reply_to:contract.signerEmail,carrier_email:contract.signerEmail,attachments:[{filename,content_type:"application/pdf",content_base64:bytesToBase64(appendixPdf)},{filename:`Hermes_Master_Agreement_${asciiSafe(documentVersion).replace(/[^a-zA-Z0-9._-]+/g,"_")}.pdf`,content_type:"application/pdf",content_base64:bytesToBase64(masterBytes)}]}),
      signal:controller.signal,
    });
    const serviceResult=await serviceResponse.json().catch(()=>({})) as EmailServiceResult;
    if(serviceResponse.ok){
      internalDelivery=normalizeDeliveryStatus(serviceResult.delivery_ledger?.required_internal?.status,["delivered","pending"],"pending");
      carrierCopy=normalizeDeliveryStatus(serviceResult.carrier_copy||serviceResult.delivery_ledger?.carrier?.status,["delivered","download_only","pending"],"pending");
    }else{
      deliveryError=clean(serviceResult.error,80)||`email_service_${serviceResponse.status}`;
    }
  }catch(error){
    deliveryError=error instanceof DOMException&&error.name==="AbortError"?"delivery_timeout":"delivery_unavailable";
  }finally{clearTimeout(timeout);}

  const delivery=internalDelivery==="delivered"?"delivered":"pending";
  const deliveryAttempts=Math.max(0,Number(existingRecord?.delivery_attempts||0))+1;
  const deliveryRecord:DeliveryRecord={
    pdf_base64:bytesToBase64(appendixPdf),filename,delivery,internal_delivery:internalDelivery,carrier_copy:carrierCopy,
    pdf_sha:appendixSha,mode,request_payload_sha256:requestPayloadSha,delivery_attempts:deliveryAttempts,
    last_delivery_attempt_at:new Date().toISOString(),last_delivery_error:deliveryError,
  };
  const writes=[env.LEAD_LIMITS.put(requestKey,JSON.stringify(deliveryRecord),{expirationTtl:RECORD_TTL_SECONDS})];
  if(!existingRecord)writes.push(env.LEAD_LIMITS.put(rateKey,String(currentRate+1),{expirationTtl:RATE_WINDOW_SECONDS}));
  await Promise.all(writes);
  return pdfResponse(allowedOrigin,delivery==="delivered"?200:202,appendixPdf,{filename,delivery,internalDelivery,carrierCopy,requestId:contract.requestId,pdfSha:appendixSha,mode});
}
export async function onRequest(context:Context){if(context.request.method==="OPTIONS")return onRequestOptions(context);if(context.request.method==="POST")return onRequestPost(context);return json(context.env.ALLOWED_ORIGIN||DEFAULT_ORIGIN,405,{success:false,error:"method_not_allowed"});}
export { createSignedAppendixPdf, normalizeInput, parseAllowedPercentages };
