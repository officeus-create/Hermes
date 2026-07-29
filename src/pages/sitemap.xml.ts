import type { APIRoute } from "astro";
import { logisticsAudiences } from "../data/logistics-audiences";
import { publishedLogisticsLocations } from "../data/logistics-locations";
import { logisticsRecommendations } from "../data/logistics-path-engine";

export const prerender = true;

const siteUrl = "https://hermeslogisticsus.com";
const lastModified = "2026-07-29";
const staticRoutes = [
  "/",
  "/paths/logistics/",
  "/paths/logistics/find-your-path/",
  "/load-board/",
  "/logistics/apply/",
  "/paths/marketing/",
  "/paths/academy/",
  "/paths/technology/",
  "/case/it-development/",
  "/privacy/",
  "/contacts/",
  "/ua/",
  "/ru/",
  "/es/",
  "/it/",
  "/fr/",
];

const routes = [...new Set([
  ...staticRoutes,
  ...logisticsRecommendations.map((recommendation) => recommendation.route),
  ...logisticsAudiences.map((audience) => `/logistics/${audience.slug}/`),
  ...publishedLogisticsLocations.map((location) => `/logistics/${location.slug}/`),
])].sort((left, right) => left.localeCompare(right));

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const GET: APIRoute = () => {
  const entries = routes
    .map((route) => `  <url><loc>${escapeXml(new URL(route, siteUrl).toString())}</loc><lastmod>${lastModified}</lastmod></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};

