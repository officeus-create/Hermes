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
      const next = localizeRepairHref(anchor.getAttribute("href"));
      if (next) anchor.setAttribute("href", next);
    }

    if (path === `${ROOT}/dashboard`) {
      const openLink = document.getElementById("open-link-btn");
      if (openLink instanceof HTMLAnchorElement) {
        const next = localizeRepairHref(openLink.getAttribute("href"));
        if (next) openLink.setAttribute("href", next);
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

  function installAccessibilityGuards() {
    if (document.getElementById("hc-repair-owner-p0-current-style")) return;
    const style = document.createElement("style");
    style.id = "hc-repair-owner-p0-current-style";
    style.textContent = `
      @media (max-width: 760px) {
        .workspace-page :is(button,a,input,select,textarea),
        .availability-page :is(button,a,input,select,textarea),
        .customers-page :is(button,a,input,select,textarea) { min-height: 44px; }
        .workspace-page,.availability-page,.customers-page { overflow-x: hidden; }
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
    attributeFilter: ["href", "class"],
  });
})();
