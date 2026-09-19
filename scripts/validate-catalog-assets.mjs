#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "src", "data", "catalog.generated.json");
const assetsPath = path.join(root, "public", "products");
const allowedCategories = new Set(["PERFUMES", "BODY_MISTS", "INFANTIL", "CUIDADO_CAPILAR"]);

if (!existsSync(catalogPath) || !existsSync(assetsPath)) {
  throw new Error("Catalog snapshot or product asset directory is missing");
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const ids = catalog.map((product) => product.id);
const uniqueIds = new Set(ids);
const priorities = catalog.filter((product) => Number.isFinite(product.priority)).map((product) => product.priority);

if (!catalog.length || uniqueIds.size !== catalog.length) {
  throw new Error(`Catalog IDs must be present and unique: ${catalog.length}/${uniqueIds.size}`);
}

for (const product of catalog) {
  if (!product.brand || !product.name) throw new Error(`Missing product data for ${product.id}`);
  if (product.image !== product.id) throw new Error(`Catalog image key mismatch for ${product.id}: ${product.image}`);
  if (!allowedCategories.has(product.category)) throw new Error(`Invalid category for ${product.id}: ${product.category}`);
  if (product.priority !== null && (!Number.isInteger(product.priority) || product.priority < 1)) {
    throw new Error(`Invalid web priority for ${product.id}: ${product.priority}`);
  }
}

if (new Set(priorities).size !== priorities.length) throw new Error("Featured product priorities must be unique");

const expected = new Set(ids.flatMap((id) => [`${id}.avif`, `${id}.webp`]));
const actual = readdirSync(assetsPath).filter((name) => /^ALE-\d{4}\.(?:avif|webp)$/.test(name));
const missing = [...expected].filter((name) => !actual.includes(name));
const unexpected = actual.filter((name) => !expected.has(name));

if (missing.length || unexpected.length || actual.length !== expected.size) {
  throw new Error(`Invalid product assets: missing=${missing.length}, unexpected=${unexpected.length}, total=${actual.length}`);
}

console.log(`Validated ${catalog.length} products, ${priorities.length} featured products and ${actual.length} product image files.`);
