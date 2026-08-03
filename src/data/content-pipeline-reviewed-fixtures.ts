import {
  syntheticContentAssets as rawSyntheticContentAssets,
} from "./content-pipeline-pilot";
import type {
  ContentAssetInput,
  ContentReviewResult,
} from "../lib/content-pipeline";
import { reviewContentForPublication } from "../lib/content-publication-gate";

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
}> = syntheticContentAssets.map((asset) => ({
  asset,
  review: reviewContentForPublication(asset),
}));

export const syntheticPublishCandidate = syntheticContentReviews.find(
  (item) => item.review.decision === "publish_candidate",
);
