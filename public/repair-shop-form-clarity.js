(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (!(path === ROOT || path.startsWith(`${ROOT}/`))) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const copy = {
    en: {
      optional: "optional",
      registerTitle: "What happens after registration?",
      registerBody: "Your Hermes account is created first. Then you open the Shop Dashboard, add your shop details and services, set booking hours, and receive the public booking link. Registration does not activate a paid plan or approve a partner relationship.",
      emailHelp: "Use the business email you want to use for future Hermes sign-in.",
      passwordHelp: "Use at least 8 characters. You will use this password to sign in to the same Hermes account.",
    },
    ru: {
      optional: "необязательно",
      registerTitle: "Что произойдёт после регистрации?",
      registerBody: "Сначала будет создан единый аккаунт Hermes. Затем вы откроете кабинет СТО, добавите данные и услуги, настроите часы записи и получите публичную ссылку для клиентов. Регистрация сама по себе не подключает платный тариф и не означает одобрения партнёрства.",
      emailHelp: "Укажите рабочую почту, которую хотите использовать для дальнейшего входа в Hermes.",
      passwordHelp: "Минимум 8 символов. Этот пароль будет использоваться для входа в тот же аккаунт Hermes.",
    },
    uk: {
      optional: "необов’язково",
      registerTitle: "Що відбудеться після реєстрації?",
      registerBody: "Спочатку буде створено єдиний акаунт Hermes. Далі ви відкриєте кабінет СТО, додасте дані й послуги, налаштуєте години запису та отримаєте публічне посилання для клієнтів. Реєстрація сама по собі не активує платний тариф і не означає схвалення партнерства.",
      emailHelp: "Вкажіть робочу пошту, яку хочете використовувати для подальшого входу в Hermes.",
      passwordHelp: "Мінімум 8 символів. Цей пароль використовуватиметься для входу в той самий акаунт Hermes.",
    },
    es: {
      optional: "opcional",
      registerTitle: "¿Qué ocurre después del registro?",
      registerBody: "Primero se crea tu cuenta Hermes. Después abres el panel del taller, añades los datos y servicios, configuras los horarios y obtienes el enlace público de reservas. El registro no activa por sí solo un plan de pago ni aprueba una relación de socio.",
      emailHelp: "Usa el correo de empresa que quieras utilizar para iniciar sesión en Hermes.",
      passwordHelp: "Usa al menos 8 caracteres. Esta contraseña se utilizará para acceder a la misma cuenta Hermes.",
    },
    it: {
      optional: "opzionale",
      registerTitle: "Cosa succede dopo la registrazione?",
      registerBody: "Prima viene creato il tuo account Hermes. Poi apri il pannello dell’officina, aggiungi dati e servizi, imposti gli orari e ottieni il link pubblico di prenotazione. La registrazione non attiva automaticamente un piano a pagamento né approva una partnership.",
      emailHelp: "Usa l’email aziendale che vuoi utilizzare per i futuri accessi a Hermes.",
      passwordHelp: "Usa almeno 8 caratteri. Questa password servirà per accedere allo stesso account Hermes.",
    },
    fr: {
      optional: "facultatif",
      registerTitle: "Que se passe-t-il après l’inscription ?",
      registerBody: "Votre compte Hermes est d’abord créé. Ensuite, vous ouvrez le tableau de bord de l’atelier, ajoutez les informations et services, définissez les horaires et obtenez le lien public de réservation. L’inscription n’active pas automatiquement un forfait payant et ne vaut pas approbation d’un partenariat.",
      emailHelp: "Utilisez l’adresse professionnelle que vous souhaitez employer pour vos prochaines connexions à Hermes.",
      passwordHelp: "Utilisez au moins 8 caractères. Ce mot de passe servira à vous connecter au même compte Hermes.",
    },
  }[locale];

  const addHelp = (controlId, text) => {
    const control = document.getElementById(controlId);
    if (!(control instanceof HTMLElement)) return;
    const label = control.closest("label, .form-group") || document.querySelector(`label[for="${CSS.escape(controlId)}"]`);
    if (!(label instanceof HTMLElement) || document.querySelector(`[data-hc-help-for="${controlId}"]`)) return;
    const help = document.createElement("small");
    help.className = "hc-form-help";
    help.dataset.hcHelpFor = controlId;
    help.textContent = text;
    control.insertAdjacentElement("afterend", help);
  };

  const resolveLabelControl = (label) => {
    const nested = label.querySelector("input, select, textarea");
    if (nested instanceof HTMLInputElement || nested instanceof HTMLSelectElement || nested instanceof HTMLTextAreaElement) return nested;
    const forId = label.htmlFor?.trim();
    if (!forId) return null;
    const linked = document.getElementById(forId);
    return linked instanceof HTMLInputElement || linked instanceof HTMLSelectElement || linked instanceof HTMLTextAreaElement ? linked : null;
  };

  const markOptionalFields = () => {
    document.querySelectorAll("label").forEach((label) => {
      if (!(label instanceof HTMLLabelElement) || label.dataset.hcOptionalChecked === "true") return;
      label.dataset.hcOptionalChecked = "true";
      const control = resolveLabelControl(label);
      if (!control) return;
      if (control instanceof HTMLInputElement && ["hidden", "checkbox", "radio", "submit", "button"].includes(control.type)) return;
      if (control.required || /optional|необяз|необов|opcional|opzionale|facultatif/i.test(label.textContent || "")) return;
      const marker = document.createElement("span");
      marker.className = "hc-optional-marker";
      marker.textContent = copy.optional;
      if (control.parentElement === label) label.insertBefore(marker, control);
      else label.append(marker);
    });
  };

  const enhanceRegistration = () => {
    if (path !== `${ROOT}/auth`) return;
    const form = document.getElementById("register-form");
    if (!(form instanceof HTMLFormElement)) return;
    addHelp("reg-email", copy.emailHelp);
    addHelp("reg-password", copy.passwordHelp);
    if (form.querySelector("[data-hc-registration-next]")) return;
    const submit = form.querySelector('button[type="submit"]');
    if (!(submit instanceof HTMLButtonElement)) return;
    const note = document.createElement("aside");
    note.className = "hc-registration-next";
    note.dataset.hcRegistrationNext = "true";
    note.innerHTML = `<strong>${copy.registerTitle}</strong><p>${copy.registerBody}</p>`;
    form.insertBefore(note, submit);
  };

  let scheduled = false;
  const apply = () => {
    scheduled = false;
    markOptionalFields();
    enhanceRegistration();
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(apply);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
