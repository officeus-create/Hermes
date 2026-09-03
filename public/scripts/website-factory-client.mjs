const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const loading = $("[data-factory-loading]");
const auth = $("[data-factory-auth]");
const app = $("[data-factory-app]");
const resumeView = $("[data-resume-view]");
const wizardView = $("[data-wizard-view]");
const wizardAlert = $("[data-wizard-alert]");

const steps = [
  "Sources",
  "Business truth",
  "Outcome",
  "Owner brief",
  "References",
  "Pages & capabilities",
  "Brand",
  "Review",
  "Handoff",
];
const pageChoices = ["Home", "Services", "About / Trust", "Work / Portfolio", "FAQ", "Contact"];
const capabilityChoices = [
  { id: "lead-form", label: "Lead form" },
  { id: "click-to-call", label: "Click to call" },
  { id: "booking", label: "Booking" },
  { id: "maps", label: "Maps / directions" },
  { id: "reviews", label: "Reviews / proof" },
  { id: "gallery", label: "Gallery" },
  { id: "multilingual", label: "Multilingual" },
  { id: "analytics", label: "Analytics" },
  { id: "crm-handoff", label: "CRM handoff" },
  { id: "ai-assistant", label: "AI assistant" },
];

let drafts = [];
let draft = null;
let currentStep = 1;
let saveTimer;
let saving = false;

const emptyPayload = () => ({
  starting_from_zero: false,
  sources: [],
  facts: {},
  goals: { primary: "", secondary: [], target_customer: "", geography: "", languages: [], primary_action: "" },
  brief: { text: "", must_have: [], nice_to_have: [], dislikes: [], tone: "", constraints: [], unresolved_questions: [] },
  references: [],
  pages: ["Home", "Services", "About / Trust", "FAQ", "Contact"],
  capabilities: capabilityChoices.map((item) => ({ id: item.id, included: ["lead-form", "click-to-call", "analytics"].includes(item.id) })),
  brand: { logo_url: null, colors: [], notes: "" },
  unresolved_critical: [],
});

const readJson = async (response) => response.json().catch(() => ({}));
const listFromText = (value) => String(value || "").split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
const secureUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : "";
  } catch {
    return "";
  }
};
const showOnly = (node) => {
  [loading, auth, app].forEach((item) => item?.classList.add("hidden"));
  node?.classList.remove("hidden");
};
const setSaveState = (text) => {
  const node = $("[data-save-state]");
  if (node) node.textContent = text;
};
const clearAlert = () => {
  if (!wizardAlert) return;
  wizardAlert.textContent = "";
  wizardAlert.className = "factory-alert hidden";
};
const setAlert = (message, kind = "error") => {
  if (!wizardAlert) return;
  wizardAlert.textContent = message;
  wizardAlert.className = `factory-alert ${kind}`;
};

function selectAuth(mode) {
  $$('[data-auth-tab]').forEach((button) => button.classList.toggle("active", button.dataset.authTab === mode));
  $$('[data-auth-form]').forEach((form) => form.classList.toggle("active", form.dataset.authForm === mode));
}

$$('[data-auth-tab]').forEach((button) => {
  button.addEventListener("click", () => selectAuth(button.dataset.authTab || "login"));
});

$$('[data-auth-form]').forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const mode = form.dataset.authForm || "login";
    const button = form.querySelector('button[type="submit"]');
    const alertNode = $("[data-auth-alert]");
    if (button) button.disabled = true;
    alertNode?.classList.add("hidden");
    try {
      const values = new FormData(form);
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = { email: values.get("email"), password: values.get("password") };
      if (mode === "register") {
        Object.assign(payload, {
          name: values.get("name"),
          location: values.get("location"),
          role: "Hermes Member",
          bio: "Hermes account for private Website Factory briefs and authorized Hermes workspaces.",
        });
      }
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || (Array.isArray(data.errors) ? data.errors.join(", ") : "Authentication failed"));
      }
      window.location.reload();
    } catch (error) {
      if (alertNode) {
        alertNode.textContent = error instanceof Error ? error.message : "Authentication failed";
        alertNode.classList.remove("hidden");
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
});

