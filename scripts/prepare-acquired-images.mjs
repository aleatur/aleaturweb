import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, lstat, mkdtemp, rename, rm, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { IMAGE_RECIPE, prepareSource, renderVariant, variantPath, sha256 } from "./lib/product-images.mjs";
import { GALLERY_RECIPE, gallerySizes, renderGallery, galleryPath } from "./lib/gallery-images.mjs";
import { validateProductImages } from "./validate-product-images.mjs";
import { validateGallery } from "./validate-gallery-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const groups = ["priority", "lattafa", "alhambra", "brands_a", "brands_b"];
const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const saveJson = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
const inside = (base, target) => { const relative = path.relative(base, target); return relative !== "" && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative); };

function reviewHtml(catalog, gallery, records) {
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cards = catalog.map((p) => {
    const source = records.find((r) => r.id === p.id);
    const sizes = gallery[p.id].sizes;
    const small = sizes.find((s) => s[0] >= 280) ?? sizes.at(-1);
    const large = sizes.at(-1);
    const src = `public/products/gallery/${p.id}-${small[0]}.webp`;
    const zoom = `public/products/gallery/${p.id}-${large[0]}.webp`;
    const details = source.product.details;
    const attributes = [details?.ML ? `${details.ML} ml` : "", details?.CONCENTRACION].filter(Boolean);
    const description = attributes.length ? `<p>${escape(attributes.join(" · "))}</p>` : "";
    return `<article><button class="image" data-zoom="${zoom}" data-title="${escape(p.id + " · " + p.name)}"><img src="${src}" alt="${escape(p.name)}" width="${small[1]}" height="${small[2]}" loading="lazy"></button><small>${escape(p.id)} · ${escape(p.brand)}</small><h2>${escape(p.name)}</h2>${description}<a href="${escape(source.pageUrl)}" target="_blank" rel="noopener noreferrer">Fuente del producto</a></article>`;
  }).join("\n");
  const exceptions = records.filter((r) => r.status === "exception").map((r) => `<tr><td>${escape(r.id)}</td><td>${escape(r.product.PRODUCTO)}</td><td>${escape(r.reason)}</td></tr>`).join("\n");
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aleatur · Revisión de imágenes adquiridas</title>
<style>*{box-sizing:border-box}body{margin:0;background:#171717;color:#eee;font:16px/1.5 Arial,sans-serif}main{max-width:1440px;margin:auto;padding:24px}h1{font-size:28px;line-height:1.2}h2{font-size:15px;line-height:1.4;margin:8px 0}p,small{color:#bbb}a{color:#ead5b0}button{min-height:44px;cursor:pointer}nav{display:flex;align-items:center;gap:16px;margin:24px 0}nav button{padding:8px 16px}.grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px 16px}.image{width:100%;height:240px;padding:10px;background:#fff;border:0;border-radius:4px}.image img{display:block;width:100%;height:100%;object-fit:contain}article p{font-size:13px;margin:4px 0}article small{font-size:12px}article[hidden]{display:none}table{border-collapse:collapse;width:100%;font-size:14px}td,th{text-align:left;padding:12px;border-bottom:1px solid #444;vertical-align:top}dialog{max-width:95vw;max-height:95vh;padding:16px}dialog img{display:block;max-width:85vw;max-height:75vh;object-fit:contain;margin:auto}dialog::backdrop{background:#000b}dialog button{float:right}summary{cursor:pointer;min-height:44px}@media(max-width:1000px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:600px){main{padding:16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 12px}.image{height:190px}h1{font-size:24px}table{font-size:12px}td,th{padding:8px}}</style>
<main><h1>Revisión de imágenes adquiridas</h1><p>${catalog.length} productos con fuente aceptada · ${records.length - catalog.length} excepciones. Paquete de preparación; el catálogo activo y Sheets permanecen sin cambios.</p><nav><button id="prev">Anterior</button><span id="page" aria-live="polite"></span><button id="next">Siguiente</button></nav><div class="grid">${cards}</div><details><summary>Excepciones pendientes (${records.length - catalog.length})</summary><table><thead><tr><th>ID</th><th>Producto</th><th>Motivo</th></tr></thead><tbody>${exceptions}</tbody></table></details></main><dialog><button id="close">Cerrar</button><h2 id="title"></h2><img id="zoom" alt=""></dialog>
<script>const cards=[...document.querySelectorAll('article')],dialog=document.querySelector('dialog');let page=0;const pages=Math.ceil(cards.length/24);function render(){cards.forEach((card,i)=>card.hidden=Math.floor(i/24)!==page);document.querySelector('#page').textContent=(page+1)+' / '+pages;document.querySelector('#prev').disabled=page===0;document.querySelector('#next').disabled=page===pages-1}document.querySelector('#prev').onclick=()=>{page--;render()};document.querySelector('#next').onclick=()=>{page++;render()};document.querySelectorAll('[data-zoom]').forEach(button=>button.onclick=()=>{document.querySelector('#zoom').src=button.dataset.zoom;document.querySelector('#zoom').alt=button.dataset.title;document.querySelector('#title').textContent=button.dataset.title;dialog.showModal()});document.querySelector('#close').onclick=()=>dialog.close();render();</script></html>`;
}

async function contactSheets(output, catalog, gallery) {
  const reviewDir = path.join(output, "review");
  await mkdir(reviewDir);
  const sheets = [];
  const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  for (let offset = 0; offset < catalog.length; offset += 12) {
    const batch = catalog.slice(offset, offset + 12), tiles = [];
    for (let index = 0; index < batch.length; index++) {
      const product = batch[index], left = (index % 3) * 360, top = Math.floor(index / 3) * 350;
      const size = gallery[product.id].sizes.find((s) => s[0] >= 420) ?? gallery[product.id].sizes.at(-1);
      const input = path.join(output, "public", galleryPath(product.id, size[0], "webp"));
      tiles.push({ input: await sharp(await readFile(input)).resize(330, 290, { fit: "contain", background: "#ffffff" }).png().toBuffer(), left: left + 15, top: top + 55 });
      const label = `<svg width="350" height="50"><text x="10" y="19" font-family="Arial" font-size="16" font-weight="bold">${product.id}</text><text x="10" y="40" font-family="Arial" font-size="12">${escape(product.name.slice(0, 43))}</text></svg>`;
      tiles.push({ input: Buffer.from(label), left, top });
    }
    const name = `batch-${String(sheets.length + 1).padStart(2, "0")}.webp`;
    const image = await sharp({ create: { width: 1080, height: Math.ceil(batch.length / 3) * 350, channels: 3, background: "#ffffff" } }).composite(tiles).webp({ quality: 88 }).toBuffer();
    await writeFile(path.join(reviewDir, name), image, { flag: "wx" });
    sheets.push({ file: `review/${name}`, ids: batch.map((p) => p.id) });
  }
  await saveJson(path.join(output, "review-index.json"), { sheets });
}

export async function readAcquisitions(collectionDir, existingIds, selectedGroups = groups) {
  const collection = await realpath(collectionDir);
  const results = [];
  const seen = new Set();
  for (const group of selectedGroups) {
    assert.ok(groups.includes(group), `Unknown acquisition group: ${group}`);
    const dir = path.join(collection, group);
    const inventory = (await json(path.join(dir, "inventory.json"))).products;
    const acquired = (await json(path.join(dir, "acquisitions.json"))).products;
    assert.ok(Array.isArray(inventory) && Array.isArray(acquired), `Invalid manifest: ${group}`);
    assert.deepEqual(acquired.map((p) => p.id).sort(), inventory.map((p) => p.ID).sort(), `Incomplete acquisition decisions: ${group}`);
    for (const decision of acquired) {
      assert.match(decision.id, /^ALE-\d{4}$/);
      assert.ok(!seen.has(decision.id), `Duplicate acquisition: ${decision.id}`);
      assert.ok(!existingIds.has(decision.id), `Existing product must remain unchanged: ${decision.id}`);
      seen.add(decision.id);
      const product = inventory.find((p) => p.ID === decision.id);
      assert.ok(["accepted", "exception"].includes(decision.status), `Invalid decision: ${decision.id}`);
      if (decision.status === "exception") {
        assert.ok(decision.reason, `Exception needs a reason: ${decision.id}`);
        results.push({ ...decision, group, product });
        continue;
      }
      assert.equal(decision.reviewed, true, `Image has not been reviewed: ${decision.id}`);
      for (const key of ["file", "pageUrl", "assetUrl", "retrievedAt", "sha256", "match", "usagePermission"]) {
        assert.ok(typeof decision[key] === "string" && decision[key].trim(), `Missing ${key}: ${decision.id}`);
      }
      for (const key of ["pageUrl", "assetUrl"]) {
        const url = new URL(decision[key]);
        assert.ok(["http:", "https:"].includes(url.protocol) && !url.username && !url.password, `Invalid ${key}: ${decision.id}`);
      }
      assert.ok(Number.isFinite(Date.parse(decision.retrievedAt)), `Invalid retrieval date: ${decision.id}`);
      const inputPath = await realpath(path.resolve(dir, decision.file));
      assert.ok(inside(dir, inputPath), `Source escapes its collection: ${decision.id}`);
      const input = await readFile(inputPath);
      assert.equal(sha256(input), decision.sha256, `Source checksum mismatch: ${decision.id}`);
      const metadata = await sharp(input).metadata();
      assert.equal(metadata.width, decision.width, `Source width mismatch: ${decision.id}`);
      assert.equal(metadata.height, decision.height, `Source height mismatch: ${decision.id}`);
      assert.ok(metadata.pages === undefined || metadata.pages === 1, `Animated source: ${decision.id}`);
      await sharp(input).raw().toBuffer();
      const swapsAxes = metadata.orientation >= 5 && metadata.orientation <= 8;
      results.push({ ...decision, group, product, inputPath, orientedWidth: swapsAxes ? metadata.height : metadata.width, orientedHeight: swapsAxes ? metadata.width : metadata.height });
    }
  }
  return results;
}

export async function prepareAcquiredImages({ collectionDir, outputDir, selectedGroups = groups }) {
  const current = await json(path.join(root, "src/data/catalog.generated.json"));
  const records = await readAcquisitions(collectionDir, new Set(current.map((p) => p.id)), selectedGroups);
  const accepted = records.filter((p) => p.status === "accepted");
  assert.ok(accepted.length, "No reviewed sources to prepare");
  const collection = await realpath(collectionDir);
  const requested = path.resolve(outputDir);
  assert.ok(inside(collection, requested), "Prepared output must be inside the documentary collection");
  const parent = await realpath(path.dirname(requested));
  assert.ok(parent === collection || inside(collection, parent), "Output parent escapes the collection");
  const destination = path.join(parent, path.basename(requested));
  assert.ok(!inside(await realpath(root), destination), "Acquisition preparation cannot write into the repository");
  try {
    await lstat(destination);
    throw new Error("Output must not exist; existing packages are preserved");
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const output = await mkdtemp(path.join(parent, ".acquisition-build-"));
  let completed = false;
  try {
    const publicDir = path.join(output, "public");
    await mkdir(path.join(publicDir, "products/responsive"), { recursive: true });
    await mkdir(path.join(publicDir, "products/gallery"), { recursive: true });
    const canonicalSources = [], canonicalOutputs = [], gallerySources = [], galleryOutputs = [], catalog = [];
    const widths = {}, gallery = {};
    const writeAsset = async (name, bytes) => writeFile(path.join(publicDir, name), bytes, { flag: "wx" });
    for (let offset = 0; offset < accepted.length; offset += 50) {
      const batch = accepted.slice(offset, offset + 50);
      let next = 0;
      const workers = await Promise.allSettled(Array.from({ length: Math.min(3, batch.length) }, async () => {
        while (next < batch.length) {
          const source = batch[next++];
          const input = await readFile(source.inputPath);
          assert.equal(sha256(input), source.sha256, `Source changed during generation: ${source.id}`);
          const { pixels, crop } = await prepareSource(input);
          const allow1200 = Math.max(crop.width, crop.height) >= 1200 * IMAGE_RECIPE.subjectRatio;
          const provenance = Object.fromEntries(["pageUrl", "assetUrl", "retrievedAt", "match", "usagePermission", "sourceTitle", "sourceAttributes"].filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
          const common = { id: source.id, collection: "acquired", file: `${source.group}/${source.file.replaceAll("\\", "/")}`, sha256: source.sha256, width: source.orientedWidth, height: source.orientedHeight, sourceWidth: source.width, sourceHeight: source.height, crop, provenance: { ...provenance, decision: "accepted" } };
          canonicalSources.push({ ...common, cleanBackground: false, allow1200 });
          const imageWidths = [...IMAGE_RECIPE.widths, ...(allow1200 ? [1200] : [])];
          const canonicalFiles = [];
          for (const width of imageWidths) for (const format of ["avif", "webp"]) {
            const bytes = await renderVariant(pixels, width, format);
            const name = variantPath(source.id, width, format);
            await writeAsset(name, bytes);
            canonicalFiles.push({ path: name, width, height: width, format, bytes: bytes.length, sha256: sha256(bytes) });
          }
          canonicalOutputs.push({ id: source.id, sourceSha256: source.sha256, files: canonicalFiles });
          widths[source.id] = imageWidths;
          // Keep the photographic background; never segment glass or reconstruct detail.
          const gallerySource = { ...common, alpha: false, reviewed: true, quality: Math.max(crop.width, crop.height) < 704 ? "card-use-only" : "ready", reviewEvidence: `${source.group}/acquisitions.json` };
          gallerySources.push(gallerySource);
          const galleryFiles = [], sizes = gallerySizes(crop);
          for (const size of sizes) for (const format of ["avif", "webp"]) {
            const bytes = await renderGallery(input, gallerySource, size, format);
            const name = galleryPath(source.id, size.edge, format);
            await writeAsset(name, bytes);
            galleryFiles.push({ path: name, ...size, format, bytes: bytes.length, sha256: sha256(bytes), alpha: false });
          }
          galleryOutputs.push({ id: source.id, sourceSha256: source.sha256, crop, alpha: false, files: galleryFiles });
          gallery[source.id] = { width: crop.width, height: crop.height, alpha: false, sizes: sizes.map(({ edge, width, height }) => [edge, width, height]) };
          const p = source.product;
          catalog.push({ id: p.ID, brand: p.MARCA, name: p.PRODUCTO, publish: p.PUBLICAR === "SÍ", priority: p.PRIORIDAD_WEB === "" ? null : p.PRIORIDAD_WEB, image: p.ID, category: p.CATEGORIA_WEB });
          console.log(`Prepared ${source.id} (${catalog.length}/${accepted.length})`);
        }
      }));
      const failure = workers.find((worker) => worker.status === "rejected");
      if (failure) throw failure.reason;
    }
    for (const products of [canonicalSources, canonicalOutputs, gallerySources, galleryOutputs, catalog]) products.sort((a, b) => a.id.localeCompare(b.id));
    catalog.sort((a, b) => Number(b.publish) - Number(a.publish) || a.id.localeCompare(b.id));
    const inventory = { schemaVersion: 1, products: canonicalSources };
    const manifest = { schemaVersion: 1, recipe: IMAGE_RECIPE, encoder: sharp.versions, products: canonicalOutputs };
    const galleryInventory = { schemaVersion: 1, products: gallerySources };
    const galleryManifest = { schemaVersion: 1, recipe: GALLERY_RECIPE, encoder: sharp.versions, products: galleryOutputs };
    const checks = {
      canonical: await validateProductImages({ catalog, inventory, manifest, availability: widths, publicDir }),
      gallery: await validateGallery({ catalog, inventory: galleryInventory, manifest: galleryManifest, availability: gallery, publicDir }),
    };
    for (const [name, value] of Object.entries({ "catalog.json": catalog, "sources.json": inventory, "outputs.json": manifest, "gallery-sources.json": galleryInventory, "gallery-outputs.json": galleryManifest, "product-image-widths.json": widths, "product-gallery.json": gallery, "validation.json": checks, "decisions.json": records.map(({ inputPath, ...record }) => record) })) {
      await saveJson(path.join(output, name), value);
    }
    await writeFile(path.join(output, "index.html"), reviewHtml(catalog, gallery, records), { flag: "wx" });
    await contactSheets(output, catalog, gallery);
    await rename(output, destination);
    completed = true;
    console.log(JSON.stringify({ output: destination, accepted: accepted.length, exceptions: records.length - accepted.length, checks }));
    return { accepted: accepted.length, checks };
  } finally {
    if (!completed) {
      const ownedStage = await realpath(output);
      assert.ok(inside(parent, ownedStage) && path.basename(ownedStage).startsWith(".acquisition-build-"), "Refusing to clean an unowned output path");
      await rm(ownedStage, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.length >= 2 && args.length <= 3, "Usage: node scripts/prepare-acquired-images.mjs <collection> <new-output-dir> [group,group]");
  await prepareAcquiredImages({ collectionDir: args[0], outputDir: args[1], ...(args[2] ? { selectedGroups: args[2].split(",") } : {}) });
}
