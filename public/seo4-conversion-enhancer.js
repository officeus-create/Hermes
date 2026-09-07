(() => {
  const pushEvent = (payload) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    const { event, ...parameters } = payload;
    window.gtag?.("event", event, parameters);
  };

  const refreshLoadBoardDemoLabels = () => {
    if (window.location.pathname !== "/load-board/") return;
    const pickupLabels = [
      "Demo day +1 · 8 AM–2 PM",
      "Demo day +2",
      "Demo day +3 · appointment",
      "Demo day +4–5",
    ];

    document.querySelectorAll("[data-demo-load-card]").forEach((card, index) => {
      card.dataset.demoFreshnessApplied = "true";
      card.querySelectorAll("dt").forEach((term) => {
        const value = term.nextElementSibling;
        if (!(value instanceof HTMLElement)) return;
        if (term.textContent?.trim() === "Pickup") {
          value.textContent = pickupLabels[index] ?? `Demo day +${index + 1}`;
        }
        if (term.textContent?.trim() === "Posted") {
          term.textContent = "Status";
          value.textContent = "Illustrative demo";
        }
      });
    });
  };

  const carrierServiceGroups = {
    "/logistics/car-hauling-dispatch/": "car_hauling_dispatch",
    "/logistics/owner-operator-dispatch-support/": "owner_operator_dispatch",
    "/logistics/fleet-owner-dispatch-support/": "fleet_owner_dispatch",
    "/logistics/new-authority-car-hauler-support/": "new_authority_car_hauler",
    "/paths/logistics/": "logistics_hub_carrier_review",
  };
  const repairShopRoot = "/services/hermes-connect/repair-shops/";
  let repairRegistrationObserver = null;
  let repairRegistrationTimeout = 0;

  const stopRepairRegistrationWatch = () => {
    repairRegistrationObserver?.disconnect();
    repairRegistrationObserver = null;
    if (repairRegistrationTimeout) window.clearTimeout(repairRegistrationTimeout);
    repairRegistrationTimeout = 0;
  };

  const armRepairRegistrationComplete = () => {
    const authenticated = document.getElementById("auth-authenticated");
    const alertBox = document.getElementById("alert-box");
    if (!(authenticated instanceof HTMLElement) || !(alertBox instanceof HTMLElement)) return;
    stopRepairRegistrationWatch();
    let sent = false;
    const settleRegistrationAttempt = () => {
      if (!alertBox.classList.contains("hidden") && alertBox.classList.contains("error")) {
        stopRepairRegistrationWatch();
        return;
      }
      if (sent || !authenticated.classList.contains("active")) return;
      sent = true;
      stopRepairRegistrationWatch();
      pushEvent({
        event: "repair_shop_registration_complete",
        audience_type: "repair_business",
        page_group: "hermes_connect_repair",
        service_group: "repair_shop_software",
        page_path: window.location.pathname,
        destination_path: `${repairShopRoot}dashboard/`,
      });
    };
    repairRegistrationObserver = new MutationObserver(settleRegistrationAttempt);
    repairRegistrationObserver.observe(authenticated, { attributes: true, attributeFilter: ["class"] });
    repairRegistrationObserver.observe(alertBox, { attributes: true, attributeFilter: ["class"], childList: true });
    repairRegistrationTimeout = window.setTimeout(stopRepairRegistrationWatch, 15_000);
    settleRegistrationAttempt();
  };

  refreshLoadBoardDemoLabels();

  document.addEventListener("click", (event) => {
    if (!event.isTrusted) return;
    const source = event.target;
    if (!(source instanceof Element)) return;
    const link = source.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;

    let target;
    try {
      target = new URL(link.href, window.location.origin);
    } catch {
      return;
    }
    if (target.origin !== window.location.origin) return;

    if (link.hasAttribute("data-home-role-link") && window.location.pathname === "/") {
      pushEvent({
        event: "homepage_role_click",
        page_group: "homepage_role_router",
        role_id: link.dataset.roleId || "unknown",
        page_path: "/",
        destination_path: target.pathname,
      });
      return;
    }

    if (window.location.pathname === repairShopRoot) {
      if (target.pathname === `${repairShopRoot}auth/`) {
        pushEvent({
          event: "commercial_cta_click",
          cta_type: "repair_shop_registration",
          audience_type: "repair_business",
          page_group: "hermes_connect_repair",
          service_group: "repair_shop_software",
          page_path: window.location.pathname,
          destination_path: target.pathname,
        });
        return;
      }
      if (target.pathname === `${repairShopRoot}plan/`) {
        pushEvent({
          event: "commercial_cta_click",
          cta_type: "repair_shop_plan",
          audience_type: "repair_business",
          page_group: "hermes_connect_repair",
          service_group: "repair_shop_software",
          page_path: window.location.pathname,
          destination_path: target.pathname,
        });
        return;
      }
    }

    if (
      target.pathname !== "/logistics/start-car-hauling-dispatch/" ||
      !link.hasAttribute("data-commercial-primary-cta")
    ) return;

    const serviceGroup = link.dataset.serviceGroup?.trim() || carrierServiceGroups[window.location.pathname];
    if (!serviceGroup) return;
    pushEvent({
      event: "commercial_cta_click",
      cta_type: "carrier_intake",
      audience_type: "carrier",
      page_group: window.location.pathname.startsWith("/paths/logistics/") ? "logistics_path" : "logistics_service",
      service_group: serviceGroup,
      page_path: window.location.pathname,
      destination_path: target.pathname,
    });
  });

  document.addEventListener("submit", (event) => {
    if (!event.isTrusted || window.location.pathname !== `${repairShopRoot}auth/`) return;
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "register-form") return;
    pushEvent({
      event: "repair_shop_registration_start",
      audience_type: "repair_business",
      page_group: "hermes_connect_repair",
      service_group: "repair_shop_software",
      page_path: window.location.pathname,
      destination_path: `${repairShopRoot}dashboard/`,
    });
    armRepairRegistrationComplete();
  });
})();