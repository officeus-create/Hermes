// Read-only Threads discovery adapter for the existing Hermes owner-authenticated connector.
// Never crawl private endpoints, execute browser sessions, follow provider-supplied URLs,
// or include an access token in a URL, audit record, error message or client response.
const GRAPH = "https://graph.threads.com/v1.0/";
const POST_FIELDS = "id,text,username,permalink,shortcode,timestamp,media_type,has_replies,is_reply,is_quote_post";
const REPLY_FIELDS = "id,text,username,permalink,shortcode,timestamp,media_type,has_replies,is_reply,replied_to,root_post";
const MAX_PAGES = 5;
const MAX_ROWS = 500;

const clean = (value, max = 256) => String(value ?? "").trim().slice(0, max);

export function parsePublicThreadsPostUrl(value) {
  try {
    const url = new URL(String(value));
    if (url.protocol !== "https:" || !["threads.com", "www.threads.com", "threads.net", "www.threads.net"].includes(url.hostname)) return null;
    const match = /^\/@([A-Za-z0-9_.]{1,64})\/post\/([A-Za-z0-9_-]{5,30})\/?$/.exec(url.pathname);
    if (!match) return null;
    return {
      username: match[1].toLowerCase(),
      shortcode: match[2],
      url: "https://www.threads.com/@" + match[1].toLowerCase() + "/post/" + match[2],
    };
  } catch { return null; }
}

export function threadsReadMode(value) {
  return ["search", "thread", "owned"].includes(value) ? value : null;
}

export function threadsRequiredScope(mode, postUrl) {
  if (mode === "search") return ["threads_basic", "threads_keyword_search"];
  if (mode === "thread") return postUrl
    ? ["threads_basic", "threads_read_replies", "threads_profile_discovery"]
    : ["threads_basic", "threads_read_replies"];
  if (mode === "owned") return ["threads_basic"];
  return [];
}

function stripPost(item) {
  if (!item || typeof item !== "object" || !item.id) return null;
  const permalink = clean(item.permalink, 1500);
  return {
    id: clean(item.id, 160),
    text: clean(item.text, 2500),
    research_signal: classifyThreadsResearchText(clean(item.text, 2500)),
    username: clean(item.username, 160),
    permalink: /^https:\/\/(www\.)?threads\.(com|net)\//.test(permalink) ? permalink : null,
    shortcode: clean(item.shortcode, 50),
    timestamp: clean(item.timestamp, 100),
    media_type: clean(item.media_type, 60),
    has_replies: Boolean(item.has_replies),
    is_reply: Boolean(item.is_reply),
    is_quote_post: Boolean(item.is_quote_post),
    replied_to_id: clean(item.replied_to?.id, 160) || null,
    root_post_id: clean(item.root_post?.id, 160) || null,
  };
}

function providerError(status) {
  if (status === 401) return "provider_token_rejected";
  if (status === 403) return "provider_permission_denied";
  if (status === 404) return "provider_object_unavailable";
  if (status === 429) return "provider_rate_limited";
  return "provider_read_failed";
}

async function getGraph(path, params, token, transport = fetch) {
  const url = new URL(path, GRAPH);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  try {
    const response = await transport(url.toString(), {
      method: "GET",
      headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
      redirect: "error",
    });
    if (!response.ok) return { ok: false, error: providerError(response.status), provider_status: response.status };
    const json = await response.json();
    if (!json || typeof json !== "object" || json.error) return { ok: false, error: "provider_invalid_response" };
    return { ok: true, data: json };
  } catch { return { ok: false, error: "provider_network_unavailable" }; }
}

async function collectPages(path, params, token, transport, maxPages = MAX_PAGES) {
  const rows = [];
  const seenIds = new Set();
  const seenCursors = new Set();
  let after = "";
  let complete = false;
  let pages = 0;
  while (pages < maxPages && rows.length < MAX_ROWS) {
    const result = await getGraph(path, { ...params, after }, token, transport);
    if (!result.ok) return { ...result, partial: pages > 0, rows, pages, complete: false };
    if (!Array.isArray(result.data.data)) return { ok: false, error: "provider_invalid_response", partial: pages > 0, rows, pages, complete: false };
    pages++;
    const batch = result.data.data;
    for (const raw of batch) {
      const post = stripPost(raw);
      if (!post || seenIds.has(post.id)) continue;
      seenIds.add(post.id);
      rows.push(post);
      if (rows.length >= MAX_ROWS) break;
    }
    const next = clean(result.data.paging?.cursors?.after, 2048);
    if (!batch.length || !next || next === after || seenCursors.has(next)) {
      complete = !next || !batch.length;
      break;
    }
    seenCursors.add(next);
    after = next;
  }
  return { ok: true, rows, pages, complete, limit_reached: !complete };
}

