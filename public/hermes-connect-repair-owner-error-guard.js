(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (!path.startsWith(`${ROOT}/`) || path === `${ROOT}/booking`) return;

  const SUPPORTED = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = SUPPORTED.has(requested) ? requested : "en";

  const technical = {
    en: { auth:"Unable to complete authentication right now. Please try again.", dashboard:"Unable to complete this workspace action right now. Please try again.", availability:"Unable to update the schedule right now. Please try again.", customers:"Unable to load customer history right now. Please try again.", generic:"This Repair Shop action is temporarily unavailable. Please try again shortly." },
    ru: { auth:"Сейчас не удалось выполнить вход или регистрацию. Попробуйте ещё раз чуть позже.", dashboard:"Сейчас не удалось выполнить действие в кабинете СТО. Попробуйте ещё раз чуть позже.", availability:"Сейчас не удалось загрузить или сохранить расписание. Попробуйте ещё раз чуть позже.", customers:"Сейчас не удалось загрузить историю клиентов. Попробуйте ещё раз чуть позже.", generic:"Это действие Hermes Connect временно недоступно. Попробуйте ещё раз чуть позже." },
    uk: { auth:"Зараз не вдалося виконати вхід або реєстрацію. Спробуйте ще раз трохи пізніше.", dashboard:"Зараз не вдалося виконати дію в кабінеті СТО. Спробуйте ще раз трохи пізніше.", availability:"Зараз не вдалося завантажити або зберегти розклад. Спробуйте ще раз трохи пізніше.", customers:"Зараз не вдалося завантажити історію клієнтів. Спробуйте ще раз трохи пізніше.", generic:"Ця дія Hermes Connect тимчасово недоступна. Спробуйте ще раз трохи пізніше." },
    es: { auth:"No se pudo completar el acceso o registro. Inténtalo de nuevo en breve.", dashboard:"No se pudo completar esta acción del taller. Inténtalo de nuevo en breve.", availability:"No se pudo cargar o guardar el horario. Inténtalo de nuevo en breve.", customers:"No se pudo cargar el historial de clientes. Inténtalo de nuevo en breve.", generic:"Esta acción de Hermes Connect no está disponible temporalmente. Inténtalo de nuevo en breve." },
    it: { auth:"Non è stato possibile completare l’accesso o la registrazione. Riprova tra poco.", dashboard:"Non è stato possibile completare questa azione dell’officina. Riprova tra poco.", availability:"Non è stato possibile caricare o salvare l’orario. Riprova tra poco.", customers:"Non è stato possibile caricare lo storico clienti. Riprova tra poco.", generic:"Questa azione Hermes Connect è temporaneamente non disponibile. Riprova tra poco." },
    fr: { auth:"Impossible de terminer la connexion ou l’inscription pour le moment. Réessayez bientôt.", dashboard:"Impossible d’effectuer cette action dans l’espace atelier pour le moment. Réessayez bientôt.", availability:"Impossible de charger ou d’enregistrer les horaires pour le moment. Réessayez bientôt.", customers:"Impossible de charger l’historique des clients pour le moment. Réessayez bientôt.", generic:"Cette action Hermes Connect est temporairement indisponible. Réessayez bientôt." },
  };

  const messages = {
    ru: {
      "Unable to load your secure session.":"Не удалось загрузить защищённую сессию.", "Unable to load shop profile.":"Не удалось загрузить профиль СТО.", "Unable to save shop profile.":"Не удалось сохранить профиль СТО.", "Shop profile saved to production.":"Профиль СТО сохранён.", "Network error while saving shop profile.":"Ошибка сети при сохранении профиля СТО.", "Public booking link copied.":"Публичная ссылка записи скопирована.", "Could not copy the link. Select it manually.":"Не удалось скопировать ссылку. Выберите её вручную.", "Unable to load services.":"Не удалось загрузить услуги.", "This service has bookings and cannot be deleted.":"У этой услуги есть записи, поэтому удалить её нельзя.", "Unable to delete service.":"Не удалось удалить услугу.", "Network error while deleting service.":"Ошибка сети при удалении услуги.", "A service with this name already exists.":"Услуга с таким названием уже существует.", "Unable to add service.":"Не удалось добавить услугу.", "Network error while adding service.":"Ошибка сети при добавлении услуги.", "Unable to load booking inbox.":"Не удалось загрузить входящие записи.", "That booking status transition is no longer allowed. Refreshing current state.":"Этот переход статуса больше недоступен. Обновляем текущее состояние.", "Unable to change booking status.":"Не удалось изменить статус записи.", "Network error while changing booking status.":"Ошибка сети при изменении статуса записи.", "Unable to load private feedback.":"Не удалось загрузить приватные отзывы.", "Unable to save private feedback.":"Не удалось сохранить приватный отзыв.", "Private feedback saved. Thank you.":"Приватный отзыв сохранён. Спасибо.", "Network error while saving private feedback.":"Ошибка сети при сохранении приватного отзыва.", "Logout failed.":"Не удалось выйти из аккаунта.", "Unable to initialize the shop workspace.":"Не удалось инициализировать кабинет СТО."
    },
    uk: {
      "Unable to load your secure session.":"Не вдалося завантажити захищену сесію.", "Unable to load shop profile.":"Не вдалося завантажити профіль СТО.", "Unable to save shop profile.":"Не вдалося зберегти профіль СТО.", "Shop profile saved to production.":"Профіль СТО збережено.", "Network error while saving shop profile.":"Помилка мережі під час збереження профілю СТО.", "Public booking link copied.":"Публічне посилання запису скопійовано.", "Could not copy the link. Select it manually.":"Не вдалося скопіювати посилання. Виберіть його вручну.", "Unable to load services.":"Не вдалося завантажити послуги.", "This service has bookings and cannot be deleted.":"Для цієї послуги є записи, тому її не можна видалити.", "Unable to delete service.":"Не вдалося видалити послугу.", "Network error while deleting service.":"Помилка мережі під час видалення послуги.", "A service with this name already exists.":"Послуга з такою назвою вже існує.", "Unable to add service.":"Не вдалося додати послугу.", "Network error while adding service.":"Помилка мережі під час додавання послуги.", "Unable to load booking inbox.":"Не вдалося завантажити вхідні записи.", "That booking status transition is no longer allowed. Refreshing current state.":"Цей перехід статусу більше недоступний. Оновлюємо поточний стан.", "Unable to change booking status.":"Не вдалося змінити статус запису.", "Network error while changing booking status.":"Помилка мережі під час зміни статусу запису.", "Unable to load private feedback.":"Не вдалося завантажити приватні відгуки.", "Unable to save private feedback.":"Не вдалося зберегти приватний відгук.", "Private feedback saved. Thank you.":"Приватний відгук збережено. Дякуємо.", "Network error while saving private feedback.":"Помилка мережі під час збереження приватного відгуку.", "Logout failed.":"Не вдалося вийти з акаунта.", "Unable to initialize the shop workspace.":"Не вдалося ініціалізувати кабінет СТО."
    },
    es: {
      "Unable to load your secure session.":"No se pudo cargar la sesión segura.", "Unable to load shop profile.":"No se pudo cargar el perfil del taller.", "Unable to save shop profile.":"No se pudo guardar el perfil del taller.", "Shop profile saved to production.":"Perfil del taller guardado.", "Network error while saving shop profile.":"Error de red al guardar el perfil del taller.", "Public booking link copied.":"Enlace público de reservas copiado.", "Could not copy the link. Select it manually.":"No se pudo copiar el enlace. Selecciónalo manualmente.", "Unable to load services.":"No se pudieron cargar los servicios.", "This service has bookings and cannot be deleted.":"Este servicio tiene reservas y no puede eliminarse.", "Unable to delete service.":"No se pudo eliminar el servicio.", "Network error while deleting service.":"Error de red al eliminar el servicio.", "A service with this name already exists.":"Ya existe un servicio con este nombre.", "Unable to add service.":"No se pudo añadir el servicio.", "Network error while adding service.":"Error de red al añadir el servicio.", "Unable to load booking inbox.":"No se pudo cargar la bandeja de reservas.", "That booking status transition is no longer allowed. Refreshing current state.":"Ese cambio de estado ya no está permitido. Actualizando el estado actual.", "Unable to change booking status.":"No se pudo cambiar el estado de la reserva.", "Network error while changing booking status.":"Error de red al cambiar el estado de la reserva.", "Unable to load private feedback.":"No se pudieron cargar los comentarios privados.", "Unable to save private feedback.":"No se pudo guardar el comentario privado.", "Private feedback saved. Thank you.":"Comentario privado guardado. Gracias.", "Network error while saving private feedback.":"Error de red al guardar el comentario privado.", "Logout failed.":"No se pudo cerrar la sesión.", "Unable to initialize the shop workspace.":"No se pudo iniciar el espacio del taller."
    },
    it: {
      "Unable to load your secure session.":"Impossibile caricare la sessione sicura.", "Unable to load shop profile.":"Impossibile caricare il profilo dell’officina.", "Unable to save shop profile.":"Impossibile salvare il profilo dell’officina.", "Shop profile saved to production.":"Profilo dell’officina salvato.", "Network error while saving shop profile.":"Errore di rete durante il salvataggio del profilo.", "Public booking link copied.":"Link pubblico di prenotazione copiato.", "Could not copy the link. Select it manually.":"Impossibile copiare il link. Selezionalo manualmente.", "Unable to load services.":"Impossibile caricare i servizi.", "This service has bookings and cannot be deleted.":"Questo servizio ha prenotazioni e non può essere eliminato.", "Unable to delete service.":"Impossibile eliminare il servizio.", "Network error while deleting service.":"Errore di rete durante l’eliminazione del servizio.", "A service with this name already exists.":"Esiste già un servizio con questo nome.", "Unable to add service.":"Impossibile aggiungere il servizio.", "Network error while adding service.":"Errore di rete durante l’aggiunta del servizio.", "Unable to load booking inbox.":"Impossibile caricare le prenotazioni.", "That booking status transition is no longer allowed. Refreshing current state.":"Questo cambio di stato non è più consentito. Aggiornamento dello stato corrente.", "Unable to change booking status.":"Impossibile cambiare lo stato della prenotazione.", "Network error while changing booking status.":"Errore di rete durante il cambio di stato.", "Unable to load private feedback.":"Impossibile caricare i feedback privati.", "Unable to save private feedback.":"Impossibile salvare il feedback privato.", "Private feedback saved. Thank you.":"Feedback privato salvato. Grazie.", "Network error while saving private feedback.":"Errore di rete durante il salvataggio del feedback.", "Logout failed.":"Disconnessione non riuscita.", "Unable to initialize the shop workspace.":"Impossibile inizializzare lo spazio dell’officina."
    },
    fr: {
      "Unable to load your secure session.":"Impossible de charger la session sécurisée.", "Unable to load shop profile.":"Impossible de charger le profil de l’atelier.", "Unable to save shop profile.":"Impossible d’enregistrer le profil de l’atelier.", "Shop profile saved to production.":"Profil de l’atelier enregistré.", "Network error while saving shop profile.":"Erreur réseau lors de l’enregistrement du profil.", "Public booking link copied.":"Lien public de réservation copié.", "Could not copy the link. Select it manually.":"Impossible de copier le lien. Sélectionnez-le manuellement.", "Unable to load services.":"Impossible de charger les services.", "This service has bookings and cannot be deleted.":"Ce service a des réservations et ne peut pas être supprimé.", "Unable to delete service.":"Impossible de supprimer le service.", "Network error while deleting service.":"Erreur réseau lors de la suppression du service.", "A service with this name already exists.":"Un service portant ce nom existe déjà.", "Unable to add service.":"Impossible d’ajouter le service.", "Network error while adding service.":"Erreur réseau lors de l’ajout du service.", "Unable to load booking inbox.":"Impossible de charger les réservations.", "That booking status transition is no longer allowed. Refreshing current state.":"Ce changement de statut n’est plus autorisé. Actualisation de l’état courant.", "Unable to change booking status.":"Impossible de modifier le statut de la réservation.", "Network error while changing booking status.":"Erreur réseau lors du changement de statut.", "Unable to load private feedback.":"Impossible de charger les retours privés.", "Unable to save private feedback.":"Impossible d’enregistrer le retour privé.", "Private feedback saved. Thank you.":"Retour privé enregistré. Merci.", "Network error while saving private feedback.":"Erreur réseau lors de l’enregistrement du retour.", "Logout failed.":"Échec de la déconnexion.", "Unable to initialize the shop workspace.":"Impossible d’initialiser l’espace atelier."
    },
  };

  const statusCopy = {
    ru:{ Confirmed:"Подтверждено", "In progress":"В работе", Completed:"Завершено", Cancelled:"Отменено" },
    uk:{ Confirmed:"Підтверджено", "In progress":"У роботі", Completed:"Завершено", Cancelled:"Скасовано" },
    es:{ Confirmed:"Confirmada", "In progress":"En curso", Completed:"Completada", Cancelled:"Cancelada" },
    it:{ Confirmed:"Confermata", "In progress":"In corso", Completed:"Completata", Cancelled:"Annullata" },
    fr:{ Confirmed:"Confirmée", "In progress":"En cours", Completed:"Terminée", Cancelled:"Annulée" },
  };

  const context = path === `${ROOT}/auth` ? "auth" : path === `${ROOT}/dashboard` ? "dashboard" : path === `${ROOT}/availability` ? "availability" : path === `${ROOT}/customers` ? "customers" : "generic";
  const fallback = technical[locale]?.[context] || technical.en[context] || technical.en.generic;
  const technicalCode = /^[a-z][a-z0-9_]{2,80}(?:,\s*[a-z][a-z0-9_]{2,80})*$/i;

  const localizeHuman = (raw) => {
    if (locale === "en") return raw;
    const exact = messages[locale]?.[raw];
    if (exact) return exact;
    const moved = raw.match(/^Booking moved to (Confirmed|In progress|Completed|Cancelled)\.$/);
    if (!moved) return raw;
    const status = statusCopy[locale]?.[moved[1]] || moved[1];
    if (locale === "ru") return `Статус записи изменён: ${status}.`;
    if (locale === "uk") return `Статус запису змінено: ${status}.`;
    if (locale === "es") return `Estado de la reserva cambiado a ${status}.`;
    if (locale === "it") return `Stato della prenotazione cambiato in ${status}.`;
    return `Statut de la réservation changé : ${status}.`;
  };

  const normalize = (node) => {
    if (!(node instanceof HTMLElement) || node.classList.contains("hidden")) return;
    const raw = (node.textContent || "").trim();
    if (!raw) return;
    const next = technicalCode.test(raw) ? fallback : localizeHuman(raw);
    if (next !== raw) node.textContent = next;
  };

  const addStylesheet = (href, key) => {
    if (document.querySelector(`link[${key}]`)) return;
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; link.setAttribute(key, "true"); document.head.append(link);
  };
  const addScript = (src, key) => {
    if (document.querySelector(`script[${key}]`)) return;
    const script = document.createElement("script"); script.src = src; script.async = false; script.setAttribute(key, "true"); document.head.append(script);
  };

  const installWorkspace = () => {
    if (path !== `${ROOT}/dashboard` || document.querySelector('script[data-hc-owner-workspace-live]')) return;
    const main = document.querySelector(".workspace-page"); if (main instanceof HTMLElement && !main.id) main.id = "main-content";
    addStylesheet("/hermes-connect-repair-owner-workspace-live.css", "data-hc-owner-workspace-live");
    addStylesheet("/hermes-connect-repair-owner-workspace-operational.css", "data-hc-owner-workspace-operational");
    addScript("/hermes-connect-repair-owner-workspace-live.js", "data-hc-owner-workspace-live");
    addScript("/hermes-connect-repair-owner-workspace-bridge.js", "data-hc-owner-workspace-bridge");
    addScript("/hermes-connect-repair-owner-workspace-insights.js", "data-hc-owner-workspace-insights");
    addScript("/hermes-connect-repair-owner-operational-i18n.js", "data-hc-owner-operational-i18n");
  };

  const install = () => {
    installWorkspace();
    for (const selector of ["#alert-box", "#workspace-alert", "#availability-alert", "#page-alert"]) {
      const node = document.querySelector(selector); if (!(node instanceof HTMLElement)) continue;
      normalize(node);
      new MutationObserver(() => normalize(node)).observe(node, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["class"] });
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true }); else install();
})();