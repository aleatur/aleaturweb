import sharp from "sharp";
import { createHash } from "node:crypto";

export const IMAGE_RECIPE = {
  version: 1,
  widths: [160, 320, 480, 800],
  subjectRatio: 0.88,
  background: "#ffffff",
  avif: { quality: 58, effort: 5, chromaSubsampling: "4:4:4" },
  webp: { quality: 84, effort: 5, smartSubsample: true },
};
export const PILOT_IDS = ["ALE-0001", "ALE-0161", "ALE-0039", "ALE-0107", "ALE-0112", "ALE-0269", "ALE-0129", "ALE-0242", "ALE-0260", "ALE-0200", "ALE-0065", "ALE-0279"];
export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

// Only this reviewed source has a flat grey surround. Flood from the outside;
// never recolor enclosed label details or apply a global white/color adjustment.
function cleanEdgeBackground(data, width, height) {
  const seen = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let end = 0;
  function add(x, y) {
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    const rgb = data.subarray(p * 3, p * 3 + 3);
    if (Math.min(...rgb) >= 242 && Math.max(...rgb) - Math.min(...rgb) <= 5) queue[end++] = p;
  }
  for (let x = 0; x < width; x++) { add(x, 0); add(x, height - 1); }
  for (let y = 0; y < height; y++) { add(0, y); add(width - 1, y); }
  for (let start = 0; start < end; start++) {
    const p = queue[start], x = p % width, y = Math.floor(p / width);
    data.fill(255, p * 3, p * 3 + 3);
    if (x) add(x - 1, y);
    if (x + 1 < width) add(x + 1, y);
    if (y) add(x, y - 1);
    if (y + 1 < height) add(x, y + 1);
  }
}

export async function prepareSource(input, { cleanBackground = false } = {}) {
  const { data, info } = await sharp(input).autoOrient().flatten({ background: "#fff" }).toColourspace("srgb").removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (cleanBackground) cleanEdgeBackground(data, info.width, info.height);
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const p = (y * info.width + x) * 3;
      if (Math.min(data[p], data[p + 1], data[p + 2]) < 245) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left) throw new Error("Source contains no detectable product");
  // A small safety margin retains antialiased edges and faint reflections.
  const margin = Math.max(3, Math.ceil(Math.max(info.width, info.height) * 0.005));
  left = Math.max(0, left - margin); top = Math.max(0, top - margin);
  right = Math.min(info.width - 1, right + margin); bottom = Math.min(info.height - 1, bottom + margin);
  const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
  const pixels = await sharp(data, { raw: info }).extract(crop).png().toBuffer();
  return { pixels, crop };
}

export async function renderVariant(pixels, width, format) {
  const area = Math.round(width * IMAGE_RECIPE.subjectRatio);
  const { data, info } = await sharp(pixels).resize(area, area, { fit: "inside" }).png().toBuffer({ resolveWithObject: true });
  return sharp({ create: { width, height: width, channels: 3, background: "#fff" } })
    .composite([{ input: data, left: Math.floor((width - info.width) / 2), top: Math.floor((width - info.height) / 2) }])
    .removeAlpha()
    [format](IMAGE_RECIPE[format]).toBuffer();
}

export function variantPath(id, width, format) {
  return width === 800 ? `products/${id}.${format}` : `products/responsive/${id}-${width}.${format}`;
}
