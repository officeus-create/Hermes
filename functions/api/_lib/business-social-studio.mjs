import {
  createMetaThreadsTransport,
  validateThreadsText,
  safeThreadsPermalink,
} from "../../../shared/social/meta-threads-provider.mjs";

const clean = (value, max = 240) => String(value ?? "").trim().slice(0, max);
const META_VERSION_FALLBACK = "v26.0";

function metaGraphVersion(env) {
  const value = clean(env?.HERMES_META_GRAPH_VERSION, 24);
  return /^v\d+\.\d+$/.test(value) ? value : META_VERSION_FALLBACK;
}
function metaBase(env) {
  return `https://graph.facebook.com/${metaGraphVersion(env)}/`;
}
function httpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
function normalizeImageUrls(values, max = 10) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const urls = [];
  for (const value of values) {
    const url = httpsUrl(value);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= max) break;
  }
  return urls;
}
async function providerJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null, network_error: true };
  }
}
function formBody(values) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === "") continue;
    out.set(key, String(value));
  }
  return out;
}

async function publishMetaContainer(env, igUserId, token, values) {
  const createUrl = new URL(`${clean(igUserId, 160)}/media`, metaBase(env));
  const created = await providerJson(createUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: formBody({ ...values, access_token: token }),
  });
  if (!created.ok || !created.data?.id) {
    return { ok: false, error_class: created.network_error ? "provider_outcome_unknown" : "provider_rejected" };
  }
  const publishUrl = new URL(`${clean(igUserId, 160)}/media_publish`, metaBase(env));
  const published = await providerJson(publishUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: formBody({ creation_id: clean(created.data.id, 240), access_token: token }),
  });
  if (!published.ok || !published.data?.id) {
    return { ok: false, error_class: published.network_error ? "provider_outcome_unknown" : "provider_rejected" };
  }
  return { ok: true, media_id: clean(published.data.id, 240) };
}

export async function publishInstagramSingleImage(env, credential, caption, imageUrl) {
  const image = httpsUrl(imageUrl);
  if (!image) return { ok: false, error_class: "instagram_image_requires_https_url" };
  const text = String(caption || "").trim();
  if (text.length > 2200) return { ok: false, error_class: "instagram_caption_too_long" };
  const igUserId = clean(credential?.ig_user_id, 160);
  const token = clean(credential?.access_token, 4096);
  if (!igUserId || !token) return { ok: false, error_class: "authorization_required" };
  const published = await publishMetaContainer(env, igUserId, token, { image_url: image, caption: text });
  if (!published.ok) return published;
  const readUrl = new URL(published.media_id, metaBase(env));
  readUrl.searchParams.set("fields", "id,permalink,timestamp,media_type");
  readUrl.searchParams.set("access_token", token);
  const readback = await providerJson(readUrl.toString(), { headers: { Accept: "application/json" } });
  return { ...published, permalink: readback.ok ? clean(readback.data?.permalink, 1500) : null, readback_ok: readback.ok };
}

export async function publishInstagramStoryImage(env, credential, imageUrl) {
  const image = httpsUrl(imageUrl);
  if (!image) return { ok: false, error_class: "instagram_story_requires_https_image" };
  const igUserId = clean(credential?.ig_user_id, 160);
  const token = clean(credential?.access_token, 4096);
  if (!igUserId || !token) return { ok: false, error_class: "authorization_required" };
  const published = await publishMetaContainer(env, igUserId, token, { media_type: "STORIES", image_url: image });
  if (!published.ok) return { ...published, error_class: published.error_class === "provider_rejected" ? "instagram_story_unavailable_or_rejected" : published.error_class };
  return { ...published, permalink: null, readback_ok: true };
}

function threadsTransportFromCredential(credential) {
  const userId = clean(credential?.threads_user_id, 160);
  const token = clean(credential?.access_token, 4096);
  const expectedUsername = clean(credential?.username, 160).replace(/^@/, "").toLowerCase();
  if (!userId || !token || !expectedUsername) return null;
  return createMetaThreadsTransport({
    accessToken: token,
    accountId: userId,
    expectedUsername,
  });
}

async function verifiedThreadsReadback(transport, providerObjectId, expectedText = null) {
  const readback = await transport.readMedia(providerObjectId);
  if (!readback.ok) return { permalink: null, readback_ok: false };
  const permalink = safeThreadsPermalink(readback.media?.permalink);
  const expectedUsername = transport.expectedUsername;
  const textOk = expectedText === null || String(readback.media?.text || "") === String(expectedText);
  const exact = Boolean(
    readback.media?.id === providerObjectId
    && readback.media?.username === expectedUsername
    && textOk
    && permalink
  );
  return { permalink: exact ? permalink : null, readback_ok: exact };
}

