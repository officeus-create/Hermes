(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en";
  const locale = supported.has(requested) ? requested : "en";
  const copy = {
    en: { show:"Show QR", hide:"Hide QR", title:"Booking QR code", body:"Print this QR or place it at the counter, on business cards, your website, or Google Business Profile. It opens the same public booking link.", download:"Download PNG", print:"Print QR", alt:"QR code for this repair shop booking link", unavailable:"Save the public booking link first to create a QR code." },
    ru: { show:"Показать QR", hide:"Скрыть QR", title:"QR-код для записи", body:"Распечатайте QR или разместите его на стойке, визитках, сайте или Google Business Profile. Он открывает ту же публичную ссылку записи.", download:"Скачать PNG", print:"Распечатать QR", alt:"QR-код ссылки записи этого СТО", unavailable:"Сначала сохраните публичную ссылку СТО, чтобы создать QR-код." },
    uk: { show:"Показати QR", hide:"Сховати QR", title:"QR-код для запису", body:"Роздрукуйте QR або розмістіть його на стійці, візитках, сайті чи Google Business Profile. Він відкриває те саме публічне посилання запису.", download:"Завантажити PNG", print:"Роздрукувати QR", alt:"QR-код посилання запису цього СТО", unavailable:"Спочатку збережіть публічне посилання СТО, щоб створити QR-код." },
    es: { show:"Mostrar QR", hide:"Ocultar QR", title:"QR para reservas", body:"Imprime este QR o colócalo en el mostrador, tarjetas, web o Google Business Profile. Abre el mismo enlace público de reservas.", download:"Descargar PNG", print:"Imprimir QR", alt:"Código QR del enlace de reservas del taller", unavailable:"Guarda primero el enlace público del taller para crear el QR." },
    it: { show:"Mostra QR", hide:"Nascondi QR", title:"QR per prenotazioni", body:"Stampa questo QR o usalo al banco, sui biglietti da visita, sul sito o su Google Business Profile. Apre lo stesso link pubblico di prenotazione.", download:"Scarica PNG", print:"Stampa QR", alt:"Codice QR del link di prenotazione dell’officina", unavailable:"Salva prima il link pubblico dell’officina per creare il QR." },
    fr: { show:"Afficher le QR", hide:"Masquer le QR", title:"QR de réservation", body:"Imprimez ce QR ou placez-le au comptoir, sur vos cartes, votre site ou Google Business Profile. Il ouvre le même lien public de réservation.", download:"Télécharger PNG", print:"Imprimer le QR", alt:"QR du lien de réservation de l’atelier", unavailable:"Enregistrez d’abord le lien public de l’atelier pour créer le QR." },
  }[locale];

  const emit = (event) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, product: "repair_shops", renderer: "launch_external_public_url" });
  };

  const buildQrUrl = (bookingUrl) => {
    const url = new URL("https://quickchart.io/qr");
    url.searchParams.set("text", bookingUrl);
    url.searchParams.set("format", "png");
    url.searchParams.set("size", "420");
    url.searchParams.set("margin", "3");
    url.searchParams.set("ecLevel", "M");
    return url.toString();
  };

  function initialize() {
    const linkWrap = document.getElementById("public-link-wrap");
    const linkActions = linkWrap?.querySelector(".link-actions");
    if (!linkWrap || !linkActions || document.querySelector("[data-repair-qr-toggle]")) return false;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "secondary-btn";
    toggle.dataset.repairQrToggle = "true";
    toggle.textContent = copy.show;
    linkActions.append(toggle);

    const panel = document.createElement("section");
    panel.className = "repair-qr-panel hidden";
    panel.dataset.repairQrPanel = "true";
    panel.innerHTML = `<div class="repair-qr-copy"><strong>${copy.title}</strong><p>${copy.body}</p></div><div class="repair-qr-media"><img data-repair-qr-image width="210" height="210" alt="${copy.alt.replaceAll('"','&quot;')}" loading="lazy" /><div class="repair-qr-actions"><button type="button" class="secondary-btn" data-repair-qr-download>${copy.download}</button><button type="button" class="secondary-btn" data-repair-qr-print>${copy.print}</button></div></div>`;
    linkWrap.insertAdjacentElement("afterend", panel);

    const getBookingUrl = () => document.getElementById("public-link-text")?.textContent?.trim() || "";
    const image = panel.querySelector("[data-repair-qr-image]");

    toggle.addEventListener("click", () => {
      if (!panel.classList.contains("hidden")) {
        panel.classList.add("hidden");
        toggle.textContent = copy.show;
        return;
      }
      const bookingUrl = getBookingUrl();
      if (!bookingUrl) {
        const alert = document.getElementById("workspace-alert");
        if (alert) { alert.textContent = copy.unavailable; alert.className = "alert error"; }
        return;
      }
      if (image instanceof HTMLImageElement && !image.src) image.src = buildQrUrl(bookingUrl);
      panel.classList.remove("hidden");
      toggle.textContent = copy.hide;
      emit("connect_shop_qr_view");
    });

    panel.querySelector("[data-repair-qr-download]")?.addEventListener("click", async () => {
      const bookingUrl = getBookingUrl();
      if (!bookingUrl) return;
      const qrUrl = buildQrUrl(bookingUrl);
      emit("connect_shop_qr_download");
      try {
        const response = await fetch(qrUrl, { mode: "cors" });
        if (!response.ok) throw new Error("qr_download_failed");
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "hermes-connect-repair-shop-booking-qr.png";
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch {
        window.open(qrUrl, "_blank", "noopener,noreferrer");
      }
    });

    panel.querySelector("[data-repair-qr-print]")?.addEventListener("click", () => {
      const bookingUrl = getBookingUrl();
      if (!bookingUrl) return;
      const qrUrl = buildQrUrl(bookingUrl);
      emit("connect_shop_qr_print");
      const printWindow = window.open("", "_blank", "noopener,noreferrer,width=640,height=760");
      if (!printWindow) return;
      const safeBookingUrl = bookingUrl.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
      printWindow.document.write(`<!doctype html><html><head><title>${copy.title}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:32px;color:#111}img{width:360px;height:360px;max-width:90vw}.url{font-size:12px;overflow-wrap:anywhere;margin-top:18px}</style></head><body><h1>${copy.title}</h1><img src="${qrUrl}" alt="${copy.alt.replaceAll('"','&quot;')}" onload="window.print()"><p class="url">${safeBookingUrl}</p></body></html>`);
      printWindow.document.close();
    });
    return true;
  }

  if (!initialize()) {
    const observer = new MutationObserver(() => { if (initialize()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }

  const style = document.createElement("style");
  style.textContent = `.repair-qr-panel{display:flex;justify-content:space-between;gap:22px;align-items:center;margin-top:10px;padding:18px;border:1px solid rgba(124,92,255,.16);border-radius:16px;background:rgba(124,92,255,.05)}.repair-qr-panel.hidden{display:none!important}.repair-qr-copy{max-width:540px}.repair-qr-copy strong{font-size:16px}.repair-qr-copy p{margin:7px 0 0;color:#9ea5b4;font-size:12px;line-height:1.55}.repair-qr-media{display:flex;align-items:center;gap:12px}.repair-qr-media img{width:140px;height:140px;padding:7px;border-radius:10px;background:#fff}.repair-qr-actions{display:grid;gap:8px}.repair-qr-actions button{min-height:44px}@media(max-width:720px){.repair-qr-panel,.repair-qr-media{display:block}.repair-qr-media{margin-top:14px}.repair-qr-media img{display:block;width:min(240px,100%);height:auto;margin:0 auto}.repair-qr-actions{grid-template-columns:1fr 1fr;margin-top:12px}}`;
  document.head.append(style);
})();
