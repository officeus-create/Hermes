(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const strings = {
    en: { scheduleKicker:"BOOKING SCHEDULE · LIVE", scheduleTitle:"Upcoming service", scheduleEmpty:"No customer bookings are in the inbox yet.", customersKicker:"RECENT CUSTOMERS · LIVE", customersTitle:"Customer activity", customersEmpty:"Customer activity will appear after the first real booking.", crm:"Open customer CRM ↗", opportunityKicker:"RECOVERABLE OPPORTUNITY · LIVE", opportunityTitle:"What can move next", cancelled:(n)=>`${n} cancelled booking${n===1?"":"s"} can be reviewed for a customer follow-up.`, completed:(n)=>`${n} completed visit${n===1?"":"s"} can now feed the next-appointment follow-up loop.`, first:"Your public booking link is ready. The next proof is the first real customer booking.", setup:"Finish profile, services and public booking readiness before Hermes claims a growth opportunity.", capacity:"Open-capacity recommendations stay hidden until real availability and appointment data can support them.", booking:"Review bookings", customer:"Customer" },
    ru: { scheduleKicker:"ГРАФИК ЗАПИСЕЙ · LIVE", scheduleTitle:"Ближайший сервис", scheduleEmpty:"В реальном inbox пока нет записей клиентов.", customersKicker:"ПОСЛЕДНИЕ КЛИЕНТЫ · LIVE", customersTitle:"Активность клиентов", customersEmpty:"Активность появится после первой реальной записи.", crm:"Открыть CRM клиентов ↗", opportunityKicker:"ВОЗВРАЩАЕМАЯ ВОЗМОЖНОСТЬ · LIVE", opportunityTitle:"Что можно улучшить следующим", cancelled:(n)=>`Отменённых записей: ${n}. Их можно проверить для follow-up клиента.`, completed:(n)=>`Завершённых визитов: ${n}. Следующий реальный шаг — follow-up и следующая запись клиента.`, first:"Публичная ссылка готова. Следующее доказательство — первая реальная запись клиента.", setup:"Сначала завершите профиль, услуги и публичную запись — до этого Hermes не будет выдумывать возможность роста.", capacity:"Рекомендации по свободной мощности скрыты, пока их нельзя подтвердить реальными availability и appointments.", booking:"Проверить записи", customer:"Клиент" },
    uk: { scheduleKicker:"ГРАФІК ЗАПИСІВ · LIVE", scheduleTitle:"Найближчий сервіс", scheduleEmpty:"У реальному inbox поки немає записів клієнтів.", customersKicker:"ОСТАННІ КЛІЄНТИ · LIVE", customersTitle:"Активність клієнтів", customersEmpty:"Активність з’явиться після першого реального запису.", crm:"Відкрити CRM клієнтів ↗", opportunityKicker:"МОЖЛИВІСТЬ ПОВЕРНЕННЯ · LIVE", opportunityTitle:"Що можна покращити далі", cancelled:(n)=>`Скасованих записів: ${n}. Їх можна перевірити для follow-up клієнта.`, completed:(n)=>`Завершених візитів: ${n}. Наступний реальний крок — follow-up і наступний запис клієнта.`, first:"Публічне посилання готове. Наступний доказ — перший реальний запис клієнта.", setup:"Спочатку завершіть профіль, послуги та публічний запис — до цього Hermes не вигадує можливість зростання.", capacity:"Рекомендації щодо вільної потужності приховані, доки їх не підтверджують реальні availability та appointments.", booking:"Перевірити записи", customer:"Клієнт" },
    es: { scheduleKicker:"AGENDA · LIVE", scheduleTitle:"Próximo servicio", scheduleEmpty:"Aún no hay reservas reales en la bandeja.", customersKicker:"CLIENTES RECIENTES · LIVE", customersTitle:"Actividad de clientes", customersEmpty:"La actividad aparecerá tras la primera reserva real.", crm:"Abrir CRM de clientes ↗", opportunityKicker:"OPORTUNIDAD RECUPERABLE · LIVE", opportunityTitle:"Qué puede avanzar ahora", cancelled:(n)=>`${n} reserva${n===1?" cancelada":"s canceladas"} puede revisarse para seguimiento.`, completed:(n)=>`${n} visita${n===1?" completada":"s completadas"} puede alimentar el próximo seguimiento.`, first:"El enlace público está listo. La siguiente prueba es la primera reserva real.", setup:"Termina perfil, servicios y reserva pública antes de que Hermes muestre una oportunidad de crecimiento.", capacity:"Las recomendaciones de capacidad quedan ocultas hasta estar respaldadas por disponibilidad y citas reales.", booking:"Revisar reservas", customer:"Cliente" },
    it: { scheduleKicker:"AGENDA · LIVE", scheduleTitle:"Prossimo servizio", scheduleEmpty:"Non ci sono ancora prenotazioni reali nell’inbox.", customersKicker:"CLIENTI RECENTI · LIVE", customersTitle:"Attività clienti", customersEmpty:"L’attività apparirà dopo la prima prenotazione reale.", crm:"Apri CRM clienti ↗", opportunityKicker:"OPPORTUNITÀ RECUPERABILE · LIVE", opportunityTitle:"Cosa può avanzare ora", cancelled:(n)=>`${n} prenotazion${n===1?"e annullata":"i annullate"} può essere rivista per follow-up.`, completed:(n)=>`${n} visit${n===1?"a completata":"e completate"} può alimentare il prossimo follow-up.`, first:"Il link pubblico è pronto. La prossima prova è la prima prenotazione reale.", setup:"Completa profilo, servizi e prenotazione pubblica prima che Hermes mostri opportunità di crescita.", capacity:"Le raccomandazioni di capacità restano nascoste finché non sono supportate da disponibilità e appuntamenti reali.", booking:"Controlla prenotazioni", customer:"Cliente" },
    fr: { scheduleKicker:"PLANNING · LIVE", scheduleTitle:"Prochain service", scheduleEmpty:"Aucune réservation réelle n’est encore dans la boîte.", customersKicker:"CLIENTS RÉCENTS · LIVE", customersTitle:"Activité clients", customersEmpty:"L’activité apparaîtra après la première réservation réelle.", crm:"Ouvrir le CRM clients ↗", opportunityKicker:"OPPORTUNITÉ RÉCUPÉRABLE · LIVE", opportunityTitle:"Ce qui peut avancer maintenant", cancelled:(n)=>`${n} réservation${n===1?" annulée":"s annulées"} peut être revue pour un suivi client.`, completed:(n)=>`${n} visite${n===1?" terminée":"s terminées"} peut alimenter le prochain suivi.`, first:"Le lien public est prêt. La prochaine preuve est la première réservation réelle.", setup:"Terminez le profil, les services et la réservation publique avant que Hermes n’affiche une opportunité de croissance.", capacity:"Les recommandations de capacité restent masquées tant que disponibilité et rendez-vous réels ne les justifient pas.", booking:"Voir les réservations", customer:"Client" },
  };
  const t = strings[locale] || strings.en;

  const withLang = (href) => locale === "en" ? href : `${href}${href.includes("?") ? "&" : "?"}lang=${encodeURIComponent(locale)}`;
  const safeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const ensureSurface = () => {
    const growth = document.querySelector(".hc-owner-live-growth");
    if (!(growth instanceof HTMLElement)) return null;
    let surface = document.querySelector("[data-hc-owner-live-activity]");
    if (surface instanceof HTMLElement) return surface;
    surface = document.createElement("section");
    surface.className = "hc-owner-live-activity-grid";
    surface.dataset.hcOwnerLiveActivity = "true";
    surface.innerHTML = `
      <article class="hc-owner-live-activity-card" data-hc-live-schedule>
        <small>${t.scheduleKicker}</small><h2>${t.scheduleTitle}</h2>
        <div class="hc-owner-live-schedule-list" data-hc-live-schedule-list><p>${t.scheduleEmpty}</p></div>
        <a href="#bookings">${t.booking} ↗</a>
      </article>
      <article class="hc-owner-live-activity-card" data-hc-live-customers>
        <small>${t.customersKicker}</small><h2>${t.customersTitle}</h2>
        <div class="hc-owner-live-customer-list" data-hc-live-customer-list><p>${t.customersEmpty}</p></div>
        <a href="${withLang(`${ROOT}/customers/`)}">${t.crm}</a>
      </article>
      <article class="hc-owner-live-activity-card is-opportunity" data-hc-live-opportunity>
        <small>${t.opportunityKicker}</small><h2>${t.opportunityTitle}</h2>
        <p data-hc-live-opportunity-copy>${t.setup}</p>
        <span>${t.capacity}</span>
      </article>
    `;
    growth.insertAdjacentElement("afterend", surface);
    return surface;
  };

  const bookingRows = () => Array.from(document.querySelectorAll("#bookings-list .booking-card")).map((card) => {
    const service = safeText(card.querySelector(".booking-top strong")?.textContent);
    const when = safeText(card.querySelector(".booking-when")?.textContent);
    const customerLine = safeText(card.querySelector("p.muted.small")?.textContent);
    const customer = customerLine.split(" · ")[0] || t.customer;
    const vehicle = safeText(card.querySelector(".vehicle-line")?.textContent);
    const status = card.querySelector(".status-pill")?.classList.contains("status-cancelled") ? "cancelled"
      : card.querySelector(".status-pill")?.classList.contains("status-completed") ? "completed"
      : card.querySelector(".status-pill")?.classList.contains("status-in_progress") ? "in_progress"
      : card.querySelector(".status-pill")?.classList.contains("status-confirmed") ? "confirmed" : "unknown";
    return { service, when, customer, vehicle, status };
  });

  const render = () => {
    if (!ensureSurface()) return;
    const rows = bookingRows();
    const schedule = document.querySelector("[data-hc-live-schedule-list]");
    if (schedule) {
      schedule.innerHTML = rows.length ? rows.slice(0,4).map((row) => `<div><span>${row.when}</span><p><strong>${row.service}</strong><small>${row.customer}${row.vehicle ? ` · ${row.vehicle}` : ""}</small></p></div>`).join("") : `<p>${t.scheduleEmpty}</p>`;
    }

    const unique = [];
    const seen = new Set();
    for (const row of rows) {
      const key = row.customer.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
      if (unique.length === 3) break;
    }
    const customers = document.querySelector("[data-hc-live-customer-list]");
    if (customers) customers.innerHTML = unique.length ? unique.map((row) => `<div><span>${row.customer.slice(0,2).toUpperCase()}</span><p><strong>${row.customer}</strong><small>${row.vehicle || row.service}</small></p></div>`).join("") : `<p>${t.customersEmpty}</p>`;

    const cancelled = rows.filter((row) => row.status === "cancelled").length;
    const completed = rows.filter((row) => row.status === "completed").length;
    const publicReady = !document.getElementById("public-link-wrap")?.classList.contains("hidden");
    const opportunity = cancelled > 0 ? t.cancelled(cancelled) : completed > 0 ? t.completed(completed) : publicReady ? t.first : t.setup;
    const copy = document.querySelector("[data-hc-live-opportunity-copy]");
    if (copy) copy.textContent = opportunity;
  };

  const install = () => {
    if (!document.querySelector('[data-hc-owner-workspace="live"]')) return false;
    render();
    const bookings = document.getElementById("bookings-list");
    if (bookings) new MutationObserver(() => queueMicrotask(render)).observe(bookings, { childList:true, subtree:true });
    const publicLink = document.getElementById("public-link-wrap");
    if (publicLink) new MutationObserver(() => queueMicrotask(render)).observe(publicLink, { attributes:true, attributeFilter:["class"] });
    window.setTimeout(render,80); window.setTimeout(render,400);
    return true;
  };

  if (install()) return;
  const observer = new MutationObserver(() => { if (install()) observer.disconnect(); });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();