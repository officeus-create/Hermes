import { jsonResponse } from "../../_lib/session.mjs";
import {
  disconnectGoogleCalendar,
  googleCalendarSameOriginError,
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

type DisconnectInput = { staff_id?: unknown };
const clean = (value: unknown, max = 96) => String(value ?? "").trim().slice(0, max);

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const originError = googleCalendarSameOriginError(request);
  if (originError) return originError;
  const context = await requireGoogleCalendarOwner(request, env);
  if (context.response) return context.response;

  let body: DisconnectInput;
  try {
    body = (await request.json()) as DisconnectInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const staffId = clean(body.staff_id, 96);
  const staff = await requireGoogleCalendarStaff(env.DB, context.specialist.id, String(context.shop.id), staffId);
  if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });

  const disconnected = await disconnectGoogleCalendar(env.DB, env, {
    shopId: String(context.shop.id),
    ownerId: String(context.specialist.id),
    staffId: String(staff.id),
  });
  return jsonResponse(200, {
    success: true,
    disconnected,
    provider: "google",
    state: "not_configured",
    conflict_source: "local_only",
  });
}
