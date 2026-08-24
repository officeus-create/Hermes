import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = "https://hermeslogisticsus.com";
const outputDir = path.resolve("artifacts");
const mobileWidths = [360, 390, 412, 768];
const desktopWidths = [1024, 1280];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const browserChecks = [];
let fourDirections = null;
let contact = null;
let connectRussian = null;
let fatalError = null;

async function openHome(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const response = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector(".site-header", { timeout: 15_000 });
  return { page, response };
}

function isVisibleStyle(style) {
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

async function readConnectRussianState(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".hc-brand-page");
    const rootText = root?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const academyLinks = Array.from(root?.querySelectorAll('a[href*="/services/hermes-connect/academy/"]') ?? []).map((link) => {
      const url = new URL(link.href);
      return {
        pathname: url.pathname,
        locale: url.searchParams.get("lang"),
        text: link.textContent?.replace(/\s+/g, " ").trim() ?? "",
      };
    });

    return {
      lang: document.documentElement.lang,
      label: document.querySelector("[data-language-menu] summary span")?.textContent?.trim() ?? "",
      stored: localStorage.getItem("hermes-connect-language"),
      hubLocale: root?.getAttribute("data-hc-hub-locale") ?? "",
      contentLanguage: document.querySelector("[data-hc-product-context] .hc-content-language")?.textContent?.trim() ?? "",
      englishOnlyNoticePresent: Boolean(document.querySelector("[data-hc-product-context] [data-hc-english-only]")),
      title: document.title,
      heroRussian: rootText.includes("Управляйте бизнесом") && rootText.includes("с AI."),
      leadRussian: rootText.includes("Одна операционная система для лидов, записей, клиентов, операций и роста."),
      repairShopRussian: rootText.includes("СТО уже работает") && rootText.includes("Открыть СТО"),
      academyRussian:
        rootText.includes("ПРИВАТНОЕ ПРОСТРАНСТВО ОБУЧЕНИЯ") &&
        rootText.includes("Открыть Академию") &&
        rootText.includes("Открыть обучение"),
      academyLinkPreservesRussian: academyLinks.some(
        (link) => link.pathname === "/services/hermes-connect/academy/" && link.locale === "ru",
      ),
      academyLinks,
    };
  });
}

