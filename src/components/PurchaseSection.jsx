import { ChatCircleText, Compass, ShoppingBagOpen } from "@phosphor-icons/react";

export function PurchaseSection() {
  return (
    <section className="purchase section" id="como-comprar" aria-labelledby="purchase-title">
      <div className="shell purchase-grid">
        <div className="purchase-heading">
          <h2 id="purchase-title">Así de simple</h2>
        </div>

        <ol className="purchase-steps">
          <li>
            <Compass size={30} weight="thin" aria-hidden="true" />
            <div><h3>Explorá el catálogo</h3><p>Buscá por producto, categoría o marca y guardá los que te interesen.</p></div>
          </li>
          <li>
            <ChatCircleText size={30} weight="thin" aria-hidden="true" />
            <div><h3>Consultanos</h3><p>Mandanos tu selección por WhatsApp.</p></div>
          </li>
          <li>
            <ShoppingBagOpen size={30} weight="thin" aria-hidden="true" />
            <div><h3>Coordiná tu pedido</h3><p>Te confirmamos precios, disponibilidad y entrega.</p></div>
          </li>
        </ol>
      </div>
    </section>
  );
}
