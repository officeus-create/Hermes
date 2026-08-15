import { expect, test } from "@playwright/test";

const workspaceUrl = "/demos/hermes-connect/workspace.html";

test.describe("Hermes Connect canonical responsive workspace", () => {
  test("uses one workspace for desktop and mobile browser layouts", async ({ page }, testInfo) => {
    const response = await page.goto(workspaceUrl);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    await expect(page.locator(".app-shell")).toBeVisible();
    await expect(page.getByText("Hermes Connect").first()).toBeVisible();

    if (testInfo.project.name === "mobile") {
      await expect(page.locator(".mobile-bar")).toBeVisible();
      await expect(page.locator(".mobile-bar [data-hermes-open]")).toBeVisible();
    } else {
      await expect(page.locator(".sidebar")).toBeVisible();
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("loads only canonical versionless workspace enhancement assets", async ({ page }) => {
    const requestedPaths: string[] = [];
    page.on("request", (request) => requestedPaths.push(new URL(request.url()).pathname));

    await page.goto(workspaceUrl);
    await expect(page.locator(".app-shell")).toBeVisible();

    expect(requestedPaths.some((path) => path.endsWith("/workspace-enhancements.css"))).toBeTruthy();
    expect(requestedPaths.some((path) => path.endsWith("/workspace-enhancements.js"))).toBeTruthy();
    expect(requestedPaths.some((path) => path.includes("hermes-connect-brand-v1"))).toBeFalsy();
    expect(requestedPaths.some((path) => path.includes("workspace-v2"))).toBeFalsy();
  });
});
