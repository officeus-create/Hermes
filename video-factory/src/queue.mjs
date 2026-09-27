import { createVideoIdempotencyKey, validateVideoJob } from "./contracts.mjs";

export const VIDEO_QUEUE_STATES = Object.freeze([
  "QUEUED",
  "MEDIA_PENDING",
  "MEDIA_READY",
  "RENDER_PENDING",
  "RENDER_READY",
  "QA_PENDING",
  "READY_TO_PUBLISH",
  "PUBLISHED",
  "FAILED",
  "CANCELLED",
]);

export const VIDEO_PROVIDER_STATES = Object.freeze(["pending", "running", "succeeded", "failed"]);

const clone = (value) => structuredClone(value);
const clean = (value, max = 1000) => String(value ?? "").trim().slice(0, max);

const transitions = Object.freeze({
  QUEUED: ["MEDIA_PENDING", "RENDER_PENDING", "CANCELLED"],
  MEDIA_PENDING: ["MEDIA_READY", "FAILED", "CANCELLED"],
  MEDIA_READY: ["RENDER_PENDING", "CANCELLED"],
  RENDER_PENDING: ["RENDER_READY", "FAILED", "CANCELLED"],
  RENDER_READY: ["QA_PENDING", "CANCELLED"],
  QA_PENDING: ["READY_TO_PUBLISH", "FAILED", "CANCELLED"],
  READY_TO_PUBLISH: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: [],
  FAILED: ["QUEUED", "CANCELLED"],
  CANCELLED: [],
});

export function canTransitionVideoQueueState(from, to) {
  return Boolean(transitions[from]?.includes(to));
}

const assertTransition = (from, to) => {
  if (!canTransitionVideoQueueState(from, to)) throw new Error(`video_state_transition_invalid:${from}->${to}`);
};

export class MemoryVideoJobStore {
  constructor() {
    this.records = new Map();
    this.idempotency = new Map();
    this.providerJobs = new Map();
    this.events = new Set();
  }

  async get(jobId) {
    const record = this.records.get(jobId);
    return record ? clone(record) : null;
  }

  async put(record) {
    this.records.set(record.jobId, clone(record));
    this.idempotency.set(record.queueKey, record.jobId);
    for (const receipt of Object.values(record.providers || {})) {
      if (receipt?.provider && receipt?.providerJobId) {
        this.providerJobs.set(`${receipt.provider}:${receipt.providerJobId}`, record.jobId);
      }
    }
    return this.get(record.jobId);
  }

  async findByQueueKey(queueKey) {
    const jobId = this.idempotency.get(queueKey);
    return jobId ? this.get(jobId) : null;
  }

  async findByProviderJob(provider, providerJobId) {
    const jobId = this.providerJobs.get(`${provider}:${providerJobId}`);
    return jobId ? this.get(jobId) : null;
  }

  async hasEvent(eventId) {
    return this.events.has(eventId);
  }

  async markEvent(eventId) {
    this.events.add(eventId);
  }
}

