import { bearerToken, verifyGitHubReminderOidcToken } from "../../_lib/github-oidc.mjs";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function onRequestPost({ request }: { request: Request }) {
  if (!(await verifyGitHubReminderOidcToken(bearerToken(request)))) {
    return new Response(JSON.stringify({ success:false, error:"unauthorized" }), { status:401, headers });
  }
  return new Response(JSON.stringify({
    success:false,
    state:"SUPERSEDED",
    error:"catalog_weekly_email_retired",
    replacement:"HAE report.catalog.weekly.build -> Hermes Command Center",
    delivery_surface:"HERMES_COMMAND_CENTER_ONLY",
    external_send:false,
    max_cost_usd:0,
  }), { status:410, headers });
}
