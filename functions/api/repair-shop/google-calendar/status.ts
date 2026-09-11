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
  const hasConnected = connections.some((item: any) => item.state === "connected");
  const hasDegraded = connections.some((item: any) => item.state === "degraded");
  const needsAuthorization = connections.some((item: any) => item.state === "needs_authorization");
  return jsonResponse(200, {
    success: true,
    provider: "google",
    configuration,
    state: configuration === "configuration_required"
      ? "configuration_required"
      : hasDegraded
        ? "degraded"
        : needsAuthorization
          ? "needs_authorization"
          : hasConnected
            ? "connected"
            : "not_configured",
    conflict_policy: hasConnected ? "google_freebusy_with_local_fallback" : "local_only",
    connections,
  });
}
