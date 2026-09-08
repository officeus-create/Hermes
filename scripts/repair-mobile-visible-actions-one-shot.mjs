import fs from "node:fs";

const navPath = "src/components/RepairShopOwnerNavEnhancer.astro";
const discountPath = "public/repair-shop-driver-discount.js";
const testPath = "tests/repair-shop-owner-clickability.spec.ts";

let nav = fs.readFileSync(navPath, "utf8");
let discount = fs.readFileSync(discountPath, "utf8");
let test = fs.readFileSync(testPath, "utf8");

const replaceAllExact = (source, before, after, label, expectedMin = 1) => {
  const count = source.split(before).length - 1;
  if (count < expectedMin) throw new Error(`${label}: expected at least ${expectedMin} match(es), found ${count}`);
  return source.split(before).join(after);
};
const replaceExact = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`${label}: marker not found`);
  return source.replace(before, after);
};

const localePairs = [
  ['feedback:"Feedback", settings:"Company"', 'feedback:"Feedback", discount:"Driver discount", settings:"Company"'],
  ['feedback:"Отзывы", settings:"Компания"', 'feedback:"Отзывы", discount:"Скидка водителям", settings:"Компания"'],
  ['feedback:"Відгуки", settings:"Компанія"', 'feedback:"Відгуки", discount:"Знижка водіям", settings:"Компанія"'],
  ['feedback:"Comentarios", settings:"Empresa"', 'feedback:"Comentarios", discount:"Descuento conductores", settings:"Empresa"'],
  ['feedback:"Feedback", settings:"Azienda"', 'feedback:"Feedback", discount:"Sconto autisti", settings:"Azienda"'],
  ['feedback:"Avis", settings:"Entreprise"', 'feedback:"Avis", discount:"Remise conducteurs", settings:"Entreprise"'],
];
for (const [before, after] of localePairs) nav = replaceAllExact(nav, before, after, `locale copy ${before}`, 2);

nav = replaceExact(
  nav,
  '  settings: \'<svg viewBox="0 0 24 24"',
  '  discount: \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.8-1-2-1.5-3.5-1.5-2 0-3.5 1-3.5 2.5 0 1.4 1.1 2.1 3.4 2.6 2.4.6 3.6 1.3 3.6 2.9 0 1.7-1.5 3-3.8 3-1.7 0-3.1-.6-4.2-1.8M12 5v14"/></svg>\',\n  settings: \'<svg viewBox="0 0 24 24"',
  "discount icon",
);

nav = replaceExact(
  nav,
  '  { label:copy.feedback, href:withLocale(`${repairShopRoot}/dashboard/`, "#feedback-title"), active:false, icon:"message" },\n  { label:copy.settings, href:withLocale(`${repairShopRoot}/settings/`), active:normalizedPath === `${repairShopRoot}/settings`, icon:"settings" },',
  '  { label:copy.feedback, href:withLocale(`${repairShopRoot}/dashboard/`, "#feedback-title"), active:false, icon:"message" },\n  { label:copy.discount, href:withLocale(`${repairShopRoot}/dashboard/`, "#driver-discount"), active:false, icon:"discount" },\n  { label:copy.settings, href:withLocale(`${repairShopRoot}/settings/`), active:normalizedPath === `${repairShopRoot}/settings`, icon:"settings" },',
  "sidebar discount item",
);

nav = replaceAllExact(
  nav,
  'const navKeys = ["today", "appointments", "customers", "vehicles", "services", "availability", "feedback", "settings"];',
  'const navKeys = ["today", "appointments", "customers", "vehicles", "services", "availability", "feedback", "discount", "settings"];',
  "runtime nav keys",
  1,
);

nav = replaceExact(
  nav,
  '    </header>\n  </div>\n)}',
  '    </header>\n    <nav class="repair-crm-mobile-quick" aria-label="Quick owner actions">\n      <a href={withLocale(`${repairShopRoot}/services/`)}>{copy.services}</a>\n      <a href={withLocale(`${repairShopRoot}/availability/`)}>{copy.availability}</a>\n      <a href={withLocale(`${repairShopRoot}/settings/`)} data-quick-highlight>{copy.settings}</a>\n      <a href={withLocale(`${repairShopRoot}/dashboard/`, "#driver-discount")} data-quick-highlight>{copy.discount}</a>\n    </nav>\n  </div>\n)}',
  "mobile quick navigation markup",
);

