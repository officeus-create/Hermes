import { expect, test } from "@playwright/test";

const widths = [390, 430, 768, 1024, 1440] as const;
const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const account = {
  success: true,
  identity: {
    id: "factory-owner-1",
    name: "Factory Owner",
    email: "factory-owner@example.com",
    role: "Hermes Member",
    location: "Kyiv",
  },
  owned_businesses: [],
  workspaces: [
    {
      key: "academy",
      kind: "shared_workspace",
      href: "/services/hermes-connect/academy/dashboard/",
      available: true,
      state: {},
    },
  ],
  capabilities: { internal_ai: false },
};

const draft = {
  id: "wf_design4_1",
  title: "New website brief",
  state: "draft",
  current_step: 1,
  payload: {
    starting_from_zero: false,
    sources: [],
    facts: {},
    goals: { primary: "", secondary: [], target_customer: "", geography: "", languages: [], primary_action: "" },
    brief: { text: "", must_have: [], nice_to_have: [], dislikes: [], tone: "", constraints: [], unresolved_questions: [] },
    references: [],
    pages: ["Home", "Services", "About / Trust", "FAQ", "Contact"],
    capabilities: [],
    brand: { logo_url: null, colors: [], notes: "" },
    unresolved_critical: [],
  },
  created_at: "2026-09-03T10:00:00.000Z",
  updated_at: "2026-09-03T10:00:00.000Z",
  submitted_at: null,
};

async function mockFactory(page: any) {
  await page.route("**/api/hermes-connect/account", (route: any) => route.fulfill(json(account)));
  await page.route("**/api/website-factory/drafts", async (route: any) => {
    if (route.request().method() === "POST") return route.fulfill(json({ success: true, draft }));
    return route.fulfill(json({ success: true, drafts: [] }));
  });
  await page.route("**/api/website-factory/drafts/*", async (route: any) => {
    if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON();
      return route.fulfill(json({ success: true, draft: { ...draft, ...payload, updated_at: "2026-09-03T10:01:00.000Z" } }));
    }
    return route.fulfill(json({ success: true, draft }));
  });
}

async function expectNoOverflow(page: any, width: number) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, `Website Factory must not overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectMinHeight(locator: any, label: string, width: number) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} must have a measurable box at ${width}px`).not.toBeNull();
  if (box) expect(box.height, `${label} must remain at least 44px at ${width}px`).toBeGreaterThanOrEqual(44);
}

test("Website Factory stays private and uses one shared Hermes account across five widths", async ({ page }) => {
  await mockFactory(page);

  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    await page.goto("/services/hermes-connect/website-factory/", { waitUntil: "domcontentloaded" });

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
    await expect(page.getByRole("heading", { name: "Build the brief before the website." })).toBeVisible();
    await expect(page.locator(".factory-accountbar")).toHaveCount(0);
    await expect(page.locator("[data-factory-auth]")).toBeHidden();

    const switcher = page.locator("[data-factory-app] [data-hc-account-switcher]");
    await expect(switcher).toBeVisible();
    await expect(switcher.locator("[data-account-name]")).toHaveText(account.identity.name);
    await expect(switcher.locator("[data-account-email]")).toHaveText(account.identity.email);
    await expect(switcher.locator(".is-current")).toHaveCount(0);
    await expect(switcher.locator("[data-workspace-academy]")).toBeVisible();
    await expect(switcher.locator("[data-workspace-repair]")).toBeHidden();
    await expect(switcher.locator("[data-workspace-beauty]")).toBeHidden();
    await expect(switcher.locator("[data-workspace-ai]")).toBeHidden();

    await expectNoOverflow(page, width);
    await expectMinHeight(page.locator("[data-new-draft]"), "Website Factory primary action", width);

    await page.locator("[data-new-draft]").click();
    await expect(page.locator("[data-wizard-view]")).toBeVisible();
    await expect(page.locator("[data-step-nav] button")).toHaveCount(9);
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.getByText(/automated source reading is not yet connected/i)).toBeVisible();
    await expectMinHeight(page.locator("[data-next]"), "Website Factory continue action", width);
    await expectNoOverflow(page, width);
  }
});

test("Website Factory never treats browser state or role text as workspace authority", async ({ page }) => {
  await mockFactory(page);
  await page.addInitScript(() => {
    localStorage.setItem("hermes_workspace", "repair");
    localStorage.setItem("role", "owner");
    sessionStorage.setItem("internal_ai", "true");
  });
  await page.goto("/services/hermes-connect/website-factory/?lang=ru", { waitUntil: "domcontentloaded" });

  const switcher = page.locator("[data-factory-app] [data-hc-account-switcher]");
  await expect(switcher).toBeVisible();
  await expect(switcher.locator("[data-workspace-repair]")).toBeHidden();
  await expect(switcher.locator("[data-workspace-ai]")).toBeHidden();
  await expect(switcher.locator("[data-workspace-academy]")).toBeVisible();
  await expect(switcher.locator("[data-account-name]")).toHaveText(account.identity.name);
});
