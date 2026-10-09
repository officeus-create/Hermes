import { expect, test } from "@playwright/test";
import {
  businessRefForRecord,
  createBusinessRef,
  normalizeBusinessIdentityLink,
  parseBusinessRef,
  resolveCanonicalBusinessRef,
  sameBusinessRef,
} from "../functions/api/_lib/business-identity.mjs";

const verifiedLink = {
  id: "bilink_1",
  canonical_ref: "company:company_1",
  alias_ref: "repair_shop:shop_1",
  relationship_type: "same_business",
  evidence_ref: "owner_verified_case_2026_10_02",
  verified_by: "specialist_owner",
  verified_at: "2026-10-02T16:00:00Z",
  active: true,
};

test("business refs keep namespace and native identity separate", () => {
  expect(createBusinessRef("company", "same_1")).toBe("company:same_1");
  expect(createBusinessRef("repair_shop", "same_1")).toBe("repair_shop:same_1");
  expect(createBusinessRef("beauty_salon", "same_1")).toBe("beauty_salon:same_1");
  expect(sameBusinessRef("company:same_1", "repair_shop:same_1")).toBe(false);
  expect(sameBusinessRef("repair_shop:same_1", "beauty_salon:same_1")).toBe(false);
  expect(parseBusinessRef("company:same_1")).toEqual({
    ref: "company:same_1",
    namespace: "company",
    native_id: "same_1",
  });
});

test("display-name slug and owner similarity cannot change or collapse a business ref", () => {
  const before = businessRefForRecord("repair_shop", {
    id: "shop_1",
    name: "Kittle's Garage",
    slug: "kittles-garage",
    owner_specialist_id: "owner_1",
  });
  const after = businessRefForRecord("repair_shop", {
    id: "shop_1",
    name: "Kittle Garage LLC",
    slug: "kittle-garage-llc",
    owner_specialist_id: "owner_2",
  });
  expect(before).toBe("repair_shop:shop_1");
  expect(after).toBe(before);
  expect(sameBusinessRef(before, "company:company_1")).toBe(false);
});

test("unknown namespaces and malformed ids fail closed", () => {
  expect(createBusinessRef("academy_business", "a1")).toBeNull();
  expect(createBusinessRef("repair_shop", "shop:unsafe")).toBeNull();
  expect(parseBusinessRef("repair_shop:")).toBeNull();
  expect(resolveCanonicalBusinessRef("unknown:1", [])).toBeNull();
});

test("identity link is explicit, evidence backed, and drops unrelated payload fields", () => {
  const normalized = normalizeBusinessIdentityLink({
    ...verifiedLink,
    email: "private@example.test",
    phone: "+1 555 0100",
    company_name: "Private Business Name",
  });
  expect(normalized).toEqual({
    id: "bilink_1",
    canonical_ref: "company:company_1",
    alias_ref: "repair_shop:shop_1",
    relationship_type: "same_business",
    evidence_ref: "owner_verified_case_2026_10_02",
    verified_by: "specialist_owner",
    verified_at: "2026-10-02T16:00:00.000Z",
    active: true,
  });
  expect(normalized).not.toHaveProperty("email");
  expect(normalized).not.toHaveProperty("phone");
  expect(normalized).not.toHaveProperty("company_name");
});

test("identity link rejects free-form or personal verifier/evidence text", () => {
  expect(normalizeBusinessIdentityLink({
    ...verifiedLink,
    evidence_ref: "Owner says this is definitely the same business",
  })).toBeNull();
  expect(normalizeBusinessIdentityLink({
    ...verifiedLink,
    verified_by: "owner@example.test",
  })).toBeNull();
});

test("only an active explicit same-business link resolves an alias", () => {
  expect(resolveCanonicalBusinessRef("repair_shop:shop_1", [verifiedLink])).toBe("company:company_1");
  expect(resolveCanonicalBusinessRef("repair_shop:shop_1", [{ ...verifiedLink, active: false }]))
    .toBe("repair_shop:shop_1");
  expect(resolveCanonicalBusinessRef("repair_shop:shop_1", [{ ...verifiedLink, relationship_type: "brand_of" }]))
    .toBe("repair_shop:shop_1");
});

test("ambiguous alias links and cycles fail closed", () => {
  const second = {
    ...verifiedLink,
    id: "bilink_2",
    canonical_ref: "company:company_2",
  };
  expect(resolveCanonicalBusinessRef("repair_shop:shop_1", [verifiedLink, second])).toBeNull();

  const cycle = [
    verifiedLink,
    {
      id: "bilink_3",
      canonical_ref: "repair_shop:shop_1",
      alias_ref: "company:company_1",
      relationship_type: "same_business",
      evidence_ref: "owner_verified_cycle_fixture",
      verified_by: "specialist_owner",
      verified_at: "2026-10-02T16:00:00Z",
      active: true,
    },
  ];
  expect(resolveCanonicalBusinessRef("repair_shop:shop_1", cycle)).toBeNull();
});
