import { expect, test } from "@playwright/test";

const stages = [
  ["context", "Sources + business context", "Start with the real business signals, not an empty template."],
  ["brief", "Factory brief + architecture", "Turn source evidence into a controlled Website Factory build plan."],
  ["build", "Semantic responsive build", "Build the approved design as a real responsive product."],
  ["qa", "QA + accessibility + security", "Prove the build before it becomes a release."],
  ["search", "SEO/GEO + deploy gate", "Protect discovery before deployment becomes production."],
  ["evidence", "Readback + distribution + CRM", "Turn a verified release into measurable business evidence."],
] as const;

test("website development keeps keyboard interaction, canonical ownership, indexability, and CTA destinations", async ({ page }) => {
  await page.goto("/services/website-development/");

  const showroom = page.locator("[data-website-showroom]");
  await expect(showroom).toBeVisible();
  const designLab = page.locator("[data-website-design-lab]");
  await expect(designLab).toBeVisible();
  await expect(designLab.locator("[data-design-stage]")).toHaveCount(6);
  for (const label of ["Business DNA / sources", "Visual direction", "Tokens + components", "Responsive behavior", "Accessibility + visual QA", "Approved design system"]) {
    await expect(designLab).toContainText(label);
  }
  await expect(page.getByRole("heading", { name: "See how a website moves from business context to verified release." })).toBeVisible();
  const factoryFlow = showroom.locator("[data-website-factory-flow]");
  await expect(factoryFlow).toBeVisible();
  for (const label of ["SOURCES", "BRIEF", "BUILD", "QA", "SEARCH", "DISTRIBUTE"]) {
    await expect(factoryFlow).toContainText(label);
  }

  for (const [key, label, heading] of stages) {
    const step = showroom.getByRole("button", { name: label, exact: false });
    await step.focus();
    await expect(step).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(step).toHaveAttribute("aria-controls", `website-showroom-explanation-${key}`);
    const controlledExplanation = showroom.locator(`#website-showroom-explanation-${key}`);
    await expect(controlledExplanation).toBeVisible();
    expect(await controlledExplanation.evaluate((element) => element.closest('[aria-hidden="true"]') === null)).toBeTruthy();
    await expect(showroom.getByRole("heading", { name: heading })).toBeVisible();
    await expect(showroom.locator('.website-showroom-step[aria-pressed="true"]')).toHaveCount(1);
    await expect(showroom.locator(".website-showroom-panel.active")).toHaveCount(1);
    await expect(showroom.locator(".website-showroom-explanation.active")).toHaveCount(1);
    await expect(showroom).toHaveAttribute("data-active-showroom-stage", key);
    const proof = showroom.locator(`[data-showroom-live-proof="${key}"]`);
    await expect(proof).toBeVisible();
    await expect(proof.locator(".website-showroom-proof-page")).toBeVisible();
    await expect(proof.locator(".website-showroom-proof-inspector")).toBeVisible();
  }

  await expect(page.locator(".digital-service-actions").getByRole("link", { name: "Start a website project brief" })).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.getByRole("link", { name: "Review the website case" })).toHaveAttribute("href", "/case/it-development/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/website-development/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
});

