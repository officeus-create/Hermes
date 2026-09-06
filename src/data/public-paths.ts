import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: { category: "Hermes Logistics", brandLabel: "Hermes Logistics" },
  marketing: { category: "Hermes Marketing", brandLabel: "Hermes Marketing" },
  academy: { category: "Hermes Academy", brandLabel: "Hermes Academy" },
  technology: { category: "Hermes Technology", brandLabel: "Hermes Technology" },
};

const directionOrder: Record<PathDetail["id"], number> = {
  logistics: 0,
  marketing: 1,
  technology: 2,
  academy: 3,
};

export const publicPaths: PathDetail[] = site.paths
  .map((path) => {
    const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};
    return { ...path, ...publicDirectionOverrides[path.id], ...academyOverride };
  })
  .sort((a, b) => directionOrder[a.id] - directionOrder[b.id]);

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
