(() => {
  const ukrainianLabels = {
    "Secondary discovery layer":"Додатковий каталог",
    "International businesses":"Міжнародні компанії",
    "Indexable for useful local discovery, intentionally secondary to the U.S. catalog.":"Сторінки для місцевого пошуку, що доповнюють каталог компаній США.",
    "View profile":"Переглянути профіль",
    "Free international discovery profile":"Безкоштовний міжнародний профіль",
    "Hermes client":"Клієнт Hermes",
    "Claimed":"Підтверджено власником",
    "Unclaimed":"Не підтверджено власником",
    "Business facts":"Відомості про компанію",
    "Phone":"Телефон",
    "Website":"Вебсайт",
    "Hours":"Години роботи",
    "Current source-described scope":"Послуги за відкритими джерелами",
    "Featured program / offer":"Основна програма / пропозиція",
    "Official program page ↗":"Офіційна сторінка програми ↗",
    "Public channels":"Публічні канали",
    "Evidence / relationship state":"Докази / статус співпраці",
    "What this page proves — and what it does not.":"Що підтверджує ця сторінка — і чого не підтверджує",
    "Relationship":"Співпраця",
    "Catalog priority":"Пріоритет каталогу",
    "Evidence reference":"Джерело доказів",
    "Needs owner confirmation":"Потрібне підтвердження власника",
    "How this profile works":"Як працює цей профіль",
    "FAQ":"Поширені запитання",
    "Hermes growth path":"Можливості розвитку з Hermes",
    "From free discovery profile to an operating business system":"Від безкоштовного профілю до системи управління бізнесом",
    "Claim the profile, verify facts, then activate only the modules this business needs: CRM, bookings or requests, customer history, website, local SEO/GEO, reviews and automation.":"Підтвердьте профіль і дані, а потім підключіть потрібні модулі: CRM, заявки чи записи, історію клієнтів, сайт, локальне SEO/GEO, відгуки та автоматизацію.",
    "Open CRM preview":"Переглянути CRM",
    "Claim / verify":"Підтвердити профіль",
    "SEO / GEO":"SEO / GEO",
    "Publicly observed":"Публічно перевірено",
    "Public source ↗":"Публічне джерело ↗",
    "How to read these profiles":"Як користуватися цими профілями",
    "Open profile →":"Переглянути профіль →",
    "Secondary":"Додатковий",
    "CLIENT STRATEGY · CANONICAL":"СТРАТЕГІЯ КЛІЄНТА · ОСНОВНА",
    "CRM attribution model":"Модель атрибуції CRM",
    "published profiles":"опублікованих профілів",
    "catalog priority":"пріоритет каталогу",
    "← International businesses":"← Міжнародні компанії",
    "← Hermes Catalog":"← Каталог Hermes"
  };
  const render = () => {
    const locale = new URLSearchParams(window.location.search).get("lang") === "uk" ? "uk" : "en";
    const roots = document.querySelectorAll("[data-catalog-uk-en]");
    if (!roots.length) return;
    document.documentElement.lang = locale;
    roots.forEach(root => {
      root.querySelectorAll("[data-uk][data-en]").forEach(element => {
        const value = element.getAttribute("data-" + locale);
        if (value !== null) element.textContent = value;
      });
      if (locale === "uk" && root.getAttribute("data-title-uk")) document.title = root.getAttribute("data-title-uk");
    });
    roots.forEach(root => {
      root.querySelectorAll("h1,h2,h3,p,dt,dd,a,span,strong,small,summary,b,li").forEach(element => {
        if (element.childElementCount || element.hasAttribute("data-uk") || element.hasAttribute("data-en")) return;
        const original = element.getAttribute("data-catalog-static-en") || element.textContent.trim();
        if (!Object.prototype.hasOwnProperty.call(ukrainianLabels, original)) return;
        element.setAttribute("data-catalog-static-en", original);
        element.textContent = locale === "uk" ? ukrainianLabels[original] : original;
      });
    });
    const menu = document.querySelector("[data-language-menu]");
    if (menu) {
      const summary = menu.querySelector("summary");
      if (summary) {
        summary.setAttribute("aria-label", "Language: " + (locale === "uk" ? "Українська" : "English"));
        const label = summary.querySelector("span");
        if (label) label.textContent = locale === "uk" ? "Українська" : "English";
      }
      menu.querySelectorAll("a[lang]").forEach(link => {
        if (link.getAttribute("lang") === locale) link.setAttribute("aria-current","page");
        else link.removeAttribute("aria-current");
      });
    }
    const academy = document.querySelector("[data-catalog-academy-registration]");
    if (academy) {
      const url = new URL(academy.getAttribute("href"),window.location.origin);
      url.searchParams.set("lang",locale);
      academy.setAttribute("href",url.pathname+url.search+url.hash);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",render,{once:true});
  else render();
})();