export async function publishThreadsImage(credential, text, imageUrl) {
  const validated = validateThreadsText(text);
  if (!validated.ok) return { ok: false, error_class: validated.error_class };
  const image = httpsUrl(imageUrl);
  if (!image) return { ok: false, error_class: "threads_image_requires_https_url" };
  const transport = threadsTransportFromCredential(credential);
  if (!transport) return { ok: false, error_class: "authorization_required" };
  const identity = await transport.verifyIdentity();
  if (!identity.ok) return identity;
  const published = await transport.publishImage({ text: validated.text, imageUrl: image });
  if (!published.ok) return published;
  const readback = await verifiedThreadsReadback(transport, published.provider_object_id, validated.text);
  return { ok: true, media_id: published.provider_object_id, ...readback };
}

export async function publishThreadsCarousel(credential, text, imageUrls) {
  const validated = validateThreadsText(text);
  if (!validated.ok) return { ok: false, error_class: validated.error_class };
  const urls = normalizeImageUrls(imageUrls, 10);
  if (urls.length < 2) return { ok: false, error_class: "threads_carousel_requires_2_to_10_https_images" };
  const transport = threadsTransportFromCredential(credential);
  if (!transport) return { ok: false, error_class: "authorization_required" };
  const identity = await transport.verifyIdentity();
  if (!identity.ok) return identity;
  const published = await transport.publishCarousel({ text: validated.text, imageUrls: urls });
  if (!published.ok) return published;
  const readback = await verifiedThreadsReadback(transport, published.provider_object_id, validated.text);
  return { ok: true, media_id: published.provider_object_id, ...readback };
}

export async function readRecentSocialMedia(env, credential, provider, limit = 6) {
  const max = Math.min(12, Math.max(1, Number(limit || 6)));
  const token = clean(credential?.access_token, 4096);
  if (!token) return { ok: false, error_class: "authorization_required", items: [] };

  if (provider === "instagram") {
    const accountId = clean(credential?.ig_user_id, 160);
    if (!accountId) return { ok: false, error_class: "authorization_required", items: [] };
    const url = new URL(`${accountId}/media`, metaBase(env));
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", String(max));
    url.searchParams.set("access_token", token);
    const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
    if (!result.ok || !Array.isArray(result.data?.data)) return { ok: false, error_class: "readback_failed", items: [] };
    return { ok: true, items: result.data.data.map((item) => ({
      id: clean(item?.id, 240), text: String(item?.caption || "").slice(0, 1600),
      media_type: clean(item?.media_type, 80), media_url: clean(item?.media_url || item?.thumbnail_url, 1500),
      permalink: clean(item?.permalink, 1500), timestamp: clean(item?.timestamp, 100),
    })) };
  }

  if (provider === "facebook") {
    const accountId = clean(credential?.page_id, 160);
    if (!accountId) return { ok: false, error_class: "authorization_required", items: [] };
    const url = new URL(`${accountId}/posts`, metaBase(env));
    url.searchParams.set("fields", "id,message,created_time,permalink_url,full_picture");
    url.searchParams.set("limit", String(max));
    url.searchParams.set("access_token", token);
    const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
    if (!result.ok || !Array.isArray(result.data?.data)) return { ok: false, error_class: "readback_failed", items: [] };
    return { ok: true, items: result.data.data.map((item) => ({
      id: clean(item?.id, 240), text: String(item?.message || "").slice(0, 1600),
      media_type: item?.full_picture ? "IMAGE" : "TEXT", media_url: clean(item?.full_picture, 1500),
      permalink: clean(item?.permalink_url, 1500), timestamp: clean(item?.created_time, 100),
    })) };
  }

  if (provider === "threads") {
    const transport = threadsTransportFromCredential(credential);
    if (!transport) return { ok: false, error_class: "authorization_required", items: [] };
    const identity = await transport.verifyIdentity();
    if (!identity.ok) return { ok: false, error_class: identity.error_class || "readback_failed", items: [] };
    const recent = await transport.listRecentAuthored({ limit: max, maxPages: 3 });
    if (!recent.ok || recent.complete !== true) return { ok: false, error_class: recent.error_class || "readback_failed", items: [] };
    return { ok: true, items: recent.rows.map((item) => ({
      id: clean(item?.id, 240),
      text: String(item?.text || "").slice(0, 1600),
      media_type: clean(item?.media_type, 80),
      media_url: "",
      permalink: clean(item?.permalink, 1500),
      timestamp: clean(item?.timestamp, 100),
      is_reply: Boolean(item?.is_reply),
      is_repost: Boolean(item?.reposted_post),
    })) };
  }

  return { ok: false, error_class: "social_provider_invalid", items: [] };
}
