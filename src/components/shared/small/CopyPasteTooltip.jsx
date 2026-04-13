import { useState } from "react";

const CopyPasteTooltip = ({ id }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      console.error("Copy failed");
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      {/* Short */}
      <span className="cursor-pointer font-medium">{id?.slice(0, 3)}...</span>

      {/* Tooltip */}
      {open && (
        <div className="absolute left-0 top-2 z-50 mt-2 min-w-[220px] w-full rounded border bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs break-all">{id}</span>

            <button onClick={handleCopy} className="p-1 hover:bg-gray-100 rounded">
              {copied ? "✓" : "📋"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyPasteTooltip;
