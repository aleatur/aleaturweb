import { useState } from "react";
import {
  ArrowRight,
  ChatCircleText,
  Compass,
  InstagramLogo,
  List,
  ShoppingBagOpen,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import emblem from "./assets/brand/aleatur-emblem.svg";
import { products } from "./data/products.js";

const contactNumber = "5491140302499";
const contactMessage = encodeURIComponent(
  "Hola, estuve viendo los perfumes de Aleatur y quería hacer una consulta.",
);
const whatsappUrl = `https://wa.me/${contactNumber}?text=${contactMessage}`;

function Brand() {
  return (
    <span className="brand-lockup">
      <img className="brand-emblem" src={emblem} alt="" width="38" height="36" />
      <span>
        <strong>Aleatur</strong>
        <small>Perfumería Árabe</small>
      </span>
    </span>
  );
}

function ProductImage({ product, priority = false }) {
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
        style={{ objectPosition: product.imagePosition }}
      />
    </picture>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const featuredProduct = products[0];
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand-link" href="#inicio" aria-label="Aleatur, inicio" onClick={closeMenu}>
            <Brand />
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
          </button>

          <nav id="main-navigation" className={`main-navigation${menuOpen ? " is-open" : ""}`} aria-label="Navegación principal">
            <a href="#inicio" onClick={closeMenu}>Inicio</a>
            <a href="#coleccion" onClick={closeMenu}>Perfumes</a>
            <a href="#como-comprar" onClick={closeMenu}>Cómo comprar</a>
            <a href="#contacto" onClick={closeMenu}>Contacto</a>
            <a className="button button-small navigation-cta" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
              <WhatsappLogo size={20} weight="regular" aria-hidden="true" />
              Escribinos
            </a>
          </nav>

          <a className="button button-outline header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsappLogo size={21} weight="regular" aria-hidden="true" />
            Hablar por WhatsApp
          </a>
        </div>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Selección de perfumería árabe</p>
              <h1 id="hero-title">Perfumes<span>que dejan</span>huella.</h1>
              <div className="gold-rule" aria-hidden="true" />
              <p className="hero-intro">Elegimos perfumes árabes que nos gustan de verdad. Si no sabés por dónde empezar, te ayudamos.</p>
              <a className="button button-primary hero-button" href="#coleccion">
                Ver los perfumes
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

        <section className="collection section" id="coleccion" aria-labelledby="collection-title">
          <div className="shell">
            <header className="section-heading">
              <div>
                <p className="eyebrow">Lo que tenemos hoy</p>
                <h2 id="collection-title">Una selección que recién empieza.</h2>
              </div>
              <p>Empezamos con ocho perfumes de Afnan y Lattafa. Vamos a sumar nuevos aromas de a poco, cuidando cada elección.</p>
            </header>

            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.name}>
                  <div className="product-image">
                    <ProductImage product={product} />
                  </div>
                  <div className="product-meta">
                    <p>{product.brand}</p>
                    <h3>{product.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="purchase section" id="como-comprar" aria-labelledby="purchase-title">
          <div className="shell purchase-grid">
            <div className="purchase-heading">
              <p className="eyebrow">Antes de elegir</p>
              <h2 id="purchase-title">Un perfume se conversa.</h2>
            </div>

            <ol className="purchase-steps">
              <li>
                <Compass size={30} weight="thin" aria-hidden="true" />
                <div><h3>Mirá tranquilo</h3><p>Recorré la selección y quedate con los que te llamen la atención.</p></div>
              </li>
              <li>
                <ChatCircleText size={30} weight="thin" aria-hidden="true" />
                <div><h3>Escribinos</h3><p>Contanos qué usás o qué tipo de aroma estás buscando. Te ayudamos a orientarte.</p></div>
              </li>
              <li>
                <ShoppingBagOpen size={30} weight="thin" aria-hidden="true" />
                <div><h3>Lo coordinamos</h3><p>Cuando encuentres el indicado, coordinamos el pedido directamente.</p></div>
              </li>
            </ol>
          </div>
        </section>

        <section className="contact section" id="contacto" aria-labelledby="contact-title">
          <div className="shell contact-panel">
            <div className="contact-mark" aria-hidden="true"><img src={emblem} alt="" width="86" height="82" /></div>
            <div className="contact-copy">
              <p className="eyebrow">Si querés, te damos una mano</p>
              <h2 id="contact-title">Escribinos y lo vemos juntos.</h2>
              <p>No hace falta saber de notas o familias olfativas. Contanos qué te gusta y empezamos por ahí.</p>
            </div>
            <a className="button button-primary contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <WhatsappLogo size={24} weight="regular" aria-hidden="true" />
              Hablar por WhatsApp
              <ArrowRight size={22} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <a className="brand-link" href="#inicio" aria-label="Aleatur, volver al inicio"><Brand /></a>
          <p>Perfumes árabes, elegidos con tiempo.</p>
          <div className="footer-links">
            <a href="tel:+541140302499">11 4030-2499</a>
            <a className="social-link" href="https://www.instagram.com/aleatur.perfumeria/" target="_blank" rel="noreferrer" aria-label="Aleatur en Instagram">
              <InstagramLogo size={23} weight="regular" aria-hidden="true" />
              @aleatur.perfumeria
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
