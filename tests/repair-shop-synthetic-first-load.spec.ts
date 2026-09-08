import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const repairMiddleware = readFileSync("functions/api/repair-shop/_middleware.ts", "utf8");
const servicesMiddleware = readFileSync("functions/api/services/_middleware.ts", "utf8");

for (const source of [repairMiddleware, servicesMiddleware]) {
  test(`${source === repairMiddleware ? "repair" : "services"} middleware hydrates only authenticated GET reads`, async () => {
    expect(source).toContain("request.method !== \"GET\"");
    expect(source).toContain("getAuthenticatedSpecialist");
    expect(source).toContain("ensureRepairShopSyntheticDemoData");
    expect(source).toContain("return context.next()");
  });
}

test("first-load hydration covers profile, availability and services without public routes", async () => {
  expect(repairMiddleware).toContain('"/api/repair-shop/profile"');
  expect(repairMiddleware).toContain('"/api/repair-shop/availability"');
  expect(servicesMiddleware).toContain('pathname !== "/api/services"');
  expect(repairMiddleware).not.toContain("/api/public/");
  expect(servicesMiddleware).not.toContain("/api/public/");
});
