import { availabilityCatalog } from "./catalog.mjs";
import { contactMethods } from "./contact-methods.mjs";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

const authGate = document.querySelector("[data-auth-gate]");
const appRoot = document.querySelector("[data-app]");
const loginForm = document.querySelector("[data-login-form]");
const registerForm = document.querySelector("[data-register-form]");
const loginStatus = document.querySelector("[data-login-status]");
const registerStatus = document.querySelector("[data-register-status]");
const profileForm = document.querySelector("[data-profile-form]");
const profileStatus = document.querySelector("[data-status]");
const bookingStatus = document.querySelector("[data-booking-status]");
const servicesRoot = document.querySelector("[data-services]");
const availabilityRoot = document.querySelector("[data-availability]");
const previewServicesRoot = document.querySelector("[data-preview-services]");
const previewTimesRoot = document.querySelector("[data-preview-times]");
const bookingsListRoot = document.querySelector("[data-bookings-list]");
const createBookingButton = document.querySelector("[data-create-booking]");
const analyticsRoot = document.querySelector("[data-analytics]");
const clientsListRoot = document.querySelector("[data-clients-list]");
const telegramLoginStatus = document.querySelector("[data-telegram-login-status]");
const staffListRoot = document.querySelector("[data-staff-list]");
const addStaffForm = document.querySelector("[data-add-staff-form]");
const addStaffServicesRoot = document.querySelector("[data-add-staff-services]");
const addStaffAvailabilityRoot = document.querySelector("[data-add-staff-availability]");
const addStaffStatus = document.querySelector("[data-add-staff-status]");
const newServiceNameInput = document.querySelector("[data-new-service-name]");
const newServiceDurationInput = document.querySelector("[data-new-service-duration]");
const addServiceButton = document.querySelector("[data-add-service-button]");
const addServiceStatus = document.querySelector("[data-add-service-status]");

let selectedServiceId = null;
let selectedSlot = null;
let loadedServiceCatalog = [];
let currentProfile = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function choice(item, type, checked) {
  const label = document.createElement("label");
  label.className = "choice";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = type;
  input.value = typeof item === "string" ? item : item.id;
  input.checked = checked;
  const span = document.createElement("span");
  span.textContent = typeof item === "string" ? item : `${item.name} · ${item.durationMinutes} min`;
  label.append(input, span);
  return label;
}

function renderEditorChoices(profile) {
  servicesRoot.innerHTML = "";
  availabilityRoot.innerHTML = "";
  const serviceIds = (profile.services || []).map((service) => service.id);
  loadedServiceCatalog.forEach((service) => servicesRoot.append(choice(service, "serviceIds", serviceIds.includes(service.id))));
  availabilityCatalog.forEach((slot) => availabilityRoot.append(choice(slot, "availability", (profile.availability || []).includes(slot))));
}

async function loadServiceCatalog() {
  const { ok, body } = await api("/api/services");
  if (ok) loadedServiceCatalog = body.services || [];
}

function updateBookingButtonState() {
  createBookingButton.disabled = !(selectedServiceId && selectedSlot);
}

function renderProfileCard(profile) {
  document.querySelector("[data-preview-name]").textContent = profile.name;
  document.querySelector("[data-preview-role]").textContent = profile.role;
  document.querySelector("[data-preview-location]").textContent = profile.location;
  document.querySelector("[data-preview-bio]").textContent = profile.bio;
  document.querySelector("[data-preview-avatar]").textContent = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const publicLinkInput = document.querySelector("[data-public-link]");
  publicLinkInput.value = new URL(`/book/?specialist=${profile.id}`, window.location.origin).toString();
  const meetingLinkInput = document.querySelector("[data-meeting-link]");
  meetingLinkInput.value = new URL(`/meet/?specialist=${profile.id}`, window.location.origin).toString();

  selectedServiceId = null;
  selectedSlot = null;
  updateBookingButtonState();

  previewServicesRoot.innerHTML = "";
  (profile.services || []).forEach((service) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.serviceOption = service.id;
    button.innerHTML = `${service.name}<small>${service.durationMinutes} min</small>`;
    button.addEventListener("click", () => {
      selectedServiceId = service.id;
      [...previewServicesRoot.children].forEach((child) => child.removeAttribute("data-selected"));
      button.dataset.selected = "true";
      updateBookingButtonState();
    });
    previewServicesRoot.append(button);
  });

  previewTimesRoot.innerHTML = "";
  (profile.availability || []).forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.timeOption = slot;
    button.textContent = slot;
    button.addEventListener("click", () => {
      selectedSlot = slot;
      [...previewTimesRoot.children].forEach((child) => child.removeAttribute("data-selected"));
      button.dataset.selected = "true";
      updateBookingButtonState();
    });
    previewTimesRoot.append(button);
  });
}

