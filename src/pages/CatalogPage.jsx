import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard.jsx";
import { categories, normalizeForSearch, products } from "../data/products.js";

const PAGE_SIZE = 24;
const categoryCodes = new Set(categories.map((category) => category.code));

function getInitialFilters() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("categoria") ?? "";
  const normalizedCategory = categoryCodes.has(category) ? category : "";
  const requestedBrand = params.get("marca") ?? "";
  const brand = products.some((product) => (
    (!normalizedCategory || product.category === normalizedCategory)
    && product.brand === requestedBrand
  )) ? requestedBrand : "";

  return {
    query: params.get("q") ?? "",
    category: normalizedCategory,
    brand,
  };
}

export function CatalogPage() {
  const initialFilters = getInitialFilters();
  const [query, setQuery] = useState(initialFilters.query);
  const [category, setCategory] = useState(initialFilters.category);
  const [brand, setBrand] = useState(initialFilters.brand);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const brands = useMemo(() => {
    const values = products
      .filter((product) => !category || product.category === category)
      .map((product) => product.brand);
    return [...new Set(values)].sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
  }, [category]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("categoria", category);
    if (brand) params.set("marca", brand);
    const search = params.toString();
    window.history.replaceState({}, "", `/catalogo${search ? `?${search}` : ""}`);
  }, [query, category, brand]);

  const results = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query);
    return products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const matchesBrand = !brand || product.brand === brand;
      const matchesQuery = !normalizedQuery || product.searchText.includes(normalizedQuery);
      return matchesCategory && matchesBrand && matchesQuery;
    });
  }, [query, category, brand]);

  const visibleProducts = results.slice(0, visibleCount);
  const hasFilters = Boolean(query || category || brand);
  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setBrand("");
  };
  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setBrand("");
  };

  return (
    <>
      <section className="catalog-hero" aria-labelledby="catalog-title">
        <div className="shell catalog-hero-grid">
          <div>
            <p className="eyebrow">Catálogo Aleatur</p>
            <h1 id="catalog-title">Encontrá lo que estás buscando.</h1>
          </div>
          <p>Buscá por nombre, recorré las categorías o filtrá por marca. Cuando encuentres algo, consultanos directamente.</p>
        </div>
      </section>

      <section className="catalog section" aria-label="Productos">
        <div className="shell">
          <div className="catalog-controls">
            <div className="search-field">
              <label htmlFor="catalog-search">Buscar productos</label>
              <span className="input-shell">
                <MagnifyingGlass size={21} aria-hidden="true" />
                <input
                  id="catalog-search"
                  type="search"
                  value={query}
                  placeholder="Producto o marca"
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </span>
            </div>

            <label className="brand-field">
              <span>Marca</span>
              <select value={brand} onChange={(event) => setBrand(event.target.value)}>
                <option value="">Todas las marcas</option>
                {brands.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="category-filters" aria-label="Filtrar por categoría">
            <button type="button" aria-pressed={!category} onClick={() => selectCategory("")}>Todos</button>
            {categories.map((item) => (
              <button
                type="button"
                aria-pressed={category === item.code}
                onClick={() => selectCategory(item.code)}
                key={item.code}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="catalog-summary" aria-live="polite">
            <p>{results.length} {results.length === 1 ? "producto" : "productos"}</p>
            {hasFilters && <button type="button" onClick={clearFilters}>Limpiar filtros</button>}
          </div>

          {results.length > 0 ? (
            <>
              <div className="product-grid catalog-grid">
                {visibleProducts.map((product) => <ProductCard product={product} key={product.id} />)}
              </div>
              {visibleCount < results.length && (
                <div className="load-more">
                  <button className="button button-outline" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Cargar más
                    <span>{Math.min(PAGE_SIZE, results.length - visibleCount)}</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p className="eyebrow">Sin resultados</p>
              <h2>No encontramos productos con esos filtros.</h2>
              <button className="button button-outline" type="button" onClick={clearFilters}>Ver todo el catálogo</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
