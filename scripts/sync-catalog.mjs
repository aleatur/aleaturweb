#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(root, "src", "data", "catalog.generated.json");
const assetsPath = path.join(root, "public", "products");
const expectedHeaders = ["ID", "MARCA", "PRODUCTO", "PUBLICAR", "PRIORIDAD_WEB", "IMAGEN", "CATEGORIA_WEB"];
const allowedCategories = new Set(["PERFUMES", "BODY_MISTS", "INFANTIL", "CUIDADO_CAPILAR"]);

if (!sourcePath || !existsSync(sourcePath)) {
  throw new Error("Usage: npm run sync:catalog -- <exported-web-tab.csv> [output.json]");
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted && character === '"' && input[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  if (quoted) throw new Error("Invalid CSV: unterminated quoted value");
  return rows;
}

const rows = parseCsv(readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, ""));
const headers = rows.shift()?.map((value) => value.trim()) ?? [];
if (headers.join("|") !== expectedHeaders.join("|")) throw new Error(`Unexpected CSV headers: ${headers.join(", ")}`);
if (rows.length === 0) throw new Error("Catalog CSV must contain at least one product; the existing snapshot was not changed");

const catalog = rows.map((row, index) => {
  const [id, brand, name, publishValue, priorityValue, image, category] = row.map((value) => value.trim());
  const publishKey = publishValue.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
  const priority = priorityValue === "" ? null : Number(priorityValue);

  if (!/^ALE-\d{4}$/.test(id)) throw new Error(`Invalid ID on CSV row ${index + 2}: ${id}`);
  if (!brand || !name) throw new Error(`Missing brand or product on CSV row ${index + 2}`);
  if (!new Set(["SI", "NO"]).has(publishKey)) throw new Error(`Invalid PUBLICAR value for ${id}: ${publishValue}`);
  if (priority !== null && (!Number.isInteger(priority) || priority < 1)) throw new Error(`Invalid priority for ${id}: ${priorityValue}`);
  if (image !== id) throw new Error(`Image key must match ID for ${id}: ${image}`);
  if (!allowedCategories.has(category)) throw new Error(`Invalid category for ${id}: ${category}`);

  for (const extension of ["avif", "webp"]) {
    const asset = path.join(assetsPath, `${image}.${extension}`);
    if (!existsSync(asset)) throw new Error(`Missing product image: ${asset}`);
  }

  return { id, brand, name, publish: publishKey === "SI", priority, image, category };
});

const ids = catalog.map((product) => product.id);
const priorities = catalog.filter((product) => product.priority !== null).map((product) => product.priority);
if (new Set(ids).size !== ids.length) throw new Error("Catalog IDs must be unique");
if (new Set(priorities).size !== priorities.length) throw new Error("Featured priorities must be unique");

writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} from ${catalog.length} CSV rows.`);
