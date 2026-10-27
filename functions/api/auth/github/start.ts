import { beginOAuthState, codeChallenge, privateAuthHeaders, secureStateCookie } from "../../_lib/federated-login.mjs";

type Env = { DB?: any; GITHUB_LOGIN_ENABLED?: string; GITHUB_OAUTH_CLIENT_ID?: string; GITHUB_OAUTH_CLIENT_SECRET?: string; GITHUB_OAUTH_REDIRECT_URI?: string };
export function githubConfig(env: Env, origin: string) {
  const clientId = String(env.GITHUB_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = String(env.GITHUB_OAUTH_CLIENT_SECRET || "").trim();
  const redirect = String(env.GITHUB_OAUTH_REDIRECT_URI || "").trim();
  const expected = new URL("/api/auth/github/callback", origin).toString();
  return env.GITHUB_LOGIN_ENABLED === "true" && /^[a-z0-9_]{12,100}$/i.test(clientId)
    && Boolean(clientSecret) && redirect === expected && origin.startsWith("https://");
}
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const origin = new URL(request.url).origin;
  if (!env.DB || !githubConfig(env, origin)) return new Response(null, { status: 404, headers: privateAuthHeaders });
  const { state, verifier } = await beginOAuthState(env.DB, "github");
  const auth = new URL("https://github.com/login/oauth/authorize");
  auth.searchParams.set("client_id", String(env.GITHUB_OAUTH_CLIENT_ID));
  auth.searchParams.set("redirect_uri", String(env.GITHUB_OAUTH_REDIRECT_URI));
  auth.searchParams.set("scope", "user:email");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", await codeChallenge(verifier));
  auth.searchParams.set("code_challenge_method", "S256");
  const headers = new Headers({ ...privateAuthHeaders, "Location": auth.toString() });
  headers.append("Set-Cookie", secureStateCookie("github", state));
  return new Response(null, { status: 302, headers });
}
