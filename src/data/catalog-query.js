export const PAGE_SIZE = 24;
export const defaultFilters = { query: "", category: "", brand: "", order: "marca", page: 1 };

export function normalize(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, " ").trim();
}

export function readFilters(search, products) {
  const params = new URLSearchParams(search);
  const category = products.some((item) => item.category === params.get("categoria")) ? params.get("categoria") : "";
  const brand = products.some((item) => (!category || item.category === category) && item.brand === params.get("marca")) ? params.get("marca") : "";
  const query = (params.get("q") ?? "").slice(0, 120);
  const order = ["marca", "nombre", "relevancia"].includes(params.get("orden")) ? params.get("orden") : query.trim() ? "relevancia" : "marca";
  const requestedPage = Number(params.get("pagina"));
  return { query, category, brand, order, page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1 };
}

export function catalogUrl(filters) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category) params.set("categoria", filters.category);
  if (filters.brand) params.set("marca", filters.brand);
  if (filters.order !== (filters.query.trim() ? "relevancia" : "marca")) params.set("orden", filters.order);
  if (filters.page > 1) params.set("pagina", String(filters.page));
  return `/catalogo${params.size ? `?${params}` : ""}`;
}

function score(product, query) {
  if (!query) return 1;
  const name = normalize(product.name);
  const id = normalize(product.id);
  const text = normalize(`${product.brand} ${product.name} ${product.id}`);
  const compact = text.replaceAll(" ", "");
  if (!query.split(/\s+/).every((token) => text.includes(token) || compact.includes(token))) return 0;
  return name === query || id === query ? 100 : name.startsWith(query) ? 50 : name.includes(query) ? 20 : 1;
}

export function queryCatalog(products, filters) {
  const query = normalize(filters.query);
  const compare = (a, b) => a.localeCompare(b, "es", { sensitivity: "base", numeric: true });
  const ranked = products.filter((item) => (!filters.category || item.category === filters.category) && (!filters.brand || item.brand === filters.brand))
    .map((product) => ({ product, score: score(product, query) })).filter((item) => item.score > 0);
  ranked.sort((a, b) => (filters.order === "relevancia" ? b.score - a.score : 0)
    || (filters.order === "nombre" ? compare(a.product.name, b.product.name) : compare(a.product.brand, b.product.brand))
    || compare(a.product.name, b.product.name) || compare(a.product.id, b.product.id));
  const total = ranked.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  return { total, pages, page, items: ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => item.product) };
}

export function safeReturnUrl(value) {
  if (!value) return "/catalogo";
  try {
    const url = new URL(value, "https://aleatur.local");
    if (url.origin === "https://aleatur.local" && ["/catalogo", "/seleccion"].includes(url.pathname)) return url.pathname + url.search;
  } catch { /* Invalid return URLs fall back to the catalog. */ }
  return "/catalogo";
}

function distance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= right.length; j += 1) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
    previous = row;
  }
  return previous[right.length];
}

export function suggestProducts(products, filters) {
  const tokens = normalize(filters.query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return products.filter((product) => (!filters.category || product.category === filters.category) && (!filters.brand || product.brand === filters.brand))
    .filter((product) => {
      const words = normalize(`${product.brand} ${product.name}`).split(/\s+/);
      return tokens.every((token) => words.some((word) => word === token || (token.length >= 4 && Math.abs(word.length - token.length) <= 1 && distance(word, token) <= 1)));
    }).slice(0, 3);
}

export function rememberCatalog(productId) {
  try {
    sessionStorage.setItem("aleatur.catalog.return", JSON.stringify({ url: location.pathname + location.search, y: scrollY, productId }));
  } catch { /* Navigation remains usable without browser storage. */ }
}
