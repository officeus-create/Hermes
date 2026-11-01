// Shared official Meta Threads transport primitives.
// Transport only: no scheduling, campaign policy, retries, qualification or UI ownership.
// Access tokens are carried in Authorization headers and must never appear in URLs/logs.

export const META_THREADS_GRAPH_BASE = "https://graph.threads.net/v1.0/";
const encoder = new TextEncoder();

export function normalizeThreadsText(value) {
  return typeof value === "string" ? value
    .replace(/\r\n?/g, "\n")
    .replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .split("\n").map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n").replace(/\n{3,}/g, "\n\n").trim() : "";
}

export function validateThreadsText(value) {
  const text = normalizeThreadsText(value);
  const bytes = encoder.encode(text).byteLength;
  if (!text) return { ok: false, error_class: "meta_threads_text_required", text, bytes };
  if (bytes > 500) return { ok: false, error_class: "meta_threads_text_too_long", text, bytes };
  return { ok: true, text, bytes };
}

export function safeThreadsPermalink(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:" || !["threads.com","www.threads.com","threads.net","www.threads.net"].includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function clean(value, max = 4096) {
  return String(value ?? "").trim().slice(0, max);
}
function numericId(value) {
  const id = clean(value, 160);
  return /^[0-9]{6,40}$/.test(id) ? id : null;
}
function normalizedUsername(value) {
  return clean(value, 160).replace(/^@/, "").toLowerCase();
}
function httpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
function normalizeProviderError(response, post) {
  if (response.status === 401 || response.status === 403) return "meta_threads_auth_rejected";
  if (response.status === 429) return "meta_threads_rate_limited";
  if (response.status >= 500) return post ? "provider_outcome_unknown" : "meta_threads_readback_unavailable";
  return "meta_threads_provider_rejected";
}

