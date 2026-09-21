import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import catalog from "../src/data/catalog.generated.json" with { type: "json" };
import { categories, featuredProducts, normalizeForSearch, products } from "../src/data/products.js";
import { optionalFields } from "../src/data/catalog-fields.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

test("catalog exposes the complete normalized inventory", () => {
  assert.equal(products.length, catalog.filter((product) => product.publish).length);
  assert.deepEqual(featuredProducts.map((product) => product.priority), catalog.filter((product) => product.publish && product.priority !== null).map((product) => product.priority).sort((a, b) => a - b));
  assert.deepEqual(
    Object.fromEntries(categories.map((category) => [category.code, category.count])),
    Object.fromEntries(categories.map((category) => [category.code, products.filter((product) => product.category === category.code).length])),
  );
  assert.equal(normalizeForSearch("Pear Glacé"), "pear glace");
});

test("CSV sync reproduces the committed catalog snapshot", async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "aleatur-catalog-"));
  const csvPath = path.join(temporaryDirectory, "web.csv");
  const outputPath = path.join(temporaryDirectory, "catalog.json");
  const optionalHeaders = Object.keys(optionalFields).filter((header) => catalog.some((product) => product[optionalFields[header].key]));
  const headers = ["ID", "MARCA", "PRODUCTO", "PUBLICAR", "PRIORIDAD_WEB", "IMAGEN", "CATEGORIA_WEB", ...optionalHeaders];
  const rows = catalog.map((product) => [
    product.id,
    product.brand,
    product.name,
    product.publish ? "SÍ" : "NO",
    product.priority,
    product.image,
    product.category,
    ...optionalHeaders.map((header) => product[optionalFields[header].key]),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  try {
    await writeFile(csvPath, `${csv}\r\n`, "utf8");
    const result = spawnSync(process.execPath, ["scripts/sync-catalog.mjs", csvPath, outputPath], {
      cwd: root,
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), catalog);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("optional editorial fields import without accepting malformed rows or overwriting on failure", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "aleatur-editorial-"));
  const source = path.join(directory, "source.csv");
  const output = path.join(directory, "output.json");
  const item = catalog[0];
  const headers = ["ID", "MARCA", "PRODUCTO", "PUBLICAR", "PRIORIDAD_WEB", "IMAGEN", "CATEGORIA_WEB", "DESCRIPCION", "PRESENTACION"];
  const row = [item.id, item.brand, item.name, "SI", "", item.image, item.category, 'Texto editorial, con "comillas"\ny una segunda línea.', "100 ml"];
  const run = () => spawnSync(process.execPath, ["scripts/sync-catalog.mjs", source, output], { cwd: root, encoding: "utf8" });
  try {
    await writeFile(source, [headers, row].map((values) => values.map(csvCell).join(",")).join("\n"));
    assert.equal(run().status, 0);
    const previous = await readFile(output);
    const [product] = JSON.parse(previous);
    assert.equal(product.description, row[7]);
    assert.equal(product.presentation, "100 ml");
    for (const invalid of [row.slice(0, -1), [...row, "extra"], [...row.slice(0, 7), "x".repeat(1201), "100 ml"]]) {
      await writeFile(source, [headers, invalid].map((values) => values.map(csvCell).join(",")).join("\n"));
      assert.equal(run().status, 1);
      assert.deepEqual(await readFile(output), previous);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("CSV sync rejects an empty export without changing the existing snapshot", async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "aleatur-empty-catalog-"));
  const csvPath = path.join(temporaryDirectory, "web.csv");
  const outputPath = path.join(temporaryDirectory, "catalog.json");
  const previousSnapshot = await readFile(path.join(root, "src/data/catalog.generated.json"));

  try {
    await writeFile(outputPath, previousSnapshot);
    for (const csv of ["", "ID,MARCA,PRODUCTO,PUBLICAR,PRIORIDAD_WEB,IMAGEN,CATEGORIA_WEB\r\n"]) {
      await writeFile(csvPath, csv, "utf8");
      const result = spawnSync(process.execPath, ["scripts/sync-catalog.mjs", csvPath, outputPath], {
        cwd: root,
        encoding: "utf8",
      });

      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.match(result.stderr, csv ? /must contain at least one product/ : /Unexpected CSV headers/);
      assert.deepEqual(await readFile(outputPath), previousSnapshot);
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
