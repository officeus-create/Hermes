import generatedInsights from "./insights.generated.json";

export type InsightDirection = "logistics" | "marketing" | "academy" | "technology";
export type InsightContentTier = "standalone" | "digest" | "brief";

export interface InsightLink {
  title: string;
  body: string;
  href: string;
}

export interface InsightPost {
  id: string;
  direction: InsightDirection;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  conciseAnswer: string;
  explanation: string[];
  takeaways: string[];
  faq: Array<{ question: string; answer: string }>;
  related: InsightLink[];
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  sourceLabel: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  keywords: string[];
  contentTier: InsightContentTier;
  currentMarketClaim: boolean;
  telegram?: { group: string; messageId: number | null };
}

export const insightDirectionMeta: Record<InsightDirection, { label: string; ownerUrl: string; description: string }> = {
  logistics: {
    label: "Hermes Logistics",
    ownerUrl: "/paths/logistics/",
    description: "Freight-market context, carrier operations, equipment, lanes, load economics, and transport workflows.",
  },
  marketing: {
    label: "Hermes Marketing",
    ownerUrl: "/paths/marketing/",
    description: "SEO, social distribution, measurement, content systems, demand generation, and conversion operations.",
  },
  academy: {
    label: "Hermes Academy",
    ownerUrl: "/paths/academy/",
    description: "Practical learning notes, operating examples, program updates, and reviewed training context.",
  },
  technology: {
    label: "Hermes Technology",
    ownerUrl: "/paths/technology/",
    description: "AI, CRM, automation, websites, software systems, integrations, and digital operating models.",
  },
};

export const insights = (generatedInsights as InsightPost[])
  .slice()
  .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));

export const getInsightPath = (post: Pick<InsightPost, "direction" | "slug">) =>
  `/insights/${post.direction}/${post.slug}/`;

export const insightsByDirection = (direction: InsightDirection) =>
  insights.filter((post) => post.direction === direction);
