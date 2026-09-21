import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { sha256 } from "./lib/product-images.mjs";
import { GALLERY_RECIPE, gallerySizes, galleryPath } from "./lib/gallery-images.mjs";

export async function validateGallery({ catalog, inventory, manifest, availability, publicDir }) {
  const ids = catalog.map((p) => p.id).sort();
  assert.deepEqual(inventory.products.map((p) => p.id).sort(), ids, "Gallery source IDs must match catalog");
  assert.deepEqual(manifest.products.map((p) => p.id).sort(), ids, "Gallery outputs must match catalog");
  assert.deepEqual(Object.keys(availability).sort(), ids, "Gallery availability must match catalog");
  assert.deepEqual(manifest.recipe, GALLERY_RECIPE, "Gallery recipe changed");
  const expected = [];
  for (const output of manifest.products) {
    const source = inventory.products.find((p) => p.id === output.id);
    assert.equal(output.sourceSha256, source.sha256, `Source mismatch: ${output.id}`);
    assert.equal(source.reviewed, true, `Visual review missing: ${output.id}`);
    assert.ok(source.crop.left >= 0 && source.crop.top >= 0 && source.crop.width > 0 && source.crop.height > 0 && source.crop.left + source.crop.width <= source.width && source.crop.top + source.crop.height <= source.height, `Invalid crop: ${output.id}`);
    assert.deepEqual(output.crop, source.crop, `Gallery framing changed: ${output.id}`);
    assert.equal(output.alpha, source.alpha, `Gallery alpha policy changed: ${output.id}`);
    if (source.collection === "verified") {
      assert.equal(source.provenance.decision, "accepted");
      for (const key of ["pageUrl", "assetUrl", "retrievedAt", "match", "usagePermission", "previousSha256"]) assert.ok(source.provenance[key], `Missing provenance ${key}: ${output.id}`);
    }
    const sizes = gallerySizes(source.crop);
    assert.deepEqual(availability[output.id], { width: source.crop.width, height: source.crop.height, alpha: source.alpha, ...(source.background ? { background: source.background } : {}), sizes: sizes.map(({ edge, width, height }) => [edge, width, height]) }, `Stale dimensions: ${output.id}`);
    const names = sizes.flatMap((s) => ["avif", "webp"].map((format) => galleryPath(output.id, s.edge, format)));
    assert.deepEqual(output.files.map((f) => f.path), names, `Gallery pairs incomplete: ${output.id}`);
    for (const file of output.files) {
      const size = sizes.find((s) => s.edge === file.edge);
      assert.equal(file.width, size.width); assert.equal(file.height, size.height);
      assert.equal(file.alpha, source.alpha);
      const bytes = await readFile(path.join(publicDir, file.path));
      assert.equal(bytes.length, file.bytes); assert.equal(sha256(bytes), file.sha256, `Gallery checksum mismatch: ${file.path}`);
      const m = await sharp(bytes).metadata();
      assert.equal(m.width, file.width); assert.equal(m.height, file.height);
      assert.equal(m.hasAlpha, source.alpha, `Unreviewed transparency: ${file.path}`);
      assert.equal(m.format, file.format === "avif" ? "heif" : "webp");
      await sharp(bytes).raw().toBuffer();
      expected.push(path.basename(file.path));
    }
  }
  assert.deepEqual((await readdir(path.join(publicDir, "products/gallery"))).sort(), expected.sort(), "Missing or stale gallery files");
  return { products: ids.length, files: expected.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const json = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
  const result = await validateGallery({ catalog: await json("src/data/catalog.generated.json"), inventory: await json("docs/images/gallery-sources.json"), manifest: await json("docs/images/gallery-outputs.json"), availability: await json("src/data/product-gallery.json"), publicDir: path.join(root, "public") });
  console.log(`Validated ${result.files} gallery files for ${result.products} products; dimensions, alpha, provenance and checksums checked.`);
}
