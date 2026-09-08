import fs from "node:fs";

const replaceOnce = (path, before, after, label) => {
  const current = fs.readFileSync(path, "utf8");
  const count = current.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  fs.writeFileSync(path, current.replace(before, after));
};

const replaceRegexOnce = (path, pattern, after, label) => {
  const current = fs.readFileSync(path, "utf8");
  const matches = current.match(pattern);
  if (!matches) throw new Error(`${label}: pattern not found`);
  const next = current.replace(pattern, after);
  if (next === current) throw new Error(`${label}: replacement made no change`);
  fs.writeFileSync(path, next);
};

// 1) Shared Hermes Connect locale contract: explicit URL wins; otherwise restore a valid saved choice.
const basePath = "src/layouts/BaseLayout.astro";
replaceOnce(
  basePath,
`        const supported = new Set(["en", "uk", "ru", "es", "it", "fr"]);\n        const params = new URLSearchParams(window.location.search);\n        const requested = params.get("lang");\n        const active = requested && supported.has(requested) ? requested : "en";\n        document.documentElement.lang = active;\n        try { window.localStorage.setItem("hermes-connect-language", active); } catch {}\n\n        document.addEventListener("DOMContentLoaded", () => {\n          const current = new URL(window.location.href);`,
`        const supported = new Set(["en", "uk", "ru", "es", "it", "fr"]);\n        const params = new URLSearchParams(window.location.search);\n        const requested = params.get("lang");\n        let stored = null;\n        try { stored = window.localStorage.getItem("hermes-connect-language"); } catch {}\n        const hasExplicitLocale = requested !== null;\n        const active = hasExplicitLocale\n          ? (requested && supported.has(requested) ? requested : "en")\n          : (stored && supported.has(stored) ? stored : "en");\n        document.documentElement.lang = active;\n        try { window.localStorage.setItem("hermes-connect-language", active); } catch {}\n\n        if (!hasExplicitLocale && active !== "en") {\n          const normalized = new URL(window.location.href);\n          normalized.searchParams.set("lang", active);\n          window.history.replaceState(window.history.state, "", `${normalized.pathname}${normalized.search}${normalized.hash}`);\n        }\n\n        document.addEventListener("DOMContentLoaded", () => {\n          const current = new URL(window.location.href);`,
  "BaseLayout saved locale restore",
);

// 2) Repair owner navigation: the route stays /settings, but the product surface is Company.
const navPath = "src/components/RepairShopOwnerNavEnhancer.astro";
const navPairs = [
  ['settings:"Settings"', 'settings:"Company"'],
  ['settings:"Настройки"', 'settings:"Компания"'],
  ['settings:"Налаштування"', 'settings:"Компанія"'],
  ['settings:"Ajustes"', 'settings:"Empresa"'],
  ['settings:"Impostazioni"', 'settings:"Azienda"'],
  ['settings:"Paramètres"', 'settings:"Entreprise"'],
];
for (const [before, after] of navPairs) {
  let current = fs.readFileSync(navPath, "utf8");
  const count = current.split(before).length - 1;
  if (count !== 2) throw new Error(`owner nav ${before}: expected 2 matches, got ${count}`);
  fs.writeFileSync(navPath, current.split(before).join(after));
}

// 3) Company Russian parity: translate every visible labelled surface plus dynamic staff state.
const settingsPath = "src/pages/services/hermes-connect/repair-shops/settings.astro";
replaceOnce(
  settingsPath,
  'connectionsCopy:"No live account is connected from this page yet. These statuses are intentionally honest."}',
  'connectionsCopy:"No live account is connected from this page yet. These statuses are intentionally honest.",activeStatus:"Active",inactiveStatus:"Inactive"}',
  "Company English dynamic status keys",
);

