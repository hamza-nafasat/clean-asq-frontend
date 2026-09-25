import { useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { KEYBOARD_KEYS } from "@/constants";

// open modals, newest last
const openModals = [];

const Modal = ({ title, onClose, children, width, headingIcon, unpadded = false }) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // escape closes only the top modal
  useEffect(() => {
    const modal = {};
    openModals.push(modal);
    const handleKeyDown = (e) => {
      if (e.key !== KEYBOARD_KEYS.ESCAPE || openModals.at(-1) !== modal) return;
      onCloseRef.current?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      openModals.splice(openModals.indexOf(modal), 1);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="modal fixed inset-0 top-0 left-0 z-99 flex items-center justify-center bg-[#000000c5] p-6"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`custom-scroll shadow-card h-fit max-h-full overflow-y-auto rounded-[12px] bg-white ${unpadded ? "flex flex-col" : "p-4 md:p-6"} ${width ? width : "w-[4000px] md:w-[500px] lg:w-[700px] xl:w-[900px]"
          }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between ${unpadded ? "border-b px-6 py-4" : ""}`}>
          <span className="flex gap-1">
            {headingIcon && <span>{headingIcon}</span>}
            <h2 className="text-textPrimary text-base font-semibold md:text-xl">{title}</h2>
          </span>
          <button type="button" aria-label="Close modal" className="bg-primary hover:bg-secondary cursor-pointer rounded-full p-2" onClick={onClose}>
            <RxCross2 color="#fff" />
          </button>
        </div>
        <div className={unpadded ? "w-full" : "mt-2 w-full overflow-auto md:mt-6"}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
