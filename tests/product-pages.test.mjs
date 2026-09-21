import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { products } from "../src/data/products.js";

const read = (file) => readFile(new URL(`../dist/client/${file}`, import.meta.url), "utf8");
test("every published product has a shareable static page and sitemap entry", async () => {
  const sitemap = await read("sitemap.xml");
  for (const product of products) {
    const html = await read(`producto/${product.id}.html`);
    assert.ok(html.includes(`<link rel="canonical" href="https://aleatur.vercel.app/producto/${product.id}"`));
    assert.ok(html.includes(`<meta property="og:image" content="https://aleatur.vercel.app/products/${product.id}.webp"`));
    assert.ok(html.includes('<script type="module"'));
    assert.ok(sitemap.includes(`/producto/${product.id}</loc>`));
    assert.ok(!html.includes('content="noindex'));
  }
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, products.length + 2);
  assert.ok(!sitemap.includes("/seleccion"));
});
test("public routes have distinct titles and private selection is not indexed", async () => {
  assert.match(await read("catalogo.html"), /<title>Catálogo \| Aleatur<\/title>/);
  assert.match(await read("seleccion.html"), /name="robots" content="noindex, follow"/);
  assert.match(await read("404.html"), /name="robots" content="noindex, follow"/);
  assert.match(await read("robots.txt"), /Sitemap: https:\/\/aleatur.vercel.app\/sitemap.xml/);
});
