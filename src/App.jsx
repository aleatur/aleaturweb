import { useEffect } from "react";
import { Footer } from "./components/layout/Footer.jsx";
import { Header } from "./components/layout/Header.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

export function App() {
  const currentPath = getCurrentPath();
  useEffect(() => {
    document.title = currentPath === "/catalogo"
      ? "Catálogo | Aleatur"
      : currentPath === "/"
        ? "Aleatur | Perfumería y cuidado personal"
        : "Página no encontrada | Aleatur";
  }, [currentPath]);

  const page = currentPath === "/"
    ? <HomePage />
    : currentPath === "/catalogo"
      ? <CatalogPage />
      : <NotFoundPage />;

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header currentPath={currentPath} />
      <main id="contenido">{page}</main>
      <Footer />
    </>
  );
}
