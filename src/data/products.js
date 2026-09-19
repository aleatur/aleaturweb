import catalog from "./catalog.generated.json" with { type: "json" };

const categoryDefinitions = [
  { code: "PERFUMES", label: "Perfumes", description: "Fragancias árabes y propuestas para todos los estilos." },
  { code: "BODY_MISTS", label: "Body mists", description: "Brumas corporales livianas para usar todos los días." },
  { code: "INFANTIL", label: "Infantil", description: "Una selección divertida pensada para los más chicos." },
  { code: "CUIDADO_CAPILAR", label: "Cuidado capilar", description: "Productos para completar la rutina del cabello." },
];

function getProductImageSources(imageKey) {
  return { avif: `/products/${imageKey}.avif`, webp: `/products/${imageKey}.webp` };
}

const sortByBrandAndName = (left, right) => (
  left.brand.localeCompare(right.brand, "es", { sensitivity: "base" })
  || left.name.localeCompare(right.name, "es", { sensitivity: "base" })
);

export const products = catalog
  .filter((product) => product.publish)
  .map((product) => ({
    ...product,
    ...getProductImageSources(product.image),
    searchText: normalizeForSearch(`${product.brand} ${product.name}`),
  }))
  .sort(sortByBrandAndName);

export const featuredProducts = products
  .filter((product) => Number.isFinite(product.priority))
  .sort((left, right) => left.priority - right.priority);

export const categories = categoryDefinitions.map((category) => ({
  ...category,
  count: products.filter((product) => product.category === category.code).length,
}));

export function normalizeForSearch(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es").trim();
}
