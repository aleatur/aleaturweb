import { ArrowRight } from "@phosphor-icons/react";
import { ContactSection } from "../components/ContactSection.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { ProductImage } from "../components/ProductImage.jsx";
import { PurchaseSection } from "../components/PurchaseSection.jsx";
import { categories, featuredProducts, products } from "../data/products.js";

export function HomePage() {
  const featuredProduct = featuredProducts[0] ?? products[0];
  const homeFeatured = featuredProducts.slice(0, 6);

  if (!featuredProduct) {
    return (
      <>
        <section className="not-found section" id="inicio" aria-labelledby="empty-catalog-title">
          <div className="shell">
            <p className="eyebrow">Aleatur</p>
            <h1 id="empty-catalog-title">Estamos preparando el catálogo.</h1>
            <p>Mientras tanto, escribinos y te ayudamos a encontrar lo que buscás.</p>
            <a className="button button-primary" href="#contacto">Contactanos</a>
          </div>
        </section>
        <PurchaseSection />
        <ContactSection />
      </>
    );
  }

  return (
    <>
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Perfumería y cuidado personal</p>
            <h1 id="hero-title">Encontrá algo que vaya con vos.</h1>
            <p className="hero-intro">Perfumes y cuidado personal para todos los días.</p>
            <a className="button button-primary hero-button" href="/catalogo">
              Ver catálogo
              <ArrowRight size={22} aria-hidden="true" />
            </a>
          </div>

          <figure className="hero-media">
            <a href={`/producto/${featuredProduct.id}`} aria-label={`Ver ${featuredProduct.name} de ${featuredProduct.brand}`}>
              <ProductImage product={featuredProduct} context="hero" priority />
            </a>
            <figcaption>
              <span>{featuredProduct.brand}</span>
              <a href={`/producto/${featuredProduct.id}`}>{featuredProduct.name}<ArrowRight size={18} aria-hidden="true" /></a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="category-section section" aria-labelledby="category-title">
        <div className="shell">
          <header className="section-heading compact-heading">
            <div>
              <h2 id="category-title">Explorá por categoría</h2>
            </div>
          </header>
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href={`/catalogo?categoria=${category.code}`} key={category.code}>
                <strong>{category.label}</strong>
                <span>{category.count} productos</span>
                <ArrowRight size={24} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="featured section" aria-labelledby="featured-title">
        <div className="shell">
          <header className="section-heading">
            <div>
              <h2 id="featured-title">Para descubrir</h2>
            </div>
            <a className="text-link" href="/catalogo">Ver todo<ArrowRight size={18} aria-hidden="true" /></a>
          </header>
          <div className="product-grid featured-grid">
            {homeFeatured.map((product) => <ProductCard product={product} key={product.id} imageContext="featured" />)}
          </div>
        </div>
      </section>

      <PurchaseSection />
      <ContactSection />
    </>
  );
}
