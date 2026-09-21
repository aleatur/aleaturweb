import sharp from "sharp";

export const GALLERY_RECIPE = {
  version: 1,
  longEdges: [144, 280, 420, 704, 1056, 1200],
  avif: { quality: 54, effort: 5, chromaSubsampling: "4:4:4" },
  webp: { quality: 84, effort: 5, smartSubsample: true },
};

export function gallerySizes(crop) {
  const maximum = Math.min(1200, Math.max(crop.width, crop.height));
  const edges = [...new Set([...GALLERY_RECIPE.longEdges.filter((edge) => edge < maximum), maximum])];
  return edges.map((edge) => ({
    edge,
    width: Math.max(1, Math.round(crop.width * edge / Math.max(crop.width, crop.height))),
    height: Math.max(1, Math.round(crop.height * edge / Math.max(crop.width, crop.height))),
  }));
}

export function galleryPath(id, edge, format) {
  return `products/gallery/${id}-${edge}.${format}`;
}

export async function renderGallery(input, source, size, format) {
  let image = sharp(input).autoOrient().toColourspace("srgb").extract(source.crop);
  // Preserve only reviewed native alpha. Glass and reflective products retain
  // their photographic background; there is no segmentation or reconstruction.
  image = source.alpha ? image.ensureAlpha() : image.flatten({ background: "#fff" }).removeAlpha();
  return image.resize(size.width, size.height, { fit: "fill", withoutEnlargement: true })[format](GALLERY_RECIPE[format]).toBuffer();
}
