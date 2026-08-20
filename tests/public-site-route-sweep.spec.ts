import { expect, test } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const distRoot = path.resolve(process.cwd(), "dist");

function walkHtml(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const absolute = path.join(dir, name);
    return statSync(absolute).isDirectory() ? walkHtml(absolute) : absolute.endsWith(".html") ? [absolute] : [];
  });
}

function routeFromHtml(file: string): string | null {
  const relative = path.relative(distRoot, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return null;
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function isOwnedPublicRoute(route: string) {
  return !route.startsWith("/services/hermes-connect/") && !route.startsWith("/demos/");
}

const publicRoutes = walkHtml(distRoot)
  .map(routeFromHtml)
  .filter((route): route is string => Boolean(route))
  .filter(isOwnedPublicRoute)
  .sort();

const stalePublicClaims = [
  "Hermes Connect · Prototype work started",
  "No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet",
];

test.describe("all generated public Hermes routes", () => {
  test.setTimeout(180_000);

  test("render without public-shell regressions", async ({ page }, testInfo) => {
    expect(publicRoutes.length, "The built site must expose public routes to audit.").toBeGreaterThan(20);

    const failures: string[] = [];
    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      const status = response?.status() ?? 0;
      if (status >= 400 || status === 0) {
        failures.push(`${route}: HTTP ${status || "unknown"}`);
        continue;
      }

      const result = await page.evaluate((claims) => {
        const bodyText = document.body.innerText;
        const main = document.querySelector("main");
        return {
          hasMain: Boolean(main),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          staleClaims: claims.filter((claim) => bodyText.includes(claim)),
        };
      }, stalePublicClaims);

      if (!result.hasMain) failures.push(`${route}: missing <main>`);
      if (result.overflow) failures.push(`${route}: horizontal overflow at ${testInfo.project.name}`);
      for (const claim of result.staleClaims) failures.push(`${route}: stale public claim: ${claim}`);
    }

    expect(
      failures,
      `Public route sweep failed for ${failures.length} issue(s) across ${publicRoutes.length} routes (${testInfo.project.name}).\n${failures.join("\n")}`,
    ).toEqual([]);
  });
});
