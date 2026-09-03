import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (path) => readFile(join(root, path), "utf8");

const jpegDimensions = (buffer) => {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = buffer.readUInt16BE(offset + 2);
    if (!length || length < 2) break;
    offset += 2 + length;
  }
  throw new Error("Could not read JPEG dimensions");
};

console.log("Running Hermes Connect social card contract...");

const layout = await text("src/layouts/BaseLayout.astro");
assert(layout.includes('Astro.url.pathname === "/services/hermes-connect/"'), "BaseLayout must identify the canonical Hermes Connect product hub.");
assert(layout.includes('"/images/hermes-connect-social-card.jpg"'), "Hermes Connect must use its dedicated social card rather than the generic ecosystem hero.");
assert(layout.includes("socialImageAlt"), "Hermes Connect social image must have route-specific alt text.");

const card = await readFile(join(root, "public/images/hermes-connect-social-card.jpg"));
assert(card[0] === 0xff && card[1] === 0xd8, "Hermes Connect social card must be a JPEG.");
const dimensions = jpegDimensions(card);
assert(dimensions.width === 2200 && dimensions.height === 1238, `Hermes Connect social card must match shared OG metadata dimensions; got ${dimensions.width}x${dimensions.height}.`);

console.log("Hermes Connect dedicated social card contract passed.");
