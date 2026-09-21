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
            <h1 id="hero-title">Productos<span>que dejan</span>huella.</h1>
            <div className="gold-rule" aria-hidden="true" />
            <p className="hero-intro">Una selección para descubrir con calma. Si no sabés por dónde empezar, te ayudamos.</p>
            <a className="button button-primary hero-button" href="/catalogo">
              Explorar el catálogo
              <ArrowRight size={22} aria-hidden="true" />
            </a>
            <p className="hero-note">Elegidos uno por uno</p>
          </div>

          <figure className="hero-media">
            <ProductImage product={featuredProduct} priority />
            <figcaption>
              <span>{featuredProduct.brand}</span>
              <strong>{featuredProduct.name}</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="featured section" aria-labelledby="featured-title">
        <div className="shell">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Para empezar a mirar</p>
              <h2 id="featured-title">Una selección destacada.</h2>
            </div>
            <p>Estos productos abren el recorrido. El catálogo completo reúne toda la selección disponible.</p>
          </header>
          <div className="product-grid featured-grid">
            {homeFeatured.map((product) => <ProductCard product={product} key={product.id} />)}
          </div>
          <div className="section-action">
            <a className="button button-outline" href="/catalogo">
              Ver todos los productos
              <ArrowRight size={22} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="category-section section" aria-labelledby="category-title">
        <div className="shell">
          <header className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Encontrá tu camino</p>
              <h2 id="category-title">Explorá por categoría.</h2>
            </div>
            <p>Cuatro recorridos simples para llegar más rápido a lo que estás buscando.</p>
          </header>
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href={`/catalogo?categoria=${category.code}`} key={category.code}>
                <span>{category.count} productos</span>
                <strong>{category.label}</strong>
                <p>{category.description}</p>
                <ArrowRight size={24} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <PurchaseSection />
      <ContactSection />
    </>
  );
}
