import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 1500;

const CopyableText = ({ text = "", children, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      toast.error("Could not copy to the clipboard");
    }
  };

  return (
    <button
      type="button"
      title={text}
      aria-label={`Copy ${text}`}
      onClick={handleCopy}
      className={cn("cursor-pointer text-left text-xs", className)}
    >
      {isCopied ? "✓ Copied" : (children ?? text)}
    </button>
  );
};

export default CopyableText;
