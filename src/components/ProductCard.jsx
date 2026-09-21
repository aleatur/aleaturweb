import { WhatsappLogo } from "@phosphor-icons/react";
import { createWhatsAppUrl } from "../site.js";
import { ProductImage } from "./ProductImage.jsx";
import { SaveButton } from "./SaveButton.jsx";
import { rememberCatalog } from "../data/catalog-query.js";

export function ProductCard({ product, returnUrl = "/catalogo" }) {
  const href = `/producto/${product.id}?desde=${encodeURIComponent(returnUrl)}`;
  return (
    <article className="product-card" id={`producto-${product.id}`}>
      <a className="product-image" href={href} aria-label={`Ver ${product.name} de ${product.brand}`} onClick={() => rememberCatalog(product.id)}>
        <ProductImage product={product} />
      </a>
      <div className="product-meta">
        <p>{product.brand}</p>
        <h3><a href={href} onClick={() => rememberCatalog(product.id)}>{product.name}</a></h3>
      </div>
      <div className="product-card-actions">
        <a
          className="product-action"
          href={createWhatsAppUrl(product)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Consultar por ${product.name} de ${product.brand}`}
        >
          <WhatsappLogo size={18} aria-hidden="true" />
          Consultar
        </a>
        <SaveButton product={product} compact />
      </div>
    </article>
  );
}
