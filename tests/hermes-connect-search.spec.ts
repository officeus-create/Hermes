import { expect, test } from "@playwright/test";
import {
  canAccessHermesSearchResult,
  normalizeHermesSearchQuery,
  searchHermesResults,
  type HermesSearchResult,
} from "../src/lib/hermes-connect-search";

const results: HermesSearchResult[] = [
  {
    id: "repair",
    entityType: "module",
    title: "Repair Shop CRM",
    subtitle: "Hermes Connect",
    href: "/services/hermes-connect/repair-shops/dashboard/",
    visibility: "public",
    source: "product_registry",
    keywords: ["repair", "shop", "crm"],
  },
  {
    id: "company-1",
    entityType: "business",
    title: "Kittle's Garage",
    subtitle: "North Little Rock",
    href: "/services/hermes-connect/internal/registrations/?company=company-1",
    visibility: "company",
    companyId: "company-1",
    source: "owner_registrations",
    keywords: ["garage", "arkansas"],
  },
  {
    id: "company-2",
    entityType: "business",
    title: "Other Tenant",
    href: "/services/hermes-connect/internal/registrations/?company=company-2",
    visibility: "company",
    companyId: "company-2",
    source: "owner_registrations",
  },
  {
    id: "owner-only",
    entityType: "module",
    title: "Registrations",
    href: "/services/hermes-connect/internal/registrations/",
    visibility: "internal_owner",
    source: "product_registry",
  },
];

test("normalizes global search query deterministically", () => {
  expect(normalizeHermesSearchQuery("  KITTLE   Garage ")).toBe("kittle garage");
});

test("server-compatible scope rules exclude other companies and owner-only entries", () => {
  const context = { companyIds: ["company-1"] };
  expect(canAccessHermesSearchResult(results[1]!, context)).toBe(true);
  expect(canAccessHermesSearchResult(results[2]!, context)).toBe(false);
  expect(canAccessHermesSearchResult(results[3]!, context)).toBe(false);

  const found = searchHermesResults(results, "", context);
  expect(found.map((item) => item.id)).toEqual(["repair", "company-1"]);
});

test("internal owner can see owner-only modules without bypassing company scope", () => {
  const found = searchHermesResults(results, "", { internalOwner: true, companyIds: ["company-1"] });
  expect(found.map((item) => item.id)).toContain("owner-only");
  expect(found.map((item) => item.id)).not.toContain("company-2");
});

test("ranking prefers exact and title matches", () => {
  const found = searchHermesResults(results, "kittle garage", { companyIds: ["company-1"] });
  expect(found[0]?.id).toBe("company-1");
  expect(found[0]?.score).toBeGreaterThan(10);
});

test("multi-token query may match title plus safe keywords", () => {
  const found = searchHermesResults(results, "kittle arkansas", { companyIds: ["company-1"] });
  expect(found.map((item) => item.id)).toEqual(["company-1"]);
});

test("canonical duplicate results collapse to one item", () => {
  const duplicate: HermesSearchResult = {
    ...results[1]!,
    title: "Kittle's Garage",
    source: "second_adapter",
    keywords: ["kittle"],
  };
  const found = searchHermesResults([...results, duplicate], "kittle", { companyIds: ["company-1"] });
  expect(found.filter((item) => item.id === "company-1")).toHaveLength(1);
});

test("result limit is bounded", () => {
  const many = Array.from({ length: 150 }, (_, index): HermesSearchResult => ({
    id: `route-${index}`,
    entityType: "module",
    title: `Route ${index}`,
    href: `/route-${index}/`,
    visibility: "public",
    source: "product_registry",
  }));
  expect(searchHermesResults(many, "route", {}, 10_000)).toHaveLength(100);
});
