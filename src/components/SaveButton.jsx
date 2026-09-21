import { Heart } from "@phosphor-icons/react";
import { useSelection } from "./SelectionProvider.jsx";

export function SaveButton({ product }) {
  const { ids, toggle } = useSelection();
  const saved = ids.includes(product.id);
  return <button className="save-product" type="button" aria-pressed={saved} aria-label={`${saved ? "Quitar" : "Guardar"} ${product.name} ${saved ? "de" : "en"} mi selección`} onClick={() => toggle(product.id, product.name)}>
    <Heart size={20} weight={saved ? "fill" : "regular"} aria-hidden="true" /><span>{saved ? "Guardado" : "Guardar"}</span>
  </button>;
}