function renderDrafts() {
  const list = $("[data-draft-list]");
  if (!list) return;
  list.replaceChildren();
  if (!drafts.length) {
    const empty = document.createElement("div");
    empty.className = "factory-empty";
    const strong = document.createElement("strong");
    strong.textContent = "No website briefs yet.";
    const span = document.createElement("span");
    span.textContent = "Start with one public source — or choose starting from zero.";
    empty.append(strong, span);
    list.append(empty);
    return;
  }

  for (const item of drafts) {
    const card = document.createElement("article");
    card.className = "draft-card";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const meta = document.createElement("span");
    meta.textContent = `${String(item.state || "draft").replaceAll("_", " ")} · Step ${item.current_step} · ${new Date(item.updated_at).toLocaleString()}`;
    copy.append(title, meta);

    const actions = document.createElement("div");
    const open = document.createElement("button");
    open.type = "button";
    open.className = "factory-secondary";
    open.textContent = item.state === "submitted" ? "View brief" : "Resume";
    open.addEventListener("click", () => openDraft(item));
    actions.append(open);

    if (item.state !== "submitted") {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "factory-icon-button";
      remove.setAttribute("aria-label", `Delete ${item.title}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => void deleteDraft(item));
      actions.append(remove);
    }
    card.append(copy, actions);
    list.append(card);
  }
}

async function loadDrafts() {
  const response = await fetch("/api/website-factory/drafts", { credentials: "same-origin", headers: { Accept: "application/json" } });
  const data = await readJson(response);
  if (response.status === 401) return false;
  if (!response.ok || !data.success) throw new Error(data.error || "Could not load Website Factory drafts");
  drafts = Array.isArray(data.drafts) ? data.drafts : [];
  renderDrafts();
  return true;
}

async function createDraft() {
  const response = await fetch("/api/website-factory/drafts", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ title: "New website brief", starting_from_zero: false }),
  });
  const data = await readJson(response);
  if (!response.ok || !data.success) throw new Error(data.error || "Could not create draft");
  drafts.unshift(data.draft);
  openDraft(data.draft);
}

async function deleteDraft(item) {
  if (!window.confirm(`Delete ${item.title}?`)) return;
  const response = await fetch(`/api/website-factory/drafts/${encodeURIComponent(item.id)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const data = await readJson(response);
  if (!response.ok || !data.success) return setAlert(data.error || "Could not delete draft");
  drafts = drafts.filter((candidate) => candidate.id !== item.id);
  renderDrafts();
}

function buildChoices() {
  const pages = $("[data-pages]");
  if (pages && !pages.children.length) {
    pageChoices.forEach((label) => {
      const row = document.createElement("label");
      row.className = "choice-card";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = label;
      input.dataset.pageChoice = label;
      const span = document.createElement("span");
      span.textContent = label;
      row.append(input, span);
      pages.append(row);
    });
  }
  const capabilities = $("[data-capabilities]");
  if (capabilities && !capabilities.children.length) {
    capabilityChoices.forEach((item) => {
      const row = document.createElement("label");
      row.className = "choice-card";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = item.id;
      input.dataset.capabilityChoice = item.id;
      const span = document.createElement("span");
      span.textContent = item.label;
      row.append(input, span);
      capabilities.append(row);
    });
  }
}

function renderSources() {
  const list = $("[data-source-list]");
  if (!list || !draft) return;
  list.replaceChildren();
  const sources = Array.isArray(draft.payload?.sources) ? draft.payload.sources : [];
  for (const source of sources) {
    const card = document.createElement("article");
    card.className = "source-card";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = source.type || "website";
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.url;
    copy.append(strong, link);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "factory-icon-button";
    remove.setAttribute("aria-label", `Remove ${source.url}`);
    remove.textContent = "×";
    remove.disabled = draft.state === "submitted";
    remove.addEventListener("click", () => {
      draft.payload.sources = sources.filter((candidate) => candidate.url !== source.url);
      renderSources();
      queueSave();
    });
    card.append(copy, remove);
    list.append(card);
  }
}

function setValue(selector, value) {
  const node = $(selector);
  if (node) node.value = value ?? "";
}
function setChecked(selector, value) {
  const node = $(selector);
  if (node) node.checked = Boolean(value);
}

function hydrateForm() {
  if (!draft) return;
  buildChoices();
  const payload = draft.payload && typeof draft.payload === "object" ? draft.payload : emptyPayload();
  draft.payload = { ...emptyPayload(), ...payload };
  setChecked("[data-start-zero]", payload.starting_from_zero);
  $$('[data-fact]').forEach((node) => { node.value = payload.facts?.[node.dataset.fact] ?? ""; });
  setValue("[data-services]", Array.isArray(payload.facts?.services) ? payload.facts.services.join("\n") : "");
  setValue("[data-goal-primary]", payload.goals?.primary);
  setValue("[data-goal-action]", payload.goals?.primary_action);
  setValue("[data-goal-customer]", payload.goals?.target_customer);
  setValue("[data-goal-geography]", payload.goals?.geography);
  setValue("[data-goal-languages]", Array.isArray(payload.goals?.languages) ? payload.goals.languages.join(", ") : "");
  setValue("[data-brief-text]", payload.brief?.text);
  setValue("[data-brief-tone]", payload.brief?.tone);
  setValue("[data-brief-constraints]", Array.isArray(payload.brief?.constraints) ? payload.brief.constraints.join("\n") : "");
  for (const role of ["visual", "functionality", "structure"]) {
    const reference = (payload.references || []).find((item) => item.role === role);
    setValue(`[data-ref-url="${role}"]`, reference?.url || "");
    setValue(`[data-ref-note="${role}"]`, reference?.note || "");
  }
  setValue("[data-brand-logo]", payload.brand?.logo_url || "");
  setValue("[data-brand-colors]", Array.isArray(payload.brand?.colors) ? payload.brand.colors.join(", ") : "");
  setValue("[data-brand-notes]", payload.brand?.notes || "");
  setValue("[data-draft-title]", draft.title);
  $$('[data-page-choice]').forEach((input) => { input.checked = (payload.pages || []).includes(input.value); });
  $$('[data-capability-choice]').forEach((input) => {
    input.checked = Boolean((payload.capabilities || []).find((item) => item.id === input.value)?.included);
  });
  renderSources();
  setSubmittedState(draft.state === "submitted");
}

function collectPayload() {
  const previous = draft?.payload || emptyPayload();
  const facts = {};
  $$('[data-fact]').forEach((node) => { facts[node.dataset.fact] = node.value; });
  facts.services = listFromText($("[data-services]")?.value || "");
  const references = ["visual", "functionality", "structure"].flatMap((role) => {
    const url = secureUrl($(`[data-ref-url="${role}"]`)?.value || "");
    if (!url) return [];
    return [{ role, url, principles: [], note: $(`[data-ref-note="${role}"]`)?.value || "" }];
  });
  const logoValue = $("[data-brand-logo]")?.value || "";
  return {
    starting_from_zero: Boolean($("[data-start-zero]")?.checked),
    sources: Array.isArray(previous.sources) ? previous.sources : [],
    facts,
    goals: {
      primary: $("[data-goal-primary]")?.value || "",
      secondary: [],
      target_customer: $("[data-goal-customer]")?.value || "",
      geography: $("[data-goal-geography]")?.value || "",
      languages: listFromText($("[data-goal-languages]")?.value || ""),
      primary_action: $("[data-goal-action]")?.value || "",
    },
    brief: {
      text: $("[data-brief-text]")?.value || "",
      must_have: Array.isArray(previous.brief?.must_have) ? previous.brief.must_have : [],
      nice_to_have: Array.isArray(previous.brief?.nice_to_have) ? previous.brief.nice_to_have : [],
      dislikes: Array.isArray(previous.brief?.dislikes) ? previous.brief.dislikes : [],
      tone: $("[data-brief-tone]")?.value || "",
      constraints: listFromText($("[data-brief-constraints]")?.value || ""),
      unresolved_questions: Array.isArray(previous.brief?.unresolved_questions) ? previous.brief.unresolved_questions : [],
    },
    references,
    pages: $$('[data-page-choice]:checked').map((input) => input.value),
    capabilities: capabilityChoices.map((item) => ({ id: item.id, included: Boolean($(`[data-capability-choice="${item.id}"]`)?.checked) })),
    brand: {
      logo_url: logoValue ? secureUrl(logoValue) || null : null,
      colors: listFromText($("[data-brand-colors]")?.value || ""),
      notes: $("[data-brand-notes]")?.value || "",
    },
    unresolved_critical: Array.isArray(previous.unresolved_critical) ? previous.unresolved_critical : [],
  };
}

function readiness(payload) {
  const reasons = [];
  if (!payload.starting_from_zero && !payload.sources?.length) reasons.push("Add a source or choose starting from zero");
  if (!payload.goals?.primary) reasons.push("Choose a primary goal");
  if (!payload.brief?.text || payload.brief.text.length < 10) reasons.push("Add a meaningful owner brief");
  for (const role of ["visual", "functionality", "structure"]) {
    if (!payload.references?.some((item) => item.role === role)) reasons.push(`Add the ${role} reference`);
  }
  if (payload.unresolved_critical?.length) reasons.push("Resolve critical conflicting facts");
  return reasons;
}

function renderReview() {
  if (!draft) return;
  draft.payload = collectPayload();
  const payload = draft.payload;
  const review = $("[data-review]");
  if (review) {
    review.replaceChildren();
    const sections = [
      ["Business truth", `${payload.facts?.business_name || "Not named"} · ${payload.facts?.category || "Category not set"} · ${(payload.facts?.services || []).length} services`],
      ["Market & goal", `${payload.goals?.primary || "Primary goal missing"} · ${payload.goals?.geography || "Geography not set"}`],
      ["Owner brief", payload.brief?.text || "Brief missing"],
      ["References", `${(payload.references || []).length} of 3 roles supplied`],
      ["Pages", (payload.pages || []).join(", ") || "No pages selected"],
      ["Capabilities", (payload.capabilities || []).filter((item) => item.included).map((item) => item.id).join(", ") || "None selected"],
      ["Brand", payload.brand?.notes || payload.brand?.logo_url || "No brand direction supplied"],
    ];
    for (const [title, body] of sections) {
      const card = document.createElement("article");
      const strong = document.createElement("strong");
      strong.textContent = title;
      const span = document.createElement("span");
      span.textContent = String(body);
      card.append(strong, span);
      review.append(card);
    }
  }
  const reasons = readiness(payload);
  const state = $("[data-readiness]");
  if (state) {
    state.className = `readiness ${reasons.length ? "needs" : "ready"}`;
    state.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = reasons.length ? "Needs these answers first" : "Ready to create brief";
    const span = document.createElement("span");
    span.textContent = reasons.length ? reasons.join(" · ") : "Required decision inputs are present.";
    state.append(strong, span);
  }
}

function renderHandoff() {
  if (!draft) return;
  const state = $("[data-handoff-state]");
  const submit = $("[data-submit-brief]");
  if (!state || !submit) return;
  state.replaceChildren();
  const strong = document.createElement("strong");
  const span = document.createElement("span");
  if (draft.state === "submitted") {
    strong.textContent = "Website brief created";
    span.textContent = `ID: ${draft.id} · ${draft.submitted_at ? new Date(draft.submitted_at).toLocaleString() : ""} · No automated build started.`;
    submit.disabled = true;
    submit.textContent = "Brief already created";
  } else {
    const reasons = readiness(collectPayload());
    strong.textContent = reasons.length ? `Brief needs ${reasons.length} item${reasons.length === 1 ? "" : "s"}.` : "Ready to create website brief.";
    span.textContent = reasons.length ? reasons.join(" · ") : "This creates the handoff record only.";
    submit.disabled = reasons.length > 0;
  }
  state.append(strong, span);
}

function setSubmittedState(submitted) {
  $$('[data-wizard-view] input, [data-wizard-view] textarea, [data-wizard-view] select').forEach((control) => {
    control.disabled = submitted;
  });
  $("[data-source-form] button")?.toggleAttribute("disabled", submitted);
}

function renderStep() {
  $$('[data-step]').forEach((section) => section.classList.toggle("hidden", Number(section.dataset.step) !== currentStep));
  const name = $("[data-step-name]");
  const count = $("[data-step-count]");
  const bar = $("[data-progress-bar]");
  if (name) name.textContent = steps[currentStep - 1];
  if (count) count.textContent = `Step ${currentStep} of 9`;
  if (bar) bar.style.width = `${(currentStep / 9) * 100}%`;

  const nav = $("[data-step-nav]");
  if (nav) {
    nav.replaceChildren();
    steps.forEach((label, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(index + 1);
      button.title = label;
      button.disabled = draft?.state !== "submitted" && index + 1 > Math.max(currentStep, draft?.current_step || 1);
      button.classList.toggle("active", index + 1 === currentStep);
      button.addEventListener("click", async () => {
        await saveNow();
        currentStep = index + 1;
        renderStep();
      });
      nav.append(button);
    });
  }
  const prev = $("[data-prev]");
  const next = $("[data-next]");
  if (prev) prev.disabled = currentStep === 1;
  next?.classList.toggle("hidden", currentStep === 9 || draft?.state === "submitted");
  if (currentStep === 8) renderReview();
  if (currentStep === 9) renderHandoff();
}

function openDraft(item) {
  draft = structuredClone(item);
  if (!draft.payload || typeof draft.payload !== "object") draft.payload = emptyPayload();
  currentStep = draft.state === "submitted" ? 9 : Math.max(1, Math.min(9, draft.current_step || 1));
  resumeView?.classList.add("hidden");
  wizardView?.classList.remove("hidden");
  hydrateForm();
  renderStep();
}

function closeDrafts() {
  window.clearTimeout(saveTimer);
  draft = null;
  wizardView?.classList.add("hidden");
  resumeView?.classList.remove("hidden");
  renderDrafts();
}

async function saveNow() {
  if (!draft || draft.state === "submitted" || saving) return;
  window.clearTimeout(saveTimer);
  saving = true;
  setSaveState("Saving…");
  clearAlert();
  try {
    const title = $("[data-draft-title]")?.value.trim() || draft.title || "Website brief";
    const payload = collectPayload();
    const response = await fetch(`/api/website-factory/drafts/${encodeURIComponent(draft.id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ title, current_step: currentStep, payload }),
    });
    const data = await readJson(response);
    if (!response.ok || !data.success) throw new Error(data.error || "Could not save draft");
    draft = data.draft;
    const index = drafts.findIndex((item) => item.id === draft.id);
    if (index >= 0) drafts[index] = draft;
    setSaveState("Saved");
  } catch (error) {
    setSaveState("Save failed");
    setAlert(error instanceof Error ? error.message : "Could not save draft");
  } finally {
    saving = false;
  }
}

function queueSave() {
  if (!draft || draft.state === "submitted") return;
  window.clearTimeout(saveTimer);
  setSaveState("Unsaved changes");
  saveTimer = window.setTimeout(() => void saveNow(), 500);
}

$("[data-source-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!draft || draft.state === "submitted") return;
  const input = $("[data-source-url]");
  const url = secureUrl(input?.value || "");
  if (!url) return setAlert("Use a public HTTPS URL without embedded credentials.");
  const sources = Array.isArray(draft.payload.sources) ? draft.payload.sources : [];
  if (!sources.some((item) => item.url === url)) sources.push({ url, type: "website", note: "", status: "saved" });
  draft.payload.sources = sources;
  if (input) input.value = "";
  renderSources();
  queueSave();
});

$("[data-next]")?.addEventListener("click", async () => {
  await saveNow();
  if (currentStep < 9) {
    currentStep += 1;
    if (draft) draft.current_step = Math.max(draft.current_step || 1, currentStep);
    renderStep();
  }
});
$("[data-prev]")?.addEventListener("click", async () => {
  await saveNow();
  if (currentStep > 1) {
    currentStep -= 1;
    renderStep();
  }
});
$("[data-back-drafts]")?.addEventListener("click", async () => {
  await saveNow();
  await loadDrafts();
  closeDrafts();
});
$("[data-new-draft]")?.addEventListener("click", () => void createDraft().catch((error) => setAlert(error instanceof Error ? error.message : "Could not create draft")));
$("[data-submit-brief]")?.addEventListener("click", async () => {
  if (!draft) return;
  await saveNow();
  const response = await fetch(`/api/website-factory/drafts/${encodeURIComponent(draft.id)}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ action: "submit" }),
  });
  const data = await readJson(response);
  if (!response.ok || !data.success) return setAlert(data.reasons?.join(" · ") || data.error || "Brief is not ready");
  draft = data.draft;
  clearAlert();
  setSubmittedState(true);
  renderHandoff();
  setSaveState("Brief created");
});
$("[data-logout]")?.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
  window.location.reload();
});

$("[data-wizard-view]")?.addEventListener("input", (event) => {
  if (event.target?.matches?.("[data-source-url]")) return;
  queueSave();
});
$("[data-wizard-view]")?.addEventListener("change", () => queueSave());

async function initialize() {
  showOnly(loading);
  try {
    const loggedIn = await loadDrafts();
    if (!loggedIn) {
      showOnly(auth);
      return;
    }
    showOnly(app);
    resumeView?.classList.remove("hidden");
    wizardView?.classList.add("hidden");
  } catch (error) {
    showOnly(auth);
    const alertNode = $("[data-auth-alert]");
    if (alertNode) {
      alertNode.textContent = error instanceof Error ? error.message : "Website Factory unavailable";
      alertNode.classList.remove("hidden");
    }
  }
}

buildChoices();
void initialize();
