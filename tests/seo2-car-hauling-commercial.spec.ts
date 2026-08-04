import { expect, test } from "@playwright/test";

test("car hauling dispatch answers comparison, scope and readiness intent", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets",
  })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Dispatch versus self-dispatch review" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scope and fee review" })).toBeVisible();
  await expect(page.getByText("What does a car hauler dispatcher do?")).toBeVisible();
  await expect(page.getByText("Is dispatch service better than self-dispatch?")).toBeVisible();
  await expect(page.getByText("How much does car hauling dispatch service cost?")).toBeVisible();

  const directIntakeLinks = page.getByRole("link", { name: "Start car-hauling dispatch review" });
  await expect(directIntakeLinks.first()).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(directIntakeLinks).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Preview the Load Board Demo" })).toHaveAttribute(
    "href",
    "/load-board/?role=carrier&equipment=car_hauler#available-loads",
  );
});

test("load board explains how owner-operators evaluate car hauling loads", async ({ page }) => {
  await page.goto("/load-board/");

  await expect(page).toHaveTitle(/Car Hauling Loads & Load Board Preview/);
  await expect(page.getByRole("heading", { level: 1, name: "Review Car Hauling Loads Before You Commit" })).toBeVisible();
  await expect(page.getByRole("heading", {
    name: "A load is useful only when the complete operating fit works.",
  })).toBeVisible();

  for (const step of [
    "Lane and deadhead",
    "Equipment and units",
    "Timing and access",
    "Source and paperwork",
    "Rate and carrier approval",
  ]) {
    await expect(page.getByText(step, { exact: true })).toBeVisible();
  }

  await expect(page.getByRole("link", { name: "car hauling dispatch service" })).toHaveAttribute(
    "href",
    "/logistics/car-hauling-dispatch/",
  );
  await expect(page.getByRole("link", { name: "new-authority carrier path" })).toHaveAttribute(
    "href",
    "/paths/logistics/carriers/new-authority/",
  );
  await expect(page.getByRole("link", { name: "car hauler capacity checklist" })).toHaveAttribute(
    "href",
    "/logistics/resources/car-hauler-capacity-checklist/",
  );
  await expect(page.getByText("No load below is available to book.")).toBeVisible();
});
