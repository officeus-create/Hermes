(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== `${ROOT}/dashboard`) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const strings = {
    en: { noShow:"No-show", markNoShow:"Mark no-show", noShowDone:"Marked as no-show.", noShowError:"Unable to mark this booking as no-show.", follow:"Plan follow-up", followActive:"Follow-up needed · mark done", followSaved:"Follow-up saved.", followCleared:"Follow-up completed.", followError:"Unable to update follow-up.", history:"Status history" },
    ru: { noShow:"Неявка", markNoShow:"Отметить неявку", noShowDone:"Запись отмечена как неявка.", noShowError:"Не удалось отметить неявку.", follow:"Запланировать follow-up", followActive:"Follow-up нужен · отметить выполненным", followSaved:"Follow-up сохранён.", followCleared:"Follow-up выполнен.", followError:"Не удалось обновить follow-up.", history:"История статусов" },
    uk: { noShow:"Неявка", markNoShow:"Позначити неявку", noShowDone:"Запис позначено як неявку.", noShowError:"Не вдалося позначити неявку.", follow:"Запланувати follow-up", followActive:"Follow-up потрібен · позначити виконаним", followSaved:"Follow-up збережено.", followCleared:"Follow-up виконано.", followError:"Не вдалося оновити follow-up.", history:"Історія статусів" },
    es: { noShow:"No se presentó", markNoShow:"Marcar ausencia", noShowDone:"La cita se marcó como ausencia.", noShowError:"No se pudo marcar la ausencia.", follow:"Planificar seguimiento", followActive:"Seguimiento pendiente · marcar hecho", followSaved:"Seguimiento guardado.", followCleared:"Seguimiento completado.", followError:"No se pudo actualizar el seguimiento.", history:"Historial de estados" },
    it: { noShow:"Assente", markNoShow:"Segna assenza", noShowDone:"Prenotazione segnata come assenza.", noShowError:"Impossibile segnare l’assenza.", follow:"Pianifica follow-up", followActive:"Follow-up richiesto · segna completato", followSaved:"Follow-up salvato.", followCleared:"Follow-up completato.", followError:"Impossibile aggiornare il follow-up.", history:"Cronologia stati" },
    fr: { noShow:"Absent", markNoShow:"Marquer absent", noShowDone:"Le rendez-vous a été marqué absent.", noShowError:"Impossible de marquer l’absence.", follow:"Planifier un suivi", followActive:"Suivi nécessaire · marquer terminé", followSaved:"Suivi enregistré.", followCleared:"Suivi terminé.", followError:"Impossible de mettre à jour le suivi.", history:"Historique des statuts" },
  };
  const copy = strings[locale] || strings.en;
  const followups = new Set();
  let followupsLoaded = false;

  const installStyles = () => {
    if (document.getElementById("repair-operations-styles")) return;
    const style = document.createElement("style");
    style.id = "repair-operations-styles";
    style.textContent = `.status-no_show{background:rgba(168,116,39,.12)!important;border-color:rgba(248,190,88,.25)!important;color:#ffd996!important}.hc-booking-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.hc-no-show-btn,.hc-followup-btn{min-height:36px;padding:7px 10px;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer}.hc-no-show-btn{border:1px solid rgba(248,190,88,.24);background:rgba(168,116,39,.1);color:#ffd996}.hc-followup-btn{border:1px solid rgba(124,92,255,.22);background:rgba(124,92,255,.08);color:#d8d1ff}.hc-followup-btn[data-active="true"]{border-color:rgba(52,211,153,.25);background:rgba(52,211,153,.08);color:#baf3dc}.hc-booking-action-status{margin:7px 0 0;color:#93a0b2;font-size:11px}.hc-booking-action-status[data-state="success"]{color:#86efc3}.hc-booking-action-status[data-state="error"]{color:#fca5a5}@media(max-width:440px){.hc-booking-actions{display:grid;grid-template-columns:1fr}.hc-no-show-btn,.hc-followup-btn{width:100%}}`;
    document.head.append(style);
  };

  const formatHistoryTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value || "") : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const localizeNoShow = (card) => {
    const pill = card.querySelector(".status-pill.status-no_show");
    if (pill && pill.textContent !== copy.noShow) pill.textContent = copy.noShow;
    card.querySelectorAll(".history li strong").forEach((node) => {
      const historyStatus = (node.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
      if ((historyStatus === "no_show" || historyStatus === "no show") && node.textContent !== copy.noShow) node.textContent = copy.noShow;
    });
  };

  const renderHistory = (card, history) => {
    const section = card.querySelector(".history");
    if (!section || !Array.isArray(history)) return;
    section.innerHTML = "";
    const title = document.createElement("span");
    title.className = "mini-label";
    title.textContent = copy.history;
    section.append(title);
    const list = document.createElement("ol");
    for (const item of history) {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = String(item?.to_status || "").toLowerCase() === "no_show" ? copy.noShow : String(item?.to_status || "").replaceAll("_", " ");
      const time = document.createElement("span");
      time.textContent = formatHistoryTime(item?.changed_at);
      li.append(strong, time);
      list.append(li);
    }
    section.append(list);
  };

  const ensureActionStatus = (card) => {
    let status = card.querySelector("[data-booking-action-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "hc-booking-action-status";
      status.dataset.bookingActionStatus = "true";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      card.append(status);
    }
    return status;
  };

  const setActionStatus = (card, text, state = "") => {
    const status = ensureActionStatus(card);
    status.textContent = text;
    status.dataset.state = state;
  };

  async function markNoShow(card, bookingId, button) {
    button.disabled = true;
    try {
      const response = await fetch(`/api/repair-shop/bookings/${encodeURIComponent(bookingId)}/status`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "no_show" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "status_failed");
      const control = card.querySelector(".status-control");
      if (control) {
        control.innerHTML = "";
        const pill = document.createElement("span");
        pill.className = "status-pill status-no_show";
        pill.textContent = copy.noShow;
        control.append(pill);
      }
      button.closest(".hc-booking-actions")?.remove();
      renderHistory(card, data.history || []);
      setActionStatus(card, copy.noShowDone, "success");
    } catch {
      button.disabled = false;
      setActionStatus(card, copy.noShowError, "error");
    }
  }

  async function setFollowup(card, bookingId, button, needed) {
    button.disabled = true;
    try {
      const response = await fetch("/api/repair-shop/followups", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, needed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "followup_failed");
      if (needed) followups.add(bookingId); else followups.delete(bookingId);
      button.dataset.active = needed ? "true" : "false";
      button.textContent = needed ? copy.followActive : copy.follow;
      setActionStatus(card, needed ? copy.followSaved : copy.followCleared, "success");
    } catch {
      setActionStatus(card, copy.followError, "error");
    } finally {
      button.disabled = false;
    }
  }

  const decorateCards = () => {
    document.querySelectorAll(".booking-card[data-booking-id]").forEach((card) => {
      const bookingId = card.dataset.bookingId || "";
      if (!bookingId) return;
      localizeNoShow(card);
      if (card.querySelector("[data-repair-operation-actions]")) return;

      const statusPill = card.querySelector(".status-pill");
      const statusClass = Array.from(statusPill?.classList || []).find((name) => name.startsWith("status-") && name !== "status-pill");
      const status = statusClass ? statusClass.slice("status-".length) : "";
      if (!(status === "confirmed" || status === "completed")) return;

      const actions = document.createElement("div");
      actions.className = "hc-booking-actions";
      actions.dataset.repairOperationActions = "true";

      if (status === "confirmed") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hc-no-show-btn";
        button.textContent = copy.markNoShow;
        button.addEventListener("click", () => markNoShow(card, bookingId, button));
        actions.append(button);
      }

      if (status === "completed" && followupsLoaded) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hc-followup-btn";
        const active = followups.has(bookingId);
        button.dataset.active = active ? "true" : "false";
        button.textContent = active ? copy.followActive : copy.follow;
        button.addEventListener("click", () => setFollowup(card, bookingId, button, !followups.has(bookingId)));
        actions.append(button);
      }

      if (actions.childElementCount) card.append(actions);
    });
  };

  async function loadFollowups() {
    try {
      const response = await fetch("/api/repair-shop/followups", { credentials: "same-origin" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error("followup_load_failed");
      followups.clear();
      for (const item of Array.isArray(data.followups) ? data.followups : []) {
        if (item?.booking_id) followups.add(String(item.booking_id));
      }
      followupsLoaded = true;
      document.querySelectorAll("[data-repair-operation-actions]").forEach((node) => node.remove());
      decorateCards();
    } catch {
      followupsLoaded = true;
      decorateCards();
    }
  }

  const run = () => {
    installStyles();
    decorateCards();
    loadFollowups().catch(() => {});
    const list = document.getElementById("bookings-list");
    if (list) {
      new MutationObserver(() => decorateCards()).observe(list, { childList: true, subtree: true });
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true }); else run();
})();
