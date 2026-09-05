import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: { category: "Hermes Logistics", brandLabel: "Hermes Logistics" },
  marketing: { category: "Hermes Marketing", brandLabel: "Hermes Marketing" },
  technology: { category: "Hermes Technology", brandLabel: "Hermes Technology" },
  academy: { category: "Hermes Academy", brandLabel: "Hermes Academy" },
};

const publicDirectionOrder: PathDetail["id"][] = ["logistics", "marketing", "technology", "academy"];

export const publicPaths: PathDetail[] = publicDirectionOrder.flatMap((id) => {
  const path = site.paths.find((candidate) => candidate.id === id) as PathDetail | undefined;
  if (!path) return [];

  const academyOverride: Partial<PathDetail> = id === "academy" ? academyPublicPathOverrides : {};
  return [{ ...path, ...publicDirectionOverrides[id], ...academyOverride }];
});

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
