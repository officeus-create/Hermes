import { getAuthenticatedSpecialist } from "../../../_lib/session.mjs";
import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import {
  consumeThreadsOAuthState,
  exchangeThreadsAuthorizationCode,
  fetchThreadsProfile,
  saveThreadsConnection,
} from "../../../_lib/threads-brand-connector.mjs";
import {
  connectBusinessThreadsFromCode,
  consumeBusinessSocialOAuthState,
  resolveOwnedSocialBusiness,
} from "../../../_lib/business-social.mjs";

type Env = {
  DB?: any;
  HERMES_SOCIAL_TOKEN_KEY?: string;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
};

const clean = (value: unknown, max = 4096) => String(value ?? "").trim().slice(0, max);

function internalRedirect(request: Request, brand: string, result: string) {
  const url = new URL("/services/hermes-connect/internal/social-connections/", request.url);
  url.searchParams.set("provider", "threads");
  if (brand) url.searchParams.set("brand", brand);
  url.searchParams.set("result", result);
  return Response.redirect(url.toString(), 303);
}

function businessRedirect(request: Request, vertical: string, result: string) {
  const path = vertical === "repair_shop"
    ? "/services/hermes-connect/repair-shops/social/"
    : vertical === "beauty_salon"
      ? "/services/hermes-connect/beauty/workspace/social/"
      : "/services/hermes-connect/dealers/social/";
  const url = new URL(path, request.url);
  url.searchParams.set("provider", "threads");
  url.searchParams.set("result", result);
  return Response.redirect(url.toString(), 303);
}

async function handleInternalCallback(request: Request, env: Env, state: any, code: string, providerError: string) {
  const brand = String(state.brand_key || "");
  if (providerError || !code) return internalRedirect(request, brand, "authorization_denied");

  const owner = await requireInternalOwner(request, env);
  if (owner.response) return internalRedirect(request, brand, "owner_session_required");
  if (String(owner.specialist.id) !== String(state.owner_specialist_id)) {
    return internalRedirect(request, brand, "owner_context_mismatch");
  }

  const exchange: any = await exchangeThreadsAuthorizationCode(env, code);
  if (!exchange.ok) return internalRedirect(request, brand, exchange.error_class || "authorization_exchange_failed");

  const profile: any = await fetchThreadsProfile(exchange.payload.access_token, exchange.user_id);
  if (!profile.ok) return internalRedirect(request, brand, profile.error_class || "profile_readback_failed");
  if (String(profile.profile.id) !== String(exchange.user_id)) {
    return internalRedirect(request, brand, "profile_identity_mismatch");
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
    return internalRedirect(request, brand, "connection_persistence_failed");
  }

  return internalRedirect(request, brand, "connected_unverified");
}

async function handleBusinessCallback(request: Request, env: Env, state: any, code: string, providerError: string) {
  const vertical = String(state.vertical_key || "");
  if (providerError || !code) return businessRedirect(request, vertical, "authorization_denied");

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return businessRedirect(request, vertical, "owner_session_required");
  if (String(specialist.id) !== String(state.owner_specialist_id)) {
    return businessRedirect(request, vertical, "owner_context_mismatch");
  }

  const preferred = vertical === "repair_shop" ? "repair_shop" : vertical === "beauty_salon" ? "beauty_salon" : "dealer";
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, preferred);
  if (!business || business.business_key !== String(state.business_key)) {
    return businessRedirect(request, vertical, "business_context_mismatch");
  }

  const connected: any = await connectBusinessThreadsFromCode(env.DB, env, {
    business,
    ownerId: specialist.id,
    code,
  });
  return businessRedirect(request, vertical, connected.ok ? "connected" : connected.error_class || "connection_failed");
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return internalRedirect(request, "", "database_not_configured");
  const url = new URL(request.url);
  const rawState = clean(url.searchParams.get("state"), 512);
  if (!rawState) return internalRedirect(request, "", "invalid_state");

  const providerError = clean(url.searchParams.get("error"), 160);
  const code = clean(url.searchParams.get("code"), 4096).replace(/#_$/, "");

  const internalState = await consumeThreadsOAuthState(env.DB, rawState);
  if (internalState) return handleInternalCallback(request, env, internalState, code, providerError);

  const businessState = await consumeBusinessSocialOAuthState(env.DB, rawState);
  if (!businessState || String(businessState.provider) !== "threads") {
    return internalRedirect(request, "", "invalid_or_expired_state");
  }
  return handleBusinessCallback(request, env, businessState, code, providerError);
}
