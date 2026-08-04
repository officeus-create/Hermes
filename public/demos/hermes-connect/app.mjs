import {
  audienceCatalog,
  buildEarlyAccessEmail,
  getAudienceExperience,
} from "./profile-workspace.mjs";

const body = document.body;
const audienceGrid = document.querySelector("[data-audience-grid]");
const categorySelect = document.querySelector("[data-category-select]");
const form = document.querySelector("[data-application-form]");
const formAlert = document.querySelector("[data-form-alert]");
const formStatus = document.querySelector("[data-form-status]");
const submitLabel = document.querySelector("[data-submit-label]");
const result = document.querySelector("[data-application-result]");
const emailApplication = document.querySelector("[data-email-application]");
const resetApplication = document.querySelector("[data-reset-application]");

const text = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
};

function track(event, parameters = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
}

function renderAudienceButtons() {
  for (const item of audienceCatalog) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "audience-button";
    button.dataset.audienceId = item.id;
    button.setAttribute("aria-pressed", String(item.id === audienceCatalog[0].id));
    button.innerHTML = `<span aria-hidden="true">${item.icon}</span><div><strong>${item.label}</strong><small>${item.short}</small></div>`;
    button.addEventListener("click", () => selectAudience(item.id, { trackSelection: true }));
    audienceGrid?.append(button);

    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    categorySelect?.append(option);
  }
}

function renderServices(item) {
  const root = document.querySelector("[data-preview-services]");
  if (!root) return;
  root.replaceChildren(...item.services.map(([name, duration, price]) => {
    const service = document.createElement("div");
    service.className = "mobile-service";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    const small = document.createElement("small");
    const value = document.createElement("span");
    strong.textContent = name;
    small.textContent = duration;
    value.textContent = price;
    copy.append(strong, small);
    service.append(copy, value);
    return service;
  }));
}

function renderAppointments(item) {
  const root = document.querySelector("[data-preview-appointments]");
  if (!root) return;
  root.replaceChildren(...item.appointments.map(([time, service, context, status]) => {
    const row = document.createElement("div");
    row.className = "appointment";
    const timeNode = document.createElement("span");
    timeNode.className = "appointment-time";
    timeNode.textContent = time;
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    const small = document.createElement("span");
    const badge = document.createElement("b");
    strong.textContent = service;
    small.textContent = context;
    badge.textContent = status;
    copy.append(strong, small);
    row.append(timeNode, copy, badge);
    return row;
  }));
}

function renderBenefits(item) {
  const root = document.querySelector("[data-audience-benefits]");
  if (!root) return;
  root.replaceChildren(...item.benefits.map((benefit) => {
    const li = document.createElement("li");
    li.textContent = benefit;
    return li;
  }));
}

function selectAudience(id, options = {}) {
  const item = getAudienceExperience(id);
  body.dataset.audience = item.id;
  for (const button of document.querySelectorAll("[data-audience-id]")) {
    button.setAttribute("aria-pressed", String(button.dataset.audienceId === item.id));
  }
  if (categorySelect) categorySelect.value = item.id;

  text("[data-preview-category]", item.label);
  text("[data-preview-dashboard-title]", item.dashboardTitle);
  text("[data-preview-metric-one]", item.metrics[0]);
  text("[data-preview-metric-two]", item.metrics[1]);
  text("[data-preview-metric-three]", item.metrics[2]);
  text("[data-preview-service-choice]", item.serviceChoice);
  text("[data-preview-initials]", item.initials);
  text("[data-preview-location]", item.location);
  text("[data-preview-business]", item.business);
  text("[data-preview-description]", item.description);
  text("[data-preview-request]", `${item.requestLabel} →`);
  text("[data-preview-floating]", item.floatingRequest);
  text("[data-audience-icon]", item.icon);
  text("[data-audience-title]", item.label);
  text("[data-audience-summary]", item.summary);
  renderServices(item);
  renderAppointments(item);
  renderBenefits(item);

  const audienceCta = document.querySelector("[data-audience-cta]");
  if (audienceCta) audienceCta.innerHTML = `Apply for ${item.label.toLowerCase()} early access <span>→</span>`;

  if (options.trackSelection) {
    track("hermes_connect_audience_selected", { audience: item.id });
  }
}

function setAlert(message = "") {
  if (!formAlert) return;
  formAlert.textContent = message;
  formAlert.hidden = !message;
}

function setSubmitting(submitting) {
  const button = form?.querySelector('button[type="submit"]');
  if (button) button.disabled = submitting;
  if (submitLabel) submitLabel.textContent = submitting ? "Preparing application..." : "Prepare download application";
}

function errorMessage(error) {
  const codes = error?.validationErrors || [];
  if (codes.includes("spam_detected")) return "The application could not be prepared.";
  if (codes.includes("name_required")) return "Please enter your name.";
  if (codes.includes("valid_email_required")) return "Please enter a valid work email.";
  if (codes.includes("category_required")) return "Please choose the closest business category.";
  if (codes.includes("platform_required")) return "Please choose your preferred access format.";
  if (codes.includes("team_size_required")) return "Please choose your current team size.";
  if (codes.includes("goal_too_short")) return "Please describe the first result you need in a little more detail.";
  if (codes.includes("consent_required")) return "Please confirm that Hermes may review and respond to the request.";
  return "Please review the application fields and try again.";
}

renderAudienceButtons();
selectAudience(audienceCatalog[0].id);

document.querySelector("[data-scroll-audiences]")?.addEventListener("click", () => {
  document.querySelector("#audiences")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

categorySelect?.addEventListener("change", () => {
  selectAudience(categorySelect.value, { trackSelection: true });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  setAlert();
  setSubmitting(true);
  const data = new FormData(form);
  try {
    const application = buildEarlyAccessEmail({
      name: data.get("name"),
      email: data.get("email"),
      businessName: data.get("business_name"),
      category: data.get("category"),
      platform: data.get("platform"),
      teamSize: data.get("team_size"),
      primaryGoal: data.get("primary_goal"),
      consent: data.get("consent") === "on",
      website: data.get("website"),
    });

    if (emailApplication) emailApplication.href = application.mailto;
    form.hidden = true;
    if (result) result.hidden = false;
    track("hermes_connect_application_prepared", {
      audience: application.category.id,
      platform: application.normalized.platform,
    });
    if (formStatus) formStatus.textContent = "Application prepared. Confirm it in your email app to send.";
  } catch (error) {
    setAlert(errorMessage(error));
    setSubmitting(false);
  }
});

emailApplication?.addEventListener("click", () => {
  track("hermes_connect_application_email_opened", {
    audience: categorySelect?.value || "unknown",
  });
});

resetApplication?.addEventListener("click", () => {
  if (result) result.hidden = true;
  if (form) form.hidden = false;
  setSubmitting(false);
  setAlert();
  form?.querySelector('input[name="name"]')?.focus();
});
