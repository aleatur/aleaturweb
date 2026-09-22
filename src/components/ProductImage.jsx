import imageWidths from "../data/product-image-widths.json";
import gallery from "../data/product-gallery.json";

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
  const image = gallery[product.image];
  if (image) {
    const ratio = image.width / image.height;
    const [, maximumWidth, maximumHeight] = image.sizes.at(-1);
    // The image itself occupies only the fitted photographic area. Lazy auto
    // sizing therefore requests pixels for the bottle, not the surrounding tile.
    const fit = (width, height) => `min(${width}, calc((${height}) * ${ratio}))`;
    const slots = {
      catalog: `(max-width: 560px) ${fit("calc((100vw - 44px) / 2 - 6px)", "(100vw - 44px) / 2 - 6px")}, (max-width: 820px) ${fit("calc((min(100vw - 40px, 720px) - 20px) / 2 - 6px)", "(min(100vw - 40px, 720px) - 20px) / 2 - 6px")}, (max-width: 1312px) ${fit("calc((100vw - 136px) / 4 - 6px)", "(100vw - 136px) / 4 - 6px")}, ${fit("calc((min(100vw - 64px, 1248px) - 48px) / 5 - 6px)", "246px")}`,
      featured: `(max-width: 560px) ${fit("calc((100vw - 44px) / 2 - 6px)", "(100vw - 44px) / 2 - 6px")}, (max-width: 820px) ${fit("calc((min(100vw - 40px, 720px) - 20px) / 2 - 6px)", "(min(100vw - 40px, 720px) - 20px) / 2 - 6px")}, ${fit("calc((min(100vw - 64px, 1248px) - 48px) / 3 - 6px)", "314px")}`,
      hero: `(max-width: 560px) ${fit("calc(100vw - 38px)", "min(354px, 100vw - 38px)")}, ${fit("min(460px, calc(100vw - 32px))", "394px")}`,
      detail: `${fit("min(588px, calc(100vw - 32px))", `min(${Math.min(500, maximumHeight)}px, 65vh) - 16px`)}`,
      selection: `(max-width: 820px) ${fit("66px", "66px")}, ${fit("82px", "82px")}`,
      zoom: `${fit(`min(${maximumWidth}px, calc(100vw - 50px))`, `min(${maximumHeight}px, 72vh)`)}`,
    };
    const slot = slots[context] ?? slots.catalog;
    const sizes = priority ? slot : `auto, ${slot}`;
    const srcSet = (format) => image.sizes.map(([edge, width]) => `/products/gallery/${product.image}-${edge}.${format} ${width}w`).join(", ");
    return <picture className={`gallery-picture gallery-${context}`} data-alpha={image.alpha || undefined} style={{ backgroundColor: image.background ?? "#ffffff", "--source-width": `${maximumWidth}px`, "--source-height": `${maximumHeight}px`, "--detail-height": `${Math.min(500, maximumHeight)}px` }}>
      <source srcSet={srcSet("avif")} sizes={sizes} type="image/avif" />
      <img src={product.webp} srcSet={srcSet("webp")} sizes={sizes} alt={`${product.name} de ${product.brand}`} width={image.width} height={image.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
    </picture>;
  }
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
