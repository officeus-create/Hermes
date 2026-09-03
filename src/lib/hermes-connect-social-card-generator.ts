import { deflateSync } from "node:zlib";
import { HERMES_CONNECT_SOCIAL_CARD } from "../data/hermes-connect-social-card.ts";

type Rgb = readonly [number, number, number];

const COLORS = {
  pearl: [247, 246, 243] as Rgb,
  paper: [255, 255, 255] as Rgb,
  obsidian: [11, 13, 18] as Rgb,
  graphite: [32, 35, 44] as Rgb,
  muted: [102, 108, 121] as Rgb,
  line: [222, 221, 218] as Rgb,
  logistics: [30, 136, 255] as Rgb,
  marketing: [0, 200, 83] as Rgb,
  academy: [124, 92, 255] as Rgb,
  technology: [255, 122, 0] as Rgb,
} as const;

const FONT: Record<string, readonly string[]> = {
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  B: ["11110","10001","10001","11110","10001","10001","11110"],
  C: ["01111","10000","10000","10000","10000","10000","01111"],
  D: ["11110","10001","10001","10001","10001","10001","11110"],
  E: ["11111","10000","10000","11110","10000","10000","11111"],
  F: ["11111","10000","10000","11110","10000","10000","10000"],
  G: ["01111","10000","10000","10111","10001","10001","01111"],
  H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["11111","00100","00100","00100","00100","00100","11111"],
  J: ["00111","00010","00010","00010","10010","10010","01100"],
  K: ["10001","10010","10100","11000","10100","10010","10001"],
  L: ["10000","10000","10000","10000","10000","10000","11111"],
  M: ["10001","11011","10101","10101","10001","10001","10001"],
  N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  Q: ["01110","10001","10001","10001","10101","10010","01101"],
  R: ["11110","10001","10001","11110","10100","10010","10001"],
  S: ["01111","10000","10000","01110","00001","00001","11110"],
  T: ["11111","00100","00100","00100","00100","00100","00100"],
  U: ["10001","10001","10001","10001","10001","10001","01110"],
  V: ["10001","10001","10001","10001","10001","01010","00100"],
  W: ["10001","10001","10001","10101","10101","10101","01010"],
  X: ["10001","10001","01010","00100","01010","10001","10001"],
  Y: ["10001","10001","01010","00100","00100","00100","00100"],
  Z: ["11111","00001","00010","00100","01000","10000","11111"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buffer: Uint8Array) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, data: Uint8Array) => {
  const typeBytes = Buffer.from(type, "ascii");
  const payload = Buffer.from(data);
  const out = Buffer.alloc(12 + payload.length);
  out.writeUInt32BE(payload.length, 0);
  typeBytes.copy(out, 4);
  payload.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBytes, payload])), 8 + payload.length);
  return out;
};

export const createHermesConnectSocialCardPng = (): Uint8Array => {
  const { width, height } = HERMES_CONNECT_SOCIAL_CARD;
  const pixels = Buffer.alloc(width * height * 3);

  const setPixel = (x: number, y: number, color: Rgb) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const offset = (y * width + x) * 3;
    pixels[offset] = color[0];
    pixels[offset + 1] = color[1];
    pixels[offset + 2] = color[2];
  };

  const rect = (x: number, y: number, w: number, h: number, color: Rgb) => {
    const x2 = Math.min(width, x + w);
    const y2 = Math.min(height, y + h);
    for (let yy = Math.max(0, y); yy < y2; yy += 1) {
      for (let xx = Math.max(0, x); xx < x2; xx += 1) setPixel(xx, yy, color);
    }
  };

  const text = (value: string, x: number, y: number, scale: number, color: Rgb, tracking = 1) => {
    let cursor = x;
    for (const raw of value.toUpperCase()) {
      const glyph = FONT[raw] ?? FONT[" "];
      glyph.forEach((row, gy) => {
        [...row].forEach((bit, gx) => {
          if (bit === "1") rect(cursor + gx * scale, y + gy * scale, scale, scale, color);
        });
      });
      cursor += (5 + tracking) * scale;
    }
  };

  rect(0, 0, width, height, COLORS.pearl);
  rect(0, 0, width, 242, COLORS.obsidian);
  text("HERMES CONNECT", 142, 66, 22, COLORS.paper, 1);
  text("ONE ACCOUNT CONNECTED BUSINESS", 146, 382, 9, COLORS.graphite, 1);
  text("ADAPTIVE AI OPERATING SYSTEM", 146, 482, 7, COLORS.muted, 1);

  const lanes = [
    ["LOGISTICS", COLORS.logistics],
    ["MARKETING", COLORS.marketing],
    ["ACADEMY", COLORS.academy],
    ["TECHNOLOGY", COLORS.technology],
  ] as const;

  lanes.forEach(([label, accent], index) => {
    const x = 146 + index * 476;
    rect(x, 760, 414, 162, COLORS.paper);
    rect(x, 760, 16, 162, accent);
    rect(x, 758, 414, 2, COLORS.line);
    rect(x, 922, 414, 2, COLORS.line);
    text(label, x + 54, 814, 5, COLORS.obsidian, 1);
  });

  text("PEARL OUTSIDE OBSIDIAN INSIDE", 146, 1050, 5, COLORS.muted, 1);

  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (1 + width * 3);
    raw[rawOffset] = 0;
    pixels.copy(raw, rawOffset + 1, y * width * 3, (y + 1) * width * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};