export function createVideoQueueRecord(job, now = new Date().toISOString()) {
  const validation = validateVideoJob(job);
  if (!validation.ok) throw new Error(`video_job_invalid:${validation.errors.join("|")}`);
  return {
    jobId: job.jobId,
    queueKey: createVideoIdempotencyKey(job, "queue"),
    state: "QUEUED",
    job: clone(job),
    providers: {
      media: null,
      render: null,
    },
    qa: {
      state: "pending",
      reviewedAt: null,
      reviewer: null,
      note: "",
    },
    publication: {
      publishedAt: null,
      destination: null,
      providerReceipt: null,
    },
    failure: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function enqueueVideoJob({ store, job, now = new Date().toISOString() }) {
  const queueKey = createVideoIdempotencyKey(job, "queue");
  const existing = await store.findByQueueKey(queueKey);
  if (existing) return { record: existing, deduplicated: true };
  const record = createVideoQueueRecord(job, now);
  await store.put(record);
  return { record, deduplicated: false };
}

export async function transitionVideoJob({ store, jobId, nextState, now = new Date().toISOString() }) {
  const record = await store.get(jobId);
  if (!record) throw new Error("video_job_not_found");
  assertTransition(record.state, nextState);
  record.state = nextState;
  record.updatedAt = now;
  await store.put(record);
  return record;
}

const stageKey = (stage) => {
  if (stage === "media") return "media";
  if (stage === "render") return "render";
  throw new Error("video_provider_stage_invalid");
};

export async function captureProviderSubmission({
  store,
  jobId,
  stage,
  provider,
  providerJobId,
  idempotencyKey,
  now = new Date().toISOString(),
}) {
  const record = await store.get(jobId);
  if (!record) throw new Error("video_job_not_found");
  const key = stageKey(stage);
  const expectedState = stage === "media" ? "MEDIA_PENDING" : "RENDER_PENDING";
  if (record.state !== expectedState) throw new Error(`video_provider_submission_state_invalid:${record.state}`);
  const previous = record.providers[key];
  if (previous) {
    if (previous.provider !== provider || previous.providerJobId !== providerJobId || previous.idempotencyKey !== idempotencyKey) {
      throw new Error("video_provider_submission_conflict");
    }
    return { record, deduplicated: true };
  }
  record.providers[key] = {
    provider: clean(provider, 80),
    providerJobId: clean(providerJobId, 180),
    idempotencyKey: clean(idempotencyKey, 300),
    state: "running",
    outputUrl: null,
    error: null,
    submittedAt: now,
    completedAt: null,
  };
  record.updatedAt = now;
  await store.put(record);
  return { record: await store.get(jobId), deduplicated: false };
}

const safeOutputUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

export async function applyVideoProviderEvent({
  store,
  eventId,
  provider,
  providerJobId,
  status,
  outputUrl = null,
  error = "",
  occurredAt = new Date().toISOString(),
}) {
  const normalizedEventId = clean(eventId, 240);
  if (!normalizedEventId) throw new Error("video_provider_event_id_required");
  if (await store.hasEvent(normalizedEventId)) {
    const existing = await store.findByProviderJob(provider, providerJobId);
    return { record: existing, deduplicated: true };
  }
  if (!VIDEO_PROVIDER_STATES.includes(status)) throw new Error("video_provider_state_invalid");
  const record = await store.findByProviderJob(provider, providerJobId);
  if (!record) throw new Error("video_provider_job_not_found");
  const stage = Object.entries(record.providers).find(([, receipt]) =>
    receipt?.provider === provider && receipt?.providerJobId === providerJobId
  )?.[0];
  if (!stage) throw new Error("video_provider_stage_not_found");
  const receipt = record.providers[stage];
  receipt.state = status;
  receipt.error = status === "failed" ? clean(error, 500) || "provider_failed" : null;
  receipt.outputUrl = status === "succeeded" ? safeOutputUrl(outputUrl) : receipt.outputUrl;
  receipt.completedAt = ["succeeded", "failed"].includes(status) ? occurredAt : null;
  record.updatedAt = occurredAt;

  if (status === "failed") {
    if (record.state !== "FAILED") assertTransition(record.state, "FAILED");
    record.state = "FAILED";
    record.failure = { stage, provider, error: receipt.error, occurredAt };
  } else if (status === "succeeded") {
    const nextState = stage === "media" ? "MEDIA_READY" : "RENDER_READY";
    if (record.state !== nextState) assertTransition(record.state, nextState);
    record.state = nextState;
    record.failure = null;
  }

  await store.put(record);
  await store.markEvent(normalizedEventId);
  return { record: await store.get(record.jobId), deduplicated: false };
}

export async function beginVideoQa({ store, jobId, now = new Date().toISOString() }) {
  return transitionVideoJob({ store, jobId, nextState: "QA_PENDING", now });
}

export async function completeVideoQa({
  store,
  jobId,
  approved,
  reviewer,
  note = "",
  now = new Date().toISOString(),
}) {
  const record = await store.get(jobId);
  if (!record) throw new Error("video_job_not_found");
  if (record.state !== "QA_PENDING") throw new Error("video_qa_state_invalid");
  if (!approved) {
    assertTransition(record.state, "FAILED");
    record.state = "FAILED";
    record.failure = { stage: "qa", provider: null, error: clean(note, 500) || "qa_rejected", occurredAt: now };
    record.qa = { state: "rejected", reviewedAt: now, reviewer: clean(reviewer, 120), note: clean(note, 1000) };
  } else {
    if (record.job.approval?.state !== "approved") throw new Error("video_publication_approval_required");
    assertTransition(record.state, "READY_TO_PUBLISH");
    record.state = "READY_TO_PUBLISH";
    record.qa = { state: "approved", reviewedAt: now, reviewer: clean(reviewer, 120), note: clean(note, 1000) };
  }
  record.updatedAt = now;
  await store.put(record);
  return store.get(jobId);
}

export async function markVideoPublished({
  store,
  jobId,
  destination,
  providerReceipt,
  now = new Date().toISOString(),
}) {
  const record = await store.get(jobId);
  if (!record) throw new Error("video_job_not_found");
  if (record.state !== "READY_TO_PUBLISH") throw new Error("video_publish_state_invalid");
  if (record.job.publishing?.publicDistribution === true && record.job.approval?.state !== "approved") {
    throw new Error("video_publication_approval_required");
  }
  assertTransition(record.state, "PUBLISHED");
  record.state = "PUBLISHED";
  record.publication = {
    publishedAt: now,
    destination: clean(destination, 500),
    providerReceipt: clean(providerReceipt, 500),
  };
  record.updatedAt = now;
  await store.put(record);
  return store.get(jobId);
}
