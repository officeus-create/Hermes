import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

const routeMiddleware = onRequest[0];

function contextFor(url, { body = "asset", contentType = "", headers = {} } = {}) {
  const observed = { nextCalls: 0, assetRequests: [] };
  return {
    observed,
    context: {
      request: new Request(url, { headers }),
      next: async () => { observed.nextCalls += 1; return new Response("next"); },
      env: { ASSETS: { fetch: async (request) => { observed.assetRequests.push(new URL(request.url)); return new Response(body, contentType ? { headers: { "content-type": contentType } } : undefined); } } },
    },
  };
}

{
  const { context, observed } = contextFor("https://hermeslogisticsus.com/");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(observed.nextCalls, 1);
}

for (const legacyPath of ["/academy", "/academy/"]) {
  const { context, observed } = contextFor(`https://hermeslogisticsus.com${legacyPath}?utm_source=gsc`);
  const response = await routeMiddleware(context);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/paths/academy/?utm_source=gsc");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(observed.nextCalls, 0);
  assert.equal(observed.assetRequests.length, 0);
}

{
  const { context, observed } = contextFor("https://hermeslogisticsus.com/?agent=1", {
    body: "# Hermes\n",
    contentType: "text/plain; charset=utf-8",
    headers: { Accept: "text/markdown" },
  });
  const response = await routeMiddleware(context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.equal(response.headers.get("content-signal"), "search=yes, ai-input=yes");
  assert.equal(response.headers.get("content-location"), "/llms.txt");
  assert.equal(response.headers.get("x-robots-tag"), null);
  assert.match(response.headers.get("vary") || "", /Accept/i);
  assert.equal(await response.text(), "# Hermes\n");
  assert.equal(observed.nextCalls, 0);
  assert.equal(observed.assetRequests.length, 1);
  assert.equal(observed.assetRequests[0].pathname, "/llms.txt");
  assert.equal(observed.assetRequests[0].search, "");
}

{
  const { context, observed } = contextFor("https://hermes-eu4.pages.dev/services/hermes-connect/?utm_source=pages-dev");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/?utm_source=pages-dev");
  assert.equal(observed.nextCalls, 0);
  assert.equal(observed.assetRequests.length, 0);
}

for (const origin of ["https://www.hermeslogisticsus.com", "http://www.hermeslogisticsus.com"]) {
  const { context, observed } = contextFor(`${origin}/services/seo/?utm_source=www`);
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/seo/?utm_source=www");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(observed.nextCalls, 0);
  assert.equal(observed.assetRequests.length, 0);
}

{
  const { context, observed } = contextFor("https://655e4425.hermes-eu4.pages.dev/release-proof?sha=test");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(observed.nextCalls, 1);
  assert.equal(observed.assetRequests.length, 0);
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(observed.assetRequests.length, 0);
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/", {
    body: "# Hermes Connect\n",
    contentType: "text/markdown",
    headers: { Accept: "text/markdown" },
  });
  const response = await routeMiddleware(context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/index.md");
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/workspace.html?business_type=auto_repair&lang=ru");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/?lang=ru");
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/request-access/?lang=es&referral=captured");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/auth/?lang=es&mode=register&referral=captured");
}

{
  const token = "PilotReferral_7xYp3A9mK2vN8qRs";
  const { context } = contextFor(`https://connect.hermeslogisticsus.com/request-access/?ref=${token}&lang=es`);
  const response = await routeMiddleware(context);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), `https://hermeslogisticsus.com/api/repair-shop/referral?ref=${token}&lang=es`);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  assert.doesNotMatch(response.headers.get("location") || "", /\/services\/hermes-connect\/repair-shops\/auth\/.*ref=/);
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/load-analyzer/?lang=fr");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/load-analyzer/?lang=fr");
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/review.html");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/demos/hermes-connect/review.html");
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/sales-roleplay.html");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/demos/hermes-connect/sales-roleplay.html");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/workspace.css", { body: "body{}", contentType: "text/css" });
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "body{}");
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/workspace.css");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/manifest.webmanifest", { body: "{}", contentType: "application/manifest+json" });
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "{}");
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/manifest.webmanifest");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/sw.js", { body: "self.addEventListener('fetch',()=>{});", contentType: "text/javascript" });
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/sw.js");
}

{
  const { context } = contextFor("https://hermeslogisticsus.com/demos/hermes-connect-brand-v1/workspace.html?tool=load-analyzer");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://connect.hermeslogisticsus.com/?tool=load-analyzer");
}

{
  const { context } = contextFor("https://connect.hermeslogisticsus.com/demos/hermes-connect-brand-v1/mobile.html");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://connect.hermeslogisticsus.com/");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/api/connect-lead");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  assert.equal(observed.nextCalls, 1);
}

console.log("Canonical Connect compatibility redirects, Markdown negotiation, demo boundary, PWA assets, referral privacy, and API routing contract passed.");
