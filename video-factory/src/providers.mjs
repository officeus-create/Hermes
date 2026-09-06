import { createVideoIdempotencyKey } from "./contracts.mjs";

const DEFAULT_HEYGEN_BASE_URL = "https://api.heygen.com";

const requireValue = (value, name) => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${name} is required.`);
  return value;
};

const parseJsonResponse = async (response, provider) => {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${provider} returned non-JSON response (${response.status}).`);
  }
  if (!response.ok) {
    const message = body?.error?.message ?? body?.message ?? text ?? `${provider} request failed.`;
    throw new Error(`${provider} ${response.status}: ${message}`);
  }
  return body;
};

const isTemplateScalar = (value) => ["string", "number", "boolean"].includes(typeof value);
const HYPERFRAMES_RESERVED_VARIABLES = new Set(["job_id", "brand_id", "purpose", "hook", "body", "cta", "template_version"]);

export const buildHyperFramesTemplateVariables = ({ job }) => {
  const body = Array.isArray(job?.script?.body)
    ? job.script.body.filter((line) => typeof line === "string" && line.trim() !== "").join(" ")
    : typeof job?.script?.body === "string"
      ? job.script.body
      : "";

  const variables = {
    job_id: job?.jobId ?? "",
    brand_id: job?.brandId ?? "",
    purpose: job?.purpose ?? "",
    hook: job?.script?.hook ?? "",
    body,
    cta: job?.script?.cta ?? "",
    template_version: job?.templateVersion ?? "",
  };

  const overrides = job?.templateVariables ?? {};
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new Error("VideoJob templateVariables must be an object when provided.");
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      throw new Error(`VideoJob templateVariables key ${key} must use lower_snake_case.`);
    }
    if (HYPERFRAMES_RESERVED_VARIABLES.has(key)) {
      throw new Error(`VideoJob templateVariables.${key} cannot override a reserved render variable.`);
    }
    if (!isTemplateScalar(value)) {
      throw new Error(`VideoJob templateVariables.${key} must be a scalar string, number, or boolean.`);
    }
    variables[key] = value;
  }

  return variables;
};

export const buildHeyGenAvatarPayload = ({ job, scene, avatarId, voiceId, callbackUrl }) => {
  requireValue(avatarId, "avatarId");
  if (!scene || scene.type !== "avatar") throw new Error("HeyGen avatar adapter requires an avatar scene.");
  const script = requireValue(scene.script ?? job?.script?.body?.join(" ") ?? job?.script?.hook, "avatar script");

  const payload = {
    type: "avatar",
    avatar_id: avatarId,
    script,
    title: `${job.jobId}:${scene.id}`,
    resolution: "1080p",
    aspect_ratio: "9:16",
    output_format: "mp4",
    caption: { file_format: "srt" },
    callback_id: `${job.jobId}:${scene.id}`,
  };

  if (voiceId) payload.voice_id = voiceId;
  if (callbackUrl) payload.callback_url = callbackUrl;
  if (scene.motionPrompt) payload.motion_prompt = scene.motionPrompt;
  if (scene.engine === "avatar_v") payload.engine = { type: "avatar_v" };
  if (job.brandGlossaryId) payload.brand_glossary_id = job.brandGlossaryId;

  return payload;
};

export const createHeyGenAvatarVideo = async ({
  apiKey,
  job,
  scene,
  avatarId,
  voiceId,
  callbackUrl,
  fetchImpl = fetch,
  baseUrl = DEFAULT_HEYGEN_BASE_URL,
}) => {
  requireValue(apiKey, "HeyGen apiKey");
  const payload = buildHeyGenAvatarPayload({ job, scene, avatarId, voiceId, callbackUrl });
  // HeyGen mutation dedupe is owned by our queue/job store unless provider-level
  // idempotency is explicitly supported for this endpoint. callback_id carries
  // our deterministic job/scene identity for reconciliation.
  const response = await fetchImpl(`${baseUrl}/v3/videos`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonResponse(response, "HeyGen");
  const videoId = body?.data?.video_id ?? body?.video_id;
  if (!videoId) throw new Error("HeyGen response did not contain video_id.");
  return { provider: "heygen", providerJobId: videoId, raw: body };
};

export const buildHyperFramesRenderPayload = ({ job, templateAssetId, callbackUrl }) => {
  requireValue(templateAssetId, "templateAssetId");
  return {
    project: { type: "asset_id", asset_id: templateAssetId },
    fps: job.format.fps,
    quality: "standard",
    format: "mp4",
    resolution: "1080p",
    aspect_ratio: "9:16",
    composition: "index.html",
    variables: buildHyperFramesTemplateVariables({ job }),
    title: `${job.jobId}:${job.templateId}@${job.templateVersion}`,
    callback_id: job.jobId,
    ...(callbackUrl ? { callback_url: callbackUrl } : {}),
  };
};

export const createHyperFramesRender = async ({
  apiKey,
  job,
  templateAssetId,
  callbackUrl,
  fetchImpl = fetch,
  baseUrl = DEFAULT_HEYGEN_BASE_URL,
}) => {
  requireValue(apiKey, "HyperFrames/HeyGen apiKey");
  const payload = buildHyperFramesRenderPayload({ job, templateAssetId, callbackUrl });
  const response = await fetchImpl(`${baseUrl}/v3/hyperframes/renders`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "Idempotency-Key": createVideoIdempotencyKey(job, "hyperframes:render"),
    },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonResponse(response, "HyperFrames");
  const renderId = body?.data?.render_id ?? body?.render_id;
  if (!renderId) throw new Error("HyperFrames response did not contain render_id.");
  return { provider: "hyperframes", providerJobId: renderId, raw: body };
};

export const buildRemotionRenderRequest = ({ job }) => ({
  renderer: "remotion",
  compositionId: job.remotionCompositionId ?? "VerticalReel",
  inputProps: {
    jobId: job.jobId,
    brandId: job.brandId,
    hook: job.script?.hook ?? "",
    body: job.script?.body ?? [],
    cta: job.script?.cta ?? "",
    scenes: job.scenes,
    templateVersion: job.templateVersion,
  },
  output: {
    width: job.format.width,
    height: job.format.height,
    fps: job.format.fps,
    codec: "h264",
    container: "mp4",
  },
});
