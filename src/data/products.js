import { catalog } from "./catalog.generated.js";
import { getProductImageSources } from "./productImages.js";

export const products = catalog
  .filter((product) => product.publish)
  .map((product) => ({
    ...product,
    ...getProductImageSources(product.image),
  }));

export const featuredProducts = products
  .filter((product) => Number.isFinite(product.priority))
  .sort((left, right) => left.priority - right.priority);
