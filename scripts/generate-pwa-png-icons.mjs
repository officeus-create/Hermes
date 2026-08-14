import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    cTable[n] = c;
  }
  return cTable;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcBuf = Buffer.alloc(4 + len);
  buf.copy(crcBuf, 0, 4, 8 + len);
  const crcVal = crc32(crcBuf);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image pixels (RGB: 3 bytes per pixel + 1 filter byte per scanline)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  const bgR = 0x0B, bgG = 0x0D, bgB = 0x12; // Obsidian dark
  const brandR = 0x25, brandG = 0x63, brandB = 0xEB; // Iris Blue
  const accentR = 0xF7, accentG = 0xF6, accentB = 0xF3; // Pearl

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * 0.4;
  const innerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= innerR) {
        // Center core Pearl
        rawData[pxOffset] = accentR;
        rawData[pxOffset + 1] = accentG;
        rawData[pxOffset + 2] = accentB;
      } else if (dist <= outerR) {
        // Brand ring Iris Blue
        rawData[pxOffset] = brandR;
        rawData[pxOffset + 1] = brandG;
        rawData[pxOffset + 2] = brandB;
      } else {
        // Obsidian background
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const targetDir = path.resolve('public/demos/hermes-connect-brand-v1');

const sizes = [
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
  { name: 'icon-192.png', width: 192, height: 192 },
  { name: 'icon-512.png', width: 512, height: 512 }
];

for (const s of sizes) {
  const pngBuf = generatePNG(s.width, s.height);
  const filePath = path.join(targetDir, s.name);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated ${s.name} (${s.width}x${s.height}, ${pngBuf.length} bytes) at ${filePath}`);
}
