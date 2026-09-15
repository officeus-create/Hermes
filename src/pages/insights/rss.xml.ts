import { getInsightPath, insights } from "../../data/insights";

export const prerender = true;

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export function GET({ site }: { site?: URL }) {
  const base = site ?? new URL("https://hermeslogisticsus.com");
  const items = insights.filter((post) => post.contentTier === "standalone").map((post) => {
    const link = new URL(getInsightPath(post), base).toString();
    return `
    <item>
      <title>${escapeXml(post.h1)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(`${post.datePublished}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.direction)}</category>
    </item>`;
  }).join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hermes Insights</title>
    <link>${new URL("/insights/", base).toString()}</link>
    <description>Reviewed Hermes insights across logistics, marketing, Academy, and technology.</description>
    <language>en-us</language>${items}
  </channel>
</rss>
`;

  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
