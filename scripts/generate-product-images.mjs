#!/usr/bin/env node
import { readFile, writeFile, mkdir, mkdtemp, rm, rename, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { IMAGE_RECIPE, PILOT_IDS, prepareSource, renderVariant, sha256, variantPath } from "./lib/product-images.mjs";
import { isPathInside, resolveImageSource } from "./lib/image-source-paths.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const directoryFlags = new Set(["--source-dir", "--replacement-dir", "--acquired-dir", "--ids"]);
for (let index = 0; index < args.length; index++) {
  if (directoryFlags.has(args[index])) {
    if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Provide a value for ${args[index]}`);
    index++;
  }
  else if (args[index] !== "--pilot") throw new Error(`Unknown option: ${args[index]}`);
}
const option = (flag) => {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : path.resolve(args[index + 1]);
};
const roots = { archive: option("--source-dir"), verified: option("--replacement-dir"), acquired: option("--acquired-dir") };
if (!Object.values(roots).some(Boolean)) throw new Error("Provide at least one source directory; acquired originals use --acquired-dir.");
const inventory = JSON.parse(await readFile(path.join(root, "docs/images/sources.json"), "utf8"));
const idsIndex = args.indexOf("--ids");
const ids = args.includes("--pilot") ? PILOT_IDS : idsIndex >= 0 ? args[idsIndex + 1]?.split(",") : inventory.products.map((p) => p.id);
if (!ids?.length || ids.some((id) => !inventory.products.some((p) => p.id === id)) || new Set(ids).size !== ids.length) throw new Error("Unknown or duplicate image IDs");
const manifestPath = path.join(root, "docs/images/outputs.json");
let previous = { products: [] };
try { previous = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (previous.recipe && (JSON.stringify(previous.recipe) !== JSON.stringify(IMAGE_RECIPE) || JSON.stringify(previous.encoder) !== JSON.stringify(sharp.versions)) && previous.products.some((p) => !ids.includes(p.id))) {
  throw new Error("Recipe or encoder changed; regenerate the complete inventory instead of mixing toolchains");
}
const outputs = new Map(previous.products.map((p) => [p.id, p]));
const stage = await mkdtemp(path.join(tmpdir(), "aleatur-image-build-"));
try {
  // Verify the complete requested source batch before touching any published asset.
  const sourcePaths = new Map();
  for (const id of ids) {
    const source = inventory.products.find((p) => p.id === id);
    const resolved = resolveImageSource(source, roots);
    const inputPath = await (await import("node:fs/promises")).realpath(resolved.inputPath);
    const sourceRoot = await (await import("node:fs/promises")).realpath(resolved.root);
    if (!isPathInside(sourceRoot, inputPath)) throw new Error(`Source escapes directory through a link: ${id}`);
    sourcePaths.set(id, inputPath);
    if (sha256(await readFile(inputPath)) !== source.sha256) throw new Error(`Source checksum mismatch: ${id}`);
  }
  for (let offset = 0; offset < ids.length; offset += 50) {
    const batch = ids.slice(offset, offset + 50);
    let next = 0;
    const results = await Promise.allSettled(Array.from({ length: Math.min(3, batch.length) }, async () => {
      while (next < batch.length) {
        const id = batch[next++];
        const source = inventory.products.find((p) => p.id === id);
        const input = await readFile(sourcePaths.get(id));
        if (sha256(input) !== source.sha256) throw new Error(`Source changed during generation: ${id}`);
        const { pixels, crop } = await prepareSource(input, { cleanBackground: source.cleanBackground });
        if (JSON.stringify(crop) !== JSON.stringify(source.crop)) throw new Error(`Source framing changed: ${id}; review inventory first`);
        const widths = [...IMAGE_RECIPE.widths];
        if (source.allow1200 && Math.max(crop.width, crop.height) >= 1200 * IMAGE_RECIPE.subjectRatio) widths.push(1200);
        const files = [];
        for (const width of widths) {
          for (const format of ["avif", "webp"]) {
            const buffer = await renderVariant(pixels, width, format);
            const name = variantPath(id, width, format);
            await mkdir(path.dirname(path.join(stage, name)), { recursive: true });
            await writeFile(path.join(stage, name), buffer);
            files.push({ path: name, width, height: width, format, bytes: buffer.length, sha256: sha256(buffer) });
          }
        }
        outputs.set(id, { id, sourceSha256: source.sha256, files });
      }
    }));
    const failure = results.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;
    console.log(`Prepared batch ${Math.floor(offset / 50) + 1}: ${batch.length} products`);
  }
  // Promotion happens only after every requested product has encoded successfully.
  for (const id of ids) for (const file of outputs.get(id).files) {
    const target = path.join(root, "public", file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(stage, file.path), target);
  }
  const products = [...outputs.values()].sort((a, b) => a.id.localeCompare(b.id));
  const manifest = { schemaVersion: 1, recipe: IMAGE_RECIPE, encoder: sharp.versions, products };
  await writeFile(manifestPath + ".tmp", JSON.stringify(manifest, null, 2) + "\n");
  await rename(manifestPath + ".tmp", manifestPath);
  const availability = Object.fromEntries(products.map((p) => [p.id, p.files.filter((f) => f.format === "avif").map((f) => f.width)]));
  const availabilityPath = path.join(root, "src/data/product-image-widths.json");
  await writeFile(availabilityPath + ".tmp", JSON.stringify(availability) + "\n");
  await rename(availabilityPath + ".tmp", availabilityPath);
  console.log(`Generated ${ids.length} products; ${products.length} products now have responsive images.`);
} finally {
  await rm(stage, { recursive: true, force: true });
}
