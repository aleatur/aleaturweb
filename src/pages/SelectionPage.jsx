import { useSelection } from "../components/SelectionProvider.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { products } from "../data/products.js";
import { createSelectionWhatsAppLinks } from "../site.js";

export function SelectionPage() {
  const { ids, toggle, persistent } = useSelection();
  const selected = ids.map((id) => products.find((item) => item.id === id)).filter(Boolean);
  const unavailable = ids.filter((id) => !products.some((item) => item.id === id));
  const links = createSelectionWhatsAppLinks(selected);
  return <section className="selection-page shell">
    <p className="eyebrow">Tus elegidos</p><h1>Mi selección</h1>
    <p>{persistent ? "Se guarda en este navegador, sin crear una cuenta." : "El navegador bloquea el guardado. La selección está disponible durante esta visita a la página."} Guardar un producto no reserva stock.</p>
    {ids.length === 0 ? <div className="empty-state"><h2>Tus próximos favoritos, en un solo lugar.</h2><p>Usá «Guardar» en el catálogo y consultá por varios productos juntos.</p><a className="button button-primary" href="/catalogo">Explorar el catálogo</a></div> : <>
      <div className="selection-summary"><p role="status">{selected.length} {selected.length === 1 ? "producto para consultar" : "productos para consultar"}</p><a className="back-link" href="/catalogo">Seguir explorando →</a></div>
      {selected.length > 0 && <div className="selection-consult"><p>Enviá tu selección para consultar precios y disponibilidad.{links.length > 1 && " La dividimos en grupos para que el mensaje sea fácil de enviar."}</p><div className="empty-actions">{links.map((link, index) => <a className="button button-primary" key={link.url} href={link.url} target="_blank" rel="noreferrer">{links.length > 1 ? `Consultar grupo ${index + 1} (${link.count})` : "Consultar mi selección por WhatsApp"}</a>)}</div></div>}
      <div className="product-grid catalog-grid">{selected.map((product) => <ProductCard product={product} key={product.id} returnUrl="/seleccion" />)}</div>
      {unavailable.length > 0 && <div className="unavailable-products"><h2>Ya no están en el catálogo</h2><p>Estos códigos estaban guardados en tu navegador.</p>{unavailable.map((id) => <div key={id}><span>{id}</span><button className="text-button" type="button" onClick={() => toggle(id)}>Quitar {id}</button></div>)}</div>}
    </>}
  </section>;
}
