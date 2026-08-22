import { expect, test } from "@playwright/test";
import { normalizeAcademyPublicContent } from "../src/data/academy-public-brand";
import { academySubsitePages } from "../src/data/academy-subsite";

test("Academy public projections do not emit the legacy master name", () => {
  for (const source of Object.values(academySubsitePages)) {
    const projected = normalizeAcademyPublicContent(source);
    expect(JSON.stringify(projected)).not.toContain("Hermes Business Academy");
  }
});

test("Academy public projections use Hermes Academy without changing program substance", () => {
  const logistics = normalizeAcademyPublicContent(academySubsitePages.logistics);
  const marketing = normalizeAcademyPublicContent(academySubsitePages.marketing);

  expect(logistics.title).toContain("Hermes Academy");
  expect(logistics.teaches).toContain("Dispatch foundations");
  expect(marketing.title).toContain("Hermes Academy");
  expect(marketing.teaches).toContain("Positioning and offers");
});
