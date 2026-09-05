import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

const publicDirectionOverrides: Partial<Record<PathDetail["id"], Partial<PathDetail>>> = {
  logistics: { category: "Hermes Logistics", brandLabel: "Hermes Logistics" },
  marketing: { category: "Hermes Marketing", brandLabel: "Hermes Marketing" },
  technology: { category: "Hermes Technology", brandLabel: "Hermes Technology" },
  academy: { category: "Hermes Academy", brandLabel: "Hermes Academy" },
};

const publicDirectionOrder: PathDetail["id"][] = ["logistics", "marketing", "technology", "academy"];

export const publicPaths: PathDetail[] = publicDirectionOrder
  .map((id) => site.paths.find((path) => path.id === id))
  .filter((path): path is PathDetail => Boolean(path))
  .map((path) => {
    const academyOverride = path.id === "academy" ? academyPublicPathOverrides : {};
    return { ...path, ...publicDirectionOverrides[path.id], ...academyOverride };
  });

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
