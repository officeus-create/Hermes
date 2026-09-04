import { expect, test } from "@playwright/test";

function luminance([r, g, b]: number[]) {
  const values = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrast(a: number[], b: number[]) {
  const first = luminance(a);
  const second = luminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgb(value: string) {
  const values = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
  if (values.length !== 3) throw new Error(`Could not parse RGB value: ${value}`);
  return values;
}

test("Repair Shop mobile drawer keeps navigation and Russian language selection readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "not_authenticated" }),
  }));
  await page.route("**/api/internal-ai/status", (route) => route.fulfill({
    status: 403,
    contentType: "application/json",
    body: JSON.stringify({ success: false }),
  }));

  await page.goto("/services/hermes-connect/repair-shops/?lang=ru");
  await expect(page.locator("html")).toHaveClass(/hc-experience/);
  await expect(page.locator(".desktop-nav")).toBeHidden();

  const menuButton = page.locator("[data-menu-button]");
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const menu = page.locator("[data-mobile-menu]");
  const logistics = menu.locator(':scope > a[href="/paths/logistics/"]');
  const russian = menu.locator(".mobile-language-switcher a[lang='ru']");
  await expect(menu).toBeVisible();
  await expect(logistics).toBeVisible();
  await expect(russian).toBeVisible();

  const geometry = await menu.boundingBox();
  expect(geometry).not.toBeNull();
  expect(geometry!.x).toBeGreaterThanOrEqual(0);
  expect(geometry!.x + geometry!.width).toBeLessThanOrEqual(390);

  const styles = await menu.evaluate((node) => {
    const logistics = node.querySelector<HTMLAnchorElement>(':scope > a[href="/paths/logistics/"]');
    const russian = node.querySelector<HTMLAnchorElement>(".mobile-language-switcher a[lang='ru']");
    if (!logistics || !russian) throw new Error("Expected Repair Shop mobile navigation targets are missing");
    const drawerStyle = getComputedStyle(node);
    const logisticsStyle = getComputedStyle(logistics);
    const russianStyle = getComputedStyle(russian);
    return {
      drawerBackground: drawerStyle.backgroundColor,
      logisticsColor: logisticsStyle.color,
      logisticsMatchesRepairRule: logistics.matches("html.hc-experience .site-header .mobile-nav > a"),
      russianBackground: russianStyle.backgroundColor,
      russianColor: russianStyle.color,
      russianHeight: russian.getBoundingClientRect().height,
    };
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(styles.logisticsMatchesRepairRule).toBe(true);
  expect(contrast(rgb(styles.logisticsColor), rgb(styles.drawerBackground))).toBeGreaterThanOrEqual(4.5);
  expect(contrast(rgb(styles.russianColor), rgb(styles.russianBackground))).toBeGreaterThanOrEqual(4.5);
  expect(styles.russianHeight).toBeGreaterThanOrEqual(44);
  expect(overflow).toBe(false);
});

test("Hermes Connect clean mobile entry stays English and the full language list can be scrolled and selected", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.addInitScript(() => {
    window.localStorage.setItem("hermes-connect-language", "ru");
  });
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "not_authenticated" }),
  }));
  await page.route("**/api/internal-ai/status", (route) => route.fulfill({
    status: 403,
    contentType: "application/json",
    body: JSON.stringify({ success: false }),
  }));

  await page.goto("/services/hermes-connect/");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[data-language-menu] summary span")).toHaveText("English");

  await page.locator("[data-menu-button]").click();
  const menu = page.locator("[data-mobile-menu]");
  const switcher = menu.locator(".mobile-language-switcher");
  const languages = switcher.locator("a[lang]");
  await expect(menu).toBeVisible();
  await expect(languages).toHaveCount(6);

  const scrollContract = await menu.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      overflowY: style.overflowY,
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      viewportBottom: node.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    };
  });
  expect(["auto", "scroll"]).toContain(scrollContract.overflowY);
  expect(scrollContract.clientHeight).toBeLessThanOrEqual(scrollContract.scrollHeight);
  expect(scrollContract.viewportBottom).toBeLessThanOrEqual(scrollContract.viewportHeight + 1);

  const french = switcher.locator("a[lang='fr']");
  await french.scrollIntoViewIfNeeded();
  await expect(french).toBeInViewport();
  await french.click();

  await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
