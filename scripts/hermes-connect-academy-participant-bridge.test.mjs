import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import { onRequestPost as mutateCrm } from "../functions/api/hermes-connect/academy/crm.ts";
import { onRequestPost as mutatePrograms } from "../functions/api/hermes-connect/academy/programs.ts";
import { onRequestGet as getParticipants, onRequestPost as mutateParticipants } from "../functions/api/hermes-connect/academy/participants.ts";
import { onRequestPost as claimParticipant } from "../functions/api/hermes-connect/academy/participant-claim.ts";
import { ensureAcademySchema } from "../functions/api/_lib/academy.mjs";
import { ensureAcademyProgressionSchema } from "../functions/api/_lib/academy-progression.mjs";

function makeD1(){
  const sqlite=new DatabaseSync(":memory:");
  const db={
    prepare(sql){
      let args=[];const q={
        bind(...values){args=values;return q;},
        async all(){return {results:sqlite.prepare(sql).all(...args).map(row=>({...row}))};},
        async first(){const row=sqlite.prepare(sql).get(...args);return row?{...row}:null;},
        async run(){const result=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}};},
      };return q;
    },
    async batch(statements){const results=[];for(const statement of statements)results.push(await statement.run());return results;},
  };return {sqlite,db};
}
function ensureIdentityTables(sqlite){
  sqlite.exec(`
    CREATE TABLE specialists (id TEXT PRIMARY KEY,email TEXT,name TEXT,role TEXT,location TEXT,bio TEXT);
    CREATE TABLE sessions (token TEXT PRIMARY KEY,specialist_id TEXT NOT NULL,expires_at TEXT NOT NULL);
  `);
}
function seedIdentity(sqlite,id,token,email,role="Academy Business Owner"){
  sqlite.prepare("INSERT INTO specialists (id,email,name,role,location,bio) VALUES (?,?,?,?,?,?)")
    .run(id,email,id,role,"Kyiv","Synthetic bridge identity");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)").run(token,id,"2099-01-01T00:00:00.000Z");
}
function request(path,token,body=null){
  return new Request(`https://hermes.example${path}`,{method:body?"POST":"GET",headers:{
    Cookie:`hermes_session=${token}`,Origin:"https://hermes.example",...(body?{"Content-Type":"application/json"}:{})
  },...(body?{body:JSON.stringify(body)}:{})});
}
async function setupBusiness(db,token,name){
  const response=await saveAcademyBusiness({request:request("/api/hermes-connect/academy/business",token,{
    businessName:name,academyType:"business_club",city:"Біла Церква",region:"Київська область",countryCode:"UA",
    website:"https://synthetic.example/",timezone:"Europe/Kyiv",catalogOptIn:false,
  }),env:{DB:db}});assert.equal(response.status,200);
}
async function createLead(db,token,name){
  const response=await mutateCrm({request:request("/api/hermes-connect/academy/crm",token,{
    action:"create_lead",contactName:name,sourceChannel:"organic",businessStage:"enrolled",
  }),env:{DB:db}});assert.equal(response.status,201);return (await response.json()).lead;
}
async function createProgramCohort(db,token){
  const pr=await mutatePrograms({request:request("/api/hermes-connect/academy/programs",token,{
    action:"create_program",name:"Synthetic KNB Growth Program",status:"active",
  }),env:{DB:db}});assert.equal(pr.status,201);const program=(await pr.json()).program;
  const cr=await mutatePrograms({request:request("/api/hermes-connect/academy/programs",token,{
    action:"create_cohort",programId:program.id,name:"Synthetic Cohort",status:"active",
  }),env:{DB:db}});assert.equal(cr.status,201);return {program,cohort:(await cr.json()).cohort};
}
async function createInvite(db,ownerToken,lead,program,cohort,extra={}){
  const response=await mutateParticipants({request:request("/api/hermes-connect/academy/participants",ownerToken,{
    action:"create_participant",leadId:lead.id,programId:program.id,cohortId:cohort.id,deliveryAdapter:"external_reference",...extra,
  }),env:{DB:db}});
  return response;
}

