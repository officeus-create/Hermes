import { academyPublicPathOverrides } from "./academy-public";
import { site, type PathDetail } from "./site";

export const publicPaths: PathDetail[] = site.paths.map((path) =>
  path.id === "academy"
    ? { ...path, ...academyPublicPathOverrides }
    : path,
);

export const publicPathById = (id: string) => publicPaths.find((path) => path.id === id);
