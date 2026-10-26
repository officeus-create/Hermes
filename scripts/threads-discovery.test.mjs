import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { threadsBrandScopes } from "../functions/api/_lib/threads-brand-connector.mjs";
import {
  parsePublicThreadsPostUrl, threadsConversationRead, threadsOwnedRead, classifyThreadsResearchText,
  threadsReadMode, threadsRequiredScope, threadsResolvePublicPost, threadsSearchRead,
} from "../functions/api/_lib/threads-discovery.mjs";

const discussion = "https://www.threads.com/@tsapushel_olena/post/De6z1w-iAC5?xmt=test";
assert.deepEqual(parsePublicThreadsPostUrl(discussion), {
  username: "tsapushel_olena",
  shortcode: "De6z1w-iAC5",
  url: "https://www.threads.com/@tsapushel_olena/post/De6z1w-iAC5",
});
for (const invalid of [
  "http://www.threads.com/@user/post/De6z1w-iAC5",
  "https://www.threads.com.evil.invalid/@user/post/De6z1w-iAC5",
  "https://www.threads.com/@user/not-post/De6z1w-iAC5",
  "file:///etc/passwd",
  "https://evil.com",
]) assert.equal(parsePublicThreadsPostUrl(invalid), null);
assert.equal(threadsReadMode("search"), "search");
assert.equal(threadsReadMode("owned"), "owned");
assert.equal(threadsReadMode("reply"), null);
assert.deepEqual(threadsRequiredScope("thread", true),
  ["threads_basic", "threads_read_replies", "threads_profile_discovery"]);
assert.deepEqual(threadsRequiredScope("search", false), ["threads_basic", "threads_keyword_search"]);
assert.ok(threadsBrandScopes({ THREADS_BRAND_SCOPES: "threads_basic,threads_profile_discovery" }).includes("threads_profile_discovery"));
assert.ok(!threadsBrandScopes({}).includes("threads_profile_discovery"));

const calls = [];
const token = "synthetic-do-not-leak-token";
function mockJson(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}
async function transport(address, init) {
  const url = new URL(address);
  calls.push({ url, headers: init.headers });
  assert.equal(url.hostname, "graph.threads.com");
  assert.equal(url.searchParams.has("access_token"), false);
  assert.equal(init.headers.Authorization, "Bearer " + token);
  if (url.pathname.endsWith("/keyword_search")) {
    return mockJson({ data: [{ id: "1234567890", username: "designer", text: "Need help choosing a provider",
      permalink: "https://www.threads.com/@designer/post/AAA123" }] });
  }
  if (url.pathname.endsWith("/profile_posts")) {
    return mockJson({ data: [{ id: "123456789012", username: "tsapushel_olena", shortcode: "De6z1w-iAC5",
      permalink: "https://www.threads.com/@tsapushel_olena/post/De6z1w-iAC5" }] });
  }
  if (url.pathname.endsWith("/123456789012/conversation")) {
    if (!url.searchParams.has("after")) return mockJson({
      data: [{ id: "700001", text: "$500", username: "one" }],
      paging: { cursors: { after: "next_page" } },
    });
    return mockJson({ data: [{ id: "700002", text: "$1800", username: "two", replied_to: { id: "700001" } }] });
  }
  if (url.pathname.endsWith("/123456789012")) return mockJson({ id: "123456789012", text: "Pricing request", username: "tsapushel_olena" });
  if (url.pathname.endsWith("/me/threads")) return mockJson({ data: [] });
  throw new Error("unexpected URL: " + url.pathname);
}

const result = await threadsSearchRead({ token, query: "need help", transport });
assert.equal(result.ok, true);
assert.equal(result.posts[0].text, "Need help choosing a provider");
assert.equal(result.complete, false);
assert.equal(await threadsSearchRead({ token, query: " ", transport }).then(x => x.error), "query_too_short");

const resolved = await threadsResolvePublicPost({ token, postUrl: discussion, transport });
assert.equal(resolved.ok, true);
assert.equal(resolved.post.id, "123456789012");
const conversation = await threadsConversationRead({ token, threadId: resolved.post.id, transport });
assert.equal(conversation.ok, true);
assert.equal(conversation.replies.length, 2);
assert.equal(conversation.complete, true);
assert.equal(conversation.replies[1].replied_to_id, "700001");
assert.equal(conversation.pages, 2);
assert.equal(await threadsConversationRead({ token, threadId: "De6z1w-iAC5", transport }).then(x => x.error),
  "invalid_threads_media_id");
assert.equal((await threadsOwnedRead({ token, transport })).complete, true);

const denied = await threadsSearchRead({
  token, query: "help", transport: async () => mockJson({ error: { code: 10 } }, 403),
});
assert.equal(denied.error, "provider_permission_denied");
const rateLimited = await threadsConversationRead({
  token, threadId: "123456789012", transport: async () => mockJson({ error: { code: 4 } }, 429),
});
assert.equal(rateLimited.error, "provider_rate_limited");
assert.ok(calls.length >= 5);

const routeSource = await readFile(new URL("../functions/api/internal/social/threads/read.ts", import.meta.url), "utf8");
assert.match(routeSource, /requireInternalOwner/);
assert.match(routeSource, /missing_scopes/);
assert.match(routeSource, /usableThreadsAccessToken/);
assert.match(routeSource, /provider_write_performed: false/);
assert.doesNotMatch(routeSource, /publishThreadsText|reply_to_id|execute.*script/i);

const requestSignal = classifyThreadsResearchText("I need someone who can help with our business workflow.");
assert.equal(requestSignal.type, "possible_request");
assert.equal(requestSignal.reply_authorized, false);
assert.equal(requestSignal.crm_qualified, false);
const offerSignal = classifyThreadsResearchText("We can help with this project.");
assert.equal(offerSignal.type, "possible_offer");
assert.equal(offerSignal.human_review_required, true);
assert.equal(classifyThreadsResearchText("Just say hi").type, "other");

console.log("threads discovery read-only contract: PASS");
