import { appleConfig } from "../../_lib/apple-oidc.mjs";
import { beginOAuthState, privateAuthHeaders, secureStateCookie } from "../../_lib/federated-login.mjs";
import { getAuthenticatedSpecialist } from "../../_lib/session.mjs";
import { parseCookies } from "../../../../src/legacy-prototype/auth.mjs";

type Env = { DB?: any; APPLE_LOGIN_ENABLED?: string; APPLE_SERVICES_ID?: string; APPLE_TEAM_ID?: string; APPLE_KEY_ID?: string; APPLE_PRIVATE_KEY_P8?: string; APPLE_REDIRECT_URI?: string };
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const origin = new URL(request.url).origin;
  if (!env.DB || !appleConfig(env, origin)) return new Response(null, { status: 404, headers: privateAuthHeaders });
  // Capture proof of the actual logged-in Hermes account at the SAME-SITE
  // OAuth start. Apple later sends a cross-site form_post callback, where the
  // ordinary SameSite=Lax session cookie might be absent. Never substitute
  // an unverified email or a user-provided specialist ID for this proof.
  const verifiedOwner = await getAuthenticatedSpecialist(request, env.DB);
  const sessionToken = (parseCookies(request.headers.get("Cookie")) as Record<string, string | undefined>).hermes_session;
  let verifiedStartSession: { specialistId: string; sessionCreatedAt: string } | null = null;
  if (verifiedOwner && sessionToken) {
    const activeSession = await env.DB.prepare(
      "SELECT specialist_id, created_at, expires_at FROM sessions WHERE token=? AND specialist_id=? LIMIT 1"
    ).bind(sessionToken, verifiedOwner.id).first();
    if (activeSession && Date.parse(String(activeSession.expires_at)) > Date.now()) {
      verifiedStartSession = {
        specialistId: verifiedOwner.id,
        sessionCreatedAt: String(activeSession.created_at),
      };
    }
  }
  const nonce = crypto.randomUUID() + crypto.randomUUID();
  const { state } = await beginOAuthState(env.DB, "apple", nonce, verifiedStartSession);
  const url = new URL("https://appleid.apple.com/auth/authorize");
  url.searchParams.set("client_id", String(env.APPLE_SERVICES_ID));
  url.searchParams.set("redirect_uri", String(env.APPLE_REDIRECT_URI));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("scope", "name email");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  const headers = new Headers({ ...privateAuthHeaders, Location: url.toString() });
  headers.append("Set-Cookie", secureStateCookie("apple", state, { crossSitePost: true }));
  return new Response(null, { status: 302, headers });
}