nav = replaceExact(
  nav,
  '  .repair-crm-mobile-logout{display:none;width:100%;min-height:44px;margin-top:6px;padding:0 11px;border:0;border-radius:10px;background:transparent;color:#7a3441;text-align:left;font:inherit;font-size:13px;font-weight:780;cursor:pointer}',
  '  .repair-crm-mobile-logout{display:none;width:100%;min-height:44px;margin-top:6px;padding:0 11px;border:0;border-radius:10px;background:transparent;color:#7a3441;text-align:left;font:inherit;font-size:13px;font-weight:780;cursor:pointer}\n  .repair-crm-mobile-quick{display:none}',
  "quick navigation base style",
);

nav = replaceExact(
  nav,
  '  @media(max-width:760px){',
  '  @media(max-width:760px){.repair-crm-mobile-quick{position:fixed;top:64px;left:0;right:0;z-index:1200;display:flex;align-items:center;gap:8px;height:48px;box-sizing:border-box;padding:6px 10px;border-bottom:1px solid #e4e8ee;background:rgba(255,255,255,.97);overflow-x:auto;pointer-events:auto;scrollbar-width:none}.repair-crm-mobile-quick::-webkit-scrollbar{display:none}.repair-crm-mobile-quick a{display:inline-flex;align-items:center;flex:0 0 auto;min-height:34px;padding:0 11px;border:1px solid #e3e8ef;border-radius:999px;background:#fff;color:#354052;text-decoration:none;font-size:11px;font-weight:820;white-space:nowrap}.repair-crm-mobile-quick a[data-quick-highlight]{border-color:#bfe1cc;background:#eff9f2;color:#215c38}',
  "quick navigation mobile style",
);
nav = replaceExact(nav, 'padding-top:76px!important', 'padding-top:124px!important', "mobile content offset");


discount = replaceExact(
  discount,
  '      .hc-driver-discount-owner{margin-top:24px;',
  '      .hc-driver-discount-owner{scroll-margin-top:132px;margin-top:24px;',
  "driver discount scroll margin",
);
discount = replaceExact(
  discount,
  '    panel.className = "panel hc-driver-discount-owner";\n    panel.dataset.driverDiscountOwner = "true";',
  '    panel.className = "panel hc-driver-discount-owner";\n    panel.id = "driver-discount";\n    panel.dataset.driverDiscountOwner = "true";',
  "driver discount anchor id",
);
discount = replaceExact(
  discount,
  '    anchor.insertAdjacentElement("afterend", panel);',
  '    anchor.insertAdjacentElement("afterend", panel);\n    if (window.location.hash === "#driver-discount") requestAnimationFrame(() => panel.scrollIntoView({ block: "start" }));',
  "driver discount deep link scroll",
);


test = replaceExact(
  test,
  '  await expect(page.locator(\'a[href="#"]:visible\')).toHaveCount(0);',
  '  await expect(page.locator(\'a[href="#"]:visible\')).toHaveCount(0);\n\n  const mobileQuickNav = page.locator(".repair-crm-mobile-quick");\n  await expect(mobileQuickNav).toBeVisible();\n  await expect(mobileQuickNav.locator(\'a[href*="/services/hermes-connect/repair-shops/settings/"]\')).toBeVisible();\n  const quickDiscount = mobileQuickNav.locator(\'a[href*="#driver-discount"]\');\n  await expect(quickDiscount).toBeVisible();\n  await quickDiscount.click();\n  await expect(page.locator("#driver-discount")).toBeVisible();',
  "mobile quick navigation regression",
);

fs.writeFileSync(navPath, nav);
fs.writeFileSync(discountPath, discount);
fs.writeFileSync(testPath, test);
console.log("Prepared visible mobile owner actions and Driver Discount deep link.");
