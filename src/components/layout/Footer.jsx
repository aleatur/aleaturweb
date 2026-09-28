import { InstagramLogo } from "@phosphor-icons/react";
import { Brand } from "../Brand.jsx";
import vntLogo from "../../assets/vnt/logo-signature-white.svg";

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
        <a
          className="vnt-signature"
          href="https://www.instagram.com/vnt.agencia/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="created by VNT — Instagram (se abre en otra pestaña)"
        >
          <span lang="en">created by</span>
          <img src={vntLogo} alt="" width="2150" height="589" loading="lazy" decoding="async" />
        </a>
      </div>
    </footer>
  );
}
