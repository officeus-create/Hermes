import { jsonResponse } from "../_lib/session.mjs";
import { appleConfig } from "../_lib/apple-oidc.mjs";
import { githubConfig } from "./github/start";

type Env = { DB?: any; APPLE_LOGIN_ENABLED?: string; APPLE_SERVICES_ID?: string; APPLE_TEAM_ID?: string; APPLE_KEY_ID?: string; APPLE_PRIVATE_KEY_P8?: string; APPLE_REDIRECT_URI?: string; GITHUB_LOGIN_ENABLED?: string; GITHUB_OAUTH_CLIENT_ID?: string; GITHUB_OAUTH_CLIENT_SECRET?: string; GITHUB_OAUTH_REDIRECT_URI?: string };
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const origin = new URL(request.url).origin;
  return jsonResponse(200, {
    success: true,
    github: { enabled: Boolean(env.DB && githubConfig(env, origin)), start_url: "/api/auth/github/start" },
    apple: { enabled: Boolean(env.DB && appleConfig(env, origin)), start_url: "/api/auth/apple/start" },
  }, { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
}
