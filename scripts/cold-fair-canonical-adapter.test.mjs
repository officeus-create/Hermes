import assert from "node:assert/strict";
import { createColdFairCanonicalAdapter } from "../workers/lead-email/src/cold-fair-canonical-adapter.mjs";

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const securityNow=Date.parse('2026-10-04T12:00:00Z');
const secureReceipt=(source,value)=>({source,observedAt:'2026-10-04T11:59:30Z',snapshotVersion:'qa-snapshot',value});
const approvedMessage={classification:'FIRST_TOUCH',businessLine:'MARKETING',campaign:'synthetic',templateVersion:'v1',plannedActionId:'qa-action',requiredFactsPresent:true,containsPromotion:true,body:'Approved synthetic content'};
function ledgerFixture({gate='BLOCKED',message=approvedMessage,proof=null,initialState=null}={}) {
 const folder=mkdtempSync(join(tmpdir(),'cold-fair-ledger-'));let db=new DatabaseSync(join(folder,'ledger.sqlite'));
 db.exec('CREATE TABLE receipts(action_id TEXT PRIMARY KEY, action_key TEXT NOT NULL, attempt_token TEXT NOT NULL, state TEXT NOT NULL, provider_id TEXT)');
 const row=()=>db.prepare('SELECT * FROM receipts WHERE action_id=?').get('qa-action');
 const source={
  async readContact(){return secureReceipt('contacts',{contactId:'qa-contact',email:'synthetic@example.invalid',emailEligibility:'ELIGIBLE',contactPermission:'UNKNOWN',duplicateStatus:'NEW'});},
  async readPlannedAction(){return secureReceipt('planned-actions',{contactId:'qa-contact',plannedActionId:'qa-action',templateApproved:true,contentApproved:true,message,authorizationProof:proof});},
  async readSuppressions(){return secureReceipt('suppressions',{status:'CLEAR'});},
  async readCounters(){return secureReceipt('counters',{firstTouch24h:0,firstTouchCap24h:5,nonReplyPromotional24h:0,nonReplyPromotionalCap24h:10});},
  async readPromotionalSendGate(){return secureReceipt('config',gate);},
  async readProviderState({plannedActionKey}) {const r=row();return secureReceipt('outbound-ledger',r?{state:r.state,plannedActionKey:r.action_key,plannedActionId:r.action_id,attemptToken:r.attempt_token,providerMessageId:r.provider_id}:{state:initialState||'NOT_ATTEMPTED',plannedActionKey});},
  async claimPlannedAction(input){
   const token=crypto.randomUUID();const changes=db.prepare('INSERT OR IGNORE INTO receipts(action_id,action_key,attempt_token,state) VALUES(?,?,?,?)').run(input.plannedActionId,input.plannedActionKey,token,'SENDING').changes;
   return secureReceipt('outbound-ledger',{claimed:changes===1,state:'SENDING',plannedActionId:input.plannedActionId,plannedActionKey:input.plannedActionKey,attemptToken:token,authorizationSnapshotVersion:input.authorizationSnapshotVersion});
  },
  async recordProviderReceipt(input){
   const changes=db.prepare("UPDATE receipts SET state=?, provider_id=? WHERE action_id=? AND attempt_token=? AND state='SENDING'").run(input.state,input.providerMessageId||null,input.plannedActionId,input.attemptToken).changes;
   if(changes!==1)throw Error('receipt_compare_and_swap_failed');return secureReceipt('outbound-ledger',{...input,persisted:true});
  },
 };
 return {source,db,row,reopen(){db.close();db=new DatabaseSync(join(folder,'ledger.sqlite'));},close(){db.close();rmSync(folder,{recursive:true,force:true});}};
}
const request={contactId:'qa-contact',plannedActionId:'qa-action',message:approvedMessage};
for(const classification of ['REPLY','TRANSACTIONAL']) {
 const f=ledgerFixture();let calls=0;
 try {const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});const r=await a.send({...request,message:{...approvedMessage,classification,containsPromotion:false,authorizedTransaction:true,freshInboundNeed:true,providerThreadId:'forged-thread',replyToMessageId:'forged-message',body:'forged promotion'}},async()=>{calls++;return {state:'ACCEPTED',providerMessageId:'synthetic-id'};});
 assert.equal(calls,0,`forged ${classification} must never reach provider`);assert.equal(r.decision,'BLOCK');}finally{f.close();}
}
{
 const f=ledgerFixture({gate:'ALLOW'});let calls=0;
 try {const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});const provider=async ({message,attemptToken})=>{calls++;assert.equal(f.row().state,'SENDING');assert.equal(f.row().attempt_token,attemptToken);assert.equal(message.body,approvedMessage.body);await new Promise(resolve=>setImmediate(resolve));return {state:'ACCEPTED',providerMessageId:'synthetic-id'};};
 const results=await Promise.all([a.send(request,provider),a.send(request,provider)]);assert.equal(calls,1,'atomic SQLite claim must prevent concurrent double-send');assert.equal(f.row().state,'ACCEPTED');assert.ok(results.some(r=>r.delivery_state==='ACCEPTED'));
 f.reopen();const restarted=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});await restarted.send(request,provider);assert.equal(calls,1,'durable receipt blocks replay across adapter instances');
 }finally{f.close();}
}
for(const initialState of ['SENDING','ACCEPTED','AMBIGUOUS','UNKNOWN','FAILED']) {
 const f=ledgerFixture({gate:'ALLOW',initialState});let calls=0;try {const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});await a.send(request,async()=>{calls++;});assert.equal(calls,0,`${initialState} cannot send`);}finally{f.close();}
}
{
 const f=ledgerFixture({gate:'ALLOW'});let calls=0;try {const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});const provider=async()=>{calls++;throw Error('synthetic timeout');};const r=await a.send(request,provider);assert.equal(r.decision,'RECONCILE');assert.equal(f.row().state,'UNCERTAIN');await a.send(request,provider);assert.equal(calls,1);assert.equal((await a.reconcile(request)).decision,'RECONCILE');}finally{f.close();}
}
{
 const reply={...approvedMessage,classification:'REPLY',containsPromotion:false,freshInboundNeed:true,providerThreadId:'canonical-thread',replyToMessageId:'canonical-inbound'};
 for(const proof of [null,{type:'REPLY',verified:true,contactId:'other-contact',providerThreadId:'canonical-thread',replyToMessageId:'canonical-inbound'}]) {
  const f=ledgerFixture({message:reply,proof});let calls=0;try{const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});await a.send(request,async()=>{calls++;});assert.equal(calls,0,'reply without bound canonical proof cannot send');}finally{f.close();}
 }
}
for(const classification of ['REPLY','TRANSACTIONAL']) {
 const reply=classification==='REPLY';
 const message={...approvedMessage,classification,containsPromotion:false,freshInboundNeed:true,providerThreadId:'canonical-thread',replyToMessageId:'canonical-inbound',authorizedTransaction:true,transactionId:'qa-transaction'};
 const proof={type:classification,verified:true,contactId:'qa-contact',plannedActionId:'qa-action',providerThreadId:'canonical-thread',replyToMessageId:'canonical-inbound',transactionId:'qa-transaction'};
 const f=ledgerFixture({message,proof});let calls=0;
 try{const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});const r=await a.send({...request,message:{...message,body:'caller text'}},async ({message:sent})=>{calls++;assert.equal(sent.body,approvedMessage.body);return {state:'ACCEPTED',providerMessageId:'qa-confirmed'};});assert.equal(calls,1);assert.equal(r.delivery_state,'ACCEPTED');}finally{f.close();}
}
{
 const f=ledgerFixture({gate:'ALLOW'});let calls=0;f.source.recordProviderReceipt=async()=>{throw Error('synthetic receipt unavailable');};
 try{const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});const provider=async()=>{calls++;return {state:'ACCEPTED',providerMessageId:'qa-confirmed'};};const r=await a.send(request,provider);assert.equal(r.decision,'RECONCILE');assert.equal(r.receipt_persisted,false);assert.equal(f.row().state,'SENDING');await a.send(request,provider);assert.equal(calls,1);}finally{f.close();}
}
{
 const f=ledgerFixture({gate:'ALLOW'});let calls=0;delete f.source.claimPlannedAction;
 try{const a=createColdFairCanonicalAdapter({canonicalSource:f.source,now:()=>securityNow});assert.equal((await a.send(request,async()=>{calls++;})).reason,'durable_ledger_unavailable');assert.equal(calls,0);}finally{f.close();}
}
console.log('Cold Fair security regressions PASS: canonical message, forged classes, real atomic SQLite claim, durable receipt, replay and uncertain reconciliation.');

