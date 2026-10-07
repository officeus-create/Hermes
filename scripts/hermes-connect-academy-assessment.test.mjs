import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import {
  onRequestGet as getOwnerAssessments,
  onRequestPost as mutateOwnerAssessments,
} from "../functions/api/hermes-connect/academy/assessments.ts";
import {
  onRequestGet as getCandidateAssessment,
  onRequestPost as mutateCandidateAssessment,
} from "../functions/api/hr/academy-assessment.ts";
import { ensureHrSchema, sha256Hex } from "../functions/api/_lib/hr.mjs";

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

function seedIdentity(sqlite,id,token,email) {
  sqlite.prepare("INSERT INTO specialists (id,email,name,role,location,bio) VALUES (?,?,?,?,?,?)")
    .run(id,email,"Academy Owner","Academy Business Owner","Kyiv, Ukraine","Synthetic assessment owner.");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)")
    .run(token,id,"2099-01-01T00:00:00.000Z");
}

function ownerRequest(path,token,body=null) {
  return new Request(`https://hermes.example${path}`,{
    method:body?"POST":"GET",
    headers:{
      Cookie:`hermes_session=${token}`,
      Origin:"https://hermes.example",
      ...(body?{"Content-Type":"application/json"}:{}),
    },
    ...(body?{body:JSON.stringify(body)}:{}),
  });
}

function candidateRequest(path,candidateToken,body=null) {
  return new Request(`https://hermeslogisticsus.com${path}`,{
    method:body?"POST":"GET",
    headers:{
      Origin:"https://hermeslogisticsus.com",
      "X-HR-Candidate-Token":candidateToken,
      ...(body?{"Content-Type":"application/json"}:{}),
    },
    ...(body?{body:JSON.stringify(body)}:{}),
  });
}

