(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (!path.startsWith(`${ROOT}/`) || path === `${ROOT}/booking`) return;

  const SUPPORTED = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = SUPPORTED.has(requested) ? requested : "en";

  const copy = {
    en: {
      auth: "Unable to complete authentication right now. Please try again.",
      dashboard: "Unable to complete this workspace action right now. Please try again.",
      availability: "Unable to update the schedule right now. Please try again.",
      customers: "Unable to load customer history right now. Please try again.",
      generic: "This Repair Shop action is temporarily unavailable. Please try again shortly.",
    },
    ru: {
      auth: "Сейчас не удалось выполнить вход или регистрацию. Попробуйте ещё раз чуть позже.",
      dashboard: "Сейчас не удалось выполнить действие в кабинете СТО. Попробуйте ещё раз чуть позже.",
      availability: "Сейчас не удалось загрузить или сохранить расписание. Попробуйте ещё раз чуть позже.",
      customers: "Сейчас не удалось загрузить историю клиентов. Попробуйте ещё раз чуть позже.",
      generic: "Это действие Hermes Connect временно недоступно. Попробуйте ещё раз чуть позже.",
    },
    uk: {
      auth: "Зараз не вдалося виконати вхід або реєстрацію. Спробуйте ще раз трохи пізніше.",
      dashboard: "Зараз не вдалося виконати дію в кабінеті СТО. Спробуйте ще раз трохи пізніше.",
      availability: "Зараз не вдалося завантажити або зберегти розклад. Спробуйте ще раз трохи пізніше.",
      customers: "Зараз не вдалося завантажити історію клієнтів. Спробуйте ще раз трохи пізніше.",
      generic: "Ця дія Hermes Connect тимчасово недоступна. Спробуйте ще раз трохи пізніше.",
    },
    es: {
      auth: "No se pudo completar el acceso o registro. Inténtalo de nuevo en breve.",
      dashboard: "No se pudo completar esta acción del taller. Inténtalo de nuevo en breve.",
      availability: "No se pudo cargar o guardar el horario. Inténtalo de nuevo en breve.",
      customers: "No se pudo cargar el historial de clientes. Inténtalo de nuevo en breve.",
      generic: "Esta acción de Hermes Connect no está disponible temporalmente. Inténtalo de nuevo en breve.",
    },
    it: {
      auth: "Non è stato possibile completare l’accesso o la registrazione. Riprova tra poco.",
      dashboard: "Non è stato possibile completare questa azione dell’officina. Riprova tra poco.",
      availability: "Non è stato possibile caricare o salvare l’orario. Riprova tra poco.",
      customers: "Non è stato possibile caricare lo storico clienti. Riprova tra poco.",
      generic: "Questa azione Hermes Connect è temporaneamente non disponibile. Riprova tra poco.",
    },
    fr: {
      auth: "Impossible de terminer la connexion ou l’inscription pour le moment. Réessayez bientôt.",
      dashboard: "Impossible d’effectuer cette action dans l’espace atelier pour le moment. Réessayez bientôt.",
      availability: "Impossible de charger ou d’enregistrer les horaires pour le moment. Réessayez bientôt.",
      customers: "Impossible de charger l’historique des clients pour le moment. Réessayez bientôt.",
      generic: "Cette action Hermes Connect est temporairement indisponible. Réessayez bientôt.",
    },
  };

  const context = path === `${ROOT}/auth` ? "auth"
    : path === `${ROOT}/dashboard` ? "dashboard"
    : path === `${ROOT}/availability` ? "availability"
    : path === `${ROOT}/customers` ? "customers"
    : "generic";
  const message = (copy[locale] || copy.en)[context] || (copy[locale] || copy.en).generic;
  const technicalCode = /^[a-z][a-z0-9_]{2,80}(?:,\s*[a-z][a-z0-9_]{2,80})*$/i;

  const selectors = ["#alert-box", "#workspace-alert", "#availability-alert", "#page-alert"];
  const normalize = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.classList.contains("hidden")) return;
    const raw = (node.textContent || "").trim();
    if (raw && technicalCode.test(raw)) node.textContent = message;
  };

  const installWorkspaceVnext = () => {
    if (path !== `${ROOT}/dashboard` || document.querySelector('script[data-hc-owner-workspace-live]')) return;
    if (!document.querySelector('link[data-hc-owner-workspace-live]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/hermes-connect-repair-owner-workspace-live.css";
      stylesheet.dataset.hcOwnerWorkspaceLive = "true";
      document.head.append(stylesheet);
    }
    const script = document.createElement("script");
    script.src = "/hermes-connect-repair-owner-workspace-live.js";
    script.defer = true;
    script.dataset.hcOwnerWorkspaceLive = "true";
    document.head.append(script);
  };

  const install = () => {
    installWorkspaceVnext();
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) continue;
      normalize(node);
      new MutationObserver(() => normalize(node)).observe(node, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();