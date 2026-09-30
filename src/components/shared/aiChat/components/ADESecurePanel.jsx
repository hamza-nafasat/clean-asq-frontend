import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

const ADESecurePanel = ({ fieldLabel, explanation, accentColor, onComplete, onCancel }) => {
  const [secureValue, setSecureValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handleSecureSubmit = () => {
    if (!secureValue.trim()) return;
    onComplete(secureValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSecureSubmit();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
          <span>🔒</span>
          <span>Secure entry — {fieldLabel}</span>
        </div>
        <button onClick={onCancel} className="p-0.5 text-amber-600 hover:text-amber-800">
          <IoClose size={16} />
        </button>
      </div>

      {/* AI explanation */}
      {explanation && <p className="mb-2 text-xs leading-snug text-amber-700">{explanation}</p>}

      <p className="mb-2 text-xs text-amber-600">
        Your entry is captured directly on this device and never sent to AI servers.
      </p>

      {/* Masked input */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type={showValue ? "text" : "password"}
          value={secureValue}
          onChange={(e) => setSecureValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${fieldLabel}…`}
          autoComplete="off"
          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 pr-10 text-sm text-gray-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300"
        />
        <button
          type="button"
          onClick={() => setShowValue((v) => !v)}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-amber-600 select-none hover:text-amber-800"
          tabIndex={-1}
        >
          {showValue ? "hide" : "show"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSecureSubmit}
          disabled={!secureValue.trim()}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          Submit Securely 🔒
        </button>
      </div>
    </div>
  );
};

export default ADESecurePanel;
