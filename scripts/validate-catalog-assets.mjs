#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "src", "data", "catalog.generated.js");
const assetsPath = path.join(root, "src", "assets", "products");

if (!existsSync(catalogPath) || !existsSync(assetsPath)) {
  throw new Error("Catalog snapshot or product asset directory is missing");
}

const { catalog } = await import(pathToFileURL(catalogPath).href);
const ids = catalog.map((product) => product.id);
const imageKeys = catalog.map((product) => product.image);
const uniqueIds = new Set(ids);

if (ids.length !== 279 || uniqueIds.size !== 279) {
  throw new Error(`Expected 279 unique catalog IDs, found ${ids.length}/${uniqueIds.size}`);
}

for (let index = 0; index < ids.length; index += 1) {
  if (ids[index] !== imageKeys[index]) {
    throw new Error(`Catalog image key mismatch for ${ids[index]}: ${imageKeys[index]}`);
  }
}

const expected = new Set(ids.flatMap((id) => [`${id}.avif`, `${id}.webp`]));
const actual = readdirSync(assetsPath).filter((name) => /^ALE-\d{4}\.(?:avif|webp)$/.test(name));
const missing = [...expected].filter((name) => !actual.includes(name));
const unexpected = actual.filter((name) => !expected.has(name));

if (missing.length || unexpected.length || actual.length !== 558) {
  throw new Error(`Invalid product assets: missing=${missing.length}, unexpected=${unexpected.length}, total=${actual.length}`);
}

console.log(`Validated ${ids.length} products and ${actual.length} product image files.`);
