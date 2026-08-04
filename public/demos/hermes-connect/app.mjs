import {
  categoryCatalog,
  createEarlyAccessRequest,
  getCategory,
  getPlatform,
  platformCatalog,
} from "./profile-workspace.mjs";

const categoryGrid = document.querySelector("[data-category-grid]");
const platformGrid = document.querySelector("[data-platform-grid]");
const categorySelect = document.querySelector("[data-category-select]");
const platformSelect = document.querySelector("[data-platform-select]");
const selectedSummary = document.querySelector("[data-selected-summary]");
const form = document.querySelector("[data-application-form]");
const formAlert = document.querySelector("[data-form-alert]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = form?.querySelector('button[type="submit"]');
const submitLabel = document.querySelector("[data-submit-label]");
const applicationResult = document.querySelector("[data-application-result]");
const fallbackResult = document.querySelector("[data-fallback-result]");
const fallbackEmail = document.querySelector("[data-fallback-email]");

const state = {
  categoryId: "professional-services",
  platformId: "web",
  applicationStarted: false,
};

function pushPublicEvent(event, dimensions = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_group: "hermes_connect_early_access",
    page_path: window.location.pathname,
    ...dimensions,
  });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderCategoryCards() {
  if (!categoryGrid) return;
  const fragment = document.createDocumentFragment();
  for (const category of categoryCatalog) {
    const button = element("button", "category-card");
    button.type = "button";
    button.dataset.categoryId = category.id;
    button.setAttribute("aria-pressed", String(category.id === state.categoryId));
    button.style.setProperty("--card-accent", category.accent);

    const top = element("div", "category-card-top");
    top.append(element("span", "category-icon", category.icon), element("span", "", category.label));
    const heading = element("h3", "", category.name);
    const copy = element("p", "", category.headline);
    const action = element("strong", "", "Use this category →");
    button.append(top, heading, copy, action);
    button.addEventListener("click", () => selectCategory(category.id, true));
    fragment.append(button);
  }
  categoryGrid.replaceChildren(fragment);
}

function renderPlatformCards() {
  if (!platformGrid) return;
  const deviceLabels = { web: "WEB", iphone: "iOS", android: "AND" };
  const fragment = document.createDocumentFragment();
  for (const platform of platformCatalog) {
    const article = element("article", "platform-card");
    article.dataset.platformCard = platform.id;
    const device = element("div", "platform-device", deviceLabels[platform.id] || platform.name.slice(0, 3).toUpperCase());
    const status = element("span", "", platform.status);
    const heading = element("h3", "", platform.name);
    const copy = element("p", "", platform.description);
    const button = element("button", "", platform.id === "web" ? "Request web access →" : `Join ${platform.name} list →`);
    button.type = "button";
    button.dataset.platformIntent = platform.id;
    button.addEventListener("click", () => selectPlatform(platform.id, true));
    article.append(device, status, heading, copy, button);
    fragment.append(article);
  }
  platformGrid.replaceChildren(fragment);
}

function populateSelects() {
  if (categorySelect) {
    categorySelect.replaceChildren(...categoryCatalog.map((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = `${category.name} — ${category.label}`;
      return option;
    }));
    categorySelect.value = state.categoryId;
  }
  if (platformSelect) {
    platformSelect.replaceChildren(...platformCatalog.map((platform) => {
      const option = document.createElement("option");
      option.value = platform.id;
      option.textContent = `${platform.name} — ${platform.status}`;
      return option;
    }));
    platformSelect.value = state.platformId;
  }
}

function updatePreview(category) {
  const preview = document.querySelector(".product-main");
  const icon = document.querySelector("[data-preview-icon]");
  const role = document.querySelector("[data-preview-role]");
  const name = document.querySelector("[data-preview-name]");
  const headline = document.querySelector("[data-preview-headline]");
  const services = document.querySelector("[data-preview-services]");
  if (preview) preview.style.setProperty("--preview-accent", category.accent);
  if (icon) icon.textContent = category.icon;
  if (role) role.textContent = category.previewRole;
  if (name) name.textContent = category.previewName;
  if (headline) headline.textContent = category.headline;
  if (services) {
    services.replaceChildren(...category.previewServices.map((service, index) => {
      const article = document.createElement("article");
      const number = element("span", "", String(index + 1).padStart(2, "0"));
      const serviceName = element("strong", "", service);
      const duration = element("small", "", index === 1 ? "60 min" : index === 2 ? "30 min" : "45 min");
      article.append(number, serviceName, duration);
      return article;
    }));
  }
}

function updateSummary() {
  if (!selectedSummary) return;
  const category = getCategory(state.categoryId);
  const platform = getPlatform(state.platformId);
  const strong = selectedSummary.querySelector("strong");
  if (strong && category && platform) strong.textContent = `${category.name} · ${platform.name}`;
}

