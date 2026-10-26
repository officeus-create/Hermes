// Request-time lifecycle: continuously open Wisconsin recruiting is owner-confirmed,
// while any actual pause/closure still suppresses live JobPosting and apply CTAs.
// A dated operational check must not silently expire an evergreen recruiting role.
export function hasCurrentWisconsinReview(record, now = new Date()) {
  if (!record || !record.ownerApprovedForPublication || record.status !== "verified_open") return false;
  const review = Date.parse(`${record.reviewedAt}T00:00:00Z`);
  const posted = Date.parse(`${record.datePosted}T00:00:00Z`);
  const instant = new Date(now).getTime();
  const ownerReview = record.descriptionSourceIds?.some((id) => id.startsWith(`owner:${record.reviewedAt}:`));
  if (!ownerReview || ![review, posted, instant].every(Number.isFinite) || posted > review || review > instant) return false;
  if (record.alwaysOpen === true) {
    return !record.expiresAt && record.descriptionSourceIds.includes(`owner:${record.reviewedAt}:permanent-open-recruiting`);
  }
  const expiry = Date.parse(`${record.expiresAt}T23:59:59Z`);
  return Number.isFinite(expiry) && review <= expiry
    && expiry - review < 8 * 86_400_000 && instant < expiry;
}

const PAUSED_WISCONSIN_DESCRIPTION = "Wisconsin owner-operator information from Hermes Logistics. Applications are temporarily unavailable; use the published status contact to ask about a future reopening.";

function sanitizePausedWisconsinSchema(value) {
  if (Array.isArray(value)) return value.map(sanitizePausedWisconsinSchema).filter((item) => item !== undefined);
  if (!value || typeof value !== "object") return value;
  const types = [].concat(value["@type"] || []);
  if (types.includes("JobPosting") || types.includes("FAQPage")) return undefined;
  const clean = Object.fromEntries(Object.entries(value)
    .map(([key, child]) => [key, sanitizePausedWisconsinSchema(child)])
    .filter(([, child]) => child !== undefined));
  if (types.includes("WebPage") && String(clean["@id"] || "").includes("/careers/wisconsin-owner-operators/")) {
    clean.description = PAUSED_WISCONSIN_DESCRIPTION;
  }
  return clean;
}

function replaceSimpleMarkedContent(html, marker, text) {
  const pattern = new RegExp(`(<[^>]+\\b${marker}\\b[^>]*>)[\\s\\S]*?(<\\/[^>]+>)`, "gi");
  return html.replace(pattern, `$1${text}$2`);
}

function replacePausedDescriptionMeta(html) {
  return html.replace(/<meta\\b[^>]*>/gi, (tag) => {
    const isDescription = /(?:name|property)=["'](?:description|og:description|twitter:description)["']/i.test(tag);
    if (!isDescription || !/\\bcontent=["'][^"']*["']/i.test(tag)) return tag;
    return tag.replace(/\\bcontent=(["'])[^"']*\\1/i, `content="${PAUSED_WISCONSIN_DESCRIPTION}"`);
  });
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
  // A paused/closed owner cannot keep current source, open-only copy or apply links from an older cached build.
  output = replaceSimpleMarkedContent(output, "data-wi-vacancy-status-lead", PAUSED_WISCONSIN_DESCRIPTION);
  output = replaceSimpleMarkedContent(output, "data-wi-vacancy-status-updated", "Recruiting temporarily unavailable · Original posting October 3, 2026");
  output = replaceSimpleMarkedContent(output, "data-wi-vacancy-status-summary", "For independent owners with their own commercial truck and trailer, not company-driver applicants. This opportunity is currently not accepting applications; contact Hermes about a possible future status change.");
  output = replacePausedDescriptionMeta(output);
  output = output.replace(/<div\b[^>]*\bdata-wi-vacancy-current-source-intro\b[^>]*>[\s\S]*?<\/div>/gi, "");
  output = output.replace(/<section\b[^>]*\bdata-wi-vacancy-recruiting-current\b[^>]*>[\s\S]*?<\/section>/gi, "");
  output = output.replace(/<section\b[^>]*\bdata-wi-vacancy-current-faq\b[^>]*>[\s\S]*?<\/section>/gi, "");
  output = output.replace(/<article\b[^>]*\bdata-wi-vacancy-open-source\b[^>]*>[\s\S]*?<\/article>/gi, "");
  output = output.replace(/(<article\b[^>]*\bdata-wi-vacancy-closed-source\b[^>]*?)\s+hidden(?:="[^"]*")?/gi, "$1");
  output = output.replace(/<a\b[^>]*\bdata-owner-operator-apply-contact\b[^>]*>[\s\S]*?<\/a>/gi, "recruiting contact");
  // Yuri interviews only for current recruiting. Remove his call CTA on an explicit pause/closure.
  output = output.replace(/<a\b[^>]*\bdata-owner-operator-call-contact\b[^>]*>[\s\S]*?<\/a>/gi, "");
  output = output.replace(/(<section\b[^>]*\bdata-wi-vacancy-expired\b[^>]*?)\s+hidden(?:="[^"]*")?/gi, "$1");
  output = output.replace(/<script\b([^>]*\btype=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (_script, attrs, raw) => {
    try {
      const clean = sanitizePausedWisconsinSchema(withoutJobPosting(JSON.parse(raw)));
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
