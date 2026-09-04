(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const strings = {
    en: {
      ownerEyebrow: "Driver benefit",
      ownerTitle: "Hermes Connect driver discount",
      ownerBody: "Offer a clearly visible discount to eligible Hermes Connect drivers and partner fleet vehicles. You control what is discounted.",
      enable: "Show this Hermes Connect driver discount publicly",
      services: "Services discount",
      materials: "Parts & materials discount",
      percent: "Discount %",
      allServices: "All published services",
      selectedServices: "Selected services only",
      chooseServices: "Choose discounted services",
      allMaterials: "All parts & materials",
      selectedMaterials: "Selected parts / materials only",
      materialsList: "Discounted parts / materials",
      materialsPlaceholder: "Example: engine oil, filters, brake pads",
      materialsHelp: "Separate items with commas or new lines.",
      save: "Save driver discount",
      saved: "Hermes Connect driver discount saved.",
      profileFirst: "Save your shop profile first, then configure the driver discount.",
      loadError: "Unable to load the driver discount.",
      saveError: "Unable to save the driver discount.",
      valueRequired: "Turn the discount off or enter at least one discount above 0%.",
      selectServiceRequired: "Choose at least one service for the selected-services discount.",
      selectMaterialRequired: "List at least one part or material for the selected-materials discount.",
      publicBadge: "HERMES CONNECT DRIVER BENEFIT",
      publicTitle: "Driver discount at this repair shop",
      servicesAll: (pct) => `${pct}% off all services`,
      servicesSelected: (pct, names) => `${pct}% off selected services: ${names.join(", ")}`,
      materialsAll: (pct) => `${pct}% off all parts & materials`,
      materialsSelected: (pct, names) => `${pct}% off selected parts & materials: ${names.join(", ")}`,
      publicNote: "Mention Hermes Connect when booking or checking in. This discount is offered by the repair shop; eligibility, exclusions and final price are confirmed by the shop.",
    },
    ru: {
      ownerEyebrow: "Выгода для водителей",
      ownerTitle: "Скидка для водителей Hermes Connect",
      ownerBody: "Предложите заметную скидку водителям Hermes Connect и партнёрскому автопарку. Вы сами выбираете, на что действует скидка.",
      enable: "Показывать эту скидку Hermes Connect публично",
      services: "Скидка на услуги",
      materials: "Скидка на запчасти и материалы",
      percent: "Скидка, %",
      allServices: "На все опубликованные услуги",
      selectedServices: "Только на выбранные услуги",
      chooseServices: "Выберите услуги со скидкой",
      allMaterials: "На все запчасти и материалы",
      selectedMaterials: "Только на выбранные запчасти / материалы",
      materialsList: "Запчасти / материалы со скидкой",
      materialsPlaceholder: "Например: моторное масло, фильтры, тормозные колодки",
      materialsHelp: "Разделяйте позиции запятыми или переносами строки.",
      save: "Сохранить скидку",
      saved: "Скидка для водителей Hermes Connect сохранена.",
      profileFirst: "Сначала сохраните профиль СТО, затем настройте скидку для водителей.",
      loadError: "Не удалось загрузить скидку для водителей.",
      saveError: "Не удалось сохранить скидку для водителей.",
      valueRequired: "Отключите скидку либо укажите хотя бы одну скидку больше 0%.",
      selectServiceRequired: "Выберите хотя бы одну услугу для скидки на выбранные услуги.",
      selectMaterialRequired: "Укажите хотя бы одну запчасть или материал для выбранной скидки.",
      publicBadge: "СКИДКА ДЛЯ ВОДИТЕЛЕЙ HERMES CONNECT",
      publicTitle: "Выгода для водителей на этом СТО",
      servicesAll: (pct) => `Скидка ${pct}% на все услуги`,
      servicesSelected: (pct, names) => `Скидка ${pct}% на выбранные услуги: ${names.join(", ")}`,
      materialsAll: (pct) => `Скидка ${pct}% на все запчасти и материалы`,
      materialsSelected: (pct, names) => `Скидка ${pct}% на выбранные запчасти и материалы: ${names.join(", ")}`,
      publicNote: "Сообщите о Hermes Connect при записи или приёмке. Скидку предоставляет само СТО; право на скидку, исключения и итоговую цену подтверждает СТО.",
    },
    uk: {
      ownerEyebrow: "Вигода для водіїв",
      ownerTitle: "Знижка для водіїв Hermes Connect",
      ownerBody: "Запропонуйте помітну знижку водіям Hermes Connect і партнерському автопарку. Ви самі обираєте, на що діє знижка.",
      enable: "Показувати цю знижку Hermes Connect публічно",
      services: "Знижка на послуги",
      materials: "Знижка на запчастини та матеріали",
      percent: "Знижка, %",
      allServices: "На всі опубліковані послуги",
      selectedServices: "Лише на вибрані послуги",
      chooseServices: "Оберіть послуги зі знижкою",
      allMaterials: "На всі запчастини та матеріали",
      selectedMaterials: "Лише на вибрані запчастини / матеріали",
      materialsList: "Запчастини / матеріали зі знижкою",
      materialsPlaceholder: "Наприклад: моторна олива, фільтри, гальмівні колодки",
      materialsHelp: "Розділяйте позиції комами або переносами рядка.",
      save: "Зберегти знижку",
      saved: "Знижку для водіїв Hermes Connect збережено.",
      profileFirst: "Спочатку збережіть профіль СТО, потім налаштуйте знижку для водіїв.",
      loadError: "Не вдалося завантажити знижку для водіїв.",
      saveError: "Не вдалося зберегти знижку для водіїв.",
      valueRequired: "Вимкніть знижку або вкажіть хоча б одну знижку понад 0%.",
      selectServiceRequired: "Оберіть хоча б одну послугу для вибіркової знижки.",
      selectMaterialRequired: "Вкажіть хоча б одну запчастину або матеріал для вибіркової знижки.",
      publicBadge: "ЗНИЖКА ДЛЯ ВОДІЇВ HERMES CONNECT",
      publicTitle: "Вигода для водіїв на цьому СТО",
      servicesAll: (pct) => `Знижка ${pct}% на всі послуги`,
      servicesSelected: (pct, names) => `Знижка ${pct}% на вибрані послуги: ${names.join(", ")}`,
      materialsAll: (pct) => `Знижка ${pct}% на всі запчастини та матеріали`,
      materialsSelected: (pct, names) => `Знижка ${pct}% на вибрані запчастини та матеріали: ${names.join(", ")}`,
      publicNote: "Повідомте про Hermes Connect під час запису або приймання. Знижку надає саме СТО; право на знижку, винятки та остаточну ціну підтверджує СТО.",
    },
    es: {
      ownerEyebrow: "Beneficio para conductores",
      ownerTitle: "Descuento para conductores de Hermes Connect",
      ownerBody: "Ofrece un descuento visible a conductores elegibles de Hermes Connect y flotas asociadas. Tú decides qué incluye.",
      enable: "Mostrar públicamente este descuento de Hermes Connect",
      services: "Descuento en servicios",
      materials: "Descuento en repuestos y materiales",
      percent: "Descuento, %",
      allServices: "Todos los servicios publicados",
      selectedServices: "Solo servicios seleccionados",
      chooseServices: "Selecciona los servicios con descuento",
      allMaterials: "Todos los repuestos y materiales",
      selectedMaterials: "Solo repuestos / materiales seleccionados",
      materialsList: "Repuestos / materiales con descuento",
      materialsPlaceholder: "Ejemplo: aceite de motor, filtros, pastillas de freno",
      materialsHelp: "Separa los artículos con comas o saltos de línea.",
      save: "Guardar descuento",
      saved: "Descuento para conductores de Hermes Connect guardado.",
      profileFirst: "Guarda primero el perfil del taller y luego configura el descuento.",
      loadError: "No se pudo cargar el descuento.",
      saveError: "No se pudo guardar el descuento.",
      valueRequired: "Desactiva el descuento o introduce al menos un descuento superior al 0%.",
      selectServiceRequired: "Selecciona al menos un servicio.",
      selectMaterialRequired: "Indica al menos un repuesto o material.",
      publicBadge: "BENEFICIO PARA CONDUCTORES HERMES CONNECT",
      publicTitle: "Descuento para conductores en este taller",
      servicesAll: (pct) => `${pct}% de descuento en todos los servicios`,
      servicesSelected: (pct, names) => `${pct}% de descuento en servicios seleccionados: ${names.join(", ")}`,
      materialsAll: (pct) => `${pct}% de descuento en todos los repuestos y materiales`,
      materialsSelected: (pct, names) => `${pct}% de descuento en repuestos y materiales seleccionados: ${names.join(", ")}`,
      publicNote: "Menciona Hermes Connect al reservar o al llegar. El descuento lo ofrece el taller; el taller confirma elegibilidad, exclusiones y precio final.",
    },
    it: {
      ownerEyebrow: "Vantaggio autisti",
      ownerTitle: "Sconto per autisti Hermes Connect",
      ownerBody: "Offri uno sconto ben visibile agli autisti Hermes Connect idonei e alle flotte partner. Decidi tu cosa includere.",
      enable: "Mostra pubblicamente questo sconto Hermes Connect",
      services: "Sconto sui servizi",
      materials: "Sconto su ricambi e materiali",
      percent: "Sconto, %",
      allServices: "Tutti i servizi pubblicati",
      selectedServices: "Solo servizi selezionati",
      chooseServices: "Seleziona i servizi scontati",
      allMaterials: "Tutti i ricambi e materiali",
      selectedMaterials: "Solo ricambi / materiali selezionati",
      materialsList: "Ricambi / materiali scontati",
      materialsPlaceholder: "Esempio: olio motore, filtri, pastiglie freno",
      materialsHelp: "Separa le voci con virgole o nuove righe.",
      save: "Salva sconto",
      saved: "Sconto per autisti Hermes Connect salvato.",
      profileFirst: "Salva prima il profilo dell’officina, poi configura lo sconto.",
      loadError: "Impossibile caricare lo sconto.",
      saveError: "Impossibile salvare lo sconto.",
      valueRequired: "Disattiva lo sconto oppure inserisci almeno uno sconto superiore allo 0%.",
      selectServiceRequired: "Seleziona almeno un servizio.",
      selectMaterialRequired: "Indica almeno un ricambio o materiale.",
      publicBadge: "VANTAGGIO AUTISTI HERMES CONNECT",
      publicTitle: "Sconto autisti presso questa officina",
      servicesAll: (pct) => `${pct}% di sconto su tutti i servizi`,
      servicesSelected: (pct, names) => `${pct}% di sconto sui servizi selezionati: ${names.join(", ")}`,
      materialsAll: (pct) => `${pct}% di sconto su tutti i ricambi e materiali`,
      materialsSelected: (pct, names) => `${pct}% di sconto sui ricambi e materiali selezionati: ${names.join(", ")}`,
      publicNote: "Menziona Hermes Connect alla prenotazione o all’arrivo. Lo sconto è offerto dall’officina; idoneità, esclusioni e prezzo finale sono confermati dall’officina.",
    },
    fr: {
      ownerEyebrow: "Avantage conducteurs",
      ownerTitle: "Remise pour conducteurs Hermes Connect",
      ownerBody: "Proposez une remise bien visible aux conducteurs Hermes Connect éligibles et aux flottes partenaires. Vous choisissez ce qui est inclus.",
      enable: "Afficher publiquement cette remise Hermes Connect",
      services: "Remise sur les services",
      materials: "Remise sur les pièces et matériaux",
      percent: "Remise, %",
      allServices: "Tous les services publiés",
      selectedServices: "Services sélectionnés uniquement",
      chooseServices: "Choisissez les services remisés",
      allMaterials: "Toutes les pièces et matériaux",
      selectedMaterials: "Pièces / matériaux sélectionnés uniquement",
      materialsList: "Pièces / matériaux remisés",
      materialsPlaceholder: "Exemple : huile moteur, filtres, plaquettes de frein",
      materialsHelp: "Séparez les éléments par des virgules ou des retours à la ligne.",
      save: "Enregistrer la remise",
      saved: "Remise conducteurs Hermes Connect enregistrée.",
      profileFirst: "Enregistrez d’abord le profil de l’atelier, puis configurez la remise.",
      loadError: "Impossible de charger la remise.",
      saveError: "Impossible d’enregistrer la remise.",
      valueRequired: "Désactivez la remise ou saisissez au moins une remise supérieure à 0 %.",
      selectServiceRequired: "Choisissez au moins un service.",
      selectMaterialRequired: "Indiquez au moins une pièce ou un matériau.",
      publicBadge: "AVANTAGE CONDUCTEURS HERMES CONNECT",
      publicTitle: "Remise conducteurs dans cet atelier",
      servicesAll: (pct) => `${pct}% de remise sur tous les services`,
      servicesSelected: (pct, names) => `${pct}% de remise sur les services sélectionnés : ${names.join(", ")}`,
      materialsAll: (pct) => `${pct}% de remise sur toutes les pièces et matériaux`,
      materialsSelected: (pct, names) => `${pct}% de remise sur les pièces et matériaux sélectionnés : ${names.join(", ")}`,
      publicNote: "Mentionnez Hermes Connect lors de la réservation ou à l’arrivée. La remise est proposée par l’atelier ; l’éligibilité, les exclusions et le prix final sont confirmés par l’atelier.",
    },
  };
  const copy = strings[locale] || strings.en;

  function addStyles() {
    if (document.getElementById("hc-driver-discount-styles")) return;
    const style = document.createElement("style");
    style.id = "hc-driver-discount-styles";
    style.textContent = `
      .hc-driver-discount-owner{margin-top:24px;border-color:rgba(34,197,94,.28)!important;background:linear-gradient(135deg,rgba(34,197,94,.075),rgba(255,255,255,.018))!important}
      .hc-driver-discount-form{display:grid;gap:18px}.hc-driver-discount-enable{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid rgba(34,197,94,.24);border-radius:13px;background:rgba(34,197,94,.06);font-size:13px;font-weight:800}.hc-driver-discount-enable input{width:18px;height:18px;margin:1px 0 0;accent-color:#22c55e}
      .hc-driver-discount-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.hc-driver-discount-card{display:grid;gap:11px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.025)}.hc-driver-discount-card h3{margin:0;font-size:14px}.hc-driver-discount-percent{display:grid;gap:6px;font-size:12px;font-weight:800}.hc-driver-discount-percent input{width:110px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 11px;background:#0e1118;color:#fff;font:inherit}.hc-driver-discount-scopes{display:grid;gap:8px}.hc-driver-discount-scopes label{display:flex;align-items:center;gap:8px;color:#cbd5e1;font-size:12px}.hc-driver-discount-scopes input{accent-color:#22c55e}.hc-driver-discount-selected{display:grid;gap:8px;padding-top:4px}.hc-driver-discount-selected[hidden]{display:none}.hc-driver-discount-selected-title{margin:0;color:#aab4c4;font-size:11px;font-weight:800}.hc-driver-discount-services{display:grid;grid-template-columns:1fr 1fr;gap:7px}.hc-driver-discount-service{display:flex;align-items:flex-start;gap:7px;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:10px;color:#d5dce7;font-size:11px}.hc-driver-discount-service input{margin-top:2px;accent-color:#22c55e}.hc-driver-discount-textarea{min-height:88px;resize:vertical;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 11px;background:#0e1118;color:#fff;font:inherit}.hc-driver-discount-help{margin:0;color:#8f99a8;font-size:10px;line-height:1.45}.hc-driver-discount-status{min-height:19px;margin:0;color:#9aa6b8;font-size:12px}.hc-driver-discount-status[data-state="success"]{color:#86efac}.hc-driver-discount-status[data-state="error"]{color:#fca5a5}.hc-driver-discount-form .primary-btn{justify-self:start}
      .hc-driver-discount-banner{position:relative;overflow:hidden;margin:18px 0;padding:18px 18px 17px;border:1px solid rgba(34,197,94,.48);border-radius:18px;background:linear-gradient(135deg,#062d1e 0%,#0b3b27 54%,#102c22 100%);box-shadow:0 14px 40px rgba(2,44,28,.2);color:#ecfdf5}.hc-driver-discount-banner::after{content:"$";position:absolute;right:-10px;top:-36px;font-size:138px;font-weight:950;line-height:1;color:rgba(134,239,172,.07);pointer-events:none}.hc-driver-discount-top{display:flex;align-items:center;gap:11px;position:relative;z-index:1}.hc-driver-discount-dollar{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;border:1px solid rgba(187,247,208,.38);border-radius:999px;background:rgba(34,197,94,.17);color:#bbf7d0;font-size:23px;font-weight:950}.hc-driver-discount-badge{margin:0;color:#86efac;font-size:10px;font-weight:950;letter-spacing:.12em}.hc-driver-discount-banner h2{margin:3px 0 0;color:#f0fdf4;font-size:19px;line-height:1.15}.hc-driver-discount-benefits{display:grid;gap:8px;position:relative;z-index:1;margin:14px 0 0;padding:0;list-style:none}.hc-driver-discount-benefits li{display:flex;gap:8px;align-items:flex-start;color:#dcfce7;font-size:13px;font-weight:760;line-height:1.45}.hc-driver-discount-benefits li::before{content:"✓";color:#86efac;font-weight:950}.hc-driver-discount-note{position:relative;z-index:1;margin:12px 0 0;color:#a7f3d0;font-size:10.5px;line-height:1.5}
      @media(max-width:720px){.hc-driver-discount-grid,.hc-driver-discount-services{grid-template-columns:1fr}.hc-driver-discount-form .primary-btn{width:100%}.hc-driver-discount-banner{margin:14px 0;padding:16px}.hc-driver-discount-banner h2{font-size:17px}}
    `;
    document.head.append(style);
  }

  const splitItems = (value) => [...new Set(String(value || "").split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))].slice(0, 20);
  const setStatus = (node, message, state = "") => {
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
  };

  async function initOwner() {
    if (path !== `${ROOT}/dashboard`) return;
    const profilePanel = document.getElementById("profile-form")?.closest(".panel");
    if (!profilePanel || document.querySelector("[data-driver-discount-owner]")) return;
    addStyles();

    const panel = document.createElement("section");
    panel.className = "panel hc-driver-discount-owner";
    panel.dataset.driverDiscountOwner = "true";
    panel.innerHTML = `
      <div class="panel-heading"><div><p class="eyebrow">${copy.ownerEyebrow}</p><h2>${copy.ownerTitle}</h2><p class="muted">${copy.ownerBody}</p></div><span class="hc-driver-discount-dollar" aria-hidden="true">$</span></div>
      <form class="hc-driver-discount-form" data-driver-discount-form>
        <label class="hc-driver-discount-enable"><input type="checkbox" data-discount-enabled><span>${copy.enable}</span></label>
        <div class="hc-driver-discount-grid">
          <section class="hc-driver-discount-card">
            <h3>${copy.services}</h3>
            <label class="hc-driver-discount-percent">${copy.percent}<input type="number" min="0" max="100" step="1" value="0" data-service-percent></label>
            <div class="hc-driver-discount-scopes">
              <label><input type="radio" name="hc-service-scope" value="all" checked>${copy.allServices}</label>
              <label><input type="radio" name="hc-service-scope" value="selected">${copy.selectedServices}</label>
            </div>
            <div class="hc-driver-discount-selected" data-selected-services hidden>
              <p class="hc-driver-discount-selected-title">${copy.chooseServices}</p>
              <div class="hc-driver-discount-services" data-service-list></div>
            </div>
          </section>
          <section class="hc-driver-discount-card">
            <h3>${copy.materials}</h3>
            <label class="hc-driver-discount-percent">${copy.percent}<input type="number" min="0" max="100" step="1" value="0" data-materials-percent></label>
            <div class="hc-driver-discount-scopes">
              <label><input type="radio" name="hc-materials-scope" value="all" checked>${copy.allMaterials}</label>
              <label><input type="radio" name="hc-materials-scope" value="selected">${copy.selectedMaterials}</label>
            </div>
            <div class="hc-driver-discount-selected" data-selected-materials hidden>
              <p class="hc-driver-discount-selected-title">${copy.materialsList}</p>
              <textarea class="hc-driver-discount-textarea" maxlength="1700" data-materials-list placeholder="${copy.materialsPlaceholder}"></textarea>
              <p class="hc-driver-discount-help">${copy.materialsHelp}</p>
            </div>
          </section>
        </div>
        <p class="hc-driver-discount-status" data-discount-status role="status" aria-live="polite"></p>
        <button class="primary-btn" type="submit">${copy.save}</button>
      </form>`;

    const anchor = document.querySelector("[data-repair-capabilities]") || profilePanel;
    anchor.insertAdjacentElement("afterend", panel);

    const form = panel.querySelector("[data-driver-discount-form]");
    const status = panel.querySelector("[data-discount-status]");
    const enabled = panel.querySelector("[data-discount-enabled]");
    const servicePercent = panel.querySelector("[data-service-percent]");
    const materialsPercent = panel.querySelector("[data-materials-percent]");
    const serviceList = panel.querySelector("[data-service-list]");
    const materialList = panel.querySelector("[data-materials-list]");
    const selectedServices = panel.querySelector("[data-selected-services]");
    const selectedMaterials = panel.querySelector("[data-selected-materials]");
    const save = form?.querySelector("button[type='submit']");

    const scopeValue = (name) => panel.querySelector(`input[name="${name}"]:checked`)?.value || "all";
    const syncScopes = () => {
      if (selectedServices) selectedServices.hidden = scopeValue("hc-service-scope") !== "selected";
      if (selectedMaterials) selectedMaterials.hidden = scopeValue("hc-materials-scope") !== "selected";
    };
    panel.querySelectorAll('input[name="hc-service-scope"],input[name="hc-materials-scope"]').forEach((node) => node.addEventListener("change", syncScopes));
    syncScopes();

    let services = [];
    const renderServices = (selected = []) => {
      if (!serviceList) return;
      serviceList.textContent = "";
      const selectedSet = new Set(selected.map(String));
      for (const service of services) {
        const label = document.createElement("label");
        label.className = "hc-driver-discount-service";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(service.id);
        input.dataset.discountService = "true";
        input.checked = selectedSet.has(String(service.id));
        const span = document.createElement("span");
        span.textContent = String(service.name || "Service");
        label.append(input, span);
        serviceList.append(label);
      }
    };

    const setDisabled = (disabled) => {
      panel.querySelectorAll("input,textarea,button").forEach((node) => { node.disabled = disabled; });
    };

    try {
      const [discountResponse, servicesResponse] = await Promise.all([
        fetch("/api/repair-shop/driver-discount", { credentials: "same-origin" }),
        fetch("/api/services", { credentials: "same-origin" }),
      ]);
      const discountData = await discountResponse.json().catch(() => ({}));
      const servicesData = await servicesResponse.json().catch(() => ({}));
      if (discountResponse.status === 409 && discountData.error === "shop_profile_required") {
        setDisabled(true);
        setStatus(status, copy.profileFirst);
        return;
      }
      if (!discountResponse.ok || !discountData.success) throw new Error("discount_load_failed");
      services = servicesResponse.ok && servicesData.success && Array.isArray(servicesData.services) ? servicesData.services : [];
      const discount = discountData.discount || {};
      if (enabled) enabled.checked = Boolean(discount.enabled);
      if (servicePercent) servicePercent.value = String(discount.service_discount_percent || 0);
      if (materialsPercent) materialsPercent.value = String(discount.materials_discount_percent || 0);
      const serviceScopeNode = panel.querySelector(`input[name="hc-service-scope"][value="${discount.service_scope === "selected" ? "selected" : "all"}"]`);
      const materialsScopeNode = panel.querySelector(`input[name="hc-materials-scope"][value="${discount.materials_scope === "selected" ? "selected" : "all"}"]`);
      if (serviceScopeNode) serviceScopeNode.checked = true;
      if (materialsScopeNode) materialsScopeNode.checked = true;
      renderServices(Array.isArray(discount.service_ids) ? discount.service_ids : []);
      if (materialList) materialList.value = Array.isArray(discount.materials_items) ? discount.materials_items.join(", ") : "";
      syncScopes();
    } catch {
      setStatus(status, copy.loadError, "error");
    }

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus(status, "");
      if (save) save.disabled = true;
      const serviceScope = scopeValue("hc-service-scope");
      const materialsScope = scopeValue("hc-materials-scope");
      const serviceIds = Array.from(panel.querySelectorAll("[data-discount-service]:checked")).map((node) => node.value);
      const materialsItems = splitItems(materialList?.value || "");
      const payload = {
        enabled: Boolean(enabled?.checked),
        service_discount_percent: Number(servicePercent?.value || 0),
        service_scope: serviceScope,
        service_ids: serviceIds,
        materials_discount_percent: Number(materialsPercent?.value || 0),
        materials_scope: materialsScope,
        materials_items: materialsItems,
      };
      if (payload.enabled && payload.service_discount_percent === 0 && payload.materials_discount_percent === 0) {
        setStatus(status, copy.valueRequired, "error");
        if (save) save.disabled = false;
        return;
      }
      if (payload.service_discount_percent > 0 && serviceScope === "selected" && serviceIds.length === 0) {
        setStatus(status, copy.selectServiceRequired, "error");
        if (save) save.disabled = false;
        return;
      }
      if (payload.materials_discount_percent > 0 && materialsScope === "selected" && materialsItems.length === 0) {
        setStatus(status, copy.selectMaterialRequired, "error");
        if (save) save.disabled = false;
        return;
      }
      try {
        const response = await fetch("/api/repair-shop/driver-discount", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.error || "save_failed");
        setStatus(status, copy.saved, "success");
      } catch {
        setStatus(status, copy.saveError, "error");
      } finally {
        if (save) save.disabled = false;
      }
    });
  }

  async function initPublic() {
    if (path !== `${ROOT}/booking`) return;
    const slug = new URLSearchParams(window.location.search).get("shop")?.trim() || "";
    const hero = document.querySelector(".booking-page .hero");
    if (!slug || !hero || document.querySelector("[data-driver-discount-public]")) return;
    addStyles();
    try {
      const response = await fetch(`/api/public/repair-shop?slug=${encodeURIComponent(slug)}`);
      const data = await response.json().catch(() => ({}));
      const discount = data?.driver_discount;
      if (!response.ok || !data?.success || !discount?.enabled) return;

      const benefits = [];
      const servicePercent = Number(discount.service_discount_percent || 0);
      const materialsPercent = Number(discount.materials_discount_percent || 0);
      const serviceNames = Array.isArray(discount.service_names) ? discount.service_names.filter(Boolean) : [];
      const materialsItems = Array.isArray(discount.materials_items) ? discount.materials_items.filter(Boolean) : [];
      if (servicePercent > 0) {
        if (discount.service_scope === "selected") {
          if (serviceNames.length) benefits.push(copy.servicesSelected(servicePercent, serviceNames));
        } else benefits.push(copy.servicesAll(servicePercent));
      }
      if (materialsPercent > 0) {
        if (discount.materials_scope === "selected") {
          if (materialsItems.length) benefits.push(copy.materialsSelected(materialsPercent, materialsItems));
        } else benefits.push(copy.materialsAll(materialsPercent));
      }
      if (!benefits.length) return;

      const banner = document.createElement("section");
      banner.className = "hc-driver-discount-banner";
      banner.dataset.driverDiscountPublic = "true";
      banner.setAttribute("aria-label", copy.publicTitle);
      const top = document.createElement("div");
      top.className = "hc-driver-discount-top";
      const dollar = document.createElement("span");
      dollar.className = "hc-driver-discount-dollar";
      dollar.setAttribute("aria-hidden", "true");
      dollar.textContent = "$";
      const heading = document.createElement("div");
      const badge = document.createElement("p");
      badge.className = "hc-driver-discount-badge";
      badge.textContent = copy.publicBadge;
      const title = document.createElement("h2");
      title.textContent = copy.publicTitle;
      heading.append(badge, title);
      top.append(dollar, heading);
      const list = document.createElement("ul");
      list.className = "hc-driver-discount-benefits";
      for (const benefit of benefits) {
        const item = document.createElement("li");
        item.textContent = benefit;
        list.append(item);
      }
      const note = document.createElement("p");
      note.className = "hc-driver-discount-note";
      note.textContent = copy.publicNote;
      banner.append(top, list, note);
      hero.insertAdjacentElement("afterend", banner);
    } catch {
      // Public booking must remain usable even if the optional benefit lookup fails.
    }
  }

  initOwner();
  initPublic();
})();
