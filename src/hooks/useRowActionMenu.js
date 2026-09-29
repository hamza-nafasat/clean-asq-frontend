import { createRef, useEffect, useRef, useState } from "react";
import { KEYBOARD_KEYS } from "@/constants";

// open state and per-row refs for a table's three-dot row menu
const useRowActionMenu = ({ closeOnOutsideClick = false } = {}) => {
  const [openRowId, setOpenRowId] = useState(null);
  const menuRefs = useRef(new Map());

  useEffect(() => {
    if (!closeOnOutsideClick || openRowId === null) return;
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(menuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) setOpenRowId(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === KEYBOARD_KEYS.ESCAPE) setOpenRowId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openRowId, closeOnOutsideClick]);

  const toggleMenu = (rowId) => setOpenRowId((prevRowId) => (prevRowId === rowId ? null : rowId));

  const getRowRef = (key) => {
    if (!menuRefs.current.has(key)) menuRefs.current.set(key, createRef());
    return menuRefs.current.get(key);
  };

  return { openRowId, setOpenRowId, toggleMenu, getRowRef };
};

export default useRowActionMenu;
