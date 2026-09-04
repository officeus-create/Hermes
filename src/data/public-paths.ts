import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOrder: PathDetail["id"][] = ["logistics", "marketing", "technology", "academy"];
const directionRank = new Map(publicDirectionOrder.map((id, index) => [id, index]));

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: { number: "01", category: "Hermes Logistics", brandLabel: "Hermes Logistics" },
  marketing: { number: "02", category: "Hermes Marketing", brandLabel: "Hermes Marketing" },
  technology: { number: "03", category: "Hermes Technology", brandLabel: "Hermes Technology" },
  academy: { number: "04", category: "Hermes Academy", brandLabel: "Hermes Academy" },
};

export const publicPaths: PathDetail[] = [...site.paths]
  .sort((left, right) => (directionRank.get(left.id) ?? 99) - (directionRank.get(right.id) ?? 99))
  .map((path) => {
    const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};
    return { ...path, ...publicDirectionOverrides[path.id], ...academyOverride };
  });

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
