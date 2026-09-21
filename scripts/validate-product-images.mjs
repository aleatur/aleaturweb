#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { IMAGE_RECIPE, sha256, variantPath } from "./lib/product-images.mjs";

export async function validateProductImages({ catalog, inventory, manifest, availability, publicDir, allowPartial = false }) {
  const ids = catalog.map((p) => p.id).sort();
  assert.deepEqual(inventory.products.map((p) => p.id).sort(), ids, "Source inventory must match catalog IDs exactly");
  const outputIds = manifest.products.map((p) => p.id).sort();
  assert.equal(new Set(outputIds).size, outputIds.length, "Duplicate output IDs");
  if (!allowPartial) assert.deepEqual(outputIds, ids, "Responsive output inventory is incomplete");
  assert.deepEqual(Object.keys(availability).sort(), outputIds, "Browser availability is stale");
  assert.deepEqual(manifest.recipe, IMAGE_RECIPE, "Encoder recipe is stale");
  const expected = [];
  for (const product of manifest.products) {
    const source = inventory.products.find((p) => p.id === product.id);
    assert.ok(source, `Unexpected image ID: ${product.id}`);
    assert.equal(product.sourceSha256, source.sha256, `Source changed: ${product.id}`);
    const widths = [...IMAGE_RECIPE.widths];
    if (source.allow1200) {
      assert.ok(Math.max(source.crop.width, source.crop.height) >= 1200 * IMAGE_RECIPE.subjectRatio, `Upscaled 1200 source: ${product.id}`);
      widths.push(1200);
    }
    assert.deepEqual(availability[product.id], widths, `Invalid sizes: ${product.id}`);
    const paths = widths.flatMap((width) => ["avif", "webp"].map((format) => variantPath(product.id, width, format)));
    assert.deepEqual(product.files.map((f) => f.path), paths, `Incomplete format/size pairs: ${product.id}`);
    for (const file of product.files) {
      const bytes = await readFile(path.join(publicDir, file.path));
      assert.equal(bytes.length, file.bytes, `Byte count mismatch: ${file.path}`);
      assert.equal(sha256(bytes), file.sha256, `Checksum mismatch: ${file.path}`);
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.format, file.format === "avif" ? "heif" : "webp", `Incorrect format: ${file.path}`);
      assert.equal(metadata.width, file.width, `Incorrect width: ${file.path}`);
      assert.equal(metadata.height, file.width, `Incorrect height: ${file.path}`);
      assert.equal(file.height, file.width);
      assert.equal(metadata.hasAlpha, false, `Unexpected transparency: ${file.path}`);
      // Metadata alone does not prove that the complete image decodes.
      await sharp(bytes).raw().toBuffer();
      if (file.width !== 800) expected.push(path.basename(file.path));
    }
  }
  const actual = await readdir(path.join(publicDir, "products/responsive"));
  assert.deepEqual(actual.sort(), expected.sort(), "Missing or stale responsive assets");
  return { products: outputIds.length, files: manifest.products.reduce((sum, p) => sum + p.files.length, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const json = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
  const result = await validateProductImages({
    catalog: await json("src/data/catalog.generated.json"), inventory: await json("docs/images/sources.json"),
    manifest: await json("docs/images/outputs.json"), availability: await json("src/data/product-image-widths.json"),
    publicDir: path.join(root, "public"), allowPartial: process.argv.includes("--allow-partial"),
  });
  console.log(`Validated and decoded ${result.files} images for ${result.products} products, including every checksum and responsive pair.`);
}
