import {
  generatePlatformDraft,
  validateDistributionEligibility,
  type ApprovedWebsiteAsset,
  type DistributionChannel,
} from "../lib/social-distribution.ts";

export const syntheticDistributionNotice =
  "SYNTHETIC RELEASE A PREVIEW. No real account, provider connection, publication, approval history, credential, audience, or external action is represented.";

export const syntheticApprovedWebsiteAsset: ApprovedWebsiteAsset = {
  id: "dispatch-service-vs-self-dispatch",
  contentVersion: "v1",
  status: "distribution_approved",
  productionApproved: true,
  indexable: true,
  canonicalUrl: "https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/",
  title: "Dispatch Service vs Self-Dispatch for Car Haulers",
  conciseValue:
    "Assign load search, broker communication, route review, setup packets, documents, invoicing, and final approval clearly. The right model depends on time, tools, experience, workload, and the control the carrier wants to retain.",
  practicalPoints: [
    "Compare the full workload, not only the dispatch fee.",
    "Keep carrier approval, safety, and operating control explicit.",
    "Use a hybrid workflow when only repeatable coordination should be delegated.",
    "Confirm who owns documents, invoicing, follow-up, and after-hours communication.",
  ],
  direction: "hermes_logistics",
  campaign: "logistics_insights",
  audience: "Car-hauling owner-operators and small fleets",
  language: "en",
  ctaLabel: "Read the complete comparison",
  visualReference: null,
  evidenceNumber: null,
  privacySafe: true,
  claimsApproved: true,
  entityApproved: true,
};

export const syntheticPreviewChannels: DistributionChannel[] = [
  {
    alias: "synthetic-hermes-facebook-preview",
    platform: "facebook",
    direction: "hermes_logistics",
    mode: "synthetic_preview",
    readiness: "preview_only",
    entityApproved: false,
    ownerVerified: false,
    accountLabel: "Synthetic Facebook Page preview",
    note: syntheticDistributionNotice,
  },
  {
    alias: "synthetic-hermes-threads-preview",
    platform: "threads",
    direction: "hermes_logistics",
    mode: "synthetic_preview",
    readiness: "preview_only",
    entityApproved: false,
    ownerVerified: false,
    accountLabel: "Synthetic Threads preview",
    note: syntheticDistributionNotice,
  },
  {
    alias: "synthetic-hermes-instagram-preview",
    platform: "instagram",
    direction: "hermes_logistics",
    mode: "synthetic_preview",
    readiness: "preview_only",
    entityApproved: false,
    ownerVerified: false,
    accountLabel: "Synthetic Instagram professional preview",
    note: syntheticDistributionNotice,
  },
  {
    alias: "synthetic-hermes-x-preview",
    platform: "x",
    direction: "hermes_logistics",
    mode: "synthetic_preview",
    readiness: "preview_only",
    entityApproved: false,
    ownerVerified: false,
    accountLabel: "Synthetic X preview",
    note: syntheticDistributionNotice,
  },
  {
    alias: "synthetic-hermes-telegram-preview",
    platform: "telegram",
    direction: "hermes_logistics",
    mode: "synthetic_preview",
    readiness: "preview_only",
    entityApproved: false,
    ownerVerified: false,
    accountLabel: "Synthetic Telegram group/channel preview",
    note: `${syntheticDistributionNotice} No Telegram bot token, chat ID, channel, or sendMessage call is connected.`,
  },
];

export const syntheticChannelEligibility = syntheticPreviewChannels.map((channel) => ({
  channel,
  eligibility: validateDistributionEligibility(syntheticApprovedWebsiteAsset, channel),
}));

export const syntheticDistributionDrafts = syntheticPreviewChannels.map((channel) =>
  generatePlatformDraft(
    syntheticApprovedWebsiteAsset,
    channel,
    "2026-08-03T13:00:00Z",
  ),
);