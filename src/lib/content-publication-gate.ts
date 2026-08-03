import {
  reviewContentAsset,
  type ContentAssetInput,
  type ContentReviewResult,
} from "./content-pipeline.ts";

const normalizedMeaningfulLength = (asset: ContentAssetInput): number =>
  `${asset.sourceText} ${asset.transcript ?? ""}`
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
    .length;

export const reviewContentForPublication = (asset: ContentAssetInput): ContentReviewResult => {
  const baseReview = reviewContentAsset(asset);

  if (
    baseReview.decision === "awaiting_source" ||
    baseReview.decision === "hold" ||
    baseReview.decision === "reject" ||
    asset.materiallySimilarTo
  ) {
    return baseReview;
  }

  if (normalizedMeaningfulLength(asset) < 180) {
    return {
      ...baseReview,
      decision: "reject",
      blockers: [
        ...baseReview.blockers,
        "The source is too thin to support a standalone public page.",
      ],
      nextActions: [
        "Retain only as a minor supporting note, or add a specific materiallySimilarTo canonical owner before requesting a merge decision.",
      ],
    };
  }

  return baseReview;
};