async function setupAcademy(db,token,name) {
  const response=await saveAcademyBusiness({
    request:ownerRequest("/api/hermes-connect/academy/business",token,{
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

async function seedCandidate(db,candidateId,candidateToken,email) {
  await ensureHrSchema(db);
  const now="2026-10-07T09:00:00.000Z";
  await db.prepare(`
    INSERT INTO hr_candidates (
      id,access_token_hash,name,email,telegram_handle,country,language,source,track,
      attribution_json,consent_at,specialist_id,status,created_at,updated_at
    ) VALUES (?,?,?,?,NULL,'Ukraine','uk','assessment-test','marketing','{}',?,NULL,'completed',?,?)
  `).bind(candidateId,await sha256Hex(candidateToken),"Synthetic Candidate",email,now,now,now).run();
}

const fullScores={
  evidence_diagnosis:5,
  audience_positioning:4,
  funnel_logic:4,
  readiness_offer:5,
  kpi_measurement:4,
  execution_thinking:3,
};

test("Academy assessment explicitly links an existing HR candidate and keeps the 30-point review human-only", async()=>{
  const {sqlite,db}=makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner-one@example.com");
  await setupAcademy(db,"owner-token-one","Synthetic Assessment Academy");
  const candidateId="hr_candidate_assessment_000000000001";
  const candidateToken="candidate-token-000000000000000000000000000000000000000000000001";
  await seedCandidate(db,candidateId,candidateToken,"candidate-one@example.com");

  const templateResponse=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"create_template",
      title:"Marketing work sample",
      roleTitle:"Marketing Lead",
      brief:"Analyze one business social channel, prove the baseline, and design an evidence-gated organic to paid learning path.",
      submissionFormat:"google_docs_mindmap",
      sources:["https://example.com/source-one","https://example.com/source-two"],
    }),
    env:{DB:db},
  });
  assert.equal(templateResponse.status,201);
  const templateBody=await templateResponse.json();
  assert.equal(templateBody.template.rubric.length,6);
  assert.equal(templateBody.template.rubric.reduce((sum,row)=>sum+row.maxScore,0),30);

  const assignmentResponse=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"create_assignment",
      templateId:templateBody.template.id,
      deadlineAt:"2099-10-10T18:00:00.000Z",
    }),
    env:{DB:db},
  });
  assert.equal(assignmentResponse.status,201);
  const assignmentBody=await assignmentResponse.json();
  assert.equal(assignmentBody.assignment.candidateId,null);
  assert.equal(assignmentBody.tokenReturnedOnce,true);
  assert.ok(assignmentBody.assignmentToken.length>=48);
  const stored=sqlite.prepare("SELECT claim_token_hash,candidate_id FROM hr_assessment_assignments WHERE id=?").get(assignmentBody.assignment.id);
  assert.notEqual(stored.claim_token_hash,assignmentBody.assignmentToken);
  assert.equal(stored.candidate_id,null);

  const wrongClaim=await mutateCandidateAssessment({
    request:candidateRequest("/api/hr/academy-assessment",candidateToken,{
      action:"claim_assignment",
      candidateId,
      assignmentId:assignmentBody.assignment.id,
      assignmentToken:"wrong-assignment-token-that-is-long-enough-0000000000000000000000",
    }),
    env:{DB:db},
  });
  assert.equal(wrongClaim.status,403);

  const claim=await mutateCandidateAssessment({
    request:candidateRequest("/api/hr/academy-assessment",candidateToken,{
      action:"claim_assignment",
      candidateId,
      assignmentId:assignmentBody.assignment.id,
      assignmentToken:assignmentBody.assignmentToken,
    }),
    env:{DB:db},
  });
  assert.equal(claim.status,200);
  const claimBody=await claim.json();
  assert.equal(claimBody.assignment.candidateId,candidateId);
  assert.equal(claimBody.identityLink,"existing_hr_candidate_claim");

  const candidateScoreAttempt=await mutateCandidateAssessment({
    request:candidateRequest("/api/hr/academy-assessment",candidateToken,{
      action:"submit_assignment",
      candidateId,
      assignmentId:assignmentBody.assignment.id,
      googleDocRef:"https://docs.google.com/document/d/synthetic",
      mindmapRef:"https://example.com/mindmap",
      scores:fullScores,
      decision:"READY_FOR_FINAL_HUMAN_REVIEW",
    }),
    env:{DB:db},
  });
  assert.equal(candidateScoreAttempt.status,400);

  const submission=await mutateCandidateAssessment({
    request:candidateRequest("/api/hr/academy-assessment",candidateToken,{
      action:"submit_assignment",
      candidateId,
      assignmentId:assignmentBody.assignment.id,
      googleDocRef:"https://docs.google.com/document/d/synthetic",
      mindmapRef:"https://example.com/mindmap",
      notes:"Synthetic job-relevant work sample submission.",
    }),
    env:{DB:db},
  });
  assert.equal(submission.status,200);
  const submissionBody=await submission.json();
  assert.equal(submissionBody.assignment.state,"submitted");
  assert.equal(submissionBody.automatedHiringDecision,false);
  assert.equal(submissionBody.finalEmploymentDecision,false);

  const incompleteReview=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"review_submission",
      id:assignmentBody.assignment.id,
      scores:{...fullScores,execution_thinking:undefined},
      reviewerNotes:"Human reviewer notes with enough job-relevant detail.",
      decision:"READY_FOR_FINAL_HUMAN_REVIEW",
    }),
    env:{DB:db},
  });
  assert.equal(incompleteReview.status,400);

  const review=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"review_submission",
      id:assignmentBody.assignment.id,
      scores:fullScores,
      reviewerNotes:"Human reviewer assessed evidence, reasoning and execution against the role work sample.",
      decision:"READY_FOR_FINAL_HUMAN_REVIEW",
    }),
    env:{DB:db},
  });
  assert.equal(review.status,200);
  const reviewBody=await review.json();
  assert.equal(reviewBody.assignment.review.totalScore,25);
  assert.equal(reviewBody.assignment.review.automated,false);
  assert.equal(reviewBody.assignment.review.finalEmploymentDecision,false);
  assert.equal(reviewBody.automated,false);

  const candidateRead=await getCandidateAssessment({
    request:candidateRequest(`/api/hr/academy-assessment?candidate_id=${encodeURIComponent(candidateId)}&assignment_id=${encodeURIComponent(assignmentBody.assignment.id)}`,candidateToken),
    env:{DB:db},
  });
  assert.equal(candidateRead.status,200);
  const candidateReadBody=await candidateRead.json();
  assert.equal(candidateReadBody.assignment.review.totalScore,25);
  assert.equal(candidateReadBody.boundary.finalEmploymentDecision,false);

  const ownerDashboard=await getOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments?module=dashboard","owner-token-one"),
    env:{DB:db},
  });
  assert.equal(ownerDashboard.status,200);
  const ownerDashboardBody=await ownerDashboard.json();
  assert.equal(ownerDashboardBody.assignments[0].candidateId,candidateId);
  const serialized=JSON.stringify(ownerDashboardBody);
  assert.doesNotMatch(serialized,/candidate-one@example\.com/i);
  assert.doesNotMatch(serialized,/Synthetic Candidate/);
  assert.equal(ownerDashboardBody.boundary.candidateSearch,false);
});

