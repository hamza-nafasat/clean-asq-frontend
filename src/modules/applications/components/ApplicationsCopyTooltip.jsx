import { useEffect, useRef, useState } from "react";

const CopyPasteTooltip = ({ id, label }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!copied) return;
    const onKeyDown = () => clearTimeout(timerRef.current);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copied]);

  const handleCopy = () => {
    if (copied) {
      setCopied(false);
      return;
    }
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    });
  };

  const hasCustomLabel = label !== undefined;
  const displayText = copied ? "✓ Copied" : hasCustomLabel ? label : `${id?.slice(0, 6)}…`;

  return (
    <span
      title={id}
      onClick={handleCopy}
      className={`cursor-pointer text-xs ${!hasCustomLabel || copied ? "text-blue-600 hover:text-blue-800" : ""}`}
    >
      {displayText}
    </span>
  );
};

export default CopyPasteTooltip;
