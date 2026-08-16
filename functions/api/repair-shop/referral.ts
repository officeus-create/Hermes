import {
  normalizeRepairShopReferralToken,
  repairShopReferralCookieHeader,
  resolveRepairShopReferral,
} from "../_lib/repair-shop-sales-attribution.mjs";

type Env = {
  REPAIR_SHOP_REFERRAL_MAP_JSON?: string;
};

const supportedLanguages = new Set(["en", "es", "fr", "uk", "it", "ru"]);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const token = normalizeRepairShopReferralToken(url.searchParams.get("ref"));
  const referral = token ? resolveRepairShopReferral(env, token) : null;
  const destination = new URL("/services/hermes-connect/repair-shops/auth/", url.origin);
  destination.searchParams.set("mode", "register");

  const requestedLanguage = url.searchParams.get("lang");
  if (requestedLanguage && requestedLanguage !== "en" && supportedLanguages.has(requestedLanguage)) {
    destination.searchParams.set("lang", requestedLanguage);
  }

  if (!token || !referral) {
    destination.searchParams.set("referral", "invalid");
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination.toString(),
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  }

  destination.searchParams.set("referral", "captured");
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      "Set-Cookie": repairShopReferralCookieHeader(token),
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });
}
