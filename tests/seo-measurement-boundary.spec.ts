import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const seoEnhancerSource = readFileSync(
  new URL("../src/components/SeoIntakeEnhancer.astro", import.meta.url),
  "utf8",
);

const analyticsRegistry = readFileSync(
  new URL("../docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md", import.meta.url),
  "utf8",
);

test("SEO email handoff cannot be reported as receiver-confirmed delivery", () => {
  expect(seoEnhancerSource).toContain('event: "seo_handoff_ready"');
  expect(seoEnhancerSource).not.toMatch(/seo_delivery_confirmed/);
  expect(seoEnhancerSource).not.toMatch(/seo_[a-z_]*delivery_confirmed/);

  expect(analyticsRegistry).toContain(
    "no SEO-specific secure `delivery_confirmed` event was established",
  );
  expect(analyticsRegistry).toContain(
    "do not infer delivery from `seo_handoff_ready`",
  );
});
