import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { createHash } from "node:crypto";

// Isolated lifecycle fixture: use current source handlers and built DOM, with no
// ContactForm/receiver/provider runtime. Dispatching a fixture event never submits a request.
const helper = readFileSync("src/lib/repair-attribution.ts", "utf8").replace(/export function/g, "function");
const contact = readFileSync("src/components/ContactLinkEnhancer.astro", "utf8").split("<script>")[1].split("</script>")[0];
const seo = readFileSync("src/components/SeoIntakeEnhancer.astro", "utf8").split("<script>")[1].split("</script>")[0];
const runtimeInputSha256 = createHash("sha256").update(helper + contact + seo).digest("hex");
const handlers = ts.transpileModule(helper + "\n" + contact.replace(/^\s*import .*;$/gm, "") + "\n" + seo.replace(/^\s*import .*;$/gm, ""), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const cases = [
  { source: "/services/auto-repair-website-design/", destination: "/paths/technology/", mode: "project=website_development", repair: true, group: "auto_repair_website", selector: "[data-website-project-cta]", events: ["website_project_intake_start", "website_project_preview_ready", "website_handoff_ready"] },
  { source: "/services/seo-for-auto-repair-shops/", destination: "/paths/marketing/", mode: "service=seo", repair: true, group: "auto_repair_seo", selector: "[data-seo-service-cta]", events: ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"] },
  { source: "/services/website-development/", destination: "/paths/technology/", mode: "project=website_development", repair: false, group: "website_development", selector: "[data-website-project-cta]", events: ["website_project_intake_start", "website_project_preview_ready", "website_handoff_ready"] },
  { source: "/services/seo/", destination: "/paths/marketing/", mode: "service=seo", repair: false, group: "seo_services", selector: "[data-seo-service-cta]", events: ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"] },
  { source: "/services/auto-repair-website-design/", destination: "/paths/technology/", mode: "project=website_development", repair: true, oppositeMode: "service", group: "auto_repair_website", selector: "[data-website-project-cta]", events: ["website_project_intake_start", "website_project_preview_ready", "website_handoff_ready"] },
  { source: "/services/seo-for-auto-repair-shops/", destination: "/paths/marketing/", mode: "service=seo", repair: true, oppositeMode: "project", group: "auto_repair_seo", selector: "[data-seo-service-cta]", events: ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"] },
];
for (const context of cases) {
  for (const placement of context.oppositeMode ? ["body"] : ["body", "mobile action bar"]) {
    test(`${context.group}: ${placement} ${context.oppositeMode ? "rejects opposite mode on all destination fixture events" : "preserves source → all destination fixture events"} without sending`, async ({ page }, testInfo) => {
      if (testInfo.project.name === "desktop") await page.setViewportSize({ width: 1440, height: 1000 });
      let externalRequests = 0;
      await page.route("**/*", async (route) => {
        const request = route.request();
        if (!request.isNavigationRequest() || request.method() !== "GET" || new URL(request.url()).hostname !== "127.0.0.1") {
          if (request.method() !== "GET" || /\/api\/|google-analytics|googletagmanager|posthog/.test(request.url())) externalRequests++;
          await route.abort();
          return;
        }
        const path = new URL(request.url()).pathname;
        const html = readFileSync(`dist${path}index.html`, "utf8")
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<link\b[^>]*>/gi, "")
          .replace(/<img\b[^>]*>/gi, "");
        await route.fulfill({ contentType: "text/html", body: html + `<script>${handlers}</script>` });
      });
      await page.goto(context.source);
      // Static DOM remains faithful to both CTA locations; expose the mobile bar
      // in this style-free fixture so both handler paths are exercised on both viewports.
      const cta = page.locator(placement === "body" ? `.digital-service-actions ${context.selector}` : `.money-page-action-bar ${context.selector}`).first();
      const href = await cta.getAttribute("href");
      expect(href).toContain(context.mode);
      await page.evaluate(() => document.addEventListener("click", (event) => {
        if ((event.target as Element)?.closest("a")) event.preventDefault();
      }, { capture: true }));
      await cta.click();
      const sourceEvent = await page.evaluate(() => window.dataLayer?.find((event) => event.event === "commercial_cta_click"));
      const expectedContext = context.repair ? { source_path: context.source, vertical: "auto_repair", service_group: context.group } : {};
      expect(sourceEvent?.service_group).toBe(context.group);
      expect(sourceEvent).toEqual(expect.objectContaining(expectedContext));
      const target = new URL(href!, "http://127.0.0.1");
      if (context.oppositeMode) target.searchParams.set(context.oppositeMode, context.oppositeMode === "service" ? "seo" : "website_development");
      const destinationContext = context.oppositeMode ? {} : expectedContext;
      target.searchParams.set("email", "private@example.invalid");
      target.searchParams.set("service_group", "forged");
      target.searchParams.set("arbitrary", "private-query-marker");
      await page.goto(target.pathname + target.search + target.hash);
      if (context.mode === "service=seo") {
        await page.locator('input[name="seo_primary_market"]').click();
        await page.evaluate(() => {
          const form = document.querySelector<HTMLFormElement>("[data-contact-form]")!;
          const handoff = form.querySelector<HTMLElement>("[data-contact-handoff]")!;
          handoff.hidden = false;
          form.querySelector<HTMLElement>("[data-handoff-route]")!.hidden = false;
          form.querySelector<HTMLElement>("[data-handoff-summary]")!.textContent = "Synthetic local preview fixture";
          form.querySelector<HTMLAnchorElement>("[data-handoff-route-link]")!.href = "mailto:fixture@example.invalid";
          // Listener-only synthetic lifecycle; no requestSubmit(), submit(), or provider runtime.
          form.dispatchEvent(new Event("submit"));
        });
      } else {
        await page.locator('textarea[name="project_1"]').click();
        await page.evaluate(() => {
          document.querySelector<HTMLElement>('[data-brief-step="4"]')!.hidden = false;
          const email = document.querySelector<HTMLAnchorElement>("[data-brief-email]")!;
          email.hidden = false;
          email.href = "mailto:fixture@example.invalid";
        });
        await page.locator("[data-brief-next]").first().click();
      }
      await expect.poll(async () => page.evaluate((name) => window.dataLayer?.filter((item) => item.event === name).length || 0, context.events[1])).toBe(1);
      await page.evaluate(() => document.addEventListener("click", (event) => {
        if ((event.target as Element)?.closest("a")) event.preventDefault();
      }, { capture: true }));
      const handoff = page.locator(context.mode === "service=seo" ? "[data-handoff-route-link]" : "[data-brief-email]");
      await handoff.click();
      await handoff.click();
      const events = await page.evaluate((names) => (window.dataLayer || []).filter((item) => names.includes(String(item.event))), context.events);
      expect(events.map((item) => item.event)).toEqual(context.events);
      for (const event of events) {
        expect(event).toEqual(expect.objectContaining({ ...destinationContext, page_path: context.destination }));
        if (!context.repair || context.oppositeMode) {
          expect(event).not.toHaveProperty("source_path");
          expect(event).not.toHaveProperty("vertical");
          if (context.mode === "service=seo") expect(event.service_group).toBe("seo_services");
          else expect(event).not.toHaveProperty("service_group");
        }
        expect(Object.keys(event)).not.toContain("email");
        expect(JSON.stringify(event)).not.toMatch(/forged|private-query-marker|example\.invalid/);
      }
      expect(externalRequests).toBe(0);
      const evidencePath = testInfo.outputPath("synthetic-attribution-context.json");
      writeFileSync(evidencePath, JSON.stringify({ synthetic: true, scope: "isolated listener fixture, no submission/provider", runtimeInputSha256, project: testInfo.project.name, viewport: page.viewportSize(), placement, rejectedOppositeMode: context.oppositeMode || null, externalRequests, sourceEvent, events }, null, 2));
      await testInfo.attach("synthetic-attribution-context.json", { contentType: "application/json", path: evidencePath });
    });
  }
}
