(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== `${ROOT}/dashboard`) return;

  const getLocale = () => {
    const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
    const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
    return supported.has(requested) ? requested : "en";
  };

  const strings = {
    en: {
      nav:["Overview","Bookings","Calendar","Customers","Services","Growth","Hermes Intelligence","Settings"], workspace:"Workspace", ownerWorkspace:"Owner workspace", role:"Current role", owner:"Owner", future:"Manager / Advisor / Technician — future permissions, not active credentials.", ask:"Ask Hermes", top:"REPAIR SHOP OWNER OS · LIVE WORKSPACE", customers:"Customers", logout:"Logout", intelligenceKicker:"HERMES INTELLIGENCE · LIVE SIGNALS ONLY", openNext:"Open next action", reviewBookings:"Review bookings", focusKicker:"OWNER FOCUS", focusTitle:"What needs you next", metricBookings:"Bookings", metricServices:"Services", metricPublic:"Public booking", metricCompleted:"Completed visits", metricBookingsCopy:"Loading real booking inbox", metricServicesCopy:"Current service catalog", metricPublicCopy:"Real shop booking-link readiness", metricCompletedCopy:"Derived from booking statuses", growthKicker:"GROWTH · REAL ACTIVITY ONLY", growthTitle:"Customer → booking → completed visit", growthCopy:"No revenue or conversion number is invented. This surface activates from persisted booking and customer activity.", statuses:["Confirmed","In progress","Completed","Cancelled"], crm:"Open customer CRM ↗", ready:"Ready", setup:"Setup", notReady:"Not ready", noBookings:"No bookings yet", greeting:(name)=>name?`Good day, ${name}.`:"Owner workspace", shopSaved:"Shop profile is saved", publicReady:"Public booking link is ready to use.", publicCheck:"Check the public booking-link setup.", addService:"Add your first service", addServiceCopy:"Customers cannot choose a service until the catalog is configured.", liveServices:(n)=>`${n} service${n===1?"":"s"} live`, liveServicesCopy:"This is the catalog customers can book.", review:(n)=>`Review ${n} booking${n===1?"":"s"}`, statusSummary:(c,p,d)=>`${c} confirmed · ${p} in progress · ${d} completed.`, share:"Share your booking link", finish:"Finish setup before sharing", shareCopy:"The next real signal is the first customer booking.", finishCopy:"Profile and services come before customer acquisition.", defaultAI:"Finish the real shop setup before driving traffic.", defaultAICopy:"Hermes is reading profile, service and booking readiness already loaded in this workspace.", aiAdd:"Your profile is saved. Add the first bookable service next.", aiAddCopy:"This is the earliest remaining activation step visible in the live owner data.", aiReady:"Your booking setup is ready. The next proof is a real customer booking.", aiSetup:"Services are live. Finish the public booking-link setup next.", aiReadyCopy:"Share the real booking link and measure time to first completed appointment.", aiSetupCopy:"Hermes will not claim activation until the public intake path is ready.", aiBookings:(n)=>`${n} real booking${n===1?" is":"s are"} in the workspace.`, aiBookingsCopy:(c,p,d,x)=>`${c} confirmed, ${p} in progress, ${d} completed, ${x} cancelled. Review status and customer follow-up before adding new features.`
    },
    ru: {
      nav:["Обзор","Записи","Календарь","Клиенты","Услуги","Рост","Hermes Intelligence","Настройки"], workspace:"Пространство", ownerWorkspace:"Кабинет владельца", role:"Текущая роль", owner:"Владелец", future:"Менеджер / сервис-консультант / техник — будущие права, без отдельных аккаунтов сейчас.", ask:"Спросить Hermes", top:"КАБИНЕТ ВЛАДЕЛЬЦА СТО · LIVE", customers:"Клиенты", logout:"Выйти", intelligenceKicker:"HERMES INTELLIGENCE · ТОЛЬКО LIVE-СИГНАЛЫ", openNext:"Открыть следующий шаг", reviewBookings:"Проверить записи", focusKicker:"ФОКУС ВЛАДЕЛЬЦА", focusTitle:"Что требует внимания", metricBookings:"Записи", metricServices:"Услуги", metricPublic:"Онлайн-запись", metricCompleted:"Завершённые визиты", metricBookingsCopy:"Загружаем реальные записи", metricServicesCopy:"Текущий каталог услуг", metricPublicCopy:"Готовность реальной ссылки записи", metricCompletedCopy:"Рассчитано по статусам записей", growthKicker:"РОСТ · ТОЛЬКО РЕАЛЬНАЯ АКТИВНОСТЬ", growthTitle:"Клиент → запись → завершённый визит", growthCopy:"Мы не выдумываем выручку или конверсию. Блок строится только на сохранённых записях и активности клиентов.", statuses:["Подтверждено","В работе","Завершено","Отменено"], crm:"Открыть CRM клиентов ↗", ready:"Готово", setup:"Настроить", notReady:"Не готово", noBookings:"Записей пока нет", greeting:(name)=>name?`Добрый день, ${name}.`:"Кабинет владельца", shopSaved:"Профиль СТО сохранён", publicReady:"Публичная ссылка для записи готова.", publicCheck:"Проверьте настройку публичной ссылки.", addService:"Добавьте первую услугу", addServiceCopy:"Пока каталог пуст, клиент не сможет выбрать услугу.", liveServices:(n)=>`Активных услуг: ${n}`, liveServicesCopy:"Именно этот каталог видят клиенты при записи.", review:(n)=>`Проверить записи: ${n}`, statusSummary:(c,p,d)=>`${c} подтверждено · ${p} в работе · ${d} завершено.`, share:"Поделитесь ссылкой записи", finish:"Сначала завершите настройку", shareCopy:"Следующий реальный сигнал — первая запись клиента.", finishCopy:"Сначала профиль и услуги, затем привлечение клиентов.", defaultAI:"Завершите реальные настройки СТО перед привлечением трафика.", defaultAICopy:"Hermes читает готовность профиля, услуг и записей, уже загруженных в кабинете.", aiAdd:"Профиль сохранён. Следующий шаг — первая услуга для записи.", aiAddCopy:"Это самый ранний незакрытый шаг активации по реальным данным кабинета.", aiReady:"Настройка записи готова. Следующее доказательство — реальная запись клиента.", aiSetup:"Услуги активны. Завершите настройку публичной записи.", aiReadyCopy:"Поделитесь реальной ссылкой и измерьте путь до первого завершённого визита.", aiSetupCopy:"Hermes не считает активацию завершённой, пока клиентский путь не готовый.", aiBookings:(n)=>`В кабинете реальных записей: ${n}.`, aiBookingsCopy:(c,p,d,x)=>`${c} подтверждено, ${p} в работе, ${d} завершено, ${x} отменено. Сначала обработайте статусы и follow-up клиентов, потом добавляйте новые функции.`
    },
    uk: {
      nav:["Огляд","Записи","Календар","Клієнти","Послуги","Зростання","Hermes Intelligence","Налаштування"], workspace:"Простір", ownerWorkspace:"Кабінет власника", role:"Поточна роль", owner:"Власник", future:"Менеджер / сервіс-консультант / технік — майбутні права, без окремих акаунтів зараз.", ask:"Запитати Hermes", top:"КАБІНЕТ ВЛАСНИКА СТО · LIVE", customers:"Клієнти", logout:"Вийти", intelligenceKicker:"HERMES INTELLIGENCE · ЛИШЕ LIVE-СИГНАЛИ", openNext:"Відкрити наступний крок", reviewBookings:"Перевірити записи", focusKicker:"ФОКУС ВЛАСНИКА", focusTitle:"Що потребує уваги", metricBookings:"Записи", metricServices:"Послуги", metricPublic:"Онлайн-запис", metricCompleted:"Завершені візити", metricBookingsCopy:"Завантажуємо реальні записи", metricServicesCopy:"Поточний каталог послуг", metricPublicCopy:"Готовність реального посилання запису", metricCompletedCopy:"Розраховано за статусами записів", growthKicker:"ЗРОСТАННЯ · ЛИШЕ РЕАЛЬНА АКТИВНІСТЬ", growthTitle:"Клієнт → запис → завершений візит", growthCopy:"Ми не вигадуємо виручку чи конверсію. Блок працює лише на збережених записах і активності клієнтів.", statuses:["Підтверджено","В роботі","Завершено","Скасовано"], crm:"Відкрити CRM клієнтів ↗", ready:"Готово", setup:"Налаштувати", notReady:"Не готово", noBookings:"Записів поки немає", greeting:(name)=>name?`Добрий день, ${name}.`:"Кабінет власника", shopSaved:"Профіль СТО збережено", publicReady:"Публічне посилання для запису готове.", publicCheck:"Перевірте налаштування публічного посилання.", addService:"Додайте першу послугу", addServiceCopy:"Поки каталог порожній, клієнт не зможе вибрати послугу.", liveServices:(n)=>`Активных услуг: ${n}`, liveServicesCopy:"Саме цей каталог бачать клієнти під час запису.", review:(n)=>`Перевірити записи: ${n}`, statusSummary:(c,p,d)=>`${c} підтверджено · ${p} в роботі · ${d} завершено.`, share:"Поділіться посиланням запису", finish:"Спочатку завершіть налаштування", shareCopy:"Наступний реальний сигнал — перший запис клієнта.", finishCopy:"Спочатку профіль і послуги, потім залучення клієнтів.", defaultAI:"Завершіть реальні налаштування СТО перед залученням трафіку.", defaultAICopy:"Hermes читає готовність профілю, послуг і записів, уже завантажених у кабінеті.", aiAdd:"Профіль збережено. Наступний крок — перша послуга для запису.", aiAddCopy:"Це найраніший незакритий крок активації за реальними даними кабінету.", aiReady:"Налаштування запису готове. Наступний доказ — реальний запис клієнта.", aiSetup:"Послуги активні. Завершіть налаштування публічного запису.", aiReadyCopy:"Поділіться реальним посиланням і виміряйте шлях до першого завершеного візиту.", aiSetupCopy:"Hermes не вважає активацію завершеною, доки клієнтський шлях не готовий.", aiBookings:(n)=>`У кабінеті реальних записів: ${n}.`, aiBookingsCopy:(c,p,d,x)=>`${c} підтверджено, ${p} в роботі, ${d} завершено, ${x} скасовано. Спочатку опрацюйте статуси й follow-up клієнтів, потім додавайте нові функції.`
    },
    es: {
      nav:["Resumen","Reservas","Calendario","Clientes","Servicios","Crecimiento","Hermes Intelligence","Ajustes"], workspace:"Espacio", ownerWorkspace:"Espacio del propietario", role:"Rol actual", owner:"Propietario", future:"Manager / asesor / técnico — permisos futuros, sin credenciales separadas por ahora.", ask:"Preguntar a Hermes", top:"OWNER OS DEL TALLER · LIVE", customers:"Clientes", logout:"Salir", intelligenceKicker:"HERMES INTELLIGENCE · SOLO SEÑALES LIVE", openNext:"Abrir siguiente paso", reviewBookings:"Revisar reservas", focusKicker:"FOCO DEL PROPIETARIO", focusTitle:"Qué necesita atención", metricBookings:"Reservas", metricServices:"Servicios", metricPublic:"Reserva pública", metricCompleted:"Visitas completadas", metricBookingsCopy:"Cargando reservas reales", metricServicesCopy:"Catálogo actual de servicios", metricPublicCopy:"Estado del enlace real de reserva", metricCompletedCopy:"Derivado de estados de reserva", growthKicker:"CRECIMIENTO · SOLO ACTIVIDAD REAL", growthTitle:"Cliente → reserva → visita completada", growthCopy:"No se inventan ingresos ni conversión. Esta vista usa solo actividad persistida.", statuses:["Confirmadas","En curso","Completadas","Canceladas"], crm:"Abrir CRM de clientes ↗", ready:"Listo", setup:"Configurar", notReady:"No listo", noBookings:"Aún no hay reservas", greeting:(name)=>name?`Buen día, ${name}.`:"Espacio del propietario", shopSaved:"Perfil del taller guardado", publicReady:"El enlace público de reserva está listo.", publicCheck:"Revisa la configuración del enlace público.", addService:"Añade el primer servicio", addServiceCopy:"El cliente no puede elegir servicio mientras el catálogo esté vacío.", liveServices:(n)=>`${n} servicio${n===1?"":"s"} activo${n===1?"":"s"}`, liveServicesCopy:"Este es el catálogo que ven los clientes.", review:(n)=>`Revisar ${n} reserva${n===1?"":"s"}`, statusSummary:(c,p,d)=>`${c} confirmadas · ${p} en curso · ${d} completadas.`, share:"Comparte el enlace de reserva", finish:"Termina la configuración primero", shareCopy:"La siguiente señal real es la primera reserva de un cliente.", finishCopy:"Perfil y servicios antes de adquisición.", defaultAI:"Termina la configuración real antes de atraer tráfico.", defaultAICopy:"Hermes lee la preparación del perfil, servicios y reservas ya cargados.", aiAdd:"Perfil guardado. Añade ahora el primer servicio reservable.", aiAddCopy:"Es el primer paso de activación pendiente según datos reales.", aiReady:"La reserva está lista. La siguiente prueba es una reserva real.", aiSetup:"Los servicios están activos. Termina el enlace público.", aiReadyCopy:"Comparte el enlace real y mide hasta la primera visita completada.", aiSetupCopy:"Hermes no considera activación hasta que la entrada del cliente esté lista.", aiBookings:(n)=>`Hay ${n} reserva${n===1?"":"s"} real${n===1?"":"es"} en el espacio.`, aiBookingsCopy:(c,p,d,x)=>`${c} confirmadas, ${p} en curso, ${d} completadas, ${x} canceladas. Revisa estados y seguimiento antes de añadir funciones.`
    },
    it: {
      nav:["Panoramica","Prenotazioni","Calendario","Clienti","Servizi","Crescita","Hermes Intelligence","Impostazioni"], workspace:"Spazio", ownerWorkspace:"Area proprietario", role:"Ruolo attuale", owner:"Proprietario", future:"Manager / advisor / tecnico — permessi futuri, senza credenziali separate ora.", ask:"Chiedi a Hermes", top:"OWNER OS OFFICINA · LIVE", customers:"Clienti", logout:"Esci", intelligenceKicker:"HERMES INTELLIGENCE · SOLO SEGNALI LIVE", openNext:"Apri prossimo passo", reviewBookings:"Controlla prenotazioni", focusKicker:"FOCUS PROPRIETARIO", focusTitle:"Cosa richiede attenzione", metricBookings:"Prenotazioni", metricServices:"Servizi", metricPublic:"Prenotazione pubblica", metricCompleted:"Visite completate", metricBookingsCopy:"Caricamento prenotazioni reali", metricServicesCopy:"Catalogo servizi attuale", metricPublicCopy:"Stato del link reale", metricCompletedCopy:"Derivato dagli stati delle prenotazioni", growthKicker:"CRESCITA · SOLO ATTIVITÀ REALE", growthTitle:"Cliente → prenotazione → visita completata", growthCopy:"Nessun ricavo o tasso di conversione inventato. Solo attività persistita.", statuses:["Confermate","In corso","Completate","Annullate"], crm:"Apri CRM clienti ↗", ready:"Pronto", setup:"Configura", notReady:"Non pronto", noBookings:"Nessuna prenotazione", greeting:(name)=>name?`Buongiorno, ${name}.`:"Area proprietario", shopSaved:"Profilo officina salvato", publicReady:"Il link pubblico è pronto.", publicCheck:"Controlla la configurazione del link pubblico.", addService:"Aggiungi il primo servizio", addServiceCopy:"Il cliente non può scegliere un servizio finché il catalogo è vuoto.", liveServices:(n)=>`${n} servizi attivi`, liveServicesCopy:"Questo è il catalogo visibile ai clienti.", review:(n)=>`Controlla ${n} prenotazioni`, statusSummary:(c,p,d)=>`${c} confermate · ${p} in corso · ${d} completate.`, share:"Condividi il link", finish:"Completa prima la configurazione", shareCopy:"Il prossimo segnale reale è la prima prenotazione cliente.", finishCopy:"Prima profilo e servizi, poi acquisizione.", defaultAI:"Completa la configurazione reale prima di portare traffico.", defaultAICopy:"Hermes legge profilo, servizi e prenotazioni già caricati.", aiAdd:"Profilo salvato. Aggiungi il primo servizio prenotabile.", aiAddCopy:"È il primo passo di attivazione ancora aperto nei dati reali.", aiReady:"La configurazione è pronta. La prossima prova è una prenotazione reale.", aiSetup:"I servizi sono attivi. Completa il link pubblico.", aiReadyCopy:"Condividi il link reale e misura fino alla prima visita completata.", aiSetupCopy:"Hermes non considera completa l’attivazione finché il percorso cliente non è pronto.", aiBookings:(n)=>`${n} prenotazioni reali nel workspace.`, aiBookingsCopy:(c,p,d,x)=>`${c} confermate, ${p} in corso, ${d} completate, ${x} annullate. Prima gestisci stati e follow-up, poi aggiungi nuove funzioni.`
    },
    fr: {
      nav:["Vue d’ensemble","Réservations","Calendrier","Clients","Services","Croissance","Hermes Intelligence","Réglages"], workspace:"Espace", ownerWorkspace:"Espace propriétaire", role:"Rôle actuel", owner:"Propriétaire", future:"Manager / conseiller / technicien — droits futurs, sans identifiants séparés pour l’instant.", ask:"Demander à Hermes", top:"OWNER OS ATELIER · LIVE", customers:"Clients", logout:"Déconnexion", intelligenceKicker:"HERMES INTELLIGENCE · SIGNAUX LIVE UNIQUEMENT", openNext:"Ouvrir l’étape suivante", reviewBookings:"Voir les réservations", focusKicker:"FOCUS PROPRIÉTAIRE", focusTitle:"Ce qui demande votre attention", metricBookings:"Réservations", metricServices:"Services", metricPublic:"Réservation publique", metricCompleted:"Visites terminées", metricBookingsCopy:"Chargement des réservations réelles", metricServicesCopy:"Catalogue actuel", metricPublicCopy:"État du lien réel", metricCompletedCopy:"Dérivé des statuts de réservation", growthKicker:"CROISSANCE · ACTIVITÉ RÉELLE UNIQUEMENT", growthTitle:"Client → réservation → visite terminée", growthCopy:"Aucun revenu ni taux de conversion inventé. Cette vue utilise seulement l’activité persistée.", statuses:["Confirmées","En cours","Terminées","Annulées"], crm:"Ouvrir le CRM clients ↗", ready:"Prêt", setup:"Configurer", notReady:"Non prêt", noBookings:"Aucune réservation", greeting:(name)=>name?`Bonjour, ${name}.`:"Espace propriétaire", shopSaved:"Profil atelier enregistré", publicReady:"Le lien public est prêt.", publicCheck:"Vérifiez la configuration du lien public.", addService:"Ajoutez le premier service", addServiceCopy:"Le client ne peut pas choisir de service tant que le catalogue est vide.", liveServices:(n)=>`${n} service${n===1?"":"s"} actif${n===1?"":"s"}`, liveServicesCopy:"C’est le catalogue visible par les clients.", review:(n)=>`Voir ${n} réservation${n===1?"":"s"}`, statusSummary:(c,p,d)=>`${c} confirmées · ${p} en cours · ${d} terminées.`, share:"Partagez le lien de réservation", finish:"Terminez d’abord la configuration", shareCopy:"Le prochain signal réel est la première réservation client.", finishCopy:"Profil et services avant l’acquisition.", defaultAI:"Terminez la configuration réelle avant d’attirer du trafic.", defaultAICopy:"Hermes lit l’état du profil, des services et des réservations déjà chargés.", aiAdd:"Profil enregistré. Ajoutez maintenant le premier service réservable.", aiAddCopy:"C’est la première étape d’activation encore ouverte dans les données réelles.", aiReady:"La réservation est prête. La prochaine preuve est une réservation réelle.", aiSetup:"Les services sont actifs. Terminez le lien public.", aiReadyCopy:"Partagez le lien réel et mesurez jusqu’à la première visite terminée.", aiSetupCopy:"Hermes ne considère pas l’activation terminée tant que le parcours client n'est pas prêt.", aiBookings:(n)=>`${n} réservation${n===1?"":"s"} réelle${n===1?"":"s"} dans l’espace.`, aiBookingsCopy:(c,p,d,x)=>`${c} confirmées, ${p} en cours, ${d} terminées, ${x} annulées. Gérez d’abord les statuts et le suivi avant d’ajouter des fonctions.`
    }
  };

  const num = (selector) => {
    const raw = document.querySelector(selector)?.textContent || "";
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };
  const publicReady = () => !document.getElementById("public-link-wrap")?.classList.contains("hidden");
  const profileReady = () => publicReady() || ["shop-name","shop-city","shop-state","shop-timezone"].every((id) => {
    const field = document.getElementById(id);
    return (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && field.value.trim();
  });
  const status = () => ({
    confirmed: document.querySelectorAll("#bookings-list .status-confirmed").length,
    inProgress: document.querySelectorAll("#bookings-list .status-in_progress").length,
    completed: document.querySelectorAll("#bookings-list .status-completed").length,
    cancelled: document.querySelectorAll("#bookings-list .status-cancelled").length,
  });
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node && node.textContent !== value) node.textContent = value; };

  const positionPanels = () => {
    const shell = document.querySelector(".hc-owner-live-page .shell");
    const overview = document.querySelector(".hc-owner-live-overview");
    if (!(shell instanceof HTMLElement) || !(overview instanceof HTMLElement)) return false;
    const access = shell.querySelector("[data-web-v1-access]");
    const activation = shell.querySelector("[data-repair-activation]");
    let anchor = overview;
    if (access instanceof HTMLElement) {
      access.classList.add("hc-owner-live-operational-panel");
      if (access.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", access);
      anchor = access;
    }
    if (activation instanceof HTMLElement) {
      activation.classList.add("hc-owner-live-operational-panel", "hc-owner-live-activation-panel");
      if (activation.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend", activation);
    }
    return true;
  };

  const localizeShell = () => {
    if (!document.querySelector('[data-hc-owner-workspace="live"]')) return;
    const locale = getLocale();
    const t = strings[locale] || strings.en;
    const nav = Array.from(document.querySelectorAll(".hc-owner-live-nav a"));
    nav.forEach((link, index) => {
      const number = link.querySelector("span")?.outerHTML || "";
      const count = link.querySelector("em")?.outerHTML || "";
      const desired = `${number}${t.nav[index] || ""}${count ? ` ${count}` : ""}`;
      if (link.innerHTML !== desired) link.innerHTML = desired;
    });
    Array.from(document.querySelectorAll(".hc-owner-live-mobile-nav a")).forEach((link, index) => setText(`.hc-owner-live-mobile-nav a:nth-child(${index + 1})`, t.nav[index]));
    setText(".hc-owner-live-switcher>span", t.workspace);
    setText(".hc-owner-live-brand small", t.ownerWorkspace);
    setText(".hc-owner-live-role span", t.role);
    setText(".hc-owner-live-role strong", t.owner);
    setText(".hc-owner-live-role small", t.future);
    setText(".hc-owner-live-mobilebar>a:last-child", `✦ ${t.ask}`);
    setText(".hc-owner-live-topbar>div>p", t.top);
    setText(".hc-owner-live-top-actions a", `${t.customers} ↗`);
    setText(".hc-owner-live-logout", t.logout);
    setText(".hc-owner-live-intelligence>div>small", t.intelligenceKicker);
    setText("[data-hc-intelligence-primary]", t.openNext);
    setText(".hc-owner-live-intelligence-actions a:last-child", t.reviewBookings);
    setText(".hc-owner-live-focus>small", t.focusKicker);
    setText(".hc-owner-live-focus>h2", t.focusTitle);

    const metricArticles = Array.from(document.querySelectorAll(".hc-owner-live-metrics article"));
    const metricLabels = [t.metricBookings,t.metricServices,t.metricPublic,t.metricCompleted];
    const metricCopies = [t.metricBookingsCopy,t.metricServicesCopy,t.metricPublicCopy,t.metricCompletedCopy];
    metricArticles.forEach((article,index)=>{ const label=article.querySelector("span"); const copy=article.querySelector("small"); if(label) label.textContent=metricLabels[index]; if(copy && index!==0) copy.textContent=metricCopies[index]; });

    setText(".hc-owner-live-growth>div>small", t.growthKicker);
    setText(".hc-owner-live-growth>div>h2", t.growthTitle);
    setText(".hc-owner-live-growth>div>p", t.growthCopy);
    Array.from(document.querySelectorAll(".hc-owner-live-growth-stats span")).forEach((node,index)=>{ const b=node.querySelector("b"); if(!b)return; const value=b.textContent||"—"; node.innerHTML=`<b>${value}</b>${t.statuses[index]}`; });
    setText(".hc-owner-live-growth>a", t.crm);

    const bookings = num("[data-hc-metric-bookings]");
    const services = num("[data-hc-metric-services]");
    const s = status();
    const ready = publicReady();
    const profile = profileReady();
    setText("[data-hc-metric-public]", ready ? t.ready : profile ? t.setup : t.notReady);
    setText("[data-hc-metric-bookings-copy]", bookings===0 ? t.noBookings : t.statusSummary(s.confirmed,s.inProgress,s.completed));

    const rawOwner = document.getElementById("owner-summary")?.textContent?.trim() || "";
    const ownerName = rawOwner && !rawOwner.toLowerCase().includes("loading") ? rawOwner.split(" · ")[0].trim() : "";
    setText("[data-hc-owner-greeting]", t.greeting(ownerName));

    const focus = [];
    focus.push(profile ? [t.shopSaved, ready ? t.publicReady : t.publicCheck, "#settings"] : [t.finish, t.finishCopy, "#settings"]);
    focus.push(services>0 ? [t.liveServices(services), t.liveServicesCopy, "#services"] : [t.addService,t.addServiceCopy,"#services"]);
    focus.push(bookings>0 ? [t.review(bookings),t.statusSummary(s.confirmed,s.inProgress,s.completed),"#bookings"] : [ready?t.share:t.finish,ready?t.shareCopy:t.finishCopy,"#settings"]);
    const focusList = document.querySelector("[data-hc-focus-list]");
    if (focusList) focusList.innerHTML = focus.map((item,index)=>`<a href="${item[2]}"><span>0${index+1}</span><p><strong>${item[0]}</strong><small>${item[1]}</small></p><b>↗</b></a>`).join("");

    let title=t.defaultAI, copy=t.defaultAICopy, href="#settings";
    if(profile && services===0){title=t.aiAdd;copy=t.aiAddCopy;href="#services";}
    else if(profile && services>0 && bookings===0){title=ready?t.aiReady:t.aiSetup;copy=ready?t.aiReadyCopy:t.aiSetupCopy;href="#settings";}
    else if(bookings>0){title=t.aiBookings(bookings);copy=t.aiBookingsCopy(s.confirmed,s.inProgress,s.completed,s.cancelled);href="#bookings";}
    setText("[data-hc-intelligence-title]",title);
    setText("[data-hc-intelligence-copy]",copy);
    const primary=document.querySelector("[data-hc-intelligence-primary]"); if(primary instanceof HTMLAnchorElement) primary.href=href;
  };

  const refresh = () => { positionPanels(); localizeShell(); };
  window.HermesOwnerBridge = { refresh, localizeShell };

  const install = () => {
    const shell = document.querySelector(".workspace-page .shell");
    if (!(shell instanceof HTMLElement)) return;
    refresh();
    const shellObserver = new MutationObserver(() => queueMicrotask(refresh));
    shellObserver.observe(shell, { childList: true });
    for (const id of ["owner-summary","profile-state","service-count","booking-count","public-link-wrap","bookings-list"]) {
      const node=document.getElementById(id); if(node) new MutationObserver(()=>queueMicrotask(refresh)).observe(node,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class"]});
    }
    window.setTimeout(refresh,80); window.setTimeout(refresh,300); window.setTimeout(refresh,900);
  };

  const waitForShell = () => {
    if (document.querySelector('[data-hc-owner-workspace="live"]')) return install();
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-hc-owner-workspace="live"]')) return;
      observer.disconnect(); install();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForShell, { once: true });
  else waitForShell();
})();