test("participant identity is a one-time authenticated learner self-claim and UNKNOWN stays UNKNOWN",async()=>{
  const {sqlite,db}=makeD1();ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner@example.com");
  seedIdentity(sqlite,"learner-one","learner-token-one","learner@example.com","Academy Learner");
  await setupBusiness(db,"owner-token-one","Synthetic KNB");
  const lead=await createLead(db,"owner-token-one","Synthetic Learner");
  const {program,cohort}=await createProgramCohort(db,"owner-token-one");

  const ownerIdentityAttempt=await createInvite(db,"owner-token-one",lead,program,cohort,{learnerSpecialistId:"owner-cannot-force-this"});
  assert.equal(ownerIdentityAttempt.status,400);
  assert.equal((await ownerIdentityAttempt.json()).error,"participant_identity_must_be_self_claimed");

  const inviteResponse=await createInvite(db,"owner-token-one",lead,program,cohort);
  assert.equal(inviteResponse.status,201);
  const inviteBody=await inviteResponse.json();
  assert.equal(inviteBody.participant.learnerSpecialistId,null);
  assert.equal(inviteBody.identityLink,"learner_self_claim_required");
  assert.equal(inviteBody.tokenReturnedOnce,true);
  assert.ok(inviteBody.participantClaimToken.length>=48);
  const stored=sqlite.prepare("SELECT learner_specialist_id,claim_token_hash FROM hermes_academy_business_participants WHERE id=?").get(inviteBody.participant.id);
  assert.equal(stored.learner_specialist_id,null);
  assert.notEqual(stored.claim_token_hash,inviteBody.participantClaimToken);

  const beforeClaimDelivery=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"create_delivery_reference",participantId:inviteBody.participant.id,kind:"weekly_review",
    label:"Week 1",sourceRef:"internal:week-1",observedAt:"2026-10-07T11:00:00.000Z",
  }),env:{DB:db}});
  assert.equal(beforeClaimDelivery.status,409);
  assert.equal((await beforeClaimDelivery.json()).error,"participant_claim_required_before_delivery");

  const wrongClaim=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:inviteBody.participant.id,claimToken:"wrong-token-that-is-long-enough-to-pass-input-validation-000000",
  }),env:{DB:db}});
  assert.equal(wrongClaim.status,403);

  const claim=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:inviteBody.participant.id,claimToken:inviteBody.participantClaimToken,
  }),env:{DB:db}});
  assert.equal(claim.status,200);
  const claimed=await claim.json();
  assert.equal(claimed.participant.learnerSpecialistId,"learner-one");
  assert.equal(claimed.identityLink,"authenticated_learner_self_claim");
  assert.equal(sqlite.prepare("SELECT claim_token_hash FROM hermes_academy_business_participants WHERE id=?").get(inviteBody.participant.id).claim_token_hash,null);

  const replay=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:inviteBody.participant.id,claimToken:inviteBody.participantClaimToken,
  }),env:{DB:db}});
  assert.equal(replay.status,403);
  assert.equal((await replay.json()).error,"participant_claim_token_invalid");

  const unsupportedCompletion=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"update_participant",id:inviteBody.participant.id,state:"completed",completionState:"completed",
  }),env:{DB:db}});
  assert.equal(unsupportedCompletion.status,400);
  assert.ok((await unsupportedCompletion.json()).errors.includes("participant_completion_evidence_required"));

  const delivery=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"create_delivery_reference",participantId:inviteBody.participant.id,kind:"weekly_review",
    label:"Week 1 human review",sourceRef:"internal:knb-weekly-review-1",observedAt:"2026-10-07T11:00:00.000Z",
  }),env:{DB:db}});
  assert.equal(delivery.status,201);

  const completed=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"update_participant",id:inviteBody.participant.id,completionState:"completed",state:"completed",
    completionSourceRef:"internal:human-progression-review-1",completionObservedAt:"2026-10-07T12:00:00.000Z",
    renewalState:"eligible",renewalSourceRef:"internal:human-renewal-review-1",renewalObservedAt:"2026-10-07T12:05:00.000Z",
  }),env:{DB:db}});
  assert.equal(completed.status,200);

  const dashboard=await getParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one"),env:{DB:db}});
  assert.equal(dashboard.status,200);const state=await dashboard.json();
  assert.equal(state.participants.length,1);assert.equal(state.deliveryReferences.length,1);
  assert.equal(state.boundary.emailNameInference,false);assert.equal(state.boundary.duplicatesLearnerSystem,false);
  assert.equal(state.participants[0].completionState,"completed");assert.equal(state.participants[0].renewalState,"eligible");
  assert.equal(state.participants[0].canonicalProgression,null);
});

