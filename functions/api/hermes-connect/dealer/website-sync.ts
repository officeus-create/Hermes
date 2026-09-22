import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../../_lib/hermes-company-profiles.mjs";
import { getOwnedHermesCompany, sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import { cleanDealerText } from "../../_lib/dealer-transport-requests.mjs";
import { upsertCompanyConnection } from "../../_lib/company-connections.mjs";

type Env = { DB?: any };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const MAX_HTML = 1_200_000;

function normalizedHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function safePublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost"
      || host.endsWith(".localhost")
      || host.endsWith(".local")
      || host === "0.0.0.0"
      || host === "::1"
      || /^127\./.test(host)
      || /^10\./.test(host)
      || /^192\.168\./.test(host)
      || /^169\.254\./.test(host)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchSameSiteHtml(url: URL, baseHost: string) {
  let current = new URL(url);
  for (let hop = 0; hop < 4; hop += 1) {
    if (normalizedHost(current.hostname) !== baseHost) throw new Error("cross_site_redirect_blocked");
    const response = await fetch(current.toString(), {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "HermesConnectDealerWebsiteSync/1.0 (+https://hermeslogisticsus.com/)",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("redirect_location_missing");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`website_fetch_${response.status}`);
    const type = String(response.headers.get("content-type") || "").toLowerCase();
    if (!type.includes("text/html") && !type.includes("application/xhtml")) throw new Error("website_content_type_invalid");
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_HTML) throw new Error("website_response_too_large");
    const html = (await response.text()).slice(0, MAX_HTML);
    return { url: current.toString(), html, status: response.status };
  }
  throw new Error("website_redirect_limit");
}

function textTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) : null;
}

function inventorySummary(html: string) {
  const countMatch = html.match(/([\d,]+)\s+vehicles?\s+found/i);
  const vins = new Set<string>();
  for (const match of html.matchAll(/\bVIN:\s*([A-HJ-NPR-Z0-9]{17})\b/gi)) {
    vins.add(String(match[1]).toUpperCase());
    if (vins.size >= 500) break;
  }
  return {
    reported_count: countMatch ? Number(countMatch[1].replace(/,/g, "")) : null,
    vin_count_observed: vins.size,
    sample_vins: [...vins].slice(0, 10),
  };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders);

  await ensureHermesCompanyProfilesSchema(env.DB);
  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company) return jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders);
  if (String(company.company_type) !== "dealer") return jsonResponse(403, { success: false, error: "dealer_company_required" }, privateHeaders);

  const companyProfile = await env.DB.prepare("SELECT website FROM hermes_company_profiles WHERE id=? LIMIT 1")
    .bind(company.id).first();
  const website = safePublicHttpsUrl(String(companyProfile?.website || ""));
  if (!website) return jsonResponse(400, { success: false, error: "public_https_website_required" }, privateHeaders);
  const baseHost = normalizedHost(website.hostname);

  let body: Record<string, unknown> = {};
  try { body = await request.json() as Record<string, unknown>; }
  catch {}

  const requestedPaths = Array.isArray(body.inventory_paths)
    ? body.inventory_paths.map((item) => cleanDealerText(item, 180)).filter(Boolean).slice(0, 4)
    : [];
  const paths = requestedPaths.filter((path) => path.startsWith("/") && !path.startsWith("//"));
  const observedAt = new Date().toISOString();

  try {
    const home = await fetchSameSiteHtml(website, baseHost);
    const inventories = [];
    for (const path of paths) {
      const target = new URL(path, website);
      if (normalizedHost(target.hostname) !== baseHost) continue;
      const page = await fetchSameSiteHtml(target, baseHost);
      inventories.push({
        path,
        url: page.url,
        title: textTitle(page.html),
        ...inventorySummary(page.html),
      });
    }

    const inventoryTotals = inventories.reduce((total, item) => total + (Number(item.reported_count) || 0), 0);
    const connection = await upsertCompanyConnection(env.DB, {
      companyId: company.id,
      provider: "website",
      state: "connected_read_only",
      mode: "read_only",
      sourceUrl: website.toString(),
      lastVerifiedAt: observedAt,
      lastError: null,
      metadata: {
        owner_scoped_public_read: true,
        homepage_title: textTitle(home.html),
        inventory_paths: inventories.map((item) => ({
          path: item.path,
          title: item.title,
          reported_count: item.reported_count,
          vin_count_observed: item.vin_count_observed,
          sample_vins: item.sample_vins,
        })),
        total_inventory_reported: inventoryTotals || null,
        transport_auto_publish: false,
        note: "Public website inventory is context only. A vehicle becomes a Hermes Load Board load only after a separate dealer transport request is approved.",
      },
    });

    return jsonResponse(200, {
      success: true,
      connection,
      website: {
        source_url: website.toString(),
        homepage_title: textTitle(home.html),
        observed_at: observedAt,
      },
      inventory: {
        feeds: inventories,
        total_reported: inventoryTotals || null,
        auto_created_transport_requests: 0,
        auto_created_load_board_posts: 0,
      },
    }, privateHeaders);
  } catch (error: any) {
    const code = cleanDealerText(error?.message || "website_sync_failed", 120);
    await upsertCompanyConnection(env.DB, {
      companyId: company.id,
      provider: "website",
      state: "degraded",
      mode: "read_only",
      sourceUrl: website.toString(),
      lastVerifiedAt: null,
      lastError: code,
      metadata: {
        owner_scoped_public_read: true,
        transport_auto_publish: false,
      },
    });
    return jsonResponse(502, { success: false, error: code }, privateHeaders);
  }
}
