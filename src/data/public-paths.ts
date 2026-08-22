import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionBrandOverrides: Record<string, Partial<PathDetail>> = {
  logistics: {
    category: "Hermes Logistics",
    brandLabel: "Hermes Logistics",
  },
  marketing: {
    category: "Hermes Marketing",
    brandLabel: "Hermes Marketing",
  },
  academy: {
    category: "Hermes Academy",
    brandLabel: "Hermes Academy",
  },
  technology: {
    category: "Hermes Technology",
    brandLabel: "Hermes Technology",
  },
};

export const publicPaths: PathDetail[] = site.paths.map((path) => ({
  ...path,
  ...(path.id === "academy" ? academyPublicPathOverrides : {}),
  ...(publicDirectionBrandOverrides[path.id] ?? {}),
}));

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
