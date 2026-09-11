import { jsonResponse } from "../../_lib/session.mjs";
import { googleCalendarAuthorizationUrl, googleCalendarRuntimeConfig } from "../../_lib/repair-shop-google-calendar.mjs";
import {
  createGoogleCalendarOAuthState,
  googleCalendarSameOriginError,
  normalizeGoogleCalendarReturnLocale,
  requireGoogleCalendarOwner,
  requireGoogleCalendarStaff,
} from "../../_lib/repair-shop-google-calendar-owner.mjs";

type Env = {
  DB?: any;
  GOOGLE_CALENDAR_CLIENT_ID?: string;
  GOOGLE_CALENDAR_CLIENT_SECRET?: string;
  GOOGLE_CALENDAR_REDIRECT_URI?: string;
  GOOGLE_CALENDAR_TOKEN_KEY?: string;
};

type StartInput = { staff_id?: unknown; return_lang?: unknown };
const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const originError = googleCalendarSameOriginError(request);
  if (originError) return originError;
  const context = await requireGoogleCalendarOwner(request, env);
  if (context.response) return context.response;
  if (!googleCalendarRuntimeConfig(env)) {
    return jsonResponse(409, { success: false, error: "google_calendar_configuration_required", state: "configuration_required" });
  }

  let body: StartInput;
  try {
    body = (await request.json()) as StartInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const staffId = clean(body.staff_id, 96);
  const staff = await requireGoogleCalendarStaff(env.DB, context.specialist.id, String(context.shop.id), staffId);
  if (!staff || Number(staff.active) !== 1) {
    return jsonResponse(404, { success: false, error: "active_staff_required" });
  }

  const returnLang = normalizeGoogleCalendarReturnLocale(body.return_lang);
  const rawState = await createGoogleCalendarOAuthState(env.DB, {
    shopId: String(context.shop.id),
    ownerId: String(context.specialist.id),
    staffId: String(staff.id),
    returnLang,
  });
  const authorizationUrl = googleCalendarAuthorizationUrl(env, rawState);
  if (!authorizationUrl) {
    return jsonResponse(409, { success: false, error: "google_calendar_configuration_required", state: "configuration_required" });
  }

  return jsonResponse(200, {
    success: true,
    state: "authorizing",
    provider: "google",
    staff_id: String(staff.id),
    authorization_url: authorizationUrl,
  });
}
