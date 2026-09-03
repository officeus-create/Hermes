import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HERMES_CONNECT_SOCIAL_CARD } from "../src/data/hermes-connect-social-card.ts";
import { createHermesConnectSocialCardPng } from "../src/lib/hermes-connect-social-card-generator.ts";

const root = new URL("../", import.meta.url).pathname;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (path) => readFile(join(root, path), "utf8");

console.log("Running Hermes Connect social card contract...");

const layout = await text("src/layouts/BaseLayout.astro");
assert(layout.includes('Astro.url.pathname === "/services/hermes-connect/"'), "BaseLayout must identify the canonical Hermes Connect product hub.");
assert(layout.includes("HERMES_CONNECT_SOCIAL_CARD.path"), "Hermes Connect hub must use its dedicated social card instead of the generic ecosystem hero.");
assert(layout.includes('useHermesConnectSocialCard ? "image/png" : "image/jpeg"'), "BaseLayout must advertise the correct social image MIME type without changing other routes.");
assert(layout.includes("socialImageAlt"), "Hermes Connect social image must have route-specific alt text.");

const endpoint = await text("src/pages/images/hermes-connect-social-card.png.ts");
assert(endpoint.includes("export const prerender = true"), "Hermes Connect social card endpoint must be pre-rendered into a static asset.");
assert(endpoint.includes('"Content-Type": "image/png"'), "Hermes Connect social card endpoint must return PNG content type.");
assert(endpoint.includes("hermes-connect-social-card-generator"), "Hermes Connect route must keep the Node PNG generator behind the prerender boundary.");

const runtimeMetadata = await text("src/lib/hermes-connect-social-card.ts");
assert(!runtimeMetadata.includes("node:zlib"), "Runtime social metadata module must remain Node-free for Cloudflare SSR compatibility.");

const card = Buffer.from(createHermesConnectSocialCardPng());
assert(card.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "Hermes Connect social card must be a valid PNG.");
assert(card.toString("ascii", 12, 16) === "IHDR", "Hermes Connect social card must expose PNG IHDR metadata.");
const width = card.readUInt32BE(16);
const height = card.readUInt32BE(20);
assert(width === HERMES_CONNECT_SOCIAL_CARD.width && height === HERMES_CONNECT_SOCIAL_CARD.height, `Hermes Connect social card dimensions mismatch: ${width}x${height}.`);
assert(width === 2200 && height === 1238, "Hermes Connect social card must match existing shared OG dimensions 2200x1238.");

const generator = await text("src/lib/hermes-connect-social-card-generator.ts");
for (const token of ["30, 136, 255", "0, 200, 83", "124, 92, 255", "255, 122, 0"]) {
  assert(generator.includes(token), `Hermes Connect social card must retain canonical division color ${token}.`);
}
assert(!generator.toLowerCase().includes("beauty:"), "Hermes Connect social card must not invent a canonical Beauty accent.");

console.log("Hermes Connect dedicated social card contract passed.");
