import { repairCatalogPublication, REPAIR_CATALOG_CACHE_CONTROL } from "../api/_lib/repair-catalog-publication.mjs";
import { ensureHomeServiceCrmSchema } from "../api/_lib/home-service-crm.mjs";
import { homeServiceCatalogPublication } from "../api/_lib/home-service-catalog-publication.mjs";

// Bounded discovery release: the existing Kittle owner only; no new search owners.
const DISCOVERY_PATH = "/businesses/connect/repair-shop/kittle-s-garage-a146544/";
const MZM_DISCOVERY_PATH = "/businesses/connect/company/mzm-junk-removal/";

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));

// Visible discovery links are deliberately outside the card grid and its counts/JS renderer.
// No owner/account/contact/service records are needed for this projection.
export function addRepairCatalogLinks(html: string, rows: any[]) {
  if (html.includes("data-runtime-repair-links")) return html;
  const seen = new Set<string>();
  const links = rows.flatMap((row) => {
    const publication = repairCatalogPublication(row);
    if (!publication.eligible || publication.path !== DISCOVERY_PATH || seen.has(publication.path)) return [];
    seen.add(publication.path);
    const location = [row.city, row.region || row.state].filter(Boolean).join(", ");
    return [`<li><a href="${esc(publication.path)}">${esc(row.name)}${location ? ` — ${esc(location)}` : ""}</a></li>`];
  });
  if (!links.length) return html;
  const navigation = `<nav data-runtime-repair-links aria-label="Published repair shop profiles"><p>Repair shop profiles</p><ul>${links.join("")}</ul></nav>`;
  // Astro owns this static marker. Keep all original markup and scripts intact.
  return html.replace(/<div\b[^>]*\bdata-catalog-grid(?=[\s=>])[^>]*>/, (grid) => navigation + grid);
}


// Visible bounded discovery for the verified Hermes-managed MZM client.
// The public link exposes business-level identity/location only; no CRM owner/private records.
export function addHomeServiceCatalogLinks(html: string, rows: any[]) {
  if (html.includes("data-runtime-home-service-links")) return html;
  const seen = new Set<string>();
  const links = rows.flatMap((row) => {
    const publication = homeServiceCatalogPublication(row);
    if (!publication.eligible || publication.path !== MZM_DISCOVERY_PATH || seen.has(publication.path)) return [];
    seen.add(publication.path);
    const location = [row.city, row.state].filter(Boolean).join(", ");
    return [`<li><a href="${esc(publication.path)}">${esc(row.company_name)}${location ? ` — ${esc(location)}` : ""}</a></li>`];
  });
  if (!links.length) return html;
  const navigation = `<nav data-runtime-home-service-links aria-label="Published Home Services client profiles"><p>Home Services client profiles</p><ul>${links.join("")}</ul></nav>`;
  return html.replace(/<div\b[^>]*\bdata-catalog-grid(?=[\s=>])[^>]*>/, (grid) => navigation + grid);
}

export async function onRequestGet({ env, next }: { env: { DB?: any }; next: () => Promise<Response> }) {
  const response = await next();
  if (response.status !== 200 || !response.headers.get("Content-Type")?.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", REPAIR_CATALOG_CACHE_CONTROL);
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.delete("Content-Length");
  let repairRows: any[] = [];
  let homeServiceRows: any[] = [];
  if (env.DB) {
    try {
      await ensureHomeServiceCrmSchema(env.DB);
      const [repairResult, homeServiceResult] = await Promise.all([
        env.DB.prepare(`
          SELECT id,name,slug,city,state,region,catalog_opt_in
          FROM repair_shops WHERE catalog_opt_in=1
          ORDER BY updated_at DESC LIMIT 100
        `).all(),
        env.DB.prepare(`
          SELECT c.company_name,c.slug,c.city,c.state,c.catalog_opt_in,c.catalog_status,c.management_mode,c.catalog_publication_basis
          FROM hermes_company_profiles c
          JOIN hermes_home_service_profiles h ON h.company_id=c.id
          WHERE c.slug='mzm-junk-removal' AND c.company_type='home_service'
          LIMIT 1
        `).all(),
      ]);
      repairRows = repairResult?.results || [];
      homeServiceRows = homeServiceResult?.results || [];
    } catch {
      // Fail closed for runtime links; the existing static catalog remains available.
      console.warn("Catalog runtime discovery unavailable");
    }
  }
  const originalHtml = await response.text();
  const withRepair = addRepairCatalogLinks(originalHtml, repairRows);
  const withHomeServices = addHomeServiceCatalogLinks(withRepair, homeServiceRows);
  return new Response(withHomeServices, {
    status: response.status, statusText: response.statusText, headers,
  });
}
