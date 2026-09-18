import generatedInsights from "./insights.generated.json";

export type InsightDirection = "logistics" | "marketing" | "academy" | "technology";
export type InsightContentTier = "standalone" | "digest" | "brief";
export type InsightEvidenceKind = "public_external" | "first_party_historical" | "first_party_current" | "internal_signal";
export type InsightEvidenceUse = "primary" | "context_only" | "private_signal";
export type InsightPublicationRecommendation = "hold" | "telegram" | "digest" | "standalone" | "standalone_historical";

export interface InsightLink {
  title: string;
  body: string;
  href: string;
}

export interface InsightEvidence {
  sourceId: string;
  kind: InsightEvidenceKind;
  label: string;
  use: InsightEvidenceUse;
  url?: string;
  observedAt?: string;
  eventDate?: string;
  notes?: string;
}

export interface InsightHistoricalComparison {
  thenPeriod: string;
  nowPeriod: string;
  summary: string;
  evidenceSourceIds: string[];
  currentVerificationUrl?: string;
}

export interface InsightPublicationScore {
  score: number;
  recommendation: InsightPublicationRecommendation;
  reasons: string[];
}

export interface InsightPrivacyReview {
  piiRemoved: boolean;
  privateFiguresRemoved: boolean;
  historicalClaimsRevalidated: boolean;
  reviewer?: string;
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
  evidence?: InsightEvidence[];
  historicalComparison?: InsightHistoricalComparison;
  publicationScore?: InsightPublicationScore;
  privacyReview?: InsightPrivacyReview;
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
