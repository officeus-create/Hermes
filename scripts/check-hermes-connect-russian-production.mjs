import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = "https://hermeslogisticsus.com";
const repairRoot = "/services/hermes-connect/repair-shops/";
const outputDir = path.resolve("artifacts");

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const result = {
  checkedAt: new Date().toISOString(),
  classification: "HERMES_CONNECT_RUSSIAN_NOT_CONFIRMED",
  boundaries: {
    publicReadOnly: true,
    realBrowser: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noPrivateDataCollected: true,
  },
  landing: null,
  auth: null,
  plan: null,
  booking: null,
  hub: null,
  fatalError: null,
};

async function newPage() {
  return browser.newPage({ viewport: { width: 390, height: 844 } });
}

async function goto(page, url) {
  const response = await page.goto(`${baseUrl}${url}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  return response?.status() ?? 0;
}

async function waitForText(page, selector, text) {
  await page.waitForFunction(
    ({ selector, text }) => document.querySelector(selector)?.textContent?.trim() === text,
    { selector, text },
    { timeout: 15_000 },
  );
}

try {
  {
    const page = await newPage();
    const status = await goto(page, `${repairRoot}?lang=ru`);
    await waitForText(page, ".repair-live-hero h1", "Дайте клиентам одну ссылку для записи в ваш автосервис.");
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      languageLabel: document.querySelector("[data-language-menu] summary span")?.textContent?.trim() ?? "",
      contentLanguage: document.querySelector(".hc-content-language")?.textContent?.trim() ?? "",
      englishOnlyCount: document.querySelectorAll("[data-hc-english-only]").length,
      hero: document.querySelector(".repair-live-hero h1")?.textContent?.trim() ?? "",
      lead: document.querySelector(".repair-live-hero .repair-lead")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      familyText: document.querySelector(".hc-family-nav")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      url: window.location.href,
    }));
    result.landing = {
      status,
      ...state,
      pass:
        status === 200 &&
        state.lang === "ru" &&
        state.languageLabel === "Русский" &&
        state.contentLanguage === "Язык контента: русский" &&
        state.englishOnlyCount === 0 &&
        state.hero === "Дайте клиентам одну ссылку для записи в ваш автосервис." &&
        state.lead.includes("Hermes Connect для СТО помогает независимым автосервисам") &&
        state.familyText.includes("СТО") &&
        state.familyText.includes("ИИ-командный центр") &&
        !state.familyText.includes("Repair Shops"),
    };
    await page.close();
  }

  {
    const page = await newPage();
    const status = await goto(page, `${repairRoot}auth/?lang=ru`);
    await waitForText(page, "#auth-forms h1", "Доступ владельца СТО");
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      englishOnlyCount: document.querySelectorAll("[data-hc-english-only]").length,
      heading: document.querySelector("#auth-forms h1")?.textContent?.trim() ?? "",
      loginTab: document.querySelector('[data-tab="login"]')?.textContent?.trim() ?? "",
      registerTab: document.querySelector('[data-tab="register"]')?.textContent?.trim() ?? "",
      passwordLabel: document.querySelector('label[for="login-password"]')?.textContent?.trim() ?? "",
      url: window.location.href,
    }));
    result.auth = {
      status,
      ...state,
      pass:
        status === 200 &&
        state.lang === "ru" &&
        state.englishOnlyCount === 0 &&
        state.heading === "Доступ владельца СТО" &&
        state.loginTab === "Войти" &&
        state.registerTab === "Зарегистрировать СТО" &&
        state.passwordLabel === "Пароль",
    };
    await page.close();
  }

  {
    const page = await newPage();
    const status = await goto(page, `${repairRoot}plan/?lang=ru`);
    await waitForText(page, ".plan-page .hero h1", "Активируйте Hermes Connect для своего СТО.");
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      englishOnlyCount: document.querySelectorAll("[data-hc-english-only]").length,
      heading: document.querySelector(".plan-page .hero h1")?.textContent?.trim() ?? "",
      activationTitle: document.querySelector("#activate-title")?.textContent?.trim() ?? "",
      formText: document.querySelector("#paid-plan-form")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      url: window.location.href,
    }));
    result.plan = {
      status,
      ...state,
      pass:
        status === 200 &&
        state.lang === "ru" &&
        state.englishOnlyCount === 0 &&
        state.heading === "Активируйте Hermes Connect для своего СТО." &&
        state.activationTitle === "Запросить тариф Founding Shop за $99 в месяц." &&
        state.formText.includes("Название СТО") &&
        !state.formText.includes("Repair shop name"),
    };
    await page.close();
  }

  {
    const page = await newPage();
    const status = await goto(page, `${repairRoot}booking/?lang=ru`);
    await waitForText(page, ".booking-page .hero .eyebrow", "Hermes Connect · публичная запись");
    await page.waitForFunction(
      () => document.querySelector("#page-alert")?.textContent?.includes("В ссылке отсутствует идентификатор СТО"),
      null,
      { timeout: 15_000 },
    );
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      englishOnlyCount: document.querySelectorAll("[data-hc-english-only]").length,
      eyebrow: document.querySelector(".booking-page .hero .eyebrow")?.textContent?.trim() ?? "",
      shopTitle: document.querySelector("#shop-title")?.textContent?.trim() ?? "",
      alert: document.querySelector("#page-alert")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      url: window.location.href,
    }));
    result.booking = {
      status,
      ...state,
      pass:
        status === 200 &&
        state.lang === "ru" &&
        state.englishOnlyCount === 0 &&
        state.eyebrow === "Hermes Connect · публичная запись" &&
        state.shopTitle === "Загружаем СТО…" &&
        state.alert.includes("В ссылке отсутствует идентификатор СТО"),
    };
    await page.close();
  }

  {
    const page = await newPage();
    const status = await goto(page, "/services/hermes-connect/?lang=ru");
    await waitForText(page, ".hc-content-language", "Язык контента: русский");
    const state = await page.evaluate(() => {
      const academy = Array.from(document.querySelectorAll('a[href*="/services/hermes-connect/academy/"]')).find((link) => {
        const url = new URL(link.href);
        return url.pathname === "/services/hermes-connect/academy/" && url.searchParams.get("lang") === "ru";
      });
      return {
        lang: document.documentElement.lang,
        contentLanguage: document.querySelector(".hc-content-language")?.textContent?.trim() ?? "",
        englishOnlyCount: document.querySelectorAll("[data-hc-product-context] [data-hc-english-only]").length,
        academyLinkPreservesRussian: Boolean(academy),
        url: window.location.href,
      };
    });
    result.hub = {
      status,
      ...state,
      pass:
        status === 200 &&
        state.lang === "ru" &&
        state.contentLanguage === "Язык контента: русский" &&
        state.englishOnlyCount === 0 &&
        state.academyLinkPreservesRussian,
    };
    await page.close();
  }
} catch (error) {
  result.fatalError = error instanceof Error ? error.message : String(error);
} finally {
  await browser.close();
}

const checks = [result.landing, result.auth, result.plan, result.booking, result.hub];
const live = !result.fatalError && checks.every((check) => check?.pass === true);
result.classification = live ? "LIVE_HERMES_CONNECT_RUSSIAN_COMPLETE" : "HERMES_CONNECT_RUSSIAN_NOT_CONFIRMED";

const mark = (check) => (check?.pass ? "✅" : "❌");
const markdown = [
  "# Hermes Connect Russian production verification",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Classification: **${result.classification}**`,
  "- Verification mode: **real Chromium browser against the public custom domain**",
  "",
  "## Russian Repair Shops surfaces",
  "",
  `- ${mark(result.landing)} Mobile Repair Shops landing: Russian hero, description, product family, language truth; no English-only notice`,
  `- ${mark(result.auth)} Owner authentication: Russian heading, tabs and password label`,
  `- ${mark(result.plan)} Founding Shop plan: Russian activation copy and form labels`,
  `- ${mark(result.booking)} Public booking: Russian booking label and missing-shop state`,
  `- ${mark(result.hub)} Hermes Connect Hub: Russian content truth and Academy link preserves ?lang=ru`,
  "",
  `- Landing HTTP status: ${result.landing?.status ?? "n/a"}`,
  `- Auth HTTP status: ${result.auth?.status ?? "n/a"}`,
  `- Plan HTTP status: ${result.plan?.status ?? "n/a"}`,
  `- Booking HTTP status: ${result.booking?.status ?? "n/a"}`,
  `- Hub HTTP status: ${result.hub?.status ?? "n/a"}`,
  "",
  "> Public read-only verification only. No form was submitted, no account or booking was created, and no credential/private identifier was accessed.",
  "",
];

if (!live) {
  markdown.push("## Failure detail", "", `- Fatal error: ${result.fatalError ?? "none"}`, "", "```json", JSON.stringify(result, null, 2), "```", "");
}

await fs.writeFile(path.join(outputDir, "hermes-connect-russian-production.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(outputDir, "hermes-connect-russian-production.md"), markdown.join("\n"), "utf8");

console.log(markdown.join("\n"));
if (!live) process.exitCode = 1;
