(() => {
  const repairShopRoute = "/services/hermes-connect/repair-shops";
  if (window.location.pathname.replace(/\/+$/, "") !== repairShopRoute) return;

  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const copy = {
    en: {
      locationLabel: "Service city / state",
      locationHelp: "Enter the city and two-letter state only, for example Milwaukee, WI. A street address is not required here.",
      roadsideHelp: "Your standard emergency roadside labor rate per hour, in USD.",
      laborHelp: "Discount your shop could offer on labor for reviewed fleet/partner work.",
      partsHelp: "Discount your shop could offer on parts for reviewed fleet/partner work.",
      turnaroundHelp: "Typical minimum turnaround time, in hours, for work your shop can support.",
      equipmentHelp: "Check only the equipment types your shop can actually service. You can leave this blank.",
      nextTitle: "What happens next",
      nextSteps: ["Review your entries — nothing is sent yet.", "Submit the offer privately to Hermes Logistics.", "Hermes reviews it manually and contacts you if a next step is appropriate. Submission is not automatic approval."],
      review: "✦ Review Offer Details",
      submit: "✦ Submit Offer to Hermes",
      sending: "✦ Sending Offer…",
      received: "✦ Offer Received by Hermes",
      draft: "Review ready. Nothing has been sent yet. Check the details above, then submit when you are ready.",
      consent: "Please confirm consent before submitting the partner offer.",
      success: "Offer received by Hermes Logistics. It is awaiting human review; no approval is automatic.",
      unavailable: "We could not confirm delivery. Your entries are still on this page. Try again or use the prepared email fallback below.",
      rate: "Too many delivery attempts were made from this connection. Your entries are still here; use the prepared email fallback or try again later.",
      invalid: "We could not submit these details. Review the required fields, then try again. Your entries have not been cleared.",
      fallback: "Email this prepared offer instead",
    },
    ru: {
      locationLabel: "Город / штат обслуживания",
      locationHelp: "Укажите только город и двухбуквенный код штата, например Milwaukee, WI. Полный адрес улицы здесь не нужен.",
      roadsideHelp: "Ваша стандартная почасовая ставка за экстренный выездной ремонт, USD.",
      laborHelp: "Скидка на работу, которую СТО готово предложить для согласованных fleet/partner заказов.",
      partsHelp: "Скидка на запчасти, которую СТО готово предложить для согласованных fleet/partner заказов.",
      turnaroundHelp: "Обычный минимальный срок выполнения поддерживаемых работ, в часах.",
      equipmentHelp: "Отметьте только те типы техники, которые ваше СТО действительно обслуживает. Поле можно оставить пустым.",
      nextTitle: "Что произойдёт дальше",
      nextSteps: ["Сначала проверьте введённые данные — на этом шаге ничего не отправляется.", "Затем отправьте предложение в Hermes Logistics приватно.", "Hermes проверит его вручную и свяжется с вами, если есть подходящий следующий шаг. Отправка не означает автоматического одобрения."],
      review: "✦ Проверить предложение",
      submit: "✦ Отправить предложение в Hermes",
      sending: "✦ Отправляем…",
      received: "✦ Предложение получено Hermes",
      draft: "Данные готовы к проверке. Пока ничего не отправлено. Проверьте информацию выше и отправьте, когда будете готовы.",
      consent: "Подтвердите согласие перед отправкой предложения.",
      success: "Предложение получено Hermes Logistics и ожидает ручной проверки. Одобрение не происходит автоматически.",
      unavailable: "Не удалось подтвердить доставку. Все введённые данные остались на странице. Попробуйте ещё раз или используйте готовую отправку по email ниже.",
      rate: "С этого соединения было слишком много попыток отправки. Данные сохранены на странице; используйте готовый email или попробуйте позже.",
      invalid: "Не удалось отправить эти данные. Проверьте обязательные поля и попробуйте ещё раз. Введённая информация не очищена.",
      fallback: "Отправить это предложение по email",
    },
    uk: {
      locationLabel: "Місто / штат обслуговування",
      locationHelp: "Вкажіть лише місто та дволітерний код штату, наприклад Milwaukee, WI. Повна адреса тут не потрібна.",
      roadsideHelp: "Ваша стандартна погодинна ставка за екстрений виїзний ремонт, USD.",
      laborHelp: "Знижка на роботу для погоджених fleet/partner замовлень.",
      partsHelp: "Знижка на запчастини для погоджених fleet/partner замовлень.",
      turnaroundHelp: "Типовий мінімальний час виконання підтримуваних робіт, у годинах.",
      equipmentHelp: "Позначте лише типи техніки, які ваше СТО реально обслуговує. Поле можна залишити порожнім.",
      nextTitle: "Що відбудеться далі",
      nextSteps: ["Спочатку перевірте введені дані — на цьому кроці нічого не надсилається.", "Потім приватно надішліть пропозицію до Hermes Logistics.", "Hermes перевірить її вручну та зв’яжеться з вами, якщо буде доречний наступний крок. Надсилання не означає автоматичного схвалення."],
      review: "✦ Перевірити пропозицію",
      submit: "✦ Надіслати пропозицію в Hermes",
      sending: "✦ Надсилаємо…",
      received: "✦ Пропозицію отримано Hermes",
      draft: "Дані готові до перевірки. Поки нічого не надіслано. Перевірте інформацію вище й надішліть, коли будете готові.",
      consent: "Підтвердьте згоду перед надсиланням пропозиції.",
      success: "Hermes Logistics отримав пропозицію. Вона очікує ручної перевірки; схвалення не відбувається автоматично.",
      unavailable: "Не вдалося підтвердити доставку. Усі введені дані залишилися на сторінці. Спробуйте ще раз або скористайтеся готовим email нижче.",
      rate: "З цього з’єднання було забагато спроб надсилання. Дані залишилися на сторінці; скористайтеся email або спробуйте пізніше.",
      invalid: "Не вдалося надіслати ці дані. Перевірте обов’язкові поля та спробуйте знову. Введена інформація не очищена.",
      fallback: "Надіслати цю пропозицію email",
    },
    es: { locationLabel:"Ciudad / estado de servicio", locationHelp:"Introduce solo la ciudad y la abreviatura de dos letras del estado, por ejemplo Milwaukee, WI. Aquí no se necesita la dirección completa.", roadsideHelp:"Tarifa estándar por hora para asistencia mecánica de emergencia, en USD.", laborHelp:"Descuento de mano de obra que el taller podría ofrecer para trabajos de flota/socio revisados.", partsHelp:"Descuento de piezas que el taller podría ofrecer para trabajos de flota/socio revisados.", turnaroundHelp:"Tiempo mínimo habitual de entrega, en horas, para trabajos compatibles.", equipmentHelp:"Marca solo los tipos de equipo que el taller realmente puede atender. Puedes dejarlo vacío.", nextTitle:"Qué ocurre después", nextSteps:["Revisa los datos; todavía no se envía nada.","Envía la oferta de forma privada a Hermes Logistics.","Hermes la revisa manualmente y te contacta si corresponde un siguiente paso. Enviar no significa aprobación automática."], review:"✦ Revisar oferta", submit:"✦ Enviar oferta a Hermes", sending:"✦ Enviando…", received:"✦ Oferta recibida por Hermes", draft:"La revisión está lista. Todavía no se ha enviado nada. Comprueba los datos y envía cuando estés listo.", consent:"Confirma el consentimiento antes de enviar la oferta.", success:"Hermes Logistics recibió la oferta. Está pendiente de revisión humana; no hay aprobación automática.", unavailable:"No pudimos confirmar la entrega. Tus datos siguen en la página. Inténtalo de nuevo o usa el email preparado.", rate:"Se hicieron demasiados intentos desde esta conexión. Tus datos siguen aquí; usa el email preparado o inténtalo más tarde.", invalid:"No pudimos enviar estos datos. Revisa los campos obligatorios y vuelve a intentarlo. Tus datos no se borraron.", fallback:"Enviar esta oferta por email" },
    it: { locationLabel:"Città / stato di servizio", locationHelp:"Inserisci solo città e sigla di due lettere dello stato, ad esempio Milwaukee, WI. L’indirizzo completo non è richiesto qui.", roadsideHelp:"Tariffa oraria standard per assistenza stradale d’emergenza, in USD.", laborHelp:"Sconto sulla manodopera che l’officina potrebbe offrire per lavori fleet/partner approvati.", partsHelp:"Sconto sui ricambi che l’officina potrebbe offrire per lavori fleet/partner approvati.", turnaroundHelp:"Tempo minimo tipico di consegna, in ore, per i lavori supportati.", equipmentHelp:"Seleziona solo i tipi di mezzi che l’officina può realmente servire. Puoi lasciare vuoto.", nextTitle:"Cosa succede dopo", nextSteps:["Controlla i dati: non viene ancora inviato nulla.","Invia privatamente l’offerta a Hermes Logistics.","Hermes la verifica manualmente e ti contatta se esiste un passo successivo appropriato. L’invio non equivale ad approvazione automatica."], review:"✦ Controlla offerta", submit:"✦ Invia offerta a Hermes", sending:"✦ Invio…", received:"✦ Offerta ricevuta da Hermes", draft:"Revisione pronta. Non è stato ancora inviato nulla. Controlla i dati e invia quando sei pronto.", consent:"Conferma il consenso prima di inviare l’offerta.", success:"Hermes Logistics ha ricevuto l’offerta. È in attesa di revisione umana; nessuna approvazione è automatica.", unavailable:"Non è stato possibile confermare la consegna. I dati sono ancora nella pagina. Riprova o usa l’email preparata.", rate:"Troppi tentativi da questa connessione. I dati sono ancora qui; usa l’email preparata o riprova più tardi.", invalid:"Non è stato possibile inviare questi dati. Controlla i campi obbligatori e riprova. I dati non sono stati cancellati.", fallback:"Invia questa offerta via email" },
    fr: { locationLabel:"Ville / État de service", locationHelp:"Indiquez uniquement la ville et l’abréviation de l’État à deux lettres, par exemple Milwaukee, WI. L’adresse complète n’est pas nécessaire ici.", roadsideHelp:"Tarif horaire standard pour dépannage routier d’urgence, en USD.", laborHelp:"Remise sur la main-d’œuvre que l’atelier pourrait proposer pour des travaux flotte/partenaire examinés.", partsHelp:"Remise sur les pièces que l’atelier pourrait proposer pour des travaux flotte/partenaire examinés.", turnaroundHelp:"Délai minimum habituel, en heures, pour les travaux pris en charge.", equipmentHelp:"Cochez uniquement les types d’équipement réellement pris en charge par l’atelier. Vous pouvez laisser vide.", nextTitle:"Ce qui se passe ensuite", nextSteps:["Vérifiez vos informations : rien n’est encore envoyé.","Envoyez l’offre en privé à Hermes Logistics.","Hermes l’examine manuellement et vous contacte si une suite est appropriée. L’envoi ne vaut pas approbation automatique."], review:"✦ Vérifier l’offre", submit:"✦ Envoyer l’offre à Hermes", sending:"✦ Envoi…", received:"✦ Offre reçue par Hermes", draft:"La vérification est prête. Rien n’a encore été envoyé. Vérifiez les informations puis envoyez lorsque vous êtes prêt.", consent:"Confirmez votre consentement avant d’envoyer l’offre.", success:"Hermes Logistics a reçu l’offre. Elle attend une vérification humaine ; aucune approbation n’est automatique.", unavailable:"Nous n’avons pas pu confirmer la livraison. Vos données sont toujours sur la page. Réessayez ou utilisez l’email préparé.", rate:"Trop de tentatives depuis cette connexion. Vos données sont toujours là ; utilisez l’email préparé ou réessayez plus tard.", invalid:"Nous n’avons pas pu envoyer ces informations. Vérifiez les champs obligatoires puis réessayez. Vos données n’ont pas été effacées.", fallback:"Envoyer cette offre par email" },
  }[locale];

  const createRequestId = () => {
    const uuid = globalThis.crypto?.randomUUID?.() || "";
    const randomPart = uuid.replaceAll("-", "").slice(0, 12) || Math.random().toString(36).slice(2, 14);
    return `repair_partner_${Date.now().toString(36)}_${randomPart}`;
  };

  const setupLivePartnerOffer = () => {
    const originalForm = document.getElementById("partner-beta-form");
    const template = document.getElementById("repair-partner-contact-template");
    if (!(originalForm instanceof HTMLFormElement) || !(template instanceof HTMLTemplateElement)) return;

    const form = originalForm.cloneNode(true);
    if (!(form instanceof HTMLFormElement)) return;
    form.removeAttribute("data-demo-form");
    form.setAttribute("data-live-partner-offer", "true");
    originalForm.replaceWith(form);

    const submitButton = form.querySelector("#submit-btn");
    const tracker = document.querySelector("[data-lifecycle-tracker]");
    const statusLabel = document.getElementById("status-label");
    if (!(submitButton instanceof HTMLButtonElement) || !tracker) return;

    if (!form.querySelector("[data-repair-partner-contact-fields]")) form.insertBefore(template.content.cloneNode(true), submitButton);

    const stepItems = [...tracker.querySelectorAll(".step-item")];
    const contactName = form.querySelector("#partner-contact-name");
    const contactEmail = form.querySelector("#partner-contact-email");
    const contactPhone = form.querySelector("#partner-contact-phone");
    const consent = form.querySelector("#partner-contact-consent");
    const deliveryStatus = form.querySelector("[data-repair-partner-delivery-status]");
    const buttonLabel = submitButton.querySelector("span");

    const addHelp = (id, text) => {
      const control = form.querySelector(`#${id}`);
      if (!(control instanceof HTMLElement) || form.querySelector(`[data-repair-help="${id}"]`)) return;
      const help = document.createElement("small");
      help.className = "repair-offer-field-help";
      help.dataset.repairHelp = id;
      help.textContent = text;
      control.insertAdjacentElement("afterend", help);
    };

    const cityStateInput = form.querySelector("#city-state");
    if (cityStateInput instanceof HTMLInputElement) {
      const label = cityStateInput.closest("label");
      if (label) {
        const firstText = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (firstText) firstText.textContent = `${copy.locationLabel} `;
      }
      cityStateInput.placeholder = "Milwaukee, WI";
      cityStateInput.autocomplete = "address-level2";
      addHelp("city-state", copy.locationHelp);
    }
    addHelp("roadside-rate", copy.roadsideHelp);
    addHelp("labor-discount", copy.laborHelp);
    addHelp("parts-discount", copy.partsHelp);
    addHelp("turnaround", copy.turnaroundHelp);

    const equipmentLegend = form.querySelector("fieldset legend");
    if (equipmentLegend && !form.querySelector("[data-repair-equipment-help]")) {
      const help = document.createElement("small");
      help.className = "repair-offer-field-help";
      help.dataset.repairEquipmentHelp = "true";
      help.textContent = copy.equipmentHelp;
      equipmentLegend.insertAdjacentElement("afterend", help);
    }

    if (!form.querySelector("[data-repair-offer-next-step]")) {
      const next = document.createElement("aside");
      next.className = "repair-offer-next-step";
      next.dataset.repairOfferNextStep = "true";
      const list = copy.nextSteps.map((item) => `<li>${item}</li>`).join("");
      next.innerHTML = `<strong>${copy.nextTitle}</strong><ol>${list}</ol>`;
      form.insertBefore(next, submitButton);
    }

    let fallbackLink = form.querySelector("[data-repair-partner-fallback]");
    if (!(fallbackLink instanceof HTMLAnchorElement)) {
      fallbackLink = document.createElement("a");
      fallbackLink.className = "repair-partner-fallback";
      fallbackLink.dataset.repairPartnerFallback = "true";
      fallbackLink.textContent = copy.fallback;
      fallbackLink.hidden = true;
      if (deliveryStatus instanceof HTMLElement) deliveryStatus.insertAdjacentElement("afterend", fallbackLink);
    }

    let state = "REGISTERED";
    let sending = false;
    let requestId = "";
    if (buttonLabel) buttonLabel.textContent = copy.review;

    const updateLifecycle = (nextState) => {
      state = nextState;
      const stepsMap = { REGISTERED: 1, OFFER_DRAFT: 2, OFFER_SUBMITTED: 3 };
      const target = stepsMap[nextState] || 1;
      stepItems.forEach((item, index) => item.classList.toggle("active", index < target));
      if (statusLabel) statusLabel.textContent = nextState === "OFFER_SUBMITTED" ? "OFFER_SUBMITTED — awaiting human review" : nextState;
    };

    const setDeliveryStatus = (message, kind = "error") => {
      if (!(deliveryStatus instanceof HTMLElement)) return;
      deliveryStatus.textContent = message;
      deliveryStatus.dataset.state = kind;
      deliveryStatus.hidden = false;
    };

    const safeAnalytics = (event, extra = {}) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, source: "repair_shop_partner_offer", ...extra });
    };

    const formValue = (selector) => {
      const input = form.querySelector(selector);
      return input instanceof HTMLInputElement || input instanceof HTMLSelectElement ? input.value.trim() : "";
    };

    const buildOffer = () => {
      const shopName = formValue("#shop-name");
      const shopSubtype = formValue("#shop-type");
      const cityState = formValue("#city-state");
      const roadsideRate = formValue("#roadside-rate");
      const laborDiscount = formValue("#labor-discount");
      const partsDiscount = formValue("#parts-discount");
      const turnaround = formValue("#turnaround");
      const equipment = [...form.querySelectorAll('input[name="equipment"]:checked')]
        .filter((item) => item instanceof HTMLInputElement)
        .map((item) => item.value)
        .slice(0, 12);
      const message = [
        "Repair Shop Partner corporate offer submitted from Hermes Connect.",
        `Shop: ${shopName}`,
        `Shop subtype: ${shopSubtype}`,
        `Service city / state: ${cityState}`,
        `Emergency roadside hourly: ${roadsideRate ? `$${roadsideRate}` : "not provided"}`,
        `Labor discount: ${laborDiscount ? `${laborDiscount}%` : "not provided"}`,
        `Parts discount: ${partsDiscount ? `${partsDiscount}%` : "not provided"}`,
        `Equipment: ${equipment.length ? equipment.join(", ") : "not provided"}`,
        `Minimum turnaround: ${turnaround ? `${turnaround} hours` : "not provided"}`,
        "Requested action: human review for Repair Shop / Truck Repair Partner Beta onboarding.",
      ].join("\n");
      return { shopName, shopSubtype, cityState, equipment, message };
    };

    const setFallback = (offer) => {
      if (!(fallbackLink instanceof HTMLAnchorElement) || !(contactName instanceof HTMLInputElement) || !(contactEmail instanceof HTMLInputElement) || !(contactPhone instanceof HTMLInputElement)) return;
      const body = [offer.message, "", `Contact: ${contactName.value.trim()}`, `Email: ${contactEmail.value.trim()}`, `Phone: ${contactPhone.value.trim() || "not provided"}`].join("\n");
      fallbackLink.href = `mailto:officeus@hermeslogisticsus.com?subject=${encodeURIComponent(`Hermes Repair Partner Offer — ${offer.shopName || "Repair Shop"}`)}&body=${encodeURIComponent(body)}`;
      fallbackLink.hidden = false;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (sending || !form.reportValidity()) return;

      if (state === "REGISTERED") {
        updateLifecycle("OFFER_DRAFT");
        requestId = createRequestId();
        if (buttonLabel) buttonLabel.textContent = copy.submit;
        safeAnalytics("connect_offer_draft_prepared", { shop_subtype: formValue("#shop-type") });
        setDeliveryStatus(copy.draft, "success");
        if (fallbackLink instanceof HTMLAnchorElement) fallbackLink.hidden = true;
        return;
      }

      if (state !== "OFFER_DRAFT") return;
      if (!(contactName instanceof HTMLInputElement) || !(contactEmail instanceof HTMLInputElement) || !(contactPhone instanceof HTMLInputElement) || !(consent instanceof HTMLInputElement)) return;
      if (!consent.checked) {
        setDeliveryStatus(copy.consent);
        consent.focus();
        return;
      }

      const offer = buildOffer();
      if (!requestId) requestId = createRequestId();
      const payload = {
        request_id: requestId,
        submitted_at: new Date().toISOString(),
        source_path: window.location.pathname,
        name: contactName.value.trim(),
        email: contactEmail.value.trim(),
        interest: "Hermes Logistics",
        message: offer.message,
        consent: true,
        direction_fields: {
          direction: "Hermes Logistics",
          fields: {
            phone: contactPhone.value.trim(),
            equipment_type: offer.equipment,
            preferred_lanes: offer.cityState,
            service_needed: "Repair Shop / Truck Repair Partner Beta",
            primary_goal: "Corporate repair partner offer review",
          },
        },
      };

      sending = true;
      submitButton.disabled = true;
      if (buttonLabel) buttonLabel.textContent = copy.sending;
      if (deliveryStatus instanceof HTMLElement) deliveryStatus.hidden = true;
      if (fallbackLink instanceof HTMLAnchorElement) fallbackLink.hidden = true;

      try {
        const response = await fetch("/api/logistics-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": requestId },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success) {
          const error = typeof result?.error === "string" ? result.error : "delivery_failed";
          const failure = new Error(error);
          failure.name = String(response.status || 0);
          throw failure;
        }

        updateLifecycle("OFFER_SUBMITTED");
        if (buttonLabel) buttonLabel.textContent = copy.received;
        setDeliveryStatus(copy.success, "success");
        safeAnalytics("connect_offer_submitted", { shop_subtype: offer.shopSubtype, request_state: result?.duplicate ? "duplicate_confirmed" : "received" });
      } catch (error) {
        sending = false;
        submitButton.disabled = false;
        if (buttonLabel) buttonLabel.textContent = copy.submit;
        const code = error instanceof Error ? error.message : "delivery_failed";
        const status = error instanceof Error ? Number(error.name) : 0;
        const message = code === "rate_limit_exceeded" || status === 429 ? copy.rate : code === "invalid_lead" || code === "contact_details_required" || status === 400 ? copy.invalid : copy.unavailable;
        setDeliveryStatus(message);
        setFallback(offer);
        safeAnalytics("connect_offer_delivery_failed", { failure_class: status === 429 ? "rate_limited" : status >= 400 && status < 500 ? "request_rejected" : "delivery_unconfirmed" });
      }
    }, true);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupLivePartnerOffer, { once: true });
  else setupLivePartnerOffer();
})();
