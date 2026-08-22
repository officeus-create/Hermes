(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const copy = {
    en: { label:"Repeat booking", invite:"Invite customer to book again", milestones:"complete", hint:"First value is complete. Repeat booking is the next retention milestone; your plan decision is already available." },
    ru: { label:"Повторная запись", invite:"Пригласить клиента записаться снова", milestones:"готово", hint:"Первый полный цикл завершён. Повторная запись — следующий retention milestone; решение по тарифу уже доступно." },
    uk: { label:"Повторний запис", invite:"Запросити клієнта записатися знову", milestones:"готово", hint:"Перший повний цикл завершено. Повторний запис — наступний retention milestone; рішення щодо тарифу вже доступне." },
    es: { label:"Reserva repetida", invite:"Invitar al cliente a reservar de nuevo", milestones:"completo", hint:"El primer ciclo de valor está completo. La reserva repetida es el siguiente hito de retención; la decisión del plan ya está disponible." },
    it: { label:"Prenotazione ripetuta", invite:"Invita il cliente a prenotare di nuovo", milestones:"completo", hint:"Il primo ciclo di valore è completo. La prenotazione ripetuta è il prossimo traguardo di retention; la decisione sul piano è già disponibile." },
    fr: { label:"Réservation répétée", invite:"Inviter le client à réserver de nouveau", milestones:"terminé", hint:"Le premier cycle de valeur est terminé. La réservation répétée est le prochain jalon de rétention ; la décision sur le plan est déjà disponible." },
  };
  const t = copy[locale] || copy.en;

  const setText = (node, value) => {
    if (node instanceof HTMLElement && node.textContent !== value) node.textContent = value;
  };
  const setAttr = (node, name, value) => {
    if (node instanceof HTMLElement && node.getAttribute(name) !== value) node.setAttribute(name, value);
  };

  const customerKeys = () => {
    const keys = [];
    document.querySelectorAll("#bookings-list .booking-card p.muted.small").forEach((node) => {
      const parts = (node.textContent || "").split(" · ").map((value) => value.trim()).filter(Boolean);
      const email = parts.find((value) => value.includes("@"));
      const phone = parts.find((value) => /\d{7,}/.test(value.replace(/\D/g, "")));
      const key = (email || phone || "").toLowerCase();
      if (key) keys.push(key);
    });
    return keys;
  };

  const hasRepeatBooking = () => {
    const counts = new Map();
    for (const key of customerKeys()) counts.set(key, (counts.get(key) || 0) + 1);
    return Array.from(counts.values()).some((count) => count >= 2);
  };

  const bookingHref = () => {
    const publicLink = document.getElementById("open-link-btn");
    if (publicLink instanceof HTMLAnchorElement && publicLink.href) return publicLink.href;
    return locale === "en" ? `${ROOT}/booking/` : `${ROOT}/booking/?lang=${encodeURIComponent(locale)}`;
  };

  const apply = () => {
    const panel = document.querySelector("[data-repair-activation]");
    const list = panel?.querySelector(".repair-activation-steps");
    const progress = panel?.querySelector(".repair-activation-progress");
    const fill = panel?.querySelector(".repair-activation-fill");
    const actions = panel?.querySelector(".repair-activation-actions");
    if (!(panel instanceof HTMLElement) || !(list instanceof HTMLOListElement) || !(progress instanceof HTMLElement) || !(fill instanceof HTMLElement) || !(actions instanceof HTMLElement)) return;

    let repeatStep = list.querySelector("[data-repair-repeat-step]");
    if (!(repeatStep instanceof HTMLLIElement)) {
      repeatStep = document.createElement("li");
      repeatStep.className = "repair-activation-step";
      repeatStep.dataset.repairRepeatStep = "true";
      repeatStep.innerHTML = `<strong>7</strong><span></span>`;
      list.append(repeatStep);
    }

    const repeat = hasRepeatBooking();
    setAttr(repeatStep, "data-complete", String(repeat));
    setText(repeatStep.querySelector("strong"), repeat ? "✓" : "7");
    setText(repeatStep.querySelector("span"), t.label);

    const originalSteps = Array.from(list.querySelectorAll(".repair-activation-step:not([data-repair-repeat-step])"));
    const firstValueCompleted = originalSteps.filter((step) => step.getAttribute("data-complete") === "true").length;
    const completed = firstValueCompleted + (repeat ? 1 : 0);
    setText(progress, `${completed}/7 ${t.milestones}`);
    const desiredWidth = `${Math.round((completed / 7) * 100)}%`;
    if (fill.style.width !== desiredWidth) fill.style.width = desiredWidth;

    let repeatAction = actions.querySelector("[data-repair-repeat-action]");
    if (firstValueCompleted === 6 && !repeat) {
      if (!(repeatAction instanceof HTMLAnchorElement)) {
        repeatAction = document.createElement("a");
        repeatAction.className = "repair-activation-secondary";
        repeatAction.dataset.repairRepeatAction = "true";
        repeatAction.target = "_blank";
        repeatAction.rel = "noopener";
        actions.insertBefore(repeatAction, actions.querySelector(".repair-activation-next"));
      }
      const href = bookingHref();
      if (repeatAction.href !== href) repeatAction.href = href;
      setText(repeatAction, t.invite);
      setText(actions.querySelector(".repair-activation-next"), t.hint);
    } else if (repeatAction instanceof HTMLElement) {
      repeatAction.remove();
    }
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; apply(); });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once:true });
  else schedule();
  new MutationObserver(schedule).observe(document.body, { childList:true, subtree:true, characterData:true });
})();
