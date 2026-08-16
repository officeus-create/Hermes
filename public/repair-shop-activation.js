(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const SUPPORTED = ["en", "ru", "uk", "es", "it", "fr"];
  const requestedLocale = new URLSearchParams(window.location.search).get("lang");
  const documentLocale = document.documentElement.lang;
  const locale = SUPPORTED.includes(requestedLocale) ? requestedLocale : SUPPORTED.includes(documentLocale) ? documentLocale : "en";

  const strings = {
    en: {
      repairShops: "Repair Shops", workspace: "Repair Shop workspace", authTitle: "Repair Shop access",
      authCopy: "Sign in or create your repair shop account to manage services, booking hours, appointments, and customers.",
      ownerWorkspace: "Owner workspace", shopData: "Shop data", schedule: "Booking schedule",
      scheduleCopy: "Set one booking window per day. Times use your saved shop timezone.",
      scheduleNote: "Customer booking times are generated from these hours, each service duration, and existing appointments.",
      bookingLoading: "Loading shop profile, services, and hours…", appointment: "Appointment",
      bookingCopy: "Choose a service and time. Repair pricing is set by the shop.", bookingCreated: "Booking created",
      customersCopy: "Customers and vehicle history from this shop’s bookings.", currentProduct: "CURRENT PRODUCT",
      eyebrow: "Shop setup", title: "Get your shop ready for customers",
      intro: "Finish the essentials, share your booking link, and process the first appointment from request to completion.",
      profile: "Shop profile", services: "3 services", availability: "Booking hours", shared: "Share booking link", booking: "First booking", completed: "Completed booking",
      nextProfile: "Next: save your shop profile.", nextServices: "Next: add at least three services customers can book.",
      nextAvailability: "Next: set the hours customers can book.", nextShared: "Your booking link is ready. Open or share it with a customer.",
      nextBooking: "The link is ready. Use it for a test or real customer booking.", nextCompleted: "Your first booking arrived. Move it through the workflow to Completed.",
      nextReady: "Your first-value loop is complete. Decide whether to keep Hermes Connect active with the Founding Shop Plan.",
      completeProfile: "Complete profile", addServices: "Add services", setHours: "Set booking hours", shareLink: "Open booking link", checkBookings: "View booking link", completeBooking: "Open booking inbox",
      requestActivation: "Request paid activation", viewPlan: "View $99 Founding Plan", ready: "complete"
    },
    ru: {
      repairShops: "СТО", workspace: "Рабочее пространство СТО", authTitle: "Доступ владельца СТО",
      authCopy: "Войдите или создайте аккаунт СТО, чтобы управлять услугами, часами записи, заявками и клиентами.",
      ownerWorkspace: "Рабочее пространство владельца", shopData: "Данные СТО", schedule: "Расписание записи",
      scheduleCopy: "Укажите одно окно записи на каждый день. Время используется в часовом поясе вашего СТО.",
      scheduleNote: "Доступные клиентам интервалы рассчитываются из этих часов, длительности услуг и уже созданных записей.",
      bookingLoading: "Загружаем профиль СТО, услуги и часы работы…", appointment: "Запись на сервис",
      bookingCopy: "Выберите услугу и время. Стоимость ремонта устанавливает СТО.", bookingCreated: "Запись создана",
      customersCopy: "Клиенты и история автомобилей из записей этого СТО.", currentProduct: "ТЕКУЩИЙ ПРОДУКТ",
      eyebrow: "Настройка СТО", title: "Подготовьте СТО к приёму клиентов",
      intro: "Завершите основные настройки, поделитесь ссылкой и проведите первую запись от заявки до завершения.",
      profile: "Профиль СТО", services: "3 услуги", availability: "Часы записи", shared: "Поделиться ссылкой", booking: "Первая запись", completed: "Завершённая запись",
      nextProfile: "Далее: сохраните профиль СТО.", nextServices: "Далее: добавьте минимум три услуги для записи.",
      nextAvailability: "Далее: укажите часы, доступные клиентам для записи.", nextShared: "Ссылка готова. Откройте её или отправьте клиенту.",
      nextBooking: "Ссылка готова. Создайте тестовую или реальную запись клиента.", nextCompleted: "Первая запись получена. Проведите её по процессу до статуса «Завершено».",
      nextReady: "Первый полный цикл завершён. Решите, хотите ли вы продолжать пользоваться Hermes Connect по Founding Shop Plan.",
      completeProfile: "Заполнить профиль", addServices: "Добавить услуги", setHours: "Настроить часы", shareLink: "Открыть ссылку записи", checkBookings: "Открыть запись", completeBooking: "Открыть входящие записи",
      requestActivation: "Запросить платную активацию", viewPlan: "Тариф Founding — $99", ready: "готово"
    },
    uk: {
      repairShops: "СТО", workspace: "Робочий простір СТО", authTitle: "Доступ власника СТО",
      authCopy: "Увійдіть або створіть акаунт СТО, щоб керувати послугами, годинами запису, заявками та клієнтами.",
      ownerWorkspace: "Робочий простір власника", shopData: "Дані СТО", schedule: "Розклад запису",
      scheduleCopy: "Вкажіть одне вікно запису на кожен день. Час використовується в часовому поясі вашого СТО.",
      scheduleNote: "Доступні клієнтам інтервали розраховуються з цих годин, тривалості послуг і вже створених записів.",
      bookingLoading: "Завантажуємо профіль СТО, послуги та години роботи…", appointment: "Запис на сервіс",
      bookingCopy: "Оберіть послугу та час. Вартість ремонту встановлює СТО.", bookingCreated: "Запис створено",
      customersCopy: "Клієнти та історія автомобілів із записів цього СТО.", currentProduct: "ПОТОЧНИЙ ПРОДУКТ",
      eyebrow: "Налаштування СТО", title: "Підготуйте СТО до прийому клієнтів",
      intro: "Завершіть основні налаштування, поділіться посиланням і проведіть перший запис від заявки до завершення.",
      profile: "Профіль СТО", services: "3 послуги", availability: "Години запису", shared: "Поділитися посиланням", booking: "Перший запис", completed: "Завершений запис",
      nextProfile: "Далі: збережіть профіль СТО.", nextServices: "Далі: додайте щонайменше три послуги для запису.",
      nextAvailability: "Далі: вкажіть години, доступні клієнтам для запису.", nextShared: "Посилання готове. Відкрийте його або надішліть клієнту.",
      nextBooking: "Посилання готове. Створіть тестовий або реальний запис клієнта.", nextCompleted: "Перший запис отримано. Проведіть його до статусу «Завершено».",
      nextReady: "Перший повний цикл завершено. Вирішіть, чи хочете продовжувати користуватися Hermes Connect за Founding Shop Plan.",
      completeProfile: "Заповнити профіль", addServices: "Додати послуги", setHours: "Налаштувати години", shareLink: "Відкрити запис", checkBookings: "Відкрити запис", completeBooking: "Відкрити вхідні записи",
      requestActivation: "Запросити платну активацію", viewPlan: "Тариф Founding — $99", ready: "готово"
    },
    es: {
      repairShops: "Talleres", workspace: "Espacio del taller", authTitle: "Acceso del propietario del taller",
      authCopy: "Inicia sesión o crea la cuenta del taller para gestionar servicios, horarios, citas y clientes.",
      ownerWorkspace: "Espacio del propietario", shopData: "Datos del taller", schedule: "Horario de reservas",
      scheduleCopy: "Define una ventana de reservas por día. Las horas usan la zona horaria guardada del taller.",
      scheduleNote: "Los horarios disponibles se calculan con estas horas, la duración de cada servicio y las citas existentes.",
      bookingLoading: "Cargando perfil, servicios y horarios del taller…", appointment: "Cita",
      bookingCopy: "Elige un servicio y una hora. El taller establece el precio de la reparación.", bookingCreated: "Cita creada",
      customersCopy: "Clientes e historial de vehículos de las reservas de este taller.", currentProduct: "PRODUCTO ACTUAL",
      eyebrow: "Configuración del taller", title: "Prepara tu taller para recibir clientes",
      intro: "Completa lo esencial, comparte el enlace y procesa la primera cita desde la solicitud hasta completarla.",
      profile: "Perfil del taller", services: "3 servicios", availability: "Horario", shared: "Compartir enlace", booking: "Primera reserva", completed: "Reserva completada",
      nextProfile: "Siguiente: guarda el perfil del taller.", nextServices: "Siguiente: añade al menos tres servicios reservables.",
      nextAvailability: "Siguiente: define las horas que los clientes pueden reservar.", nextShared: "El enlace está listo. Ábrelo o compártelo con un cliente.",
      nextBooking: "El enlace está listo. Crea una reserva de prueba o de un cliente real.", nextCompleted: "Llegó la primera reserva. Llévala por el flujo hasta Completada.",
      nextReady: "El primer ciclo de valor está completo. Decide si quieres mantener Hermes Connect con el Founding Shop Plan.",
      completeProfile: "Completar perfil", addServices: "Añadir servicios", setHours: "Definir horarios", shareLink: "Abrir enlace", checkBookings: "Abrir reserva", completeBooking: "Abrir reservas",
      requestActivation: "Solicitar activación de pago", viewPlan: "Plan Founding — $99", ready: "completo"
    },
    it: {
      repairShops: "Officine", workspace: "Area officina", authTitle: "Accesso proprietario officina",
      authCopy: "Accedi o crea l’account dell’officina per gestire servizi, orari, appuntamenti e clienti.",
      ownerWorkspace: "Area proprietario", shopData: "Dati officina", schedule: "Orari prenotazioni",
      scheduleCopy: "Imposta una finestra di prenotazione al giorno. Gli orari usano il fuso orario salvato dell’officina.",
      scheduleNote: "Gli orari prenotabili sono calcolati da queste ore, dalla durata dei servizi e dagli appuntamenti esistenti.",
      bookingLoading: "Caricamento profilo, servizi e orari dell’officina…", appointment: "Appuntamento",
      bookingCopy: "Scegli un servizio e un orario. Il prezzo della riparazione è stabilito dall’officina.", bookingCreated: "Prenotazione creata",
      customersCopy: "Clienti e storico veicoli dalle prenotazioni di questa officina.", currentProduct: "PRODOTTO ATTUALE",
      eyebrow: "Configurazione officina", title: "Prepara l’officina per i clienti",
      intro: "Completa gli elementi essenziali, condividi il link e gestisci il primo appuntamento dalla richiesta al completamento.",
      profile: "Profilo officina", services: "3 servizi", availability: "Orari", shared: "Condividi link", booking: "Prima prenotazione", completed: "Prenotazione completata",
      nextProfile: "Prossimo passo: salva il profilo dell’officina.", nextServices: "Prossimo passo: aggiungi almeno tre servizi prenotabili.",
      nextAvailability: "Prossimo passo: imposta gli orari prenotabili.", nextShared: "Il link è pronto. Aprilo o condividilo con un cliente.",
      nextBooking: "Il link è pronto. Crea una prenotazione di prova o reale.", nextCompleted: "È arrivata la prima prenotazione. Portala fino allo stato Completata.",
      nextReady: "Il primo ciclo di valore è completo. Decidi se mantenere Hermes Connect con il Founding Shop Plan.",
      completeProfile: "Completa profilo", addServices: "Aggiungi servizi", setHours: "Imposta orari", shareLink: "Apri link", checkBookings: "Apri prenotazione", completeBooking: "Apri prenotazioni",
      requestActivation: "Richiedi attivazione a pagamento", viewPlan: "Piano Founding — $99", ready: "completo"
    },
    fr: {
      repairShops: "Ateliers", workspace: "Espace atelier", authTitle: "Accès propriétaire d’atelier",
      authCopy: "Connectez-vous ou créez le compte de l’atelier pour gérer services, horaires, rendez-vous et clients.",
      ownerWorkspace: "Espace propriétaire", shopData: "Données de l’atelier", schedule: "Horaires de réservation",
      scheduleCopy: "Définissez une plage de réservation par jour. Les heures utilisent le fuseau horaire enregistré de l’atelier.",
      scheduleNote: "Les créneaux disponibles sont calculés à partir de ces heures, de la durée des services et des rendez-vous existants.",
      bookingLoading: "Chargement du profil, des services et des horaires de l’atelier…", appointment: "Rendez-vous",
      bookingCopy: "Choisissez un service et une heure. Le prix de la réparation est fixé par l’atelier.", bookingCreated: "Réservation créée",
      customersCopy: "Clients et historique des véhicules issus des réservations de cet atelier.", currentProduct: "PRODUIT ACTUEL",
      eyebrow: "Configuration de l’atelier", title: "Préparez votre atelier à recevoir des clients",
      intro: "Terminez l’essentiel, partagez le lien et traitez le premier rendez-vous de la demande jusqu’à la fin.",
      profile: "Profil atelier", services: "3 services", availability: "Horaires", shared: "Partager le lien", booking: "Première réservation", completed: "Réservation terminée",
      nextProfile: "Ensuite : enregistrez le profil de l’atelier.", nextServices: "Ensuite : ajoutez au moins trois services réservables.",
      nextAvailability: "Ensuite : définissez les heures réservables.", nextShared: "Le lien est prêt. Ouvrez-le ou partagez-le avec un client.",
      nextBooking: "Le lien est prêt. Créez une réservation test ou réelle.", nextCompleted: "La première réservation est arrivée. Faites-la passer jusqu’au statut Terminée.",
      nextReady: "Le premier cycle de valeur est terminé. Décidez si vous souhaitez conserver Hermes Connect avec le Founding Shop Plan.",
      completeProfile: "Compléter le profil", addServices: "Ajouter des services", setHours: "Définir les horaires", shareLink: "Ouvrir le lien", checkBookings: "Ouvrir la réservation", completeBooking: "Ouvrir les réservations",
      requestActivation: "Demander l’activation payante", viewPlan: "Plan Founding — $99", ready: "terminé"
    }
  };

  const t = strings[locale] || strings.en;
  const $ = (selector, root = document) => root.querySelector(selector);

  function withLocale(href) {
    if (!href || href.startsWith("#")) return href;
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function setText(selector, value, root = document) {
    const element = $(selector, root);
    if (element) element.textContent = value;
  }

  function replaceText(root, replacements) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeValue) {
        let next = node.nodeValue;
        for (const [from, to] of replacements) next = next.replaceAll(from, to);
        node.nodeValue = next;
      }
      node = walker.nextNode();
    }
  }

  function cleanProductContext() {
    const context = $("[data-hc-product-context]");
    if (!context) return;
    replaceText(context, [
      ["CURRENT LIVE PILOT", t.currentProduct],
      ["ТЕКУЩИЙ ЖИВОЙ ПИЛОТ", t.currentProduct],
      ["ПОТОЧНИЙ ЖИВИЙ ПІЛОТ", t.currentProduct],
      ["PILOTO ACTUAL EN VIVO", t.currentProduct],
      ["PILOTA LIVE ATTUALE", t.currentProduct],
      ["PILOTE ACTUEL EN DIRECT", t.currentProduct],
    ]);
  }

  function cleanAuth() {
    setText(".auth-card > h1", t.authTitle);
    setText(".auth-card > p.muted", t.authCopy);
    const bio = $("#reg-bio");
    if (bio instanceof HTMLTextAreaElement || bio instanceof HTMLInputElement) bio.value = "Independent repair shop using Hermes Connect.";
    replaceText(document.body, [["Back to Partner Portal", t.repairShops], ["out-bound beta", "Hermes Connect"]]);
  }

  function cleanDashboard() {
    setText(".workspace-header h1", t.workspace);
    replaceText(document.body, [
      ["Repair Shop Beta", t.repairShops],
      ["Private beta", t.ownerWorkspace],
      ["Real D1 data", t.shopData],
      ["Shop profile saved to production.", "Shop profile saved."],
      ["Your real services are used by the public booking flow.", "These services are shown to customers in your booking flow."],
    ]);
  }

  function cleanAvailability() {
    setText(".panel-heading .eyebrow", t.schedule);
    setText(".panel-heading .muted", t.scheduleCopy);
    setText(".note-panel .muted", t.scheduleNote);
    replaceText(document.body, [["Production D1 schedule", t.schedule]]);
  }

  function cleanBooking() {
    setText(".hero .muted", t.bookingLoading);
    setText("#booking-panel .panel-heading .eyebrow", t.appointment);
    setText("#booking-panel .panel-heading .muted", t.bookingCopy);
    setText("#success-panel .eyebrow", t.bookingCreated);
    replaceText(document.body, [["Repair Shop Beta", t.repairShops], ["Production booking created", t.bookingCreated]]);
  }

  function cleanCustomers() {
    setText(".customers-page .hero .muted", t.customersCopy);
  }

  async function readJson(url) {
    try {
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  function shareKey(slug) {
    return slug ? `hc_repair_shop_shared:${slug}` : "";
  }

  function readShared(slug) {
    const key = shareKey(slug);
    if (!key) return false;
    try { return localStorage.getItem(key) === "1"; } catch { return false; }
  }

  function storeShared(slug) {
    const key = shareKey(slug);
    if (!key) return;
    try { localStorage.setItem(key, "1"); } catch {}
  }

  async function mountActivationPanel(refresh = false) {
    if (path !== `${ROOT}/dashboard`) return;
    const shell = $(".workspace-page .shell");
    const header = $(".workspace-header", shell || document);
    if (!shell || !header) return;

    const existing = $("[data-repair-activation]", shell);
    if (existing && !refresh) return;
    existing?.remove();

    const [profileData, servicesData, availabilityData, bookingsData] = await Promise.all([
      readJson("/api/repair-shop/profile"), readJson("/api/services"), readJson("/api/repair-shop/availability"), readJson("/api/repair-shop/bookings"),
    ]);

    const profile = Boolean(profileData?.success && profileData?.shop?.name && profileData?.shop?.city && profileData?.shop?.state && profileData?.shop?.timezone);
    const serviceCount = servicesData?.success && Array.isArray(servicesData.services) ? servicesData.services.length : 0;
    const services = serviceCount >= 3;
    const availability = Boolean(availabilityData?.success && Array.isArray(availabilityData.days) && availabilityData.days.some((day) => day?.is_open));
    const bookingItems = bookingsData?.success && Array.isArray(bookingsData.bookings) ? bookingsData.bookings : [];
    const booking = bookingItems.length > 0;
    const completed = bookingItems.some((item) => item?.status === "completed");
    const slug = profileData?.shop?.slug ? String(profileData.shop.slug) : "";
    const shared = Boolean(slug && (readShared(slug) || booking));
    const states = [profile, services, availability, shared, booking, completed];
    const completedCount = states.filter(Boolean).length;
    const percent = Math.round((completedCount / states.length) * 100);
    const bookingUrl = slug ? `${ROOT}/booking/?shop=${encodeURIComponent(slug)}` : `${ROOT}/booking/`;

    let nextCopy = t.nextProfile;
    let nextHref = "#profile-form";
    let nextLabel = t.completeProfile;
    let shareAction = false;
    if (profile && !services) { nextCopy = t.nextServices; nextHref = "#service-form"; nextLabel = t.addServices; }
    else if (profile && services && !availability) { nextCopy = t.nextAvailability; nextHref = `${ROOT}/availability/`; nextLabel = t.setHours; }
    else if (profile && services && availability && !shared) { nextCopy = t.nextShared; nextHref = bookingUrl; nextLabel = t.shareLink; shareAction = true; }
    else if (profile && services && availability && shared && !booking) { nextCopy = t.nextBooking; nextHref = bookingUrl; nextLabel = t.checkBookings; }
    else if (profile && services && availability && shared && booking && !completed) { nextCopy = t.nextCompleted; nextHref = "#bookings-title"; nextLabel = t.completeBooking; }
    else if (states.every(Boolean)) { nextCopy = t.nextReady; nextHref = `${ROOT}/plan/`; nextLabel = t.requestActivation; }

    const localizedNextHref = withLocale(nextHref);
    const localizedPlanHref = withLocale(`${ROOT}/plan/`);
    const labels = [t.profile, t.services, t.availability, t.shared, t.booking, t.completed];

    const panel = document.createElement("section");
    panel.className = "repair-activation-panel";
    panel.dataset.repairActivation = "true";
    panel.innerHTML = `
      <div class="repair-activation-head">
        <div><p class="repair-activation-eyebrow">${t.eyebrow}</p><h2>${t.title}</h2><p class="repair-activation-copy">${t.intro}</p></div>
        <div class="repair-activation-progress">${completedCount}/6 ${t.ready}</div>
      </div>
      <div class="repair-activation-track" aria-hidden="true"><div class="repair-activation-fill" style="width:${percent}%"></div></div>
      <ol class="repair-activation-steps">
        ${labels.map((label, index) => `<li class="repair-activation-step" data-complete="${states[index]}"><strong>${states[index] ? "✓" : index + 1}</strong><span>${label}</span></li>`).join("")}
      </ol>
      <div class="repair-activation-actions">
        <a class="repair-activation-primary" data-repair-next${shareAction ? " data-repair-share" : ""} href="${localizedNextHref}">${nextLabel}</a>
        <a class="repair-activation-secondary" data-repair-plan href="${localizedPlanHref}">${t.viewPlan}</a>
        <p class="repair-activation-next">${nextCopy}</p>
      </div>`;
    header.insertAdjacentElement("afterend", panel);

    const next = $("[data-repair-next]", panel);
    if (next && nextHref.includes("/booking/")) {
      next.setAttribute("target", "_blank");
      next.setAttribute("rel", "noopener");
    }
    if (next && shareAction) {
      next.addEventListener("click", () => {
        storeShared(slug);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "connect_shop_share_link", product: "repair_shops" });
        window.setTimeout(() => mountActivationPanel(true), 0);
      }, { once: true });
    }
    $("[data-repair-plan]", panel)?.addEventListener("click", () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "connect_shop_plan_view", product: "repair_shops" });
    });
    if (states.every(Boolean)) {
      next?.addEventListener("click", () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "connect_shop_paid_cta", product: "repair_shops" });
      });
    }

    if (!refresh) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "connect_shop_activation_view",
        completed_steps: completedCount,
        profile_ready: profile,
        services_ready: services,
        availability_ready: availability,
        link_shared: shared,
        first_booking: booking,
        first_completed_booking: completed,
      });
    }
  }

  function applySurfaceCopy() {
    cleanProductContext();
    if (path === `${ROOT}/auth`) cleanAuth();
    else if (path === `${ROOT}/dashboard`) cleanDashboard();
    else if (path === `${ROOT}/availability`) cleanAvailability();
    else if (path === `${ROOT}/booking`) cleanBooking();
    else if (path === `${ROOT}/customers`) cleanCustomers();
  }

  async function initialize() {
    applySurfaceCopy();
    window.setTimeout(applySurfaceCopy, 120);
    await mountActivationPanel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();