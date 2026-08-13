import { contactMethods } from "../contact-methods.mjs";
import { t, applyTranslations, renderLanguageSwitcher } from "../i18n.mjs";

const loadingEl = document.querySelector("[data-loading]");
const errorEl = document.querySelector("[data-error]");
const viewEl = document.querySelector("[data-manage-view]");
const cancelButton = document.querySelector("[data-cancel-button]");
const messageEl = document.querySelector("[data-manage-message]");

let lastBooking = null;

applyTranslations();
renderLanguageSwitcher(document.querySelector("[data-lang-switcher-slot]"), () => {
  if (lastBooking) render(lastBooking);
});

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function render(booking) {
  lastBooking = booking;
  document.querySelector("[data-manage-title]").textContent = t("manage.title", { name: booking.clientName });
  document.querySelector("[data-manage-specialist]").textContent = booking.specialist;
  document.querySelector("[data-manage-service]").textContent = `${booking.service}${booking.durationMinutes ? ` · ${t("common.durationMin", { n: booking.durationMinutes })}` : ""}`;
  document.querySelector("[data-manage-time]").textContent = booking.time;
  document.querySelector("[data-manage-status]").textContent = t(`status.${booking.status}`) !== `status.${booking.status}` ? t(`status.${booking.status}`) : booking.status.replace(/_/g, " ");
  const contactLabel = contactMethods.find((method) => method.id === booking.contactMethod)?.label || booking.contactMethod;
  document.querySelector("[data-manage-contact]").textContent = booking.contactHandle
    ? `${contactLabel} · ${booking.contactHandle}`
    : "—";

  const topicRow = document.querySelector("[data-manage-topic-row]");
  if (booking.bookingType === "meeting" && booking.meetingTopic) {
    topicRow.hidden = false;
    document.querySelector("[data-manage-topic]").textContent = booking.meetingTopic;
  } else {
    topicRow.hidden = true;
  }

  const linkRow = document.querySelector("[data-manage-link-row]");
  if (booking.bookingType === "meeting" && booking.meetingLink) {
    linkRow.hidden = false;
    const linkEl = document.querySelector("[data-manage-link]");
    linkEl.href = booking.meetingLink;
    linkEl.textContent = booking.meetingLink;
  } else {
    linkRow.hidden = true;
  }

  if (booking.status === "pending_approval") {
    cancelButton.hidden = true;
    messageEl.textContent = t("manage.pendingMessage");
  } else if (booking.status === "cancelled") {
    cancelButton.hidden = true;
    messageEl.textContent = t("manage.cancelledMessage");
  }
}

async function init() {
  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    return;
  }

  const { ok, body } = await api(`/api/public/booking/${encodeURIComponent(token)}`);
  loadingEl.hidden = true;
  if (!ok) {
    errorEl.hidden = false;
    return;
  }

  viewEl.hidden = false;
  render(body.booking);

  cancelButton.addEventListener("click", async () => {
    if (!window.confirm(t("manage.cancelConfirm"))) return;
    cancelButton.disabled = true;
    messageEl.textContent = t("manage.cancelling");
    const { ok: cancelOk, body: cancelBody } = await api(`/api/public/booking/${encodeURIComponent(token)}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "cancel" }),
    });
    if (!cancelOk) {
      messageEl.textContent = t("manage.cancelFailed");
      cancelButton.disabled = false;
      return;
    }
    render(cancelBody.booking);
    messageEl.textContent = t("manage.cancelSuccess");
  });
}

init();
