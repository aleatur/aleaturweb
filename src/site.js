export const contactNumber = "5491140302499";

export function createWhatsAppUrl(product) {
  const message = product
    ? `Hola, quería consultar por ${product.brand} ${product.name} (${product.id}).`
    : "Hola, estuve viendo los productos de Aleatur y quería hacer una consulta.";

  return `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`;
}

export const whatsappUrl = createWhatsAppUrl();

export function createSelectionWhatsAppLinks(products) {
  const prefix = "Hola, quisiera consultar precio y disponibilidad de estos productos:\n";
  const links = [];
  let lines = [];
  const urlFor = (items) => `https://wa.me/${contactNumber}?text=${encodeURIComponent(prefix + items.join("\n"))}`;
  for (const product of products) {
    const fullLine = `• ${product.brand} ${product.name} (${product.id})`;
    const line = urlFor([fullLine]).length > 1800 ? `• ${product.id}` : fullLine;
    if (lines.length && urlFor([...lines, line]).length > 1800) {
      links.push({ url: urlFor(lines), count: lines.length });
      lines = [];
    }
    lines.push(line);
  }
  if (lines.length) links.push({ url: urlFor(lines), count: lines.length });
  return links;
}
