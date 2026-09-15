import { createRef, useEffect, useRef, useState } from "react";

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openRowId, closeOnOutsideClick]);

  const toggleMenu = (rowId) => setOpenRowId((prevRowId) => (prevRowId === rowId ? null : rowId));

  const getRowRef = (key) => {
    if (!menuRefs.current.has(key)) menuRefs.current.set(key, createRef());
    return menuRefs.current.get(key);
  };

  return { openRowId, setOpenRowId, toggleMenu, getRowRef };
};

export default useRowActionMenu;
