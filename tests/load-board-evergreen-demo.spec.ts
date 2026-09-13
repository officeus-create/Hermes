import { expect, test } from "@playwright/test";

test("Load Board keeps preview timing evergreen without demo language", async ({ page }) => {
  await page.goto("/load-board/");

  const board = page.locator("[data-hlb-live-marketplace]");
  await expect(board).toBeVisible();
  await expect(board.getByText("PREVIEW · NOT LIVE", { exact: true }).first()).toBeVisible();
  await expect(board.getByText("Market example", { exact: true }).first()).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/\bdemo\b/i);
  expect(bodyText).not.toMatch(/Jul\s+2[2-6]/i);
  expect(bodyText).not.toMatch(/\b\d+\s*(?:min|hr)s?\s+ago\b/i);
});
