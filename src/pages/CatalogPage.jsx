import { MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "../components/ProductCard.jsx";
import { categories, products } from "../data/products.js";
import { catalogUrl, defaultFilters, PAGE_SIZE, queryCatalog, readFilters, suggestProducts } from "../data/catalog-query.js";

export function CatalogPage() {
  const [filters, setFilters] = useState(() => readFilters(window.location.search, products));
  const [draftQuery, setDraftQuery] = useState(filters.query);
  const dialog = useRef(null);
  const resultsHeading = useRef(null);
  const result = queryCatalog(products, filters);
  const current = { ...filters, page: result.page };
  const url = catalogUrl(current);
  const suggestions = result.total ? [] : suggestProducts(products, filters);
  const brands = [...new Set(products.filter((item) => !filters.category || item.category === filters.category).map((item) => item.brand))];

  useEffect(() => { history.replaceState(history.state, "", url); }, [url]);
  useEffect(() => {
    const restore = () => {
      const next = readFilters(location.search, products);
      setFilters(next);
      setDraftQuery(next.query);
    };
    window.addEventListener("popstate", restore);
    let frame;
    try {
      const saved = JSON.parse(sessionStorage.getItem("aleatur.catalog.return"));
      if (saved?.url === location.pathname + location.search) {
        frame = requestAnimationFrame(() => {
          document.getElementById(`producto-${saved.productId}`)?.querySelector("a")?.focus({ preventScroll: true });
          window.scrollTo({ top: Number(saved.y) || 0, behavior: "instant" });
          sessionStorage.removeItem("aleatur.catalog.return");
        });
      }
    } catch { /* Browser history can still restore the position when storage is unavailable. */ }
    return () => { window.removeEventListener("popstate", restore); cancelAnimationFrame(frame); };
  }, []);

  function update(patch, focusResults = false) {
    const next = { ...current, page: 1, ...patch };
    next.page = queryCatalog(products, next).page;
    const nextUrl = catalogUrl(next);
    if (nextUrl !== location.pathname + location.search) history.pushState({}, "", nextUrl);
    setFilters(next);
    setDraftQuery(next.query);
    if (focusResults) requestAnimationFrame(() => {
      resultsHeading.current?.focus({ preventScroll: true });
      resultsHeading.current?.scrollIntoView({ block: "start" });
    });
  }

  function filterFields(prefix) {
    return <>
      <label className="discovery-field" htmlFor={`${prefix}-category`}>Categoría
        <select id={`${prefix}-category`} value={filters.category} onChange={(event) => update({ category: event.target.value, brand: "" })}>
          <option value="">Todas las categorías</option>
          {categories.map((category) => <option value={category.code} key={category.code}>{category.label} ({category.count})</option>)}
        </select>
      </label>
      <label className="discovery-field" htmlFor={`${prefix}-brand`}>Marca
        <select id={`${prefix}-brand`} value={filters.brand} onChange={(event) => update({ brand: event.target.value })}>
          <option value="">Todas las marcas</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}
        </select>
      </label>
      <label className="discovery-field" htmlFor={`${prefix}-order`}>Ordenar por
        <select id={`${prefix}-order`} value={filters.order} onChange={(event) => update({ order: event.target.value })}>
          <option value="marca">Marca y nombre</option><option value="nombre">Nombre A–Z</option><option value="relevancia">Relevancia</option>
        </select>
      </label>
    </>;
  }
  const active = [
    filters.query && { label: `Búsqueda: ${filters.query}`, patch: { query: "", order: "marca" } },
    filters.category && { label: categories.find((item) => item.code === filters.category)?.label, patch: { category: "" } },
    filters.brand && { label: filters.brand, patch: { brand: "" } },
  ].filter(Boolean);
  return <>
    <section className="discovery-intro shell" aria-labelledby="catalog-title">
      <h1 id="catalog-title">Catálogo</h1>
      <p>Perfumes y cuidado personal.</p>
    </section>
    <section className="catalog discovery-catalog" aria-label="Productos">
      <div className="discovery-toolbar"><div className="shell">
        <div className="discovery-search-row">
          <form role="search" className="discovery-search" onSubmit={(event) => { event.preventDefault(); update({ query: draftQuery.trim(), order: draftQuery.trim() ? "relevancia" : "marca" }); }}>
            <label className="sr-only" htmlFor="catalog-search">Buscar por producto, marca o código</label>
            <MagnifyingGlass size={21} aria-hidden="true" />
            <input id="catalog-search" type="search" maxLength={120} value={draftQuery} placeholder="Producto, marca o código" onChange={(event) => setDraftQuery(event.target.value)} />
            {draftQuery && <button type="button" aria-label="Limpiar búsqueda" onClick={() => update({ query: "", order: "marca" })}><X size={18} aria-hidden="true" /></button>}
            <button type="submit">Buscar</button>
          </form>
          <button className="mobile-filters" type="button" onClick={() => dialog.current.showModal()}><SlidersHorizontal size={20} aria-hidden="true" />Filtros{active.length ? ` (${active.length})` : ""}</button>
        </div>
        <div className="desktop-filters">{filterFields("desktop")}</div>
      </div></div>
      <dialog ref={dialog} className="filter-dialog" aria-labelledby="filters-title">
        <div className="dialog-heading"><h2 id="filters-title">Filtrar y ordenar</h2><button type="button" aria-label="Cerrar filtros" onClick={() => dialog.current.close()}><X size={24} aria-hidden="true" /></button></div>
        {filterFields("mobile")}
        <button className="button button-primary" type="button" onClick={() => dialog.current.close()}>Ver {result.total} productos</button>
        <button className="text-button" type="button" onClick={() => update(defaultFilters)}>Limpiar filtros</button>
      </dialog>
      <div className="shell">
        {active.length > 0 && <div className="filter-chips" aria-label="Filtros activos">{active.map((item) => <button key={item.label} type="button" aria-label={`Quitar filtro ${item.label}`} onClick={() => update(item.patch)}>{item.label}<X size={16} aria-hidden="true" /></button>)}<button type="button" onClick={() => update(defaultFilters)}>Limpiar todo</button></div>}
        <div className="discovery-summary"><h2 ref={resultsHeading} tabIndex={-1} id="catalog-results" aria-live="polite">{result.total ? `${(result.page - 1) * PAGE_SIZE + 1}–${Math.min(result.page * PAGE_SIZE, result.total)} de ${result.total} productos` : "Sin resultados"}</h2><span>Página {result.page} de {result.pages}</span></div>
        {result.total > 0 ? <>
          <div className="product-grid catalog-grid">{result.items.map((product) => <ProductCard key={product.id} product={product} returnUrl={url} />)}</div>
          <nav className="catalog-pagination" aria-label="Páginas del catálogo">
            <button type="button" disabled={result.page === 1} onClick={() => update({ page: result.page - 1 }, true)}>Anterior</button>
            <label> Página <select aria-label="Ir a la página" value={result.page} onChange={(event) => update({ page: Number(event.target.value) }, true)}>{Array.from({ length: result.pages }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select> de {result.pages}</label>
            <button type="button" disabled={result.page === result.pages} onClick={() => update({ page: result.page + 1 }, true)}>Siguiente</button>
          </nav>
        </> : <div className="empty-state"><h2>Probemos otra búsqueda.</h2><p>Revisá el nombre o quitá un filtro. También podés buscar por marca o por código.</p>
          {suggestions.length > 0 && <div><p>¿Buscabas alguno de estos?</p><div className="filter-chips">{suggestions.map((product) => <button type="button" key={product.id} onClick={() => update({ query: product.name, order: "relevancia" })}>{product.name} · {product.brand}</button>)}</div></div>}
          <div className="empty-actions">{filters.brand && <button className="button button-outline" type="button" onClick={() => update({ brand: "" })}>Quitar marca</button>}<button className="button button-primary" type="button" onClick={() => update(defaultFilters)}>Ver todo el catálogo</button></div></div>}
      </div>
    </section>
  </>;
}
