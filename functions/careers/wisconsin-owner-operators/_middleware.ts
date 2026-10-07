import { isVacancyEligibleForJobPosting, publicVacancyRegistry } from "../../../src/data/careers-governance.ts";
import { guardedWisconsinResponse, hasCurrentWisconsinReview } from "../../_lib/wisconsin-vacancy-lifecycle.mjs";

export async function onRequest(context: any) {
  const path = new URL(context.request.url).pathname;
  if (!["/careers/wisconsin-owner-operators/", "/careers/wisconsin-owner-operators/index.html"].includes(path)
    || !["GET", "HEAD"].includes(context.request.method)) return context.next();
  const now = new Date(); // server clock; no query/header/client override
  const record = publicVacancyRegistry.find((item) => item.slug === "wisconsin-owner-operators");
  const current = Boolean(record && isVacancyEligibleForJobPosting(record, now.toISOString().slice(0, 10))
    && hasCurrentWisconsinReview(record, now));
  // Conditional asset 304s and HEAD must not bypass the request-time guard.
  const headers = new Headers(context.request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const upstreamRequest = new Request(context.request.url, { method: "GET", headers });
  const response = await guardedWisconsinResponse(await context.next(upstreamRequest), current);
  return context.request.method === "HEAD" ? new Response(null, { status: response.status, headers: response.headers }) : response;
}
