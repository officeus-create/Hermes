import { expect, test } from "@playwright/test";
import {
  consequentialActionsRequireHumanReview,
  salesAssistantAnalyticsAllowlist,
  salesAssistantOperatingLoop,
  salesAssistantRouteBySituation,
  salesAssistantRoutes,
} from "../src/data/ai-sales-assistant";

test("AI sales assistant uses the same consultant-first operating loop for every situation", async () => {
  expect(salesAssistantOperatingLoop).toEqual([
    "diagnose",
    "clarify_metrics",
    "smallest_useful_step",
    "roadmap",
    "cta",
  ]);
  expect(salesAssistantRoutes).toHaveLength(7);
  expect(new Set(salesAssistantRoutes.map((route) => route.situation)).size).toBe(7);
  expect(salesAssistantRoutes.every((route) => route.diagnose.length > 0)).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.metrics.length > 0)).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.smallestStep.length > 0)).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.roadmap.length > 0)).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.ctaHref.startsWith("/"))).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.prohibitedClaims.includes("guaranteed loads"))).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.prohibitedClaims.includes("guaranteed rankings"))).toBeTruthy();
  expect(salesAssistantRoutes.every((route) => route.prohibitedClaims.includes("guaranteed revenue"))).toBeTruthy();
});

test("carrier assistant explains broader scope without promising the market outcome", async () => {
  const carrier = salesAssistantRouteBySituation.carrier;
  expect(carrier.roadmap).toContain("direct-demand research");
  expect(carrier.ctaHref).toBe("/logistics/start-car-hauling-dispatch/");
  expect(carrier.maturity).toBe("LIVE_REVIEW_REQUIRED");
  expect(carrier.prohibitedClaims).toEqual(expect.arrayContaining([
    "guaranteed loads",
    "guaranteed rankings",
    "guaranteed revenue",
    "guaranteed lanes",
    "guaranteed rate or mileage",
  ]));
});

test("business assistant treats budget as planning input and recommends a small first step", async () => {
  const business = salesAssistantRouteBySituation.business_growth;
  expect(business.diagnose).toEqual(expect.arrayContaining(["planning budget", "time horizon"]));
  expect(business.smallestStep).toMatch(/smallest scope/i);
  expect(business.roadmap).toEqual(expect.arrayContaining([
    "3-month measurable acquisition",
    "6-month optimization",
    "9-month marketing-sales connection",
    "12-month scale",
  ]));
  expect(business.prohibitedClaims).toContain("budget must be fully spent");
});

test("Academy and careers keep progression consequential and human-reviewed", async () => {
  expect(salesAssistantRouteBySituation.academy.roadmap).toContain("human-reviewed progression");
  expect(salesAssistantRouteBySituation.careers.roadmap).toContain("human review");
  expect(consequentialActionsRequireHumanReview).toEqual(expect.arrayContaining([
    "hire_or_reject_candidate",
    "approve_training_progression",
    "book_freight",
    "commit_carrier",
    "sign_contract",
    "accept_payment",
    "publish_external_message",
  ]));
});

test("assistant analytics allowlist contains only privacy-safe workflow events", async () => {
  expect(salesAssistantAnalyticsAllowlist).toEqual(expect.arrayContaining([
    "situation_selected",
    "qualification_started",
    "canonical_destination_selected",
    "human_handoff_requested",
  ]));
  expect(JSON.stringify(salesAssistantAnalyticsAllowlist)).not.toMatch(/email|phone|name|company|mc|usdot|vin|address|message/i);
});
