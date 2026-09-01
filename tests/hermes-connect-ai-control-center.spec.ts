import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-ai", name: "Vladimir Owner", email: "owner@example.com", role: "Owner" } };
const task = {
  id: "hcai_control_001",
  organization_scope: "hermes_internal",
  agent_role: "software_engineer",
  prompt: "Inspect the current AI Control Center and prepare a safe PR.",
  status: "queued",
  created_at: "2026-09-01T09:30:00Z",
  started_at: null,
  completed_at: null,
  updated_at: "2026-09-01T09:30:00Z",
  repo_sha: null,
  branch: null,
  pr_url: null,
  evidence_class: null,
  output_summary: null,
  approval_gate: null,
  cancel_requested: false,
};

async function routeOwner(page: import("@playwright/test").Page) {
  let activeTask: any = null;
  let submitted: any = null;
  await page.route("**/api/auth/me", route => route.fulfill(json(owner)));
  await page.route("**/api/repair-shop/profile", route => route.fulfill(json({ success: true, shop: null })));
  await page.route("**/api/internal-ai/status", route => route.fulfill(json({
    success: true,
    runtime: { online: true, last_seen_at: "2026-09-01T09:30:00Z", repo_sha: "abc123", runtime_version: "codex 1.0", remote_browser_to_codex: "UNVERIFIED" },
    active_task: activeTask,
    latest_task: activeTask,
  })));
  await page.route("**/api/internal-ai/tasks", async route => {
    if (route.request().method() === "POST") {
      submitted = route.request().postDataJSON();
      activeTask = { ...task, prompt: submitted.prompt };
      return route.fulfill(json({ success: true, task: activeTask }, 201));
    }
    return route.fulfill(json({ success: true, tasks: activeTask ? [activeTask] : [] }));
  });
  await page.route("**/api/internal-ai/tasks/*", async route => {
    if (route.request().method() === "PATCH") {
      activeTask = { ...activeTask, status: "cancelled", cancel_requested: true };
      return route.fulfill(json({ success: true, task: activeTask }));
    }
    return route.fulfill(json({ success: true, task: activeTask || task, events: [{ id: 1, event_type: "runner_started", message: "Runner accepted bounded task.", created_at: "2026-09-01T09:31:00Z" }] }));
  });
  return { submitted: () => submitted };
}

test("internal owner can manage AI from the Russian cabinet at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await routeOwner(page);
  await page.goto("/services/hermes-connect/internal/ai-connect/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "AI Control Center" })).toBeVisible();
  await expect(page.locator("[data-hc-ai-nav]")).toBeVisible();
  await expect(page.locator("[data-hc-ai-nav]").getByText("Проекты")).toBeVisible();
  await expect(page.locator("[data-hc-ai-nav]").getByText("Активность")).toBeVisible();
  await expect(page.locator("[data-runner-state]")).toHaveText("Онлайн");

  const prompt = "Проверь текущий AI кабинет, запусти тесты и подготовь PR. Не делай merge/deploy.";
  await page.locator("[data-task-prompt]").fill(prompt);
  await page.locator("[data-start]").click();
  await expect.poll(() => state.submitted()).toEqual({ prompt });
  await expect(page.locator("[data-form-status]")).toContainText("очеред");
  await expect(page.locator("[data-task-status]")).toContainText("очеред");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});

test("Activity never renders stored task prompt and only allowlists Hermes PR URLs", async ({ page }) => {
  await page.route("**/api/auth/me", route => route.fulfill(json(owner)));
  await page.route("**/api/repair-shop/profile", route => route.fulfill(json({ success: true, shop: null })));
  await page.route("**/api/internal-ai/status", route => route.fulfill(json({ success: true, runtime: { online: false }, active_task: null, latest_task: task })));
  await page.route("**/api/internal-ai/tasks", route => route.fulfill(json({ success: true, tasks: [
    { ...task, status: "completed", prompt: "SECRET PROMPT MUST NOT RENDER", output_summary: "Sanitized result only.", branch: "internal-ai/hcai_control_001", pr_url: "https://github.com/officeus-create/Hermes/pull/999", evidence_class: "LOCAL_RUNNER_EXECUTION" },
    { ...task, id: "hcai_bad_pr", status: "completed", prompt: "ANOTHER SECRET PROMPT", output_summary: "Another safe result.", pr_url: "https://evil.example/pull/1" },
  ] })));

  await page.goto("/services/hermes-connect/internal/ai-connect/activity/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Активность" })).toBeVisible();
  await expect(page.locator("[data-list]")).toContainText("Sanitized result only.");
  await expect(page.locator("[data-list]")).not.toContainText("SECRET PROMPT MUST NOT RENDER");
  await expect(page.locator("[data-list]")).not.toContainText("ANOTHER SECRET PROMPT");
  await expect(page.locator("[data-list] a")).toHaveCount(1);
  await expect(page.locator("[data-list] a")).toHaveAttribute("href", "https://github.com/officeus-create/Hermes/pull/999");
});

test("ordinary Hermes user does not discover internal AI navigation", async ({ page }) => {
  await page.route("**/api/auth/me", route => route.fulfill(json(owner)));
  await page.route("**/api/repair-shop/profile", route => route.fulfill(json({ success: true, shop: null })));
  await page.route("**/api/internal-ai/status", route => route.fulfill(json({ success: false, error: "hermes_internal_owner_required" }, 403)));

  await page.goto("/services/hermes-connect/internal/ai-connect/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-hc-ai-nav]")).toBeHidden();
  await expect(page.locator("[data-access-title]")).toContainText("внутреннего владельца");
  await expect(page.locator("[data-content]")).toBeHidden();
});
