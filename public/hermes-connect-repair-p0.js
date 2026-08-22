(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const rawPath = window.location.pathname;
  const path = rawPath.replace(/\/+$/, "") || "/";
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const SUPPORTED = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("lang") || "en").toLowerCase();
  const locale = SUPPORTED.has(requested) ? requested : "en";
  const isBooking = path === `${ROOT}/booking`;
  const isAuth = path === `${ROOT}/auth`;

  const withLocale = (href) => {
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  // P0: three independent booking enhancers historically requested the same public
  // shop payload. Collapse identical GETs for this page without changing the API.
  if (isBooking && !window.__hcRepairShopFetchDeduperInstalled) {
    window.__hcRepairShopFetchDeduperInstalled = true;
    const nativeFetch = window.fetch.bind(window);
    const publicShopReads = new Map();

    window.fetch = (input, init) => {
      let url;
      let method = String(init?.method || "GET").toUpperCase();
      try {
        if (input instanceof Request) {
          url = new URL(input.url, window.location.origin);
          if (!init?.method) method = String(input.method || "GET").toUpperCase();
        } else {
          url = new URL(String(input), window.location.origin);
        }
      } catch {
        return nativeFetch(input, init);
      }

      const isPublicShopRead = method === "GET"
        && url.origin === window.location.origin
        && url.pathname === "/api/public/repair-shop"
        && Boolean(url.searchParams.get("slug"));
      if (!isPublicShopRead) return nativeFetch(input, init);

      const key = `${url.pathname}?${url.searchParams.toString()}`;
      if (!publicShopReads.has(key)) {
        const request = nativeFetch(input, init).catch((error) => {
          publicShopReads.delete(key);
          throw error;
        });
        publicShopReads.set(key, request);
      }
      return publicShopReads.get(key).then((response) => response.clone());
    };
  }

  const navCopy = {
    en: { hub:"Product Hub", repair:"Repair Shops", dashboard:"Dashboard", availability:"Availability", customers:"Customers" },
    ru: { hub:"Все продукты", repair:"СТО", dashboard:"Кабинет", availability:"Расписание", customers:"Клиенты" },
    uk: { hub:"Усі продукти", repair:"СТО", dashboard:"Кабінет", availability:"Розклад", customers:"Клієнти" },
    es: { hub:"Todos los productos", repair:"Talleres", dashboard:"Panel", availability:"Disponibilidad", customers:"Clientes" },
    it: { hub:"Tutti i prodotti", repair:"Officine", dashboard:"Dashboard", availability:"Disponibilità", customers:"Clienti" },
    fr: { hub:"Tous les produits", repair:"Ateliers", dashboard:"Tableau de bord", availability:"Disponibilités", customers:"Clients" },
  };

  const contentLanguageCopy = {
    en:"Content language: English",
    ru:"Язык контента: русский",
    uk:"Мова контенту: українська",
    es:"Idioma del contenido: español",
    it:"Lingua dei contenuti: italiano",
    fr:"Langue du contenu : français",
  };

  const bookingFailureCopy = {
    en: {
      title:"Booking is temporarily unavailable.",
      body:"We couldn’t load this repair shop right now. Please try again in a few minutes.",
      alert:"This booking page is temporarily unavailable. Please try again shortly."
    },
    ru: {
      title:"Онлайн-запись временно недоступна.",
      body:"Сейчас не удалось загрузить это СТО. Попробуйте ещё раз через несколько минут.",
      alert:"Онлайн-запись временно недоступна. Попробуйте ещё раз чуть позже."
    },
    uk: {
      title:"Онлайн-запис тимчасово недоступний.",
      body:"Зараз не вдалося завантажити це СТО. Спробуйте ще раз за кілька хвилин.",
      alert:"Онлайн-запис тимчасово недоступний. Спробуйте ще раз трохи пізніше."
    },
    es: {
      title:"La reserva no está disponible temporalmente.",
      body:"No pudimos cargar este taller ahora. Inténtalo de nuevo en unos minutos.",
      alert:"Esta página de reserva no está disponible temporalmente. Inténtalo de nuevo en breve."
    },
    it: {
      title:"La prenotazione è temporaneamente non disponibile.",
      body:"Non è stato possibile caricare l’officina. Riprova tra qualche minuto.",
      alert:"Questa pagina di prenotazione è temporaneamente non disponibile. Riprova tra poco."
    },
    fr: {
      title:"La réservation est temporairement indisponible.",
      body:"Nous n’avons pas pu charger cet atelier. Réessayez dans quelques minutes.",
      alert:"Cette page de réservation est temporairement indisponible. Réessayez bientôt."
    },
  };

  const bookingCopy = {
    ru: {
      "Repair Shop Beta":"СТО · бета",
      "Hermes Connect · Public Booking":"Hermes Connect · Онлайн-запись",
      "Loading repair shop…":"Загружаем СТО…",
      "Loading shop profile, services, and hours from production.":"Загружаем профиль СТО, услуги и часы работы.",
      "Real appointment intake":"Реальная запись на сервис",
      "Book a service":"Записаться на услугу",
      "Hermes Connect Repair Shops is the current live pilot. Repair service pricing is set by each participating shop.":"Hermes Connect Repair Shops — текущий рабочий пилот. Стоимость ремонта устанавливает само СТО.",
      "Service":"Услуга", "Select a service":"Выберите услугу", "Date":"Дата", "Select a date":"Выберите дату", "Time":"Время", "Select a time":"Выберите время",
      "Choose a service and date to load current availability.":"Выберите услугу и дату, чтобы увидеть свободное время.",
      "Vehicle":"Автомобиль", "Saved with this appointment so the shop can prepare before you arrive.":"Данные сохраняются вместе с записью, чтобы СТО могло подготовиться к вашему приезду.",
      "Year":"Год", "Make":"Марка", "Model":"Модель", "Mileage":"Пробег", "optional":"необязательно",
      "Contact":"Контакты", "The repair shop uses this information for your appointment.":"СТО использует эти данные для вашей записи.", "Full name":"Имя и фамилия", "Phone":"Телефон",
      "Confirm appointment":"Подтвердить запись", "Production booking created":"Запись создана", "Appointment confirmed":"Запись подтверждена", "Booking ID":"ID записи", "Shop":"СТО", "Status":"Статус", "Add to calendar (.ics)":"Добавить в календарь (.ics)",
      "Services come from this shop’s owner workspace.":"Услуги загружаются из кабинета владельца этого СТО.",
      "Times are checked against the shop’s saved weekly hours and existing bookings.":"Свободное время проверяется по графику СТО и существующим записям.",
      "Shop location loads from the saved public profile.":"Адрес загружается из публичного профиля СТО.",
      "This shop has not opened any booking days yet.":"Это СТО пока не открыло дни для онлайн-записи.",
      "The shop is closed on this date.":"В этот день СТО закрыто.",
      "Checking current production bookings…":"Проверяем актуальные записи…",
      "No open times remain for this service on that date.":"На эту дату для выбранной услуги свободного времени не осталось.",
      "This repair shop booking link is not active.":"Эта ссылка на запись СТО неактивна.",
      "Unable to load this repair shop.":"Не удалось загрузить СТО.",
      "This shop has not published any services yet.":"Это СТО пока не опубликовало услуги.",
      "That time was just booked. Please choose another available time.":"Это время только что заняли. Выберите другое свободное время.",
      "Unable to create the appointment.":"Не удалось создать запись.",
      "Network error while creating the appointment.":"Ошибка сети при создании записи."
    },
    uk: {
      "Repair Shop Beta":"СТО · бета", "Hermes Connect · Public Booking":"Hermes Connect · Онлайн-запис", "Loading repair shop…":"Завантажуємо СТО…", "Loading shop profile, services, and hours from production.":"Завантажуємо профіль СТО, послуги та години роботи.", "Real appointment intake":"Реальний запис на сервіс", "Book a service":"Записатися на послугу", "Hermes Connect Repair Shops is the current live pilot. Repair service pricing is set by each participating shop.":"Hermes Connect Repair Shops — поточний робочий пілот. Вартість ремонту встановлює саме СТО.", "Service":"Послуга", "Select a service":"Оберіть послугу", "Date":"Дата", "Select a date":"Оберіть дату", "Time":"Час", "Select a time":"Оберіть час", "Choose a service and date to load current availability.":"Оберіть послугу та дату, щоб побачити вільний час.", "Vehicle":"Автомобіль", "Year":"Рік", "Make":"Марка", "Model":"Модель", "Mileage":"Пробіг", "optional":"необов’язково", "Contact":"Контакти", "Full name":"Ім’я та прізвище", "Phone":"Телефон", "Confirm appointment":"Підтвердити запис", "Production booking created":"Запис створено", "Appointment confirmed":"Запис підтверджено", "Booking ID":"ID запису", "Shop":"СТО", "Status":"Статус", "Add to calendar (.ics)":"Додати в календар (.ics)"
    },
    es: {
      "Repair Shop Beta":"Talleres · beta", "Hermes Connect · Public Booking":"Hermes Connect · Reserva online", "Loading repair shop…":"Cargando taller…", "Loading shop profile, services, and hours from production.":"Cargando perfil, servicios y horario del taller.", "Real appointment intake":"Reserva real de servicio", "Book a service":"Reservar un servicio", "Service":"Servicio", "Select a service":"Selecciona un servicio", "Date":"Fecha", "Select a date":"Selecciona una fecha", "Time":"Hora", "Select a time":"Selecciona una hora", "Vehicle":"Vehículo", "Year":"Año", "Make":"Marca", "Model":"Modelo", "Mileage":"Kilometraje", "optional":"opcional", "Contact":"Contacto", "Full name":"Nombre completo", "Phone":"Teléfono", "Confirm appointment":"Confirmar cita", "Appointment confirmed":"Cita confirmada", "Booking ID":"ID de reserva", "Shop":"Taller", "Status":"Estado", "Add to calendar (.ics)":"Añadir al calendario (.ics)"
    },
    it: {
      "Repair Shop Beta":"Officine · beta", "Hermes Connect · Public Booking":"Hermes Connect · Prenotazione online", "Loading repair shop…":"Caricamento officina…", "Loading shop profile, services, and hours from production.":"Caricamento profilo, servizi e orari dell’officina.", "Real appointment intake":"Prenotazione reale", "Book a service":"Prenota un servizio", "Service":"Servizio", "Select a service":"Seleziona un servizio", "Date":"Data", "Select a date":"Seleziona una data", "Time":"Ora", "Select a time":"Seleziona un orario", "Vehicle":"Veicolo", "Year":"Anno", "Make":"Marca", "Model":"Modello", "Mileage":"Chilometraggio", "optional":"facoltativo", "Contact":"Contatti", "Full name":"Nome completo", "Phone":"Telefono", "Confirm appointment":"Conferma appuntamento", "Appointment confirmed":"Appuntamento confermato", "Booking ID":"ID prenotazione", "Shop":"Officina", "Status":"Stato", "Add to calendar (.ics)":"Aggiungi al calendario (.ics)"
    },
    fr: {
      "Repair Shop Beta":"Ateliers · bêta", "Hermes Connect · Public Booking":"Hermes Connect · Réservation en ligne", "Loading repair shop…":"Chargement de l’atelier…", "Loading shop profile, services, and hours from production.":"Chargement du profil, des services et des horaires de l’atelier.", "Real appointment intake":"Prise de rendez-vous réelle", "Book a service":"Réserver un service", "Service":"Service", "Select a service":"Choisir un service", "Date":"Date", "Select a date":"Choisir une date", "Time":"Heure", "Select a time":"Choisir une heure", "Vehicle":"Véhicule", "Year":"Année", "Make":"Marque", "Model":"Modèle", "Mileage":"Kilométrage", "optional":"facultatif", "Contact":"Contact", "Full name":"Nom complet", "Phone":"Téléphone", "Confirm appointment":"Confirmer le rendez-vous", "Appointment confirmed":"Rendez-vous confirmé", "Booking ID":"ID de réservation", "Shop":"Atelier", "Status":"Statut", "Add to calendar (.ics)":"Ajouter au calendrier (.ics)"
    },
  };

  const translatedRepairPaths = new Set([
    `${ROOT}/auth`, `${ROOT}/dashboard`, `${ROOT}/booking`, `${ROOT}/availability`, `${ROOT}/customers`, `${ROOT}/forgot-password`,
  ]);

  const translateTextTree = (root, table) => {
    if (!root || !table) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const raw = node.nodeValue || "";
      const normalized = raw.replace(/\s+/g, " ").trim();
      const translated = table[normalized];
      if (translated) {
        const leading = raw.match(/^\s*/)?.[0] || "";
        const trailing = raw.match(/\s*$/)?.[0] || "";
        node.nodeValue = `${leading}${translated}${trailing}`;
      }
      node = walker.nextNode();
    }
  };

  const contextualizeRepairNavigation = () => {
    const nav = document.querySelector(".hc-family-nav");
    if (!nav) return;
    const t = navCopy[locale] || navCopy.en;
    const ownerRoutes = new Set([`${ROOT}/dashboard`, `${ROOT}/availability`, `${ROOT}/customers`]);
    const links = ownerRoutes.has(path)
      ? [[t.dashboard,`${ROOT}/dashboard/`],[t.availability,`${ROOT}/availability/`],[t.customers,`${ROOT}/customers/`],[t.repair,`${ROOT}/`],[t.hub,"/services/hermes-connect/"]]
      : [[t.repair,`${ROOT}/`],[t.hub,"/services/hermes-connect/"]];

    nav.replaceChildren();
    for (const [label, href] of links) {
      const link = document.createElement("a");
      link.textContent = label;
      link.href = withLocale(href);
      if (path === href.replace(/\/+$/, "")) link.setAttribute("aria-current", "page");
      nav.append(link);
    }
  };

  const localizeBooking = () => {
    if (!isBooking || locale === "en") return;
    const table = bookingCopy[locale] || {};
    const page = document.querySelector(".booking-page");
    if (!page) return;
    translateTextTree(page, table);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) translateTextTree(node, table);
          else if (node.parentElement) translateTextTree(node.parentElement, table);
        });
        if (mutation.type === "characterData" && mutation.target.parentElement) translateTextTree(mutation.target.parentElement, table);
      }

      const slotState = document.getElementById("slot-state");
      const liveMatch = slotState?.textContent?.match(/^(\d+) live (?:time|times) available\.$/);
      if (slotState && liveMatch) {
        const count = liveMatch[1];
        slotState.textContent = locale === "ru" ? `Доступно вариантов времени: ${count}.`
          : locale === "uk" ? `Доступно варіантів часу: ${count}.`
          : locale === "es" ? `${count} horarios disponibles.`
          : locale === "it" ? `${count} orari disponibili.`
          : `${count} créneaux disponibles.`;
      }
    });
    observer.observe(page, { childList:true, subtree:true, characterData:true });
  };

  const improveBookingFirstScreen = () => {
    if (!isBooking) return;
    const hero = document.querySelector(".booking-page .hero");
    const title = document.getElementById("shop-title");
    const meta = document.getElementById("shop-meta");
    const alert = document.getElementById("page-alert");
    if (!hero || !title || !meta) return;

    hero.dataset.hcBookingLoading = "true";
    hero.setAttribute("aria-busy", "true");
    const loadingPattern = /Loading repair shop|Загружаем СТО|Завантажуємо СТО|Cargando taller|Caricamento officina|Chargement de l’atelier|Still loading this repair shop|СТО всё ещё загружается|СТО ще завантажується|El taller aún se está cargando|L’officina è ancora in caricamento|L’atelier est toujours en cours de chargement/i;
    const failure = bookingFailureCopy[locale] || bookingFailureCopy.en;
    let applyingFailureState = false;

    const markLoaded = () => {
      if (hero.dataset.hcBookingError === "true") return;
      if (!loadingPattern.test(title.textContent || "")) {
        delete hero.dataset.hcBookingLoading;
        hero.removeAttribute("aria-busy");
      }
    };

    const applyFailureState = () => {
      if (applyingFailureState) return;
      applyingFailureState = true;
      try {
        delete hero.dataset.hcBookingLoading;
        hero.dataset.hcBookingError = "true";
        hero.removeAttribute("aria-busy");
        // Write the supporting copy first and the title last. Several page enhancers
        // observe title mutations, so this order prevents a re-entrant observer from
        // leaving the meta line behind in the stale loading state.
        if (meta.textContent !== failure.body) meta.textContent = failure.body;
        if (title.textContent !== failure.title) title.textContent = failure.title;
      } finally {
        applyingFailureState = false;
      }
    };

    const normalizeFailure = () => {
      if (hero.dataset.hcBookingError === "true") {
        applyFailureState();
        return;
      }
      if (!alert || alert.classList.contains("hidden")) return;
      const raw = (alert.textContent || "").trim();
      if (!raw) return;
      const technicalCode = /^[a-z][a-z0-9_]{2,80}$/i.test(raw);
      if (technicalCode) alert.textContent = failure.alert;

      if (loadingPattern.test(title.textContent || "")) applyFailureState();
    };

    new MutationObserver(() => {
      if (hero.dataset.hcBookingError === "true") applyFailureState();
      else {
        markLoaded();
        normalizeFailure();
      }
    }).observe(hero, { childList:true, subtree:true,characterData:true });

    if (alert) {
      new MutationObserver(normalizeFailure).observe(alert, {
        childList:true,
        subtree:true,
        characterData:true,
        attributes:true,
        attributeFilter:["class"],
      });
    }

    markLoaded();
    normalizeFailure();

    window.setTimeout(() => {
      if (hero.dataset.hcBookingError === "true") {
        applyFailureState();
        return;
      }
      if (!hero.dataset.hcBookingLoading) return;
      const slow = {
        en:["Still loading this repair shop…","The connection is taking longer than usual. Hermes is still trying to load the shop profile."],
        ru:["СТО всё ещё загружается…","Соединение занимает больше времени, чем обычно. Hermes продолжает загружать профиль СТО."],
        uk:["СТО ще завантажується…","З’єднання триває довше, ніж зазвичай. Hermes продовжує завантажувати профіль СТО."],
        es:["El taller aún se está cargando…","La conexión tarda más de lo habitual. Hermes sigue cargando el perfil del taller."],
        it:["L’officina è ancora in caricamento…","La connessione richiede più tempo del solito. Hermes continua a caricare il profilo."],
        fr:["L’atelier est toujours en cours de chargement…","La connexion prend plus de temps que prévu. Hermes continue à charger le profil de l’atelier."],
      }[locale] || ["Still loading this repair shop…","The connection is taking longer than usual. Hermes is still trying to load the shop profile."];
      title.textContent = slow[0];
      meta.textContent = slow[1];
    }, 8000);
  };

  const setupOwnerRedirect = () => {
    if (!isAuth) return;
    const authenticated = document.getElementById("auth-authenticated");
    if (!authenticated) return;
    let redirecting = false;
    const enterDashboard = () => {
      if (redirecting || !authenticated.classList.contains("active")) return;
      redirecting = true;
      window.location.assign(withLocale(`${ROOT}/dashboard/`));
    };
    enterDashboard();
    new MutationObserver(enterDashboard).observe(authenticated, { attributes:true, attributeFilter:["class"] });
  };

  const reconcileLanguageTruth = () => {
    if (!translatedRepairPaths.has(path)) return;
    document.querySelector("[data-hc-english-only]")?.remove();
    const label = document.querySelector(".hc-content-language");
    if (label) label.textContent = contentLanguageCopy[locale] || contentLanguageCopy.en;
  };

  const run = () => {
    contextualizeRepairNavigation();
    reconcileLanguageTruth();
    localizeBooking();
    improveBookingFirstScreen();
    setupOwnerRedirect();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once:true });
  else run();
})();