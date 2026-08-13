import { contactMethods, contactIconSvg } from "../contact-methods.mjs";
import { t, applyTranslations, renderLanguageSwitcher } from "../i18n.mjs";

const loadingEl = document.querySelector("[data-loading]");
const errorEl = document.querySelector("[data-error]");
const viewEl = document.querySelector("[data-book-view]");
const confirmationEl = document.querySelector("[data-confirmation]");
const form = document.querySelector("[data-book-form]");
const staffFieldset = document.querySelector("[data-staff-fieldset]");
const staffRoot = document.querySelector("[data-book-staff]");
const servicesRoot = document.querySelector("[data-book-services]");
const timesRoot = document.querySelector("[data-book-times]");
const noSlotsEl = document.querySelector("[data-no-slots]");
const submitButton = document.querySelector("[data-book-submit]");
const statusEl = document.querySelector("[data-book-status]");
const contactMethodsRoot = document.querySelector("[data-contact-methods]");
const contactHandleInput = document.querySelector("[data-contact-handle]");
const contactHandleLabel = document.querySelector("[data-contact-handle-label]");

let selectedServiceId = null;
let selectedSlot = null;
let selectedStaffId = null;
let selectedContactMethod = null;
let lastConfirmedBooking = null;
let loadedServices = [];
let hasStaff = false;

applyTranslations();
renderLanguageSwitcher(document.querySelector("[data-lang-switcher-slot]"), () => {
  [...servicesRoot.children].forEach((button, index) => {
    const small = button.querySelector("small");
    if (small && loadedServices[index]) small.textContent = t("common.durationMin", { n: loadedServices[index].durationMinutes });
  });
  if (lastConfirmedBooking) showConfirmation(lastConfirmedBooking);
});

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function updateSubmitState() {
  submitButton.disabled = !(
    (!hasStaff || selectedStaffId) &&
    selectedServiceId &&
    selectedSlot &&
    form.clientName.value.trim() &&
    form.clientEmail.value.trim() &&
    selectedContactMethod &&
    contactHandleInput.value.trim()
  );
}

function renderContactMethods() {
  contactMethods.forEach((method) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn contact-method-btn";
    button.innerHTML = `${contactIconSvg(method.id)}<span>${method.label}</span>`;
    button.addEventListener("click", () => {
      [...contactMethodsRoot.children].forEach((child) => child.removeAttribute("data-selected"));
      button.dataset.selected = "true";
      selectedContactMethod = method.id;
      contactHandleInput.disabled = false;
      contactHandleInput.placeholder = method.placeholder;
      contactHandleLabel.textContent = t("common.handleFor", { method: method.label });
      updateSubmitState();
    });
    contactMethodsRoot.append(button);
  });
}

function renderChoiceButton(root, { key, label, sub, onSelect }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-btn";
  button.innerHTML = sub ? `${label}<small>${sub}</small>` : label;
  button.addEventListener("click", () => {
    [...root.children].forEach((child) => child.removeAttribute("data-selected"));
    button.dataset.selected = "true";
    onSelect(key);
    updateSubmitState();
  });
  root.append(button);
}

function populateServicesAndTimes(services, availability) {
  servicesRoot.innerHTML = "";
  timesRoot.innerHTML = "";
  noSlotsEl.hidden = true;
  selectedServiceId = null;
  selectedSlot = null;

  loadedServices = services;
  services.forEach((service) => {
    renderChoiceButton(servicesRoot, {
      key: service.id,
      label: service.name,
      sub: t("common.durationMin", { n: service.durationMinutes }),
      onSelect: (id) => { selectedServiceId = id; },
    });
  });

  if (!availability.length) {
    noSlotsEl.hidden = false;
  } else {
    availability.forEach((slot) => {
      renderChoiceButton(timesRoot, {
        key: slot,
        label: slot,
        onSelect: (value) => { selectedSlot = value; },
      });
    });
  }
  updateSubmitState();
}

