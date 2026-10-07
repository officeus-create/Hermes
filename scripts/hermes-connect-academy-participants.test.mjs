import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import { onRequestPost as mutatePrograms } from "../functions/api/hermes-connect/academy/programs.ts";
import { onRequestPost as mutateCrm } from "../functions/api/hermes-connect/academy/crm.ts";
import {
  onRequestGet as getParticipants,
  onRequestPost as mutateParticipants,
} from "../functions/api/hermes-connect/academy/participants.ts";
import { onRequestPost as claimParticipant } from "../functions/api/hermes-connect/academy/participant-claim.ts";

function makeD1() {
  const sqlite = new DatabaseSync(":memory:");
  const db = {
    prepare(sql) {
      let args = [];
      const q = {
        bind(...values) { args = values; return q; },
        async all() { return { results: sqlite.prepare(sql).all(...args).map((row) => ({ ...row })) }; },
        async first() {
          const row = sqlite.prepare(sql).get(...args);
          return row ? { ...row } : null;
        },
        async run() {
          const result = sqlite.prepare(sql).run(...args);
          return { success: true, meta: { changes: Number(result.changes) } };
        },
      };
      return q;
    },
    async batch(statements) {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      return results;
    },
  };
  return { sqlite, db };
}

function ensureIdentityTables(sqlite) {
  sqlite.exec(`
    CREATE TABLE specialists (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      role TEXT,
      location TEXT,
      bio TEXT
    );
    CREATE TABLE sessions (
      token TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);
}

function seedIdentity(sqlite,id,token,email,name) {
  sqlite.prepare("INSERT INTO specialists (id,email,name,role,location,bio) VALUES (?,?,?,?,?,?)")
    .run(id,email,name,"Hermes User","Kyiv, Ukraine","Synthetic participant bridge fixture.");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)")
    .run(token,id,"2099-01-01T00:00:00.000Z");
}

function req(path,token,body=null,origin="https://hermes.example") {
  return new Request(`${origin}${path}`,{
    method:body?"POST":"GET",
    headers:{
      Cookie:`hermes_session=${token}`,
      Origin:origin,
      ...(body?{"Content-Type":"application/json"}:{}),
    },
    ...(body?{body:JSON.stringify(body)}:{}),
  });
}

async function setupAcademy(db,token,name) {
  const response=await saveAcademyBusiness({
    request:req("/api/hermes-connect/academy/business",token,{
      businessName:name,
      academyType:"business_club",
      city:"Біла Церква",
      region:"Київська область",
      countryCode:"UA",
      website:"https://synthetic-academy.example/",
      phone:"+380671234567",
      timezone:"Europe/Kyiv",
      catalogOptIn:false,
    }),
    env:{DB:db},
  });
  assert.equal(response.status,200);
}

async function createProgramAndCohort(db,token,capacity=5) {
  const programRes=await mutatePrograms({
    request:req("/api/hermes-connect/academy/programs",token,{
      action:"create_program",
      name:"Managed Business Growth",
      status:"active",
      durationText:"7 weeks",
    }),
    env:{DB:db},
  });
  assert.equal(programRes.status,201);
  const program=(await programRes.json()).program;

  const cohortRes=await mutatePrograms({
    request:req("/api/hermes-connect/academy/programs",token,{
      action:"create_cohort",
      programId:program.id,
      name:"Synthetic Cohort A",
      status:"enrolling",
      capacity,
      timezone:"Europe/Kyiv",
    }),
    env:{DB:db},
  });
  assert.equal(cohortRes.status,201);
  return {program,cohort:(await cohortRes.json()).cohort};
}

async function createLead(db,token,contactName,stage="enrolled") {
  const response=await mutateCrm({
    request:req("/api/hermes-connect/academy/crm",token,{
      action:"create_lead",
      contactName,
      sourceChannel:"instagram",
      campaignId:"organic-knb",
      contentId:"reel-learner",
      businessStage:stage,
      consultationStatus:"qualified",
      programFit:"Managed Business Growth",
      nextAction:"Participant onboarding",
    }),
    env:{DB:db},
  });
  assert.equal(response.status,201);
  return (await response.json()).lead;
}

test("Business participant bridge links enrolled CRM lead to authenticated Hermes specialist and cohort without academy_enrollments mutation", async()=>{
  const {sqlite,db}=makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner@example.com","Owner One");
  seedIdentity(sqlite,"learner-one","learner-token-one","learner@example.com","Learner One");
  await setupAcademy(db,"owner-token-one","Synthetic KNB");
  const {program,cohort}=await createProgramAndCohort(db,"owner-token-one",3);
  const lead=await createLead(db,"owner-token-one","Explicit Learner Lead","enrolled");
  const expiresAt=new Date(Date.now()+14*24*60*60*1000).toISOString();

  const inviteRes=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:lead.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
    }),
    env:{DB:db},
  });
  assert.equal(inviteRes.status,201);
  const inviteBody=await inviteRes.json();
  assert.equal(inviteBody.invite.crmLeadId,lead.id);
  assert.equal(inviteBody.invite.state,"issued");
  assert.equal(inviteBody.tokenReturnedOnce,true);
  assert.ok(inviteBody.inviteToken.length>=48);
  const storedInvite=sqlite.prepare("SELECT claim_token_hash,claimed_specialist_id FROM hermes_academy_business_participant_invites WHERE id=?").get(inviteBody.invite.id);
  assert.notEqual(storedInvite.claim_token_hash,inviteBody.inviteToken);
  assert.equal(storedInvite.claimed_specialist_id,null);

  const wrongToken=await claimParticipant({
    request:req("/api/hermes-connect/academy/participant-claim","learner-token-one",{
      inviteId:inviteBody.invite.id,
      inviteToken:"wrong-token-000000000000000000000000000000000000000000000000",
    }),
    env:{DB:db},
  });
  assert.equal(wrongToken.status,403);

  const claimRes=await claimParticipant({
    request:req("/api/hermes-connect/academy/participant-claim","learner-token-one",{
      inviteId:inviteBody.invite.id,
      inviteToken:inviteBody.inviteToken,
    }),
    env:{DB:db},
  });
  assert.equal(claimRes.status,201);
  const claimBody=await claimRes.json();
  assert.equal(claimBody.participant.specialistId,"learner-one");
  assert.equal(claimBody.participant.crmLeadId,lead.id);
  assert.equal(claimBody.participant.programId,program.id);
  assert.equal(claimBody.participant.cohortId,cohort.id);
  assert.equal(claimBody.learnerIdentity,"shared_hermes_specialist");
  assert.equal(claimBody.sharedAcademyLearnerProfile,true);
  assert.equal(claimBody.sharedAcademyEnrollmentMutation,false);

  const learnerProfile=sqlite.prepare("SELECT specialist_id FROM academy_learner_profiles WHERE specialist_id=?").get("learner-one");
  assert.equal(learnerProfile.specialist_id,"learner-one");
  const sharedEnrollmentCount=sqlite.prepare("SELECT COUNT(*) AS count FROM academy_enrollments WHERE specialist_id=?").get("learner-one");
  assert.equal(Number(sharedEnrollmentCount.count),0);

  const duplicate=await claimParticipant({
    request:req("/api/hermes-connect/academy/participant-claim","learner-token-one",{
      inviteId:inviteBody.invite.id,
      inviteToken:inviteBody.inviteToken,
    }),
    env:{DB:db},
  });
  assert.equal(duplicate.status,200);
  assert.equal((await duplicate.json()).duplicate,true);

  const ownerRead=await getParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one"),
    env:{DB:db},
  });
  assert.equal(ownerRead.status,200);
  const ownerBody=await ownerRead.json();
  assert.equal(ownerBody.participants.length,1);
  assert.equal(ownerBody.participants[0].leadContactName,"Explicit Learner Lead");
  assert.equal(ownerBody.participants[0].cohortCode,cohort.code);
  assert.equal(ownerBody.sharedAcademyEnrollmentMutation,false);
  assert.equal(ownerBody.identityBoundary,"explicit_authenticated_specialist_claim");

  const activate=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"update_participant_state",
      id:ownerBody.participants[0].id,
      state:"active",
    }),
    env:{DB:db},
  });
  assert.equal(activate.status,200);
  const complete=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"update_participant_state",
      id:ownerBody.participants[0].id,
      state:"completed",
    }),
    env:{DB:db},
  });
  assert.equal(complete.status,200);
  const completeBody=await complete.json();
  assert.ok(completeBody.participant.completedAt);
  const alumni=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"update_participant_state",
      id:ownerBody.participants[0].id,
      state:"alumni",
    }),
    env:{DB:db},
  });
  assert.equal(alumni.status,200);
  const illegalRollback=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"update_participant_state",
      id:ownerBody.participants[0].id,
      state:"active",
    }),
    env:{DB:db},
  });
  assert.equal(illegalRollback.status,409);
});

test("Participant bridge is company scoped, capacity gated, and never infers learner identity from email/name", async()=>{
  const {sqlite,db}=makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner1@example.com","Owner One");
  seedIdentity(sqlite,"owner-two","owner-token-two","owner2@example.com","Owner Two");
  seedIdentity(sqlite,"learner-one","learner-token-one","learner1@example.com","Learner One");
  seedIdentity(sqlite,"learner-two","learner-token-two","learner2@example.com","Learner Two");
  await setupAcademy(db,"owner-token-one","Owner One Academy");
  await setupAcademy(db,"owner-token-two","Owner Two Academy");
  const {program,cohort}=await createProgramAndCohort(db,"owner-token-one",1);
  const lead=await createLead(db,"owner-token-one","Capacity Lead","enrolled");
  const qualifiedLead=await createLead(db,"owner-token-one","Not Sold Lead","qualified");
  const expiresAt=new Date(Date.now()+7*24*60*60*1000).toISOString();

  const notSold=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:qualifiedLead.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
    }),
    env:{DB:db},
  });
  assert.equal(notSold.status,409);
  assert.equal((await notSold.json()).error,"participant_invite_requires_enrolled_sale_stage");

  const inferred=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:lead.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
      email:"learner1@example.com",
    }),
    env:{DB:db},
  });
  assert.equal(inferred.status,400);

  const issued=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:lead.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
    }),
    env:{DB:db},
  });
  assert.equal(issued.status,201);
  const issuedBody=await issued.json();

  const secondOpen=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:lead.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
    }),
    env:{DB:db},
  });
  assert.equal(secondOpen.status,409);

  const scopeOverride=await claimParticipant({
    request:req("/api/hermes-connect/academy/participant-claim","learner-token-one",{
      inviteId:issuedBody.invite.id,
      inviteToken:issuedBody.inviteToken,
      specialistId:"learner-two",
    }),
    env:{DB:db},
  });
  assert.equal(scopeOverride.status,400);

  const claimed=await claimParticipant({
    request:req("/api/hermes-connect/academy/participant-claim","learner-token-one",{
      inviteId:issuedBody.invite.id,
      inviteToken:issuedBody.inviteToken,
    }),
    env:{DB:db},
  });
  assert.equal(claimed.status,201);

  const ownerTwoRead=await getParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-two"),
    env:{DB:db},
  });
  assert.equal(ownerTwoRead.status,200);
  const ownerTwoBody=await ownerTwoRead.json();
  assert.equal(ownerTwoBody.participants.length,0);
  assert.equal(ownerTwoBody.invites.length,0);

  const leadTwo=await createLead(db,"owner-token-one","Capacity Lead Two","enrolled");
  const capacityBlocked=await mutateParticipants({
    request:req("/api/hermes-connect/academy/participants","owner-token-one",{
      action:"create_invite",
      crmLeadId:leadTwo.id,
      programId:program.id,
      cohortId:cohort.id,
      expiresAt,
    }),
    env:{DB:db},
  });
  assert.equal(capacityBlocked.status,409);
  assert.equal((await capacityBlocked.json()).error,"participant_invite_cohort_capacity_reached");

  const helper=readFileSync(new URL("../functions/api/_lib/academy-business-participants.mjs",import.meta.url),"utf8");
  const ownerApi=readFileSync(new URL("../functions/api/hermes-connect/academy/participants.ts",import.meta.url),"utf8");
  const claimApi=readFileSync(new URL("../functions/api/hermes-connect/academy/participant-claim.ts",import.meta.url),"utf8");
  assert.match(helper,/ensureAcademyLearnerProfile/);
  assert.doesNotMatch(helper+ownerApi+claimApi,/INSERT INTO academy_enrollments|UPDATE academy_enrollments|DELETE FROM academy_enrollments/);
  assert.doesNotMatch(ownerApi,/SELECT[\s\S]{0,500}FROM specialists/i);
  assert.doesNotMatch(ownerApi+claimApi,/DELETE\s+FROM/i);
  assert.match(ownerApi,/participant_identity_must_claim_explicitly/);
  assert.match(claimApi,/getAuthenticatedSpecialist/);
  assert.match(claimApi,/participant_claim_scope_not_editable/);
  assert.match(ownerApi,/private, no-store/);
  assert.match(claimApi,/private, no-store/);
  assert.match(ownerApi,/noindex, nofollow/);
  assert.match(claimApi,/noindex, nofollow/);
});
