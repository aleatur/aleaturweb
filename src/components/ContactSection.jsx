import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";
import emblem from "../assets/brand/aleatur-emblem.svg";
import { whatsappUrl } from "../site.js";

export function ContactSection() {
  return (
    <section className="contact section" id="contacto" aria-labelledby="contact-title">
      <div className="shell contact-panel">
        <div className="contact-mark" aria-hidden="true"><img src={emblem} alt="" width="86" height="82" /></div>
        <div className="contact-copy">
          <p className="eyebrow">Si querés, te damos una mano</p>
          <h2 id="contact-title">Escribinos y lo vemos juntos.</h2>
          <p>Contanos qué te gusta o qué producto estás buscando y empezamos por ahí.</p>
        </div>
        <a className="button button-primary contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          <WhatsappLogo size={24} aria-hidden="true" />
          Hablar por WhatsApp
          <ArrowRight size={22} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
