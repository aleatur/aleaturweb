import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, readdir, access, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { sha256 } from "../scripts/lib/product-images.mjs";
import { readAcquisitions, prepareAcquiredImages } from "../scripts/prepare-acquired-images.mjs";
import { resolveImageSource } from "../scripts/lib/image-source-paths.mjs";

test("image sources resolve each collection and reject missing roots or escaping paths", () => {
  const roots = Object.fromEntries(["archive", "verified", "acquired"].map((collection) => [collection, path.join(tmpdir(), collection)]));
  const source = { id: "ALE-0999", file: "priority/source.jpg" };
  assert.equal(resolveImageSource(source, roots).collection, "archive");
  for (const collection of Object.keys(roots)) {
    assert.equal(resolveImageSource({ ...source, collection }, roots).inputPath, path.resolve(roots[collection], source.file));
  }
  assert.throws(() => resolveImageSource({ ...source, collection: "acquired" }, {}), /No source directory/);
  assert.throws(() => resolveImageSource({ ...source, file: "../outside.jpg" }, roots), /escapes/);
  assert.throws(() => resolveImageSource({ ...source, file: roots.verified }, roots), /escapes/);
});

test("acquisition preflight rejects unreviewed, replaced, corrupted and escaping sources", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "aleatur-acquisition-test-"));
  const group = path.join(dir, "priority");
  await mkdir(group);
  const image = await sharp({ create: { width: 20, height: 30, channels: 3, background: "#ba3040" } }).png().toBuffer();
  const id = "ALE-0549";
  const decision = { id, status: "accepted", file: "source.png", pageUrl: "https://example.com/product", assetUrl: "https://example.com/photo.png", retrievedAt: "2026-09-28T00:00:00Z", sha256: sha256(image), width: 20, height: 30, match: "Fixture", usagePermission: "Fixture", reviewed: true };
  const save = (products) => writeFile(path.join(group, "acquisitions.json"), JSON.stringify({ products }));
  try {
    await writeFile(path.join(group, "inventory.json"), JSON.stringify({ products: [{ ID: id }] }));
    await writeFile(path.join(group, "source.png"), image);
    await save([decision]);
    assert.equal((await readAcquisitions(dir, new Set(), ["priority"])).length, 1);
    await assert.rejects(readAcquisitions(dir, new Set([id]), ["priority"]), /Existing product/);
    await save([{ ...decision, reviewed: false }]);
    await assert.rejects(readAcquisitions(dir, new Set(), ["priority"]), /not been reviewed/);
    await save([{ ...decision, sha256: "0".repeat(64) }]);
    await assert.rejects(readAcquisitions(dir, new Set(), ["priority"]), /checksum mismatch/);
    await save([{ ...decision, width: 21 }]);
    await assert.rejects(readAcquisitions(dir, new Set(), ["priority"]), /width mismatch/);
    await writeFile(path.join(dir, "outside.png"), image);
    await save([{ ...decision, file: "../outside.png" }]);
    await assert.rejects(readAcquisitions(dir, new Set(), ["priority"]), /escapes/);
    await save([]);
    await assert.rejects(readAcquisitions(dir, new Set(), ["priority"]), /Incomplete acquisition/);
    await save([{ id, status: "exception", reason: "No exact size confirmed", reviewed: false }]);
    assert.equal((await readAcquisitions(dir, new Set(), ["priority"]))[0].status, "exception");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("preparation handles EXIF, rejects output escapes and promotes only a validated package", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "aleatur-acquisition-build-test-"));
  const outside = await mkdtemp(path.join(tmpdir(), "aleatur-acquisition-outside-test-"));
  const group = path.join(dir, "priority");
  await mkdir(group);
  const image = await sharp({ create: { width: 30, height: 20, channels: 3, background: "#843020" } }).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const id = "ALE-0999";
  const product = { ID: id, MARCA: "Fixture", PRODUCTO: "Fixture product", PUBLICAR: "NO", PRIORIDAD_WEB: "", CATEGORIA_WEB: "PERFUMES" };
  const decision = { id, status: "accepted", file: "source.jpg", pageUrl: "https://example.com/product", assetUrl: "https://example.com/photo.jpg", retrievedAt: "2026-09-28T00:00:00Z", sha256: sha256(image), width: 30, height: 20, match: "Fixture", usagePermission: "Fixture", reviewed: true };
  const options = { collectionDir: dir, outputDir: path.join(dir, "prepared"), selectedGroups: ["priority"] };
  try {
    await writeFile(path.join(group, "inventory.json"), JSON.stringify({ products: [product] }));
    await writeFile(path.join(group, "source.jpg"), image);
    await writeFile(path.join(group, "acquisitions.json"), JSON.stringify({ products: [decision] }));
    await symlink(outside, path.join(dir, "escape"), process.platform === "win32" ? "junction" : "dir");
    await assert.rejects(prepareAcquiredImages({ ...options, outputDir: path.join(dir, "escape", "package") }), /parent escapes/);
    await assert.rejects(access(path.join(outside, "package")), { code: "ENOENT" });
    const result = await prepareAcquiredImages(options);
    assert.equal(result.accepted, 1);
    const inventory = JSON.parse(await readFile(path.join(options.outputDir, "gallery-sources.json"), "utf8"));
    assert.equal(inventory.products[0].width, 20);
    assert.equal(inventory.products[0].height, 30);
    assert.equal(sha256(await readFile(path.join(group, "source.jpg"))), decision.sha256);
    await access(path.join(options.outputDir, "validation.json"));
    await access(path.join(options.outputDir, "review/batch-01.webp"));
    assert.doesNotMatch(await readFile(path.join(options.outputDir, "index.html"), "utf8"), /undefined|null/);
    await assert.rejects(prepareAcquiredImages(options), /must not exist/);
    const blank = await sharp({ create: { width: 30, height: 20, channels: 3, background: "white" } }).jpeg().toBuffer();
    await writeFile(path.join(group, "source.jpg"), blank);
    await writeFile(path.join(group, "acquisitions.json"), JSON.stringify({ products: [{ ...decision, sha256: sha256(blank) }] }));
    await assert.rejects(prepareAcquiredImages({ ...options, outputDir: path.join(dir, "failed") }), /no detectable product/);
    await assert.rejects(access(path.join(dir, "failed")), { code: "ENOENT" });
    assert.equal((await readdir(dir)).some((name) => name.startsWith(".acquisition-build-")), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
