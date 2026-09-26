import { readFile, writeFile, mkdir, mkdtemp, rm, copyFile, rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { sha256, PILOT_IDS } from "./lib/product-images.mjs";
import { GALLERY_RECIPE, gallerySizes, galleryPath, renderGallery } from "./lib/gallery-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (["--source-dir", "--replacement-dir", "--ids"].includes(args[i])) i++;
  else if (args[i] !== "--pilot") throw new Error(`Unknown option: ${args[i]}`);
}
const directory = (flag) => {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Provide ${flag}`);
  return path.resolve(args[index + 1]);
};
const roots = { archive: directory("--source-dir"), verified: directory("--replacement-dir") };
const inventory = JSON.parse(await readFile(path.join(root, "docs/images/gallery-sources.json"), "utf8"));
if (args.includes("--pilot") && args.includes("--ids")) throw new Error("Choose --pilot or --ids");
const selectedIds = args.includes("--pilot") ? PILOT_IDS : args.includes("--ids") ? args[args.indexOf("--ids") + 1]?.split(",") : inventory.products.map((p) => p.id);
if (!selectedIds?.length || new Set(selectedIds).size !== selectedIds.length || selectedIds.some((id) => !inventory.products.some((p) => p.id === id))) throw new Error("Unknown or duplicate gallery IDs");
const sources = inventory.products.filter((p) => selectedIds.includes(p.id));
const manifestPath = path.join(root, "docs/images/gallery-outputs.json");
let previous = { products: [] };
try { previous = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (sources.length !== inventory.products.length && previous.recipe && (JSON.stringify(previous.recipe) !== JSON.stringify(GALLERY_RECIPE) || JSON.stringify(previous.encoder) !== JSON.stringify(sharp.versions))) throw new Error("Regenerate all images after a recipe or encoder change");
const outputs = new Map(previous.products.map((p) => [p.id, p]));
const stage = await mkdtemp(path.join(tmpdir(), "aleatur-gallery-build-"));
try {
  const paths = new Map();
  for (const source of sources) {
    const dir = roots[source.collection];
    if (!dir) throw new Error(`Unknown collection: ${source.id}`);
    const input = path.resolve(dir, source.file);
    if (!input.startsWith(dir + path.sep)) throw new Error(`Source escapes directory: ${source.id}`);
    if (sha256(await readFile(input)) !== source.sha256) throw new Error(`Source checksum mismatch: ${source.id}`);
    paths.set(source.id, input);
  }
  for (let offset = 0; offset < sources.length; offset += 50) {
    const batch = sources.slice(offset, offset + 50);
    let next = 0;
    const results = await Promise.allSettled(Array.from({ length: Math.min(3, batch.length) }, async () => {
      while (next < batch.length) {
        const source = batch[next++];
        const input = await readFile(paths.get(source.id));
        if (sha256(input) !== source.sha256) throw new Error(`Source changed during generation: ${source.id}`);
        const files = [];
        for (const size of gallerySizes(source.crop)) for (const format of ["avif", "webp"]) {
          const bytes = await renderGallery(input, source, size, format);
          const name = galleryPath(source.id, size.edge, format);
          await writeFile(path.join(stage, path.basename(name)), bytes);
          files.push({ path: name, ...size, format, bytes: bytes.length, sha256: sha256(bytes), alpha: source.alpha });
        }
        outputs.set(source.id, { id: source.id, sourceSha256: source.sha256, crop: source.crop, alpha: source.alpha, files });
      }
    }));
    const failure = results.find((r) => r.status === "rejected");
    if (failure) throw failure.reason;
    console.log(`Prepared gallery batch ${Math.floor(offset / 50) + 1}: ${batch.length} products`);
  }
  await mkdir(path.join(root, "public/products/gallery"), { recursive: true });
  for (const source of sources) for (const file of outputs.get(source.id).files) await copyFile(path.join(stage, path.basename(file.path)), path.join(root, "public", file.path));
  // Remove only obsolete generated files attributed to this requested batch.
  const currentFiles = new Set([...outputs.values()].flatMap((p) => p.files.map((f) => f.path)));
  for (const product of previous.products.filter((p) => selectedIds.includes(p.id))) for (const file of product.files) {
    if (!currentFiles.has(file.path)) {
      if (!new RegExp(`^products/gallery/${product.id}-[0-9]+\\.(avif|webp)$`).test(file.path)) throw new Error("Invalid previous gallery path");
      await rm(path.join(root, "public", file.path), { force: true });
    }
  }
  const products = [...outputs.values()].sort((a, b) => a.id.localeCompare(b.id));
  const availability = Object.fromEntries(products.map((p) => {
    const source = inventory.products.find((s) => s.id === p.id);
    return [p.id, { width: source.crop.width, height: source.crop.height, alpha: source.alpha, ...(source.background ? { background: source.background } : {}), sizes: p.files.filter((f) => f.format === "avif").map(({ edge, width, height }) => [edge, width, height]) }];
  }));
  for (const [file, value] of [[manifestPath, { schemaVersion: 1, recipe: GALLERY_RECIPE, encoder: sharp.versions, products }], [path.join(root, "src/data/product-gallery.json"), availability]]) {
    await writeFile(file + ".tmp", JSON.stringify(value, null, file === manifestPath ? 2 : 0) + "\n");
    await rename(file + ".tmp", file);
  }
  console.log(`Gallery ready for ${products.length} products. Canonical pairs remain unchanged.`);
} finally { await rm(stage, { recursive: true, force: true }); }
