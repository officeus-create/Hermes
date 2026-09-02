(() => {
  const LOCALES = new Set(["en", "uk", "ru", "es", "it", "fr"]);
  const LANGUAGE_CODES = { en: "EN", uk: "UA", ru: "RU", es: "ES", it: "IT", fr: "FR" };

  const currentLocale = () => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested && LOCALES.has(requested)) return requested;
    const htmlLocale = (document.documentElement.lang || "en").toLowerCase();
    return LOCALES.has(htmlLocale) ? htmlLocale : "en";
  };

  const syncLanguageUi = () => {
    const locale = currentLocale();
    const code = LANGUAGE_CODES[locale] || locale.toUpperCase();

    document.querySelectorAll("[data-language-menu]").forEach((menu) => {
      const label = menu.querySelector("summary span");
      if (label) label.textContent = code;
      menu.querySelectorAll("a[lang]").forEach((link) => {
        if (!(link instanceof HTMLAnchorElement)) return;
        const target = link.getAttribute("lang") || "en";
        if (target === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });

    document.querySelectorAll(".mobile-language-switcher").forEach((switcher) => {
      const label = switcher.querySelector("strong");
      if (label) label.textContent = code;
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

  const decorateAiPhrase = (root) => {
    if (!(root instanceof HTMLElement) || root.dataset.aiMotionApplied === "true") return;
    const text = root.textContent || "";
    const index = text.indexOf("AI");
    if (index < 0) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = node.nodeValue || "";
      const localIndex = value.indexOf("AI");
      if (localIndex >= 0 && node.parentElement && !node.parentElement.closest(".hermes-bouncing-i")) {
        const before = document.createTextNode(value.slice(0, localIndex) + "A");
        const after = document.createTextNode(value.slice(localIndex + 2));
        const bouncingI = createBouncingI();
        const fragment = document.createDocumentFragment();
        fragment.append(before, bouncingI, after);
        node.parentNode?.replaceChild(fragment, node);
        root.dataset.aiMotionApplied = "true";
        return;
      }
      node = walker.nextNode();
    }
  };

  const addSparseAiMotion = () => {
    /* Use the original bouncing-I language only on high-signal phrases. */
    const aiHeadings = Array.from(document.querySelectorAll("main h1, main h2"))
      .filter((node) => /\bAI\b/.test(node.textContent || ""))
      .slice(0, 2);
    aiHeadings.forEach(decorateAiPhrase);

    const detailHero = document.querySelector(".detail-page .detail-hero-content");
    if (detailHero && !detailHero.querySelector(".hermes-ai-motion-mark")) {
      const mark = document.createElement("span");
      mark.className = "hermes-ai-motion-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.append(document.createTextNode("A"), createBouncingI());
      const primary = detailHero.querySelector(".button");
      if (primary) detailHero.insertBefore(mark, primary);
      else detailHero.append(mark);
    }
  };

  const activateProductHubSignals = () => {
    const signalList = document.querySelector(".hc-brand-page .hc-signal-list");
    if (!signalList) return;
    signalList.removeAttribute("aria-hidden");
    signalList.setAttribute("aria-label", currentLocale() === "ru" ? "Как Hermes превращает сигнал в действие" : "How Hermes turns a signal into action");

    const locale = currentLocale();
    const copy = locale === "ru"
      ? [
          ["1 · Зафиксировать сигнал", "Запрос, сообщение или изменение попадает в единый контекст.", "Hermes сохраняет смысл запроса, а не просто ещё одно уведомление."],
          ["2 · Связать контекст", "Hermes сопоставляет роль, данные, разрешения и следующий шаг.", "Система подготавливает действие так, чтобы человек видел, почему оно предлагается."],
          ["3 · Двинуть работу дальше", "Человек получает понятное действие или проверяемую автоматизацию.", "Никакой магии: следующий шаг остаётся видимым и контролируемым."],
        ]
      : [
          ["1 · Capture the signal", "A request, message, or change enters one shared context.", "Hermes preserves the meaning of the request instead of creating another disconnected notification."],
          ["2 · Connect the context", "Hermes connects role, data, permissions, and the next step.", "The system prepares an action so a person can see why it is being suggested."],
          ["3 · Move work forward", "A person gets a clear action or reviewable automation.", "No magic black box: the next step stays visible and controlled."],
        ];

    const cards = Array.from(signalList.children).filter((node) => node instanceof HTMLElement);
    cards.forEach((card, index) => {
      const item = copy[index];
      if (!item || !(card instanceof HTMLElement)) return;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      card.setAttribute("aria-label", item[0]);
      const strong = card.querySelector("strong");
      const small = card.querySelector("small");
      if (strong) strong.textContent = item[0];
      if (small) small.textContent = item[1];
      if (!card.querySelector(".hc-signal-extra")) {
        const extra = document.createElement("span");
        extra.className = "hc-signal-extra";
        extra.textContent = item[2];
        card.append(extra);
      }

      const activate = () => {
        cards.forEach((candidate) => candidate.setAttribute("aria-expanded", String(candidate === card)));
      };
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

  const addTechnologyChannelProof = () => {
    const channelMap = document.querySelector(".technology-channel-map");
    if (!channelMap || channelMap.querySelector(".technology-channel-proof")) return;
    const proof = document.createElement("div");
    proof.className = "technology-channel-proof";
    proof.setAttribute("aria-label", "Verified Hermes delivery examples");
    proof.innerHTML = `
      <article>
        <small>Live delivery</small>
        <strong>One corporate front door across four Hermes directions.</strong>
        <p>Responsive public journeys, multilingual foundations, browser QA, and controlled release checks are already implemented on this site.</p>
      </article>
      <article>
        <small>Working operations pattern</small>
        <strong>Controlled CRM intake before records are written.</strong>
        <p>Duplicate checks, review queues, routing previews, and approval boundaries are used as a reusable operating pattern.</p>
      </article>
      <article>
        <small>Product evidence</small>
        <strong>Hermes Connect links customer-facing and owner workflows.</strong>
        <p>Repair Shops is the current public live vertical; Academy and Beauty have bounded private surfaces. External channels still depend on official platform access.</p>
      </article>`;
    channelMap.append(proof);
  };

  const markProductHubLocale = () => {
    const root = document.querySelector(".hc-brand-page");
    if (!(root instanceof HTMLElement)) return;
    root.dataset.hcHubLocale = currentLocale();
  };

  const initialize = () => {
    syncLanguageUi();
    routeGlobalConnectLaunchersToHub();
    markProductHubLocale();
    addSparseAiMotion();
    activateProductHubSignals();
    activateKnotPointer();
    addTechnologyChannelProof();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();

  /* Hermes Connect has another locale runtime; re-sync after it finishes its DOM pass. */
  window.setTimeout(syncLanguageUi, 80);
})();
