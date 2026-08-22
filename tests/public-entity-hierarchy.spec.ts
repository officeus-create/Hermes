import { expect, test } from "@playwright/test";
import { publicEntityRegistry } from "../src/data/public-entity-registry";

test("public entity names follow the Hermes master hierarchy", () => {
  expect(publicEntityRegistry.hermes_ecosystem.publicName).toBe("Hermes");
  expect(publicEntityRegistry.hermes_logistics.publicName).toBe("Hermes Logistics");
  expect(publicEntityRegistry.hermes_academy.publicName).toBe("Hermes Academy");
  expect(publicEntityRegistry.hermes_it.publicName).toBe("Hermes Technology");
});

test("held relationships stay held after naming convergence", () => {
  expect(publicEntityRegistry.hermes_logistics.schemaPublication).toBe("hold");
  expect(publicEntityRegistry.hermes_logistics.relationshipStatus).toBe("owner_verification_required");
  expect(publicEntityRegistry.progressopro_marketing.schemaPublication).toBe("hold");
  expect(publicEntityRegistry.progressopro_marketing.relationshipStatus).toBe("relationship_resolution_required");
  expect(publicEntityRegistry.hermes_it.schemaPublication).toBe("hold");
  expect(publicEntityRegistry.hermes_it.relationshipStatus).toBe("owner_verification_required");
});

test("Academy is a direction, not an asserted separate legal company", () => {
  expect(publicEntityRegistry.hermes_academy.relationshipStatus).toBe("approved_direction");
  expect(publicEntityRegistry.hermes_academy.notes).toMatch(/does not by itself assert a separate legal company/i);
});

test("root Organization schema does not publish unresolved Logistics-specific social profiles as sameAs", async ({ page }) => {
  await page.goto("/");
  const schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(schemaText).toContain('"@id":"https://hermeslogisticsus.com/#organization"');
  expect(schemaText).not.toContain('"sameAs"');
  expect(schemaText).not.toContain("https://www.instagram.com/hermes.logistics/");
  expect(schemaText).not.toContain("https://www.threads.com/@hermes.logistics");
});