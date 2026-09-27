import assert from "node:assert/strict";
import { VIDEO_JOB_SCHEMA_VERSION, createVideoIdempotencyKey } from "../src/contracts.mjs";
import {
  MemoryVideoJobStore,
  VIDEO_QUEUE_STATES,
  applyVideoProviderEvent,
  beginVideoQa,
  canTransitionVideoQueueState,
  captureProviderSubmission,
  completeVideoQa,
  enqueueVideoJob,
  markVideoPublished,
  transitionVideoJob,
} from "../src/queue.mjs";

const job={
  schemaVersion:VIDEO_JOB_SCHEMA_VERSION,
  jobId:"video_queue_001",
  businessLane:"progressopro_marketing",
  purpose:"social_reel",
  brandId:"hermes",
  templateId:"hermes-vertical-reel-v1",
  templateVersion:"1.0.0",
  format:{width:1080,height:1920,fps:30,durationSec:15},
  script:{hook:"One brief. Many approved outputs.",body:["Evidence first."],cta:"Review"},
  scenes:[
    {id:"hook",type:"kinetic_text",durationSec:5,template:"hook-v1"},
    {id:"proof",type:"metric_chart",durationSec:5,template:"proof-v1"},
    {id:"cta",type:"cta",durationSec:5,template:"cta-v1"},
  ],
  providers:{media:"none",render:"hyperframes"},
  governance:{privacyClass:"public",containsCurrentClaim:false,containsPrivateOperationalData:false},
  approval:{state:"approved",reviewer:"owner"},
  publishing:{publicDistribution:true,channels:["instagram"]},
};

assert.equal(VIDEO_QUEUE_STATES.includes("READY_TO_PUBLISH"),true);
assert.equal(canTransitionVideoQueueState("QUEUED","RENDER_PENDING"),true);
assert.equal(canTransitionVideoQueueState("QUEUED","PUBLISHED"),false);

const store=new MemoryVideoJobStore();
const first=await enqueueVideoJob({store,job});
assert.equal(first.deduplicated,false);
assert.equal(first.record.state,"QUEUED");
const duplicate=await enqueueVideoJob({store,job:structuredClone(job)});
assert.equal(duplicate.deduplicated,true);
assert.equal(duplicate.record.jobId,job.jobId);

await transitionVideoJob({store,jobId:job.jobId,nextState:"RENDER_PENDING"});
const providerKey=createVideoIdempotencyKey(job,"hyperframes:render");
const submit=await captureProviderSubmission({store,jobId:job.jobId,stage:"render",provider:"hyperframes",providerJobId:"render_123",idempotencyKey:providerKey});
assert.equal(submit.deduplicated,false);
const submitReplay=await captureProviderSubmission({store,jobId:job.jobId,stage:"render",provider:"hyperframes",providerJobId:"render_123",idempotencyKey:providerKey});
assert.equal(submitReplay.deduplicated,true);
await assert.rejects(
  ()=>captureProviderSubmission({store,jobId:job.jobId,stage:"render",provider:"hyperframes",providerJobId:"render_conflict",idempotencyKey:providerKey}),
  /video_provider_submission_conflict/
);

const webhook=await applyVideoProviderEvent({store,eventId:"evt_1",provider:"hyperframes",providerJobId:"render_123",status:"succeeded",outputUrl:"https://cdn.example.com/video.mp4"});
assert.equal(webhook.record.state,"RENDER_READY");
assert.equal(webhook.record.providers.render.outputUrl,"https://cdn.example.com/video.mp4");
const webhookReplay=await applyVideoProviderEvent({store,eventId:"evt_1",provider:"hyperframes",providerJobId:"render_123",status:"succeeded",outputUrl:"https://cdn.example.com/video.mp4"});
assert.equal(webhookReplay.deduplicated,true);

await beginVideoQa({store,jobId:job.jobId});
const qa=await completeVideoQa({store,jobId:job.jobId,approved:true,reviewer:"owner"});
assert.equal(qa.state,"READY_TO_PUBLISH");
const published=await markVideoPublished({store,jobId:job.jobId,destination:"instagram",providerReceipt:"post_123"});
assert.equal(published.state,"PUBLISHED");
assert.equal(published.publication.providerReceipt,"post_123");

const gatedStore=new MemoryVideoJobStore();
const gatedJob=structuredClone(job);
gatedJob.jobId="video_queue_002";
gatedJob.approval.state="draft";
gatedJob.publishing.publicDistribution=false;
await enqueueVideoJob({store:gatedStore,job:gatedJob});
await transitionVideoJob({store:gatedStore,jobId:gatedJob.jobId,nextState:"RENDER_PENDING"});
await captureProviderSubmission({store:gatedStore,jobId:gatedJob.jobId,stage:"render",provider:"hyperframes",providerJobId:"render_456",idempotencyKey:createVideoIdempotencyKey(gatedJob,"hyperframes:render")});
await applyVideoProviderEvent({store:gatedStore,eventId:"evt_2",provider:"hyperframes",providerJobId:"render_456",status:"succeeded"});
await beginVideoQa({store:gatedStore,jobId:gatedJob.jobId});
await assert.rejects(()=>completeVideoQa({store:gatedStore,jobId:gatedJob.jobId,approved:true,reviewer:"reviewer"}),/video_publication_approval_required/);

console.log("Video Factory queue/storage/provider state contract: PASS");
