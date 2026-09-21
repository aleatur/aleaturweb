import { ArrowRight } from "@phosphor-icons/react";
import { whatsappUrl } from "../site.js";

export function ContactSection() {
  return (
    <section className="contact section" id="contacto" aria-labelledby="contact-title">
      <div className="shell contact-panel">
        <div className="contact-copy">
          <h2 id="contact-title">¿Te ayudamos a elegir?</h2>
          <p>Contanos qué estás buscando.</p>
        </div>
        <a className="button button-primary contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          Escribinos
          <ArrowRight size={22} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
