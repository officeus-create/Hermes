import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

test("Load Board hero keeps its final layout while the rest of server HTML is delayed", async ({ page, baseURL }, testInfo) => {
  const html = readFileSync("dist/load-board/index.html", "utf8");
  const boundary = html.indexOf('<section class="load-board-role-router"');
  expect(boundary).toBeGreaterThan(0);
  let release!: () => void;
  const remainder = new Promise<void>((resolve) => { release = resolve; });
  const server = createServer(async (request, response) => {
    if (request.method !== "GET") { response.writeHead(405).end(); return; }
    if (request.url === "/load-board/") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.write(html.slice(0, boundary));
      await remainder;
      response.end(html.slice(boundary));
      return;
    }
    try {
      const upstream = await fetch(new URL(request.url || "/", baseURL));
      response.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "application/octet-stream" });
      response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch { response.writeHead(502).end(); }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Streaming fixture did not listen");
  try {
    await page.goto(`http://127.0.0.1:${address.port}/load-board/`, { waitUntil: "commit" });
    await expect(page.locator(".load-board-hero h1")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const geometry = () => page.locator(".load-board-hero").evaluate((hero) => {
      const heading = hero.querySelector("h1")!;
      const style = getComputedStyle(hero);
      const headingStyle = getComputedStyle(heading);
      return { padding: style.padding, height: hero.getBoundingClientRect().height,
        fontSize: headingStyle.fontSize, maxWidth: headingStyle.maxWidth };
    });
    const firstPaint = await geometry();
    release();
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    expect(await geometry()).toEqual(firstPaint);
    await expect(page.locator("[data-hero-transport-cta]")).toHaveAttribute("href", "/logistics/request-vehicle-transport/#transport-intake");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await testInfo.attach("load-board-first-paint", { body: await page.screenshot(), contentType: "image/png" });
  } finally {
    release();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
