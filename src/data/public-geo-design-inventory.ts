export type PublicSurfaceClass =
  | "public_indexable"
  | "public_noindex"
  | "demo_preview"
  | "connect_private_excluded";

export type PublicFamily =
  | "home"
  | "four_directions"
  | "logistics"
  | "marketing"
  | "academy_public"
  | "technology"
  | "services"
  | "resources"
  | "cases"
  | "trust_legal"
  | "careers"
  | "localized_public"
  | "hermes_connect_public"
  | "demo_preview"
  | "connect_private";

export type PublicGeoDesignState = {
  route: string;
  family: PublicFamily;
  purpose: string;
  surfaceClass: PublicSurfaceClass;
  geoStatus: "baseline" | "review_required" | "excluded";
  designStatus: "approved_baseline" | "family_review_required" | "excluded";
  mobileStatus: "review_required" | "covered_by_family" | "excluded";
  duplicateCandidate: boolean;
  action: "audit_and_converge" | "truth_review_only" | "classify_only" | "do_not_modify";
};

const PUBLIC_CONNECT_ROUTES = new Set([
  "/services/hermes-connect/",
  "/services/hermes-connect/repair-shops/",
  "/services/hermes-connect/ai-command-center/",
  "/services/hermes-connect/business-automation/",
  "/services/hermes-connect/load-analyzer/",
  "/services/hermes-connect/proposal-builder/",
  "/services/hermes-connect/rate-negotiator/",
  "/services/hermes-connect/roi-calculator/",
  "/services/hermes-connect/unified-inbox/",
]);

const normalizeRoute = (route: string) => {
  const withoutQuery = route.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "/") return "/";
  return `/${withoutQuery.replace(/^\/+|\/+$/g, "")}/`;
};

export const isConnectPrivateRoute = (route: string) => {
  const normalized = normalizeRoute(route);
  return normalized.startsWith("/services/hermes-connect/") && !PUBLIC_CONNECT_ROUTES.has(normalized);
};

export const classifyPublicRoute = (route: string): PublicGeoDesignState => {
  const normalized = normalizeRoute(route);

  if (isConnectPrivateRoute(normalized)) {
    return {
      route: normalized,
      family: "connect_private",
      purpose: "Hermes Connect authenticated/private product surface owned by the Connect product stream",
      surfaceClass: "connect_private_excluded",
      geoStatus: "excluded",
      designStatus: "excluded",
      mobileStatus: "excluded",
      duplicateCandidate: false,
      action: "do_not_modify",
    };
  }

  if (normalized.startsWith("/demos/")) {
    return {
      route: normalized,
      family: "demo_preview",
      purpose: "Preview, compatibility, or evidence surface; never a production public owner by default",
      surfaceClass: "demo_preview",
      geoStatus: "review_required",
      designStatus: "family_review_required",
      mobileStatus: "review_required",
      duplicateCandidate: true,
      action: "classify_only",
    };
  }

  if (PUBLIC_CONNECT_ROUTES.has(normalized)) {
    return {
      route: normalized,
      family: "hermes_connect_public",
      purpose: "Public Hermes Connect representation; product internals remain out of scope",
      surfaceClass: "public_indexable",
      geoStatus: "review_required",
      designStatus: "family_review_required",
      mobileStatus: "review_required",
      duplicateCandidate: false,
      action: "truth_review_only",
    };
  }

  if (normalized === "/") {
    return {
      route: normalized,
      family: "home",
      purpose: "Hermes master-brand entrance and Four Directions decision surface",
      surfaceClass: "public_indexable",
      geoStatus: "review_required",
      designStatus: "approved_baseline",
      mobileStatus: "review_required",
      duplicateCandidate: false,
      action: "audit_and_converge",
    };
  }

  if (normalized.startsWith("/paths/")) {
    return {
      route: normalized,
      family: "four_directions",
      purpose: "MOVE / GROW / LEARN / BUILD public direction owner or decision route",
      surfaceClass: "public_indexable",
      geoStatus: "review_required",
      designStatus: "family_review_required",
      mobileStatus: "review_required",
      duplicateCandidate: false,
      action: "audit_and_converge",
    };
  }

  const family: PublicFamily =
    normalized.startsWith("/logistics/") || normalized === "/carrier/" || normalized === "/load-board/"
      ? "logistics"
      : normalized.startsWith("/academy/")
        ? "academy_public"
        : normalized.startsWith("/case/")
          ? "cases"
          : normalized.startsWith("/resources/")
            ? "resources"
            : normalized.startsWith("/careers/")
              ? "careers"
              : /^\/(ua|ru|es|it|fr)\//.test(normalized)
                ? "localized_public"
                : ["/privacy/", "/privacy-choices/", "/regional-privacy/", "/terms/", "/accessibility/", "/data-security/", "/legal-compliance/", "/payments-cancellations/", "/asset-licensing/", "/editorial-policy/", "/company-information/", "/contacts/", "/about/"].includes(normalized)
                  ? "trust_legal"
                  : normalized.startsWith("/services/")
                    ? "services"
                    : "services";

  return {
    route: normalized,
    family,
    purpose: "Canonical public Hermes page requiring GEO and Design OS family review",
    surfaceClass: "public_indexable",
    geoStatus: "review_required",
    designStatus: "family_review_required",
    mobileStatus: "review_required",
    duplicateCandidate: false,
    action: "audit_and_converge",
  };
};

export const publicGeoDesignExecutionOrder: PublicFamily[] = [
  "home",
  "four_directions",
  "logistics",
  "marketing",
  "academy_public",
  "technology",
  "services",
  "resources",
  "cases",
  "trust_legal",
  "careers",
  "localized_public",
  "hermes_connect_public",
  "demo_preview",
];

export const publicGeoDesignGuardrails = {
  masterBrand: "Hermes",
  directions: ["Hermes Logistics", "Hermes Marketing", "Hermes Academy", "Hermes Technology"],
  publicDesignCanon: ["Pearl Outside", "Violet Intelligence", "one Hermes Design OS"],
  connectBoundary: "Public representation may be audited; Hermes Connect application code is excluded.",
  seoBoundary: "GEO/public truth and design convergence only; do not run a parallel SEO experiment stream.",
  visualApproval: "Material public visual changes require clickable Preview, desktop QA, 390px QA, and CEO approval before merge.",
  truthBoundary: "Engineering readiness is not search, analytics, AI recommendation, revenue, or live-product proof.",
} as const;
