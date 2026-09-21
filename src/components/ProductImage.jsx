import imageWidths from "../data/product-image-widths.json";

// Lazy images use their rendered width. Fallbacks follow the CSS grids; the
// mobile transition allows room for a classic scrollbar to avoid undersizing.
const imageSizes = {
  catalog: "(max-width: 456px) calc((100vw - 44px) / 2), (max-width: 560px) calc((100vw - 56px) / 3), (max-width: 760px) calc((100vw - 60px) / 2), (max-width: 820px) 350px, (max-width: 1312px) calc((100vw - 136px) / 4), 294px",
  featured: "(max-width: 456px) calc((100vw - 44px) / 2), (max-width: 560px) calc((100vw - 56px) / 3), (max-width: 760px) calc((100vw - 60px) / 2), (max-width: 820px) 350px, (max-width: 1312px) calc((100vw - 112px) / 3), 400px",
  hero: "(max-width: 432px) calc(100vw - 32px), (max-width: 560px) 400px, (max-width: 760px) calc((100vw - 72px) / 2.05), (max-width: 820px) 336px, (max-width: 1000px) calc((100vw - 104px) / 2.05), (max-width: 1087px) calc((100vw - 144px) / 2.05), 460px",
  detail: "(max-width: 560px) calc(100vw - 32px), (max-width: 760px) calc((100vw - 72px) / 2), (max-width: 820px) 344px, (max-width: 1312px) calc((100vw - 136px) / 2), 588px",
  selection: "(max-width: 820px) 72px, 88px",
  zoom: "min(800px, 72vh, calc(100vw - 50px))",
};

export function ProductImage({ product, priority = false, context = "catalog" }) {
  const widths = imageWidths[product.image] ?? [800];
  const candidates = context === "detail" || context === "zoom" || context === "hero" ? widths : widths.filter((width) => width <= 800);
  const srcSet = (format) => candidates.map((width) => `${width === 800 ? `/products/${product.image}.${format}` : `/products/responsive/${product.image}-${width}.${format}`} ${width}w`).join(", ");
  const slot = imageSizes[context] ?? imageSizes.catalog;
  const sizes = priority ? slot : `auto, ${slot}`;
  return (
    <picture>
      <source srcSet={srcSet("avif")} sizes={sizes} type="image/avif" />
      <img
        src={product.webp}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt={`${product.name} de ${product.brand}`}
        width="800"
        height="800"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
