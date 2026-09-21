import { useEffect } from "react";
import { Footer } from "./components/layout/Footer.jsx";
import { Header } from "./components/layout/Header.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { ProductPage } from "./pages/ProductPage.jsx";
import { SelectionPage } from "./pages/SelectionPage.jsx";
import { SelectionProvider } from "./components/SelectionProvider.jsx";
import { products } from "./data/products.js";

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

export function App() {
  const currentPath = getCurrentPath();
  const productId = /^\/producto\/(ALE-\d{4})$/.exec(currentPath)?.[1];
  const product = products.find((item) => item.id === productId);
  useEffect(() => {
    document.title = product ? `${product.name} · ${product.brand} | Aleatur` : currentPath === "/seleccion" ? "Mi selección | Aleatur" : currentPath === "/catalogo"
      ? "Catálogo | Aleatur"
      : currentPath === "/"
        ? "Aleatur | Perfumería y cuidado personal"
        : "Página no encontrada | Aleatur";
  }, [currentPath, product]);

  const page = currentPath === "/"
    ? <HomePage />
    : currentPath === "/catalogo"
      ? <CatalogPage />
      : currentPath === "/seleccion" ? <SelectionPage /> : productId ? <ProductPage id={productId} /> : <NotFoundPage />;

  return (
    <SelectionProvider>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header currentPath={currentPath} />
      <main id="contenido">{page}</main>
      <Footer />
    </SelectionProvider>
  );
}
