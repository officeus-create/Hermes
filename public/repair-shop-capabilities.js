(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const strings = {
    en: {
      title: "Vehicles & service capabilities",
      body: "Tell customers what your shop actually supports. These choices appear on your public booking page.",
      vehicles: "Vehicle / equipment types",
      passenger_light: "Cars & light vehicles",
      commercial_truck: "Commercial trucks",
      trailer: "Trailers",
      reefer: "Reefer equipment",
      flatbed_open_deck: "Flatbed / open-deck",
      other: "Other / custom equipment",
      fleet: "Fleet & commercial customers",
      roadside: "Mobile / roadside service",
      emergency: "24/7 emergency roadside",
      save: "Save capabilities",
      saved: "Capabilities saved.",
      profileFirst: "Save your shop profile first, then configure service capabilities.",
      loadError: "Unable to load shop capabilities.",
      saveError: "Unable to save shop capabilities.",
      publicLead: "This shop supports",
    },
    ru: {
      title: "Транспорт и возможности СТО",
      body: "Укажите, какую технику реально обслуживает СТО. Эти данные увидит клиент на странице записи.",
      vehicles: "Типы транспорта / оборудования",
      passenger_light: "Легковые и лёгкий транспорт",
      commercial_truck: "Коммерческие грузовики",
      trailer: "Прицепы",
      reefer: "Рефрижераторное оборудование",
      flatbed_open_deck: "Flatbed / открытые платформы",
      other: "Другая / нестандартная техника",
      fleet: "Fleet и корпоративные клиенты",
      roadside: "Мобильный / roadside сервис",
      emergency: "Экстренный roadside 24/7",
      save: "Сохранить возможности",
      saved: "Возможности СТО сохранены.",
      profileFirst: "Сначала сохраните профиль СТО, затем настройте возможности сервиса.",
      loadError: "Не удалось загрузить возможности СТО.",
      saveError: "Не удалось сохранить возможности СТО.",
      publicLead: "СТО обслуживает",
    },
    uk: {
      title: "Транспорт і можливості СТО",
      body: "Вкажіть, яку техніку реально обслуговує СТО. Ці дані побачить клієнт на сторінці запису.",
      vehicles: "Типи транспорту / обладнання",
      passenger_light: "Легкові та легкий транспорт",
      commercial_truck: "Комерційні вантажівки",
      trailer: "Причепи",
      reefer: "Рефрижераторне обладнання",
      flatbed_open_deck: "Flatbed / відкриті платформи",
      other: "Інша / нестандартна техніка",
      fleet: "Fleet і корпоративні клієнти",
      roadside: "Мобільний / roadside сервіс",
      emergency: "Екстрений roadside 24/7",
      save: "Зберегти можливості",
      saved: "Можливості СТО збережено.",
      profileFirst: "Спочатку збережіть профіль СТО, потім налаштуйте можливості сервісу.",
      loadError: "Не вдалося завантажити можливості СТО.",
      saveError: "Не вдалося зберегти можливості СТО.",
      publicLead: "СТО обслуговує",
    },
    es: {
      title: "Vehículos y capacidades del taller",
      body: "Indica lo que el taller realmente atiende. Estas opciones aparecen en la página pública de reservas.",
      vehicles: "Tipos de vehículo / equipo",
      passenger_light: "Autos y vehículos ligeros",
      commercial_truck: "Camiones comerciales",
      trailer: "Remolques",
      reefer: "Equipos refrigerados",
      flatbed_open_deck: "Flatbed / plataforma abierta",
      other: "Otro / equipo especial",
      fleet: "Clientes de flota y comerciales",
      roadside: "Servicio móvil / roadside",
      emergency: "Roadside de emergencia 24/7",
      save: "Guardar capacidades",
      saved: "Capacidades guardadas.",
      profileFirst: "Guarda primero el perfil del taller y luego configura sus capacidades.",
      loadError: "No se pudieron cargar las capacidades.",
      saveError: "No se pudieron guardar las capacidades.",
      publicLead: "Este taller atiende",
    },
    it: {
      title: "Veicoli e capacità dell’officina",
      body: "Indica ciò che l’officina supporta realmente. Le scelte appariranno nella pagina pubblica di prenotazione.",
      vehicles: "Tipi di veicolo / attrezzatura",
      passenger_light: "Auto e veicoli leggeri",
      commercial_truck: "Camion commerciali",
      trailer: "Rimorchi",
      reefer: "Attrezzatura refrigerata",
      flatbed_open_deck: "Flatbed / pianale aperto",
      other: "Altro / attrezzatura speciale",
      fleet: "Clienti fleet e commerciali",
      roadside: "Servizio mobile / roadside",
      emergency: "Roadside di emergenza 24/7",
      save: "Salva capacità",
      saved: "Capacità salvate.",
      profileFirst: "Salva prima il profilo dell’officina, poi configura le capacità.",
      loadError: "Impossibile caricare le capacità.",
      saveError: "Impossibile salvare le capacità.",
      publicLead: "Questa officina supporta",
    },
    fr: {
      title: "Véhicules et capacités de l’atelier",
      body: "Indiquez ce que l’atelier prend réellement en charge. Ces choix apparaîtront sur la page publique de réservation.",
      vehicles: "Types de véhicule / équipement",
      passenger_light: "Voitures et véhicules légers",
      commercial_truck: "Camions commerciaux",
      trailer: "Remorques",
      reefer: "Équipement frigorifique",
      flatbed_open_deck: "Flatbed / plateau ouvert",
      other: "Autre / équipement spécial",
      fleet: "Clients flotte et commerciaux",
      roadside: "Service mobile / roadside",
      emergency: "Roadside d’urgence 24/7",
      save: "Enregistrer les capacités",
      saved: "Capacités enregistrées.",
      profileFirst: "Enregistrez d’abord le profil de l’atelier, puis configurez ses capacités.",
      loadError: "Impossible de charger les capacités.",
      saveError: "Impossible d’enregistrer les capacités.",
      publicLead: "Cet atelier prend en charge",
    },
  };
  const copy = strings[locale] || strings.en;
  const vehicleCodes = ["passenger_light", "commercial_truck", "trailer", "reefer", "flatbed_open_deck", "other"];

  const addStyles = () => {
    if (document.getElementById("repair-capabilities-styles")) return;
    const style = document.createElement("style");
    style.id = "repair-capabilities-styles";
    style.textContent = `
      .hc-capabilities-panel{margin-top:24px}.hc-capability-form{display:grid;gap:18px}.hc-capability-group{display:grid;gap:10px}.hc-capability-group-title{margin:0;color:#dce3ee;font-size:13px;font-weight:850}.hc-capability-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.hc-capability-option{display:flex;align-items:flex-start;gap:9px;min-width:0;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.025);color:#d2d9e4;font-size:13px;line-height:1.35;cursor:pointer}.hc-capability-option:has(input:checked){border-color:rgba(110,231,183,.3);background:rgba(52,211,153,.06);color:#e9fff7}.hc-capability-option input{margin:2px 0 0;accent-color:#6ee7b7}.hc-capability-flags{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.hc-capability-status{min-height:20px;margin:0;color:#9aa6b8;font-size:12px}.hc-capability-status[data-state="success"]{color:#86efc3}.hc-capability-status[data-state="error"]{color:#fca5a5}.hc-public-capabilities{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:11px 0 0}.hc-public-capabilities strong{color:#aab4c4;font-size:12px}.hc-public-capability-chip{display:inline-flex;align-items:center;min-height:28px;padding:5px 9px;border:1px solid rgba(124,92,255,.2);border-radius:999px;background:rgba(124,92,255,.07);color:#d9d3ff;font-size:11px;font-weight:750}.hc-capability-form button{justify-self:start}@media(max-width:760px){.hc-capability-grid,.hc-capability-flags{grid-template-columns:1fr 1fr}}@media(max-width:440px){.hc-capability-grid,.hc-capability-flags{grid-template-columns:1fr}.hc-capability-form button{width:100%}}
    `;
    document.head.append(style);
  };

  const setStatus = (node, message, state = "") => {
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
  };

  async function initOwnerCapabilities() {
    if (path !== `${ROOT}/dashboard`) return;
    const profileForm = document.getElementById("profile-form");
    const profilePanel = profileForm?.closest(".panel");
    if (!profilePanel || document.querySelector("[data-repair-capabilities]")) return;
    addStyles();

    const panel = document.createElement("section");
    panel.className = "panel hc-capabilities-panel";
    panel.dataset.repairCapabilities = "true";
    panel.innerHTML = `
      <div class="panel-heading"><div><p class="eyebrow">Capabilities</p><h2>${copy.title}</h2><p class="muted">${copy.body}</p></div></div>
      <form class="hc-capability-form" data-capability-form>
        <div class="hc-capability-group"><p class="hc-capability-group-title">${copy.vehicles}</p><div class="hc-capability-grid" data-capability-vehicles></div></div>
        <div class="hc-capability-flags">
          <label class="hc-capability-option"><input type="checkbox" data-capability-flag="fleet_service"><span>${copy.fleet}</span></label>
          <label class="hc-capability-option"><input type="checkbox" data-capability-flag="mobile_roadside"><span>${copy.roadside}</span></label>
          <label class="hc-capability-option"><input type="checkbox" data-capability-flag="emergency_24_7"><span>${copy.emergency}</span></label>
        </div>
        <p class="hc-capability-status" data-capability-status role="status" aria-live="polite"></p>
        <button class="primary-btn" type="submit">${copy.save}</button>
      </form>`;
    profilePanel.insertAdjacentElement("afterend", panel);

    const vehicleWrap = panel.querySelector("[data-capability-vehicles]");
    for (const code of vehicleCodes) {
      const label = document.createElement("label");
      label.className = "hc-capability-option";
      label.innerHTML = `<input type="checkbox" value="${code}" data-capability-vehicle><span>${copy[code]}</span>`;
      vehicleWrap?.append(label);
    }

    const form = panel.querySelector("[data-capability-form]");
    const status = panel.querySelector("[data-capability-status]");
    const save = form?.querySelector("button[type='submit']");
    const roadside = panel.querySelector('[data-capability-flag="mobile_roadside"]');
    const emergency = panel.querySelector('[data-capability-flag="emergency_24_7"]');

    const syncEmergency = () => {
      if (!(roadside instanceof HTMLInputElement) || !(emergency instanceof HTMLInputElement)) return;
      if (!roadside.checked) emergency.checked = false;
      emergency.disabled = !roadside.checked;
    };
    roadside?.addEventListener("change", syncEmergency);
    syncEmergency();

    const apply = (capabilities) => {
      const selected = new Set(Array.isArray(capabilities?.vehicle_types) ? capabilities.vehicle_types : []);
      panel.querySelectorAll("[data-capability-vehicle]").forEach((node) => {
        if (node instanceof HTMLInputElement) node.checked = selected.has(node.value);
      });
      for (const key of ["fleet_service", "mobile_roadside", "emergency_24_7"]) {
        const node = panel.querySelector(`[data-capability-flag="${key}"]`);
        if (node instanceof HTMLInputElement) node.checked = Boolean(capabilities?.[key]);
      }
      syncEmergency();
    };

    const setDisabled = (disabled) => {
      panel.querySelectorAll("input,button").forEach((node) => { if (node instanceof HTMLInputElement || node instanceof HTMLButtonElement) node.disabled = disabled; });
      if (!disabled) syncEmergency();
    };

    const load = async () => {
      try {
        const response = await fetch("/api/repair-shop/capabilities", { credentials: "same-origin" });
        const data = await response.json().catch(() => ({}));
        if (response.status === 409 && data.error === "shop_profile_required") {
          setDisabled(true);
          setStatus(status, copy.profileFirst);
          return;
        }
        if (!response.ok || !data.success) throw new Error(data.error || "load_failed");
        apply(data.capabilities || {});
        setDisabled(false);
        setStatus(status, "");
      } catch {
        setStatus(status, copy.loadError, "error");
      }
    };

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (save instanceof HTMLButtonElement) save.disabled = true;
      const vehicleTypes = Array.from(panel.querySelectorAll("[data-capability-vehicle]:checked")).map((node) => node.value);
      const flag = (key) => {
        const node = panel.querySelector(`[data-capability-flag="${key}"]`);
        return node instanceof HTMLInputElement && node.checked;
      };
      try {
        const response = await fetch("/api/repair-shop/capabilities", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicle_types: vehicleTypes, fleet_service: flag("fleet_service"), mobile_roadside: flag("mobile_roadside"), emergency_24_7: flag("emergency_24_7") }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.error || "save_failed");
        apply(data.capabilities || {});
        setStatus(status, copy.saved, "success");
      } catch {
        setStatus(status, copy.saveError, "error");
      } finally {
        if (save instanceof HTMLButtonElement) save.disabled = false;
        syncEmergency();
      }
    });

    const profileState = document.getElementById("profile-state");
    if (profileState) {
      new MutationObserver(() => {
        if ((profileState.textContent || "").trim().toLowerCase() === "saved") window.setTimeout(load, 80);
      }).observe(profileState, { childList: true, characterData: true, subtree: true });
    }
    await load();
  }

  async function initPublicCapabilities() {
    if (path !== `${ROOT}/booking`) return;
    const meta = document.getElementById("shop-meta");
    const slug = new URLSearchParams(window.location.search).get("shop")?.trim() || "";
    if (!meta || !slug || document.querySelector("[data-public-shop-capabilities]")) return;
    addStyles();
    try {
      const response = await fetch(`/api/public/repair-shop?slug=${encodeURIComponent(slug)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.capabilities) return;
      const caps = data.capabilities;
      const labels = [];
      for (const code of Array.isArray(caps.vehicle_types) ? caps.vehicle_types : []) if (copy[code]) labels.push(copy[code]);
      if (caps.fleet_service) labels.push(copy.fleet);
      if (caps.mobile_roadside) labels.push(copy.roadside);
      if (caps.emergency_24_7) labels.push(copy.emergency);
      if (!labels.length) return;
      const wrap = document.createElement("div");
      wrap.className = "hc-public-capabilities";
      wrap.dataset.publicShopCapabilities = "true";
      const lead = document.createElement("strong"); lead.textContent = `${copy.publicLead}:`;
      wrap.append(lead);
      for (const text of labels) { const chip = document.createElement("span"); chip.className = "hc-public-capability-chip"; chip.textContent = text; wrap.append(chip); }
      meta.insertAdjacentElement("afterend", wrap);
    } catch {
      // Public booking remains usable even if optional capability badges fail to load.
    }
  }

  const loadCapacityControl = () => {
    if (path !== `${ROOT}/dashboard` || document.querySelector('script[data-repair-capacity-loader]')) return;
    const script = document.createElement("script");
    script.src = "/repair-shop-capacity.js";
    script.defer = true;
    script.dataset.repairCapacityLoader = "true";
    document.head.append(script);
  };

  const run = () => {
    initOwnerCapabilities().catch(() => {});
    initPublicCapabilities().catch(() => {});
    loadCapacityControl();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true }); else run();
})();