(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const route = window.location.pathname.replace(/\/+$/, "");
  const isDashboard = route === `${ROOT}/dashboard`;
  const isAvailability = route === `${ROOT}/availability`;
  if (!isDashboard && !isAvailability) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en";
  const locale = supported.has(requested) ? requested : "en";

  const strings = {
    en: {
      servicesTitle: "Quick-add common services",
      servicesBody: "Start with common services, then edit or add anything your shop needs.",
      servicesReady: "You already have 3 or more services. Quick-add remains available if useful.",
      added: "Added",
      add: "Add",
      oil: "Oil change",
      diagnostics: "Diagnostics",
      brakes: "Brake inspection",
      serviceError: "Could not add this service. You can still use the regular service form below.",
      hours: "Use Mon–Fri · 8:00 AM–5:00 PM",
      hoursHelp: "Fills the form only. Review the schedule, then press Save weekly availability.",
    },
    ru: {
      servicesTitle: "Быстро добавить популярные услуги",
      servicesBody: "Начните с типовых услуг, затем измените или добавьте любые услуги вашего СТО.",
      servicesReady: "У вас уже есть 3 или больше услуг. Быстрое добавление остаётся доступным при необходимости.",
      added: "Добавлено",
      add: "Добавить",
      oil: "Замена масла",
      diagnostics: "Диагностика",
      brakes: "Проверка тормозов",
      serviceError: "Не удалось добавить услугу. Можно воспользоваться обычной формой ниже.",
      hours: "Заполнить Пн–Пт · 8:00–17:00",
      hoursHelp: "Только заполняет форму. Проверьте график и затем нажмите «Сохранить недельный график».",
    },
    uk: {
      servicesTitle: "Швидко додати популярні послуги",
      servicesBody: "Почніть із типових послуг, а потім змініть або додайте будь-які послуги вашого СТО.",
      servicesReady: "У вас уже є 3 або більше послуг. Швидке додавання залишається доступним за потреби.",
      added: "Додано",
      add: "Додати",
      oil: "Заміна оливи",
      diagnostics: "Діагностика",
      brakes: "Перевірка гальм",
      serviceError: "Не вдалося додати послугу. Можна скористатися звичайною формою нижче.",
      hours: "Заповнити Пн–Пт · 8:00–17:00",
      hoursHelp: "Лише заповнює форму. Перевірте графік і потім натисніть «Зберегти тижневий графік».",
    },
    es: {
      servicesTitle: "Añadir servicios comunes rápidamente",
      servicesBody: "Empieza con servicios comunes y después edita o añade lo que necesite tu taller.",
      servicesReady: "Ya tienes 3 o más servicios. La opción rápida sigue disponible si la necesitas.",
      added: "Añadido",
      add: "Añadir",
      oil: "Cambio de aceite",
      diagnostics: "Diagnóstico",
      brakes: "Inspección de frenos",
      serviceError: "No se pudo añadir este servicio. Puedes usar el formulario normal de abajo.",
      hours: "Usar lun–vie · 8:00–17:00",
      hoursHelp: "Solo rellena el formulario. Revísalo y pulsa Guardar disponibilidad semanal.",
    },
    it: {
      servicesTitle: "Aggiungi rapidamente i servizi comuni",
      servicesBody: "Inizia dai servizi comuni, poi modifica o aggiungi ciò che serve alla tua officina.",
      servicesReady: "Hai già 3 o più servizi. L'aggiunta rapida resta disponibile se utile.",
      added: "Aggiunto",
      add: "Aggiungi",
      oil: "Cambio olio",
      diagnostics: "Diagnostica",
      brakes: "Controllo freni",
      serviceError: "Impossibile aggiungere il servizio. Puoi usare il modulo standard qui sotto.",
      hours: "Usa lun–ven · 8:00–17:00",
      hoursHelp: "Compila solo il modulo. Controllalo e poi premi Salva disponibilità settimanale.",
    },
    fr: {
      servicesTitle: "Ajouter rapidement des services courants",
      servicesBody: "Commencez par les services courants, puis modifiez ou ajoutez ce dont votre atelier a besoin.",
      servicesReady: "Vous avez déjà 3 services ou plus. L'ajout rapide reste disponible si besoin.",
      added: "Ajouté",
      add: "Ajouter",
      oil: "Vidange",
      diagnostics: "Diagnostic",
      brakes: "Contrôle des freins",
      serviceError: "Impossible d'ajouter ce service. Vous pouvez utiliser le formulaire standard ci-dessous.",
      hours: "Utiliser lun–ven · 8:00–17:00",
      hoursHelp: "Remplit seulement le formulaire. Vérifiez-le puis cliquez sur Enregistrer les horaires.",
    },
  };
  const copy = strings[locale] || strings.en;

  const emit = (event, params = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, product: "repair_shops", ...params });
  };

  const css = document.createElement("style");
  css.textContent = `
    .repair-quickstart{margin:14px 0 18px;padding:14px;border:1px solid rgba(110,231,183,.18);border-radius:14px;background:rgba(16,185,129,.045);min-width:0;max-width:100%}
    .repair-quickstart summary{cursor:pointer;color:#e8eef7;font-size:13px;font-weight:850;list-style-position:inside}
    .repair-quickstart-copy{margin:7px 0 12px;color:#9ea9b8;font-size:12px;line-height:1.5}
    .repair-preset-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .repair-preset{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:9px 10px;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.035);color:#eef2f7;text-align:left;font:inherit;cursor:pointer}
    .repair-preset span{min-width:0;font-size:12px;font-weight:800;overflow-wrap:anywhere}
    .repair-preset small{flex:0 0 auto;color:#99a3b2;font-size:10px}
    .repair-preset:disabled{cursor:default;opacity:.58}
    .repair-quick-hours{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 18px;padding:14px;border:1px solid rgba(124,92,255,.18);border-radius:14px;background:rgba(124,92,255,.045)}
    .repair-quick-hours div{min-width:0}.repair-quick-hours strong{display:block;font-size:13px}.repair-quick-hours span{display:block;margin-top:4px;color:#9ea9b8;font-size:11px;line-height:1.45}
    .repair-quick-hours button{flex:0 0 auto;min-height:44px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 12px;background:rgba(255,255,255,.06);color:#eef2f7;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
    @media(max-width:680px){.repair-preset-grid{grid-template-columns:1fr}.repair-preset{min-height:48px}.repair-quick-hours{align-items:stretch;flex-direction:column}.repair-quick-hours button{width:100%}}
  `;
  document.head.append(css);

  const presetDefinitions = [
    { id: "oil_change", name: copy.oil, duration_minutes: 30 },
    { id: "diagnostics", name: copy.diagnostics, duration_minutes: 45 },
    { id: "brake_inspection", name: copy.brakes, duration_minutes: 45 },
  ];

  const normalize = (value) => String(value || "").trim().toLocaleLowerCase(locale);

  async function installServicePresets() {
    const form = document.getElementById("service-form");
    if (!form || document.querySelector("[data-repair-service-presets]")) return false;

    let services = [];
    try {
      const response = await fetch("/api/services", { credentials: "same-origin" });
      if (response.status === 401) return true;
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) return false;
      services = Array.isArray(data.services) ? data.services : [];
    } catch {
      return false;
    }

    const existingNames = new Set(services.map((service) => normalize(service.name)));
    const details = document.createElement("details");
    details.className = "repair-quickstart";
    details.dataset.repairServicePresets = "true";
    details.open = services.length < 3;

    const summary = document.createElement("summary");
    summary.textContent = copy.servicesTitle;
    const body = document.createElement("p");
    body.className = "repair-quickstart-copy";
    body.textContent = services.length >= 3 ? copy.servicesReady : copy.servicesBody;
    const grid = document.createElement("div");
    grid.className = "repair-preset-grid";

    for (const preset of presetDefinitions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "repair-preset";
      button.dataset.presetId = preset.id;
      const exists = existingNames.has(normalize(preset.name));
      button.disabled = exists;
      button.innerHTML = `<span>${preset.name}</span><small>${exists ? copy.added : `${copy.add} · ${preset.duration_minutes} min`}</small>`;
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const response = await fetch("/api/services", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: preset.name, duration_minutes: preset.duration_minutes }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok && !(response.status === 409 && data.error === "service_already_exists")) {
            throw new Error(data.error || "service_add_failed");
          }
          emit("connect_shop_service_preset_used", { preset_id: preset.id });
          const status = button.querySelector("small");
          if (status) status.textContent = copy.added;
          window.setTimeout(() => window.location.reload(), 180);
        } catch {
          button.disabled = false;
          const alert = document.getElementById("workspace-alert");
          if (alert) {
            alert.textContent = copy.serviceError;
            alert.className = "alert error";
          }
        }
      });
      grid.append(button);
    }

    details.append(summary, body, grid);
    form.insertAdjacentElement("beforebegin", details);
    return true;
  }

  function installWeekdayPreset() {
    const list = document.getElementById("availability-list");
    const form = document.getElementById("availability-form");
    if (!list || !form || document.querySelector("[data-repair-weekday-preset]")) return false;
    const rows = [...document.querySelectorAll(".day-row[data-day]")];
    if (rows.length !== 7) return false;

    const panel = document.createElement("div");
    panel.className = "repair-quick-hours";
    panel.dataset.repairWeekdayPreset = "true";
    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = copy.hours;
    const help = document.createElement("span");
    help.textContent = copy.hoursHelp;
    text.append(title, help);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = copy.hours;
    button.addEventListener("click", () => {
      for (const row of rows) {
        const day = Number(row.getAttribute("data-day"));
        const checkbox = row.querySelector('input[type="checkbox"]');
        const times = row.querySelectorAll('input[type="time"]');
        if (!(checkbox instanceof HTMLInputElement) || times.length < 2) continue;
        const weekday = day >= 1 && day <= 5;
        checkbox.checked = weekday;
        const start = times[0];
        const end = times[1];
        if (start instanceof HTMLInputElement && end instanceof HTMLInputElement) {
          start.disabled = !weekday;
          end.disabled = !weekday;
          if (weekday) {
            start.value = "08:00";
            end.value = "17:00";
          }
        }
      }
      emit("connect_shop_weekday_hours_preset_used");
    });
    panel.append(text, button);
    list.insertAdjacentElement("beforebegin", panel);
    return true;
  }

  const install = async () => {
    if (isDashboard) return installServicePresets();
    return installWeekdayPreset();
  };

  install().then((done) => {
    if (done) return;
    const observer = new MutationObserver(() => {
      install().then((installed) => { if (installed) observer.disconnect(); }).catch(() => {});
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }).catch(() => {});
})();
