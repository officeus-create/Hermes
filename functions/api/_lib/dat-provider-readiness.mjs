const isTrue = (value) => String(value || "").trim().toLowerCase() === "true";

export function evaluateDatProviderReadiness(env = {}, requestedEnvironment = "sandbox") {
  const environment = String(requestedEnvironment || "sandbox").trim().toLowerCase() === "production"
    ? "production"
    : "sandbox";
  const base = {
    success: false,
    provider: "dat",
    environment,
    external_request_performed: false,
  };

  if (!isTrue(env.HERMES_DAT_PARTNERSHIP_APPROVED)) {
    return {
      status: 403,
      body: {
        ...base,
        error: "dat_partnership_not_approved",
        next_gate: "Complete DAT partnership/API access review before any provider request.",
      },
    };
  }

  if (!isTrue(env.HERMES_DAT_DATA_RIGHTS_APPROVED)) {
    return {
      status: 403,
      body: {
        ...base,
        error: "dat_data_rights_not_approved",
        next_gate: "Approve the exact search/display/storage/retention/deletion scope granted by DAT.",
      },
    };
  }

  if (environment === "production" && !isTrue(env.HERMES_DAT_CERTIFIED)) {
    return {
      status: 403,
      body: {
        ...base,
        error: "dat_certification_required",
        next_gate: "DAT certification is required before production API use.",
      },
    };
  }

  const missingConfiguration = [
    ["DAT_SERVICE_ACCOUNT_EMAIL", env.DAT_SERVICE_ACCOUNT_EMAIL],
    ["DAT_SERVICE_ACCOUNT_PASSWORD", env.DAT_SERVICE_ACCOUNT_PASSWORD],
    ["DAT_USER_EMAIL", env.DAT_USER_EMAIL],
  ].filter(([, value]) => !String(value || "").trim()).map(([key]) => key);

  if (missingConfiguration.length) {
    return {
      status: 503,
      body: {
        ...base,
        error: "dat_credentials_not_configured",
        missing_configuration: missingConfiguration,
        auth_model: "organization_service_account_plus_user_identity",
      },
    };
  }

  if (!String(env.DAT_API_BASE_URL || "").trim()) {
    return {
      status: 503,
      body: {
        ...base,
        error: "dat_api_contract_not_configured",
        next_gate: "Configure only the DAT Developer Portal base URL and endpoint contract supplied for the approved integration.",
      },
    };
  }

  return {
    status: 503,
    body: {
      ...base,
      error: "dat_endpoint_mapping_pending",
      intended_visibility: isTrue(env.HERMES_DAT_PUBLIC_DISPLAY_APPROVED) ? "public" : "carrier_only",
      certification_required_for_production: true,
      certification_approved: isTrue(env.HERMES_DAT_CERTIFIED),
      next_gate: "Map the exact Developer Portal load-search contract and complete DAT non-production certification; do not infer undocumented endpoints.",
      scraping_used: false,
      write_or_book_performed: false,
    },
  };
}