export function createMetaThreadsTransport({
  accessToken,
  accountId,
  expectedUsername,
  fetchImpl = fetch,
  graphBase = META_THREADS_GRAPH_BASE,
} = {}) {
  const token = clean(accessToken);
  const account = numericId(accountId);
  const username = normalizedUsername(expectedUsername);
  let base;
  try { base = new URL(String(graphBase || "")); } catch { return null; }
  if (token.length < 20 || token.length > 4096 || !account || !username ||
      base.protocol !== "https:" || base.hostname !== "graph.threads.net") return null;

  const authHeaders = () => ({ authorization: "Bearer " + token, accept: "application/json" });

  async function request(path, { params = {}, post = false } = {}) {
    const url = new URL(String(path || ""), base);
    if (url.protocol !== "https:" || url.hostname !== "graph.threads.net") {
      return { ok: false, error_class: "meta_threads_provider_url_invalid" };
    }
    const headers = authHeaders();
    const options = { method: post ? "POST" : "GET", headers };
    if (post) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      const body = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") body.set(key, String(value));
      }
      options.body = body.toString();
    } else {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
      }
    }
    try {
      const response = await fetchImpl(url.toString(), options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.error || payload?.success === false) {
        return { ok: false, provider_status: response.status, error_class: normalizeProviderError(response, post) };
      }
      if (!payload || typeof payload !== "object") return { ok: false, error_class: "meta_threads_invalid_response" };
      return { ok: true, provider_status: response.status, payload };
    } catch {
      return { ok: false, provider_status: null, error_class: post ? "provider_outcome_unknown" : "meta_threads_readback_unavailable" };
    }
  }

  function normalizeMediaRow(row) {
    const id = numericId(row?.id);
    const mediaType = clean(row?.media_type || "TEXT_POST", 80);
    const textMissingAllowed = mediaType !== "TEXT_POST" && (row?.text === null || row?.text === undefined);
    const timestamp = clean(row?.timestamp, 100);
    if (!id || (typeof row?.text !== "string" && !textMissingAllowed) || !Number.isFinite(Date.parse(timestamp))) return null;
    return {
      id,
      text: typeof row.text === "string" ? row.text : null,
      permalink: safeThreadsPermalink(row.permalink),
      timestamp,
      media_type: mediaType,
      username: normalizedUsername(row?.username) || null,
      is_reply: Boolean(row?.is_reply),
      is_quote_post: Boolean(row?.is_quote_post),
      replied_to: numericId(row?.replied_to?.id) ? { id: numericId(row.replied_to.id) } : null,
      root_post: numericId(row?.root_post?.id) ? { id: numericId(row.root_post.id) } : null,
      reposted_post: numericId(row?.reposted_post?.id) ? { id: numericId(row.reposted_post.id) } : null,
    };
  }

  async function verifyIdentity() {
    const result = await request("me", { params: { fields: "id,username" } });
    if (!result.ok) return result;
    const id = numericId(result.payload?.id);
    const actualUsername = normalizedUsername(result.payload?.username);
    if (id !== account || actualUsername !== username) {
      return {
        ok: false, error_class: "meta_threads_wrong_account",
        expected_account_id: account, observed_account_id: id,
        expected_username: username, observed_username: actualUsername || null,
      };
    }
    return { ok: true, account_id: account, username };
  }

  async function listRecentAuthored({ limit = 50, maxPages = 5 } = {}) {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 50));
    const pageLimit = Math.max(1, Math.min(5, Number(maxPages) || 5));
    const rows = [];
    const seenCursors = new Set();
    let after = null;
    for (let page = 0; page < pageLimit; page += 1) {
      const remaining = safeLimit - rows.length;
      const result = await request("me/threads", {
        params: {
          fields: "id,text,permalink,timestamp,media_type,username",
          limit: String(Math.max(1, remaining)),
          after: after || undefined,
        },
      });
      if (!result.ok) return result;
      const pageRows = result.payload?.data;
      if (!Array.isArray(pageRows) || pageRows.length > remaining) return { ok: false, error_class: "meta_threads_invalid_feed" };
      for (const row of pageRows) {
        const normalized = normalizeMediaRow(row);
        if (!normalized) return { ok: false, error_class: "meta_threads_invalid_feed" };
        rows.push(normalized);
      }
      const nextAfter = clean(result.payload?.paging?.cursors?.after, 600);
      const hasNext = Boolean(result.payload?.paging?.next);
      if (rows.length >= safeLimit) {
        return { ok: true, rows: rows.slice(0, safeLimit), complete: true, requested_limit: safeLimit };
      }
      if (!nextAfter) {
        if (hasNext) return { ok: false, error_class: "meta_threads_history_incomplete" };
        return { ok: true, rows, complete: true, requested_limit: safeLimit, history_exhausted: true };
      }
      if (seenCursors.has(nextAfter)) return { ok: false, error_class: "meta_threads_history_incomplete" };
      seenCursors.add(nextAfter);
      after = nextAfter;
    }
    return { ok: false, error_class: "meta_threads_history_incomplete" };
  }

  async function collectReadPages(path,{params={},limit=50,maxPages=3}={}){
    const safeLimit=Math.max(1,Math.min(100,Number(limit)||50));
    const pageLimit=Math.max(1,Math.min(5,Number(maxPages)||3));
    const rows=[];
    const seenIds=new Set();
    const seenCursors=new Set();
    let after=null;
    for(let page=0;page<pageLimit&&rows.length<safeLimit;page+=1){
      const result=await request(path,{params:{...params,limit:String(Math.min(100,safeLimit-rows.length)),after:after||undefined}});
      if(!result.ok)return{...result,rows,complete:false,pages:page};
      const batch=result.payload?.data;
      if(!Array.isArray(batch))return{ok:false,error_class:"meta_threads_invalid_response",rows,complete:false,pages:page+1};
      for(const raw of batch){
        const row=normalizeMediaRow(raw);
        if(!row)return{ok:false,error_class:"meta_threads_invalid_response",rows,complete:false,pages:page+1};
        if(seenIds.has(row.id))continue;
        seenIds.add(row.id);
        rows.push(row);
        if(rows.length>=safeLimit)break;
      }
      const nextAfter=clean(result.payload?.paging?.cursors?.after,600);
      const hasNext=Boolean(result.payload?.paging?.next);
      if(rows.length>=safeLimit)return{ok:true,rows:rows.slice(0,safeLimit),complete:!hasNext,pages:page+1,limit_reached:true};
      if(!nextAfter)return{ok:true,rows,complete:!hasNext,pages:page+1,limit_reached:false};
      if(seenCursors.has(nextAfter))return{ok:false,error_class:"meta_threads_pagination_loop",rows,complete:false,pages:page+1};
      seenCursors.add(nextAfter);
      after=nextAfter;
    }
    return{ok:true,rows,complete:false,pages:pageLimit,limit_reached:true};
  }

  async function listMentions({limit=50,maxPages=2}={}){
    return collectReadPages("me/mentions",{
      params:{fields:"id,text,permalink,timestamp,media_type,username,is_reply,is_quote_post,replied_to,root_post"},
      limit,maxPages,
    });
  }

  async function listReplies(threadId,{limit=50,maxPages=2}={}){
    const id=numericId(threadId);
    if(!id)return{ok:false,error_class:"invalid_threads_media_id"};
    return collectReadPages(id+"/replies",{
      params:{fields:"id,text,permalink,timestamp,media_type,username,is_reply,is_quote_post,replied_to,root_post"},
      limit,maxPages,
    });
  }

  async function listConversation(threadId,{limit=100,maxPages=3}={}){
    const id=numericId(threadId);
    if(!id)return{ok:false,error_class:"invalid_threads_media_id"};
    return collectReadPages(id+"/conversation",{
      params:{fields:"id,text,permalink,timestamp,media_type,username,is_reply,is_quote_post,replied_to,root_post",reverse:"false"},
      limit,maxPages,
    });
  }

  async function searchPublic(query,{searchType="RECENT",limit=25}={}){
    const q=clean(query,180);
    if(q.length<2)return{ok:false,error_class:"threads_query_too_short"};
    const safeLimit=Math.max(1,Math.min(100,Number(limit)||25));
    const type=String(searchType||"RECENT").toUpperCase()==="TOP"?"TOP":"RECENT";
    const result=await request("keyword_search",{
      params:{q,search_type:type,limit:String(safeLimit),fields:"id,text,permalink,timestamp,media_type,username,is_reply,is_quote_post,replied_to,root_post"},
    });
    if(!result.ok)return result;
    if(!Array.isArray(result.payload?.data))return{ok:false,error_class:"meta_threads_invalid_response"};
    const rows=[];
    for(const raw of result.payload.data){
      const row=normalizeMediaRow(raw);
      if(!row)return{ok:false,error_class:"meta_threads_invalid_response"};
      rows.push(row);
    }
    return{ok:true,rows,complete:false,ranked_results:true,query:q,search_type:type};
  }

  async function createContainer(values) {
    const result = await request("me/threads", { post: true, params: values });
    if (!result.ok) return result;
    const id = numericId(result.payload?.id);
    return id ? { ok: true, container_id: id } : { ok: false, error_class: "provider_outcome_unknown" };
  }

  async function publishContainer(containerId) {
    const creationId = numericId(containerId);
    if (!creationId) return { ok: false, error_class: "invalid_threads_container_id" };
    const result = await request("me/threads_publish", { post: true, params: { creation_id: creationId } });
    if (!result.ok) return result;
    const id = numericId(result.payload?.id);
    if (!id) return { ok: false, error_class: "provider_outcome_unknown" };
    return { ok: true, provider_status: result.provider_status, outcome_known: true, provider_object_id: id };
  }

  async function publishText(text) {
    const validated = validateThreadsText(text);
    if (!validated.ok) return validated;
    const container = await createContainer({ media_type: "TEXT", text: validated.text });
    if (!container.ok) return container;
    return publishContainer(container.container_id);
  }

  async function publishImage({ text = "", imageUrl }) {
    const validated = text ? validateThreadsText(text) : { ok: true, text: "" };
    if (!validated.ok) return validated;
    const image = httpsUrl(imageUrl);
    if (!image) return { ok: false, error_class: "threads_image_requires_https_url" };
    const container = await createContainer({ media_type: "IMAGE", image_url: image, text: validated.text || undefined });
    if (!container.ok) return container;
    return publishContainer(container.container_id);
  }

  async function publishCarousel({ text = "", imageUrls = [] }) {
    const validated = text ? validateThreadsText(text) : { ok: true, text: "" };
    if (!validated.ok) return validated;
    const urls = [...new Set((Array.isArray(imageUrls) ? imageUrls : []).map(httpsUrl).filter(Boolean))].slice(0, 10);
    if (urls.length < 2) return { ok: false, error_class: "threads_carousel_requires_2_to_10_https_images" };
    const children = [];
    for (const image of urls) {
      const child = await createContainer({ media_type: "IMAGE", image_url: image, is_carousel_item: "true" });
      if (!child.ok) return child;
      children.push(child.container_id);
    }
    const parent = await createContainer({ media_type: "CAROUSEL", children: children.join(","), text: validated.text || undefined });
    if (!parent.ok) return parent;
    return publishContainer(parent.container_id);
  }

  async function publishReply({ text, replyToId }) {
    const validated = validateThreadsText(text);
    const target = numericId(replyToId);
    if (!validated.ok) return validated;
    if (!target) return { ok: false, error_class: "invalid_reply_target" };
    const result = await request("me/threads", {
      post: true,
      params: { media_type: "TEXT", text: validated.text, reply_to_id: target, auto_publish_text: "true" },
    });
    if (!result.ok) return result;
    const providerId = numericId(result.payload?.id);
    if (!providerId) return { ok: false, error_class: "provider_outcome_unknown" };
    return { ok: true, provider_status: result.provider_status, outcome_known: true, provider_object_id: providerId, reply_to_id: target };
  }

  async function readMedia(mediaId) {
    const id = numericId(mediaId);
    if (!id) return { ok: false, error_class: "invalid_threads_media_id" };
    const result = await request(id, {
      params: { fields: "id,media_product_type,media_type,permalink,username,text,timestamp" },
    });
    if (!result.ok) return result;
    const observedId = numericId(result.payload?.id);
    if (!observedId) return { ok: false, error_class: "meta_threads_invalid_response" };
    return {
      ok: true,
      media: {
        id: observedId,
        media_product_type: clean(result.payload?.media_product_type, 80),
        media_type: clean(result.payload?.media_type, 80),
        permalink: safeThreadsPermalink(result.payload?.permalink),
        username: normalizedUsername(result.payload?.username) || null,
        text: String(result.payload?.text || "").slice(0, 2000),
        timestamp: clean(result.payload?.timestamp, 100),
        is_quote_post: Boolean(result.payload?.is_quote_post),
        is_reply: Boolean(result.payload?.is_reply),
        replied_to: numericId(result.payload?.replied_to?.id) ? { id: numericId(result.payload.replied_to.id) } : null,
        root_post: numericId(result.payload?.root_post?.id) ? { id: numericId(result.payload.root_post.id) } : null,
        reposted_post: numericId(result.payload?.reposted_post?.id) ? { id: numericId(result.payload.reposted_post.id) } : null,
      },
    };
  }

  return Object.freeze({
    accountId: account,
    expectedUsername: username,
    verifyIdentity,
    listRecentAuthored,
    listMentions,
    listReplies,
    listConversation,
    searchPublic,
    publishText,
    publishImage,
    publishCarousel,
    publishReply,
    readMedia,
  });
}
