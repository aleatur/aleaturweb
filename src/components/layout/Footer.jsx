import { InstagramLogo } from "@phosphor-icons/react";
import { Brand } from "../Brand.jsx";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <a className="brand-link" href="/" aria-label="Aleatur, volver al inicio"><Brand /></a>
        <p>Perfumes y cuidado personal, elegidos con tiempo.</p>
        <div className="footer-links">
          <a href="tel:+541140302499">11 4030-2499</a>
          <a
            className="social-link"
            href="https://www.instagram.com/aleatur.perfumeria/"
            target="_blank"
            rel="noreferrer"
            aria-label="Aleatur en Instagram"
          >
            <InstagramLogo size={23} aria-hidden="true" />
            @aleatur.perfumeria
          </a>
        </div>
      </div>
    </footer>
  );
}