async function respondToMeeting(bookingId, action, meetingLink) {
  return api(`/api/booking/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
    body: JSON.stringify(meetingLink ? { action, meetingLink } : { action }),
  });
}

function renderBookings(bookings) {
  bookingsListRoot.innerHTML = "";
  bookings.forEach((booking) => {
    const row = document.createElement("div");
    row.className = "booking-row";
    const contactLabel = contactMethods.find((method) => method.id === booking.contactMethod)?.label;
    const contactPart = contactLabel && booking.contactHandle ? ` · ${contactLabel}: ${booking.contactHandle}` : "";
    const isMeeting = booking.bookingType === "meeting";
    const label = isMeeting ? `Personal meeting (${booking.clientName})` : booking.serviceName;
    const topicPart = isMeeting && booking.meetingTopic ? ` · "${booking.meetingTopic}"` : "";
    const staffPart = booking.staffName ? ` · with ${booking.staffName}` : "";
    const summary = document.createElement("div");
    summary.textContent = `${label} · ${booking.slot} · ${booking.status}${contactPart}${topicPart}${staffPart}`;
    row.append(summary);

    if (isMeeting && booking.status === "pending_approval") {
      const actions = document.createElement("div");
      actions.className = "booking-row-actions";
      const linkInput = document.createElement("input");
      linkInput.type = "text";
      linkInput.placeholder = "Meeting link (optional, add now or later)";
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.textContent = "Confirm";
      confirmBtn.addEventListener("click", async () => {
        confirmBtn.disabled = true;
        const { ok } = await respondToMeeting(booking.id, "confirm", linkInput.value.trim());
        if (ok) await loadBookings(); else confirmBtn.disabled = false;
      });
      const declineBtn = document.createElement("button");
      declineBtn.type = "button";
      declineBtn.textContent = "Decline";
      declineBtn.addEventListener("click", async () => {
        if (!window.confirm("Decline this meeting request?")) return;
        declineBtn.disabled = true;
        const { ok } = await respondToMeeting(booking.id, "decline");
        if (ok) await loadBookings(); else declineBtn.disabled = false;
      });
      actions.append(linkInput, confirmBtn, declineBtn);
      row.append(actions);
    } else if (isMeeting && booking.status === "confirmed" && !booking.meetingLink) {
      const actions = document.createElement("div");
      actions.className = "booking-row-actions";
      const linkInput = document.createElement("input");
      linkInput.type = "text";
      linkInput.placeholder = "Add the meeting link (Meet/Zoom/whatever)";
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.textContent = "Save link";
      saveBtn.addEventListener("click", async () => {
        if (!linkInput.value.trim()) return;
        saveBtn.disabled = true;
        const { ok } = await respondToMeeting(booking.id, "confirm", linkInput.value.trim());
        if (ok) await loadBookings(); else saveBtn.disabled = false;
      });
      actions.append(linkInput, saveBtn);
      row.append(actions);
    } else if (isMeeting && booking.meetingLink) {
      const linkLine = document.createElement("div");
      linkLine.className = "booking-row-meta";
      linkLine.textContent = `Meeting link: ${booking.meetingLink}`;
      row.append(linkLine);
    }

    bookingsListRoot.append(row);
  });
}

function renderAnalytics(a) {
  analyticsRoot.innerHTML = "";
  if (!a.totalBookings) return;

  const tile = (value, label) => {
    const div = document.createElement("div");
    div.className = "analytics-tile";
    div.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    return div;
  };

  analyticsRoot.append(
    tile(a.totalBookings, "Total bookings"),
    tile(a.confirmed, "Confirmed"),
    tile(a.cancelled, "Cancelled"),
    tile(a.pendingApproval, "Pending"),
    tile(`${a.repeatRate}%`, "Repeat clients"),
    tile(a.meetingConfirmRate === null ? "—" : `${a.meetingConfirmRate}%`, "Meeting confirm rate"),
  );

  if (a.topServices.length) {
    const box = document.createElement("div");
    box.className = "analytics-top-services";
    box.innerHTML = `<span>Top services</span><ol>${a.topServices.map((s) => `<li>${s.name} · ${s.count}</li>`).join("")}</ol>`;
    analyticsRoot.append(box);
  }
}

async function loadAnalytics() {
  const { ok, body } = await api("/api/analytics");
  if (ok) renderAnalytics(body.analytics);
}

function renderClients(clients) {
  clientsListRoot.innerHTML = "";
  clients.forEach((client) => {
    const card = document.createElement("div");
    card.className = "client-card";
    const contactLabel = contactMethods.find((m) => m.id === client.contactMethod)?.label;
    const contactPart = contactLabel && client.contactHandle ? ` · ${contactLabel}: ${client.contactHandle}` : "";
    const lastVisit = client.lastBookingAt ? new Date(client.lastBookingAt).toLocaleDateString() : "—";
    card.innerHTML = `
      <div class="client-card-head"><strong>${client.name || client.email}</strong><span>${client.confirmedBookings}/${client.totalBookings} confirmed</span></div>
      <div class="client-card-meta">${client.email}${contactPart} · last visit ${lastVisit}</div>
    `;
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Private note about this client…";
    textarea.value = client.note || "";
    const actions = document.createElement("div");
    actions.className = "client-card-actions";
    const savedLabel = document.createElement("span");
    savedLabel.hidden = true;
    savedLabel.textContent = "Saved";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "Save note";
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      savedLabel.hidden = true;
      const { ok } = await api(`/api/clients/${encodeURIComponent(client.email)}`, {
        method: "PUT",
        body: JSON.stringify({ note: textarea.value }),
      });
      saveBtn.disabled = false;
      if (ok) {
        savedLabel.hidden = false;
        setTimeout(() => { savedLabel.hidden = true; }, 1500);
      }
    });
    actions.append(savedLabel, saveBtn);
    card.append(textarea, actions);
    clientsListRoot.append(card);
  });
}

async function loadClients() {
  const { ok, body } = await api("/api/clients");
  if (ok) renderClients(body.clients || []);
}

function renderAddStaffChoices() {
  addStaffServicesRoot.innerHTML = "";
  addStaffAvailabilityRoot.innerHTML = "";
  loadedServiceCatalog.forEach((service) => addStaffServicesRoot.append(choice(service, "serviceIds", false)));
  availabilityCatalog.forEach((slot) => addStaffAvailabilityRoot.append(choice(slot, "availability", false)));
}

function renderStaffCard(staffMember) {
  const card = document.createElement("div");
  card.className = "staff-card";

  const head = document.createElement("div");
  head.className = "staff-card-head";
  head.innerHTML = `<h3>${staffMember.name}</h3><span>${staffMember.role}</span>`;
  card.append(head);

  const servicesFieldset = document.createElement("fieldset");
  servicesFieldset.innerHTML = "<legend>Services</legend>";
  const servicesRoot2 = document.createElement("div");
  servicesRoot2.className = "choices";
  const staffServiceIds = (staffMember.services || []).map((s) => s.id);
  loadedServiceCatalog.forEach((service) => servicesRoot2.append(choice(service, `staff-services-${staffMember.id}`, staffServiceIds.includes(service.id))));
  servicesFieldset.append(servicesRoot2);
  card.append(servicesFieldset);

  const availabilityFieldset = document.createElement("fieldset");
  availabilityFieldset.innerHTML = "<legend>Availability</legend>";
  const availabilityRoot2 = document.createElement("div");
  availabilityRoot2.className = "choices";
  availabilityCatalog.forEach((slot) => availabilityRoot2.append(choice(slot, `staff-availability-${staffMember.id}`, (staffMember.availability || []).includes(slot))));
  availabilityFieldset.append(availabilityRoot2);
  card.append(availabilityFieldset);

  const actions = document.createElement("div");
  actions.className = "staff-card-actions";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save changes";
  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    const serviceIds = [...servicesRoot2.querySelectorAll("input:checked")].map((el) => el.value);
    const availability = [...availabilityRoot2.querySelectorAll("input:checked")].map((el) => el.value);
    const { ok } = await api(`/api/staff/${encodeURIComponent(staffMember.id)}`, {
      method: "PUT",
      body: JSON.stringify({ name: staffMember.name, role: staffMember.role, serviceIds, availability }),
    });
    saveBtn.disabled = false;
    if (ok) await loadStaff();
  });
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", async () => {
    if (!window.confirm(`Remove ${staffMember.name} from your team? Their past bookings stay on record.`)) return;
    removeBtn.disabled = true;
    const { ok } = await api(`/api/staff/${encodeURIComponent(staffMember.id)}`, { method: "DELETE" });
    if (ok) await loadStaff(); else removeBtn.disabled = false;
  });
  actions.append(saveBtn, removeBtn);
  card.append(actions);

  return card;
}

function renderStaff(staff) {
  staffListRoot.innerHTML = "";
  staff.forEach((staffMember) => staffListRoot.append(renderStaffCard(staffMember)));
}

async function loadStaff() {
  const { ok, body } = await api("/api/staff");
  if (ok) renderStaff(body.staff || []);
}

async function loadBookings() {
  const { ok, body } = await api("/api/booking");
  if (ok) renderBookings(body.bookings || []);
  await loadAnalytics();
  await loadClients();
}

async function showApp(profile) {
  authGate.hidden = true;
  appRoot.hidden = false;
  profileForm.name.value = profile.name;
  profileForm.role.value = profile.role;
  profileForm.location.value = profile.location;
  profileForm.bio.value = profile.bio;
  currentProfile = profile;
  await loadServiceCatalog();
  renderEditorChoices(profile);
  renderProfileCard(profile);
  renderAddStaffChoices();
  await loadBookings();
  await loadStaff();
}

function showAuthGate() {
  authGate.hidden = false;
  appRoot.hidden = true;
}

async function checkSession() {
  const { ok } = await api("/api/auth/me");
  if (ok) {
    const profileResponse = await api("/api/profile");
    if (profileResponse.ok) {
      await showApp(profileResponse.body.profile);
      return;
    }
  }
  showAuthGate();
}

document.querySelector("[data-show-register]").addEventListener("click", () => {
  loginForm.hidden = true;
  registerForm.hidden = false;
});
document.querySelector("[data-show-login]").addEventListener("click", () => {
  registerForm.hidden = true;
  loginForm.hidden = false;
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  loginStatus.textContent = "Signing in…";
  const { ok, body } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
  });
  if (!ok) {
    loginStatus.textContent = body.error === "invalid_credentials" ? "Incorrect email or password." : "Sign-in failed.";
    return;
  }
  loginStatus.textContent = "";
  await checkSession();
});

window.onTelegramAuth = async (user) => {
  telegramLoginStatus.textContent = "Signing in with Telegram…";
  const { ok } = await api("/api/auth/telegram", { method: "POST", body: JSON.stringify(user) });
  if (!ok) {
    telegramLoginStatus.textContent = "Telegram sign-in failed. Try again or use email.";
    return;
  }
  telegramLoginStatus.textContent = "";
  await checkSession();
};

const TELEGRAM_BOT_ID = 8864417368; // @HermesConnectAppBot
const telegramLoginButton = document.querySelector("[data-telegram-login-button]");
telegramLoginButton?.addEventListener("click", () => {
  if (!window.Telegram?.Login) {
    telegramLoginStatus.textContent = "Telegram login is still loading — try again in a moment.";
    return;
  }
  window.Telegram.Login.auth({ bot_id: TELEGRAM_BOT_ID, request_access: "write" }, (user) => {
    if (!user) {
      telegramLoginStatus.textContent = "Telegram sign-in was cancelled.";
      return;
    }
    window.onTelegramAuth(user);
  });
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  registerStatus.textContent = "Creating account…";
  const { ok, body } = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: data.get("email"),
      password: data.get("password"),
      name: data.get("name"),
      role: data.get("role"),
      location: data.get("location"),
      bio: data.get("bio"),
    }),
  });
  if (!ok) {
    registerStatus.textContent = body.error === "email_already_registered"
      ? "An account with this email already exists."
      : (body.errors || [body.error]).join(", ") || "Registration failed.";
    return;
  }
  registerStatus.textContent = "";
  await checkSession();
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(profileForm);
  profileStatus.textContent = "Saving…";
  const { ok, body } = await api("/api/profile", {
    method: "PUT",
    body: JSON.stringify({
      name: data.get("name"),
      role: data.get("role"),
      location: data.get("location"),
      bio: data.get("bio"),
      serviceIds: data.getAll("serviceIds"),
      availability: data.getAll("availability"),
    }),
  });
  if (!ok) {
    profileStatus.textContent = (body.errors || [body.error]).join(", ") || "Save failed.";
    return;
  }
  profileStatus.textContent = "Saved to your account. Nothing external is sent.";
  currentProfile = body.profile;
  renderProfileCard(body.profile);
});

addServiceButton.addEventListener("click", async () => {
  const name = newServiceNameInput.value.trim();
  const durationMinutes = Number(newServiceDurationInput.value);
  if (!name || !durationMinutes) {
    addServiceStatus.textContent = "Enter a name and a duration in minutes.";
    return;
  }
  addServiceButton.disabled = true;
  addServiceStatus.textContent = "Adding…";
  const { ok, body } = await api("/api/services", {
    method: "POST",
    body: JSON.stringify({ name, durationMinutes }),
  });
  addServiceButton.disabled = false;
  if (!ok) {
    addServiceStatus.textContent = (body.errors || [body.error]).join(", ") || "Could not add service.";
    return;
  }
  addServiceStatus.textContent = "Service added — select it below to use it.";
  newServiceNameInput.value = "";
  newServiceDurationInput.value = "";
  await loadServiceCatalog();
  if (currentProfile) renderEditorChoices(currentProfile);
  renderAddStaffChoices();
  await loadStaff();
});

createBookingButton.addEventListener("click", async () => {
  if (!selectedServiceId || !selectedSlot) return;
  bookingStatus.textContent = "Creating test booking…";
  const { ok, body } = await api("/api/booking", {
    method: "POST",
    body: JSON.stringify({ serviceId: selectedServiceId, slot: selectedSlot }),
  });
  if (!ok) {
    bookingStatus.textContent = body.error || "Could not create test booking.";
    return;
  }
  bookingStatus.textContent = `Test booking created: ${body.booking.service} · ${body.booking.time}. No calendar, payment, or message was sent.`;
  await loadBookings();
});

addStaffForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(addStaffForm);
  addStaffStatus.textContent = "Adding…";
  const { ok, body } = await api("/api/staff", {
    method: "POST",
    body: JSON.stringify({
      name: data.get("name"),
      role: data.get("role"),
      serviceIds: data.getAll("serviceIds"),
      availability: data.getAll("availability"),
    }),
  });
  if (!ok) {
    addStaffStatus.textContent = (body.errors || [body.error]).join(", ") || "Could not add staff member.";
    return;
  }
  addStaffStatus.textContent = "Added to your team.";
  addStaffForm.reset();
  renderAddStaffChoices();
  await loadStaff();
});

document.querySelector("[data-copy-public-link]").addEventListener("click", async (event) => {
  const input = document.querySelector("[data-public-link]");
  await navigator.clipboard.writeText(input.value);
  const button = event.currentTarget;
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = "Copy"; }, 1500);
});

document.querySelector("[data-copy-meeting-link]").addEventListener("click", async (event) => {
  const input = document.querySelector("[data-meeting-link]");
  await navigator.clipboard.writeText(input.value);
  const button = event.currentTarget;
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = "Copy"; }, 1500);
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  loginForm.reset();
  loginStatus.textContent = "";
  showAuthGate();
});

checkSession();
