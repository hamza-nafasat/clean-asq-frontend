import { useState } from "react";

// confirmation modal state, awaitable by ai
const useConfirm = () => {
  const [pending, setPending] = useState(null);

  const open = (details = {}) => setPending(details);

  const ask = (details = {}) => new Promise((resolve) => setPending({ ...details, resolve }));

  const close = () => {
    pending?.resolve?.(false);
    setPending(null);
  };

  // answers an ai request, if any
  const resolveAsked = () => {
    if (!pending?.resolve) return false;
    pending.resolve(true);
    setPending(null);
    return true;
  };

  return { pending, isOpen: Boolean(pending), open, ask, close, resolveAsked };
};

export default useConfirm;
