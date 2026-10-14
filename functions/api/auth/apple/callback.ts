import { appleClientSecret, appleConfig, verifyAppleIdentityToken } from "../../_lib/apple-oidc.mjs";
import { accountRedirect, completeFederatedLogin, consumeOAuthState, privateAuthHeaders, secureStateCookie } from "../../_lib/federated-login.mjs";

type Env = { DB?: any; APPLE_LOGIN_ENABLED?: string; APPLE_SERVICES_ID?: string; APPLE_TEAM_ID?: string; APPLE_KEY_ID?: string; APPLE_PRIVATE_KEY_P8?: string; APPLE_REDIRECT_URI?: string };
function finish(origin: string, reason: string, sessionCookie?: string) {
  const headers = new Headers({ ...privateAuthHeaders, Location: accountRedirect(origin, reason) });
  headers.append("Set-Cookie", secureStateCookie("apple", "", { clear: true, crossSitePost: true }));
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  return new Response(null, { status: 303, headers });
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const origin = new URL(request.url).origin;
  if (!env.DB || !appleConfig(env, origin)) return finish(origin, "provider_unavailable");
  const contentType = request.headers.get("Content-Type") || "";
  if (!/^application\/x-www-form-urlencoded(?:;|$)/i.test(contentType)) return finish(origin, "invalid_request");
  let form: FormData;
  try { form = await request.formData(); }
  catch { return finish(origin, "invalid_request"); }
  const state = String(form.get("state") || "");
  if (!/^[a-f0-9]{64}$/.test(state)) return finish(origin, "invalid_state");
  const context = await consumeOAuthState(env.DB, request, "apple", state);
  if (!context?.nonce) return finish(origin, "invalid_state");
  if (form.has("error")) return finish(origin, "provider_cancelled");
  const code = String(form.get("code") || "");
  if (!/^[a-zA-Z0-9._-]{8,2048}$/.test(code)) return finish(origin, "provider_denied");

  try {
    const secret = await appleClientSecret(env);
    const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "authorization_code", code,
        redirect_uri: String(env.APPLE_REDIRECT_URI),
        client_id: String(env.APPLE_SERVICES_ID), client_secret: secret,
      }),
    });
    if (!tokenRes.ok) return finish(origin, "provider_denied");
    const tokenData = await tokenRes.json() as { id_token?: string };
    if (!tokenData.id_token) return finish(origin, "provider_denied");
    const identity = await verifyAppleIdentityToken(tokenData.id_token, String(env.APPLE_SERVICES_ID), String(context.nonce));
    if (!identity) return finish(origin, "provider_denied");
    let displayName = "";
    try {
      const firstUse = JSON.parse(String(form.get("user") || "{}"));
      displayName = [firstUse?.name?.firstName, firstUse?.name?.lastName].filter(Boolean).join(" ");
    } catch {}
    const account = await completeFederatedLogin({
      db: env.DB, request, provider: "apple", subject: identity.sub, email: identity.email, name: displayName,
    });
    if (!account.success) return finish(origin, String(account.error || "identity_conflict"));
    return finish(origin, "", account.cookie);
  } catch {
    return finish(origin, "provider_unavailable");
  }
}
