import { List, WhatsappLogo, X } from "@phosphor-icons/react";
import { useState } from "react";
import { whatsappUrl } from "../../site.js";
import { Brand } from "../Brand.jsx";

const navigation = [
  { href: "/", label: "Inicio", path: "/" },
  { href: "/catalogo", label: "Catálogo", path: "/catalogo" },
  { href: "/#como-comprar", label: "Cómo comprar" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header({ currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand-link" href="/" aria-label="Aleatur, inicio" onClick={closeMenu}>
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

        <nav
          id="main-navigation"
          className={`main-navigation${menuOpen ? " is-open" : ""}`}
          aria-label="Navegación principal"
        >
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.path === currentPath ? "page" : undefined}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <a
            className="button button-small navigation-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <WhatsappLogo size={20} aria-hidden="true" />
            Escribinos
          </a>
        </nav>

        <a className="button button-outline header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
          <WhatsappLogo size={21} aria-hidden="true" />
          Hablar por WhatsApp
        </a>
      </div>
    </header>
  );
}
