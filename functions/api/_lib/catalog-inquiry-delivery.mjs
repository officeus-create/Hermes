import {readReceipts,resolveStoredOwner,skipUnsentOwner,claimReceipt,settleReceipt,recipientFingerprint} from './catalog-inquiry-receipts.mjs';

const validEmail=value=>typeof value==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validFingerprint=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
async function supportsReceiptContract(env) {
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);
 try {
  const response=await env.LEAD_EMAIL_SERVICE.fetch('https://lead-email.internal/v1/capabilities',{
   method:'GET',headers:{Authorization:`Bearer ${env.LEAD_SERVICE_TOKEN}`,'Cache-Control':'no-store'},signal:controller.signal});
  const body=await response.json();
  return response.ok&&body?.catalog_delivery_receipt_contract==='v1';
 } catch {return false;} finally {clearTimeout(timer);}
}
function messageFor(p,kind) {
 if(kind==='owner')return [
  'New customer inquiry from your Hermes Catalog profile',`Business: ${p.company}`,`Customer: ${p.name}`,`Email: ${p.email}`,
  `Phone: ${p.phone||'not provided'}`,`Preferred contact time: ${p.preferredContactTime}`,`Requested services: ${p.services.join(', ')}`,
  '',p.message,'',`Catalog profile: ${p.catalogProfile}`,`Hermes request ID: ${p.requestId}`,
  'Hermes is not charging your business for this Catalog lead.',
  'Claiming the Catalog profile or purchasing Hermes services is optional and remains a separate decision.',
  'This message was sent because Catalog email notifications were explicitly enabled in the authenticated shop workspace.'
 ].join('\n').slice(0,12000);
 return ['Hermes Business Lead',`Direction: ${p.interest}`,`Name: ${p.name}`,`Company / project: ${p.company}`,`City / country: ${p.cityCountry}`,
  `Email: ${p.email}`,`Phone: ${p.phone||'not provided'}`,`WhatsApp: ${p.whatsapp||'not provided'}`,`Telegram: ${p.telegram||'not provided'}`,
  `Website / social: ${p.websiteOrSocial}`,`Planning budget: ${p.planningBudget||'not provided'}`,`Roadmap horizon: ${p.planningHorizon||'not provided'}`,
  `Preferred language: ${p.preferredLanguage}`,`Best time to contact: ${p.preferredContactTime}`,`Services: ${p.services.join(', ')}`,p.message,
  `Catalog business ID: ${p.catalogBusinessId}`,`Catalog profile: ${p.catalogProfile}`,`Catalog source ref: ${p.catalogSourceRef}`,
  ...Object.entries(p.attribution).filter(([,v])=>v).map(([k,v])=>`${({utm_source:'UTM source',utm_medium:'UTM medium',utm_campaign:'UTM campaign',utm_term:'UTM term',utm_content:'UTM content',gclid:'GCLID',gbraid:'GBRAID',wbraid:'WBRAID',referrer:'Referrer'})[k]||k}: ${v}`),`Submitted from: ${p.sourcePath}`].join('\n').slice(0,12000);
}
async function deliver(env,row,kind,fingerprint,email) {
 const token=await claimReceipt(env.DB,row,kind,fingerprint,email);
 if(!token)return false;
 const key=`catalog:${kind}`,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 let result={state:'uncertain',errorCode:'result_unverified'};
 try {
  const p=JSON.parse(row.delivery_payload_json);
  const response=await env.LEAD_EMAIL_SERVICE.fetch(`https://lead-email.internal/v1/${kind==='owner'?'send-account':'send'}`,{
   method:'POST',headers:{Authorization:`Bearer ${env.LEAD_SERVICE_TOKEN}`,'Content-Type':'application/json','Cache-Control':'no-store'},
   body:JSON.stringify({request_id:row.request_id,delivery_key:key,recipient_identity:kind==='owner'?row.owner_specialist_id:'',
    expected_recipient_fingerprint:fingerprint||undefined,subject:kind==='owner'?'[HERMES CATALOG] [CUSTOMER INQUIRY]':'[HERMES INQUIRY] [CATALOG]',
    text:messageFor(p,kind),...(kind==='owner'?{recipient_email:email}:{reply_to:p.email})}),signal:controller.signal});
  const body=await response.json();
  const matched=body.request_id===row.request_id&&body.delivery_key===key;
  const bound=validFingerprint(body.recipient_fingerprint)&&(!fingerprint||body.recipient_fingerprint===fingerprint);
  if(matched&&bound&&response.ok&&body.ok===true&&body.delivery_status==='accepted')result={state:'accepted',fingerprint:body.recipient_fingerprint,providerMessageId:typeof body.provider_message_id==='string'?body.provider_message_id.slice(0,160):null};
  else if(matched&&body.ok===false&&body.delivery_status==='failed'&&body.retryable===true&&(bound||(!fingerprint&&body.recipient_fingerprint===null&&body.error==='service_not_configured')))result={state:'failed',fingerprint:body.recipient_fingerprint,errorCode:'verified_non_acceptance'};
 } catch { /* Lost response/timeout is not verified non-acceptance. */ }
 finally {clearTimeout(timer);}
 try {await settleReceipt(env.DB,row.request_id,kind,token,result);}catch { /* Preserve sending claim if settlement fails. */ }
 return true;
}
export async function deliverCatalogInquiry(env,row,linked,currentRate,rateKey) {
 let receipts=await readReceipts(env.DB,row.request_id);
 if(!row.delivery_payload_json&&Object.values(receipts).some(r=>!['accepted','skipped'].includes(r.state)))return outcome(row,linked,receipts,false);
 if(['ready','failed'].includes(receipts.internal.state)&&currentRate>=5)return {status:429,payload:{success:false,error:'rate_limit_exceeded',request_id:row.request_id,crm_saved:true,crm_linked:linked,retryable:true}};
 const deliveryReady=Object.values(receipts).some(r=>['ready','failed'].includes(r.state));
 if(deliveryReady&&!await supportsReceiptContract(env))return {status:503,payload:{success:false,request_id:row.request_id,crm_saved:true,crm_linked:linked,
  delivery:{internal:receipts.internal.state,owner:receipts.owner.state},error:'worker_contract_unavailable',retryable:true}};
 let attempted=false;
 if(['ready','failed'].includes(receipts.internal.state)&&row.delivery_payload_json){
  const claimedInternal=await deliver(env,row,'internal',receipts.internal.recipient_fingerprint,null);
  attempted=claimedInternal||attempted;
  const after=await readReceipts(env.DB,row.request_id);
  if(claimedInternal&&after.internal.state==='accepted'){
   // Cache/quota is not the durable correctness authority.
   await env.LEAD_LIMITS.put(rateKey,String(currentRate+1),{expirationTtl:3600}).catch(()=>undefined);
  }
 }
 if(['ready','failed'].includes(receipts.owner.state)&&row.delivery_payload_json){
  const owner=await resolveStoredOwner(env.DB,row),email=String(owner?.email||'').trim().toLowerCase();
  const fingerprint=await recipientFingerprint('catalog:owner',row.owner_specialist_id||'',email);
  if(!validEmail(email)||(receipts.owner.recipient_fingerprint&&receipts.owner.recipient_fingerprint!==fingerprint))await skipUnsentOwner(env.DB,row.request_id);
  else {
   const claimed=await deliver(env,row,'owner',fingerprint,email);attempted=claimed||attempted;
   if(!claimed&&!await resolveStoredOwner(env.DB,row))await skipUnsentOwner(env.DB,row.request_id);
  }
 }
 receipts=await readReceipts(env.DB,row.request_id);
 return outcome(row,linked,receipts,attempted);
}
function outcome(row,linked,receipts,attempted) {
 const states={internal:receipts.internal.state,owner:receipts.owner.state};
 const complete=states.internal==='accepted'&&['accepted','skipped'].includes(states.owner);
 const pending=Object.values(receipts).some(r=>r.state==='uncertain'||(r.state==='sending'&&Date.now()-Date.parse(r.attempted_at)>16000));
 const sending=Object.values(states).includes('sending');
 return {status:complete?200:503,payload:{success:complete,request_id:row.request_id,crm_saved:true,crm_linked:linked,delivery:states,
  ...(complete?(!attempted?{duplicate:true}:{}):{retryable:!pending&&!sending,error:pending?'delivery_review_required':sending?'delivery_in_progress':'delivery_temporarily_unavailable'})}};
}