test("Hermes Academy adapter can only be claimed by a learner with canonical enrollment",async()=>{
  const {sqlite,db}=makeD1();ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner@example.com");
  seedIdentity(sqlite,"learner-one","learner-token-one","learner@example.com","Academy Learner");
  await setupBusiness(db,"owner-token-one","Synthetic Academy");
  const lead=await createLead(db,"owner-token-one","Learner");
  const {program,cohort}=await createProgramCohort(db,"owner-token-one");

  const badSlug=await createInvite(db,"owner-token-one",lead,program,cohort,{deliveryAdapter:"hermes_academy",hermesProgramSlug:"knb-growth"});
  assert.equal(badSlug.status,400);

  const invite=await createInvite(db,"owner-token-one",lead,program,cohort,{deliveryAdapter:"hermes_academy",hermesProgramSlug:"marketing"});
  assert.equal(invite.status,201);const body=await invite.json();

  const noEnrollment=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:body.participant.id,claimToken:body.participantClaimToken,
  }),env:{DB:db}});
  assert.equal(noEnrollment.status,409);
  assert.equal((await noEnrollment.json()).error,"participant_hermes_enrollment_not_found");

  await ensureAcademySchema(db);
  const now="2026-10-07T10:00:00.000Z";
  await db.prepare(`INSERT INTO academy_enrollments
    (id,specialist_id,program_slug,state,participation_model,cohort_code,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind("enrollment-one","learner-one","marketing","enrolled","paid_cohort","HERMES-MARKETING-1",now,now).run();

  const claim=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:body.participant.id,claimToken:body.participantClaimToken,
  }),env:{DB:db}});
  assert.equal(claim.status,200);

  await ensureAcademyProgressionSchema(db);
  await db.prepare(`INSERT INTO academy_progression_reviews
    (id,specialist_id,program_slug,reviewer_specialist_id,decision,feedback_text,created_at)
    VALUES (?,?,?,?,?,?,?)`).bind(
      "progression-review-one","learner-one","marketing","reviewer-one","continue",
      "PRIVATE REVIEWER FEEDBACK MUST NOT ENTER BUSINESS CRM", "2026-10-07T12:00:00.000Z"
    ).run();

  const dashboard=await getParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one"),env:{DB:db}});
  const state=await dashboard.json();
  assert.equal(state.participants[0].canonicalProgression.programSlug,"marketing");
  assert.equal(state.participants[0].canonicalProgression.enrollmentState,"enrolled");
  assert.equal(state.participants[0].canonicalProgression.totalLessons,6);
  assert.equal(state.participants[0].canonicalProgression.latestDecision,"continue");
  assert.equal(state.participants[0].canonicalProgression.latestDecisionAt,"2026-10-07T12:00:00.000Z");
  assert.equal(state.participants[0].canonicalProgression.reviewHistory,undefined);
  assert.doesNotMatch(JSON.stringify(state),/PRIVATE REVIEWER FEEDBACK MUST NOT ENTER BUSINESS CRM/);
});

test("bridge is tenant-scoped, identity mapping is immutable, and archive replaces delete",async()=>{
  const {sqlite,db}=makeD1();ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","one@example.com");
  seedIdentity(sqlite,"owner-two","owner-token-two","two@example.com");
  seedIdentity(sqlite,"learner-one","learner-token-one","learner@example.com","Academy Learner");
  await setupBusiness(db,"owner-token-one","Owner One Academy");
  await setupBusiness(db,"owner-token-two","Owner Two Academy");
  const lead1=await createLead(db,"owner-token-one","Learner One");
  const pc1=await createProgramCohort(db,"owner-token-one");
  const pc2=await createProgramCohort(db,"owner-token-two");

  const crossTenant=await createInvite(db,"owner-token-one",lead1,pc2.program,pc2.cohort);
  assert.equal(crossTenant.status,400);
  assert.equal((await crossTenant.json()).error,"participant_program_not_found");

  const created=await createInvite(db,"owner-token-one",lead1,pc1.program,pc1.cohort);
  const invite=await created.json();
  const claim=await claimParticipant({request:request("/api/hermes-connect/academy/participant-claim","learner-token-one",{
    participantId:invite.participant.id,claimToken:invite.participantClaimToken,
  }),env:{DB:db}});
  assert.equal(claim.status,200);

  const immutable=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"update_participant",id:invite.participant.id,leadId:"different-lead",
  }),env:{DB:db}});
  assert.equal(immutable.status,409);
  assert.equal((await immutable.json()).error,"participant_link_immutable_archive_and_recreate");

  const duplicateActive=await createInvite(db,"owner-token-one",lead1,pc1.program,pc1.cohort);
  assert.equal(duplicateActive.status,409);
  assert.equal((await duplicateActive.json()).error,"participant_active_link_exists");

  const archived=await mutateParticipants({request:request("/api/hermes-connect/academy/participants","owner-token-one",{
    action:"archive_participant",id:invite.participant.id,
  }),env:{DB:db}});
  assert.equal(archived.status,200);assert.ok((await archived.json()).participant.archivedAt);
  assert.equal(sqlite.prepare("SELECT claim_token_hash FROM hermes_academy_business_participants WHERE id=?").get(invite.participant.id).claim_token_hash,null);

  const recreated=await createInvite(db,"owner-token-one",lead1,pc1.program,pc1.cohort);
  assert.equal(recreated.status,201);
  const recreatedBody=await recreated.json();
  assert.notEqual(recreatedBody.participant.id,invite.participant.id);
  assert.equal(recreatedBody.participant.learnerSpecialistId,null);

  const apiSource=readFileSync(new URL("../functions/api/hermes-connect/academy/participants.ts",import.meta.url),"utf8");
  assert.doesNotMatch(apiSource,/DELETE\s+FROM\s+hermes_academy_business_participants/i);
  assert.match(apiSource,/X-Robots-Tag/);assert.match(apiSource,/private, no-store/);
  const claimSource=readFileSync(new URL("../functions/api/hermes-connect/academy/participant-claim.ts",import.meta.url),"utf8");
  assert.match(claimSource,/authenticated_learner_self_claim/);
  assert.doesNotMatch(claimSource,/contact_name|WHERE\\s+email|SELECT[^;]*email/i);
  const learnerDashboard=readFileSync(new URL("../src/pages/services/hermes-connect/academy/dashboard/index.astro",import.meta.url),"utf8");
  assert.match(learnerDashboard,/participant-claim/);
  assert.match(learnerDashboard,/private submission content and reviewer feedback stay/i);
  assert.match(learnerDashboard,/robots="noindex,nofollow"/);
});
