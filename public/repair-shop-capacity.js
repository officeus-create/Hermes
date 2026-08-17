(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const strings = {
    en: { title:"Simultaneous service capacity", body:"How many appointments can your shop actively work on at the same time? Use the number of service bays or teams that can truly handle overlapping jobs.", label:"Parallel active jobs", save:"Save capacity", saved:"Service capacity saved.", error:"Unable to save service capacity.", loading:"Loading current capacity…" },
    ru: { title:"Параллельная загрузка СТО", body:"Сколько автомобилей или работ СТО реально может обслуживать одновременно? Укажите число рабочих постов или команд, которые действительно могут вести параллельные работы.", label:"Одновременных активных работ", save:"Сохранить загрузку", saved:"Параллельная загрузка сохранена.", error:"Не удалось сохранить загрузку СТО.", loading:"Загружаем текущую загрузку…" },
    uk: { title:"Паралельне навантаження СТО", body:"Скільки автомобілів або робіт СТО реально може обслуговувати одночасно? Вкажіть кількість постів або команд, що справді можуть вести паралельні роботи.", label:"Одночасних активних робіт", save:"Зберегти навантаження", saved:"Паралельне навантаження збережено.", error:"Не вдалося зберегти навантаження СТО.", loading:"Завантажуємо поточне навантаження…" },
    es: { title:"Capacidad de servicio simultáneo", body:"¿Cuántas citas puede atender activamente el taller al mismo tiempo? Usa el número real de puestos o equipos capaces de trabajar en paralelo.", label:"Trabajos activos simultáneos", save:"Guardar capacidad", saved:"Capacidad guardada.", error:"No se pudo guardar la capacidad.", loading:"Cargando capacidad actual…" },
    it: { title:"Capacità di servizio simultanea", body:"Quanti appuntamenti può gestire attivamente l’officina nello stesso momento? Usa il numero reale di postazioni o squadre che possono lavorare in parallelo.", label:"Lavori attivi simultanei", save:"Salva capacità", saved:"Capacità salvata.", error:"Impossibile salvare la capacità.", loading:"Caricamento capacità attuale…" },
    fr: { title:"Capacité de service simultanée", body:"Combien de rendez-vous l’atelier peut-il réellement traiter en même temps ? Utilisez le nombre réel de postes ou d’équipes capables de travailler en parallèle.", label:"Travaux actifs simultanés", save:"Enregistrer la capacité", saved:"Capacité enregistrée.", error:"Impossible d’enregistrer la capacité.", loading:"Chargement de la capacité actuelle…" },
  };
  const copy = strings[locale] || strings.en;

  const install = async () => {
    const parent = document.querySelector("[data-repair-capabilities]");
    if (!parent || parent.querySelector("[data-repair-capacity-control]")) return false;

    const section = document.createElement("section");
    section.className = "hc-capacity-control";
    section.dataset.repairCapacityControl = "true";
    section.innerHTML = `
      <div class="hc-capacity-copy"><strong>${copy.title}</strong><span>${copy.body}</span></div>
      <form data-capacity-form>
        <label>${copy.label}<select data-capacity-select aria-label="${copy.label}">${Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}</select></label>
        <button type="submit" class="secondary-btn">${copy.save}</button>
      </form>
      <p data-capacity-status role="status" aria-live="polite">${copy.loading}</p>`;
    parent.append(section);

    if (!document.getElementById("repair-capacity-styles")) {
      const style = document.createElement("style");
      style.id = "repair-capacity-styles";
      style.textContent = `.hc-capacity-control{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:end;margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}.hc-capacity-copy{display:grid;gap:5px;min-width:0}.hc-capacity-copy strong{color:#eef3f9;font-size:14px}.hc-capacity-copy span{max-width:620px;color:#95a2b4;font-size:12px;line-height:1.5}.hc-capacity-control form{display:flex;align-items:end;gap:9px}.hc-capacity-control label{display:grid;gap:6px;color:#cfd7e3;font-size:12px;font-weight:750}.hc-capacity-control select{min-width:90px;min-height:42px;padding:0 10px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#11141d;color:#fff;font:inherit}.hc-capacity-control p{grid-column:1/-1;margin:0;color:#8f9bad;font-size:12px}.hc-capacity-control p[data-state="success"]{color:#86efc3}.hc-capacity-control p[data-state="error"]{color:#fca5a5}@media(max-width:760px){.hc-capacity-control{grid-template-columns:1fr}.hc-capacity-control form{align-items:stretch;flex-direction:column}.hc-capacity-control select,.hc-capacity-control button{width:100%;box-sizing:border-box}.hc-capacity-control p{grid-column:auto}}`;
      document.head.append(style);
    }

    const select = section.querySelector("[data-capacity-select]");
    const form = section.querySelector("[data-capacity-form]");
    const status = section.querySelector("[data-capacity-status]");
    const setStatus = (text, state = "") => { if (status) { status.textContent = text; status.dataset.state = state; } };

    try {
      const response = await fetch("/api/repair-shop/capabilities", { credentials: "same-origin" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error("load_failed");
      if (select instanceof HTMLSelectElement) select.value = String(data.capabilities?.parallel_booking_capacity || 1);
      setStatus("");
    } catch {
      setStatus(copy.error, "error");
    }

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!(select instanceof HTMLSelectElement)) return;
      const button = form.querySelector("button");
      if (button instanceof HTMLButtonElement) button.disabled = true;
      try {
        const response = await fetch("/api/repair-shop/capacity", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parallel_booking_capacity: Number(select.value) }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.error || "save_failed");
        select.value = String(data.capabilities?.parallel_booking_capacity || select.value);
        setStatus(copy.saved, "success");
      } catch {
        setStatus(copy.error, "error");
      } finally {
        if (button instanceof HTMLButtonElement) button.disabled = false;
      }
    });
    return true;
  };

  const watchForParent = () => {
    const observer = new MutationObserver(async () => {
      if (await install()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 5000);
  };

  install().then((installed) => {
    if (!installed) watchForParent();
  }).catch(() => watchForParent());
})();