test("all six showroom states stay contained with readable active text at 320, 390, and 430px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/services/website-development/");
    const showroom = page.locator("[data-website-showroom]");
    await expect(showroom).toBeVisible();

    for (const [key, label, heading] of stages) {
      const step = showroom.getByRole("button", { name: label, exact: false });
      await step.click();
      await expect(showroom.getByRole("heading", { name: heading })).toBeVisible();

      const geometry = await page.evaluate((activeKey) => {
        const rect = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing ${selector}`);
          return element.getBoundingClientRect().toJSON();
        };
        return {
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          browser: rect(".website-showroom-browser"),
          browserBar: rect(".website-showroom-browser-bar"),
          canvas: rect(".website-showroom-canvas"),
          panel: rect(`[data-showroom-panel="${activeKey}"]`),
          miniUi: rect(`[data-showroom-panel="${activeKey}"] .website-showroom-mini-ui`),
          liveProof: rect(`[data-showroom-live-proof="${activeKey}"]`),
          humanReview: rect(".website-showroom-human"),
          designLab: rect("[data-website-design-lab]"),
        };
      }, key);

      expect(geometry.documentWidth, `${width}px ${key}: document horizontal fit`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.bodyWidth, `${width}px ${key}: body horizontal fit`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.designLab.left, `${width}px ${key}: design lab left containment`).toBeGreaterThanOrEqual(-1);
      expect(geometry.designLab.right, `${width}px ${key}: design lab right containment`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.browserBar.left, `${width}px ${key}: browser bar left containment`).toBeGreaterThanOrEqual(geometry.browser.left - 1);
      expect(geometry.browserBar.right, `${width}px ${key}: browser bar right containment`).toBeLessThanOrEqual(geometry.browser.right + 1);
      expect(geometry.panel.left, `${width}px ${key}: panel left containment`).toBeGreaterThanOrEqual(geometry.canvas.left - 1);
      expect(geometry.panel.right, `${width}px ${key}: panel right containment`).toBeLessThanOrEqual(geometry.canvas.right + 1);
      expect(geometry.miniUi.left, `${width}px ${key}: mini UI left containment`).toBeGreaterThanOrEqual(geometry.canvas.left - 1);
      expect(geometry.miniUi.right, `${width}px ${key}: mini UI right containment`).toBeLessThanOrEqual(geometry.canvas.right + 1);
      expect(geometry.liveProof.left, `${width}px ${key}: live proof left containment`).toBeGreaterThanOrEqual(geometry.canvas.left - 1);
      expect(geometry.liveProof.right, `${width}px ${key}: live proof right containment`).toBeLessThanOrEqual(geometry.canvas.right + 1);
      expect(geometry.humanReview.left, `${width}px ${key}: footer left containment`).toBeGreaterThanOrEqual(geometry.canvas.left - 1);
      expect(geometry.humanReview.right, `${width}px ${key}: footer right containment`).toBeLessThanOrEqual(geometry.canvas.right + 1);

      const contrastRatios = await step.evaluate((button) => {
        const parseRgb = (value: string) => {
          const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
          if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${value}`);
          return channels;
        };
        const luminance = (value: string) => {
          const channels = parseRgb(value).map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const background = getComputedStyle(button).backgroundColor;
        return [".website-showroom-step-number", "small"].map((selector) => {
          const foreground = getComputedStyle(button.querySelector<HTMLElement>(selector)!).color;
          const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
          return (values[0] + 0.05) / (values[1] + 0.05);
        });
      });
      expect(Math.min(...contrastRatios), `${width}px ${key}: active normal-text contrast`).toBeGreaterThanOrEqual(4.5);
      expect(geometry.humanReview.top - geometry.miniUi.bottom, `${width}px ${key}: mini UI/footer gap`).toBeGreaterThanOrEqual(8);
    }
  }
});

test("showroom remains operable and removes transitions when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/services/website-development/");
  const showroom = page.locator("[data-website-showroom]");
  const target = showroom.getByRole("button", { name: "Readback + distribution + CRM", exact: false });

  await target.focus();
  await page.keyboard.press("Space");
  await expect(target).toHaveAttribute("aria-pressed", "true");
  await expect(showroom.getByRole("heading", { name: "Turn a verified release into measurable business evidence." })).toBeVisible();

  const transitionDurations = await page.locator(".website-design-lab-flow article, .website-showroom-step, .website-showroom-route span, .website-showroom-panel").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transitionDuration),
  );
  expect(transitionDurations.every((duration) => duration.split(",").every((value) => Number.parseFloat(value) === 0))).toBeTruthy();
});
