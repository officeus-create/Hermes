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
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect-brand-v1/workspace.html");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/workspace.css", { body: "body{}", contentType: "text/css" });
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "body{}");
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect-brand-v1/workspace.css");
}

{
  const html = '<html><head></head><body><header class="site-header"><span class="brand-mark">H</span></header></body></html>';
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/load-analyzer/", { body: html, contentType: "text/html" });
  const response = await routeMiddleware(context);
  const served = await response.text();
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/load-analyzer/");
  assert.equal(served.includes("brand-mark-knot"), true);
  assert.equal(served.includes("data-hermes-connect-brand-shell"), true);
  assert.equal(served.includes("data-hermes-connect-analytics-consent"), true);
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/api/connect-lead");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(observed.nextCalls, 1);
}

console.log("Connect hostname and Brand V1 routing contract passed.");
