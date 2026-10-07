// Request-time lifecycle for the existing Wisconsin recruiting owner only.
// Never infer renewal from an accessible ATS URL or an extended expiry alone.
export function hasCurrentWisconsinReview(record, now = new Date()) {
  if (!record || !record.ownerApprovedForPublication || record.status !== "verified_open") return false;
  const review = Date.parse(`${record.reviewedAt}T00:00:00Z`);
  const posted = Date.parse(`${record.datePosted}T00:00:00Z`);
  const expiry = Date.parse(`${record.expiresAt}T23:59:59Z`);
  const instant = new Date(now).getTime();
  const ownerReview = record.descriptionSourceIds?.some((id) => id.startsWith(`owner:${record.reviewedAt}:`));
  return ownerReview && [review, posted, expiry, instant].every(Number.isFinite)
    && posted <= review && review <= instant && review <= expiry
    && expiry - review < 8 * 86_400_000 && instant < expiry;
}

function withoutJobPosting(value) {
  if (Array.isArray(value)) return value.map(withoutJobPosting).filter((item) => item !== undefined);
  if (!value || typeof value !== "object") return value;
  const types = [].concat(value["@type"] || []);
  if (types.includes("JobPosting")) return undefined;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, withoutJobPosting(child)])
    .filter(([, child]) => child !== undefined));
}

export function expireWisconsinHtml(html) {
  // Controlled template regions cannot contain nested sections. Keep useful
  // historical content, canonical, robots and all unrelated schema unchanged.
  let output = html.replace(/<section\b[^>]*\bdata-wi-vacancy-current\b[^>]*>[\s\S]*?<\/section>/gi, "");
  output = output.replace(/(<section\b[^>]*\bdata-wi-vacancy-expired\b[^>]*?)\s+hidden(?:="[^"]*")?/gi, "$1");
  output = output.replace(/<script\b([^>]*\btype=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (_script, attrs, raw) => {
    try {
      const clean = withoutJobPosting(JSON.parse(raw));
      if (clean === undefined || (Array.isArray(clean) && clean.length === 0)) return "";
      return `<script${attrs}>${JSON.stringify(clean).replace(/</g, "\\u003c")}</script>`;
    } catch {
      // An unreadable JSON-LD block cannot prove a current vacancy.
      return "";
    }
  });
  return output;
}

export function expireWisconsinCareersHub(html, currentCount) {
  return html
    .replace(/<article\b([^>]*\bdata-vacancy-slug="wisconsin-owner-operators"[^>]*)>[\s\S]*?<\/article>/gi,
      '<article$1><p class="eyebrow">Publication review due</p><h3>Wisconsin Owner-Operator Recruiting</h3><p>A fresh recruiting review is required before this opportunity can be advertised as current.</p><a class="button" href="/careers/wisconsin-owner-operators/">Review recruiting information</a></article>')
    .replace(/(<strong\b[^>]*\bdata-current-vacancy-count\b[^>]*>)[\s\S]*?<\/strong>/gi, `$1${currentCount}</strong>`)
    .replace(/(<h2\b[^>]*\bdata-current-vacancy-heading\b[^>]*>)[\s\S]*?<\/h2>/gi,
      `$1${currentCount > 0 ? "Verified public vacancies are open." : "General careers inquiries are open. No verified public vacancy is listed today."}</h2>`);
}

export async function guardedWisconsinResponse(response, current, currentCount) {
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("text/html")) return response;
  const html = await response.text();
  const headers = new Headers(response.headers);
  for (const header of ["content-length", "etag", "last-modified", "content-encoding"]) headers.delete(header);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  const expired = currentCount === undefined ? expireWisconsinHtml : (value) => expireWisconsinCareersHub(value, currentCount);
  return new Response(current ? html : expired(html), { status: 200, headers });
}
