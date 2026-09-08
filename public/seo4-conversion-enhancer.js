(() => {
  const pushEvent = (payload) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    const { event, ...parameters } = payload;
    window.gtag?.("event", event, parameters);
  };

  const carrierGeoRoot = "/logistics/car-hauler-loads/";
  const isCarrierGeoPath = () => window.location.pathname === carrierGeoRoot || window.location.pathname.startsWith(carrierGeoRoot);
  const analyticsConsentGranted = () => document.documentElement.dataset.analyticsConsent === "granted";
  const carrierGeoEventBase = () => ({
    audience_type: "carrier",
    page_group: "car_hauler_geo",
    service_group: "car_hauler_geo",
    page_path: window.location.pathname,
  });
  const carrierGeoSectionEvents = {
    hero: "carrier_geo_reach_hero",
    three_workstreams: "carrier_geo_reach_workstreams",
    load_sources: "carrier_geo_reach_sources",
    vehicle_fit: "carrier_geo_reach_vehicle_fit",
    support_20: "carrier_geo_reach_support",
    ecosystem: "carrier_geo_reach_ecosystem",
    faq: "carrier_geo_reach_faq",
    final_cta: "carrier_geo_reach_final_cta",
    markets: "carrier_geo_reach_markets",
    search_model: "carrier_geo_reach_search_model",
    conversion: "carrier_geo_reach_conversion",
  };
  const carrierGeoCtaEvents = {
    start_review: "carrier_geo_click_start_review",
    carrier_agreement: "carrier_geo_click_agreement",
    market_select: "carrier_geo_click_market",
    load_board: "carrier_geo_click_load_board",
    hermes_connect: "carrier_geo_click_connect",
    dispatch_details: "carrier_geo_click_dispatch",
    all_markets: "carrier_geo_click_all_markets",
  };
  let carrierGeoMeasurementStarted = false;
  let carrierGeoConsentObserver = null;

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

  const applyRepairAuthMode = () => {
    if (window.location.pathname !== `${repairShopRoot}auth/`) return;
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode !== "register") return;

    const registerTab = document.querySelector('[data-tab="register"]');
    if (!(registerTab instanceof HTMLButtonElement)) return;
    registerTab.click();
  };

  const applyAccessibilityRoles = () => {
    const selectors = [".footer-contacts"];
    if (window.location.pathname === "/load-board/") {
      selectors.push(
        ".hlb-live-stats",
        ".load-search-bar",
        ".demo-city-choices",
        ".available-load-list",
      );
    }
    if (window.location.pathname === repairShopRoot) {
      selectors.push(
        ".repair-lifecycle",
        ".repair-geo-market-grid",
        ".repair-geo-actions",
      );
    }

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        if (!(node instanceof HTMLElement) || !node.hasAttribute("aria-label") || node.hasAttribute("role")) return;
        node.setAttribute("role", "group");
      });
    });
  };

  const setupCarrierGeoMeasurement = () => {
    if (
      carrierGeoMeasurementStarted ||
      !analyticsConsentGranted() ||
      !isCarrierGeoPath() ||
      !document.querySelector("[data-carrier-geo-page]")
    ) return;

    carrierGeoMeasurementStarted = true;
    carrierGeoConsentObserver?.disconnect();
    carrierGeoConsentObserver = null;

    pushEvent({ event: "carrier_geo_page_view", ...carrierGeoEventBase() });

    const reachedSections = new Set();
    const recordSection = (section) => {
      if (!(section instanceof HTMLElement)) return;
      const sectionId = section.dataset.carrierGeoSection?.trim();
      if (!sectionId || reachedSections.has(sectionId)) return;
      reachedSections.add(sectionId);
      const payload = {
        section_id: sectionId,
        ...carrierGeoEventBase(),
      };
      pushEvent({ event: "carrier_geo_section_view", ...payload });
      const reportableEvent = carrierGeoSectionEvents[sectionId];
      if (reportableEvent) pushEvent({ event: reportableEvent, ...payload });
    };

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
            recordSection(entry.target);
            observer.unobserve(entry.target);
          });
        }, { threshold: [0.2] })
      : null;

    document.querySelectorAll("[data-carrier-geo-section]").forEach((section) => {
      if (observer) observer.observe(section);
      else recordSection(section);
    });
  };

  const setupCarrierGeoMeasurementWhenAllowed = () => {
    if (!isCarrierGeoPath() || !document.querySelector("[data-carrier-geo-page]")) return;
    if (analyticsConsentGranted()) {
      setupCarrierGeoMeasurement();
      return;
    }
    if (!("MutationObserver" in window) || carrierGeoConsentObserver) return;

    carrierGeoConsentObserver = new MutationObserver(() => {
      if (analyticsConsentGranted()) setupCarrierGeoMeasurement();
    });
    carrierGeoConsentObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-analytics-consent"],
    });
  };

  const applyDomReadyEnhancements = () => {
    applyRepairAuthMode();
    applyAccessibilityRoles();
    setupCarrierGeoMeasurementWhenAllowed();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDomReadyEnhancements, { once: true });
  } else {
    applyDomReadyEnhancements();
  }

  window.addEventListener("hermes:repair-registration-complete", () => {
    pushEvent({
      event: "repair_shop_registration_complete",
      audience_type: "repair_business",
      page_group: "hermes_connect_repair",
      service_group: "repair_shop_software",
      page_path: `${repairShopRoot}auth/`,
      destination_path: `${repairShopRoot}dashboard/`,
    });
  }, { once: true });

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

    if (isCarrierGeoPath() && analyticsConsentGranted() && link.dataset.carrierGeoCta) {
      const ctaType = link.dataset.carrierGeoCta;
      const payload = {
        cta_type: ctaType,
        destination_path: target.pathname,
        ...carrierGeoEventBase(),
      };
      pushEvent({ event: "carrier_geo_cta_click", ...payload });
      const reportableEvent = carrierGeoCtaEvents[ctaType];
      if (reportableEvent) pushEvent({ event: reportableEvent, ...payload });
    }

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

    const serviceGroup = link.dataset.serviceGroup?.trim()
      || (isCarrierGeoPath() ? "car_hauler_geo" : carrierServiceGroups[window.location.pathname]);
    if (!serviceGroup) return;
    if (isCarrierGeoPath() && !analyticsConsentGranted()) return;

    pushEvent({
      event: "commercial_cta_click",
      cta_type: "carrier_intake",
      audience_type: "carrier",
      page_group: isCarrierGeoPath()
        ? "car_hauler_geo"
        : window.location.pathname.startsWith("/paths/logistics/") ? "logistics_path" : "logistics_service",
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
  });
})();