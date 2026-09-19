import { WhatsappLogo } from "@phosphor-icons/react";
import { createWhatsAppUrl } from "../site.js";
import { ProductImage } from "./ProductImage.jsx";

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <ProductImage product={product} />
      </div>
      <div className="product-meta">
        <p>{product.brand}</p>
        <h3>{product.name}</h3>
      </div>
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
    </article>
  );
}
