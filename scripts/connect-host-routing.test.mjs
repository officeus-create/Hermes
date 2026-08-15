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
  const html = '<html><head></head><body><div class="app-shell">Hermes Connect</div></body></html>';
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/", { body: html, contentType: "text/html" });
  const response = await routeMiddleware(context);
  const served = await response.text();
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/workspace.html");
  assert.equal(served.includes("data-hermes-connect-analytics-consent"), true);
  assert.equal(served.includes("data-hermes-connect-brand-shell"), false);
}

{
  const html = '<html><head></head><body><section id="apply"><form data-application-form></form></section></body></html>';
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/request-access/", { body: html, contentType: "text/html" });
  const response = await routeMiddleware(context);
  const served = await response.text();
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/index.html");
  assert.equal(served.includes('id="apply"'), true);
  assert.equal(served.includes("data-application-form"), true);
  assert.equal(served.includes("data-hermes-connect-brand-shell"), true);
  assert.equal(served.includes("data-hermes-connect-analytics-consent"), true);
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
  const html = '<html><head></head><body><div class="app-shell">Hermes Connect</div></body></html>';
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/mobile.html", { body: html, contentType: "text/html" });
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/workspace.html");
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

console.log("Canonical Connect hostname, responsive workspace, PWA assets, redirects, and request-access routing contract passed.");
