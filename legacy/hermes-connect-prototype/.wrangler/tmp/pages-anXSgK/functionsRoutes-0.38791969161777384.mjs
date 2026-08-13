import { onRequestGet as __api_public_booking__token__ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/public/booking/[token].ts"
import { onRequestPatch as __api_public_booking__token__ts_onRequestPatch } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/public/booking/[token].ts"
import { onRequestGet as __api_public_specialist__id__ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/public/specialist/[id].ts"
import { onRequestPost as __api_auth_login_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/auth/login.ts"
import { onRequestPost as __api_auth_logout_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/auth/logout.ts"
import { onRequestGet as __api_auth_me_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/auth/me.ts"
import { onRequestPost as __api_auth_register_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/auth/register.ts"
import { onRequestPost as __api_auth_telegram_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/auth/telegram.ts"
import { onRequestPost as __api_public_booking_index_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/public/booking/index.ts"
import { onRequestPost as __api_public_meeting_index_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/public/meeting/index.ts"
import { onRequestPatch as __api_booking__id__ts_onRequestPatch } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/booking/[id].ts"
import { onRequestPut as __api_clients__email__ts_onRequestPut } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/clients/[email].ts"
import { onRequestDelete as __api_staff__id__ts_onRequestDelete } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/staff/[id].ts"
import { onRequestPut as __api_staff__id__ts_onRequestPut } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/staff/[id].ts"
import { onRequestGet as __api_analytics_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/analytics.ts"
import { onRequestGet as __api_booking_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/booking.ts"
import { onRequestPost as __api_booking_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/booking.ts"
import { onRequestGet as __api_clients_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/clients.ts"
import { onRequestGet as __api_profile_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/profile.ts"
import { onRequestPut as __api_profile_ts_onRequestPut } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/profile.ts"
import { onRequestGet as __api_staff_ts_onRequestGet } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/staff.ts"
import { onRequestPost as __api_staff_ts_onRequestPost } from "/Users/progressopro/Projects/hermes-connect-prototype/functions/api/staff.ts"

export const routes = [
    {
      routePath: "/api/public/booking/:token",
      mountPath: "/api/public/booking",
      method: "GET",
      middlewares: [],
      modules: [__api_public_booking__token__ts_onRequestGet],
    },
  {
      routePath: "/api/public/booking/:token",
      mountPath: "/api/public/booking",
      method: "PATCH",
      middlewares: [],
      modules: [__api_public_booking__token__ts_onRequestPatch],
    },
  {
      routePath: "/api/public/specialist/:id",
      mountPath: "/api/public/specialist",
      method: "GET",
      middlewares: [],
      modules: [__api_public_specialist__id__ts_onRequestGet],
    },
  {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/telegram",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_telegram_ts_onRequestPost],
    },
  {
      routePath: "/api/public/booking",
      mountPath: "/api/public/booking",
      method: "POST",
      middlewares: [],
      modules: [__api_public_booking_index_ts_onRequestPost],
    },
  {
      routePath: "/api/public/meeting",
      mountPath: "/api/public/meeting",
      method: "POST",
      middlewares: [],
      modules: [__api_public_meeting_index_ts_onRequestPost],
    },
  {
      routePath: "/api/booking/:id",
      mountPath: "/api/booking",
      method: "PATCH",
      middlewares: [],
      modules: [__api_booking__id__ts_onRequestPatch],
    },
  {
      routePath: "/api/clients/:email",
      mountPath: "/api/clients",
      method: "PUT",
      middlewares: [],
      modules: [__api_clients__email__ts_onRequestPut],
    },
  {
      routePath: "/api/staff/:id",
      mountPath: "/api/staff",
      method: "DELETE",
      middlewares: [],
      modules: [__api_staff__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/staff/:id",
      mountPath: "/api/staff",
      method: "PUT",
      middlewares: [],
      modules: [__api_staff__id__ts_onRequestPut],
    },
  {
      routePath: "/api/analytics",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_analytics_ts_onRequestGet],
    },
  {
      routePath: "/api/booking",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_booking_ts_onRequestGet],
    },
  {
      routePath: "/api/booking",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_booking_ts_onRequestPost],
    },
  {
      routePath: "/api/clients",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_clients_ts_onRequestGet],
    },
  {
      routePath: "/api/profile",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_profile_ts_onRequestGet],
    },
  {
      routePath: "/api/profile",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_profile_ts_onRequestPut],
    },
  {
      routePath: "/api/staff",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_staff_ts_onRequestGet],
    },
  {
      routePath: "/api/staff",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_staff_ts_onRequestPost],
    },
  ]