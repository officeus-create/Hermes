import { completeFederatedLogin, consumeOAuthState, accountRedirect, privateAuthHeaders, secureStateCookie } from "../../_lib/federated-login.mjs";
import { githubConfig } from "./start";

type Env = { DB?: any; GITHUB_LOGIN_ENABLED?: string; GITHUB_OAUTH_CLIENT_ID?: string; GITHUB_OAUTH_CLIENT_SECRET?: string; GITHUB_OAUTH_REDIRECT_URI?: string };
const authHeaders = { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" };
const githubHeaders = (token: string) => ({
  Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`,
  "User-Agent": "Hermes-Identity", "X-GitHub-Api-Version": "2022-11-28",
});

function finish(origin: string, reason: string, sessionCookie?: string) {
  const headers = new Headers({ ...privateAuthHeaders, Location: accountRedirect(origin, reason) });
  headers.append("Set-Cookie", secureStateCookie("github", "", { clear: true }));
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  return new Response(null, { status: 303, headers });
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  if (!env.DB || !githubConfig(env, origin)) return finish(origin, "provider_unavailable");
  const state = url.searchParams.get("state") || "";
  if (!/^[a-f0-9]{64}$/.test(state)) return finish(origin, "invalid_state");
  const context = await consumeOAuthState(env.DB, request, "github", state);
  if (!context) return finish(origin, "invalid_state");
  if (url.searchParams.has("error")) return finish(origin, "provider_cancelled");
  const code = url.searchParams.get("code") || "";
  if (!/^[A-Za-z0-9_-]{8,200}$/.test(code)) return finish(origin, "provider_denied");
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST", headers: authHeaders,
      body: new URLSearchParams({
        client_id: String(env.GITHUB_OAUTH_CLIENT_ID),
        client_secret: String(env.GITHUB_OAUTH_CLIENT_SECRET),
        code,
        redirect_uri: String(env.GITHUB_OAUTH_REDIRECT_URI),
        code_verifier: String(context.code_verifier),
      }),
    });
    if (!response.ok) return finish(origin, "provider_denied");
    const tokens = await response.json() as { access_token?: string; error?: string; token_type?: string };
    const token = String(tokens.access_token || "");
    if (tokens.error || !token || !/^bearer$/i.test(tokens.token_type || "")) return finish(origin, "provider_denied");

    const [profileRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", { headers: githubHeaders(token) }),
      fetch("https://api.github.com/user/emails?per_page=100", { headers: githubHeaders(token) }),
    ]);
    if (!profileRes.ok || !emailsRes.ok) return finish(origin, "provider_denied");
    const profile = await profileRes.json() as { id?: number; name?: string; login?: string };
    const emails = await emailsRes.json() as Array<{ email?: string; verified?: boolean; primary?: boolean }>;
    const verified = Array.isArray(emails) ? (emails.find(e => e.verified && e.primary) || emails.find(e => e.verified)) : null;
    if (!Number.isSafeInteger(profile.id) || !verified?.email) return finish(origin, "email_verification_required");
    const account = await completeFederatedLogin({
      db: env.DB, request, provider: "github", subject: String(profile.id),
      email: verified.email, name: profile.name || profile.login || "",
    });
    if (!account.success) return finish(origin, String(account.error || "identity_conflict"));
    return finish(origin, "", account.cookie);
  } catch {
    return finish(origin, "provider_unavailable");
  }
}
