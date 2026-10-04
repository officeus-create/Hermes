import assert from 'node:assert/strict';
import {test} from 'node:test';
import {onRequest} from '../functions/api/business-lead.ts';
import {MemoryD1} from './helpers/catalog-memory-d1.mjs';
import {ensureRepairShopProfileSchema} from '../functions/api/_lib/repair-shop-schema.mjs';
import {ensureCatalogBusinessInquirySchema} from '../functions/api/_lib/catalog-business-inquiries.mjs';
import {readReceipts,settleReceipt,recipientFingerprint} from '../functions/api/_lib/catalog-inquiry-receipts.mjs';
import {createCatalogPendingSubmission} from '../src/lib/catalog-pending-submission.mjs';
import mailWorker from '../workers/lead-email/src/index.mjs';
globalThis.fetch=async()=>{throw Error('UNMOCKED NETWORK');};
const id='catalog_retry_example_12345';
const base={request_id:id,submitted_at:'2026-09-30T00:00:00Z',source_path:'/businesses/request/',interest:'Hermes Catalog',name:'Example Customer',email:'customer@example.com',company:'Example Garage',city_country:'Example, AR',phone:'+1 555 123 4567',whatsapp:'',telegram:'',website_or_social:'https://example.com',planning_budget:'Not sure yet',planning_horizon:'Not sure yet',preferred_language:'English',preferred_contact_time:'Morning',services:['Catalog business request'],message:'Please discuss repairs for this example vehicle.',catalog_business_id:'repair-shop-crm:example-shop',catalog_profile:'/businesses/connect/repair-shop/example-garage/',catalog_source_ref:'',consent:true,attribution:{utm_source:'example'}};
class Kv{values=new Map();async get(k){return this.values.get(k)||null;}async put(k,v){this.values.set(k,v);}}
async function fixture({optIn=true,modes={}}={}){
 const db=new MemoryD1();await ensureRepairShopProfileSchema(db);await ensureCatalogBusinessInquirySchema(db);
 await db.prepare('CREATE TABLE specialists(id TEXT PRIMARY KEY,email TEXT,role TEXT)').run();
 await db.prepare("INSERT INTO specialists VALUES('example-owner','owner@example.com','Shop Owner')").run();
 await db.prepare(`INSERT INTO repair_shops(id,owner_specialist_id,name,slug,city,state,timezone,created_at,updated_at,catalog_opt_in,catalog_email_notifications_opt_in) VALUES('example-shop','example-owner','Example Garage','example-garage','Example','AR','America/Chicago','2026-09-30','2026-09-30',1,?)`).bind(optIn?1:0).run();
 const calls=[],counts={internal:0,owner:0},kv=new Kv();
 const env={DB:db,LEAD_LIMITS:kv,LEAD_DELIVERY_MODE:'live',LEAD_SERVICE_TOKEN:'synthetic-test-token',LEAD_EMAIL_SERVICE:{async fetch(url,init){
  const p=JSON.parse(init.body),kind=p.delivery_key.split(':')[1];calls.push(p);const n=counts[kind]++;
  const mode=modes[kind]?.[n]||'accepted';
  const fingerprint=await recipientFingerprint(p.delivery_key,p.recipient_identity||'',p.recipient_email||'internal@example.com');
  if(typeof mode==='function')return mode(p,fingerprint);
  if(mode==='timeout')throw new DOMException('synthetic accepted but response lost','AbortError');
  if(mode==='network')throw Error('synthetic transport lost');
  if(mode==='malformed')return new Response('not json',{status:202});
  return Response.json({ok:mode==='accepted',request_id:mode==='wrong-id'?'wrong_request_12345':p.request_id,
   delivery_key:mode==='wrong-key'?'catalog:wrong':p.delivery_key,delivery_status:mode==='failed'?'failed':mode==='false-ok'?'accepted':mode,
   retryable:mode==='failed',recipient_fingerprint:fingerprint,provider_message_id:'mock-provider-id'},{status:mode==='failed'?503:202});
 }}};
 const send=async(payload=base)=>{const response=await onRequest({env,request:new Request('https://hermeslogisticsus.com/api/business-lead',{method:'POST',headers:{Origin:'https://hermeslogisticsus.com','Content-Type':'application/json','Idempotency-Key':payload.request_id,'CF-Connecting-IP':'192.0.2.123'},body:JSON.stringify(payload)})});return {status:response.status,body:await response.json()};};
 const receipts=()=>readReceipts(db,id);
 const rows=()=>Number(db.sqlite.prepare('SELECT COUNT(*) n FROM catalog_business_inquiries').get().n);
 return {db,env,kv,calls,counts,send,receipts,rows};
}
test('owner definite failure retries same ID without internal repeat',async()=>{
 const f=await fixture({modes:{owner:['failed','accepted']}});let r=await f.send();assert.equal(r.status,503);assert.equal(r.body.retryable,true);r=await f.send();assert.equal(r.status,200);assert.deepEqual(f.counts,{internal:1,owner:2});assert.equal(f.rows(),1);r=await f.send();assert.equal(r.body.duplicate,true);assert.deepEqual(f.counts,{internal:1,owner:2});
});
test('internal failure does not erase accepted owner',async()=>{const f=await fixture({modes:{internal:['failed','accepted']}});assert.equal((await f.send()).status,503);assert.equal((await f.send()).status,200);assert.deepEqual(f.counts,{internal:2,owner:1});});
test('both recipient failures retry independently',async()=>{const f=await fixture({modes:{internal:['failed','accepted'],owner:['failed','accepted']}});await f.send();assert.equal((await f.send()).status,200);assert.deepEqual(f.counts,{internal:2,owner:2});});
test('simultaneous initial posts atomically claim at most one send per recipient',async()=>{let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);const held=async(p,fp)=>{started();await gate;return Response.json({ok:true,request_id:p.request_id,delivery_key:p.delivery_key,delivery_status:'accepted',recipient_fingerprint:fp},{status:202});};const f=await fixture({modes:{internal:[held]}});const posts=[f.send(),f.send()];await ready;assert.equal(f.counts.internal,1);release();await Promise.all(posts);assert.deepEqual(f.counts,{internal:1,owner:1});assert.equal(f.rows(),1);assert.equal((await f.receipts()).owner.state,'accepted');});
test('simultaneous owner retries atomically send once',async()=>{let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);const held=async(p,fp)=>{started();await gate;return Response.json({ok:true,request_id:p.request_id,delivery_key:p.delivery_key,delivery_status:'accepted',recipient_fingerprint:fp},{status:202});};const f=await fixture({modes:{owner:['failed',held]}});await f.send();const posts=[f.send(),f.send()];await ready;assert.equal(f.counts.owner,2);release();await Promise.all(posts);assert.deepEqual(f.counts,{internal:1,owner:2});});
test('old delivered KV never suppresses a failed owner retry',async()=>{const f=await fixture({modes:{owner:['failed','accepted']}});await f.send();const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));const key='business-lead:id:'+ [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');await f.kv.put(key,'delivered');await f.send();assert.deepEqual(f.counts,{internal:1,owner:2});});
test('expired KV does not resend accepted D1 recipients',async()=>{const f=await fixture();await f.send();f.kv.values.clear();assert.equal((await f.send()).body.duplicate,true);assert.deepEqual(f.counts,{internal:1,owner:1});});
test('initial opt-out is terminal even after later opt-in',async()=>{const f=await fixture({optIn:false});await f.send();await f.db.prepare('UPDATE repair_shops SET catalog_email_notifications_opt_in=1').run();await f.send();assert.equal(f.counts.owner,0);assert.equal((await f.receipts()).owner.state,'skipped');});
test('opt-out after failed owner send skips future attempts',async()=>{const f=await fixture({modes:{owner:['failed']}});await f.send();await f.db.prepare('UPDATE repair_shops SET catalog_email_notifications_opt_in=0').run();assert.equal((await f.send()).status,200);assert.equal(f.counts.owner,1);});
test('changed owner identity/address/role never silently reroutes',async()=>{for(const sql of ["UPDATE specialists SET email='changed@example.com'","UPDATE specialists SET role='Manager'","UPDATE repair_shops SET owner_specialist_id='other-owner'"]){const f=await fixture({modes:{owner:['failed']}});await f.send();await f.db.prepare(sql).run();await f.send();assert.equal(f.counts.owner,1);}});
test('unlinked target stores one inquiry but no owner mail',async()=>{const f=await fixture();await f.send({...base,catalog_profile:'/businesses/example/unlinked/',catalog_business_id:'unlinked-example'});assert.deepEqual(f.counts,{internal:1,owner:0});assert.equal(f.rows(),1);});
test('changed message/company/time/attribution/target conflicts before sending',async()=>{for(const delta of [{message:'Materially changed message body'},{company:'Different company'},{preferred_contact_time:'Evening'},{attribution:{utm_source:'changed'}},{catalog_profile:'/businesses/example/changed/'}]){const f=await fixture();await f.send();assert.equal((await f.send({...base,...delta})).status,409);assert.deepEqual(f.counts,{internal:1,owner:1});}});
test('80-character ID uses two intact keys without suffix truncation',async()=>{const f=await fixture();const request_id='a'.repeat(80);assert.equal((await f.send({...base,request_id})).status,200);assert.equal(f.calls[0].request_id,request_id);assert.equal(f.calls[1].request_id,request_id);assert.notEqual(f.calls[0].delivery_key,f.calls[1].delivery_key);});
test('lost accepted owner response blocks automatic replay indefinitely',async()=>{const f=await fixture({modes:{owner:['timeout']}});assert.equal((await f.send()).body.retryable,false);assert.equal((await f.send()).body.error,'delivery_review_required');assert.deepEqual(f.counts,{internal:1,owner:1});assert.equal((await f.receipts()).owner.state,'uncertain');});
test('settlement failure after accepted service retains sending claim',async()=>{const f=await fixture();const batch=f.db.batch.bind(f.db);f.db.batch=async statements=>{if(statements.some(s=>s.source.includes('provider_message_id=?')))throw Error('synthetic-db-failure');return batch(statements);};await f.send();await f.send();assert.deepEqual(f.counts,{internal:1,owner:1});assert.equal((await f.receipts()).internal.state,'sending');});
test('stale token failure cannot downgrade an accepted receipt',async()=>{const f=await fixture();await f.send();await settleReceipt(f.db,id,'owner','stale-token',{state:'failed'});assert.equal((await f.receipts()).owner.state,'accepted');});
test('stale sending never leases another provider send',async()=>{const f=await fixture({modes:{owner:['failed']}});await f.send();await f.db.prepare("UPDATE catalog_inquiry_delivery_receipts SET state='sending',attempt_token='stale',attempted_at='2020-01-01' WHERE recipient_kind='owner'").run();const r=await f.send();assert.equal(r.body.error,'delivery_review_required');assert.equal(f.counts.owner,1);});
test('malformed or unmatched false 2xx receipts never accepted/retried',async()=>{for(const mode of ['malformed','wrong-id','wrong-key','false-ok']){const f=await fixture({modes:{owner:[mode]}});await f.send();await f.send();assert.equal(f.counts.owner,1);assert.equal((await f.receipts()).owner.state,'uncertain');}});
test('owner-only retry bypasses exhausted fresh-intake quota',async()=>{const f=await fixture({modes:{owner:['failed','accepted']}});await f.send();for(const k of f.kv.values.keys())if(k.startsWith('business-lead:rate:'))f.kv.values.set(k,'5');assert.equal((await f.send()).status,200);assert.deepEqual(f.counts,{internal:1,owner:2});assert.ok([...f.kv.values.values()].includes('5'));});
test('legacy delivered/skipped stay terminal; legacy failed/pending uncertain',async()=>{for(const [internal,owner] of [['delivered','delivered'],['delivered','skipped'],['pending','failed']]){const f=await fixture();await f.send();await f.db.prepare('DELETE FROM catalog_inquiry_delivery_receipts').run();await f.db.prepare('UPDATE catalog_business_inquiries SET delivery_payload_json=NULL,internal_delivery_status=?,owner_delivery_status=?').bind(internal,owner).run();const r=await f.send();assert.equal(r.status,internal==='delivered'?200:503);assert.deepEqual(f.counts,{internal:1,owner:1});assert.equal((await f.receipts()).owner.state,owner==='failed'?'uncertain':owner==='delivered'?'accepted':'skipped');}});
test('atomic batch rollback leaves no partial receipt state',async()=>{const f=await fixture();await assert.rejects(f.db.batch([f.db.prepare("INSERT INTO specialists VALUES('rollback','rollback@example.com','Shop Owner')"),f.db.prepare("INSERT INTO specialists VALUES('example-owner','collision@example.com','Shop Owner')")]));assert.equal(await f.db.prepare("SELECT id FROM specialists WHERE id='rollback'").first(),null);});
test('private canary DB error never reaches public result or console',async()=>{const f=await fixture(),logs=[],old=console.error;const secret='CANARY_secret_customer_email_token';const batch=f.db.batch.bind(f.db);f.db.batch=async s=>{if(s.some(x=>x.source.includes('INSERT INTO catalog_business_inquiries')))throw Error(secret);return batch(s);};console.error=(...args)=>logs.push(args);try{const r=await f.send();assert.equal(r.status,503);assert.ok(!JSON.stringify(r).includes(secret));assert.ok(!JSON.stringify(logs).includes(secret));}finally{console.error=old;}});
test('browser retry preserves original ID/time/payload and matched receipt',()=>{const p=createCatalogPendingSubmission(),first=p.begin(base).payload;assert.equal(p.settle(false,{request_id:id,success:false,retryable:true,crm_saved:true}),'saved_retryable');const second=p.begin({...base,request_id:'new_attempt_12345',submitted_at:'later'}).payload;assert.deepEqual(second,first);assert.equal(p.settle(true,{request_id:id,success:true}),'accepted');assert.equal(p.begin(base).error,'completed');});
test('browser double-submit, changed values and wrong ID never report success',()=>{const p=createCatalogPendingSubmission();p.begin(base);assert.equal(p.begin(base).error,'in_flight');p.networkFailure();assert.equal(p.begin({...base,message:'Changed unresolved request'}).error,'pending_changed');p.begin(base);assert.equal(p.settle(true,{request_id:'wrong_request_12345',success:true}),'review_required');assert.equal(p.begin(base).error,'review_required');});
test('receipt retention follows original inquiry deletion without private leakage',async()=>{const f=await fixture();await f.send();await f.db.prepare('DELETE FROM catalog_business_inquiries WHERE request_id=?').bind(id).run();assert.equal(f.db.sqlite.prepare('SELECT count(*) n FROM catalog_inquiry_delivery_receipts').get().n,0);});
test('intake quota guards new delivery; API result excludes recipient and submitted text',async()=>{const f=await fixture();const r=await f.send();const text=JSON.stringify(r.body);assert.ok(!text.includes('owner@example.com'));assert.ok(!text.includes(base.message));const keys=[...f.kv.values.keys()].filter(k=>k.startsWith('business-lead:rate:'));await f.kv.put(keys[0],'5');const blocked=await f.send({...base,request_id:'fresh_quota_blocked_12345'});assert.equal(blocked.status,429);assert.deepEqual(f.counts,{internal:1,owner:1});});
test('real receiver and real worker interoperate through synthetic provider only',async()=>{
 const f=await fixture(),provider={internal:0,owner:0};
 const workerEnv={LEAD_SERVICE_TOKEN:f.env.LEAD_SERVICE_TOKEN,SALES_SENDER:'website@example.com',SALES_DESTINATION:'internal@example.com',EMAIL:{async send(message){
  const kind=message.to==='owner@example.com'?'owner':'internal';provider[kind]++;
  if(kind==='owner'&&provider.owner===1)throw Object.assign(Error('explicit mock rejection'),{status:429,code:'E_PROVIDER_RATE'});
  return {messageId:'synthetic-provider-id'};
 }}};
 f.env.LEAD_EMAIL_SERVICE.fetch=(url,init)=>mailWorker.fetch(new Request(url,init),workerEnv);
 assert.equal((await f.send()).body.retryable,true);assert.equal((await f.send()).status,200);assert.equal((await f.send()).body.duplicate,true);
 assert.deepEqual(provider,{internal:1,owner:2});assert.equal((await f.receipts()).owner.state,'accepted');
});
test('active owner attempt then definite failure allows manual same-ID recovery',async()=>{
 let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);
 const held=async(p,fp)=>{started();await gate;return Response.json({ok:false,request_id:p.request_id,delivery_key:p.delivery_key,delivery_status:'failed',retryable:true,recipient_fingerprint:fp},{status:503});};
 const f=await fixture({modes:{owner:[held,'accepted']}}),first=f.send();
 await ready;
 assert.equal(f.counts.owner,1);
 const p=createCatalogPendingSubmission(),original=p.begin(base).payload;
 const active=await f.send(original);assert.equal(active.body.error,'delivery_in_progress');
 assert.equal(p.settle(false,active.body),'in_progress');assert.equal(p.reviewRequired,false);
 assert.deepEqual(f.counts,{internal:1,owner:1});release();
 const failed=await first;assert.equal(failed.body.retryable,true);
 assert.deepEqual(p.begin({...base,request_id:'unused_new_id_12345'}).payload,original);
 const recovered=await f.send(original);assert.equal(p.settle(true,recovered.body),'accepted');
 assert.deepEqual(f.counts,{internal:1,owner:2});assert.equal(f.rows(),1);
});
test('uncertain browser outcome still blocks every manual repeat',()=>{
 const p=createCatalogPendingSubmission();p.begin(base);
 assert.equal(p.settle(false,{request_id:id,success:false,crm_saved:true,error:'delivery_review_required',retryable:false}),'review_required');
 assert.equal(p.begin(base).error,'review_required');
});
test('normalized invalid name is explicitly rejected before persistence and may be corrected',async()=>{
 const f=await fixture(),p=createCatalogPendingSubmission();const bad={...base,name:' A '};
 const r=await f.send(p.begin(bad).payload);assert.equal(r.status,400);assert.equal(r.body.delivery_status,'rejected');
 assert.equal(f.rows(),0);assert.deepEqual(f.counts,{internal:0,owner:0});assert.equal(p.settle(false,r.body),'rejected');
 const corrected={...base,request_id:'corrected_name_12345'};assert.deepEqual(p.begin(corrected).payload,corrected);
 assert.equal((await f.send(corrected)).status,200);assert.equal(f.rows(),1);
});
test('invalid payload for persisted ID or failed lookup cannot unlock correction',async()=>{
 for(const existing of [true,false]){
  const f=await fixture();if(existing)await f.send();else f.db.prepare=()=>{throw Error('synthetic unavailable lookup');};
  const p=createCatalogPendingSubmission();p.begin({...base,name:' A '});const r=await f.send({...base,name:' A '});
  assert.equal(r.body.correction_allowed,undefined);assert.equal(p.settle(false,r.body),'review_required');assert.equal(p.begin(base).error,'review_required');
 }
});
