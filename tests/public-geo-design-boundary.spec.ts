import { expect, test } from "@playwright/test";
import {
  classifyPublicRoute,
  isConnectPrivateRoute,
  publicGeoDesignExecutionOrder,
} from "../src/data/public-geo-design-inventory";

test("public GEO stream excludes authenticated Hermes Connect surfaces", () => {
  const privateRoutes = [
    "/services/hermes-connect/repair-shops/auth/",
    "/services/hermes-connect/repair-shops/booking/",
    "/services/hermes-connect/repair-shops/customers/",
    "/services/hermes-connect/repair-shops/dashboard/",
    "/services/hermes-connect/academy/auth/",
    "/services/hermes-connect/academy/dashboard/",
    "/services/hermes-connect/academy/reviewer/",
    "/services/hermes-connect/academy/submissions/",
  ];

  for (const route of privateRoutes) {
    expect(isConnectPrivateRoute(route)).toBe(true);
    expect(classifyPublicRoute(route)).toMatchObject({
      surfaceClass: "connect_private_excluded",
      action: "do_not_modify",
    });
  }
});

test("public Hermes and public Connect representation remain auditable", () => {
  const publicRoutes = [
    "/",
    "/paths/logistics/",
    "/paths/marketing/",
    "/paths/academy/",
    "/paths/technology/",
    "/services/hermes-connect/",
    "/services/hermes-connect/repair-shops/",
    "/services/hermes-connect/ai-command-center/",
  ];

  for (const route of publicRoutes) {
    expect(classifyPublicRoute(route).action).not.toBe("do_not_modify");
  }

  expect(publicGeoDesignExecutionOrder.slice(0, 2)).toEqual(["home", "four_directions"]);
});

test("demo surfaces cannot become canonical public owners by default", () => {
  expect(classifyPublicRoute("/demos/ai-visibility-scorecard/")).toMatchObject({
    surfaceClass: "demo_preview",
    action: "classify_only",
    duplicateCandidate: true,
  });
});
