import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import "./insights-source-registry.test.mjs";

const registry = JSON.parse(await readFile(new URL("../src/data/insights.generated.json", import.meta.url), "utf8"));
const sourceRegistry = JSON.parse(await readFile(new URL("../src/data/insights-source-registry.json", import.meta.url), "utf8"));
const registeredSourceIds = new Set(sourceRegistry.map((source) => source.id));
const evidenceKinds = new Set(["public_external", "first_party_historical", "first_party_current", "internal_signal"]);
const evidenceUses = new Set(["primary", "context_only", "private_signal"]);
const publicationRecommendations = new Set(["hold", "telegram", "digest", "standalone", "standalone_historical"]);

assert.ok(registry.length >= 1, "insights registry must contain at least one approved record");
const routeKeys = new Set();
const sourceUrls = new Set();
for (const post of registry) {
  assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(post.sourceUrl, /^https:\/\//);
  assert.match(post.sourcePublishedAt, /^\d{4}-\d{2}-\d{2}$/);
  const analysisLength = post.explanation.join(" ").length;
  assert.ok(analysisLength >= (post.contentTier === "standalone" ? 650 : 120), `${post.id}: original analysis is too thin for ${post.contentTier}`);
  assert.ok(post.takeaways.length >= (post.contentTier === "standalone" ? 3 : 1), `${post.id}: takeaways missing`);
  assert.ok(post.contentTier !== "standalone" || post.faq.length >= 3, `${post.id}: standalone FAQ missing`);
  assert.ok(post.related.length >= (post.contentTier === "standalone" ? 2 : 1) && post.related.every((item) => item.href.startsWith("/")), `${post.id}: internal related links required`);
  assert.ok(post.primaryAction.href.startsWith("/") && post.secondaryAction.href.startsWith("/"), `${post.id}: CTAs must remain internal`);
  const route = `${post.direction}/${post.slug}`;
  assert.ok(!routeKeys.has(route), `${post.id}: duplicate insight route`);
  routeKeys.add(route);
  assert.ok(!sourceUrls.has(post.sourceUrl), `${post.id}: duplicate source should merge or expand instead of creating a competing article`);
  sourceUrls.add(post.sourceUrl);
  if (post.currentMarketClaim) assert.ok(post.sourcePublishedAt, `${post.id}: current claims require source date`);

  if (post.evidence !== undefined) {
    assert.ok(Array.isArray(post.evidence) && post.evidence.length > 0, `${post.id}: evidence must be a non-empty array`);
    for (const item of post.evidence) {
      assert.ok(registeredSourceIds.has(item.sourceId), `${post.id}: unregistered evidence source ${item.sourceId}`);
      assert.ok(evidenceKinds.has(item.kind), `${post.id}: invalid evidence kind`);
      assert.ok(evidenceUses.has(item.use), `${post.id}: invalid evidence use`);
      assert.ok(typeof item.label === "string" && item.label.trim(), `${post.id}: evidence label required`);
      assert.ok(!(item.kind === "internal_signal" && item.use === "primary"), `${post.id}: internal signal cannot be primary public evidence`);
      if (item.url) assert.match(item.url, /^https:\/\//, `${post.id}: evidence URL must use https`);
    }
  }

  const hasHistoricalPrivateEvidence = Array.isArray(post.evidence) && post.evidence.some((item) =>
    item.kind === "first_party_historical" || item.kind === "internal_signal"
  );
  if (hasHistoricalPrivateEvidence || post.historicalComparison) {
    assert.equal(post.privacyReview?.piiRemoved, true, `${post.id}: PII removal review required`);
    assert.equal(post.privacyReview?.privateFiguresRemoved, true, `${post.id}: private-figure removal review required`);
    assert.equal(post.privacyReview?.historicalClaimsRevalidated, true, `${post.id}: historical claim revalidation required`);
  }

  if (post.historicalComparison !== undefined) {
    assert.ok(post.historicalComparison.thenPeriod && post.historicalComparison.nowPeriod && post.historicalComparison.summary, `${post.id}: historical comparison fields required`);
    assert.ok(Array.isArray(post.historicalComparison.evidenceSourceIds) && post.historicalComparison.evidenceSourceIds.length > 0, `${post.id}: historical comparison source IDs required`);
    for (const sourceId of post.historicalComparison.evidenceSourceIds) {
      assert.ok(registeredSourceIds.has(sourceId), `${post.id}: unregistered historical source ${sourceId}`);
    }
    if (post.historicalComparison.currentVerificationUrl) assert.match(post.historicalComparison.currentVerificationUrl, /^https:\/\//);
  }

  if (post.publicationScore !== undefined) {
    assert.ok(Number.isFinite(post.publicationScore.score) && post.publicationScore.score >= 0 && post.publicationScore.score <= 100, `${post.id}: publication score must be 0-100`);
    assert.ok(publicationRecommendations.has(post.publicationScore.recommendation), `${post.id}: invalid publication recommendation`);
    assert.ok(Array.isArray(post.publicationScore.reasons) && post.publicationScore.reasons.length > 0, `${post.id}: publication score reasons required`);
    if (post.contentTier === "standalone") assert.ok(post.publicationScore.score >= 75, `${post.id}: scored standalone insight must be >=75`);
    if (post.publicationScore.recommendation === "standalone_historical") assert.ok(post.historicalComparison, `${post.id}: standalone_historical requires comparison`);
  }
}
const sitemap = await readFile(new URL("../public/sitemap-insights.xml", import.meta.url), "utf8");
assert.match(sitemap, /https:\/\/hermeslogisticsus\.com\/insights\//);
for (const post of registry.filter((item) => item.contentTier === "standalone")) {
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com/insights/${post.direction}/${post.slug}/`), `${post.id}: sitemap entry missing`);
}
const rss = await readFile(new URL("../src/pages/insights/rss.xml.ts", import.meta.url), "utf8");
assert.ok(rss.includes("application/rss+xml"), "RSS route must emit RSS content type");
const contentPrWorkflow = await readFile(new URL("../.github/workflows/insights-content-pr.yml", import.meta.url), "utf8");
assert.match(contentPrWorkflow, /No unpublished Insights delta; PR already merged or no content generated/);
assert.match(contentPrWorkflow, /has_changes=false/);
assert.match(contentPrWorkflow, /has_changes=true/);
assert.equal((contentPrWorkflow.match(/if: steps\.scope\.outputs\.has_changes == 'true'/g) || []).length, 6);
assert.match(contentPrWorkflow, /Blocked automation change outside generated Insights scope/);
console.log(`Insights publication contract passed: ${registry.length} reviewed record(s), ${routeKeys.size} unique route(s).`);
