import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import catalog from "../src/data/catalog.generated.json" with { type: "json" };
import { categories, featuredProducts, normalizeForSearch, products } from "../src/data/products.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

test("catalog exposes the complete normalized inventory", () => {
  assert.equal(products.length, 279);
  assert.deepEqual(featuredProducts.map((product) => product.priority), [10, 20, 30, 40, 50, 60]);
  assert.deepEqual(
    Object.fromEntries(categories.map((category) => [category.code, category.count])),
    { PERFUMES: 257, BODY_MISTS: 13, INFANTIL: 5, CUIDADO_CAPILAR: 4 },
  );
  assert.equal(normalizeForSearch("Pear Glacé"), "pear glace");
});

test("CSV sync reproduces the committed catalog snapshot", async () => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "aleatur-catalog-"));
  const csvPath = path.join(temporaryDirectory, "web.csv");
  const outputPath = path.join(temporaryDirectory, "catalog.json");
  const headers = ["ID", "MARCA", "PRODUCTO", "PUBLICAR", "PRIORIDAD_WEB", "IMAGEN", "CATEGORIA_WEB"];
  const rows = catalog.map((product) => [
    product.id,
    product.brand,
    product.name,
    product.publish ? "SÍ" : "NO",
    product.priority,
    product.image,
    product.category,
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
