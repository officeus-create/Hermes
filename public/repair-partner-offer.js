(() => {
  const repairShopRoute = "/services/hermes-connect/repair-shops";
  if (window.location.pathname.replace(/\/+$/, "") !== repairShopRoute) return;

  const cleanPrivateSalespersonCode = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("salesperson_code") || params.get("rep") || "";
    return /^[A-Za-z0-9_-]{2,40}$/.test(raw) ? raw : "";
  };

  const createRequestId = () => {
    const uuid = globalThis.crypto?.randomUUID?.() || "";
    const randomPart = uuid.replaceAll("-", "").slice(0, 12) || Math.random().toString(36).slice(2, 14);
    return `repair_partner_${Date.now().toString(36)}_${randomPart}`;
  };

  const setupLivePartnerOffer = () => {
    const form = document.getElementById("partner-beta-form");
    const template = document.getElementById("repair-partner-contact-template");
    const submitButton = document.getElementById("submit-btn");
    const statusLabel = document.getElementById("status-label");
    const tracker = document.querySelector("[data-lifecycle-tracker]");

    if (!(form instanceof HTMLFormElement) || !(template instanceof HTMLTemplateElement) || !(submitButton instanceof HTMLButtonElement) || !tracker) return;
    if (!form.querySelector("[data-repair-partner-contact-fields]")) {
      form.insertBefore(template.content.cloneNode(true), submitButton);
    }

    const stepItems = [...tracker.querySelectorAll(".step-item")];
    const contactName = form.querySelector("#partner-contact-name");
    const contactEmail = form.querySelector("#partner-contact-email");
    const contactPhone = form.querySelector("#partner-contact-phone");
    const consent = form.querySelector("#partner-contact-consent");
    const deliveryStatus = form.querySelector("[data-repair-partner-delivery-status]");

    let state = "REGISTERED";
    let sending = false;

    const updateLifecycle = (nextState) => {
      state = nextState;
      const stepsMap = { REGISTERED: 1, OFFER_DRAFT: 2, OFFER_SUBMITTED: 3, UNDER_REVIEW: 4 };
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

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (sending) return;
      if (!form.reportValidity()) return;

      if (state === "REGISTERED") {
        updateLifecycle("OFFER_DRAFT");
        const label = submitButton.querySelector("span");
        if (label) label.textContent = "✦ Submit Offer For Review";
        const shopType = document.getElementById("shop-type");
        safeAnalytics("connect_offer_draft_prepared", {
          shop_subtype: shopType instanceof HTMLSelectElement ? shopType.value : "",
        });
        setDeliveryStatus("Draft prepared. Review the terms above, then submit when ready.", "success");
        return;
      }

      if (state !== "OFFER_DRAFT") return;
      if (!(contactName instanceof HTMLInputElement) || !(contactEmail instanceof HTMLInputElement) || !(contactPhone instanceof HTMLInputElement) || !(consent instanceof HTMLInputElement)) return;

      const shopNameInput = document.getElementById("shop-name");
      const shopTypeInput = document.getElementById("shop-type");
      const cityStateInput = document.getElementById("city-state");
      const roadsideInput = document.getElementById("roadside-rate");
      const laborInput = document.getElementById("labor-discount");
      const partsInput = document.getElementById("parts-discount");
      const turnaroundInput = document.getElementById("turnaround");

      const shopName = shopNameInput instanceof HTMLInputElement ? shopNameInput.value.trim() : "";
      const shopSubtype = shopTypeInput instanceof HTMLSelectElement ? shopTypeInput.value.trim() : "";
      const cityState = cityStateInput instanceof HTMLInputElement ? cityStateInput.value.trim() : "";
      const roadsideRate = roadsideInput instanceof HTMLInputElement ? roadsideInput.value.trim() : "";
      const laborDiscount = laborInput instanceof HTMLInputElement ? laborInput.value.trim() : "";
      const partsDiscount = partsInput instanceof HTMLInputElement ? partsInput.value.trim() : "";
      const turnaround = turnaroundInput instanceof HTMLInputElement ? turnaroundInput.value.trim() : "";
      const equipment = [...form.querySelectorAll('input[name="equipment"]:checked')]
        .filter((item) => item instanceof HTMLInputElement)
        .map((item) => item.value)
        .slice(0, 12);
      const salespersonCode = cleanPrivateSalespersonCode();
      const requestId = createRequestId();

      if (!consent.checked) {
        setDeliveryStatus("Please confirm consent before submitting the partner offer.");
        consent.focus();
        return;
      }

      const message = [
        "Repair Shop Partner corporate offer submitted from Hermes Connect.",
        `Shop: ${shopName}`,
        `Shop subtype: ${shopSubtype}`,
        `City / state: ${cityState}`,
        `Emergency roadside hourly: ${roadsideRate ? `$${roadsideRate}` : "not provided"}`,
        `Labor discount: ${laborDiscount ? `${laborDiscount}%` : "not provided"}`,
        `Parts discount: ${partsDiscount ? `${partsDiscount}%` : "not provided"}`,
        `Equipment: ${equipment.length ? equipment.join(", ") : "not provided"}`,
        `Minimum turnaround: ${turnaround ? `${turnaround} hours` : "not provided"}`,
        `Private salesperson code: ${salespersonCode || "not provided"}`,
        "Requested action: human review for Repair Shop / Truck Repair Partner Beta onboarding.",
      ].join("\n");

      const payload = {
        request_id: requestId,
        submitted_at: new Date().toISOString(),
        source_path: window.location.pathname,
        name: contactName.value.trim(),
        email: contactEmail.value.trim(),
        interest: "Hermes Logistics",
        message,
        consent: true,
        direction_fields: {
          direction: "Hermes Logistics",
          fields: {
            phone: contactPhone.value.trim(),
            equipment_type: equipment,
            preferred_lanes: cityState,
            service_needed: "Repair Shop / Truck Repair Partner Beta",
            primary_goal: "Corporate repair partner offer review",
          },
        },
      };

      sending = true;
      submitButton.disabled = true;
      const label = submitButton.querySelector("span");
      if (label) label.textContent = "✦ Sending Offer…";
      if (deliveryStatus instanceof HTMLElement) deliveryStatus.hidden = true;

      try {
        const response = await fetch("/api/logistics-lead", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": requestId,
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success) throw new Error("partner_offer_delivery_failed");

        updateLifecycle("OFFER_SUBMITTED");
        if (label) label.textContent = "✦ Offer Received by Hermes";
        setDeliveryStatus("Offer received by Hermes Logistics. It is awaiting human review; no approval is automatic.", "success");
        safeAnalytics("connect_offer_submitted", { shop_subtype: shopSubtype, request_state: "received" });
      } catch {
        sending = false;
        submitButton.disabled = false;
        if (label) label.textContent = "✦ Submit Offer For Review";
        setDeliveryStatus("Offer delivery is temporarily unavailable. Nothing was submitted; please try again.");
      }
    }, true);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupLivePartnerOffer, { once: true });
  } else {
    setupLivePartnerOffer();
  }
})();