export async function threadsSearchRead({ token, query, searchType = "RECENT", limit = 25, transport = fetch }) {
  const q = clean(query, 180);
  if (q.length < 2) return { ok: false, error: "query_too_short" };
  const type = searchType === "TOP" ? "TOP" : "RECENT";
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 25));
  const result = await getGraph("keyword_search", {
    q, search_type: type, limit: safeLimit, fields: POST_FIELDS,
  }, token, transport);
  if (!result.ok) return result;
  if (!Array.isArray(result.data.data)) return { ok: false, error: "provider_invalid_response" };
  return {
    ok: true, mode: "search", query: q, search_type: type,
    posts: result.data.data.map(stripPost).filter(Boolean),
    provider: "meta_threads_official",
    complete: false, // Meta keyword results are ranked and not an exhaustive public archive.
  };
}

export async function threadsOwnedRead({ token, transport = fetch }) {
  const result = await collectPages("me/threads", { fields: POST_FIELDS, limit: 50 }, token, transport, 2);
  return result.ok
    ? { ok: true, mode: "owned", posts: result.rows, pages: result.pages, complete: result.complete }
    : result;
}

export async function threadsResolvePublicPost({ token, postUrl, transport = fetch }) {
  const post = parsePublicThreadsPostUrl(postUrl);
  if (!post) return { ok: false, error: "invalid_public_post_url" };
  const page = await collectPages("profile_posts", {
    username: post.username, fields: POST_FIELDS, limit: 100,
  }, token, transport);
  if (!page.ok) return { ok: false, error: page.error, provider_status: page.provider_status || null };
  const matched = page.rows.find(row => row.shortcode === post.shortcode || row.permalink === post.url);
  return matched
    ? { ok: true, post: matched, profile_pages_checked: page.pages }
    : { ok: false, error: page.complete ? "post_not_found_in_public_profile" : "post_not_found_within_profile_window",
        pages_checked: page.pages, complete: page.complete };
}

export async function threadsConversationRead({ token, threadId, transport = fetch }) {
  const id = clean(threadId, 160);
  if (!/^[0-9]{6,40}$/.test(id)) return { ok: false, error: "invalid_threads_media_id" };
  const [post, conversation] = await Promise.all([
    getGraph(id, { fields: POST_FIELDS }, token, transport),
    collectPages(id + "/conversation", { fields: REPLY_FIELDS, limit: 100, reverse: "false" }, token, transport),
  ]);
  if (!conversation.ok) {
    return { ok: false, error: conversation.error, provider_status: conversation.provider_status || null,
      partial: conversation.partial, replies: conversation.rows || [], pages: conversation.pages || 0 };
  }
  return {
    ok: true, mode: "thread", thread_id: id, post: post.ok ? stripPost(post.data) : null,
    post_readback: post.ok ? "verified" : post.error,
    replies: conversation.rows, pages: conversation.pages, complete: conversation.complete,
    limit_reached: conversation.limit_reached,
    provider: "meta_threads_official",
  };
}


// Conservative advisory triage only; NEVER creates a CRM lead or authorizes a reply.
// Research signals are intentionally generic. Commercial pricing, package comparison,
// quote construction and website-offer decisions belong to their own commercial workflow.
export function classifyThreadsResearchText(raw) {
  const value = clean(raw, 2500);
  const lower = value.toLowerCase();
  const request = /(?:i (?:need|want|am looking for)|looking for|need someone|шукаю|ищу|потрібен|потрібна|нужен|потрібні|нужны|recommend|порадьте|посоветуйте)/i.test(lower);
  const offer = /(?:i can help|we can help|i (?:build|create|design|provide)|we (?:build|create|design|provide)|можу допомогти|можемо допомогти|пропоную|предлагаю|зроблю|сделаю)/i.test(lower);
  const question = /\?$/.test(value) || /(?:how|what|where|who|which|як|що|де|хто|який|какой|как|где|кто)/i.test(lower);
  const type = request && offer ? "ambiguous" : request ? "possible_request" : offer ? "possible_offer" : question ? "discussion_question" : "other";
  return {
    type,
    status: "UNVERIFIED_PUBLIC_SIGNAL",
    human_review_required: true,
    reply_authorized: false,
    crm_qualified: false,
  };
}
