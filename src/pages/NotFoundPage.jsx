export function NotFoundPage() {
  return (
    <section className="not-found section" aria-labelledby="not-found-title">
      <div className="shell">
        <p className="eyebrow">Página no encontrada</p>
        <h1 id="not-found-title">Este camino no lleva al catálogo.</h1>
        <a className="button button-primary" href="/">Volver al inicio</a>
      </div>
    </section>
  );
}
