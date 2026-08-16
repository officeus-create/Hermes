import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

const routeMiddleware = onRequest[0];

function contextFor(url, { body = "asset", contentType = "" } = {}) {
  const observed = { nextCalls: 0, assetRequests: [] };
  return {
    observed,
    context: {
      request: new Request(url),
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

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/");
  const response = await routeMiddleware(context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/");
  assert.equal(observed.assetRequests.length, 0);
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
  assert.equal(response.headers.get("location"), "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/auth/?lang=es&referral=captured&mode=register");
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
  assert.equal(observed.nextCalls, 1);
}

console.log("Canonical Connect compatibility host redirect, demo boundary, assets, and API routing contract passed.");
