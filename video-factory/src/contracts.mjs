export const VIDEO_JOB_SCHEMA_VERSION = "1.0";

export const videoBusinessLanes = [
  "logistics",
  "progressopro_marketing",
  "academy",
  "it_connect",
  "sales",
  "hr_recruiting",
  "seo_geo",
  "ceo_ops",
];

export const videoPurposes = [
  "social_reel",
  "case_study",
  "sales_followup",
  "recruiting_explainer",
  "academy_lesson",
  "product_demo",
  "seo_geo_explainer",
  "load_board_update",
  "internal_brief",
];

export const videoSceneTypes = [
  "kinetic_text",
  "avatar",
  "metric_chart",
  "footage",
  "screenshot",
  "title_card",
  "cta",
];

export const renderProviders = ["hyperframes", "remotion"];
export const mediaProviders = ["heygen", "none"];

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isPositiveNumber = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;

const fnv1a = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
};

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

export const createVideoInputHash = (job) => fnv1a(stableStringify(job));

export const createVideoIdempotencyKey = (job, stage) => {
  if (!isNonEmptyString(job?.jobId)) throw new Error("VideoJob jobId is required for idempotency.");
  if (!isNonEmptyString(stage)) throw new Error("Idempotency stage is required.");
  return `hermes-video:${job.jobId}:${stage}:${createVideoInputHash(job)}`;
};

export const routeScene = (scene) => {
  if (!scene || !videoSceneTypes.includes(scene.type)) {
    throw new Error(`Unsupported video scene type: ${scene?.type ?? "missing"}`);
  }

  if (scene.type === "avatar") {
    return {
      mediaProvider: "heygen",
      renderProvider: scene.renderProvider ?? "hyperframes",
    };
  }

  return {
    mediaProvider: scene.mediaProvider ?? "none",
    renderProvider: scene.renderProvider ?? "hyperframes",
  };
};

export const validateVideoJob = (job) => {
  const errors = [];
  const warnings = [];

  if (!job || typeof job !== "object") {
    return { ok: false, errors: ["VideoJob must be an object."], warnings };
  }

  if (job.schemaVersion !== VIDEO_JOB_SCHEMA_VERSION) errors.push(`schemaVersion must be ${VIDEO_JOB_SCHEMA_VERSION}.`);
  if (!isNonEmptyString(job.jobId)) errors.push("jobId is required.");
  if (!videoBusinessLanes.includes(job.businessLane)) errors.push("businessLane is not recognized.");
  if (!videoPurposes.includes(job.purpose)) errors.push("purpose is not recognized.");
  if (!isNonEmptyString(job.brandId)) errors.push("brandId is required.");
  if (!isNonEmptyString(job.templateId)) errors.push("templateId is required.");
  if (!isNonEmptyString(job.templateVersion)) errors.push("templateVersion is required and must be immutable for a render.");

  const format = job.format ?? {};
  if (format.width !== 1080 || format.height !== 1920) errors.push("PoC baseline requires 1080x1920 vertical output.");
  if (format.fps !== 30) warnings.push("30 fps is the current baseline; non-30 fps jobs require explicit QA.");
  if (!isPositiveNumber(format.durationSec) || format.durationSec > 180) errors.push("durationSec must be > 0 and <= 180 seconds.");

  if (!Array.isArray(job.scenes) || job.scenes.length === 0) {
    errors.push("At least one scene is required.");
  } else {
    let totalSceneDuration = 0;
    job.scenes.forEach((scene, index) => {
      if (!isNonEmptyString(scene.id)) errors.push(`scenes[${index}].id is required.`);
      if (!videoSceneTypes.includes(scene.type)) errors.push(`scenes[${index}].type is not recognized.`);
      if (!isPositiveNumber(scene.durationSec)) errors.push(`scenes[${index}].durationSec must be > 0.`);
      else totalSceneDuration += scene.durationSec;
      if (!isNonEmptyString(scene.template)) errors.push(`scenes[${index}].template is required.`);
      if (scene.renderProvider && !renderProviders.includes(scene.renderProvider)) {
        errors.push(`scenes[${index}].renderProvider is not supported.`);
      }
      if (scene.mediaProvider && !mediaProviders.includes(scene.mediaProvider)) {
        errors.push(`scenes[${index}].mediaProvider is not supported.`);
      }
      if (scene.type === "avatar" && !job.governance?.avatarConsentId) {
        errors.push("avatar scenes require governance.avatarConsentId.");
      }
    });

    if (isPositiveNumber(format.durationSec) && Math.abs(totalSceneDuration - format.durationSec) > 0.05) {
      errors.push(`Scene durations (${totalSceneDuration}s) must equal format.durationSec (${format.durationSec}s).`);
    }
  }

  const privacyClass = job.governance?.privacyClass;
  if (!['public', 'internal', 'restricted'].includes(privacyClass)) errors.push("governance.privacyClass must be public, internal, or restricted.");
  if (privacyClass !== "public" && job.publishing?.publicDistribution === true) {
    errors.push("Internal/restricted jobs cannot be marked for public distribution.");
  }
  if (job.governance?.containsCurrentClaim && !job.governance?.evidenceRef) {
    errors.push("Current market/performance claims require governance.evidenceRef.");
  }
  if (job.governance?.containsPrivateOperationalData && job.publishing?.publicDistribution === true) {
    errors.push("Private operational data cannot be distributed publicly.");
  }

  const preferredRenderProvider = job.providers?.render ?? "hyperframes";
  const preferredMediaProvider = job.providers?.media ?? "none";
  if (!renderProviders.includes(preferredRenderProvider)) errors.push("providers.render is not supported.");
  if (!mediaProviders.includes(preferredMediaProvider)) errors.push("providers.media is not supported.");

  if (job.approval?.state !== "approved" && job.publishing?.publicDistribution === true) {
    errors.push("Public distribution requires approval.state=approved.");
  }

  return { ok: errors.length === 0, errors, warnings };
};

export const videoLaneUseCases = [
  {
    businessLane: "logistics",
    examples: ["carrier education reels", "load-board explainers", "evidence-backed market updates", "agreement/onboarding explainers"],
  },
  {
    businessLane: "progressopro_marketing",
    examples: ["Reels/TikTok", "client case studies", "before/after KPI stories", "multilingual social variants"],
  },
  {
    businessLane: "academy",
    examples: ["micro-lessons", "roleplay explainers", "course trailers", "localized training clips"],
  },
  {
    businessLane: "it_connect",
    examples: ["Hermes Connect product demos", "feature releases", "repair-shop workflow explainers", "AI product walkthroughs"],
  },
  {
    businessLane: "sales",
    examples: ["personalized audit follow-ups", "proposal explainers", "objection-handling clips", "proof-led outreach videos"],
  },
  {
    businessLane: "hr_recruiting",
    examples: ["role explainers", "candidate onboarding", "training previews", "recruiting funnel videos"],
  },
  {
    businessLane: "seo_geo",
    examples: ["canonical-page explainer videos", "local-intent answer clips", "FAQ video derivatives", "evidence-backed GEO content"],
  },
  {
    businessLane: "ceo_ops",
    examples: ["internal briefs", "process-change explainers", "KPI summaries", "team operating updates"],
  },
];
