(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const locale = ["en", "ru", "uk", "es", "it", "fr"].includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "en";

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
      intro: "Finish the essentials, share your booking link, and use the first real booking to validate the workflow.",
      profile: "Shop profile", service: "First service", availability: "Booking hours", booking: "First booking",
      nextProfile: "Next: save your shop profile.", nextService: "Next: add at least one service customers can book.",
      nextAvailability: "Next: set the hours customers can book.", nextBooking: "Your booking link is ready. Share it with a customer and receive your first booking.",
      nextReady: "Your core setup is working. Keep Hermes Connect active with the Founding Shop Plan.",
      completeProfile: "Complete profile", addService: "Add first service", setHours: "Set booking hours", openLink: "Open booking link",
      requestActivation: "Request paid activation", viewPlan: "View $99 Founding Plan", ready: "ready"
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
      intro: "Завершите основные настройки, поделитесь ссылкой на запись и проверьте процесс на первой реальной записи.",
      profile: "Профиль СТО", service: "Первая услуга", availability: "Часы записи", booking: "Первая запись",
      nextProfile: "Далее: сохраните профиль СТО.", nextService: "Далее: добавьте хотя бы одну услугу для записи.",
      nextAvailability: "Далее: укажите часы, доступные клиентам для записи.", nextBooking: "Ссылка на запись готова. Отправьте её клиенту и получите первую запись.",
      nextReady: "Основной процесс работает. Подключите Founding Shop Plan, чтобы продолжать пользоваться Hermes Connect.",
      completeProfile: "Заполнить профиль", addService: "Добавить услугу", setHours: "Настроить часы", openLink: "Открыть ссылку записи",
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
      intro: "Завершіть основні налаштування, поділіться посиланням на запис і перевірте процес на першому реальному записі.",
      profile: "Профіль СТО", service: "Перша послуга", availability: "Години запису", booking: "Перший запис",
      nextProfile: "Далі: збережіть профіль СТО.", nextService: "Далі: додайте хоча б одну послугу для запису.",
      nextAvailability: "Далі: вкажіть години, доступні клієнтам для запису.", nextBooking: "Посилання на запис готове. Надішліть його клієнту та отримайте перший запис.",
      nextReady: "Основний процес працює. Підключіть Founding Shop Plan, щоб продовжувати користуватися Hermes Connect.",
      completeProfile: "Заповнити профіль", addService: "Додати послугу", setHours: "Налаштувати години", openLink: "Відкрити запис",
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
      intro: "Completa lo esencial, comparte tu enlace de reservas y valida el flujo con la primera cita real.",
      profile: "Perfil del taller", service: "Primer servicio", availability: "Horario de reservas", booking: "Primera reserva",
      nextProfile: "Siguiente: guarda el perfil del taller.", nextService: "Siguiente: añade al menos un servicio reservable.",
      nextAvailability: "Siguiente: define las horas que los clientes pueden reservar.", nextBooking: "Tu enlace de reservas está listo. Compártelo y recibe la primera reserva.",
      nextReady: "La configuración principal funciona. Mantén Hermes Connect activo con el Founding Shop Plan.",
      completeProfile: "Completar perfil", addService: "Añadir servicio", setHours: "Definir horarios", openLink: "Abrir enlace de reserva",
      requestActivation: "Solicitar activación de pago", viewPlan: "Plan Founding — $99", ready: "listo"
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
      intro: "Completa gli elementi essenziali, condividi il link di prenotazione e valida il flusso con il primo appuntamento reale.",
      profile: "Profilo officina", service: "Primo servizio", availability: "Orari prenotazioni", booking: "Prima prenotazione",
      nextProfile: "Prossimo passo: salva il profilo dell’officina.", nextService: "Prossimo passo: aggiungi almeno un servizio prenotabile.",
      nextAvailability: "Prossimo passo: imposta gli orari prenotabili.", nextBooking: "Il link di prenotazione è pronto. Condividilo e ricevi la prima prenotazione.",
      nextReady: "La configurazione principale funziona. Mantieni Hermes Connect attivo con il Founding Shop Plan.",
      completeProfile: "Completa profilo", addService: "Aggiungi servizio", setHours: "Imposta orari", openLink: "Apri prenotazione",
      requestActivation: "Richiedi attivazione a pagamento", viewPlan: "Piano Founding — $99", ready: "pronto"
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
      intro: "Terminez l’essentiel, partagez votre lien de réservation et validez le parcours avec le premier rendez-vous réel.",
      profile: "Profil atelier", service: "Premier service", availability: "Horaires", booking: "Première réservation",
      nextProfile: "Ensuite : enregistrez le profil de l’atelier.", nextService: "Ensuite : ajoutez au moins un service réservable.",
      nextAvailability: "Ensuite : définissez les heures réservables.", nextBooking: "Votre lien de réservation est prêt. Partagez-le et recevez la première réservation.",
      nextReady: "La configuration principale fonctionne. Gardez Hermes Connect actif avec le Founding Shop Plan.",
      completeProfile: "Compléter le profil", addService: "Ajouter un service", setHours: "Définir les horaires", openLink: "Ouvrir la réservation",
      requestActivation: "Demander l’activation payante", viewPlan: "Plan Founding — $99", ready: "prêt"
    }
  };

  const t = strings[locale] || strings.en;
  const $ = (selector, root = document) => root.querySelector(selector);

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

  async function mountActivationPanel() {
    if (path !== `${ROOT}/dashboard`) return;
    const shell = $(".workspace-page .shell");
    const header = $(".workspace-header", shell || document);
    if (!shell || !header || $("[data-repair-activation]", shell)) return;

    const [profileData, servicesData, availabilityData, bookingsData] = await Promise.all([
      readJson("/api/repair-shop/profile"), readJson("/api/services"), readJson("/api/repair-shop/availability"), readJson("/api/repair-shop/bookings"),
    ]);

    const profile = Boolean(profileData?.success && profileData?.shop);
    const services = Boolean(servicesData?.success && Array.isArray(servicesData.services) && servicesData.services.length > 0);
    const availability = Boolean(availabilityData?.success && Array.isArray(availabilityData.days) && availabilityData.days.some((day) => day?.is_open));
    const booking = Boolean(bookingsData?.success && Array.isArray(bookingsData.bookings) && bookingsData.bookings.length > 0);
    const complete = [profile, services, availability, booking];
    const completedCount = complete.filter(Boolean).length;
    const percent = completedCount * 25;
    const slug = profileData?.shop?.slug ? String(profileData.shop.slug) : "";
    const bookingUrl = slug ? `${ROOT}/booking/?shop=${encodeURIComponent(slug)}` : "";

    let nextCopy = t.nextProfile;
    let nextHref = "#profile-form";
    let nextLabel = t.completeProfile;
    if (profile && !services) { nextCopy = t.nextService; nextHref = "#service-form"; nextLabel = t.addService; }
    else if (profile && services && !availability) { nextCopy = t.nextAvailability; nextHref = `${ROOT}/availability/`; nextLabel = t.setHours; }
    else if (profile && services && availability && !booking) { nextCopy = t.nextBooking; nextHref = bookingUrl || `${ROOT}/booking/`; nextLabel = t.openLink; }
    else if (complete.every(Boolean)) { nextCopy = t.nextReady; nextHref = `${ROOT}/plan/`; nextLabel = t.requestActivation; }

    const panel = document.createElement("section");
    panel.className = "repair-activation-panel";
    panel.dataset.repairActivation = "true";
    panel.innerHTML = `
      <div class="repair-activation-head">
        <div><p class="repair-activation-eyebrow">${t.eyebrow}</p><h2>${t.title}</h2><p class="repair-activation-copy">${t.intro}</p></div>
        <div class="repair-activation-progress">${completedCount}/4 ${t.ready}</div>
      </div>
      <div class="repair-activation-track" aria-hidden="true"><div class="repair-activation-fill" style="width:${percent}%"></div></div>
      <ol class="repair-activation-steps">
        <li class="repair-activation-step" data-complete="${profile}"><strong>${profile ? "✓" : "1"}</strong><span>${t.profile}</span></li>
        <li class="repair-activation-step" data-complete="${services}"><strong>${services ? "✓" : "2"}</strong><span>${t.service}</span></li>
        <li class="repair-activation-step" data-complete="${availability}"><strong>${availability ? "✓" : "3"}</strong><span>${t.availability}</span></li>
        <li class="repair-activation-step" data-complete="${booking}"><strong>${booking ? "✓" : "4"}</strong><span>${t.booking}</span></li>
      </ol>
      <div class="repair-activation-actions">
        <a class="repair-activation-primary" data-repair-next href="${nextHref}">${nextLabel}</a>
        <a class="repair-activation-secondary" href="${ROOT}/plan/">${t.viewPlan}</a>
        <p class="repair-activation-next">${nextCopy}</p>
      </div>`;
    header.insertAdjacentElement("afterend", panel);

    if (bookingUrl && nextHref === bookingUrl) {
      const next = $("[data-repair-next]", panel);
      next?.setAttribute("target", "_blank");
      next?.setAttribute("rel", "noopener");
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "connect_shop_activation_view",
      completed_steps: completedCount,
      profile_ready: profile,
      service_ready: services,
      availability_ready: availability,
      first_booking: booking,
    });
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
