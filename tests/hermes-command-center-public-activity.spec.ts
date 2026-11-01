import { expect, test } from "@playwright/test";

test.describe("Public Command Center activity showcase",()=>{
  test("keeps automation activity illustrative and controllable",async({page})=>{
    await page.goto("/services/hermes-connect/command-center/");
    const showcase=page.locator("[data-hcc-activity-showcase]");
    await expect(showcase).toBeVisible();
    await expect(showcase.getByText("VISUAL SIMULATION · NOT LIVE DATA")).toBeVisible();
    await expect(showcase.locator("[data-hcc-activity-node]")).toHaveCount(5);
    await expect(showcase.getByText("Illustrative event stream")).toBeVisible();
    const toggle=showcase.getByRole("button",{name:"Pause simulation"});
    await expect(toggle).toHaveAttribute("aria-pressed","false");
    await toggle.click();
    await expect(showcase.getByRole("button",{name:"Play simulation"})).toHaveAttribute("aria-pressed","true");
    await expect(showcase.locator(".hcc-activity-track span")).toHaveCSS("animation-play-state","paused");
    await showcase.getByRole("button",{name:"Play simulation"}).click();
    await expect(showcase.getByRole("button",{name:"Pause simulation"})).toHaveAttribute("aria-pressed","false");
    await expect(showcase.locator(".hcc-activity-track span")).toHaveCSS("animation-play-state","running");
    await expect(showcase).not.toContainText("WORK_ID");
  });

  test("replaces the public example with a Russian version before binding interaction",async({page})=>{
    await page.goto("/services/hermes-connect/command-center/?lang=ru");
    const showcase=page.locator("[data-hcc-activity-showcase]");
    await expect(showcase).toHaveCount(1);
    await expect(showcase.getByText("ВИЗУАЛЬНАЯ СИМУЛЯЦИЯ · НЕ LIVE-ДАННЫЕ")).toBeVisible();
    await showcase.getByRole("button",{name:"Остановить симуляцию"}).click();
    await expect(showcase.getByRole("button",{name:"Воспроизвести симуляцию"})).toHaveAttribute("aria-pressed","true");
  });

  test("respects reduced motion without exposing a nonfunctional control",async({page})=>{
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.goto("/services/hermes-connect/command-center/");
    const showcase=page.locator("[data-hcc-activity-showcase]");
    await expect(showcase).toBeVisible();
    await expect(showcase.getByText("VISUAL SIMULATION · NOT LIVE DATA")).toBeVisible();
    await expect(showcase.locator("[data-hcc-activity-toggle]")).toBeHidden();
    await expect(showcase.locator("[data-hcc-activity-node]")).toHaveCount(5);
    const animation=await showcase.locator(".hcc-activity-dot").first().evaluate(el=>getComputedStyle(el).animationName);
    expect(animation).toBe("none");
  });

  test("fits a 390px mobile viewport without cropping the five-stage demonstration",async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto("/services/hermes-connect/command-center/?lang=ru");
    const showcase=page.locator("[data-hcc-activity-showcase]");
    await expect(showcase).toBeVisible();
    await expect(showcase.locator("[data-hcc-activity-node]")).toHaveCount(5);
    const layout=await showcase.evaluate(el=>({width:el.getBoundingClientRect().width,overflow:el.scrollWidth-el.clientWidth}));
    expect(layout.width).toBeLessThanOrEqual(390);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  });
});
