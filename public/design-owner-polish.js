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

  const initialize = () => {
    syncLanguageUi();
    routeGlobalConnectLaunchersToHub();
    markProductHubLocale();
    addSparseAiMotion();
    activateProductHubSignals();
    activateKnotPointer();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
  window.setTimeout(syncLanguageUi, 80);
})();
