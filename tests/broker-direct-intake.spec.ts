import { expect, test } from "@playwright/test";

const route = "/paths/logistics/brokers/carrier-capacity/";
const directIntake = "/logistics/request-vehicle-transport/?role=broker#transport-intake";
const demo = "/load-board/?role=broker#post-load";

test("broker recommendation uses the direct commercial intake and labels the demo separately", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Request Verified Carrier Capacity | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);

  const primaryLinks = page.locator("[data-recommendation-primary], [data-recommendation-primary-bottom]");
  await expect(primaryLinks).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(primaryLinks.nth(index)).toHaveAttribute("href", directIntake);
    await expect(primaryLinks.nth(index)).toContainText("Prepare broker opportunity");
  }

  await expect(page.locator("[data-recommendation-demo]")).toHaveAttribute("href", demo);
  await expect(page.locator("[data-recommendation-demo]")).toHaveText("Preview broker Load Board demo");
  await expect(page.getByRole("heading", { name: "Use the direct intake for a real opportunity." })).toBeVisible();
  await expect(page.getByText(/The Load Board remains a fictional product demonstration/i)).toBeVisible();
  await expect(page.getByText(/does not publish a load, notify a carrier, confirm capacity, or create a booking/i)).toBeVisible();

  await expect(page.locator('[data-recommendation-primary][href*="/load-board/"]')).toHaveCount(0);
  await expect(page.locator('[data-recommendation-primary-bottom][href*="/load-board/"]')).toHaveCount(0);
});

test("broker direct intake preselects the broker role", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page).toHaveURL(/\/logistics\/request-vehicle-transport\/\?role=broker#transport-intake$/);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("broker");
});
