export type HermesSearchVisibility = "public" | "workspace" | "company" | "internal_owner";

export type HermesSearchResult = {
  id: string;
  entityType: string;
  title: string;
  subtitle?: string;
  href: string;
  visibility: HermesSearchVisibility;
  workspaceId?: string;
  companyId?: string;
  source: string;
  keywords?: readonly string[];
  updatedAt?: string;
};

export type HermesSearchContext = {
  internalOwner?: boolean;
  workspaceIds?: readonly string[];
  companyIds?: readonly string[];
};

export type HermesSearchMatch = HermesSearchResult & {
  score: number;
};

const clean = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");

export function normalizeHermesSearchQuery(value: unknown) {
  return clean(value);
}

export function canAccessHermesSearchResult(
  result: HermesSearchResult,
  context: HermesSearchContext,
) {
  if (result.visibility === "public") return true;
  if (result.visibility === "internal_owner") return context.internalOwner === true;
  if (result.visibility === "workspace") {
    return Boolean(result.workspaceId && context.workspaceIds?.includes(result.workspaceId));
  }
  if (result.visibility === "company") {
    return Boolean(result.companyId && context.companyIds?.includes(result.companyId));
  }
  return false;
}

function matchScore(result: HermesSearchResult, query: string) {
  if (!query) return 1;

  const title = clean(result.title);
  const subtitle = clean(result.subtitle);
  const entityType = clean(result.entityType);
  const keywords = (result.keywords ?? []).map(clean);
  const tokens = query.split(" ").filter(Boolean);
  const haystack = [title, subtitle, entityType, ...keywords].join(" ");

  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 10;
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 70;
  else if (title.includes(query)) score += 50;

  for (const token of tokens) {
    if (title.startsWith(token)) score += 12;
    else if (title.includes(token)) score += 8;
    if (subtitle.includes(token)) score += 3;
    if (entityType.includes(token)) score += 2;
    if (keywords.some((keyword) => keyword.includes(token))) score += 1;
  }

  return score;
}

function canonicalKey(result: HermesSearchResult) {
  return [
    clean(result.entityType),
    clean(result.companyId),
    clean(result.workspaceId),
    clean(result.id),
  ].join(":");
}

export function searchHermesResults(
  results: readonly HermesSearchResult[],
  query: unknown,
  context: HermesSearchContext,
  limit = 20,
): HermesSearchMatch[] {
  const term = normalizeHermesSearchQuery(query);
  const boundedLimit = Number.isFinite(limit) ? Math.min(100, Math.max(1, Math.trunc(limit))) : 20;
  const deduped = new Map<string, HermesSearchMatch>();

  for (const result of results) {
    if (!canAccessHermesSearchResult(result, context)) continue;
    const score = matchScore(result, term);
    if (score <= 0) continue;

    const match = { ...result, score };
    const key = canonicalKey(result);
    const current = deduped.get(key);
    if (!current || match.score > current.score) deduped.set(key, match);
  }

  return [...deduped.values()]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
    .slice(0, boundedLimit);
}
