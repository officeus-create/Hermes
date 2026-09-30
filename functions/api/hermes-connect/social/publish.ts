import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import {
  businessSocialPayloadFingerprint,
  completeBusinessSocialPublication,
  getBusinessSocialCredential,
  normalizeBusinessSocialProvider,
  publicBusinessSocialPublication,
  publishBusinessThreadsText,
  publishFacebookPagePost,
  publishInstagramCarousel,
  reserveBusinessSocialPublication,
  resolveOwnedSocialBusiness,
  validBusinessSocialIdempotencyKey,
} from "../../_lib/business-social.mjs";
import {
  publishInstagramSingleImage,
  publishInstagramStoryImage,
  publishThreadsCarousel,
  publishThreadsImage,
} from "../../_lib/business-social-studio.mjs";

type Env = {
  DB?: any;
  HERMES_SOCIAL_TOKEN_KEY?: string;
  HERMES_META_GRAPH_VERSION?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
};
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, headers);
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, headers);
  let body: Record<string, any>;
  try { body = await request.json() as Record<string, any>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }

  const provider = normalizeBusinessSocialProvider(body.provider);
  if (!provider) return jsonResponse(400, { success: false, error: "social_provider_invalid" }, headers);
  const idempotencyKey = validBusinessSocialIdempotencyKey(body.idempotency_key);
  if (!idempotencyKey) return jsonResponse(400, { success: false, error: "idempotency_key_invalid" }, headers);
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, String(body.vertical || ""));
  if (!business) return jsonResponse(409, { success: false, error: "business_profile_required" }, headers);

  const surface = String(body.surface || "feed").trim().toLowerCase();
  if (surface !== "feed" && !(provider === "instagram" && surface === "story")) {
    return jsonResponse(400, { success: false, error: "social_surface_invalid" }, headers);
  }
  const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : [];
  const payload = provider === "instagram"
    ? { surface, caption: String(body.caption || ""), image_urls: imageUrls }
    : provider === "threads"
      ? { surface, text: String(body.text || ""), image_urls: imageUrls }
      : { surface, text: String(body.text || "") };
  const objectType = provider === "instagram"
    ? (surface === "story" ? "INSTAGRAM_STORY" : imageUrls.length <= 1 ? "INSTAGRAM_IMAGE" : "INSTAGRAM_CAROUSEL")
    : provider === "threads"
      ? (imageUrls.length === 0 ? "THREADS_TEXT" : imageUrls.length === 1 ? "THREADS_IMAGE" : "THREADS_CAROUSEL")
      : "FACEBOOK_PAGE_POST";
  const fingerprint = await businessSocialPayloadFingerprint(provider, payload);
  const reservation = await reserveBusinessSocialPublication(env.DB, {
    business,
    provider,
    objectType,
    idempotencyKey,
    fingerprint,
    ownerId: specialist.id,
  });
  if (!reservation.inserted) {
    return jsonResponse(200, { success: true, duplicate: true, publication: publicBusinessSocialPublication(reservation.row) }, headers);
  }

  const credential = await getBusinessSocialCredential(env.DB, env, business, provider, specialist.id);
  if (!credential.ok) {
    const row = await completeBusinessSocialPublication(env.DB, reservation.row.id, {
      status: "blocked_authorization",
      lastError: credential.error_class,
    });
    return jsonResponse(409, { success: false, error: credential.error_class, publication: publicBusinessSocialPublication(row) }, headers);
  }

  let published: any;
  if (provider === "threads") {
    if (payload.image_urls.length === 0) published = await publishBusinessThreadsText(credential.payload, payload.text);
    else if (payload.image_urls.length === 1) published = await publishThreadsImage(credential.payload, payload.text, payload.image_urls[0]);
    else published = await publishThreadsCarousel(credential.payload, payload.text, payload.image_urls);
  } else if (provider === "facebook") {
    published = await publishFacebookPagePost(env, credential.payload, payload.text);
  } else if (surface === "story") {
    published = await publishInstagramStoryImage(env, credential.payload, payload.image_urls[0]);
  } else if (payload.image_urls.length === 1) {
    published = await publishInstagramSingleImage(env, credential.payload, payload.caption, payload.image_urls[0]);
  } else {
    published = await publishInstagramCarousel(env, credential.payload, payload.caption, payload.image_urls);
  }

  if (!published.ok) {
    const status = published.error_class === "provider_outcome_unknown" ? "unknown_outcome" : "provider_rejected";
    const row = await completeBusinessSocialPublication(env.DB, reservation.row.id, {
      status,
      lastError: published.error_class,
    });
    return jsonResponse(status === "unknown_outcome" ? 502 : 422, {
      success: false,
      error: published.error_class,
      publication: publicBusinessSocialPublication(row),
    }, headers);
  }

  const row = await completeBusinessSocialPublication(env.DB, reservation.row.id, {
    status: published.permalink ? "published_verified" : "published_readback_pending",
    providerMediaId: published.media_id,
    permalink: published.permalink || null,
    lastError: published.readback_ok === false ? "permalink_readback_pending" : null,
  });
  return jsonResponse(200, { success: true, duplicate: false, publication: publicBusinessSocialPublication(row) }, headers);
}
