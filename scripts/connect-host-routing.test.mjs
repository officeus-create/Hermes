import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

const routeMiddleware = onRequest[0];

function contextFor(url) {
  const observed = {
    nextCalls: 0,
    assetRequests: [],
  };

  return {
    observed,
    context: {
      request: new Request(url),
      next: async () => {
        observed.nextCalls += 1;
        return new Response("next");
      },
      env: {
        ASSETS: {
          fetch: async (request) => {
            observed.assetRequests.push(new URL(request.url));
            return new Response("asset");
          },
        },
      },
    },
  };
}

{
  const { context, observed } = contextFor("https://hermeslogisticsus.com/");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(observed.nextCalls, 1);
  assert.equal(observed.assetRequests.length, 0);
}

{
  const stale = "<html><body>Your information was not sent or stored.</body></html>";
  const context = {
    request: new Request("https://hermeslogisticsus.com/"),
    next: async () => new Response(stale, { headers: { "content-type": "text/html; charset=utf-8" } }),
    env: { ASSETS: { fetch: async () => new Response("unused") } },
  };
  const response = await routeMiddleware(context);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.equal(html.includes("Your information was not sent or stored"), false);
  assert.equal(html.includes("Delivery is confirmed only after a successful server response."), true);
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "asset");
  assert.equal(observed.nextCalls, 0);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/styles.css?v=2");
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/styles.css");
  assert.equal(observed.assetRequests[0].search, "?v=2");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/profile-workspace.mjs");
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/profile-workspace.mjs");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/demos/hermes-connect/app.mjs");
  await routeMiddleware(context);
  assert.equal(observed.assetRequests[0].pathname, "/demos/hermes-connect/app.mjs");
}

{
  const { context, observed } = contextFor("https://connect.hermeslogisticsus.com/api/connect-lead");
  const response = await routeMiddleware(context);
  assert.equal(await response.text(), "next");
  assert.equal(observed.nextCalls, 1);
  assert.equal(observed.assetRequests.length, 0);
}

console.log("Connect hostname and main-domain copy routing contract passed.");
