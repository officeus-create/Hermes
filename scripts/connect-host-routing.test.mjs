import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";
const routeMiddleware = onRequest[0];
function contextFor(url, { body = "asset", contentType = "" } = {}) {
  const observed = { nextCalls: 0, assetRequests: [] };
  return { observed, context: { request: new Request(url), next: async () => { observed.nextCalls += 1; return new Response("next"); }, env: { ASSETS: { fetch: async (request) => { observed.assetRequests.push(new URL(request.url)); return new Response(body, contentType ? { headers: { "content-type": contentType } } : undefined); } } } } };
}
{
  const { context, observed } = contextFor("https://hermeslogisticsus.com/"); const response = await routeMiddleware(context); assert.equal(await response.text(), "next"); assert.equal(observed.nextCalls, 1); assert.equal(observed.assetRequests.length, 0);
}
{
  const stale = "<html><body>Your information was not sent or stored.</body></html>"; const context = { request: new Request("https://hermeslogisticsus.com/"), next: async () => new Response(stale, { headers: { "content-type": "text/html; charset=utf-8" } }), env: { ASSETS: { fetch: async () => new Response("unused") } } }; const response = await routeMiddleware(context); const html = await response.text(); assert.equal(html.includes("Your information was not sent or stored"), false); assert.equal(html.includes("Delivery is confirmed only after a successful server response."), true);
}
{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/"); const response = await routeMiddleware(context); assert.equal(await response.text(), "asset"); assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/");
}
{
  const html = "<!doctype html><html><head><title>Connect</title></head><body>root</body></html>"; const { context } = contextFor("https://connect.hermeslogisticsus.com/", { body: html, contentType: "text/html; charset=utf-8" }); const response = await routeMiddleware(context); const served = await response.text(); assert.match(served, /<script type="module" src="\/connect-analytics-consent\.mjs" data-hermes-connect-analytics-consent><\/script><\/head>/); assert.equal((served.match(/data-hermes-connect-analytics-consent/g) || []).length, 1);
}
{
  const html = "<!doctype html><html><head></head><body>tool</body></html>"; const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/load-analyzer/", { body: html, contentType: "text/html; charset=utf-8" }); const response = await routeMiddleware(context); const served = await response.text(); assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/load-analyzer/"); assert.equal(served.includes("/connect-analytics-consent.mjs"), true);
}
{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/styles.css?v=2", { body: "body{}", contentType: "text/css; charset=utf-8" }); const response = await routeMiddleware(context); assert.equal(await response.text(), "body{}"); assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/styles.css"); assert.equal(observed.assetRequests[0].search, "?v=2");
}
{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/connect-analytics-consent.mjs"); await routeMiddleware(context); assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/connect-analytics-consent.mjs");
}
{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/api/connect-lead"); const response = await routeMiddleware(context); assert.equal(await response.text(), "next"); assert.equal(observed.nextCalls, 1); assert.equal(observed.assetRequests.length, 0);
}
console.log("Connect hostname, consent injection, and main-domain copy routing contract passed.");
