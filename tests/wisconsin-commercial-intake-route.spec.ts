import { expect, test } from "@playwright/test";

// These are customer transport-request paths; a public Load Board preview is
// neither a live booking nor a substitute for the review form.
test("Waukesha customer CTA opens the actual transport request, preserving an explicitly marked demo", async ({ page }) => {
  await page.goto("/logistics/waukesha-wi-vehicle-transport/");

  const primary = page.locator("[data-waukesha-direct-intake]");
  await expect(primary).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake",
  );
  await expect(page.locator("[data-waukesha-demo]")).toContainText("Preview Load Board examples");
  await expect(page.getByText("Load Board preview examples are not bookable freight", { exact: false })).toBeVisible();

  await primary.click();
  await expect(page).toHaveURL(/\/logistics\/request-vehicle-transport\/\?role=customer&request=customer_delivery#transport-intake$/);
  await expect(page.locator("[data-transport-form]")).toBeVisible();
});

test("Wisconsin enclosed customer CTA opens the transport intake with enclosed equipment preselected", async ({ page }) => {
  await page.goto("/logistics/wisconsin-enclosed-vehicle-transport/");

  const primary = page.locator("[data-wisconsin-enclosed-direct-intake]");
  await expect(primary).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery&equipment=enclosed#transport-intake",
  );
  await primary.click();

  await expect(page).toHaveURL(/\/logistics\/request-vehicle-transport\/\?role=customer&request=customer_delivery&equipment=enclosed#transport-intake$/);
  await expect(page.locator("[data-transport-form]")).toBeVisible();
  await expect(page.locator('[data-transport-form] select[name="equipment_preference"]')).toHaveValue("enclosed");
});


for (const city of ["Kenosha", "Racine", "Sheboygan"] as const) {
  test(`${city} vehicle transport CTA opens customer intake, with Load Board demos separate`, async ({ page }) => {
    const slug = city.toLowerCase();
    await page.goto(`/logistics/${slug}-wi-vehicle-transport/`);

    const primary = page.locator(`[data-${slug}-direct-intake]`);
    const preview = page.locator(`[data-${slug}-demo]`);
    await expect(primary).toHaveAttribute(
      "href",
      "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake",
    );
    await expect(preview).toContainText("Preview Load Board examples");

    await primary.click();
    await expect(page).toHaveURL(/\\/logistics\\/request-vehicle-transport\\/\\?role=customer&request=customer_delivery#transport-intake$/);
    await expect(page.locator("[data-transport-form]")).toBeVisible();
  });
}
