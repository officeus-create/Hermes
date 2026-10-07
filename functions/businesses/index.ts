import { repairCatalogPublication, REPAIR_CATALOG_CACHE_CONTROL } from "../api/_lib/repair-catalog-publication.mjs";

// Bounded discovery release: the existing Kittle owner only; no new search owners.
const DISCOVERY_PATH = "/businesses/connect/repair-shop/kittle-s-garage-a146544/";

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

export async function onRequestGet({ env, next }: { env: { DB?: any }; next: () => Promise<Response> }) {
  const response = await next();
  if (response.status !== 200 || !response.headers.get("Content-Type")?.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", REPAIR_CATALOG_CACHE_CONTROL);
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.delete("Content-Length");
  let rows: any[] = [];
  if (env.DB) {
    try {
      const result = await env.DB.prepare(`
        SELECT id,name,slug,city,state,region,catalog_opt_in
        FROM repair_shops WHERE catalog_opt_in=1
        ORDER BY updated_at DESC LIMIT 100
      `).all();
      rows = result?.results || [];
    } catch {
      // Fail closed for runtime links; the existing static catalog remains available.
      console.warn("Catalog runtime discovery unavailable");
    }
  }
  return new Response(addRepairCatalogLinks(await response.text(), rows), {
    status: response.status, statusText: response.statusText, headers,
  });
}