function selectCategory(categoryId, moveToForm = false) {
  const category = getCategory(categoryId);
  if (!category) return;
  state.categoryId = category.id;
  document.querySelectorAll("[data-category-id]").forEach((card) => {
    card.setAttribute("aria-pressed", String(card.dataset.categoryId === category.id));
  });
  if (categorySelect) categorySelect.value = category.id;
  updatePreview(category);
  updateSummary();
  pushPublicEvent("connect_category_selected", { category_id: category.id });
  if (moveToForm) document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectPlatform(platformId, moveToForm = false) {
  const platform = getPlatform(platformId);
  if (!platform) return;
  state.platformId = platform.id;
  if (platformSelect) platformSelect.value = platform.id;
  updateSummary();
  pushPublicEvent("connect_download_intent", { platform_id: platform.id, category_id: state.categoryId });
  if (moveToForm) document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAlert(message = "") {
  if (!formAlert) return;
  formAlert.textContent = message;
  formAlert.hidden = !message;
}

function setSubmitting(submitting) {
  if (submitButton) {
    submitButton.disabled = submitting;
    submitButton.setAttribute("aria-busy", String(submitting));
  }
  if (submitLabel) submitLabel.textContent = submitting ? "Sending application…" : "Submit early-access application";
}

function validationMessage(error) {
  const keys = Array.isArray(error?.validationErrors) ? error.validationErrors : [];
  if (keys.includes("automated_submission_rejected")) return "The application could not be accepted.";
  if (keys.includes("name_required")) return "Enter your name.";
  if (keys.includes("email_required")) return "Enter a valid work email.";
  if (keys.includes("category_required")) return "Choose a business category.";
  if (keys.includes("platform_required")) return "Choose Web, iPhone or Android.";
  if (keys.includes("role_required")) return "Tell us your role in the business.";
  if (keys.includes("feature_required")) return "Describe the feature or workflow you must have.";
  if (keys.includes("consent_required")) return "Confirm that Hermes may review and respond to this request.";
  return "Review the required fields and try again.";
}

function preparedEmail(request) {
  const subject = encodeURIComponent(`Hermes Connect early access — ${request.public_dimensions.category_id} — ${request.public_dimensions.platform_id}`);
  const body = encodeURIComponent([
    request.message,
    "",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Request ID: ${request.request_id}`,
  ].join("\n"));
  return `mailto:officeus@hermeslogisticsus.com?subject=${subject}&body=${body}`;
}

renderCategoryCards();
renderPlatformCards();
populateSelects();
selectCategory(state.categoryId);
selectPlatform(state.platformId);

categorySelect?.addEventListener("change", () => selectCategory(categorySelect.value));
platformSelect?.addEventListener("change", () => selectPlatform(platformSelect.value));

document.querySelectorAll("[data-platform-intent]").forEach((button) => {
  button.addEventListener("click", () => selectPlatform(button.dataset.platformIntent || "web"));
});

form?.addEventListener("focusin", (event) => {
  if (!event.isTrusted || state.applicationStarted) return;
  state.applicationStarted = true;
  pushPublicEvent("connect_application_start", { category_id: state.categoryId, platform_id: state.platformId });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAlert();
  if (applicationResult) applicationResult.hidden = true;
  if (fallbackResult) fallbackResult.hidden = true;

  const data = new FormData(form);
  let request;
  try {
    request = createEarlyAccessRequest({
      name: data.get("name"),
      email: data.get("email"),
      businessName: data.get("business_name"),
      role: data.get("role"),
      categoryId: data.get("category_id"),
      platformId: data.get("platform_id"),
      teamSize: data.get("team_size"),
      currentMethod: data.get("current_method"),
      mustHave: data.get("must_have"),
      website: data.get("website"),
      consent: data.get("consent") === "on",
    });
  } catch (error) {
    setAlert(validationMessage(error));
    formStatus.textContent = "Application not sent.";
    return;
  }

  setSubmitting(true);
  formStatus.textContent = "Sending the application securely…";
  if (fallbackEmail) fallbackEmail.href = preparedEmail(request);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://hermeslogisticsus.com/api/logistics-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": request.request_id,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) throw new Error("delivery_not_confirmed");

    if (applicationResult) applicationResult.hidden = false;
    formStatus.textContent = "Application delivery confirmed.";
    pushPublicEvent("connect_application_delivery_confirmed", {
      category_id: request.public_dimensions.category_id,
      platform_id: request.public_dimensions.platform_id,
    });
  } catch {
    if (fallbackResult) fallbackResult.hidden = false;
    formStatus.textContent = "Secure delivery was not confirmed. Use the prepared email fallback.";
    pushPublicEvent("connect_application_delivery_failed", {
      category_id: request.public_dimensions.category_id,
      platform_id: request.public_dimensions.platform_id,
    });
  } finally {
    window.clearTimeout(timeout);
    setSubmitting(false);
  }
});