try {
  for (const width of mobileWidths) {
    const { page, response } = await openHome(width);
    const state = await page.evaluate(() => {
      const read = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const style = getComputedStyle(node);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
        };
      };
      return {
        desktopNav: read(".site-header .desktop-nav"),
        headerActions: read(".site-header .header-actions"),
        menuButton: read(".site-header .menu-button"),
      };
    });

    browserChecks.push({
      width,
      mode: "mobile",
      status200: response?.status() === 200,
      desktopNavHidden: Boolean(state.desktopNav && !isVisibleStyle(state.desktopNav)),
      headerActionsHidden: Boolean(state.headerActions && !isVisibleStyle(state.headerActions)),
      menuButtonVisible: Boolean(state.menuButton && isVisibleStyle(state.menuButton)),
    });
    await page.close();
  }

  for (const width of desktopWidths) {
    const { page, response } = await openHome(width);
    const state = await page.evaluate(() => {
      const read = (selector) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const style = getComputedStyle(node);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
        };
      };
      return {
        desktopNav: read(".site-header .desktop-nav"),
        headerActions: read(".site-header .header-actions"),
        menuButton: read(".site-header .menu-button"),
      };
    });

    browserChecks.push({
      width,
      mode: "desktop",
      status200: response?.status() === 200,
      desktopNavVisible: Boolean(state.desktopNav && isVisibleStyle(state.desktopNav)),
      headerActionsVisible: Boolean(state.headerActions && isVisibleStyle(state.headerActions)),
      menuButtonHidden: Boolean(state.menuButton && !isVisibleStyle(state.menuButton)),
    });
    await page.close();
  }

  {
    const { page, response } = await openHome(390);
    fourDirections = await page.evaluate(() => {
      const node = document.querySelector(".home-rooms-display");
      if (!node) return { found: false };
      const style = getComputedStyle(node);
      return {
        found: true,
        text: node.textContent?.trim() ?? "",
        opacity: style.opacity,
        visibility: style.visibility,
        display: style.display,
        color: style.color,
        webkitTextFillColor: style.getPropertyValue("-webkit-text-fill-color"),
      };
    });
    fourDirections.status200 = response?.status() === 200;
    fourDirections.visible =
      fourDirections.found &&
      fourDirections.text === "Four directions." &&
      fourDirections.opacity === "1" &&
      fourDirections.visibility !== "hidden" &&
      fourDirections.display !== "none" &&
      !fourDirections.webkitTextFillColor.includes("transparent");

    contact = await page.evaluate(() => {
      const shell = document.querySelector("#contact.home-contact-shell");
      const inner = shell?.querySelector(".home-final-contact");
      if (!shell || !inner) return { found: false };
      const shellStyle = getComputedStyle(shell);
      const innerStyle = getComputedStyle(inner);
      const bodyStyle = getComputedStyle(document.body);
      const shellRect = shell.getBoundingClientRect();
      return {
        found: true,
        shellTopLeftRadius: shellStyle.borderTopLeftRadius,
        shellTopRightRadius: shellStyle.borderTopRightRadius,
        shellOverflow: shellStyle.overflow,
        innerTopLeftRadius: innerStyle.borderTopLeftRadius,
        innerTopRightRadius: innerStyle.borderTopRightRadius,
        bodyBackgroundColor: bodyStyle.backgroundColor,
        shellLeft: Math.round(shellRect.left),
        shellRightGap: Math.round(window.innerWidth - shellRect.right),
      };
    });
    contact.noWhiteCornerLeakContract =
      contact.found &&
      contact.shellTopLeftRadius === "0px" &&
      contact.shellTopRightRadius === "0px" &&
      contact.innerTopLeftRadius !== "0px" &&
      contact.innerTopRightRadius !== "0px" &&
      contact.bodyBackgroundColor !== "rgb(255, 255, 255)" &&
      contact.shellLeft === 0 &&
      contact.shellRightGap === 0;
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const response = await page.goto(`${baseUrl}/services/hermes-connect/?lang=ru`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForSelector("[data-language-menu]", { state: "attached", timeout: 15_000 });
    await page.waitForSelector('.hc-brand-page[data-hc-hub-locale="ru"]', { timeout: 15_000 });
    const initial = await readConnectRussianState(page);

    await page.goto(`${baseUrl}/services/hermes-connect/`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForURL(/\/services\/hermes-connect\/\?lang=ru$/, { timeout: 15_000 });
    await page.waitForSelector("[data-language-menu]", { state: "attached", timeout: 15_000 });
    await page.waitForSelector('.hc-brand-page[data-hc-hub-locale="ru"]', { timeout: 15_000 });
    const restored = await readConnectRussianState(page);

    const languageState = (state) => state.lang === "ru" && state.label === "Русский" && state.stored === "ru";
    const translatedState = (state) =>
      state.hubLocale === "ru" &&
      state.contentLanguage === "Язык контента: русский" &&
      !state.englishOnlyNoticePresent &&
      state.title === "Hermes Connect | AI-операционная система для бизнеса" &&
      state.heroRussian &&
      state.leadRussian &&
      state.repairShopRussian;
    const academyState = (state) => state.academyRussian && state.academyLinkPreservesRussian;

    connectRussian = {
      status200: response?.status() === 200,
      queryPreserved: page.url().endsWith("/services/hermes-connect/?lang=ru"),
      initialRussian: languageState(initial),
      restoredRussian: languageState(restored),
      initialContentRussian: translatedState(initial),
      restoredContentRussian: translatedState(restored),
      initialAcademyEntry: academyState(initial),
      restoredAcademyEntry: academyState(restored),
      initial,
      restored,
    };
    await page.close();
  }
} catch (error) {
  fatalError = error instanceof Error ? error.message : String(error);
} finally {
  await browser.close();
}

const mobilePass = browserChecks
  .filter((item) => item.mode === "mobile")
  .every((item) => item.status200 && item.desktopNavHidden && item.headerActionsHidden && item.menuButtonVisible);
const desktopPass = browserChecks
  .filter((item) => item.mode === "desktop")
  .every((item) => item.status200 && item.desktopNavVisible && item.headerActionsVisible && item.menuButtonHidden);
const headingPass = Boolean(fourDirections?.status200 && fourDirections?.visible);
const contactPass = Boolean(contact?.noWhiteCornerLeakContract);
const russianLocalePass = Boolean(
  connectRussian?.status200 &&
  connectRussian?.queryPreserved &&
  connectRussian?.initialRussian &&
  connectRussian?.restoredRussian,
);
const russianContentPass = Boolean(connectRussian?.initialContentRussian && connectRussian?.restoredContentRussian);
const academyEntryPass = Boolean(connectRussian?.initialAcademyEntry && connectRussian?.restoredAcademyEntry);
const russianPass = russianLocalePass && russianContentPass && academyEntryPass;

const live = !fatalError && mobilePass && desktopPass && headingPass && contactPass && russianPass;
const classification = live ? "LIVE_HOME_CONNECT_HOTFIX" : "HOME_CONNECT_HOTFIX_NOT_CONFIRMED";

const result = {
  checkedAt: new Date().toISOString(),
  classification,
  boundaries: {
    publicReadOnly: true,
    realBrowser: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noPrivateDataCollected: true,
  },
  responsiveHeader: {
    mobileWidths,
    desktopWidths,
    mobilePass,
    desktopPass,
    observations: browserChecks,
  },
  fourDirections,
  contact,
  connectRussian,
  fatalError,
};

const lines = [
  "# Homepage + Hermes Connect hotfix production verification",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Classification: **${classification}**`,
  "- Verification mode: **real Chromium browser against the public custom domain**",
  "",
  "## Responsive header",
  "",
  `- ${mobilePass ? "✅" : "❌"} Mobile/tablet contract at ${mobileWidths.join(" / ")} px`,
  `- ${desktopPass ? "✅" : "❌"} Desktop contract at ${desktopWidths.join(" / ")} px`,
  "",
  "## Homepage visual regressions",
  "",
  `- ${headingPass ? "✅" : "❌"} Four directions remains visible and opaque at 390 px`,
  `- ${contactPass ? "✅" : "❌"} Contact outer shell is square/full-bleed, inner surface remains rounded, page backdrop is non-white`,
  "",
  "## Hermes Connect Russian locale and Hub",
  "",
  `- ${russianLocalePass ? "✅" : "❌"} Russian selection and saved-locale restoration work in-browser`,
  `- ${russianContentPass ? "✅" : "❌"} Russian Hub hero, lead, product-language truth, title, and Repair Shop copy render after selection and restoration`,
  `- ${academyEntryPass ? "✅" : "❌"} Existing Academy private learner entry renders in Russian and preserves ?lang=ru`,
  "",
];

if (!live) {
  lines.push("## Failure detail", "", `- Fatal error: ${fatalError ?? "none"}`);
  for (const item of browserChecks) lines.push(`- ${item.mode} ${item.width}px: ${JSON.stringify(item)}`);
  lines.push(`- Four directions: ${JSON.stringify(fourDirections)}`);
  lines.push(`- Contact: ${JSON.stringify(contact)}`);
  lines.push(`- Connect RU: ${JSON.stringify(connectRussian)}`, "");
}

lines.push(
  "> Public read-only verification only. No form was submitted, no account or booking was created, and no credential/private identifier was accessed.",
  "",
);

const markdown = lines.join("\n");
await fs.writeFile(path.join(outputDir, "home-connect-hotfix-production.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(outputDir, "home-connect-hotfix-production.md"), markdown, "utf8");

console.log(markdown);
if (!live) process.exitCode = 1;
