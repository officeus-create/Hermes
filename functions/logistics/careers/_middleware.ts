import { isVacancyEligibleForJobPosting, publicVacancyRegistry } from "../../../src/data/careers-governance.ts";
import { guardedWisconsinResponse, hasCurrentWisconsinReview } from "../../_lib/wisconsin-vacancy-lifecycle.mjs";

export async function onRequest(context: any) {
  const path = new URL(context.request.url).pathname;
  if (!["/logistics/careers/", "/logistics/careers/index.html"].includes(path)
    || !["GET", "HEAD"].includes(context.request.method)) return context.next();
  const now = new Date();
  const currentRecords = publicVacancyRegistry.filter((item) => isVacancyEligibleForJobPosting(item, now.toISOString().slice(0, 10))
    && (item.slug !== "wisconsin-owner-operators" || hasCurrentWisconsinReview(item, now)));
  const current = currentRecords.some((item) => item.slug === "wisconsin-owner-operators");
  const headers = new Headers(context.request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const response = await guardedWisconsinResponse(await context.next(new Request(context.request.url, { method: "GET", headers })), current, currentRecords.length);
  return context.request.method === "HEAD" ? new Response(null, { status: response.status, headers: response.headers }) : response;
}
