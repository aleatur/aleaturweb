export function ProductImage({ product, priority = false }) {
  return (
    <picture>
      <source srcSet={product.avif} type="image/avif" />
      <img
        src={product.webp}
        alt={`${product.name} de ${product.brand}`}
        width="800"
        height="800"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
