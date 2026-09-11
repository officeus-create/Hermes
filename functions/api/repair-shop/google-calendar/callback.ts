import {
  exchangeGoogleCalendarCode,
  GOOGLE_CALENDAR_FREEBUSY_SCOPE,
} from "../../_lib/repair-shop-google-calendar.mjs";
import {
  consumeGoogleCalendarOAuthState,
  googleCalendarSettingsPath,
  requireGoogleCalendarOwner,
  requireGoogleCalendarStaff,
  saveGoogleCalendarConnection,
} from "../../_lib/repair-shop-google-calendar-owner.mjs";

type Env = {
  DB?: any;
  GOOGLE_CALENDAR_CLIENT_ID?: string;
  GOOGLE_CALENDAR_CLIENT_SECRET?: string;
  GOOGLE_CALENDAR_REDIRECT_URI?: string;
  GOOGLE_CALENDAR_TOKEN_KEY?: string;
};

const clean = (value: unknown, max = 4096) => String(value ?? "").trim().slice(0, max);
const redirectToSettings = (request: Request, lang: string, result: string) =>
  Response.redirect(new URL(googleCalendarSettingsPath(lang, result), request.url).toString(), 303);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return redirectToSettings(request, "en", "database_not_configured");
  const url = new URL(request.url);
  const rawState = clean(url.searchParams.get("state"), 512);
  if (!rawState) return redirectToSettings(request, "en", "invalid_state");

  const oauthState = await consumeGoogleCalendarOAuthState(env.DB, rawState);
  if (!oauthState) return redirectToSettings(request, "en", "invalid_or_expired_state");
  const returnLang = String(oauthState.return_lang || "en");

  const providerError = clean(url.searchParams.get("error"), 80);
  const code = clean(url.searchParams.get("code"), 4096);
  if (providerError || !code) return redirectToSettings(request, returnLang, "authorization_denied");

  const context = await requireGoogleCalendarOwner(request, env);
  if (context.response) return redirectToSettings(request, returnLang, "session_required");
  if (
    String(context.specialist.id) !== String(oauthState.owner_specialist_id) ||
    String(context.shop.id) !== String(oauthState.shop_id)
  ) {
    return redirectToSettings(request, returnLang, "owner_context_mismatch");
  }

  const staff = await requireGoogleCalendarStaff(
    env.DB,
    String(context.specialist.id),
    String(context.shop.id),
    String(oauthState.staff_id),
  );
  if (!staff || Number(staff.active) !== 1) return redirectToSettings(request, returnLang, "active_staff_required");

  const exchange = await exchangeGoogleCalendarCode(env, code);
  if (!exchange.ok) return redirectToSettings(request, returnLang, exchange.error_class || "authorization_exchange_failed");
  const scopes = new Set(String(exchange.scope || "").split(/\s+/).filter(Boolean));
  if (!scopes.has(GOOGLE_CALENDAR_FREEBUSY_SCOPE)) {
    return redirectToSettings(request, returnLang, "freebusy_scope_not_granted");
  }

  try {
    await saveGoogleCalendarConnection(env.DB, env, {
      shopId: String(context.shop.id),
      ownerId: String(context.specialist.id),
      staffId: String(staff.id),
      tokenPayload: exchange.payload,
      scope: exchange.scope,
      expiresAt: exchange.expires_at,
    });
  } catch {
    return redirectToSettings(request, returnLang, "connection_persistence_failed");
  }

  return redirectToSettings(request, returnLang, "connected");
}
