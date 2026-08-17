(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en";
  const locale = supported.has(requested) ? requested : "en";

  const copy = {
    en: {
      accessTitle: "Your Hermes Connect access", accessLoading: "Checking access…",
      states: { trialing: "Free launch access", founding: "Founding Shop", active: "Active", past_due: "Payment due", cancelled: "Cancelled", comped: "Complimentary" },
      plan: "View Founding Plan", billing: "Contact billing", renew: "Continue access",
      quickTitle: "Quick start", quickBody: "Add common services with one tap. You can edit or delete them later.",
      oil: "Oil change", diagnostics: "Diagnostics", brakes: "Brake inspection", added: "Added",
      share: "Share", shareTitle: "Book my repair shop", shareGuide: "Use this same booking link on your website, Google Business Profile, SMS/WhatsApp, social profiles, or printed materials.",
      weekday: "Use Mon–Fri · 8:00 AM–5:00 PM", weekdayNote: "Weekday hours filled in. Review them, then press Save weekly availability.",
      feedbackTitle: "First completed job — what was confusing or missing?", feedbackCta: "Send quick feedback", dismiss: "Not now",
      email: "Email", call: "Call", text: "Text", reminder: "Customer contact",
      bookAgain: "Book another service", shareShop: "Share this shop"
    },
    ru: {
      accessTitle: "Ваш доступ Hermes Connect", accessLoading: "Проверяем доступ…",
      states: { trialing: "Бесплатный стартовый доступ", founding: "Founding Shop", active: "Активен", past_due: "Нужна оплата", cancelled: "Отменён", comped: "Бесплатный доступ" },
      plan: "Посмотреть Founding Plan", billing: "Связаться по оплате", renew: "Продолжить доступ",
      quickTitle: "Быстрый старт", quickBody: "Добавьте частые услуги одним нажатием. Потом их можно изменить или удалить.",
      oil: "Замена масла", diagnostics: "Диагностика", brakes: "Проверка тормозов", added: "Добавлено",
      share: "Поделиться", shareTitle: "Запись в моё СТО", shareGuide: "Используйте эту же ссылку на сайте, в Google Business Profile, SMS/WhatsApp, соцсетях и печатных материалах.",
      weekday: "Пн–Пт · 8:00–17:00", weekdayNote: "Будние часы заполнены. Проверьте их и нажмите «Сохранить расписание».",
      feedbackTitle: "Первая работа завершена — что было непонятно или чего не хватило?", feedbackCta: "Оставить быстрый отзыв", dismiss: "Не сейчас",
      email: "Email", call: "Позвонить", text: "SMS", reminder: "Связаться с клиентом",
      bookAgain: "Записаться ещё раз", shareShop: "Поделиться СТО"
    },
    uk: {
      accessTitle: "Ваш доступ Hermes Connect", accessLoading: "Перевіряємо доступ…",
      states: { trialing: "Безкоштовний стартовий доступ", founding: "Founding Shop", active: "Активний", past_due: "Потрібна оплата", cancelled: "Скасований", comped: "Безкоштовний доступ" },
      plan: "Переглянути Founding Plan", billing: "Зв’язатися щодо оплати", renew: "Продовжити доступ",
      quickTitle: "Швидкий старт", quickBody: "Додайте популярні послуги одним натисканням. Потім їх можна змінити або видалити.",
      oil: "Заміна оливи", diagnostics: "Діагностика", brakes: "Перевірка гальм", added: "Додано",
      share: "Поділитися", shareTitle: "Запис до мого СТО", shareGuide: "Використовуйте це саме посилання на сайті, у Google Business Profile, SMS/WhatsApp, соцмережах і друкованих матеріалах.",
      weekday: "Пн–Пт · 8:00–17:00", weekdayNote: "Будні години заповнені. Перевірте їх і натисніть збереження розкладу.",
      feedbackTitle: "Перша робота завершена — що було незрозуміло або чого бракувало?", feedbackCta: "Залишити швидкий відгук", dismiss: "Не зараз",
      email: "Email", call: "Подзвонити", text: "SMS", reminder: "Зв’язок із клієнтом",
      bookAgain: "Записатися ще раз", shareShop: "Поділитися СТО"
    },
    es: {
      accessTitle: "Tu acceso a Hermes Connect", accessLoading: "Comprobando acceso…",
      states: { trialing: "Acceso gratuito de lanzamiento", founding: "Founding Shop", active: "Activo", past_due: "Pago pendiente", cancelled: "Cancelado", comped: "Cortesía" },
      plan: "Ver Founding Plan", billing: "Contactar facturación", renew: "Continuar acceso",
      quickTitle: "Inicio rápido", quickBody: "Añade servicios comunes con un toque. Podrás editarlos o eliminarlos después.",
      oil: "Cambio de aceite", diagnostics: "Diagnóstico", brakes: "Inspección de frenos", added: "Añadido",
      share: "Compartir", shareTitle: "Reserva en mi taller", shareGuide: "Usa el mismo enlace en tu web, Google Business Profile, SMS/WhatsApp, redes sociales o material impreso.",
      weekday: "Lun–Vie · 8:00–17:00", weekdayNote: "Horario de lunes a viernes completado. Revísalo y pulsa Guardar.",
      feedbackTitle: "Primer trabajo completado — ¿qué fue confuso o faltó?", feedbackCta: "Enviar comentario", dismiss: "Ahora no",
      email: "Email", call: "Llamar", text: "SMS", reminder: "Contactar cliente",
      bookAgain: "Reservar otro servicio", shareShop: "Compartir taller"
    },
    it: {
      accessTitle: "Il tuo accesso Hermes Connect", accessLoading: "Verifica accesso…",
      states: { trialing: "Accesso gratuito di lancio", founding: "Founding Shop", active: "Attivo", past_due: "Pagamento dovuto", cancelled: "Annullato", comped: "Omaggio" },
      plan: "Vedi Founding Plan", billing: "Contatta fatturazione", renew: "Continua accesso",
      quickTitle: "Avvio rapido", quickBody: "Aggiungi i servizi comuni con un tocco. Potrai modificarli o eliminarli in seguito.",
      oil: "Cambio olio", diagnostics: "Diagnostica", brakes: "Controllo freni", added: "Aggiunto",
      share: "Condividi", shareTitle: "Prenota nella mia officina", shareGuide: "Usa lo stesso link sul sito, Google Business Profile, SMS/WhatsApp, social o materiali stampati.",
      weekday: "Lun–Ven · 8:00–17:00", weekdayNote: "Orari feriali compilati. Controllali e premi Salva.",
      feedbackTitle: "Primo lavoro completato — cosa era poco chiaro o mancava?", feedbackCta: "Invia feedback", dismiss: "Non ora",
      email: "Email", call: "Chiama", text: "SMS", reminder: "Contatta cliente",
      bookAgain: "Prenota un altro servizio", shareShop: "Condividi officina"
    },
    fr: {
      accessTitle: "Votre accès Hermes Connect", accessLoading: "Vérification de l’accès…",
      states: { trialing: "Accès de lancement gratuit", founding: "Founding Shop", active: "Actif", past_due: "Paiement dû", cancelled: "Annulé", comped: "Offert" },
      plan: "Voir Founding Plan", billing: "Contacter la facturation", renew: "Continuer l’accès",
      quickTitle: "Démarrage rapide", quickBody: "Ajoutez les services courants en un geste. Vous pourrez les modifier ou les supprimer ensuite.",
      oil: "Vidange", diagnostics: "Diagnostic", brakes: "Contrôle des freins", added: "Ajouté",
      share: "Partager", shareTitle: "Réserver dans mon atelier", shareGuide: "Utilisez le même lien sur votre site, Google Business Profile, SMS/WhatsApp, réseaux sociaux ou supports imprimés.",
      weekday: "Lun–Ven · 8:00–17:00", weekdayNote: "Les horaires de semaine sont remplis. Vérifiez-les puis enregistrez.",
      feedbackTitle: "Premier travail terminé — qu’est-ce qui était confus ou manquant ?", feedbackCta: "Envoyer un avis", dismiss: "Plus tard",
      email: "Email", call: "Appeler", text: "SMS", reminder: "Contacter le client",
      bookAgain: "Réserver un autre service", shareShop: "Partager l’atelier"
    }
  }[locale];

  const withLocale = (href) => {
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang"); else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const emit = (event, detail = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, product: "repair_shops", ...detail });
  };

  const button = (text, className = "secondary-btn") => {
    const el = document.createElement("button"); el.type = "button"; el.className = className; el.textContent = text; return el;
  };

  async function initDashboard() {
    const header = document.querySelector(".workspace-header");
    if (!header) return;

    // Access state: persisted in D1, never inferred from localStorage.
    const accessCard = document.createElement("section");
    accessCard.className = "panel hc-web-v1-access";
    accessCard.dataset.webV1Access = "true";
    accessCard.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">Access</p><h2>${copy.accessTitle}</h2><p class="muted" data-web-v1-access-copy>${copy.accessLoading}</p></div><span class="pill" data-web-v1-access-state>…</span></div><div data-web-v1-access-action></div>`;
    header.insertAdjacentElement("afterend", accessCard);
    try {
      const response = await fetch("/api/repair-shop/access", { credentials: "same-origin" });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success && data.access) {
        const state = String(data.access.state || "trialing");
        const stateNode = accessCard.querySelector("[data-web-v1-access-state]");
        const copyNode = accessCard.querySelector("[data-web-v1-access-copy]");
        if (stateNode) stateNode.textContent = copy.states[state] || state;
        if (copyNode) copyNode.textContent = data.access.current_period_end ? `${data.access.plan_name || "Founding Shop Plan"} · through ${data.access.current_period_end}` : (data.access.plan_name || "Founding Shop Plan");
        if (["trialing", "past_due", "cancelled"].includes(state)) {
          const action = document.createElement("a");
          action.className = "primary-btn hc-web-v1-access-cta";
          action.href = withLocale(`${ROOT}/plan/`);
          action.textContent = state === "past_due" ? copy.billing : state === "cancelled" ? copy.renew : copy.plan;
          action.addEventListener("click", () => emit("connect_shop_plan_view", { source: "access_card" }));
          accessCard.querySelector("[data-web-v1-access-action]")?.append(action);
        }
      } else {
        accessCard.remove();
      }
    } catch { accessCard.remove(); }

    // Service presets reuse the existing service form and its existing POST handler.
    const serviceForm = document.getElementById("service-form");
    if (serviceForm && !document.querySelector("[data-web-v1-service-presets]")) {
      const presets = document.createElement("div");
      presets.className = "hc-web-v1-presets";
      presets.dataset.webV1ServicePresets = "true";
      presets.innerHTML = `<div><strong>${copy.quickTitle}</strong><span>${copy.quickBody}</span></div><div class="hc-web-v1-preset-actions"></div>`;
      const definitions = [
        { id: "oil_change", name: copy.oil, duration: "30" },
        { id: "diagnostics", name: copy.diagnostics, duration: "45" },
        { id: "brake_inspection", name: copy.brakes, duration: "45" },
      ];
      const actions = presets.querySelector(".hc-web-v1-preset-actions");
      for (const preset of definitions) {
        const item = button(`${preset.name} · ${preset.duration} min`);
        item.dataset.presetId = preset.id;
        item.addEventListener("click", () => {
          const name = document.getElementById("service-name");
          const duration = document.getElementById("service-duration");
          if (!(name instanceof HTMLInputElement) || !(duration instanceof HTMLSelectElement)) return;
          name.value = preset.name; duration.value = preset.duration;
          emit("connect_shop_service_preset_used", { preset_id: preset.id });
          serviceForm.requestSubmit();
        });
        actions?.append(item);
      }
      serviceForm.insertAdjacentElement("beforebegin", presets);

      const refreshPresets = () => {
        const countText = document.getElementById("service-count")?.textContent || "0";
        const count = Number.parseInt(countText, 10) || 0;
        const existing = new Set(Array.from(document.querySelectorAll("#services-list .row strong")).map((n) => (n.textContent || "").trim().toLowerCase()));
        presets.querySelectorAll("button[data-preset-id]").forEach((el) => {
          const btn = el;
          const def = definitions.find((d) => d.id === btn.dataset.presetId);
          const already = def ? existing.has(def.name.toLowerCase()) : false;
          btn.disabled = already;
          if (already) btn.textContent = `${def.name} · ${copy.added}`;
        });
        presets.classList.toggle("is-secondary", count >= 3);
      };
      new MutationObserver(refreshPresets).observe(document.getElementById("services-list") || serviceForm, { childList: true, subtree: true });
      const countNode = document.getElementById("service-count");
      if (countNode) new MutationObserver(refreshPresets).observe(countNode, { childList: true, subtree: true, characterData: true });
      refreshPresets();
    }

    // Share uses the canonical booking URL already produced by the owner profile.
    const linkActions = document.querySelector("#public-link-wrap .link-actions");
    const linkWrap = document.getElementById("public-link-wrap");
    if (linkActions && linkWrap && !document.querySelector("[data-web-v1-share]")) {
      const share = button(copy.share);
      share.dataset.webV1Share = "true";
      share.addEventListener("click", async () => {
        const url = document.getElementById("public-link-text")?.textContent?.trim() || "";
        if (!url) return;
        emit("connect_shop_share_link", { method: navigator.share ? "web_share" : "clipboard" });
        try {
          if (navigator.share) await navigator.share({ title: copy.shareTitle, url });
          else await navigator.clipboard.writeText(url);
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      });
      linkActions.append(share);
      const guide = document.createElement("p"); guide.className = "muted small hc-web-v1-share-guide"; guide.textContent = copy.shareGuide; linkWrap.insertAdjacentElement("afterend", guide);
    }

    // Add practical contact handoff to each rendered booking card without another messaging backend.
    const bookingsList = document.getElementById("bookings-list");
    const augmentBookings = () => {
      bookingsList?.querySelectorAll(".booking-card").forEach((card) => {
        if (card.querySelector("[data-web-v1-contact]")) return;
        const customerLine = card.querySelector("p.muted.small")?.textContent || "";
        const parts = customerLine.split(" · ");
        if (parts.length < 3) return;
        const email = parts[1].trim();
        const phone = parts.slice(2).join(" · ").trim();
        const actions = document.createElement("div"); actions.className = "hc-web-v1-contact"; actions.dataset.webV1Contact = "true";
        const label = document.createElement("span"); label.className = "mini-label"; label.textContent = copy.reminder; actions.append(label);
        const emailLink = document.createElement("a"); emailLink.className="secondary-btn"; emailLink.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Your repair appointment")}`; emailLink.textContent=copy.email;
        const callLink = document.createElement("a"); callLink.className="secondary-btn"; callLink.href=`tel:${phone.replace(/[^+\d]/g, "")}`; callLink.textContent=copy.call;
        const textLink = document.createElement("a"); textLink.className="secondary-btn"; textLink.href=`sms:${phone.replace(/[^+\d]/g, "")}`; textLink.textContent=copy.text;
        actions.append(emailLink, callLink, textLink); card.append(actions);
      });

      const hasCompleted = Boolean(bookingsList?.querySelector(".status-completed"));
      if (hasCompleted && !document.querySelector("[data-web-v1-feedback-nudge]") && !sessionStorage.getItem("hc-repair-completed-feedback-dismissed")) {
        const feedbackTitle = document.getElementById("feedback-title");
        const feedbackPanel = feedbackTitle?.closest(".panel");
        if (feedbackPanel) {
          const nudge = document.createElement("section"); nudge.className="hc-web-v1-feedback-nudge"; nudge.dataset.webV1FeedbackNudge="true";
          const text = document.createElement("strong"); text.textContent=copy.feedbackTitle;
          const actions = document.createElement("div");
          const go = button(copy.feedbackCta, "primary-btn");
          go.addEventListener("click", () => { emit("connect_shop_feedback_nudge_open"); feedbackPanel.scrollIntoView({ behavior:"smooth", block:"start" }); setTimeout(() => document.getElementById("feedback-message")?.focus(), 350); });
          const dismiss = button(copy.dismiss); dismiss.addEventListener("click", () => { sessionStorage.setItem("hc-repair-completed-feedback-dismissed","1"); nudge.remove(); });
          actions.append(go,dismiss); nudge.append(text,actions); feedbackPanel.insertAdjacentElement("beforebegin",nudge);
        }
      }
    };
    if (bookingsList) { new MutationObserver(augmentBookings).observe(bookingsList,{childList:true,subtree:true}); augmentBookings(); }
  }

  function initAvailability() {
    const form = document.getElementById("availability-form");
    if (!form || document.querySelector("[data-web-v1-weekday]")) return;
    const quick = button(copy.weekday, "secondary-btn"); quick.dataset.webV1Weekday="true";
    quick.addEventListener("click", () => {
      let changed = 0;
      for (const day of [1,2,3,4,5,6,0]) {
        const row = document.querySelector(`.day-row[data-day="${day}"]`);
        if (!row) continue;
        const checkbox = row.querySelector('input[type="checkbox"]');
        const times = row.querySelectorAll('input[type="time"]');
        if (!(checkbox instanceof HTMLInputElement) || times.length < 2) continue;
        const open = day >= 1 && day <= 5;
        checkbox.checked = open;
        if (times[0] instanceof HTMLInputElement) { times[0].value="08:00"; times[0].disabled=!open; }
        if (times[1] instanceof HTMLInputElement) { times[1].value="17:00"; times[1].disabled=!open; }
        changed++;
      }
      if (!changed) return;
      emit("connect_shop_weekday_hours_preset_used");
      const alert = document.getElementById("availability-alert");
      if (alert) { alert.textContent=copy.weekdayNote; alert.className="alert success"; }
    });
    form.insertAdjacentElement("beforebegin",quick);
  }

  function initBooking() {
    const success = document.getElementById("success-panel");
    if (!success || document.querySelector("[data-web-v1-book-again]")) return;
    const actions = document.createElement("div"); actions.className="hc-web-v1-success-actions";
    const again = button(copy.bookAgain, "primary-btn"); again.dataset.webV1BookAgain="true";
    again.addEventListener("click", () => {
      emit("connect_repeat_booking", { source: "booking_confirmation" });
      success.classList.add("hidden");
      document.getElementById("booking-panel")?.classList.remove("hidden");
      const service = document.getElementById("service-select"); const date = document.getElementById("date-select"); const time = document.getElementById("time-select");
      if (service instanceof HTMLSelectElement) service.value="";
      if (date instanceof HTMLSelectElement) { date.value=""; date.disabled=false; }
      if (time instanceof HTMLSelectElement) { time.value=""; time.disabled=true; }
      document.getElementById("booking-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
    const share = button(copy.shareShop);
    share.addEventListener("click", async () => {
      const url = window.location.href;
      try { if (navigator.share) await navigator.share({title:copy.shareTitle,url}); else await navigator.clipboard.writeText(url); } catch (error) { if (!(error && error.name === "AbortError")) return; }
    });
    actions.append(again,share); success.append(actions);
  }

  const style = document.createElement("style");
  style.textContent = `
    .hc-web-v1-access{margin-top:0!important}.hc-web-v1-access-cta{margin-top:14px}.hc-web-v1-presets{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:16px 0;padding:14px;border:1px solid rgba(124,92,255,.18);border-radius:14px;background:rgba(124,92,255,.055)}.hc-web-v1-presets>div:first-child{display:flex;flex-direction:column;gap:4px}.hc-web-v1-presets>div:first-child span{color:#9ea5b4;font-size:12px}.hc-web-v1-preset-actions,.hc-web-v1-success-actions,.hc-web-v1-contact{display:flex;gap:8px;flex-wrap:wrap}.hc-web-v1-presets.is-secondary{opacity:.72}.hc-web-v1-share-guide{margin:8px 2px 0!important}.hc-web-v1-feedback-nudge{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:18px;padding:16px 18px;border:1px solid rgba(95,231,164,.2);border-radius:16px;background:rgba(28,130,85,.09);color:#dff7ea}.hc-web-v1-feedback-nudge>div{display:flex;gap:8px;flex-wrap:wrap}.hc-web-v1-contact{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);align-items:center}.hc-web-v1-contact .mini-label{width:100%;margin-bottom:0}.hc-web-v1-contact a{font-size:12px;padding:8px 10px}.hc-web-v1-success-actions{justify-content:center;margin-top:18px}[data-web-v1-weekday]{margin:0 0 14px;min-height:44px}
    @media(max-width:720px){.hc-web-v1-presets,.hc-web-v1-feedback-nudge{display:block}.hc-web-v1-preset-actions,.hc-web-v1-feedback-nudge>div{margin-top:12px}.hc-web-v1-preset-actions button,.hc-web-v1-feedback-nudge button,.hc-web-v1-success-actions button{min-height:44px;flex:1}.hc-web-v1-access-cta{width:100%;box-sizing:border-box}.hc-web-v1-contact a{min-height:44px;flex:1}}
  `;
  document.head.append(style);

  if (path === `${ROOT}/dashboard`) initDashboard();
  else if (path === `${ROOT}/availability`) initAvailability();
  else if (path === `${ROOT}/booking`) initBooking();
})();
