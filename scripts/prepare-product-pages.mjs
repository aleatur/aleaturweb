import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { products } from "../src/data/products.js";

const output = fileURLToPath(new URL("../dist/client/", import.meta.url));
const template = await readFile(path.join(output, "index.html"), "utf8");
const origin = "https://aleatur.vercel.app";
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

async function page(file, route, title, description, { image, noindex = false, fallback = "" } = {}) {
  const canonical = `${origin}${route}`;
  const tags = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Aleatur" />`,
    `<meta property="og:locale" content="es_AR" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    ...(image ? [`<meta property="og:image" content="${origin}${image}" />`, `<meta property="og:image:alt" content="${escape(title)}" />`] : []),
    ...(noindex ? ['<meta name="robots" content="noindex, follow" />'] : []),
  ].join("\n    ");
  const html = template.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(description)}" />`)
    .replace("</head>", `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div><noscript><h1>${escape(title)}</h1><p>${escape(description)}</p>${fallback}<p>Activá JavaScript para buscar y guardar productos.</p><a href="/catalogo">Ver catálogo</a></noscript>`);
  await writeFile(path.join(output, file), html, "utf8");
}

await mkdir(path.join(output, "producto"), { recursive: true });
await page("index.html", "/", "Aleatur | Perfumería y cuidado personal", "Descubrí perfumes y cuidado personal. Explorá el catálogo, guardá tus elegidos y consultanos por WhatsApp.");
await page("catalogo.html", "/catalogo", "Catálogo | Aleatur", "Buscá por producto, marca o código. Filtrá el catálogo de Aleatur y guardá tu selección.");
await page("seleccion.html", "/seleccion", "Mi selección | Aleatur", "Tus productos guardados en este navegador para consultar por WhatsApp.", { noindex: true });
await page("404.html", "/404", "Página no encontrada | Aleatur", "Esta página no está disponible. Volvé al catálogo para seguir explorando.", { noindex: true });
for (const product of products) {
  await page(`producto/${product.id}.html`, `/producto/${product.id}`, `${product.name} · ${product.brand} | Aleatur`, product.description || `Conocé ${product.name} de ${product.brand}. Código ${product.id}. Consultá precio y disponibilidad en Aleatur.`, { image: product.webp });
}
const urls = ["/", "/catalogo", ...products.map((product) => `/producto/${product.id}`)];
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((route) => `<url><loc>${origin}${route}</loc></url>`).join("")}</urlset>\n`);
await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prepared metadata for ${products.length} product pages, public routes and sitemap.`);
