import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

/**
 * Assisted Direct Entry panel — renders inside the chat widget when the AI
 * calls openFieldPanel.
 *
 * fieldMode="secure"  — shows a masked input; value is captured locally and
 *                       filled into the DOM directly, never sent to AI servers.
 * fieldMode="direct"  — scrolls to and focuses the real form field so the
 *                       applicant can use native UI (Google Places, date picker,
 *                       etc.). A "Done" button closes the panel when finished.
 *
 * Props
 *   fieldId      string   id/name of the target field
 *   fieldLabel   string   human-readable field name shown in the panel header
 *   fieldMode    "secure" | "direct"
 *   explanation  string   AI-provided instruction shown to the applicant
 *   accentColor  string   theme colour for the primary button
 *   onComplete   (value: string) => void   called with entered/read value
 *   onCancel     () => void
 */
export default function ADEPanel({ fieldId, fieldLabel, fieldMode, isRequired = true, explanation, accentColor = "#6366f1", onComplete, onCancel }) {
  const [secureValue, setSecureValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [fieldFocused, setFieldFocused] = useState(false);
  const inputRef = useRef(null);

  // Keep a stable ref to onComplete so event listeners never close over a stale copy
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  // Focus the secure input on mount
  useEffect(() => {
    if (fieldMode === "secure") {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [fieldMode]);

  // For direct mode: scroll to and focus the real field on mount
  useEffect(() => {
    if (fieldMode !== "direct") return;
    const el =
      document.getElementById(fieldId) ||
      document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        el.focus();
        setFieldFocused(true);
      }, 400);
    }
  }, [fieldId, fieldMode]);

  // For direct mode: auto-detect when the field has been filled and call onComplete.
  //
  // Authoritative completion signals (always accepted):
  //   blur      — user clicked away or tabbed out
  //   Enter key — user explicitly confirmed
  //   Tab key   — user moved to next field (blur fires too, but catching keydown
  //               first ensures we complete before focus shifts)
  //
  // Date picker "change" events (accepted only if user is NOT typing):
  //   For <input type="date">, the browser fires "change" after EACH typed segment
  //   (month done → change, day done → change, first digit of year → change).
  //   We track digit keydowns to set an isTyping flag; a "change" event while
  //   isTyping is true is ignored (mid-entry). A "change" from the calendar picker
  //   arrives without any preceding digit keydown, so isTyping is false → accepted.
  //
  // Non-date fields: "change" is always accepted (fires only on actual value commit).
  useEffect(() => {
    if (fieldMode !== "direct") return;
    const el =
      document.getElementById(fieldId) ||
      document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
    if (!el) return;

    const isDateField = el.type === "date";
    let completed = false;
    let isTyping = false;
    let typingTimer = null;

    // Always read el.value at call time (not a cached snapshot) so that any
    // state update that ran between scheduling and firing is included — this
    // covers both native browser autocomplete (fills el.value synchronously
    // as part of the browser's default action) and React-controlled custom
    // autocomplete dropdowns (which update el.value via a React state commit).
    const tryComplete = (source) => {
      if (completed) return;
      const value = el.value ?? "";

      // For date fields: if the user is actively typing, suppress change events
      // (they fire mid-entry after each completed segment). blur/Enter/Tab are
      // always treated as authoritative regardless of isTyping.
      if (isDateField && source === "change" && isTyping) return;

      // For non-explicit signals (blur/change), don't complete on empty — the field
      // just gained and lost focus without input. Only Tab/Enter explicitly skip.
      if (!value.trim() && source !== "tab" && source !== "enter") return;

      completed = true;
      clearTimeout(typingTimer);
      onCompleteRef.current(value);
    };

    // All completion signals are delayed so that:
    //  • Browser's default action (Tab/Enter accepting an inline suggestion)
    //    has time to fill el.value before we read it.
    //  • React state commits from custom autocomplete dropdowns (which update
    //    el.value via a React re-render) have time to complete.
    // The `completed` flag prevents any double-firing.
    //
    // Timing:
    //   Tab/Enter  → 150 ms  (browser fill is sync but React commit needs ~1 frame)
    //   blur       → 200 ms  (generous margin for both fill styles)
    //   change     →  50 ms  (fires after value is already committed)
    const onBlur    = () => setTimeout(() => tryComplete("blur"),   200);
    const onChange  = () => setTimeout(() => tryComplete("change"),  50);
    const onKeyDown = (e) => {
      if (isDateField && /^[0-9]$/.test(e.key)) {
        // User is typing digits into the date field — suppress change events
        // until they stop typing for 3 s.
        isTyping = true;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => { isTyping = false; }, 3000);
      }
      if (e.key === "Enter") setTimeout(() => tryComplete("enter"), 150);
      if (e.key === "Tab")   setTimeout(() => tryComplete("tab"),   150);
    };

    el.addEventListener("blur",    onBlur);
    el.addEventListener("change",  onChange);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(typingTimer);
      el.removeEventListener("blur",    onBlur);
      el.removeEventListener("change",  onChange);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [fieldId, fieldMode]);

  const handleSecureSubmit = () => {
    if (!secureValue.trim()) return;
    onComplete(secureValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSecureSubmit();
    if (e.key === "Escape") onCancel();
  };

  const handleGoToField = () => {
    const el =
      document.getElementById(fieldId) ||
      document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 300);
    }
  };

  /* ── Secure panel ──────────────────────────────────────────────────────── */
  if (fieldMode === "secure") {
    return (
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 shadow-sm text-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <span>🔒</span>
            <span>Secure entry — {fieldLabel}</span>
          </div>
          <button onClick={onCancel} className="text-amber-600 hover:text-amber-800 p-0.5">
            <IoClose size={16} />
          </button>
        </div>

        {/* AI explanation */}
        {explanation && (
          <p className="text-amber-700 mb-2 text-xs leading-snug">{explanation}</p>
        )}

        <p className="text-xs text-amber-600 mb-2">
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
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowValue((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-600 hover:text-amber-800 select-none"
            tabIndex={-1}
          >
            {showValue ? "hide" : "show"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
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
  }

  /* ── Direct-entry panel ────────────────────────────────────────────────── */
  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 shadow-sm text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <span>⚡</span>
          <span>{fieldLabel}</span>
        </div>
        <button onClick={onCancel} className="text-blue-600 hover:text-blue-800 p-0.5">
          <IoClose size={16} />
        </button>
      </div>

      {/* AI explanation */}
      {explanation && (
        <p className="text-blue-700 mb-2 text-xs leading-snug">{explanation}</p>
      )}

      <p className="text-xs text-blue-600 mb-3">
        {fieldFocused
          ? isRequired
            ? "Fill the highlighted field on the form — the assistant will continue automatically when done."
            : "This field is optional — fill it on the form, or click Skip to leave it blank. The assistant will continue automatically when done."
          : isRequired
            ? "The field is being highlighted on the form — fill it there and the assistant will continue automatically."
            : "This field is optional — the field is being highlighted on the form. Fill it there, or click Skip to leave it blank."}
      </p>

      {/* Actions */}
      <div className="flex gap-2 justify-between">
        <button
          onClick={handleGoToField}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-300 hover:bg-blue-100 transition-colors"
        >
          Go to field ↗
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {isRequired ? "Cancel" : "Skip"}
        </button>
      </div>
    </div>
  );
}
