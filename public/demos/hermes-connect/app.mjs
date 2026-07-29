import {
  availabilityCatalog,
  createProfilePreview,
  defaultDraft,
  serviceCatalog,
} from "./profile-workspace.mjs";

const form = document.querySelector("[data-profile-form]");
const servicesRoot = document.querySelector("[data-services]");
const availabilityRoot = document.querySelector("[data-availability]");
const status = document.querySelector("[data-status]");

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

serviceCatalog.forEach((service) => servicesRoot.append(choice(service, "serviceIds", defaultDraft.serviceIds.includes(service.id))));
availabilityCatalog.forEach((slot) => availabilityRoot.append(choice(slot, "availability", defaultDraft.availability.includes(slot))));

function render(profile) {
  document.querySelector("[data-preview-name]").textContent = profile.name;
  document.querySelector("[data-preview-role]").textContent = profile.role;
  document.querySelector("[data-preview-location]").textContent = profile.location;
  document.querySelector("[data-preview-bio]").textContent = profile.bio;
  document.querySelector("[data-preview-services]").innerHTML = profile.services.map((service) => `<button type="button">${service.name}<small>${service.durationMinutes} min</small></button>`).join("");
  document.querySelector("[data-preview-times]").innerHTML = profile.availability.map((time) => `<button type="button">${time}</button>`).join("");
  document.querySelector("[data-preview-path]").textContent = profile.personalPath;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  try {
    const profile = createProfilePreview({
      name: data.get("name"),
      role: data.get("role"),
      location: data.get("location"),
      bio: data.get("bio"),
      serviceIds: data.getAll("serviceIds"),
      availability: data.getAll("availability"),
    });
    render(profile);
    status.textContent = "Profile preview created locally. Nothing was saved or sent.";
    document.querySelector("[data-profile-preview]").dataset.ready = "true";
  } catch (error) {
    status.textContent = error.message;
  }
});

render(createProfilePreview(defaultDraft));
