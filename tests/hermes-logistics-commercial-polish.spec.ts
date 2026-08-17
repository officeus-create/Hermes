import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Logistics commercial directory uses the Hermes Pearl and Obsidian system", async ({ page }) => {
  await page.goto("/paths/logistics/");

  await expect(page.locator(".detail-page-logistics")).toBeVisible();
  await expect(page.locator(".logistics-commercial-links")).toBeVisible();
  await expect(page.locator(".logistics-commercial-grid article").first()).toBeVisible();
  await expect(page.locator(".logistics-path-directory").first()).toBeVisible();
  await expect(page.locator(".logistics-customer-review")).toBeVisible();

  const visual = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>(".logistics-commercial-links");
    const card = document.querySelector<HTMLElement>(".logistics-commercial-grid article");
    const proposal = document.querySelector<HTMLElement>(".carrier-proposal-link");
    const directory = document.querySelector<HTMLElement>(".logistics-path-directory");
    const directoryLink = document.querySelector<HTMLElement>(".logistics-path-columns a");
    const customer = document.querySelector<HTMLElement>(".logistics-customer-review");
    const footerProposal = document.querySelector<HTMLElement>(".carrier-footer-proposal");
    if (!section || !card || !proposal || !directory || !directoryLink || !customer || !footerProposal) return null;

    return {
      sectionBackground: getComputedStyle(section).backgroundColor,
      sectionColor: getComputedStyle(section).color,
      cardBackground: getComputedStyle(card).backgroundColor,
      cardRadius: getComputedStyle(card).borderRadius,
      proposalBackground: getComputedStyle(proposal).backgroundColor,
      proposalColor: getComputedStyle(proposal).color,
      directoryBackground: getComputedStyle(directory).backgroundColor,
      directoryRadius: getComputedStyle(directory).borderRadius,
      directoryLinkBackground: getComputedStyle(directoryLink).backgroundColor,
      directoryLinkRadius: getComputedStyle(directoryLink).borderRadius,
      customerBackground: getComputedStyle(customer).backgroundColor,
      customerColor: getComputedStyle(customer).color,
      footerProposalBackground: getComputedStyle(footerProposal).backgroundColor,
      footerProposalColor: getComputedStyle(footerProposal).color,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.sectionBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.sectionColor).toBe("rgb(11, 13, 18)");
  expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.cardRadius).toBe("22px");
  expect(visual!.proposalBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.proposalColor).toBe("rgb(11, 13, 18)");
  expect(visual!.directoryBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.directoryRadius).toBe("22px");
  expect(visual!.directoryLinkBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.directoryLinkRadius).toBe("12px");
  expect(visual!.customerBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.customerColor).toBe("rgb(255, 255, 255)");
  expect(visual!.footerProposalBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.footerProposalColor).toBe("rgb(11, 13, 18)");
  expect(visual!.overflow).toBe(false);
});

test("Logistics commercial directory remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");

  await expect(page.locator(".detail-page-logistics")).toBeVisible();
  await expect(page.locator(".logistics-commercial-grid article").first()).toBeVisible();
  await expect(page.locator(".logistics-commercial-footer")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".logistics-commercial-grid article");
    const directory = document.querySelector<HTMLElement>(".logistics-path-directory");
    const customer = document.querySelector<HTMLElement>(".logistics-customer-review");
    if (!card || !directory || !customer) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cardRadius: getComputedStyle(card).borderRadius,
      directoryRadius: getComputedStyle(directory).borderRadius,
      customerWidth: customer.getBoundingClientRect().width,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.cardRadius).toBe("22px");
  expect(mobile!.directoryRadius).toBe("22px");
  expect(mobile!.customerWidth).toBeLessThanOrEqual(mobile!.viewportWidth);
});