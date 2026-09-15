import { useState } from "react";

const useCopyToClipboard = (resetMs) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), resetMs);
  };

  return { isCopied, copy };
};

export default useCopyToClipboard;
