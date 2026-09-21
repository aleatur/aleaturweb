import { createContext, useContext, useEffect, useRef, useState } from "react";
import { parseSelection, SELECTION_KEY } from "../data/selection.js";

const SelectionContext = createContext({ ids: [], toggle: () => {}, persistent: true });
export const useSelection = () => useContext(SelectionContext);

export function SelectionProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return parseSelection(localStorage.getItem(SELECTION_KEY)); } catch { return []; }
  });
  const [persistent, setPersistent] = useState(() => {
    try { localStorage.getItem(SELECTION_KEY); return true; } catch { return false; }
  });
  const [notice, setNotice] = useState(null);
  const currentIds = useRef(ids);
  const undoButton = useRef(null);
  const save = (next) => {
    currentIds.current = next;
    setIds(next);
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(next)); setPersistent(true); }
    catch { setPersistent(false); }
  };
  useEffect(() => {
    const sync = (event) => {
      if (event.key === SELECTION_KEY || event.key === null) {
        const next = parseSelection(event.newValue);
        currentIds.current = next;
        setIds(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggle = (id, name = id) => {
    const removing = currentIds.current.includes(id);
    save(removing ? currentIds.current.filter((item) => item !== id) : [...currentIds.current, id]);
    setNotice({ text: removing ? `${name} se quitó de tu selección.` : `${name} se guardó en tu selección.`, undoId: removing ? id : null });
    if (removing && location.pathname === "/seleccion") requestAnimationFrame(() => undoButton.current?.focus());
  };
  return (
    <SelectionContext.Provider value={{ ids, toggle, persistent }}>
      {children}
      {notice && <div className="selection-notice">
        <p role="status">{notice.text}{!persistent && " El navegador no permite guardarlo para otra visita."}</p>
        {notice.undoId && <button ref={undoButton} type="button" onClick={() => {
          const recoveredId = notice.undoId;
          if (!currentIds.current.includes(notice.undoId)) save([...currentIds.current, notice.undoId]);
          setNotice({ text: "Producto recuperado.", undoId: null });
          requestAnimationFrame(() => document.querySelector(`#producto-${recoveredId} .selection-remove, #producto-${recoveredId} .save-product`)?.focus());
        }}>Deshacer</button>}
        <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>Cerrar</button>
      </div>}
    </SelectionContext.Provider>
  );
}
