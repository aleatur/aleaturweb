import { useRef, useState } from "react";
import { products, categories } from "../data/products.js";
import { safeReturnUrl } from "../data/catalog-query.js";
import { ProductImage } from "../components/ProductImage.jsx";
import { SaveButton } from "../components/SaveButton.jsx";
import { createWhatsAppUrl } from "../site.js";
import { NotFoundPage } from "./NotFoundPage.jsx";

export function ProductPage({ id }) {
  const product = products.find((item) => item.id === id);
  const zoom = useRef(null);
  const imageButton = useRef(null);
  const [shareStatus, setShareStatus] = useState("");
  const [zoomLoaded, setZoomLoaded] = useState(false);
  if (!product) return <NotFoundPage />;
  const returnUrl = safeReturnUrl(new URLSearchParams(location.search).get("desde"));
  const category = categories.find((item) => item.code === product.category);
  async function share() {
    const url = `${location.origin}/producto/${product.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${product.name} · ${product.brand}`, url });
      else { await navigator.clipboard.writeText(url); setShareStatus("Enlace copiado."); }
    } catch (error) {
      if (error.name !== "AbortError") setShareStatus(`Podés copiar este enlace: ${url}`);
    }
  }
  return <section className="product-detail shell">
    <a className="back-link" href={returnUrl}>← Volver {returnUrl.startsWith("/seleccion") ? "a mi selección" : "al catálogo"}</a>
    <div className="detail-grid">
      <button ref={imageButton} className="detail-image" type="button" onClick={() => { setZoomLoaded(true); zoom.current.showModal(); }} aria-label={`Ampliar imagen de ${product.name}`}><ProductImage product={product} context="detail" priority /><span>Ampliar imagen</span></button>
      <div className="detail-copy">
        <a className="eyebrow" href={`/catalogo?categoria=${product.category}`}>{category?.label}</a>
        <p className="detail-brand">{product.brand}</p><h1>{product.name}</h1><p className="product-code">Código {product.id}</p>
        {product.description && <p>{product.description}</p>}
        <dl className="product-attributes">{[["Presentación", product.presentation], ["Concentración", product.concentration], ["Familia olfativa", product.olfactoryFamily], ["Notas", product.notes]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p>Consultanos el precio y la disponibilidad antes de coordinar tu compra.</p>
        <a className="button button-primary" href={createWhatsAppUrl(product)} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
        <div className="detail-actions"><SaveButton product={product} /><button className="text-button" type="button" onClick={share}>Compartir producto</button></div>
        <p role="status">{shareStatus}</p>
      </div>
    </div>
    <dialog className="image-dialog" ref={zoom} onClose={() => imageButton.current?.focus()} aria-label={`Imagen ampliada de ${product.name}`}><button className="text-button" type="button" onClick={() => zoom.current.close()}>Cerrar imagen</button>{zoomLoaded && <ProductImage product={product} context="zoom" priority />}</dialog>
  </section>;
}
