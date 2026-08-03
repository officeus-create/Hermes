import {
  syntheticContentAssets as rawSyntheticContentAssets,
} from "./content-pipeline-pilot";
import {
  reviewContentAsset,
  type ContentAssetInput,
  type ContentReviewResult,
} from "../lib/content-pipeline";

const syntheticFixtureNotice =
  "SYNTHETIC TEST FIXTURE. This record does not represent a real social post, customer, carrier, route, result, account, publication, or approved public claim.";

const removeFixtureNotice = (value: string | null): string | null =>
  value?.replace(syntheticFixtureNotice, "").trim() ?? null;

export const syntheticContentAssets: ContentAssetInput[] = rawSyntheticContentAssets.map((asset) => ({
  ...asset,
  sourceText: removeFixtureNotice(asset.sourceText) ?? "",
  transcript: removeFixtureNotice(asset.transcript),
}));

export const syntheticContentReviews: Array<{
  asset: ContentAssetInput;
  review: ContentReviewResult;
}> = syntheticContentAssets.map((asset) => ({ asset, review: reviewContentAsset(asset) }));

export const syntheticPublishCandidate = syntheticContentReviews.find(
  (item) => item.review.decision === "publish_candidate",
);