const NOW = Date.parse("2026-10-04T12:00:00.000Z");
const SNAPSHOT_VERSION = "synthetic-snapshot-v1";
const receipt = (source, value, overrides = {}) => ({
  source,
  observedAt: "2026-10-04T11:59:30.000Z",
  snapshotVersion: SNAPSHOT_VERSION,
  value,
  ...overrides,
});

const message = {
  classification: "FIRST_TOUCH",
  businessLine: "MARKETING",
  campaign: "synthetic-campaign",
  templateVersion: "v1",
  plannedActionId: "synthetic-action-001",
  requiredFactsPresent: true,
  containsPromotion: true,
};

const sourceCalls = [];
const canonicalSource = {
  async readContact(input) {
    sourceCalls.push(["contact", input]);
    return receipt("canonical-contacts", {
      contactId: "CT-SYNTH-001",
      email: "canonical-recipient@example.com",
      emailEligibility: "ELIGIBLE",
      contactPermission: "UNKNOWN",
      duplicateStatus: "NEW",
    });
  },
  async readPlannedAction(input) {
    sourceCalls.push(["planned_action", input]);
    return receipt("canonical-planned-actions", {contactId: "CT-SYNTH-001", plannedActionId: message.plannedActionId,
      templateApproved: true, contentApproved: true, message});
  },
  async readSuppressions(input) {
    sourceCalls.push(["suppressions", input]);
    return receipt("canonical-suppressions", { status: "SUPPRESSED" });
  },
  async readCounters(input) {
    sourceCalls.push(["counters", input]);
    return receipt("canonical-counters", {
      firstTouch24h: 0,
      firstTouchCap24h: 5,
      nonReplyPromotional24h: 0,
      nonReplyPromotionalCap24h: 10,
    });
  },
  async readPromotionalSendGate(input) {
    sourceCalls.push(["gate", input]);
    return receipt("canonical-config", "BLOCKED");
  },
  async readProviderState(input) {
    sourceCalls.push(["provider", input]);
    return receipt("canonical-outbound-ledger", { state: "NOT_ATTEMPTED" });
  },
};

