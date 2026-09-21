import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { GALLERY_RECIPE, gallerySizes, galleryPath, renderGallery } from "../scripts/lib/gallery-images.mjs";
import { sha256 } from "../scripts/lib/product-images.mjs";
import { validateGallery } from "../scripts/validate-gallery-images.mjs";

test("gallery preserves disconnected packaging, native alpha and source resolution", async () => {
  const input = await sharp({ create: { width: 180, height: 120, channels: 4, background: "transparent" } }).composite([
    { input: { create: { width: 30, height: 80, channels: 4, background: "#dc2020" } }, left: 20, top: 20 },
    { input: { create: { width: 30, height: 60, channels: 4, background: "#2030dc" } }, left: 120, top: 30 },
  ]).png().toBuffer();
  const crop = { left: 10, top: 10, width: 150, height: 100 };
  assert.deepEqual(gallerySizes(crop).at(-1), { edge: 150, width: 150, height: 100 });
  for (const alpha of [true, false]) for (const format of ["avif", "webp"]) {
    const bytes = await renderGallery(input, { crop, alpha }, gallerySizes(crop).at(-1), format);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.width, 150); assert.equal(metadata.height, 100); assert.equal(metadata.hasAlpha, alpha);
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(data[3], alpha ? 0 : 255);
    const at = (x, y) => [...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 4)];
    assert.ok(at(20, 30)[0] > 180 && at(20, 30)[2] < 80, "Bottle remains red");
    assert.ok(at(120, 40)[2] > 180 && at(120, 40)[0] < 80, "Disconnected box remains blue");
  }
  const sizes = gallerySizes({ width: 197, height: 475 });
  assert.deepEqual(sizes.map((s) => s.edge), [144, 280, 420, 475]);
  assert.ok(sizes.every((s) => s.width <= 197 && s.height <= 475));
});

test("gallery validation rejects missing review, changed framing, alpha and corrupted files", async () => {
  const publicDir = await mkdtemp(path.join(tmpdir(), "aleatur-gallery-test-"));
  try {
    await mkdir(path.join(publicDir, "products/gallery"), { recursive: true });
    const input = await sharp({ create: { width: 30, height: 60, channels: 3, background: "#ab4321" } }).png().toBuffer();
    const source = { id: "ALE-0001", collection: "archive", width: 30, height: 60, crop: { left: 0, top: 0, width: 30, height: 60 }, alpha: false, sha256: sha256(input), reviewed: true };
    const size = gallerySizes(source.crop)[0];
    const files = [];
    for (const format of ["avif", "webp"]) {
      const bytes = await renderGallery(input, source, size, format);
      const name = galleryPath(source.id, size.edge, format);
      await writeFile(path.join(publicDir, name), bytes);
      files.push({ path: name, ...size, format, alpha: false, bytes: bytes.length, sha256: sha256(bytes) });
    }
    const fixture = { catalog: [{ id: source.id }], inventory: { products: [source] }, manifest: { recipe: GALLERY_RECIPE, products: [{ id: source.id, sourceSha256: source.sha256, crop: { ...source.crop }, alpha: false, files }] }, availability: { [source.id]: { width: 30, height: 60, alpha: false, sizes: [[60, 30, 60]] } }, publicDir };
    assert.deepEqual(await validateGallery(fixture), { products: 1, files: 2 });
    source.reviewed = false; await assert.rejects(validateGallery(fixture), /Visual review/); source.reviewed = true;
    source.crop.left = 1; await assert.rejects(validateGallery(fixture), /Invalid crop/); source.crop.left = 0;
    source.width = 40; source.crop.left = 1; await assert.rejects(validateGallery(fixture), /framing changed/); source.width = 30; source.crop.left = 0;
    source.alpha = true; await assert.rejects(validateGallery(fixture), /alpha policy/); source.alpha = false;
    await writeFile(path.join(publicDir, files[0].path), Buffer.alloc(files[0].bytes));
    await assert.rejects(validateGallery(fixture), /checksum mismatch/);
  } finally { await rm(publicDir, { recursive: true, force: true }); }
});
