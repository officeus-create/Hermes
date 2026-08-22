(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  document.documentElement.lang = locale;
  if (locale === "en") return;

  const copy = {
    ru: {
      back:"СТО", customers:"Клиенты", logout:"Выйти", profileKicker:"Профиль production", profile:"Профиль СТО", profileCopy:"Сохранённый профиль определяет публичную ссылку записи и часовой пояс.", notConfigured:"Не настроено", saved:"Сохранено", shopName:"Название СТО", phone:"Телефон", address:"Адрес", city:"Город", state:"Штат", zip:"ZIP", timezone:"Часовой пояс", saveProfile:"Сохранить профиль СТО", publicLink:"Публичная ссылка записи", copy:"Копировать", open:"Открыть", servicesKicker:"Реальные данные D1", services:"Услуги", servicesCopy:"Это те же услуги, которые клиенты видят на публичной странице записи.", serviceName:"Название услуги", duration:"Длительность", addService:"Добавить услугу", loadingServices:"Загружаем услуги…", noServices:"Услуг пока нет", noServicesCopy:"Добавьте первую услугу, которую принимает СТО.", delete:"Удалить", schedule:"Расписание", availability:"Недельное расписание", availabilityCopy:"Настройте реальные часы работы перед публикацией ссылки записи.", manageAvailability:"Настроить расписание", intake:"Записи клиентов", inbox:"Входящие записи", inboxCopy:"Записи из публичной ссылки появляются здесь вместе с данными автомобиля и историей статусов.", loadingBookings:"Загружаем записи…", noBookings:"Записей пока нет", noBookingsCopy:"После настройки услуг и часов работы поделитесь публичной ссылкой записи.", feedbackKicker:"Приватная бета", feedback:"Обратная связь", feedbackCopy:"Расскажите команде Hermes, что помогает или мешает работе СТО.", area:"Раздел", rating:"Оценка", happened:"Что произошло?", sendFeedback:"Отправить приватный отзыв", loadingFeedback:"Загружаем отзывы…", noFeedback:"Отзывов пока нет", noFeedbackCopy:"Последние приватные заметки появятся здесь.", setup:"Настройка", booking:"Запись", mobile:"Мобильная версия", other:"Другое", excellent:"5 — Отлично", good:"4 — Хорошо", okay:"3 — Нормально", difficult:"2 — Сложно", blocked:"1 — Блокирует работу", confirmed:"Подтверждено", progress:"В работе", completed:"Завершено", cancelled:"Отменено", changeStatus:"Изменить статус…", statusHistory:"История статусов", noHistory:"Истории статусов пока нет.", vehicleMissing:"Для этой записи данные автомобиля не сохранены.", service:"услуга", servicesPlural:"услуг", bookingCount:"запись", bookingsPlural:"записей", note:"заметка", notesPlural:"заметок", added:"добавлена", deleted:"удалена"
    },
    uk: {
      back:"СТО", customers:"Клієнти", logout:"Вийти", profileKicker:"Профіль production", profile:"Профіль СТО", profileCopy:"Збережений профіль визначає публічне посилання запису та часовий пояс.", notConfigured:"Не налаштовано", saved:"Збережено", shopName:"Назва СТО", phone:"Телефон", address:"Адреса", city:"Місто", state:"Штат", zip:"ZIP", timezone:"Часовий пояс", saveProfile:"Зберегти профіль СТО", publicLink:"Публічне посилання запису", copy:"Копіювати", open:"Відкрити", servicesKicker:"Реальні дані D1", services:"Послуги", servicesCopy:"Це ті самі послуги, які клієнти бачать на публічній сторінці запису.", serviceName:"Назва послуги", duration:"Тривалість", addService:"Додати послугу", loadingServices:"Завантажуємо послуги…", noServices:"Послуг поки немає", noServicesCopy:"Додайте першу послугу, яку приймає СТО.", delete:"Видалити", schedule:"Розклад", availability:"Тижневий розклад", availabilityCopy:"Налаштуйте реальні години роботи перед публікацією посилання запису.", manageAvailability:"Налаштувати розклад", intake:"Записи клієнтів", inbox:"Вхідні записи", inboxCopy:"Записи з публічного посилання з’являються тут разом із даними автомобіля та історією статусів.", loadingBookings:"Завантажуємо записи…", noBookings:"Записів поки немає", noBookingsCopy:"Після налаштування послуг і годин роботи поділіться публічним посиланням запису.", feedbackKicker:"Приватна бета", feedback:"Зворотний зв’язок", feedbackCopy:"Розкажіть команді Hermes, що допомагає або заважає роботі СТО.", area:"Розділ", rating:"Оцінка", happened:"Що сталося?", sendFeedback:"Надіслати приватний відгук", loadingFeedback:"Завантажуємо відгуки…", noFeedback:"Відгуків поки немає", noFeedbackCopy:"Останні приватні нотатки з’являться тут.", setup:"Налаштування", booking:"Запис", mobile:"Мобільна версія", other:"Інше", excellent:"5 — Відмінно", good:"4 — Добре", okay:"3 — Нормально", difficult:"2 — Складно", blocked:"1 — Блокує роботу", confirmed:"Підтверджено", progress:"У роботі", completed:"Завершено", cancelled:"Скасовано", changeStatus:"Змінити статус…", statusHistory:"Історія статусів", noHistory:"Історії статусів поки немає.", vehicleMissing:"Для цього запису дані автомобіля не збережено.", service:"послуга", servicesPlural:"послуг", bookingCount:"запис", bookingsPlural:"записів", note:"нотатка", notesPlural:"нотаток", added:"додана", deleted:"видалена"
    },
    es: {
      back:"Taller", customers:"Clientes", logout:"Salir", profileKicker:"Perfil production", profile:"Perfil del taller", profileCopy:"El perfil guardado controla el enlace público de reservas y la zona horaria.", notConfigured:"Sin configurar", saved:"Guardado", shopName:"Nombre del taller", phone:"Teléfono", address:"Dirección", city:"Ciudad", state:"Estado", zip:"Código postal", timezone:"Zona horaria", saveProfile:"Guardar perfil", publicLink:"Enlace público de reservas", copy:"Copiar", open:"Abrir", servicesKicker:"Datos D1 reales", services:"Servicios", servicesCopy:"Son los mismos servicios que ven los clientes en la página pública de reservas.", serviceName:"Nombre del servicio", duration:"Duración", addService:"Añadir servicio", loadingServices:"Cargando servicios…", noServices:"Aún no hay servicios", noServicesCopy:"Añade el primer servicio que ofrece el taller.", delete:"Eliminar", schedule:"Horario", availability:"Disponibilidad semanal", availabilityCopy:"Configura horarios reales antes de compartir el enlace público.", manageAvailability:"Gestionar disponibilidad", intake:"Reservas de clientes", inbox:"Bandeja de reservas", inboxCopy:"Las citas del enlace público aparecen aquí con datos del vehículo e historial de estados.", loadingBookings:"Cargando reservas…", noBookings:"Aún no hay reservas", noBookingsCopy:"Comparte el enlace público después de configurar servicios y horarios.", feedbackKicker:"Beta privada", feedback:"Comentarios del producto", feedbackCopy:"Cuéntale al equipo de Hermes qué ayuda o bloquea al taller.", area:"Área", rating:"Valoración", happened:"¿Qué ocurrió?", sendFeedback:"Enviar comentario privado", loadingFeedback:"Cargando comentarios…", noFeedback:"Aún no hay comentarios", noFeedbackCopy:"Tus notas privadas recientes aparecerán aquí.", setup:"Configuración", booking:"Reserva", mobile:"Uso móvil", other:"Otro", excellent:"5 — Excelente", good:"4 — Bien", okay:"3 — Aceptable", difficult:"2 — Difícil", blocked:"1 — Bloqueado", confirmed:"Confirmada", progress:"En curso", completed:"Completada", cancelled:"Cancelada", changeStatus:"Cambiar estado…", statusHistory:"Historial de estados", noHistory:"Aún no hay historial.", vehicleMissing:"No se guardaron datos del vehículo para esta reserva.", service:"servicio", servicesPlural:"servicios", bookingCount:"reserva", bookingsPlural:"reservas", note:"nota", notesPlural:"notas", added:"añadido", deleted:"eliminado"
    },
    it: {
      back:"Officina", customers:"Clienti", logout:"Esci", profileKicker:"Profilo production", profile:"Profilo officina", profileCopy:"Il profilo salvato controlla il link pubblico di prenotazione e il fuso orario.", notConfigured:"Non configurato", saved:"Salvato", shopName:"Nome officina", phone:"Telefono", address:"Indirizzo", city:"Città", state:"Stato", zip:"CAP", timezone:"Fuso orario", saveProfile:"Salva profilo", publicLink:"Link pubblico prenotazioni", copy:"Copia", open:"Apri", servicesKicker:"Dati D1 reali", services:"Servizi", servicesCopy:"Sono gli stessi servizi mostrati ai clienti nella pagina pubblica di prenotazione.", serviceName:"Nome servizio", duration:"Durata", addService:"Aggiungi servizio", loadingServices:"Caricamento servizi…", noServices:"Nessun servizio per ora", noServicesCopy:"Aggiungi il primo servizio offerto dall’officina.", delete:"Elimina", schedule:"Orario", availability:"Disponibilità settimanale", availabilityCopy:"Configura gli orari reali prima di condividere il link pubblico.", manageAvailability:"Gestisci disponibilità", intake:"Prenotazioni clienti", inbox:"Prenotazioni", inboxCopy:"Gli appuntamenti dal link pubblico appaiono qui con dati veicolo e storico stati.", loadingBookings:"Caricamento prenotazioni…", noBookings:"Nessuna prenotazione per ora", noBookingsCopy:"Condividi il link pubblico dopo aver configurato servizi e orari.", feedbackKicker:"Beta privata", feedback:"Feedback prodotto", feedbackCopy:"Comunica al team Hermes cosa aiuta o blocca l’officina.", area:"Area", rating:"Valutazione", happened:"Cosa è successo?", sendFeedback:"Invia feedback privato", loadingFeedback:"Caricamento feedback…", noFeedback:"Nessun feedback inviato", noFeedbackCopy:"Le note private recenti appariranno qui.", setup:"Configurazione", booking:"Prenotazione", mobile:"Uso mobile", other:"Altro", excellent:"5 — Eccellente", good:"4 — Buono", okay:"3 — Accettabile", difficult:"2 — Difficile", blocked:"1 — Bloccato", confirmed:"Confermata", progress:"In corso", completed:"Completata", cancelled:"Annullata", changeStatus:"Cambia stato…", statusHistory:"Cronologia stati", noHistory:"Nessuna cronologia registrata.", vehicleMissing:"Non sono stati salvati dati del veicolo per questa prenotazione.", service:"servizio", servicesPlural:"servizi", bookingCount:"prenotazione", bookingsPlural:"prenotazioni", note:"nota", notesPlural:"note", added:"aggiunto", deleted:"eliminato"
    },
    fr: {
      back:"Atelier", customers:"Clients", logout:"Déconnexion", profileKicker:"Profil production", profile:"Profil de l’atelier", profileCopy:"Le profil enregistré contrôle le lien public de réservation et le fuseau horaire.", notConfigured:"Non configuré", saved:"Enregistré", shopName:"Nom de l’atelier", phone:"Téléphone", address:"Adresse", city:"Ville", state:"État", zip:"Code postal", timezone:"Fuseau horaire", saveProfile:"Enregistrer le profil", publicLink:"Lien public de réservation", copy:"Copier", open:"Ouvrir", servicesKicker:"Données D1 réelles", services:"Services", servicesCopy:"Ce sont les mêmes services que les clients voient sur la page publique de réservation.", serviceName:"Nom du service", duration:"Durée", addService:"Ajouter un service", loadingServices:"Chargement des services…", noServices:"Aucun service pour le moment", noServicesCopy:"Ajoutez le premier service proposé par l’atelier.", delete:"Supprimer", schedule:"Planning", availability:"Disponibilités hebdomadaires", availabilityCopy:"Configurez les horaires réels avant de partager le lien public.", manageAvailability:"Gérer les disponibilités", intake:"Réservations clients", inbox:"Boîte de réservations", inboxCopy:"Les rendez-vous du lien public apparaissent ici avec les données véhicule et l’historique des statuts.", loadingBookings:"Chargement des réservations…", noBookings:"Aucune réservation pour le moment", noBookingsCopy:"Partagez le lien public après avoir configuré les services et horaires.", feedbackKicker:"Bêta privée", feedback:"Retour produit", feedbackCopy:"Indiquez à l’équipe Hermes ce qui aide ou bloque l’atelier.", area:"Zone", rating:"Note", happened:"Que s’est-il passé ?", sendFeedback:"Envoyer un retour privé", loadingFeedback:"Chargement des retours…", noFeedback:"Aucun retour envoyé", noFeedbackCopy:"Vos notes privées récentes apparaîtront ici.", setup:"Configuration", booking:"Réservation", mobile:"Usage mobile", other:"Autre", excellent:"5 — Excellent", good:"4 — Bien", okay:"3 — Correct", difficult:"2 — Difficile", blocked:"1 — Bloqué", confirmed:"Confirmée", progress:"En cours", completed:"Terminée", cancelled:"Annulée", changeStatus:"Changer le statut…", statusHistory:"Historique des statuts", noHistory:"Aucun historique pour le moment.", vehicleMissing:"Aucune donnée véhicule n’a été enregistrée pour cette réservation.", service:"service", servicesPlural:"services", bookingCount:"réservation", bookingsPlural:"réservations", note:"note", notesPlural:"notes", added:"ajouté", deleted:"supprimé"
    }
  };
  const t = copy[locale];
  if (!t) return;

  const setText = (element, value) => {
    if (!(element instanceof HTMLElement) || element.textContent === value) return;
    element.textContent = value;
  };
  const ownText = (element, value) => {
    if (!(element instanceof HTMLElement)) return;
    const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && (node.nodeValue || "").trim());
    if (!textNode) { if (!element.children.length) setText(element, value); return; }
    if ((textNode.nodeValue || "").trim() === value) return;
    textNode.nodeValue = ` ${value}`;
  };
  const text = (selector, value) => setText(document.querySelector(selector), value);
  const leading = (selector, value) => ownText(document.querySelector(selector), value);
  const setOption = (option, value) => { if (option.textContent !== value) option.textContent = value; };

  const translateStatic = () => {
    leading(".back-link", t.back); leading(".workspace-actions a", t.customers); leading("#logout-btn", t.logout);
    const profile = document.querySelector('[aria-labelledby="profile-title"]');
    const servicesPanel = document.querySelector('[aria-labelledby="services-title"]');
    const bookingsPanel = document.querySelector('[aria-labelledby="bookings-title"]');
    const feedbackPanel = document.querySelector('[aria-labelledby="feedback-title"]');
    const availabilityPanel = document.querySelector(".availability-panel");

    if (profile) {
      text('[aria-labelledby="profile-title"] .eyebrow', t.profileKicker); text("#profile-title", t.profile); text('[aria-labelledby="profile-title"] .panel-heading .muted', t.profileCopy);
      const labels = profile.querySelectorAll("label.field"); [t.shopName,t.phone,t.address,t.city,t.state,t.zip,t.timezone].forEach((value,index) => ownText(labels[index], value));
      const ready = !document.querySelector("#public-link-wrap")?.classList.contains("hidden"); text("#profile-state", ready ? t.saved : t.notConfigured);
      text("#save-profile-btn", t.saveProfile); text("#public-link-wrap .mini-label", t.publicLink); leading("#copy-link-btn", t.copy); leading("#open-link-btn", t.open);
    }
    if (servicesPanel) {
      text('[aria-labelledby="services-title"] .eyebrow', t.servicesKicker); text("#services-title", t.services); text('[aria-labelledby="services-title"] .panel-heading .muted', t.servicesCopy);
      const labels = servicesPanel.querySelectorAll("label.field"); ownText(labels[0], t.serviceName); ownText(labels[1], t.duration); leading("#add-service-btn", t.addService);
      text("#services-loading", t.loadingServices); text("#services-empty strong", t.noServices); text("#services-empty span", t.noServicesCopy);
    }
    if (availabilityPanel) { text(".availability-panel .eyebrow", t.schedule); text(".availability-panel h2", t.availability); text(".availability-panel .muted", t.availabilityCopy); leading(".availability-panel a", t.manageAvailability); }
    if (bookingsPanel) {
      text('[aria-labelledby="bookings-title"] .eyebrow', t.intake); text("#bookings-title", t.inbox); text('[aria-labelledby="bookings-title"] .panel-heading .muted', t.inboxCopy);
      text("#bookings-loading", t.loadingBookings); text("#bookings-empty strong", t.noBookings); text("#bookings-empty span", t.noBookingsCopy);
    }
    if (feedbackPanel) {
      text('[aria-labelledby="feedback-title"] .eyebrow', t.feedbackKicker); leading("#feedback-title", t.feedback); text('[aria-labelledby="feedback-title"] .panel-heading .muted', t.feedbackCopy);
      const labels = feedbackPanel.querySelectorAll("label.field"); ownText(labels[0], t.area); ownText(labels[1], t.rating); ownText(labels[2], t.happened); text("#submit-feedback-btn", t.sendFeedback);
      text("#feedback-loading", t.loadingFeedback); text("#feedback-empty strong", t.noFeedback); text("#feedback-empty span", t.noFeedbackCopy);
      const category = document.querySelector("#feedback-category");
      if (category instanceof HTMLSelectElement) {
        const values = { setup:t.setup, booking:t.booking, customers:t.customers, mobile:t.mobile, other:t.other };
        Array.from(category.options).forEach((option) => { if (values[option.value]) setOption(option, values[option.value]); });
      }
      const rating = document.querySelector("#feedback-rating");
      if (rating instanceof HTMLSelectElement) {
        const values = { "5":t.excellent, "4":t.good, "3":t.okay, "2":t.difficult, "1":t.blocked };
        Array.from(rating.options).forEach((option) => { if (values[option.value]) setOption(option, values[option.value]); });
      }
    }
  };

  const statusLabel = (status) => ({ confirmed:t.confirmed, in_progress:t.progress, completed:t.completed, cancelled:t.cancelled })[status] || status;
  const translateDynamic = () => {
    document.querySelectorAll("#services-list .danger-btn").forEach((button) => setText(button, t.delete));
    document.querySelectorAll("#bookings-list .booking-card").forEach((card) => {
      const status = ["confirmed","in_progress","completed","cancelled"].find((value) => card.querySelector(`.status-${value}`));
      const pill = card.querySelector(".status-pill"); if (pill && status) setText(pill, statusLabel(status));
      const select = card.querySelector(".status-select"); if (select instanceof HTMLSelectElement) Array.from(select.options).forEach((option) => setOption(option, option.value ? statusLabel(option.value) : t.changeStatus));
      setText(card.querySelector(".history .mini-label"), t.statusHistory);
      const noHistory = card.querySelector(".history > .muted.small"); if (noHistory?.textContent?.trim() === "No history recorded yet.") setText(noHistory, t.noHistory);
      card.querySelectorAll(".history li").forEach((item) => {
        const value = item.querySelector("strong"); if (!value) return;
        const english = value.textContent?.trim(); const key = ({ Confirmed:"confirmed", "In progress":"in_progress", Completed:"completed", Cancelled:"cancelled" })[english || ""];
        if (key) setText(value, statusLabel(key));
      });
      const vehicle = card.querySelector(".vehicle-line.muted.small"); if (vehicle?.textContent?.trim() === "Vehicle details were not captured for this booking.") setText(vehicle, t.vehicleMissing);
    });
    document.querySelectorAll("#feedback-list .feedback-row > div > strong").forEach((category) => {
      const key = category.textContent?.trim().toLowerCase(); const values = { setup:t.setup, booking:t.booking, customers:t.customers, mobile:t.mobile, other:t.other };
      if (key && values[key]) setText(category, values[key]);
    });
  };

  const countText = (id, singular, plural) => {
    const element = document.getElementById(id); if (!element) return;
    const match = (element.textContent || "").match(/\d+/); if (!match) return;
    const n = Number(match[0]); setText(element, `${n} ${n === 1 ? singular : plural}`);
  };
  const translateCounts = () => { countText("service-count", t.service, t.servicesPlural); countText("booking-count", t.bookingCount, t.bookingsPlural); countText("feedback-count", t.note, t.notesPlural); };

  const preserveLocaleLinks = () => {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || ""; if (!href.includes(ROOT) || href.includes("lang=")) return;
      if (/\/(customers|availability|booking)\//.test(href)) link.setAttribute("href", `${href}${href.includes("?") ? "&" : "?"}lang=${locale}`);
    });
  };

  const translateServiceAlert = () => {
    const alert = document.getElementById("workspace-alert"); if (!alert || alert.classList.contains("hidden")) return;
    const raw = (alert.textContent || "").trim();
    let match = raw.match(/^(.+) added\.$/); if (match) { setText(alert, `${match[1]} ${t.added}.`); return; }
    match = raw.match(/^(.+) deleted\.$/); if (match) setText(alert, `${match[1]} ${t.deleted}.`);
  };

  let applying = false;
  const apply = () => { if (applying) return; applying = true; try { translateStatic(); translateDynamic(); translateCounts(); preserveLocaleLinks(); translateServiceAlert(); } finally { applying = false; } };
  apply();
  new MutationObserver(() => queueMicrotask(apply)).observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["href","class"] });
})();