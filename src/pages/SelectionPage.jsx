import { ArrowRight, ShoppingBag, X } from "@phosphor-icons/react";
import { useSelection } from "../components/SelectionProvider.jsx";
import { ProductImage } from "../components/ProductImage.jsx";
import { products } from "../data/products.js";
import { createSelectionWhatsAppLinks } from "../site.js";

export function SelectionPage() {
  const { ids, toggle } = useSelection();
  const selected = ids.map((id) => products.find((item) => item.id === id)).filter(Boolean);
  const unavailable = ids.filter((id) => !products.some((item) => item.id === id));
  const links = createSelectionWhatsAppLinks(selected);

  return (
    <section className="selection-page shell" aria-labelledby="selection-title">
      <header className="selection-heading">
        <h1 id="selection-title">Mi selección</h1>
        {ids.length > 0 && <span role="status">{selected.length} {selected.length === 1 ? "producto" : "productos"}</span>}
      </header>

      {ids.length === 0 ? (
        <div className="selection-empty">
          <ShoppingBag size={36} weight="light" aria-hidden="true" />
          <h2>¿Qué te gustaría probar?</h2>
          <p>Elegí tus favoritos y consultanos cuando quieras.</p>
          <a className="button button-primary" href="/catalogo">Explorar catálogo<ArrowRight size={18} aria-hidden="true" /></a>
        </div>
      ) : (
        <div className="selection-layout">
          <div>
            <ul className="selection-list" aria-label="Productos elegidos">
              {selected.map((product) => {
                const href = `/producto/${product.id}?desde=%2Fseleccion`;
                return (
                  <li className="selection-item" id={`producto-${product.id}`} key={product.id}>
                    <a className="selection-image" href={href} aria-label={`Ver ${product.name} de ${product.brand}`}><ProductImage product={product} context="selection" /></a>
                    <div className="selection-item-copy"><p>{product.brand}</p><h2><a href={href}>{product.name}</a></h2></div>
                    <button className="selection-remove" type="button" aria-label={`Quitar ${product.name} de mi selección`} onClick={() => toggle(product.id, product.name)}><X size={20} aria-hidden="true" /></button>
                  </li>
                );
              })}
            </ul>
            {unavailable.length > 0 && <div className="unavailable-products"><h2>Ya no disponibles</h2>{unavailable.map((id) => <div key={id}><span>{id}</span><button className="text-button" type="button" onClick={() => toggle(id)}>Quitar {id}</button></div>)}</div>}
            <a className="text-link selection-continue" href="/catalogo">Seguir explorando<ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          {selected.length > 0 && (
            <aside className="selection-checkout" aria-label="Consultar selección">
              <h2>¿Lo vemos juntos?</h2>
              <p>Consultá precios y disponibilidad por WhatsApp.</p>
              {links.length > 1 && <p className="selection-batches">Tu selección se envía en {links.length} mensajes.</p>}
              {links.map((link, index) => <a className="button button-primary" key={link.url} href={link.url} target="_blank" rel="noreferrer">{links.length > 1 ? `Consultar grupo ${index + 1} (${link.count})` : "Consultar selección"}<ArrowRight size={18} aria-hidden="true" /></a>)}
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
