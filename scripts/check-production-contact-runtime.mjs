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
  const rawContext = await browser.newContext({ javaScriptEnabled: false });
  const runtimeContext = await browser.newContext();
  const rawPage = await rawContext.newPage();
  const runtimePage = await runtimeContext.newPage();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const url = new URL(target);
    url.searchParams.set("runtime-release", `${Date.now()}-${attempt}`);

    try {
      const rawResponse = await rawPage.goto(url.href, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      const rawFinalUrl = new URL(rawPage.url());
      if (rawFinalUrl.protocol !== "https:" || !approvedHosts.has(rawFinalUrl.hostname)) {
        throw new Error(`Production contact raw-shell check followed an unapproved redirect: ${rawFinalUrl.origin}`);
      }

      const rawStatus = rawResponse?.status() ?? 0;
      const rawForm = await rawPage.locator("[data-contact-form]").first().evaluate((form) => ({
        mode: form.getAttribute("data-contact-mode"),
        endpoint: form.getAttribute("data-contact-endpoint"),
        label: form.querySelector("[data-submit-label]")?.textContent?.trim() ?? "",
        host: window.location.hostname,
      }));
      if (rawStatus !== 200) throw new Error(`Production raw page returned HTTP ${rawStatus}.`);
      if (rawForm.mode !== "preview") {
        throw new Error(`Production raw contact form was not preview-safe: ${JSON.stringify(rawForm)}.`);
      }
      if ((rawForm.endpoint ?? "").trim() !== "") {
        throw new Error(`Production raw contact form exposed a live endpoint: ${JSON.stringify(rawForm)}.`);
      }
      if (rawForm.label !== "Preview request") {
        throw new Error(`Production raw contact form had the wrong preview label: ${JSON.stringify(rawForm)}.`);
      }

      const runtimeResponse = await runtimePage.goto(url.href, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      const runtimeFinalUrl = new URL(runtimePage.url());
      if (runtimeFinalUrl.protocol !== "https:" || !approvedHosts.has(runtimeFinalUrl.hostname)) {
        throw new Error(`Production contact runtime check followed an unapproved redirect: ${runtimeFinalUrl.origin}`);
      }

      // Exercise browser hydration without making a form POST or changing
      // the recipient. The runtime must retain the server's fail-closed shell.
      await runtimePage.waitForLoadState("load", { timeout: 15_000 });
      await runtimePage.waitForTimeout(500);

      const runtimeStatus = runtimeResponse?.status() ?? 0;
      const runtime = await runtimePage.locator("[data-contact-form]").first().evaluate((form) => ({
        mode: form.getAttribute("data-contact-mode"),
        endpoint: form.getAttribute("data-contact-endpoint"),
        label: form.querySelector("[data-submit-label]")?.textContent?.trim() ?? "",
        host: window.location.hostname,
      }));
      lastResult = { raw: { status: rawStatus, ...rawForm }, runtime: { status: runtimeStatus, ...runtime } };

      if (runtimeStatus !== 200) throw new Error(`Production runtime page returned HTTP ${runtimeStatus}.`);
      if (runtime.mode !== rawForm.mode || runtime.endpoint !== rawForm.endpoint || runtime.label !== rawForm.label) {
        throw new Error("Hydrated contact form elevated server Preview or modified recipient/CTA.");
      }
      console.log("Production contact raw shell and hydrated Preview parity verified without submitting:", lastResult);
      process.exitCode = 0;
      break;
    } catch (error) {
      lastResult = { error: error instanceof Error ? error.message : String(error), attempt };
      if (attempt < attempts) await sleep(delayMs);
    }
  }

  await rawContext.close();
  await runtimeContext.close();
} finally {
  await browser.close();
}

if (!lastResult || "error" in lastResult) {
  throw new Error(`Production contact server-to-browser parity was not verified: ${JSON.stringify(lastResult)}`);
}
