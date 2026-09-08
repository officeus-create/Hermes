(() => {
  const ROOT = "/services/hermes-connect/repair-shops/dashboard";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== ROOT) return;

  const locale = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const strings = {
    en: { preview: "Live preview", hidden: "Hidden from customers", public: "Visible to customers after save", none: "No discount configured", services: "services", materials: "parts & materials", hint: "Change the values below, review the summary, then save. The public booking page changes only after a successful save." },
    ru: { preview: "Предпросмотр", hidden: "Скрыто от клиентов", public: "Будет видно клиентам после сохранения", none: "Скидка не настроена", services: "услуги", materials: "запчасти и материалы", hint: "Измените значения, проверьте итог ниже и сохраните. Публичная страница записи меняется только после успешного сохранения." },
    uk: { preview: "Попередній перегляд", hidden: "Приховано від клієнтів", public: "Буде видно клієнтам після збереження", none: "Знижку не налаштовано", services: "послуги", materials: "запчастини й матеріали", hint: "Змініть значення, перевірте підсумок і збережіть. Публічна сторінка зміниться лише після успішного збереження." },
    es: { preview: "Vista previa", hidden: "Oculto para clientes", public: "Visible para clientes después de guardar", none: "Sin descuento configurado", services: "servicios", materials: "repuestos y materiales", hint: "Ajusta los valores, revisa el resumen y guarda. La página pública cambia solo después de guardar correctamente." },
    it: { preview: "Anteprima", hidden: "Nascosto ai clienti", public: "Visibile ai clienti dopo il salvataggio", none: "Nessuno sconto configurato", services: "servizi", materials: "ricambi e materiali", hint: "Modifica i valori, controlla il riepilogo e salva. La pagina pubblica cambia solo dopo un salvataggio riuscito." },
    fr: { preview: "Aperçu", hidden: "Masqué aux clients", public: "Visible aux clients après enregistrement", none: "Aucune remise configurée", services: "services", materials: "pièces et matériaux", hint: "Modifiez les valeurs, vérifiez le résumé puis enregistrez. La page publique ne change qu’après un enregistrement réussi." },
  };
  const copy = strings[locale] || strings.en;

  function installStyles() {
    if (document.getElementById("hc-driver-discount-polish-styles")) return;
    const style = document.createElement("style");
    style.id = "hc-driver-discount-polish-styles";
    style.textContent = `
      html.hc-repair-crm .hc-driver-discount-owner.hc-driver-discount-v2{border:1px solid #dfe7ee!important;border-radius:20px!important;background:#fff!important;box-shadow:0 14px 34px rgba(23,32,51,.06)!important;overflow:hidden}
      html.hc-repair-crm .hc-driver-discount-v2>.panel-heading{margin:-1px -1px 0;padding:20px 22px;border-bottom:1px solid #e7edf2;background:linear-gradient(135deg,#f8fbff 0%,#f4fbf6 100%)}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-dollar{width:46px;height:46px;flex-basis:46px;border:1px solid #cfe8d7;background:#edf8f1;color:#187044;box-shadow:none}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-form{gap:16px;padding:20px 22px 22px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-enable{align-items:center;min-height:52px;box-sizing:border-box;padding:12px 14px;border:1px solid #d7e4dc;border-radius:14px;background:#f7fbf8;color:#1f5f3a;cursor:pointer}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-enable input{width:22px;height:22px;flex:0 0 22px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-grid{gap:12px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-card{gap:14px;padding:16px;border:1px solid #e2e8ee;border-radius:16px;background:#fbfcfd}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-card h3{font-size:15px;color:#172033}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-percent{gap:7px;color:#536275;font-size:12px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-percent input{width:100%;min-height:46px;box-sizing:border-box;border:1px solid #d7e0e8;border-radius:12px;padding:10px 12px;background:#fff;color:#172033;font-size:16px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-scopes{grid-template-columns:1fr 1fr;gap:8px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-scopes label{min-height:46px;box-sizing:border-box;justify-content:flex-start;padding:10px 11px;border:1px solid #dfe6ec;border-radius:12px;background:#fff;color:#405064;cursor:pointer;line-height:1.3}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-scopes label:has(input:checked){border-color:#9dcfb0;background:#eff9f2;color:#1d6540;box-shadow:inset 0 0 0 1px #c2e3cd}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-scopes input{width:18px;height:18px;flex:0 0 18px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-selected{padding-top:2px}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-service{min-height:44px;box-sizing:border-box;align-items:center;padding:10px 11px;border:1px solid #e1e7ed;border-radius:11px;background:#fff;color:#334155;cursor:pointer}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-service:has(input:checked){border-color:#a7d4b7;background:#f0faf3;color:#1e633e}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-service input{width:18px;height:18px;flex:0 0 18px;margin:0}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-textarea{min-height:104px;border:1px solid #d7e0e8;border-radius:12px;background:#fff;color:#172033;font-size:14px;line-height:1.5}
      html.hc-repair-crm .hc-driver-discount-preview{display:grid;grid-template-columns:auto 1fr;gap:10px 14px;align-items:center;padding:14px 16px;border:1px solid #dfe7ee;border-radius:14px;background:#f8fafc}
      html.hc-repair-crm .hc-driver-discount-preview strong{color:#172033;font-size:13px}
      html.hc-repair-crm .hc-driver-discount-preview-status{justify-self:end;padding:5px 9px;border-radius:999px;background:#eef2f6;color:#5f6e7e;font-size:11px;font-weight:850}
      html.hc-repair-crm .hc-driver-discount-preview-status[data-public="true"]{background:#eaf8ef;color:#17653b}
      html.hc-repair-crm .hc-driver-discount-preview-summary{grid-column:1/-1;margin:0;color:#405064;font-size:13px;font-weight:750;line-height:1.45}
      html.hc-repair-crm .hc-driver-discount-preview-hint{grid-column:1/-1;margin:0;color:#718096;font-size:11px;line-height:1.5}
      html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-status{min-height:20px;margin:0;font-size:12px;font-weight:700}
      html.hc-repair-crm .hc-driver-discount-v2 .primary-btn[type="submit"]{min-height:48px;min-width:190px;border-radius:12px;padding:11px 18px;font-weight:850}
      html.hc-repair-crm .hc-driver-discount-v2 input:focus-visible,html.hc-repair-crm .hc-driver-discount-v2 textarea:focus-visible,html.hc-repair-crm .hc-driver-discount-v2 button:focus-visible,html.hc-repair-crm .hc-driver-discount-v2 label:focus-within{outline:3px solid rgba(30,136,255,.18);outline-offset:2px}
      @media(max-width:720px){html.hc-repair-crm .hc-driver-discount-v2>.panel-heading{padding:17px 16px}html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-form{padding:16px}html.hc-repair-crm .hc-driver-discount-v2 .hc-driver-discount-scopes{grid-template-columns:1fr}html.hc-repair-crm .hc-driver-discount-preview{grid-template-columns:1fr}html.hc-repair-crm .hc-driver-discount-preview-status{justify-self:start}html.hc-repair-crm .hc-driver-discount-preview-summary,html.hc-repair-crm .hc-driver-discount-preview-hint{grid-column:1}html.hc-repair-crm .hc-driver-discount-v2 .primary-btn[type="submit"]{width:100%}}
    `;
    document.head.append(style);
  }

  const pct = (node) => Math.max(0, Math.min(100, Number(node?.value || 0) || 0));

  function enhance(panel) {
    if (!(panel instanceof HTMLElement) || panel.dataset.driverDiscountPolished === "true") return;
    panel.dataset.driverDiscountPolished = "true";
    panel.dataset.driverDiscountClickableReady = "true";
    panel.classList.add("hc-driver-discount-v2");
    installStyles();

    const form = panel.querySelector("[data-driver-discount-form]");
    if (!(form instanceof HTMLFormElement)) return;
    const enabled = panel.querySelector("[data-discount-enabled]");
    const servicePercent = panel.querySelector("[data-service-percent]");
    const materialsPercent = panel.querySelector("[data-materials-percent]");
    const status = panel.querySelector("[data-discount-status]");

    const preview = document.createElement("section");
    preview.className = "hc-driver-discount-preview";
    preview.dataset.driverDiscountPreview = "true";
    preview.setAttribute("aria-live", "polite");
    preview.innerHTML = `<strong>${copy.preview}</strong><span class="hc-driver-discount-preview-status"></span><p class="hc-driver-discount-preview-summary"></p><p class="hc-driver-discount-preview-hint">${copy.hint}</p>`;
    form.insertBefore(preview, status || form.querySelector("button[type='submit']"));

    const previewStatus = preview.querySelector(".hc-driver-discount-preview-status");
    const previewSummary = preview.querySelector(".hc-driver-discount-preview-summary");
    const updatePreview = () => {
      const isPublic = Boolean(enabled?.checked);
      const service = pct(servicePercent);
      const materials = pct(materialsPercent);
      if (previewStatus) {
        previewStatus.textContent = isPublic ? copy.public : copy.hidden;
        previewStatus.dataset.public = isPublic ? "true" : "false";
      }
      const parts = [];
      if (service > 0) parts.push(`${service}% ${copy.services}`);
      if (materials > 0) parts.push(`${materials}% ${copy.materials}`);
      if (previewSummary) previewSummary.textContent = parts.length ? parts.join(" · ") : copy.none;
      panel.dataset.driverDiscountEnabled = isPublic ? "true" : "false";
    };

    form.addEventListener("input", updatePreview);
    form.addEventListener("change", updatePreview);
    const observer = new MutationObserver(updatePreview);
    if (status) observer.observe(status, { childList: true, characterData: true, subtree: true });
    window.setTimeout(updatePreview, 0);
    window.setTimeout(updatePreview, 350);
  }

  const existing = document.querySelector("[data-driver-discount-owner]");
  if (existing) enhance(existing);
  const observer = new MutationObserver(() => {
    const panel = document.querySelector("[data-driver-discount-owner]");
    if (panel) enhance(panel);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
