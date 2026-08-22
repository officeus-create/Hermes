(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("lang") || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";

  if (path === `${ROOT}/auth` && !params.has("lang")) {
    try {
      const referrer = new URL(document.referrer);
      const refLang = (referrer.searchParams.get("lang") || "").toLowerCase();
      if (referrer.origin === window.location.origin && referrer.pathname.startsWith(ROOT) && supported.has(refLang) && refLang !== "en") {
        const next = new URL(window.location.href);
        next.searchParams.set("lang", refLang);
        window.location.replace(`${next.pathname}${next.search}${next.hash}`);
      }
    } catch {}
    return;
  }

  if (![`${ROOT}/availability`, `${ROOT}/customers`].includes(path) || locale === "en") return;
  document.documentElement.lang = locale;

  const copy = {
    ru: {
      exact: {
        "Owner workspace":"Кабинет владельца", "Weekly availability":"Недельный график", "Logout":"Выйти", "Production D1 schedule":"Рабочий график D1", "Shop hours":"Часы работы СТО", "One continuous booking window per day for this beta. Times are interpreted in your saved shop timezone.":"Одно непрерывное окно записи в день. Время учитывается в часовом поясе вашего СТО.", "Save weekly availability":"Сохранить недельный график", "What this controls":"Что это определяет", "This schedule is stored for your shop only and is also exposed through your public shop profile. Customer bookable time slots will be generated from these hours and each service duration in the next production slice.":"Этот график хранится только для вашего СТО и используется в публичном профиле. Доступные клиентам интервалы формируются из этих часов и длительности услуг.",
        "Monday":"Понедельник", "Tuesday":"Вторник", "Wednesday":"Среда", "Thursday":"Четверг", "Friday":"Пятница", "Saturday":"Суббота", "Sunday":"Воскресенье", "to":"до",
        "Shop Owner Workspace":"Кабинет владельца СТО", "Customers":"Клиенты", "A private customer view built from your shop’s real Hermes Connect bookings and saved vehicle details.":"Приватная база клиентов, собранная из реальных записей Hermes Connect и сохранённых данных автомобилей.", "Loading customer history…":"Загружаем историю клиентов…", "No customers yet":"Клиентов пока нет", "Customers appear automatically after real bookings are created through your public booking link.":"Клиенты появятся автоматически после реальных записей через публичную ссылку.", "Upcoming":"Предстоящая запись", "Past customer":"Постоянный клиент", "Lead":"Новый клиент", "Last completed service":"Последнее завершённое обслуживание", "Services":"Услуги", "None yet":"Пока нет", "Vehicles":"Автомобили", "No vehicle details were captured for earlier bookings.":"Для предыдущих записей данные автомобиля не сохранены.", "Mileage not provided":"Пробег не указан"
      },
      placeholder:"Поиск по имени, email, телефону, автомобилю, VIN или услуге", customer:"клиент", customers:"клиентов", booking:"запись", bookings:"записей", completed:"завершено", next:"Следующая запись", at:"в", lastSeen:"Последний визит",
      alerts: {"Save your shop profile in the owner workspace before setting availability.":"Сначала сохраните профиль СТО в кабинете владельца.","Unable to load your secure session.":"Не удалось загрузить защищённую сессию.","Unable to load weekly availability.":"Не удалось загрузить недельный график.","Every open day must end after it starts.":"Для каждого рабочего дня время окончания должно быть позже начала.","Enter a valid start and end time for every open day.":"Укажите корректное время начала и окончания для каждого рабочего дня.","The full seven-day schedule is required.":"Нужно заполнить полный график на семь дней.","Unable to save weekly availability.":"Не удалось сохранить недельный график.","Weekly availability saved to production.":"Недельный график сохранён.","Network error while saving weekly availability.":"Ошибка сети при сохранении графика.","Logout failed.":"Не удалось выйти из аккаунта.","Unable to initialize availability settings.":"Не удалось открыть настройки графика.","Unable to verify your secure session.":"Не удалось проверить защищённую сессию.","Unable to load customers.":"Не удалось загрузить клиентов.","Unable to initialize customer history.":"Не удалось открыть историю клиентов."}
    },
    uk: {
      exact: {"Owner workspace":"Кабінет власника","Weekly availability":"Тижневий графік","Logout":"Вийти","Production D1 schedule":"Робочий графік D1","Shop hours":"Години роботи СТО","One continuous booking window per day for this beta. Times are interpreted in your saved shop timezone.":"Одне безперервне вікно запису на день. Час враховується у часовому поясі вашого СТО.","Save weekly availability":"Зберегти тижневий графік","What this controls":"Що це визначає","This schedule is stored for your shop only and is also exposed through your public shop profile. Customer bookable time slots will be generated from these hours and each service duration in the next production slice.":"Цей графік зберігається для вашого СТО та використовується у публічному профілі. Доступні клієнтам інтервали формуються з цих годин і тривалості послуг.","Monday":"Понеділок","Tuesday":"Вівторок","Wednesday":"Середа","Thursday":"Четвер","Friday":"П’ятниця","Saturday":"Субота","Sunday":"Неділя","to":"до","Shop Owner Workspace":"Кабінет власника СТО","Customers":"Клієнти","A private customer view built from your shop’s real Hermes Connect bookings and saved vehicle details.":"Приватна база клієнтів із реальних записів Hermes Connect і збережених даних автомобілів.","Loading customer history…":"Завантажуємо історію клієнтів…","No customers yet":"Клієнтів поки немає","Customers appear automatically after real bookings are created through your public booking link.":"Клієнти з’являться автоматично після реальних записів через публічне посилання.","Upcoming":"Майбутній запис","Past customer":"Постійний клієнт","Lead":"Новий клієнт","Last completed service":"Останнє завершене обслуговування","Services":"Послуги","None yet":"Поки немає","Vehicles":"Автомобілі","No vehicle details were captured for earlier bookings.":"Для попередніх записів дані автомобіля не збережено.","Mileage not provided":"Пробіг не вказано"},
      placeholder:"Пошук за ім’ям, email, телефоном, автомобілем, VIN або послугою", customer:"клієнт", customers:"клієнтів", booking:"запис", bookings:"записів", completed:"завершено", next:"Наступний запис", at:"о", lastSeen:"Останній візит",
      alerts: {"Save your shop profile in the owner workspace before setting availability.":"Спочатку збережіть профіль СТО у кабінеті власника.","Unable to load your secure session.":"Не вдалося завантажити захищену сесію.","Unable to load weekly availability.":"Не вдалося завантажити тижневий графік.","Every open day must end after it starts.":"Для кожного робочого дня час завершення має бути пізніше початку.","Enter a valid start and end time for every open day.":"Вкажіть коректний час початку та завершення для кожного робочого дня.","The full seven-day schedule is required.":"Потрібно заповнити повний графік на сім днів.","Unable to save weekly availability.":"Не вдалося зберегти тижневий графік.","Weekly availability saved to production.":"Тижневий графік збережено.","Network error while saving weekly availability.":"Помилка мережі під час збереження графіка.","Logout failed.":"Не вдалося вийти з акаунта.","Unable to initialize availability settings.":"Не вдалося відкрити налаштування графіка.","Unable to verify your secure session.":"Не вдалося перевірити захищену сесію.","Unable to load customers.":"Не вдалося завантажити клієнтів.","Unable to initialize customer history.":"Не вдалося відкрити історію клієнтів."}
    },
    es: {
      exact: {"Owner workspace":"Panel del propietario","Weekly availability":"Disponibilidad semanal","Logout":"Cerrar sesión","Production D1 schedule":"Horario operativo D1","Shop hours":"Horario del taller","One continuous booking window per day for this beta. Times are interpreted in your saved shop timezone.":"Una ventana continua de reservas por día. Las horas usan la zona horaria guardada del taller.","Save weekly availability":"Guardar disponibilidad","What this controls":"Qué controla","This schedule is stored for your shop only and is also exposed through your public shop profile. Customer bookable time slots will be generated from these hours and each service duration in the next production slice.":"Este horario se guarda para tu taller y se usa en el perfil público. Los intervalos reservables se generan a partir de estas horas y la duración de cada servicio.","Monday":"Lunes","Tuesday":"Martes","Wednesday":"Miércoles","Thursday":"Jueves","Friday":"Viernes","Saturday":"Sábado","Sunday":"Domingo","to":"a","Shop Owner Workspace":"Panel del propietario del taller","Customers":"Clientes","A private customer view built from your shop’s real Hermes Connect bookings and saved vehicle details.":"Vista privada de clientes basada en reservas reales de Hermes Connect y datos guardados de vehículos.","Loading customer history…":"Cargando historial de clientes…","No customers yet":"Aún no hay clientes","Customers appear automatically after real bookings are created through your public booking link.":"Los clientes aparecerán automáticamente después de reservas reales mediante tu enlace público.","Upcoming":"Próxima cita","Past customer":"Cliente anterior","Lead":"Cliente nuevo","Last completed service":"Último servicio completado","Services":"Servicios","None yet":"Aún ninguno","Vehicles":"Vehículos","No vehicle details were captured for earlier bookings.":"No se guardaron datos del vehículo en reservas anteriores.","Mileage not provided":"Kilometraje no indicado"},
      placeholder:"Buscar por nombre, email, teléfono, vehículo, VIN o servicio", customer:"cliente", customers:"clientes", booking:"reserva", bookings:"reservas", completed:"completadas", next:"Próxima", at:"a las", lastSeen:"Última visita",
      alerts: {"Save your shop profile in the owner workspace before setting availability.":"Guarda primero el perfil del taller en el panel del propietario antes de configurar la disponibilidad.","Unable to load your secure session.":"No se pudo cargar tu sesión segura.","Unable to load weekly availability.":"No se pudo cargar la disponibilidad semanal.","Every open day must end after it starts.":"Cada día abierto debe terminar después de la hora de inicio.","Enter a valid start and end time for every open day.":"Introduce una hora de inicio y fin válidas para cada día abierto.","The full seven-day schedule is required.":"Se requiere el horario completo de siete días.","Unable to save weekly availability.":"No se pudo guardar la disponibilidad semanal.","Weekly availability saved to production.":"Disponibilidad semanal guardada.","Network error while saving weekly availability.":"Error de red al guardar la disponibilidad semanal.","Logout failed.":"No se pudo cerrar la sesión.","Unable to initialize availability settings.":"No se pudieron abrir los ajustes de disponibilidad.","Unable to verify your secure session.":"No se pudo verificar tu sesión segura.","Unable to load customers.":"No se pudieron cargar los clientes.","Unable to initialize customer history.":"No se pudo abrir el historial de clientes."}
    },
    it: {
      exact: {"Owner workspace":"Area proprietario","Weekly availability":"Disponibilità settimanale","Logout":"Esci","Production D1 schedule":"Orario operativo D1","Shop hours":"Orari officina","One continuous booking window per day for this beta. Times are interpreted in your saved shop timezone.":"Una finestra continua di prenotazione al giorno. Gli orari usano il fuso orario salvato dell’officina.","Save weekly availability":"Salva disponibilità","What this controls":"Cosa controlla","This schedule is stored for your shop only and is also exposed through your public shop profile. Customer bookable time slots will be generated from these hours and each service duration in the next production slice.":"Questo orario è salvato per l’officina e usato nel profilo pubblico. Gli intervalli prenotabili derivano da questi orari e dalla durata dei servizi.","Monday":"Lunedì","Tuesday":"Martedì","Wednesday":"Mercoledì","Thursday":"Giovedì","Friday":"Venerdì","Saturday":"Sabato","Sunday":"Domenica","to":"a","Shop Owner Workspace":"Area proprietario officina","Customers":"Clienti","A private customer view built from your shop’s real Hermes Connect bookings and saved vehicle details.":"Vista privata clienti basata su prenotazioni Hermes Connect reali e dati veicolo salvati.","Loading customer history…":"Caricamento storico clienti…","No customers yet":"Nessun cliente per ora","Customers appear automatically after real bookings are created through your public booking link.":"I clienti appariranno automaticamente dopo prenotazioni reali tramite il link pubblico.","Upcoming":"Prossimo appuntamento","Past customer":"Cliente precedente","Lead":"Nuovo cliente","Last completed service":"Ultimo servizio completato","Services":"Servizi","None yet":"Nessuno","Vehicles":"Veicoli","No vehicle details were captured for earlier bookings.":"Nessun dato veicolo salvato per le prenotazioni precedenti.","Mileage not provided":"Chilometraggio non indicato"},
      placeholder:"Cerca per nome, email, telefono, veicolo, VIN o servizio", customer:"cliente", customers:"clienti", booking:"prenotazione", bookings:"prenotazioni", completed:"completate", next:"Prossimo", at:"alle", lastSeen:"Ultima visita",
      alerts: {"Save your shop profile in the owner workspace before setting availability.":"Salva prima il profilo dell’officina nell’area proprietario prima di impostare la disponibilità.","Unable to load your secure session.":"Impossibile caricare la sessione protetta.","Unable to load weekly availability.":"Impossibile caricare la disponibilità settimanale.","Every open day must end after it starts.":"Ogni giorno aperto deve terminare dopo l’orario di inizio.","Enter a valid start and end time for every open day.":"Inserisci un orario di inizio e fine valido per ogni giorno aperto.","The full seven-day schedule is required.":"È richiesto l’intero orario di sette giorni.","Unable to save weekly availability.":"Impossibile salvare la disponibilità settimanale.","Weekly availability saved to production.":"Disponibilità settimanale salvata.","Network error while saving weekly availability.":"Errore di rete durante il salvataggio della disponibilità settimanale.","Logout failed.":"Impossibile effettuare il logout.","Unable to initialize availability settings.":"Impossibile aprire le impostazioni di disponibilità.","Unable to verify your secure session.":"Impossibile verificare la sessione protetta.","Unable to load customers.":"Impossibile caricare i clienti.","Unable to initialize customer history.":"Impossibile aprire lo storico clienti."}
    },
    fr: {
      exact: {"Owner workspace":"Espace propriétaire","Weekly availability":"Disponibilités hebdomadaires","Logout":"Déconnexion","Production D1 schedule":"Planning opérationnel D1","Shop hours":"Horaires de l’atelier","One continuous booking window per day for this beta. Times are interpreted in your saved shop timezone.":"Une plage continue de réservation par jour. Les heures utilisent le fuseau horaire enregistré de l’atelier.","Save weekly availability":"Enregistrer les disponibilités","What this controls":"Ce que cela contrôle","This schedule is stored for your shop only and is also exposed through your public shop profile. Customer bookable time slots will be generated from these hours and each service duration in the next production slice.":"Ce planning est enregistré pour votre atelier et utilisé dans le profil public. Les créneaux réservables sont générés à partir de ces heures et de la durée des services.","Monday":"Lundi","Tuesday":"Mardi","Wednesday":"Mercredi","Thursday":"Jeudi","Friday":"Vendredi","Saturday":"Samedi","Sunday":"Dimanche","to":"à","Shop Owner Workspace":"Espace propriétaire de l’atelier","Customers":"Clients","A private customer view built from your shop’s real Hermes Connect bookings and saved vehicle details.":"Vue privée des clients basée sur les réservations Hermes Connect réelles et les données véhicule enregistrées.","Loading customer history…":"Chargement de l’historique clients…","No customers yet":"Aucun client pour le moment","Customers appear automatically after real bookings are created through your public booking link.":"Les clients apparaîtront automatiquement après de vraies réservations via votre lien public.","Upcoming":"Prochain rendez-vous","Past customer":"Ancien client","Lead":"Nouveau client","Last completed service":"Dernier service terminé","Services":"Services","None yet":"Aucun pour le moment","Vehicles":"Véhicules","No vehicle details were captured for earlier bookings.":"Aucune donnée véhicule n’a été enregistrée pour les réservations précédentes.","Mileage not provided":"Kilométrage non indiqué"},
      placeholder:"Rechercher par nom, email, téléphone, véhicule, VIN ou service", customer:"client", customers:"clients", booking:"réservation", bookings:"réservations", completed:"terminées", next:"Prochain", at:"à", lastSeen:"Dernière visite",
      alerts: {"Save your shop profile in the owner workspace before setting availability.":"Enregistrez d’abord le profil de l’atelier dans l’espace propriétaire avant de définir les disponibilités.","Unable to load your secure session.":"Impossible de charger votre session sécurisée.","Unable to load weekly availability.":"Impossible de charger les disponibilités hebdomadaires.","Every open day must end after it starts.":"Pour chaque jour ouvert, l’heure de fin doit être postérieure à l’heure de début.","Enter a valid start and end time for every open day.":"Indiquez une heure de début et de fin valides pour chaque jour ouvert.","The full seven-day schedule is required.":"Le planning complet sur sept jours est requis.","Unable to save weekly availability.":"Impossible d’enregistrer les disponibilités hebdomadaires.","Weekly availability saved to production.":"Disponibilités hebdomadaires enregistrées.","Network error while saving weekly availability.":"Erreur réseau lors de l’enregistrement des disponibilités hebdomadaires.","Logout failed.":"Échec de la déconnexion.","Unable to initialize availability settings.":"Impossible d’ouvrir les paramètres de disponibilité.","Unable to verify your secure session.":"Impossible de vérifier votre session sécurisée.","Unable to load customers.":"Impossible de charger les clients.","Unable to initialize customer history.":"Impossible d’ouvrir l’historique des clients."}
    }
  }[locale];
  if (!copy) return;

  const commonAlerts = {
    "Save your shop profile in the owner workspace before setting availability.": copy.alerts?.["Save your shop profile in the owner workspace before setting availability."],
    "Unable to load your secure session.": copy.alerts?.["Unable to load your secure session."],
    "Unable to load weekly availability.": copy.alerts?.["Unable to load weekly availability."],
    "Every open day must end after it starts.": copy.alerts?.["Every open day must end after it starts."],
    "Enter a valid start and end time for every open day.": copy.alerts?.["Enter a valid start and end time for every open day."],
    "The full seven-day schedule is required.": copy.alerts?.["The full seven-day schedule is required."],
    "Unable to save weekly availability.": copy.alerts?.["Unable to save weekly availability."],
    "Weekly availability saved to production.": copy.alerts?.["Weekly availability saved to production."],
    "Network error while saving weekly availability.": copy.alerts?.["Network error while saving weekly availability."],
    "Logout failed.": copy.alerts?.["Logout failed."],
    "Unable to initialize availability settings.": copy.alerts?.["Unable to initialize availability settings."],
    "Unable to verify your secure session.": copy.alerts?.["Unable to verify your secure session."],
    "Unable to load customers.": copy.alerts?.["Unable to load customers."],
    "Unable to initialize customer history.": copy.alerts?.["Unable to initialize customer history."],
  };

  const skipExact = (node) => {
    const parent = node.parentElement;
    return Boolean(parent?.closest(".contact-link,.customer-header strong,.stats strong,.vehicle-card strong,.vehicle-card span,.next-appointment"));
  };

  function translateExact() {
    const root = document.querySelector(path.endsWith("/availability") ? ".availability-page" : ".customers-page");
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const raw = node.nodeValue || "";
      const normalized = raw.replace(/\s+/g, " ").trim();
      const translated = !skipExact(node) ? (copy.exact[normalized] || commonAlerts[normalized]) : null;
      if (translated && translated !== normalized) {
        const next = raw.replace(normalized, translated);
        if (next !== raw) node.nodeValue = next;
      }
      node = walker.nextNode();
    }
  }

  function translateDynamicCustomers() {
    if (path !== `${ROOT}/customers`) return;
    const search = document.getElementById("customer-search");
    if (search instanceof HTMLInputElement && search.placeholder !== copy.placeholder) search.placeholder = copy.placeholder;

    const count = document.getElementById("customer-count");
    if (count) {
      const match = (count.textContent || "").match(/^(\d+) customers?$/);
      if (match) count.textContent = `${match[1]} ${Number(match[1]) === 1 ? copy.customer : copy.customers}`;
    }

    document.querySelectorAll(".customer-header .muted.small").forEach((node) => {
      const match = (node.textContent || "").match(/^(\d+) bookings? · (\d+) completed$/);
      if (match) node.textContent = `${match[1]} ${Number(match[1]) === 1 ? copy.booking : copy.bookings} · ${match[2]} ${copy.completed}`;
    });

    document.querySelectorAll(".next-appointment").forEach((node) => {
      const text = node.textContent || "";
      const match = text.match(/^Next: (.+) at (.+) · (.+)$/);
      if (match) node.textContent = `${copy.next}: ${match[1]} ${copy.at} ${match[2]} · ${match[3]}`;
    });

    document.querySelectorAll(".vehicle-card strong").forEach((node) => {
      const text = node.textContent || "";
      if (text.includes("Mileage not provided")) node.textContent = text.replace("Mileage not provided", copy.exact["Mileage not provided"]);
    });
    document.querySelectorAll(".vehicle-card span").forEach((node) => {
      const text = node.textContent || "";
      if (text.includes("Last seen ")) node.textContent = text.replace("Last seen ", `${copy.lastSeen} `);
    });
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    translateExact();
    translateDynamicCustomers();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(apply);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();

  // Dynamic customer cards are inserted as child nodes. We deliberately do not observe
  // characterData: the translator itself changes text nodes, and observing those writes can
  // create a self-triggering microtask loop when a valid translation equals the source text
  // (for example French "Services" → "Services").
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
})();
