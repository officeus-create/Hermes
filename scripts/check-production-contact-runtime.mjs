import { chromium } from "@playwright/test";

const approvedHosts = new Set(["hermeslogisticsus.com", "www.hermeslogisticsus.com"]);
const target = new URL(process.env.CONTACT_RUNTIME_URL || "https://hermeslogisticsus.com/paths/logistics/");
const attempts = Number.parseInt(process.env.CONTACT_RUNTIME_ATTEMPTS || "6", 10);
const delayMs = Number.parseInt(process.env.CONTACT_RUNTIME_DELAY_MS || "5000", 10);

if (target.protocol !== "https:" || !approvedHosts.has(target.hostname)) {
  throw new Error(`Production contact runtime check rejected unapproved target: ${target.origin}`);
}
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 18) {
  throw new Error("CONTACT_RUNTIME_ATTEMPTS must be an integer from 1 through 18.");
}
if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 30_000) {
  throw new Error("CONTACT_RUNTIME_DELAY_MS must be an integer from 0 through 30000.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await chromium.launch({ headless: true });
let lastResult = null;

try {
  const page = await browser.newPage();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const url = new URL(target);
    url.searchParams.set("runtime-release", `${Date.now()}-${attempt}`);

    try {
      const response = await page.goto(url.href, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      const finalUrl = new URL(page.url());
      if (finalUrl.protocol !== "https:" || !approvedHosts.has(finalUrl.hostname)) {
        throw new Error(`Production contact runtime check followed an unapproved redirect: ${finalUrl.origin}`);
      }

      await page.waitForFunction(
        () => {
          const form = document.querySelector("[data-contact-form]");
          const label = form?.querySelector("[data-submit-label]");
          return form?.getAttribute("data-contact-mode") === "live"
            && form?.getAttribute("data-contact-endpoint") === "/api/logistics-lead"
            && label?.textContent?.trim() === "Send request";
        },
        undefined,
        { timeout: 15_000 },
      );

      const httpStatus = response?.status() ?? 0;
      const runtime = await page.locator("[data-contact-form]").first().evaluate((form) => ({
        mode: form.getAttribute("data-contact-mode"),
        endpoint: form.getAttribute("data-contact-endpoint"),
        label: form.querySelector("[data-submit-label]")?.textContent?.trim() ?? "",
        host: window.location.hostname,
      }));
      lastResult = { status: httpStatus, ...runtime };

      if (lastResult.status !== 200) throw new Error(`Production page returned HTTP ${lastResult.status}.`);
      console.log("Production contact runtime verified without submitting the form:", lastResult);
      process.exitCode = 0;
      break;
    } catch (error) {
      lastResult = { error: error instanceof Error ? error.message : String(error), attempt };
      if (attempt < attempts) await sleep(delayMs);
    }
  }
} finally {
  await browser.close();
}

if (!lastResult || "error" in lastResult) {
  throw new Error(`Production contact runtime activation was not verified: ${JSON.stringify(lastResult)}`);
}
