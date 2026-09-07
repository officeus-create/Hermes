import { expect, test } from "@playwright/test";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const CONNECT_ROUTE_ROOT = "/services/hermes-connect";
const CONNECT_DIST_ROOT = path.join(process.cwd(), "dist", "services", "hermes-connect");

function collectBuiltHtml(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    if (statSync(absolute).isDirectory()) files.push(...collectBuiltHtml(absolute));
    else if (entry.endsWith(".html")) files.push(absolute);
  }
  return files;
}

function routeFromBuiltFile(file: string) {
  const relative = path.relative(CONNECT_DIST_ROOT, file).split(path.sep).join("/");
  if (relative === "index.html") return `${CONNECT_ROUTE_ROOT}/`;
  if (relative.endsWith("/index.html")) return `${CONNECT_ROUTE_ROOT}/${relative.slice(0, -"index.html".length)}`;
  return `${CONNECT_ROUTE_ROOT}/${relative.replace(/\.html$/, "/")}`;
}

const has = (html: string, pattern: RegExp) => pattern.test(html);

test("every built Hermes Connect route is owned by the shared Design OS shell", async ({ request }) => {
  expect(existsSync(CONNECT_DIST_ROOT), "Hermes Connect dist tree must exist before the all-routes Design OS gate runs").toBe(true);

  const routes = collectBuiltHtml(CONNECT_DIST_ROOT).map(routeFromBuiltFile).sort();
  expect(routes.length, "The all-routes gate must discover at least one built Hermes Connect route").toBeGreaterThan(0);

  const failures: string[] = [];

  for (const route of routes) {
    const response = await request.get(route, { failOnStatusCode: false });
    if (!response.ok()) {
      failures.push(`${route}: HTTP ${response.status()}`);
      continue;
    }

    const html = await response.text();
    const checks: Array<[string, boolean]> = [
      ["canonical Design OS stylesheet", has(html, /<link[^>]+href=["'][^"']*design-owner-polish\.css["'][^>]*>/i)],
      ["canonical Design OS runtime", has(html, /<script[^>]+src=["'][^"']*design-owner-polish\.js["'][^>]*>/i)],
      ["Hermes Connect product-priority runtime", has(html, /<script[^>]+src=["'][^"']*hermes-connect-product-priority\.js["'][^>]*>/i)],
      ["responsive viewport", has(html, /<meta[^>]+name=["']viewport["'][^>]*>/i)],
      ["canonical URL", has(html, /<link[^>]+rel=["']canonical["'][^>]*>/i)],
      ["shared skip link", has(html, /class=["'][^"']*skip-link[^"']*["']/i)],
      ["canonical Hermes Connect language owner", html.includes("hermes-connect-language") && html.includes("[data-language-menu] a[lang]")],
    ];

    for (const [name, passed] of checks) {
      if (!passed) failures.push(`${route}: missing ${name}`);
    }
  }

  expect(
    failures,
    `All-routes Design OS conformity failed for ${failures.length} ownership checks across ${routes.length} built Hermes Connect routes:\n${failures.join("\n")}`,
  ).toEqual([]);
});
