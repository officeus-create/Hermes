import { jsonResponse } from "../../_lib/session.mjs";
import {
  googleCalendarConfigurationState,
  readGoogleCalendarConnectionState,
  requireGoogleCalendarOwner,
} from "../../_lib/repair-shop-google-calendar-owner.mjs";

type Env = {
  DB?: any;
  GOOGLE_CALENDAR_CLIENT_ID?: string;
  GOOGLE_CALENDAR_CLIENT_SECRET?: string;
  GOOGLE_CALENDAR_REDIRECT_URI?: string;
  GOOGLE_CALENDAR_TOKEN_KEY?: string;
};

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const context = await requireGoogleCalendarOwner(request, env);
  if (context.response) return context.response;
  const connections = await readGoogleCalendarConnectionState(env.DB, {
    shopId: String(context.shop.id),
    ownerId: String(context.specialist.id),
  });
  const configuration = googleCalendarConfigurationState(env);
  return jsonResponse(200, {
    success: true,
    provider: "google",
    configuration,
    state: configuration === "configuration_required"
      ? "configuration_required"
      : connections.some((item: any) => item.state === "degraded")
        ? "degraded"
        : connections.some((item: any) => item.state === "connected")
          ? "connected"
          : "not_configured",
    conflict_source: connections.some((item: any) => item.state === "connected") ? "google_freebusy_available" : "local_only",
    connections,
  });
}
