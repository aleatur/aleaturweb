import { List, WhatsappLogo, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useSelection } from "../SelectionProvider.jsx";
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
  const toggle = useRef(null);
  const { ids } = useSelection();
  useEffect(() => {
    const close = (event) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand-link" href="/" aria-label="Aleatur, inicio" onClick={closeMenu}>
          <Brand />
        </a>

        <a className="header-selection" href="/seleccion" aria-current={currentPath === "/seleccion" ? "page" : undefined}>Mi selección <span>{ids.length}</span></a>
        <button
          ref={toggle}
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
