import assert from "node:assert/strict";
import test from "node:test";
import { catalogUrl, defaultFilters, queryCatalog, readFilters, safeReturnUrl, suggestProducts } from "../src/data/catalog-query.js";
import { parseSelection } from "../src/data/selection.js";
import { createSelectionWhatsAppLinks } from "../src/site.js";

const fixtures = [
  { id: "ALE-0001", brand: "Lattafa", name: "Khamrah", category: "PERFUMES" },
  { id: "ALE-0002", brand: "Lattafa", name: "Khamrah Qahwa", category: "PERFUMES" },
  { id: "ALE-0003", brand: "Afnan", name: "9 PM", category: "PERFUMES" },
  { id: "ALE-0004", brand: "Victoria", name: "Pear Glacé", category: "BODY_MISTS" },
];
const search = (query) => queryCatalog(fixtures, { ...defaultFilters, query, order: "relevancia" }).items.map((item) => item.id);

test("search recognizes accents, reversed words, compact names and catalog IDs", () => {
  assert.deepEqual(search("khamrah lattafa"), ["ALE-0001", "ALE-0002"]);
  assert.deepEqual(search("lattafa khamrah"), search("khamrah lattafa"));
  assert.deepEqual(search("9pm"), ["ALE-0003"]);
  assert.deepEqual(search("9 pm"), search("9pm"));
  assert.deepEqual(search("pear glace"), ["ALE-0004"]);
  assert.deepEqual(search("ALE-0001"), ["ALE-0001"]);
  assert.deepEqual(search("inexistente"), []);
});
test("exact product names rank ahead of partial matches", () => {
  assert.equal(queryCatalog([...fixtures].reverse(), { ...defaultFilters, query: "khamrah", order: "relevancia" }).items[0].id, "ALE-0001");
});
test("typo recovery suggests only real products within the selected filters", () => {
  assert.equal(suggestProducts(fixtures, { ...defaultFilters, query: "khmrah lattafa" })[0].id, "ALE-0001");
  assert.deepEqual(suggestProducts(fixtures, { ...defaultFilters, query: "khmrah", category: "BODY_MISTS" }), []);
  assert.deepEqual(suggestProducts(fixtures, { ...defaultFilters, query: "unknown" }), []);
});
test("category and brand filters intersect without mutating the source", () => {
  const original = structuredClone(fixtures);
  assert.equal(queryCatalog(fixtures, { ...defaultFilters, category: "BODY_MISTS", brand: "Lattafa" }).total, 0);
  assert.deepEqual(fixtures, original);
});
test("pagination replaces batches and clamps stale page numbers", () => {
  const products = Array.from({ length: 53 }, (_, i) => ({ ...fixtures[0], id: `ALE-${String(i + 1).padStart(4, "0")}`, name: `Product ${i + 1}` }));
  const first = queryCatalog(products, defaultFilters);
  const second = queryCatalog(products, { ...defaultFilters, page: 2 });
  const last = queryCatalog(products, { ...defaultFilters, page: 999 });
  assert.equal(first.items.length, 24);
  assert.equal(second.items.length, 24);
  assert.ok(second.items.every((item) => !first.items.some((other) => other.id === item.id)));
  assert.equal(last.page, 3);
  assert.equal(last.items.length, 5);
});
test("URL state round trips, rejects invalid values and preserves explicit sorting", () => {
  const filters = { ...defaultFilters, query: "khamrah lattafa", category: "PERFUMES", brand: "Lattafa", order: "nombre", page: 2 };
  assert.deepEqual(readFilters(catalogUrl(filters).split("?")[1], fixtures), filters);
  assert.deepEqual(readFilters("?categoria=bad&marca=bad&orden=bad&pagina=-4", fixtures), defaultFilters);
  assert.equal(readFilters("?categoria=BODY_MISTS&marca=Lattafa", fixtures).brand, "");
  assert.equal(readFilters("?q=9pm", fixtures).order, "relevancia");
  assert.equal(readFilters("?pagina=Infinity", fixtures).page, 1);
});
test("return links only allow internal catalog or selection routes", () => {
  for (const unsafe of ["https://evil.test/catalogo", "//evil.test/catalogo", "javascript:alert(1)", "/other", "\\\\evil.test/catalogo"]) assert.equal(safeReturnUrl(unsafe), "/catalogo");
  assert.equal(safeReturnUrl("/catalogo?marca=Lattafa&pagina=2"), "/catalogo?marca=Lattafa&pagina=2");
  assert.equal(safeReturnUrl("/seleccion"), "/seleccion");
});
test("saved selections tolerate corrupt data and retain unknown valid IDs", () => {
  assert.deepEqual(parseSelection("broken"), []);
  assert.deepEqual(parseSelection('{"id":"ALE-0001"}'), []);
  assert.deepEqual(parseSelection('["ALE-0001","ALE-0001",3,"bad","ALE-9999"]'), ["ALE-0001", "ALE-9999"]);
});
test("WhatsApp batches include each chosen product once and bound message URLs", () => {
  assert.deepEqual(createSelectionWhatsAppLinks([]), []);
  const products = Array.from({ length: 80 }, (_, i) => ({ ...fixtures[0], id: `ALE-${String(i + 1).padStart(4, "0")}` }));
  const links = createSelectionWhatsAppLinks(products);
  assert.ok(links.length > 1);
  assert.ok(links.every((link) => link.url.length <= 1800));
  assert.equal(links.reduce((sum, link) => sum + link.count, 0), products.length);
  const messages = links.map((link) => new URL(link.url).searchParams.get("text")).join("\n");
  for (const product of products) assert.equal(messages.split(product.id).length - 1, 1);
  const [longName] = createSelectionWhatsAppLinks([{ ...fixtures[0], name: "a".repeat(3000) }]);
  assert.ok(longName.url.length <= 1800);
  assert.match(new URL(longName.url).searchParams.get("text"), /ALE-0001/);
});