function renderStaffPicker(staff) {
  staff.forEach((member) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.innerHTML = `${member.name}<small>${member.role}</small>`;
    button.addEventListener("click", () => {
      [...staffRoot.children].forEach((child) => child.removeAttribute("data-selected"));
      button.dataset.selected = "true";
      selectedStaffId = member.id;
      populateServicesAndTimes(member.services, member.availability);
    });
    staffRoot.append(button);
  });
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

async function init() {
  const specialistId = new URLSearchParams(window.location.search).get("specialist");
  if (!specialistId) {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    return;
  }

  const { ok, body } = await api(`/api/public/specialist/${encodeURIComponent(specialistId)}`);
  loadingEl.hidden = true;
  if (!ok) {
    errorEl.hidden = false;
    return;
  }

  const profile = body.specialist;
  viewEl.hidden = false;
  document.querySelector("[data-specialist-name]").textContent = profile.name;
  document.querySelector("[data-specialist-role]").textContent = profile.role;
  document.querySelector("[data-specialist-location]").textContent = profile.location;
  document.querySelector("[data-specialist-bio]").textContent = profile.bio;
  document.querySelector("[data-specialist-avatar]").textContent = initials(profile.name);

  hasStaff = Boolean(profile.staff && profile.staff.length);
  if (hasStaff) {
    staffFieldset.hidden = false;
    renderStaffPicker(profile.staff);
  } else {
    populateServicesAndTimes(profile.services, profile.availability);
  }

  renderContactMethods();

  form.clientName.addEventListener("input", updateSubmitState);
  form.clientEmail.addEventListener("input", updateSubmitState);
  contactHandleInput.addEventListener("input", updateSubmitState);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedServiceId || !selectedSlot) return;
    statusEl.textContent = t("book.statusBooking");
    submitButton.disabled = true;
    const { ok: bookOk, body: bookBody } = await api("/api/public/booking", {
      method: "POST",
      body: JSON.stringify({
        specialistId,
        staffId: selectedStaffId,
        serviceId: selectedServiceId,
        slot: selectedSlot,
        clientName: form.clientName.value,
        clientEmail: form.clientEmail.value,
        contactMethod: selectedContactMethod,
        contactHandle: contactHandleInput.value,
      }),
    });
    if (!bookOk) {
      const messageKeys = {
        slot_already_booked: "book.errSlotTaken",
        email_invalid: "book.errEmailInvalid",
        name_required: "book.errNameRequired",
        contact_method_invalid: "book.errContactMethod",
        contact_handle_required: "book.errContactHandle",
      };
      const firstError = (bookBody.errors && bookBody.errors[0]) || bookBody.error;
      statusEl.textContent = messageKeys[firstError] ? t(messageKeys[firstError]) : t("book.errGeneric");
      submitButton.disabled = false;
      return;
    }
    lastConfirmedBooking = bookBody.booking;
    showConfirmation(bookBody.booking);
  });
}

function showConfirmation(booking) {
  viewEl.hidden = true;
  confirmationEl.hidden = false;
  document.querySelector("[data-conf-heading]").textContent = t("book.confHeading", { name: booking.clientName });
  document.querySelector("[data-conf-lede]").textContent = t("book.confLede");
  document.querySelector("[data-conf-specialist]").textContent = booking.specialist;
  document.querySelector("[data-conf-service]").textContent = `${booking.service} · ${t("common.durationMin", { n: booking.durationMinutes })}`;
  document.querySelector("[data-conf-time]").textContent = booking.time;
  const contactLabel = contactMethods.find((method) => method.id === booking.contactMethod)?.label || booking.contactMethod;
  document.querySelector("[data-conf-contact]").textContent = `${contactLabel} · ${booking.contactHandle}`;
  const manageUrl = new URL(`../manage/?token=${booking.accessToken}`, window.location.href).toString();
  const linkInput = document.querySelector("[data-conf-link]");
  linkInput.value = manageUrl;
  document.querySelector("[data-copy-link]").addEventListener("click", async () => {
    await navigator.clipboard.writeText(manageUrl);
    const btn = document.querySelector("[data-copy-link]");
    btn.textContent = t("common.copied");
    setTimeout(() => { btn.textContent = t("common.copy"); }, 1500);
  });
}

init();
