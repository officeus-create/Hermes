import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOrder: PathDetail["id"][] = ["logistics", "marketing", "technology", "academy"];
const directionRank = new Map(publicDirectionOrder.map((id, index) => [id, index]));
const rank = (id: string) => directionRank.get(id) ?? 99;

// Keep the shared navigation and localized path traversal aligned with the same
// revenue-first order used by the homepage and public direction registry.
site.paths.sort((left, right) => rank(left.id) - rank(right.id));
site.navigation.sort((left, right) => {
  const leftId = left.href.match(/^paths\/([^/]+)\//)?.[1] ?? "";
  const rightId = right.href.match(/^paths\/([^/]+)\//)?.[1] ?? "";
  return rank(leftId) - rank(rightId);
});

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: { number: "01", category: "Hermes Logistics", brandLabel: "Hermes Logistics" },
  marketing: { number: "02", category: "Hermes Marketing", brandLabel: "Hermes Marketing" },
  technology: { number: "03", category: "Hermes Technology", brandLabel: "Hermes Technology" },
  academy: { number: "04", category: "Hermes Academy", brandLabel: "Hermes Academy" },
};

export const publicPaths: PathDetail[] = site.paths.map((path) => {
  const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};
  return { ...path, ...publicDirectionOverrides[path.id], ...academyOverride };
});

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