const ruObject = `    ru:{title:"Компания",subtitle:"Профиль компании, сотрудники, смены, перерывы и готовность подключений — в одном месте.",eyebrow:"CRM автосервиса",notConfigured:"Не настроено",profileTab:"Профиль",teamTab:"Команда",scheduleTab:"Графики",connectionsTab:"Подключения",profileEyebrow:"Профиль компании",profileTitle:"Данные компании",profileCopy:"Сохранённые данные используются в публичной записи клиентов.",shopName:"Название СТО",phone:"Телефон",address:"Адрес",city:"Город",region:"Регион / штат",country:"Код страны",postal:"Почтовый индекс",timezone:"Часовой пояс",detectTimezone:"Использовать часовой пояс браузера",saveProfile:"Сохранить профиль компании",bookingEyebrow:"Доступ для клиентов",bookingTitle:"Публичная ссылка для записи",bookingCopy:"Делитесь этой постоянной ссылкой после настройки услуг и графика.",copy:"Копировать",open:"Открыть",teamEyebrow:"Сотрудники",teamTitle:"Команда",teamCopy:"Добавляйте мастеров, роли и специализации.",addEmployee:"Добавить сотрудника",employeeName:"Имя сотрудника",role:"Роль",specialties:"Специализации",activeEmployee:"Активный сотрудник",saveEmployee:"Сохранить сотрудника",cancel:"Отмена",staffEmpty:"Сотрудников пока нет. Добавьте первого мастера или члена команды.",scheduleEyebrow:"Рабочее время",scheduleTitle:"Смены и перерывы",scheduleCopy:"Настройте для каждого сотрудника недельные смены и перерывы по местному времени. Конфликты Google Calendar free/busy будут учитываться только после авторизации.",employee:"Сотрудник",scheduleEmpty:"Сначала добавьте сотрудника, затем настройте график.",day:"День",working:"Работает",shift:"Смена",break:"Перерыв",saveSchedule:"Сохранить график",connectionsEyebrow:"Подключения",connectionsTitle:"Приложения и каналы",connectionsCopy:"С этой страницы пока не подключается ни один живой аккаунт. Статусы показывают реальное состояние.",needsAuth:"Нужна авторизация",calendarCopy:"Первый адаптер: только минимальные данные free/busy. Названия событий, участники и описания не нужны. Для событий, создаваемых Hermes, потребуется отдельное разрешение.",connectLater:"Подключить после утверждения адаптера",email:"Электронная почта",planned:"Запланировано",emailCopy:"Подключение корпоративной почты для рабочего контекста, разрешённого владельцем.",websiteBrand:"Сайт и брендбук",brandCopy:"Логотип, цвета и бренд-материалы позже можно будет переносить на публичную страницу компании после подтверждения владельца.",socials:"Социальные сети",jobs:"Вакансии",jobsCopy:"Синхронизация вакансий будет использовать только источники, подтверждённые владельцем. Автоматической публикации нет.",saved:"Сохранено",edit:"Изменить",remove:"Удалить",deleteConfirm:"Удалить этого сотрудника?",loadFailed:"Не удалось загрузить раздел компании.",saveFailed:"Не удалось сохранить изменения.",savedMessage:"Изменения сохранены.",activeStatus:"Активен",inactiveStatus:"Неактивен"},\n    uk:`;
replaceRegexOnce(settingsPath, /    ru:\{title:"Компания".*?\},\n    uk:/s, ruObject, "Company complete RU dictionary");
replaceOnce(
  settingsPath,
  '${member.active?"Active":"Inactive"}',
  '${member.active?t.activeStatus:t.inactiveStatus}',
  "Company localized staff status",
);

// 4) Repair Company regression expectations: Company label + deeper RU parity.
const repairSettingsTest = "tests/repair-shop-settings.spec.ts";
let repairTestText = fs.readFileSync(repairSettingsTest, "utf8");
repairTestText = repairTestText.replaceAll('toContainText("Settings")', 'toContainText("Company")');
repairTestText = repairTestText.replaceAll('name: "Настройки"', 'name: "Компания"');
repairTestText = repairTestText.replaceAll('toContainText("Настройки")', 'toContainText("Компания")');
const ruAnchor = '  await expect(page.locator(\'[data-i18n="needsAuth"]\')).toHaveText("Нужна авторизация");';
if (!repairTestText.includes(ruAnchor)) throw new Error("Repair Company RU test anchor not found");
repairTestText = repairTestText.replace(
  ruAnchor,
  `${ruAnchor}\n  await expect(page.locator('[data-i18n="profileTitle"]')).toHaveText("Данные компании");\n  await expect(page.locator('[data-i18n="bookingTitle"]')).toHaveText("Публичная ссылка для записи");\n  await expect(page.locator('[data-i18n="connectionsCopy"]')).toContainText("Статусы показывают реальное состояние");`,
);
fs.writeFileSync(repairSettingsTest, repairTestText);

// 5) Shared mobile locale regression: saved RU must survive a clean Connect URL; a brand-new browser remains EN.
const mobileTest = "tests/hermes-connect-mobile-nav-contrast.spec.ts";
let mobile = fs.readFileSync(mobileTest, "utf8");
replaceOnce(
  mobileTest,
  'test("Hermes Connect clean mobile entry stays English and the full language list can be scrolled and selected", async ({ page }) => {',
  'test("Hermes Connect clean mobile entry restores the previously selected Russian locale and the full language list remains usable", async ({ page }) => {',
  "mobile saved locale test name",
);
mobile = fs.readFileSync(mobileTest, "utf8");
const oldExpectations = `  await page.goto("/services/hermes-connect/");\n  await expect(page).toHaveURL(/\\/services\\/hermes-connect\\/$/);\n  await expect(page.locator("html")).toHaveAttribute("lang", "en");\n  await expect(page.locator("[data-language-menu] summary span")).toHaveText("English");`;
const newExpectations = `  await page.goto("/services/hermes-connect/");\n  await expect(page).toHaveURL(/\\/services\\/hermes-connect\\/\\?lang=ru$/);\n  await expect(page.locator("html")).toHaveAttribute("lang", "ru");`;
if (!mobile.includes(oldExpectations)) throw new Error("mobile saved locale expectations not found");
mobile = mobile.replace(oldExpectations, newExpectations);
const insertBefore = '\ntest("Hermes Connect clean mobile entry restores the previously selected Russian locale and the full language list remains usable"';
const firstIndex = mobile.indexOf(insertBefore);
if (firstIndex < 0) throw new Error("mobile persistence test insertion anchor not found");
const freshTest = `\ntest("Hermes Connect first clean mobile entry remains English when no language was selected before", async ({ page }) => {\n  await page.setViewportSize({ width: 390, height: 600 });\n  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));\n  await page.route("**/api/internal-ai/status", (route) => route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ success: false }) }));\n\n  await page.goto("/services/hermes-connect/");\n  await expect(page).toHaveURL(/\\/services\\/hermes-connect\\/$/);\n  await expect(page.locator("html")).toHaveAttribute("lang", "en");\n});\n`;
mobile = mobile.slice(0, firstIndex) + freshTest + mobile.slice(firstIndex);
fs.writeFileSync(mobileTest, mobile);

console.log("HERMES_CONNECT_RU_PERSISTENCE_PATCH=OK");
