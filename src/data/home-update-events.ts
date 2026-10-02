import { getInsightPath, insights } from "./insights";

export type HomeUpdateArea = "insights" | "connect" | "catalog" | "academy";

export interface HomeUpdateEvent {
  area: HomeUpdateArea;
  publishedAt: string;
  href: string;
}

/** Add Connect, Catalog, or Academy entries only after a public release has a dated canonical URL. */
export const homeUpdateEvents: HomeUpdateEvent[] = insights.length
  ? [{ area: "insights", publishedAt: insights[0].datePublished, href: getInsightPath(insights[0]) }]
  : [];

export const latestHomeUpdate = (area: HomeUpdateArea) =>
  homeUpdateEvents.filter((event) => event.area === area).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