test("Academy assessment is company-scoped, does not infer candidate identity, and archives instead of deleting", async()=>{
  const {sqlite,db}=makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","owner-token-one","owner-one@example.com");
  seedIdentity(sqlite,"owner-two","owner-token-two","owner-two@example.com");
  await setupAcademy(db,"owner-token-one","Owner One Academy");
  await setupAcademy(db,"owner-token-two","Owner Two Academy");

  const templateResponse=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"create_template",
      title:"Evidence assessment",
      roleTitle:"Marketing",
      brief:"Provide a job-relevant work sample with source evidence, KPI definitions, reasoning, and a measurable execution plan.",
      sources:["https://example.com/source"],
    }),
    env:{DB:db},
  });
  const templateBody=await templateResponse.json();

  const forbiddenAssignment=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"create_assignment",
      templateId:templateBody.template.id,
      deadlineAt:"2099-10-10T18:00:00.000Z",
      candidateEmail:"candidate@example.com",
    }),
    env:{DB:db},
  });
  assert.equal(forbiddenAssignment.status,400);

  const assignmentResponse=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"create_assignment",
      templateId:templateBody.template.id,
      deadlineAt:"2099-10-10T18:00:00.000Z",
    }),
    env:{DB:db},
  });
  const assignmentBody=await assignmentResponse.json();

  const ownerTwoReview=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-two",{
      action:"review_submission",
      id:assignmentBody.assignment.id,
      scores:fullScores,
      reviewerNotes:"Owner two must not access another company assignment.",
      decision:"MORE_EVIDENCE",
    }),
    env:{DB:db},
  });
  assert.equal(ownerTwoReview.status,404);

  const archived=await mutateOwnerAssessments({
    request:ownerRequest("/api/hermes-connect/academy/assessments","owner-token-one",{
      action:"archive_assignment",
      id:assignmentBody.assignment.id,
    }),
    env:{DB:db},
  });
  assert.equal(archived.status,200);
  const archivedBody=await archived.json();
  assert.ok(archivedBody.assignment.archivedAt);

  const libSource=readFileSync(new URL("../functions/api/_lib/hr-assessment.mjs",import.meta.url),"utf8");
  const ownerApiSource=readFileSync(new URL("../functions/api/hermes-connect/academy/assessments.ts",import.meta.url),"utf8");
  const candidateApiSource=readFileSync(new URL("../functions/api/hr/academy-assessment.ts",import.meta.url),"utf8");
  assert.doesNotMatch(libSource,/CREATE TABLE IF NOT EXISTS hr_candidates/);
  assert.doesNotMatch(libSource,/DELETE\s+FROM/i);
  assert.doesNotMatch(ownerApiSource,/DELETE\s+FROM/i);
  assert.doesNotMatch(candidateApiSource,/DELETE\s+FROM/i);
  assert.doesNotMatch(libSource,/AUTO_HIRE|AUTO_REJECT|HIRING_DECISION/);
  assert.doesNotMatch(ownerApiSource,/AUTO_HIRE|AUTO_REJECT|HIRING_DECISION/);
  assert.doesNotMatch(candidateApiSource,/AUTO_HIRE|AUTO_REJECT|HIRING_DECISION/);
  assert.match(ownerApiSource,/private, no-store/);
  assert.match(ownerApiSource,/noindex, nofollow/);
  assert.match(candidateApiSource,/private, no-store/);
  assert.match(candidateApiSource,/noindex, nofollow/);
});


test("Academy assessment owner workspace boots persisted assessment UI and keeps identity boundary visible", () => {
  const workspace = readFileSync(new URL("../src/pages/services/hermes-connect/academy/business/workspace/index.astro", import.meta.url), "utf8");
  const ownerApi = readFileSync(new URL("../functions/api/hermes-connect/academy/assessments.ts", import.meta.url), "utf8");
  assert.match(workspace, /data-assessment-template-form/);
  assert.match(workspace, /data-assessment-assignment-form/);
  assert.match(workspace, /data-assessment-review-form/);
  assert.match(workspace, /loadAssessments\(\)/);
  assert.match(workspace, /Promise\.all\(\[loadCrmCore\(\),loadProgramsCohorts\(\),loadMeasurement\(\),loadAssessments\(\)\]\)/);
  assert.match(workspace, /One-time token/);
  assert.match(workspace, /Final employment action.*canonical Hermes HR human-review flow/i);
  assert.match(ownerApi, /candidateSearch:\s*false/);
  assert.match(ownerApi, /candidateMustClaimWithExistingHrIdentity:\s*true/);
  assert.match(ownerApi, /assessment_candidate_must_claim_explicitly/);
  assert.doesNotMatch(ownerApi, /SELECT[\s\S]{0,500}FROM hr_candidates/i);
});
