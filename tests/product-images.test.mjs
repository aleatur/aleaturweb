import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { prepareSource, renderVariant, sha256, IMAGE_RECIPE, variantPath } from "../scripts/lib/product-images.mjs";
import { validateProductImages } from "../scripts/validate-product-images.mjs";

test("framing preserves a complete, non-square subject including disconnected packaging", async () => {
  const subject = await sharp({ create: { width: 120, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
    { input: { create: { width: 30, height: 120, channels: 4, background: "#dc2020" } }, left: 20, top: 30 },
    { input: { create: { width: 20, height: 80, channels: 4, background: "#2030dc" } }, left: 80, top: 60 },
  ]).png().toBuffer();
  const prepared = await prepareSource(subject);
  assert.deepEqual(prepared.crop, { left: 17, top: 27, width: 86, height: 126 });
  for (const format of ["avif", "webp"]) {
    const output = await renderVariant(prepared.pixels, 160, format);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 160); assert.equal(info.height, 160);
    assert.ok(data.some((_, i) => i % 3 === 0 && data[i] > 180 && data[i + 2] < 80), "Red bottle remains");
    assert.ok(data.some((_, i) => i % 3 === 0 && data[i + 2] > 180 && data[i] < 80), "Blue packaging remains");
    assert.ok(data[0] > 250 && data[1] > 250 && data[2] > 250, "White canvas remains");
  }
});

test("background cleanup affects the connected surround, not enclosed light label details", async () => {
  const input = await sharp({ create: { width: 100, height: 100, channels: 3, background: "#f6f6f6" } }).composite([
    { input: { create: { width: 40, height: 60, channels: 3, background: "#222222" } }, left: 30, top: 20 },
    { input: { create: { width: 30, height: 50, channels: 3, background: "#f6f6f6" } }, left: 35, top: 25 },
  ]).png().toBuffer();
  const { pixels } = await prepareSource(input, { cleanBackground: true });
  const { data, info } = await sharp(pixels).raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[0], 255);
  const middle = (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 3;
  assert.deepEqual([...data.subarray(middle, middle + 3)], [246, 246, 246]);
});

test("blank sources fail instead of silently publishing an empty product", async () => {
  const input = await sharp({ create: { width: 20, height: 20, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(prepareSource(input), /no detectable product/);
});

test("encoding is deterministic for a fixed source and toolchain", async () => {
  const pixels = await sharp({ create: { width: 30, height: 60, channels: 3, background: "#a23419" } }).png().toBuffer();
  for (const format of ["avif", "webp"]) assert.equal(sha256(await renderVariant(pixels, 160, format)), sha256(await renderVariant(pixels, 160, format)));
});

test("validation rejects stale IDs, incomplete pairs and fabricated 1200 capability", async () => {
  const source = { id: "ALE-0001", sha256: "known", crop: { width: 500, height: 500 } };
  const fixture = { catalog: [{ id: source.id }], inventory: { products: [source] }, manifest: { recipe: IMAGE_RECIPE, products: [] }, availability: {}, publicDir: "unused" };
  await assert.rejects(validateProductImages(fixture), /incomplete/);
  fixture.manifest.products = [{ id: source.id, sourceSha256: "known", files: [] }];
  fixture.availability = { [source.id]: IMAGE_RECIPE.widths };
  await assert.rejects(validateProductImages(fixture), /Incomplete format/);
  source.allow1200 = true;
  await assert.rejects(validateProductImages(fixture), /Upscaled 1200/);
  source.allow1200 = false;
  fixture.manifest.products[0].sourceSha256 = "changed";
  await assert.rejects(validateProductImages(fixture), /Source changed/);
});

test("validation detects corrupted and stale files after a valid complete generation", async () => {
  const publicDir = await mkdtemp(path.join(tmpdir(), "aleatur-image-test-"));
  try {
    const source = { id: "ALE-0001", sha256: "known", crop: { width: 500, height: 500 } };
    const pixels = await sharp({ create: { width: 30, height: 60, channels: 3, background: "#a23419" } }).png().toBuffer();
    const files = [];
    for (const width of IMAGE_RECIPE.widths) for (const format of ["avif", "webp"]) {
      const bytes = await renderVariant(pixels, width, format);
      const name = variantPath(source.id, width, format);
      await mkdir(path.dirname(path.join(publicDir, name)), { recursive: true });
      await writeFile(path.join(publicDir, name), bytes);
      files.push({ path: name, width, height: width, format, bytes: bytes.length, sha256: sha256(bytes) });
    }
    const fixture = { catalog: [{ id: source.id }], inventory: { products: [source] }, manifest: { recipe: IMAGE_RECIPE, products: [{ id: source.id, sourceSha256: "known", files }] }, availability: { [source.id]: IMAGE_RECIPE.widths }, publicDir };
    assert.deepEqual(await validateProductImages(fixture), { products: 1, files: 8 });
    await writeFile(path.join(publicDir, "products/responsive/stale.webp"), "stale");
    await assert.rejects(validateProductImages(fixture), /stale responsive/);
    await writeFile(path.join(publicDir, files[0].path), Buffer.alloc(files[0].bytes));
    await assert.rejects(validateProductImages(fixture), /Checksum mismatch/);
  } finally {
    await rm(publicDir, { recursive: true, force: true });
  }
});
