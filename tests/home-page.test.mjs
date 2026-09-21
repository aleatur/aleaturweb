import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";
import catalog from "../src/data/catalog.generated.json" with { type: "json" };
import gallery from "../src/data/product-gallery.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const published of [true, false]) {
  test(`home page renders with ${published ? "published" : "unpublished"} products`, async () => {
    const cacheDir = await mkdtemp(path.join(tmpdir(), "aleatur-home-test-"));
    let server;
    try {
      server = await createServer({
        root,
        configFile: false,
        envFile: false,
        cacheDir,
        optimizeDeps: { noDiscovery: true, include: [] },
        plugins: [
          {
            name: "test-catalog-publication",
            enforce: "pre",
            load(id) {
              if (id.endsWith("/src/data/catalog.generated.json")) {
                return JSON.stringify(catalog.map((product) => ({ ...product, publish: published })));
              }
            },
          },
          react(),
        ],
        server: { middlewareMode: true, watch: null, hmr: false },
      });
      const { HomePage } = await server.ssrLoadModule("/src/pages/HomePage.jsx");
      const html = renderToStaticMarkup(createElement(HomePage));

      assert.match(html, /id="contacto"/);
      assert.match(html, /https:\/\/wa\.me\//);
      if (published) {
        assert.match(html, /id="hero-title"/);
        assert.equal((html.match(/class="product-card"/g) ?? []).length, Math.min(6, catalog.filter((product) => product.priority !== null).length));
        assert.ok(html.indexOf('id="category-title"') < html.indexOf('id="featured-title"'));
        assert.doesNotMatch(html, /id="empty-catalog-title"/);
        const { ProductImage } = await server.ssrLoadModule("/src/components/ProductImage.jsx");
        const product = { ...catalog.find((item) => item.publish), avif: "/products/ALE-0001.avif", webp: "/products/ALE-0001.webp" };
        const thumbnail = renderToStaticMarkup(createElement(ProductImage, { product, context: "selection" }));
        const image = gallery[product.image];
        for (const [edge, width] of image.sizes) {
          assert.ok(thumbnail.includes(`/gallery/${product.image}-${edge}.avif ${width}w`));
          assert.ok(thumbnail.includes(`/gallery/${product.image}-${edge}.webp ${width}w`));
        }
        assert.match(thumbnail, /loading="lazy"/);
        assert.match(thumbnail, /sizes="auto, \(max-width: 820px\)/);
        assert.ok(thumbnail.includes(`width="${image.width}" height="${image.height}"`));
        assert.match(thumbnail, /src="\/products\/ALE-0001.webp"/);
        const missingVariants = renderToStaticMarkup(createElement(ProductImage, { product: { ...product, image: "ALE-9999" } }));
        assert.doesNotMatch(missingVariants, /responsive\/ALE-9999/);
        assert.match(missingVariants, /\/products\/ALE-9999\.avif 800w/);
      } else {
        assert.match(html, /Estamos preparando el catálogo/);
        assert.match(html, /href="#contacto"/);
        assert.doesNotMatch(html, /class="product-card"|\/products\/ALE-/);
      }
    } finally {
      await server?.close();
      await rm(cacheDir, { recursive: true, force: true });
    }
  });
}
