import { useLayoutEffect, useRef, useState } from "react";

export const ThreeDotEditViewDelete = ({ row, buttons }) => {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    if (!menuRef.current) return;
    const parent = menuRef.current.parentElement;
    if (!parent) return;
    const triggerRect = parent.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const openUp = spaceBelow < menuHeight + 8;

    setCoords({
      right: window.innerWidth - triggerRect.right,
      top: openUp ? undefined : triggerRect.bottom + 4,
      bottom: openUp ? window.innerHeight - triggerRect.top + 4 : undefined,
    });
  }, []);

  return (
    <div
      ref={menuRef}
      style={
        coords
          ? { position: "fixed", right: coords.right, top: coords.top, bottom: coords.bottom, zIndex: 9999 }
          : { position: "fixed", opacity: 0, zIndex: 9999 }
      }
      className="min-w-[180px] rounded border bg-white shadow-lg"
    >
      {buttons?.map((button, index) => (
        <button
          key={index}
          className={`flex w-full cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-100 ${button?.disabled ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={() => button?.onClick(row)}
          disabled={button?.disabled || false}
        >
          {button?.icon}
          {button?.name}
        </button>
      ))}
    </div>
  );
};
