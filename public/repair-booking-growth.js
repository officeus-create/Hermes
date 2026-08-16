(() => {
  const repairBookingRoute = "/services/hermes-connect/repair-shops/booking";
  if (window.location.pathname.replace(/\/+$/, "") !== repairBookingRoute) return;

  const setupGrowthBridge = () => {
    const successPanel = document.getElementById("success-panel");
    const template = document.getElementById("repair-growth-template");
    if (!successPanel || !(template instanceof HTMLTemplateElement) || successPanel.querySelector("[data-repair-growth-card]")) return;

    successPanel.append(template.content.cloneNode(true));
    const card = successPanel.querySelector("[data-repair-growth-card]");
    if (!(card instanceof HTMLElement)) return;

    const openButton = card.querySelector("[data-growth-open]");
    const form = card.querySelector("[data-growth-form]");
    const serviceSelect = card.querySelector("[data-growth-service]");
    const messageInput = card.querySelector("[data-growth-message]");
    const consentInput = card.querySelector("[data-growth-consent]");
    const submitButton = card.querySelector("[data-growth-submit]");
    const status = card.querySelector("[data-growth-status]");

    const setStatus = (message, state = "error") => {
      if (!(status instanceof HTMLElement)) return;
      status.textContent = message;
      status.dataset.state = state;
      status.hidden = false;
    };

    if (openButton instanceof HTMLButtonElement && form instanceof HTMLFormElement) {
      openButton.addEventListener("click", () => {
        form.hidden = false;
        openButton.hidden = true;
        if (serviceSelect instanceof HTMLSelectElement) serviceSelect.focus();
      });
    }

    if (!(form instanceof HTMLFormElement) || !(serviceSelect instanceof HTMLSelectElement) || !(consentInput instanceof HTMLInputElement) || !(submitButton instanceof HTMLButtonElement)) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const requestedService = serviceSelect.value.trim();
      if (!requestedService) {
        setStatus("Choose the business-growth area you want help with.");
        serviceSelect.focus();
        return;
      }
      if (!consentInput.checked) {
        setStatus("Please confirm that Hermes may contact you about this separate business-growth request.");
        consentInput.focus();
        return;
      }

      const nameInput = document.getElementById("client-name");
      const emailInput = document.getElementById("client-email");
      const bookingName = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "";
      const bookingEmail = emailInput instanceof HTMLInputElement ? emailInput.value.trim() : "";
      if (!bookingName || !bookingEmail) {
        setStatus("Your booking contact details are unavailable. Please use the main Hermes contact form instead.");
        return;
      }

      const note = messageInput instanceof HTMLTextAreaElement ? messageInput.value.trim() : "";
      const uuid = globalThis.crypto?.randomUUID?.() || "";
      const randomPart = uuid.replaceAll("-", "").slice(0, 12) || Math.random().toString(36).slice(2, 14);
      const requestId = `repair_growth_${Date.now().toString(36)}_${randomPart}`;
      const payload = {
        request_id: requestId,
        submitted_at: new Date().toISOString(),
        source_path: window.location.pathname,
        name: bookingName,
        email: bookingEmail,
        interest: "ProgressoPro",
        message: note || `Business growth request from a customer who completed a Hermes Connect Repair Shop booking. Requested help: ${requestedService}.`,
        consent: true,
        direction_fields: {
          direction: "ProgressoPro",
          fields: {
            service_needed: requestedService,
            primary_goal: "Grow business from Repair Shop booking flow",
            target_audience: "Business owner or manager using Hermes Connect Repair Shop booking",
          },
        },
      };

      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
      if (status instanceof HTMLElement) status.hidden = true;

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
        if (!response.ok || !result?.success) throw new Error("lead_delivery_failed");

        setStatus("Request received. Hermes will use your booking email to contact you about the business-growth request.", "success");
        serviceSelect.disabled = true;
        if (messageInput instanceof HTMLTextAreaElement) messageInput.disabled = true;
        consentInput.disabled = true;
        submitButton.textContent = "Request sent";

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "connect_hermes_growth_cta_requests",
          source: "repair_booking_success",
          request_state: "received",
        });
      } catch {
        submitButton.disabled = false;
        submitButton.textContent = "Send business-growth request";
        setStatus("Business-growth request delivery is temporarily unavailable. Your repair appointment is still confirmed; please try this request again later.");
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupGrowthBridge, { once: true });
  } else {
    setupGrowthBridge();
  }
})();
