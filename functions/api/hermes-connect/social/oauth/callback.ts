import { getAuthenticatedSpecialist } from "../../../_lib/session.mjs";
import {
  consumeBusinessSocialOAuthState,
  exchangeMetaBusinessAuthorizationCode,
  fetchMetaBusinessCandidates,
  publicCandidateLabels,
  resolveOwnedSocialBusiness,
  saveMetaCandidateSelection,
  upsertBusinessSocialCredential,
} from "../../../_lib/business-social.mjs";

type Env = {
  DB?: any;
  HERMES_SOCIAL_TOKEN_KEY?: string;
  HERMES_META_APP_ID?: string;
  HERMES_META_APP_SECRET?: string;
  HERMES_META_OAUTH_REDIRECT_URI?: string;
  HERMES_META_GRAPH_VERSION?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
};

const clean = (value: unknown, max = 4096) => String(value ?? "").trim().slice(0, max);

function targetPath(vertical: string) {
  return vertical === "repair_shop"
    ? "/services/hermes-connect/repair-shops/social/"
    : "/services/hermes-connect/dealers/social/";
}

function redirect(request: Request, vertical: string, provider: string, result: string) {
  const url = new URL(targetPath(vertical), request.url);
  if (provider) url.searchParams.set("provider", provider);
  url.searchParams.set("result", result);
  return Response.redirect(url.toString(), 303);
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return redirect(request, "", "", "database_not_configured");
  const url = new URL(request.url);
  const rawState = clean(url.searchParams.get("state"), 512);
  if (!rawState) return redirect(request, "", "", "invalid_state");
  const state = await consumeBusinessSocialOAuthState(env.DB, rawState);
  if (!state) return redirect(request, "", "", "invalid_or_expired_state");
  const provider = String(state.provider || "");
  const vertical = String(state.vertical_key || "");

  const providerError = clean(url.searchParams.get("error"), 160);
  const code = clean(url.searchParams.get("code"), 4096).replace(/#_$/, "");
  if (providerError || !code) return redirect(request, vertical, provider, "authorization_denied");

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return redirect(request, vertical, provider, "owner_session_required");
  if (String(specialist.id) !== String(state.owner_specialist_id)) {
    return redirect(request, vertical, provider, "owner_context_mismatch");
  }

  const preferred = vertical === "repair_shop" ? "repair_shop" : "dealer";
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, preferred);
  if (!business || business.business_key !== String(state.business_key)) {
    return redirect(request, vertical, provider, "business_context_mismatch");
  }

  const exchange = await exchangeMetaBusinessAuthorizationCode(env, code);
  if (!exchange.ok) return redirect(request, vertical, provider, exchange.error_class || "authorization_exchange_failed");
  const candidates = await fetchMetaBusinessCandidates(env, exchange.access_token, provider);
  if (!candidates.ok) return redirect(request, vertical, provider, candidates.error_class || "account_readback_failed");

  await upsertBusinessSocialCredential(env.DB, env, {
    business,
    ownerId: specialist.id,
    provider,
    state: "selection_required",
    tokenPayload: { candidates: candidates.candidates, expires_at: exchange.expires_at },
    tokenExpiresAt: exchange.expires_at,
    grantedScope: "",
    candidateLabels: publicCandidateLabels(provider, candidates.candidates),
    lastError: null,
  });

  if (candidates.candidates.length === 1) {
    const selected = await saveMetaCandidateSelection(env.DB, env, {
      business,
      ownerId: specialist.id,
      provider,
      candidateIndex: 0,
    });
    return redirect(request, vertical, provider, selected.ok ? "connected" : selected.error_class || "selection_failed");
  }

  return redirect(request, vertical, provider, "selection_required");
}