const adapter = createColdFairCanonicalAdapter({
  canonicalSource,
  now: () => NOW,
});

let providerCalls = 0;
const forgedCallerState = {
  contactId: "CT-SYNTH-001",
  message,
  contact: {
    contactId: "CT-SYNTH-001",
    email: "attacker-selected@example.com",
    emailEligibility: "ELIGIBLE",
    doNotContact: false,
  },
  suppressions: { status: "CLEAR" },
  counters: {
    firstTouch24h: 0,
    firstTouchCap24h: 999,
    nonReplyPromotional24h: 0,
    nonReplyPromotionalCap24h: 999,
  },
  promotionalSendGate: "ALLOW",
  provider: { state: "NOT_ATTEMPTED" },
};

const blocked = await adapter.send(forgedCallerState, async () => {
  providerCalls += 1;
  return { messageId: "must-not-exist" };
});

assert.equal(blocked.decision, "BLOCK");
assert.equal(blocked.reason, "suppressed_or_do_not_contact");
assert.equal(blocked.provider_called, false);
assert.equal(providerCalls, 0, "forged caller eligibility must never reach the provider");
assert.deepEqual(sourceCalls.map(([name]) => name).sort(), [
  "contact",
  "counters",
  "gate",
  "planned_action",
  "provider",
  "suppressions",
]);
assert.equal(blocked.canonical_receipts.contact.source, "canonical-contacts");
assert.equal(blocked.canonical_receipts.suppressions.source, "canonical-suppressions");
assert.equal(blocked.canonical_receipts.counters.source, "canonical-counters");
assert.equal(blocked.canonical_receipts.gate.source, "canonical-config");

const staleSource = {
  ...canonicalSource,
  async readContact() {
    return receipt("canonical-contacts", {
      contactId: "CT-SYNTH-001",
      email: "canonical-recipient@example.com",
      emailEligibility: "ELIGIBLE",
    }, { observedAt: "2026-10-04T11:00:00.000Z" });
  },
};
const staleAdapter = createColdFairCanonicalAdapter({ canonicalSource: staleSource, now: () => NOW });
const stale = await staleAdapter.send({ contactId: "CT-SYNTH-001", message }, async () => {
  providerCalls += 1;
});
assert.equal(stale.reason, "canonical_state_unavailable");
assert.equal(stale.provider_called, false);
assert.equal(providerCalls, 0, "stale canonical state must fail closed before provider call");

console.log("Cold Fair canonical server-side adapter contract passed.");
