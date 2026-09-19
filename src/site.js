export const contactNumber = "5491140302499";

export function createWhatsAppUrl(product) {
  const message = product
    ? `Hola, quería consultar por ${product.brand} ${product.name} (${product.id}).`
    : "Hola, estuve viendo los productos de Aleatur y quería hacer una consulta.";

  return `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`;
}

export const whatsappUrl = createWhatsAppUrl();
