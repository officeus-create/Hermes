(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const ownerPaths = new Set([`${ROOT}/dashboard`, `${ROOT}/availability`, `${ROOT}/customers`]);
  if (!ownerPaths.has(path)) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";

  const safeFallback = {
    en: "We could not complete that request. Please try again.",
    ru: "Не удалось выполнить запрос. Попробуйте ещё раз.",
    uk: "Не вдалося виконати запит. Спробуйте ще раз.",
    es: "No se pudo completar la solicitud. Inténtalo de nuevo.",
    it: "Non è stato possibile completare la richiesta. Riprova.",
    fr: "Impossible de terminer la demande. Réessayez.",
  };

  const todayCopy = {
    en: { eyebrow: "Today", title: "What needs attention now", today: "Today’s bookings", active: "Active", services: "Services", next: "Next appointment", none: "No upcoming booking", ready: "Profile ready", waiting: "Loading live workspace…" },
    ru: { eyebrow: "Сегодня", title: "Что требует внимания сейчас", today: "Записи сегодня", active: "Активные", services: "Услуги", next: "Следующая запись", none: "Нет предстоящих записей", ready: "Профиль готов", waiting: "Загружаем рабочие данные…" },
    uk: { eyebrow: "Сьогодні", title: "Що потребує уваги зараз", today: "Записи сьогодні", active: "Активні", services: "Послуги", next: "Наступний запис", none: "Немає майбутніх записів", ready: "Профіль готовий", waiting: "Завантажуємо робочі дані…" },
    es: { eyebrow: "Hoy", title: "Lo que necesita atención ahora", today: "Reservas de hoy", active: "Activas", services: "Servicios", next: "Próxima cita", none: "No hay reservas próximas", ready: "Perfil listo", waiting: "Cargando datos operativos…" },
    it: { eyebrow: "Oggi", title: "Cosa richiede attenzione ora", today: "Prenotazioni di oggi", active: "Attive", services: "Servizi", next: "Prossimo appuntamento", none: "Nessuna prenotazione futura", ready: "Profilo pronto", waiting: "Caricamento dati operativi…" },
    fr: { eyebrow: "Aujourd’hui", title: "Ce qui demande votre attention", today: "Réservations du jour", active: "Actives", services: "Services", next: "Prochain rendez-vous", none: "Aucune réservation à venir", ready: "Profil prêt", waiting: "Chargement des données opérationnelles…" },
  };

  const technicalErrors = new Set([
    "database_not_configured",
    "invalid_server_response",
    "shop_profile_required",
    "internal_error",
    "service_context_unavailable",
    "schema_initialization_failed",
  ]);

  function localizeRepairHref(value) {
    if (!value) return value;
    let url;
    try {
      url = new URL(value, window.location.origin);
    } catch {
      return value;
    }
    if (url.origin !== window.location.origin || !url.pathname.startsWith(ROOT)) return value;
    if (locale === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function preserveOwnerLocale() {
    for (const anchor of document.querySelectorAll(`a[href^="${ROOT}"]`)) {
      const current = anchor.getAttribute("href");
      const next = localizeRepairHref(current);
      if (next && next !== current) anchor.setAttribute("href", next);
    }

    if (path === `${ROOT}/dashboard`) {
      const openLink = document.getElementById("open-link-btn");
      if (openLink instanceof HTMLAnchorElement) {
        const current = openLink.getAttribute("href");
        const next = localizeRepairHref(current);
        if (next && next !== current) openLink.setAttribute("href", next);
      }
    }
  }

  function sanitizeAlert(node) {
    if (!(node instanceof HTMLElement)) return;
    const text = (node.textContent || "").trim();
    if (!text) return;
    if (technicalErrors.has(text) || /^[a-z0-9]+(?:_[a-z0-9]+){1,5}$/i.test(text)) {
      node.textContent = safeFallback[locale] || safeFallback.en;
    }
  }

  function sanitizeVisibleErrors() {
    for (const id of ["workspace-alert", "availability-alert", "page-alert"]) {
      sanitizeAlert(document.getElementById(id));
    }
  }

  function setText(node, value) {
    if (node instanceof HTMLElement && node.textContent !== value) node.textContent = value;
  }

  function shopTodayIso() {
    const timezone = document.getElementById("shop-timezone");
    const timeZone = timezone instanceof HTMLSelectElement && timezone.value ? timezone.value : undefined;
    try {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      return `${values.year}-${values.month}-${values.day}`;
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function ensureTodayOverview() {
    if (path !== `${ROOT}/dashboard`) return null;
    const header = document.querySelector(".workspace-page .workspace-header");
    if (!(header instanceof HTMLElement)) return null;

    let section = document.querySelector("[data-hc-today-overview]");
    if (section instanceof HTMLElement) return section;

    const copy = todayCopy[locale] || todayCopy.en;
    section = document.createElement("section");
    section.className = "hc-today-overview";
    section.setAttribute("data-hc-today-overview", "true");
    section.setAttribute("aria-labelledby", "hc-today-title");
    section.innerHTML = `
      <div class="hc-today-head">
        <div><p class="eyebrow">${copy.eyebrow}</p><h2 id="hc-today-title">${copy.title}</h2></div>
        <span class="hc-today-ready" data-hc-today-ready>${copy.waiting}</span>
      </div>
      <div class="hc-today-grid">
        <article><span>${copy.today}</span><strong data-hc-today-bookings>0</strong></article>
        <article><span>${copy.active}</span><strong data-hc-active-bookings>0</strong></article>
        <article><span>${copy.services}</span><strong data-hc-service-total>—</strong></article>
        <article class="hc-today-next"><span>${copy.next}</span><strong data-hc-next-booking>${copy.none}</strong></article>
      </div>`;
    header.insertAdjacentElement("afterend", section);
    return section;
  }

  function updateTodayOverview() {
    const section = ensureTodayOverview();
    if (!(section instanceof HTMLElement)) return;
    const copy = todayCopy[locale] || todayCopy.en;
    const today = shopTodayIso();
    const cards = [...document.querySelectorAll("#bookings-list .booking-card")].filter((node) => node instanceof HTMLElement);
    const todayCards = cards.filter((card) => (card.querySelector(".booking-when")?.textContent || "").trim().startsWith(today));
    const activeCards = cards.filter((card) => {
      const select = card.querySelector(".status-select");
      const value = select instanceof HTMLSelectElement ? select.value : "";
      return value === "confirmed" || value === "in_progress";
    });
    const upcoming = cards.find((card) => {
      const select = card.querySelector(".status-select");
      const value = select instanceof HTMLSelectElement ? select.value : "";
      return value === "confirmed" || value === "in_progress";
    });
    const nextText = (upcoming?.querySelector(".booking-when")?.textContent || "").trim() || copy.none;
    const serviceCount = (document.getElementById("service-count")?.textContent || "").match(/^\d+/)?.[0] || "—";
    const profileReady = (document.getElementById("profile-state")?.textContent || "").trim().toLowerCase() === "saved";

    setText(section.querySelector("[data-hc-today-bookings]"), String(todayCards.length));
    setText(section.querySelector("[data-hc-active-bookings]"), String(activeCards.length));
    setText(section.querySelector("[data-hc-service-total]"), serviceCount);
    setText(section.querySelector("[data-hc-next-booking]"), nextText);
    if (profileReady) setText(section.querySelector("[data-hc-today-ready]"), copy.ready);
  }

  function installAccessibilityGuards() {
    if (document.getElementById("hc-repair-owner-p0-current-style")) return;
    const style = document.createElement("style");
    style.id = "hc-repair-owner-p0-current-style";
    style.textContent = `
      .workspace-page .hc-today-overview {
        margin: 0 0 18px;
        padding: 20px;
        border: 1px solid rgba(18,24,38,.10);
        border-radius: 20px;
        background: rgba(255,255,255,.94);
        box-shadow: 0 16px 44px rgba(31,38,54,.08);
      }
      .workspace-page .hc-today-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; }
      .workspace-page .hc-today-head h2 { margin:0; color:#182033; }
      .workspace-page .hc-today-ready { padding:7px 10px; border-radius:999px; color:#25775e; background:#effaf5; border:1px solid rgba(40,180,135,.20); font-size:12px; font-weight:800; }
      .workspace-page .hc-today-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:16px; }
      .workspace-page .hc-today-grid article { min-width:0; padding:14px; border:1px solid rgba(18,24,38,.08); border-radius:14px; background:#f8f7f3; }
      .workspace-page .hc-today-grid span { display:block; color:#667085; font-size:12px; font-weight:750; }
      .workspace-page .hc-today-grid strong { display:block; margin-top:6px; color:#111827; font-size:24px; line-height:1.1; overflow-wrap:anywhere; }
      .workspace-page .hc-today-next strong { font-size:13px; line-height:1.4; }
      @media (max-width: 760px) {
        .workspace-page :is(button,a,input,select,textarea),
        .availability-page :is(button,a,input,select,textarea),
        .customers-page :is(button,a,input,select,textarea) { min-height: 44px; }
        .workspace-page,.availability-page,.customers-page { overflow-x: hidden; }
        .workspace-page .hc-today-head { display:block; }
        .workspace-page .hc-today-ready { display:inline-flex; margin-top:10px; }
        .workspace-page .hc-today-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
      @media (max-width: 430px) {
        .workspace-page .hc-today-grid { grid-template-columns:1fr; }
      }
      @media (prefers-reduced-motion: reduce) {
        .workspace-page,.workspace-page *,
        .availability-page,.availability-page *,
        .customers-page,.customers-page * {
          scroll-behavior: auto !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    preserveOwnerLocale();
    sanitizeVisibleErrors();
    installAccessibilityGuards();
    updateTodayOverview();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(apply);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["href", "class", "value"],
  });
})();
