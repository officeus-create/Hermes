(() => {
  const LOCALES = new Set(["en", "uk", "ru", "es", "it", "fr"]);
  const LANGUAGE_CODES = { en: "EN", uk: "UA", ru: "RU", es: "ES", it: "IT", fr: "FR" };
  const SIGNAL_COPY = {
    en: {
      label: "How Hermes turns a signal into action",
      items: [
        ["1 · Capture the signal", "A request, message, or change enters one shared context.", "Hermes preserves the meaning of the request instead of creating another disconnected notification."],
        ["2 · Connect the context", "Hermes connects role, data, permissions, and the next step.", "The system prepares an action so a person can see why it is being suggested."],
        ["3 · Move work forward", "A person gets a clear action or reviewable automation.", "No magic black box: the next step stays visible and controlled."],
      ],
    },
    ru: {
      label: "Как Hermes превращает сигнал в действие",
      items: [
        ["1 · Зафиксировать сигнал", "Запрос, сообщение или изменение попадает в единый контекст.", "Hermes сохраняет смысл запроса, а не просто ещё одно уведомление."],
        ["2 · Связать контекст", "Hermes сопоставляет роль, данные, разрешения и следующий шаг.", "Система подготавливает действие так, чтобы человек видел, почему оно предлагается."],
        ["3 · Двинуть работу дальше", "Человек получает понятное действие или проверяемую автоматизацию.", "Никакой магии: следующий шаг остаётся видимым и контролируемым."],
      ],
    },
  };

  const currentLocale = () => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested && LOCALES.has(requested)) return requested;
    const htmlLocale = (document.documentElement.lang || "en").toLowerCase();
    return LOCALES.has(htmlLocale) ? htmlLocale : "en";
  };

  const ensureCompactLanguageCodeStyles = () => {
    if (document.getElementById("hermes-compact-language-code-style")) return;
    const style = document.createElement("style");
    style.id = "hermes-compact-language-code-style";
    style.textContent = `
      .language-menu summary span[data-hc-language-code],
      .mobile-language-switcher strong[data-hc-language-code] { font-size: 0 !important; }
      .language-menu summary span[data-hc-language-code]::after,
      .mobile-language-switcher strong[data-hc-language-code]::after {
        content: attr(data-hc-language-code);
        font-size: .78rem;
        font-weight: 800;
        letter-spacing: .08em;
      }
    `;
    document.head.append(style);
  };

  const syncLanguageUi = () => {
    const locale = currentLocale();
    const code = LANGUAGE_CODES[locale] || locale.toUpperCase();
    ensureCompactLanguageCodeStyles();
    document.querySelectorAll("[data-language-menu]").forEach((menu) => {
      const label = menu.querySelector("summary span");
      if (label instanceof HTMLElement) label.dataset.hcLanguageCode = code;
      menu.querySelectorAll("a[lang]").forEach((link) => {
        if (!(link instanceof HTMLAnchorElement)) return;
        const target = link.getAttribute("lang") || "en";
        if (target === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });
    document.querySelectorAll(".mobile-language-switcher").forEach((switcher) => {
      const label = switcher.querySelector("strong");
      if (label instanceof HTMLElement) label.dataset.hcLanguageCode = code;
      switcher.querySelectorAll("a[lang]").forEach((link) => {
        const target = link.getAttribute("lang") || "en";
        if (target === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });
  };

  const routeGlobalConnectLaunchersToHub = () => {
    document.querySelectorAll('[data-hermes-connect-launcher="header"], [data-hermes-connect-launcher="mobile"]').forEach((launcher) => {
      if (!(launcher instanceof HTMLAnchorElement)) return;
      const current = new URL(launcher.href, window.location.origin);
      const locale = currentLocale();
      current.pathname = "/services/hermes-connect/";
      if (locale === "en") current.searchParams.delete("lang");
      else current.searchParams.set("lang", locale);
      launcher.href = `${current.pathname}${current.search}${current.hash}`;
    });
  };

  const createBouncingI = () => {
    const wrapper = document.createElement("span");
    wrapper.className = "hermes-bouncing-i";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.innerHTML = "<span>ı</span><i></i>";
    return wrapper;
  };

  const addSparseAiMotion = () => {
    const hubCopy = document.querySelector(".hc-brand-page .hc-copy");
    if (!(hubCopy instanceof HTMLElement) || hubCopy.querySelector(".hermes-ai-motion-mark")) return;
    const mark = document.createElement("span");
    mark.className = "hermes-ai-motion-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.append(document.createTextNode("A"), createBouncingI());
    const heading = hubCopy.querySelector("h1");
    if (heading) heading.insertAdjacentElement("afterend", mark);
  };

  const activateProductHubSignals = () => {
    const signalList = document.querySelector(".hc-brand-page .hc-signal-list");
    if (!signalList) return;
    signalList.removeAttribute("aria-hidden");
    const localized = SIGNAL_COPY[currentLocale()];
    if (localized) signalList.setAttribute("aria-label", localized.label);

    const cards = Array.from(signalList.children).filter((node) => node instanceof HTMLElement);
    cards.forEach((card, index) => {
      if (!(card instanceof HTMLElement)) return;
      const item = localized?.items[index];
      const strong = card.querySelector("strong");
      const small = card.querySelector("small");
      if (item) {
        if (strong) strong.textContent = item[0];
        if (small) small.textContent = item[1];
        if (!card.querySelector(".hc-signal-extra")) {
          const extra = document.createElement("span");
          extra.className = "hc-signal-extra";
          extra.textContent = item[2];
          card.append(extra);
        }
      }
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      card.setAttribute("aria-label", strong?.textContent?.trim() || `Step ${index + 1}`);
      const activate = () => cards.forEach((candidate) => candidate.setAttribute("aria-expanded", String(candidate === card)));
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  };

  const activateKnotPointer = () => {
    const stage = document.querySelector(".hc-brand-page .hc-knot-stage");
    const knot = stage?.querySelector(".hc-knot");
    if (!(stage instanceof HTMLElement) || !(knot instanceof HTMLElement)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 22;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 18;
      knot.style.setProperty("--hc-knot-x", `${x.toFixed(1)}px`);
      knot.style.setProperty("--hc-knot-y", `${y.toFixed(1)}px`);
    });
    stage.addEventListener("pointerleave", () => {
      knot.style.setProperty("--hc-knot-x", "0px");
      knot.style.setProperty("--hc-knot-y", "0px");
    });
  };

  const markProductHubLocale = () => {
    const root = document.querySelector(".hc-brand-page");
    if (root instanceof HTMLElement) root.dataset.hcHubLocale = currentLocale();
  };

  const activateRepairWorkspaceResilience = () => {
    if (window.location.pathname !== "/services/hermes-connect/repair-shops/dashboard/") return;
    const alertBox = document.getElementById("workspace-alert");
    if (!(alertBox instanceof HTMLElement) || alertBox.dataset.hcResilienceBound === "true") return;
    alertBox.dataset.hcResilienceBound = "true";

    const locale = currentLocale();
    const copy = locale === "ru"
      ? {
          offlineTitle: "Нет соединения",
          offlineBody: "Сохранённые данные остаются на экране. Действия, которым нужен Hermes, будут доступны после восстановления связи.",
          restoredTitle: "Соединение восстановлено",
          restoredBody: "Если какой-то блок выглядит устаревшим, обновите кабинет.",
          retry: "Повторить",
          servicesTitle: "Сервисы временно недоступны",
          servicesBody: "Не удалось загрузить сервисы. Остальные доступные разделы кабинета продолжают работать.",
          bookingsTitle: "Записи временно недоступны",
          bookingsBody: "Не удалось загрузить записи. Остальные доступные разделы кабинета продолжают работать.",
          feedbackTitle: "Отзывы временно недоступны",
          feedbackBody: "Не удалось загрузить отзывы. Остальные доступные разделы кабинета продолжают работать.",
        }
      : locale === "uk"
        ? {
            offlineTitle: "Немає з’єднання",
            offlineBody: "Збережені дані залишаються на екрані. Дії, яким потрібен Hermes, відновляться після повернення мережі.",
            restoredTitle: "З’єднання відновлено",
            restoredBody: "Якщо якийсь блок виглядає застарілим, оновіть кабінет.",
            retry: "Повторити",
            servicesTitle: "Сервіси тимчасово недоступні",
            servicesBody: "Не вдалося завантажити сервіси. Інші доступні розділи кабінету продовжують працювати.",
            bookingsTitle: "Записи тимчасово недоступні",
            bookingsBody: "Не вдалося завантажити записи. Інші доступні розділи кабінету продовжують працювати.",
            feedbackTitle: "Відгуки тимчасово недоступні",
            feedbackBody: "Не вдалося завантажити відгуки. Інші доступні розділи кабінету продовжують працювати.",
          }
        : {
            offlineTitle: "You’re offline",
            offlineBody: "Saved data stays on screen. Actions that need Hermes will resume when your connection returns.",
            restoredTitle: "Connection restored",
            restoredBody: "If any section looks stale, refresh the workspace.",
            retry: "Try again",
            servicesTitle: "Services are temporarily unavailable",
            servicesBody: "Unable to load services right now. Other available workspace sections remain usable.",
            bookingsTitle: "Bookings are temporarily unavailable",
            bookingsBody: "Unable to load bookings right now. Other available workspace sections remain usable.",
            feedbackTitle: "Feedback is temporarily unavailable",
            feedbackBody: "Unable to load feedback right now. Other available workspace sections remain usable.",
          };

    if (!document.getElementById("hc-repair-resilience-style")) {
      const style = document.createElement("style");
      style.id = "hc-repair-resilience-style";
      style.textContent = `
        .hc-workspace-connectivity,.hc-workspace-recovery{margin-top:18px;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:6px}
        .hc-workspace-connectivity{border:1px solid rgba(255,196,92,.3);background:rgba(125,82,10,.16);color:#f6e8c5}
        .hc-workspace-connectivity.is-restored{border-color:rgba(96,230,166,.24);background:rgba(32,156,101,.12);color:#c9f4dd}
        .hc-workspace-recovery{border:1px solid rgba(255,108,108,.24);background:rgba(171,53,53,.1);color:#ffd2d2}
        .hc-workspace-connectivity span,.hc-workspace-recovery span{color:inherit;opacity:.82;line-height:1.5}
        .hc-workspace-recovery button{align-self:flex-start;min-height:44px;margin-top:4px}
        .hc-workspace-connectivity.hidden,.hc-workspace-recovery.hidden{display:none!important}
      `;
      document.head.append(style);
    }

    const connectivity = document.createElement("div");
    connectivity.id = "hc-workspace-connectivity";
    connectivity.className = "hc-workspace-connectivity hidden";
    connectivity.setAttribute("role", "status");
    connectivity.setAttribute("aria-live", "polite");
    const connectivityTitle = document.createElement("strong");
    const connectivityBody = document.createElement("span");
    connectivity.append(connectivityTitle, connectivityBody);
    alertBox.insertAdjacentElement("afterend", connectivity);

    let restoreTimer = 0;
    const syncConnectivity = () => {
      window.clearTimeout(restoreTimer);
      if (navigator.onLine === false) {
        connectivity.classList.remove("hidden", "is-restored");
        connectivityTitle.textContent = copy.offlineTitle;
        connectivityBody.textContent = copy.offlineBody;
        return;
      }
      if (connectivity.classList.contains("hidden")) return;
      connectivity.classList.add("is-restored");
      connectivityTitle.textContent = copy.restoredTitle;
      connectivityBody.textContent = copy.restoredBody;
      restoreTimer = window.setTimeout(() => connectivity.classList.add("hidden"), 3200);
    };

    const sections = [
      { key: "services", title: copy.servicesTitle, body: copy.servicesBody, pattern: /load services|network error while (adding|deleting) service/i },
      { key: "bookings", title: copy.bookingsTitle, body: copy.bookingsBody, pattern: /load booking inbox|network error while changing booking status/i },
      { key: "feedback", title: copy.feedbackTitle, body: copy.feedbackBody, pattern: /load private feedback|network error while saving private feedback/i },
    ];

    const recoveryCards = new Map();
    for (const section of sections) {
      const loading = document.getElementById(`${section.key}-loading`);
      if (!(loading instanceof HTMLElement)) continue;
      const card = document.createElement("div");
      card.id = `hc-${section.key}-recovery`;
      card.className = "hc-workspace-recovery hidden";
      card.setAttribute("role", "alert");
      const title = document.createElement("strong");
      title.textContent = section.title;
      const detail = document.createElement("span");
      detail.dataset.hcRecoveryDetail = section.key;
      detail.textContent = section.body;
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "secondary-btn";
      retry.textContent = copy.retry;
      retry.dataset.hcRetrySection = section.key;
      retry.addEventListener("click", () => window.location.reload());
      card.append(title, detail, retry);
      loading.insertAdjacentElement("afterend", card);
      recoveryCards.set(section.key, card);

      const successNodes = [document.getElementById(`${section.key}-empty`), document.getElementById(`${section.key}-list`)].filter((node) => node instanceof HTMLElement);
      const syncSectionState = () => {
        const hasVisibleSuccess = successNodes.some((node) => node instanceof HTMLElement && !node.classList.contains("hidden"));
        if (hasVisibleSuccess) {
          card.classList.add("hidden");
          return;
        }
        if (loading.classList.contains("hidden")) card.classList.remove("hidden");
      };
      const stateObserver = new MutationObserver(syncSectionState);
      stateObserver.observe(loading, { attributes: true, attributeFilter: ["class"] });
      successNodes.forEach((node) => stateObserver.observe(node, { attributes: true, attributeFilter: ["class"] }));
      queueMicrotask(syncSectionState);
    }

    const syncAlert = () => {
      const message = (alertBox.textContent || "").trim();
      if (!message || alertBox.classList.contains("hidden") || alertBox.classList.contains("success")) return;
      for (const section of sections) {
        if (!section.pattern.test(message)) continue;
        const card = recoveryCards.get(section.key);
        if (!(card instanceof HTMLElement)) continue;
        const detail = card.querySelector(`[data-hc-recovery-detail="${section.key}"]`);
        if (detail instanceof HTMLElement) detail.textContent = message;
        card.classList.remove("hidden");
      }
    };

    const alertObserver = new MutationObserver(syncAlert);
    alertObserver.observe(alertBox, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("offline", syncConnectivity);
    window.addEventListener("online", syncConnectivity);
    syncConnectivity();
    syncAlert();
  };

  const initialize = () => {
    syncLanguageUi();
    routeGlobalConnectLaunchersToHub();
    markProductHubLocale();
    addSparseAiMotion();
    activateProductHubSignals();
    activateKnotPointer();
    activateRepairWorkspaceResilience();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
  window.setTimeout(syncLanguageUi, 80);
})();