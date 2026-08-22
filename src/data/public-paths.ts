import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
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
    programLabel: "IT Development · AI · APIs · CRM · Automation",
  },
};

export const publicPaths: PathDetail[] = site.paths.map((path) => {
  const directionOverride = publicDirectionOverrides[path.id] ?? {};
  const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};

  return {
    ...path,
    ...directionOverride,
    ...academyOverride,
  };
});

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
