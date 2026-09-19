const imageModules = import.meta.glob("../assets/products/*.{avif,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

export function getProductImageSources(imageKey) {
  const avifKey = `../assets/products/${imageKey}.avif`;
  const webpKey = `../assets/products/${imageKey}.webp`;
  const avif = imageModules[avifKey];
  const webp = imageModules[webpKey];

  if (!avif || !webp) {
    throw new Error(`Missing image pair for ${imageKey}`);
  }

  return { avif, webp };
}
