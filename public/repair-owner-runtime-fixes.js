(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  const ownerRoutes = new Set([
    `${ROOT}/dashboard`, `${ROOT}/appointments`, `${ROOT}/availability`, `${ROOT}/customers`,
    `${ROOT}/vehicles`, `${ROOT}/services`, `${ROOT}/settings`, `${ROOT}/team`, `${ROOT}/schedule`,
    `${ROOT}/company`, `${ROOT}/driver-benefits`, `${ROOT}/preferences`,
  ]);
  if (!ownerRoutes.has(path)) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const params = new URLSearchParams(window.location.search);
  const explicit = (params.get("lang") || "").toLowerCase();
  let stored = "";
  try { stored = (window.localStorage.getItem("hermes-connect-language") || "").toLowerCase(); } catch {}
  const documentLocale = (document.documentElement.lang || "").toLowerCase();
  const locale = supported.has(explicit) ? explicit : supported.has(stored) ? stored : supported.has(documentLocale) ? documentLocale : "en";
  document.documentElement.lang = locale;
  try { window.localStorage.setItem("hermes-connect-language", locale); } catch {}

  const copy = {
    en: { context: "Owner workspace", overview: "Overview", dashboard: "Dashboard", appointments: "Bookings", customers: "Customers", vehicles: "Vehicles", services: "Services", availability: "Schedule", team: "Team", schedule: "Schedule", company: "Company", benefits: "Driver Benefits", preferences: "Settings", feedback: "Feedback", discount: "Driver Benefits", settings: "Company", products: "Product Hub", logout: "Logout" },
    ru: { context: "Кабинет владельца", overview: "Обзор", dashboard: "Обзор", appointments: "Записи", customers: "Клиенты", vehicles: "Автомобили", services: "Услуги", availability: "График", team: "Команда", schedule: "График", company: "Компания", benefits: "Льготы водителям", preferences: "Настройки", feedback: "Отзывы", discount: "Льготы водителям", settings: "Компания", products: "Все продукты", logout: "Выйти" },
    uk: { context: "Кабінет власника", overview: "Огляд", dashboard: "Огляд", appointments: "Записи", customers: "Клієнти", vehicles: "Автомобілі", services: "Послуги", availability: "Графік", team: "Команда", schedule: "Графік", company: "Компанія", benefits: "Пільги водіям", preferences: "Налаштування", feedback: "Відгуки", discount: "Пільги водіям", settings: "Компанія", products: "Усі продукти", logout: "Вийти" },
    es: { context: "Espacio del propietario", overview: "Resumen", dashboard: "Panel", appointments: "Reservas", customers: "Clientes", vehicles: "Vehículos", services: "Servicios", availability: "Horario", team: "Equipo", schedule: "Horario", company: "Empresa", benefits: "Beneficios", preferences: "Ajustes", feedback: "Comentarios", discount: "Beneficios", settings: "Empresa", products: "Productos", logout: "Salir" },
    it: { context: "Spazio proprietario", overview: "Panoramica", dashboard: "Dashboard", appointments: "Prenotazioni", customers: "Clienti", vehicles: "Veicoli", services: "Servizi", availability: "Orari", team: "Team", schedule: "Orari", company: "Azienda", benefits: "Vantaggi autisti", preferences: "Impostazioni", feedback: "Feedback", discount: "Vantaggi autisti", settings: "Azienda", products: "Prodotti", logout: "Esci" },
    fr: { context: "Espace propriétaire", overview: "Aperçu", dashboard: "Tableau de bord", appointments: "Réservations", customers: "Clients", vehicles: "Véhicules", services: "Services", availability: "Planning", team: "Équipe", schedule: "Planning", company: "Entreprise", benefits: "Avantages conducteurs", preferences: "Réglages", feedback: "Avis", discount: "Avantages conducteurs", settings: "Entreprise", products: "Produits", logout: "Déconnexion" },
  }[locale];

  const routeLabels = {
    [`${ROOT}/dashboard`]: copy.dashboard || copy.overview,
    [`${ROOT}/appointments`]: copy.appointments,
    [`${ROOT}/customers`]: copy.customers,
    [`${ROOT}/vehicles`]: copy.vehicles,
    [`${ROOT}/services`]: copy.services,
    [`${ROOT}/availability`]: copy.availability,
    [`${ROOT}/team`]: copy.team,
    [`${ROOT}/schedule`]: copy.schedule,
    [`${ROOT}/company`]: copy.company,
    [`${ROOT}/driver-benefits`]: copy.benefits,
    [`${ROOT}/preferences`]: copy.preferences,
    [`${ROOT}/settings`]: copy.settings,
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && node.textContent !== value) node.textContent = value;
  };
  const labelForHref = (href) => {
    const url = new URL(href, window.location.origin);
    const normalized = url.pathname.replace(/\/+$/, "");
    if (url.hash === "#feedback-title") return copy.feedback;
    if (url.hash === "#driver-discount") return copy.discount;
    return routeLabels[normalized] || null;
  };

  const localizeOwnerShell = () => {
    document.querySelectorAll(".repair-crm-nav-item, .repair-crm-mobile-quick a").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const label = labelForHref(link.href);
      if (!label) return;
      const target = link.classList.contains("repair-crm-nav-item") ? link.querySelector("span:last-child") : link.querySelector("small");
      if (target && target.textContent !== label) target.textContent = label;
    });
    setText(".repair-crm-context small", copy.context);
    setText(".repair-crm-context strong", routeLabels[path] || copy.dashboard || copy.overview);
    setText(".repair-crm-product-hub span:last-child", copy.products);
    document.querySelectorAll("[data-repair-crm-logout]").forEach((button) => { if (button.textContent !== copy.logout) button.textContent = copy.logout; });
    const summary = document.querySelector(".repair-crm-language summary");
    if (summary) summary.textContent = locale.toUpperCase();

    document.querySelectorAll(".repair-crm-language a[lang]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const target = (link.getAttribute("lang") || "en").toLowerCase();
      if (!supported.has(target)) return;
      const next = new URL(window.location.href);
      if (target === "en") next.searchParams.delete("lang"); else next.searchParams.set("lang", target);
      link.href = `${next.pathname}${next.search}${next.hash}`;
      if (link.dataset.localeBound === "true") return;
      link.dataset.localeBound = "true";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        try { window.localStorage.setItem("hermes-connect-language", target); } catch {}
        window.location.assign(link.href);
      });
    });
  };

  const dateLocale = { en:"en-US", ru:"ru-RU", uk:"uk-UA", es:"es-ES", it:"it-IT", fr:"fr-FR" }[locale] || "en-US";
  const updateContextTitle = () => {
    const dateNode = document.querySelector("[data-repair-crm-date]");
    const timeNode = document.querySelector("[data-repair-crm-time]");
    const now = new Date();
    const dateValue = new Intl.DateTimeFormat(dateLocale, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(now);
    const timeValue = new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit" }).format(now);
    if (dateNode && dateNode.textContent !== dateValue) dateNode.textContent = dateValue;
    if (timeNode && timeNode.textContent !== timeValue) timeNode.textContent = timeValue;
    const title = document.querySelector(".repair-crm-context strong");
    const routeTitle = routeLabels[path] || copy.dashboard || copy.overview;
    if (title && title.textContent !== routeTitle) title.textContent = routeTitle;
  };

  const installPolish = () => {
    if (document.getElementById("hc-owner-requested-polish")) return;
    const style = document.createElement("style");
    style.id = "hc-owner-requested-polish";
    style.textContent = `
      html.hc-repair-design4 body .workspace-page,html.hc-repair-design4 body .workspace-page *{box-sizing:border-box!important}
      html.hc-repair-design4 body .workspace-page .shell{max-width:100%!important}
      html.hc-repair-design4 body .workspace-page .shell>*{min-width:0!important;max-width:100%!important}
      html.hc-repair-crm .hc-capacity-control{grid-template-columns:minmax(0,1fr) max-content!important;align-items:end!important;gap:16px!important}
      html.hc-repair-crm .hc-capacity-control form{display:grid!important;grid-template-columns:104px max-content!important;align-items:end!important;gap:10px!important}
      html.hc-repair-crm .hc-capacity-control label{min-width:0!important}
      html.hc-repair-crm .hc-capacity-control select{width:104px!important;min-width:104px!important;min-height:42px!important;height:42px!important;padding:0 12px!important;font-size:14px!important}
      html.hc-repair-crm .hc-capacity-control .secondary-btn{width:auto!important;min-width:0!important;min-height:42px!important;height:42px!important;padding:0 16px!important;border-radius:10px!important;font-size:13px!important;line-height:1!important;white-space:nowrap!important}
      html.hc-repair-crm .hc-driver-discount-v2>.panel-heading{display:grid!important;grid-template-columns:46px minmax(0,1fr)!important;grid-template-rows:auto auto!important;column-gap:14px!important;row-gap:4px!important;align-items:center!important;padding:18px 20px!important}
      html.hc-repair-crm .hc-driver-discount-v2>.panel-heading .hc-driver-discount-dollar{grid-row:1/3!important;align-self:center!important}
      html.hc-repair-crm .hc-driver-discount-v2>.panel-heading h2,html.hc-repair-crm .hc-driver-discount-v2>.panel-heading strong{margin:0!important;min-width:0!important}
      html.hc-repair-crm .hc-driver-discount-v2>.panel-heading p{margin:0!important;max-width:720px!important;font-size:13px!important;line-height:1.45!important}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-form{padding:18px 20px 20px!important}
      @media(max-width:720px){html.hc-repair-crm .hc-capacity-control{grid-template-columns:1fr!important}html.hc-repair-crm .hc-capacity-control form{grid-template-columns:minmax(92px,120px) 1fr!important}html.hc-repair-crm .hc-capacity-control .secondary-btn{width:100%!important}html.hc-repair-crm .hc-driver-discount-v2>.panel-heading{grid-template-columns:40px minmax(0,1fr)!important;padding:16px!important}.hc-driver-discount-v2>.panel-heading .hc-driver-discount-dollar{width:40px!important;height:40px!important;flex-basis:40px!important}}
    `;
    document.head.append(style);
  };

  const init = () => {
    localizeOwnerShell();
    updateContextTitle();
    installPolish();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  window.setTimeout(init, 250);
  window.setTimeout(init, 1000);
  window.setInterval(updateContextTitle, 60000);
})();