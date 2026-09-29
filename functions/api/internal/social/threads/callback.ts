import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import {
  consumeThreadsOAuthState,
  exchangeThreadsAuthorizationCode,
  fetchThreadsProfile,
  saveThreadsConnection,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = {
  DB?: any;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
};

const clean = (value: unknown, max = 4096) => String(value ?? "").trim().slice(0, max);

function redirect(request: Request, brand: string, result: string) {
  const url = new URL("/services/hermes-connect/social-connections/", request.url);
  url.searchParams.set("provider", "threads");
  if (brand) url.searchParams.set("brand", brand);
  url.searchParams.set("result", result);
  return Response.redirect(url.toString(), 303);
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return redirect(request, "", "database_not_configured");
  const url = new URL(request.url);
  const rawState = clean(url.searchParams.get("state"), 512);
  if (!rawState) return redirect(request, "", "invalid_state");

  const state = await consumeThreadsOAuthState(env.DB, rawState);
  if (!state) return redirect(request, "", "invalid_or_expired_state");
  const brand = String(state.brand_key || "");

  const providerError = clean(url.searchParams.get("error"), 160);
  const code = clean(url.searchParams.get("code"), 4096).replace(/#_$/, "");
  if (providerError || !code) return redirect(request, brand, "authorization_denied");

  const owner = await requireInternalOwner(request, env);
  if (owner.response) return redirect(request, brand, "owner_session_required");
  if (String(owner.specialist.id) !== String(state.owner_specialist_id)) {
    return redirect(request, brand, "owner_context_mismatch");
  }

  const exchange: any = await exchangeThreadsAuthorizationCode(env, code);
  if (!exchange.ok) return redirect(request, brand, exchange.error_class || "authorization_exchange_failed");

  const profile: any = await fetchThreadsProfile(exchange.payload.access_token, exchange.user_id);
  if (!profile.ok) return redirect(request, brand, profile.error_class || "profile_readback_failed");
  if (String(profile.profile.id) !== String(exchange.user_id)) {
    return redirect(request, brand, "profile_identity_mismatch");
  }

  try {
    await saveThreadsConnection(env.DB, env, {
      brand,
      ownerId: owner.specialist.id,
      tokenPayload: exchange.payload,
      expiresAt: exchange.expires_at,
      scope: exchange.scope,
      profile: profile.profile,
    });
  } catch {
    return redirect(request, brand, "connection_persistence_failed");
  }

  return redirect(request, brand, "connected_unverified");
}
