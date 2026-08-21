import { expect, test } from "@playwright/test";

const rooms = [
  ["Open Hermes Logistics", "/paths/logistics/"],
  ["Open Hermes Marketing", "/paths/marketing/"],
  ["Open Hermes Academy", "/paths/academy/"],
  ["Open Hermes Technology", "/paths/technology/"],
] as const;

test("Hermes homepage is a focused four-direction entrance", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Four directions\. Choose yours\./ })).toBeVisible();
  await expect(page.locator(".home-rooms-grid .home-room")).toHaveCount(4);
  await expect(page.locator(".home-role-router")).toHaveCount(0);
  await expect(page.locator(".product-showcase")).toHaveCount(0);
  await expect(page.locator(".home-technology-preview")).toHaveCount(0);

  for (const [label, href] of rooms) {
    await expect(page.getByRole("link", { name: label })).toHaveAttribute("href", href);
  }

  const visual = await page.evaluate(() => {
    const roomGrid = document.querySelector<HTMLElement>(".home-rooms-grid");
    const logistics = document.querySelector<HTMLElement>(".home-room-logistics");
    const marketing = document.querySelector<HTMLElement>(".home-room-marketing");
    const academy = document.querySelector<HTMLElement>(".home-room-academy");
    const technology = document.querySelector<HTMLElement>(".home-room-technology");
    if (!roomGrid || !logistics || !marketing || !academy || !technology) return null;

    return {
      radius: getComputedStyle(roomGrid).borderRadius,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      accents: [logistics, marketing, academy, technology].map((room) => room.style.getPropertyValue("--room-accent")),
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.overflow).toBe(false);
  const expectedRadius = (page.viewportSize()?.width ?? 1280) <= 760 ? "24px" : "32px";
  expect(visual!.radius).toBe(expectedRadius);
  expect(new Set(visual!.accents).size).toBe(4);
});

test("four-direction homepage keeps its character and usability on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".home-room")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Open Hermes Logistics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Hermes Technology" })).toBeVisible();

  const geometry = await page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>(".home-rooms-grid");
    const rooms = [...document.querySelectorAll<HTMLElement>(".home-room")];
    if (!grid || rooms.length !== 4) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      radius: getComputedStyle(grid).borderRadius,
      roomHeights: rooms.map((room) => room.getBoundingClientRect().height),
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.overflow).toBe(false);
  expect(geometry!.radius).toBe("24px");
  expect(Math.min(...geometry!.roomHeights)).toBeGreaterThanOrEqual(170);
});
