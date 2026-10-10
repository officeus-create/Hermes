const ALLOWED_UTM_KEYS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content"]);
const SAFE_UTM_VALUE = /^[a-z0-9][a-z0-9._-]{0,79}$/i;

export function isVerifiedSourceCta(primaryActionHref, sourceUrl) {
  if (primaryActionHref === sourceUrl) return true;

  try {
    const source = new URL(sourceUrl);
    const action = new URL(primaryActionHref);

    if (source.protocol !== "https:" || action.protocol !== "https:") return false;
    if (source.origin !== action.origin || source.pathname !== action.pathname || source.hash !== action.hash) return false;
    if (source.search) return false;

    const entries = [...action.searchParams.entries()];
    if (!entries.length) return false;

    const seen = new Set();
    for (const [key, value] of entries) {
      if (!ALLOWED_UTM_KEYS.has(key) || seen.has(key) || !SAFE_UTM_VALUE.test(value)) return false;
      seen.add(key);
    }

    if (action.searchParams.get("utm_source") !== "hermeslogisticsus.com") return false;
    if (action.searchParams.get("utm_medium") !== "referral") return false;
    if (!action.searchParams.get("utm_campaign")) return false;

    return true;
  } catch {
    return false;
  }
}
