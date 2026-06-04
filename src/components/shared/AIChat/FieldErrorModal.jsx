import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

/**
 * "Confirm or Change" dialog shown when the silent field-error monitor detects
 * an obvious typo or validation problem in an applicant form field.
 *
 * Props:
 *   fieldLabel      {string}        Human-readable label of the field
 *   currentValue    {string}        The value the applicant entered
 *   description     {string}        One-sentence description of the suspected error
 *   suggestion      {string|null}   Corrected value (null = no automatic fix available)
 *   retryNote       {string|null}   Optional advisory shown below the error (e.g. for email fields)
 *   headerBg        {string}        Brand header background colour
 *   headerTextColor {string}        Contrasting text/icon colour for the header
 *   accentColor     {string}        Brand accent colour for primary action buttons
 *   fontFamily      {string}        Brand font family name
 *   onKeep          {() => void}    Called when the applicant confirms their value
 *   onSave          {(value:string) => void}  Called with the accepted / typed value
 */
export default function FieldErrorModal({
  fieldLabel,
  fieldType,
  currentValue,
  description,
  suggestion,
  retryNote,
  headerBg,
  headerTextColor,
  accentColor,
  fontFamily,
  onKeep,
  onSave,
}) {
  const accent     = accentColor || "#6366f1";
  const hBg        = headerBg    || accent;
  const hText      = headerTextColor || "#ffffff";
  const fontStack  = fontFamily  ? `"${fontFamily}", sans-serif` : "inherit";

  const [changing, setChanging] = useState(false);
  const [editValue, setEditValue] = useState(suggestion ?? currentValue ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    setChanging(false);
    setEditValue(suggestion ?? currentValue ?? "");
  }, [fieldLabel, currentValue, suggestion]);

  useEffect(() => {
    if (changing) {
      const t = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 60);
      return () => clearTimeout(t);
    }
  }, [changing]);

  const handleSave = () => onSave(editValue.trim() || currentValue);

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); onKeep(); }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.40)", zIndex: 99998 }}
        onClick={onKeep}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fem-title"
        data-field-error-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          width: "min(420px, calc(100vw - 32px))",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
          overflow: "hidden",
          fontFamily: fontStack,
        }}
      >
        {/* Header — brand colours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px 11px",
            backgroundColor: hBg,
          }}
        >
          <span
            id="fem-title"
            style={{ fontWeight: 700, fontSize: "14px", color: hText }}
          >
            Check this entry
          </span>
          <button
            onClick={onKeep}
            aria-label="Dismiss"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: hText, opacity: 0.8, padding: "2px",
              display: "flex", alignItems: "center",
            }}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px 16px" }}>

          {/* Field label + error description */}
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
            <strong style={{ color: "#111827" }}>{fieldLabel}:</strong>{" "}
            {description}
          </p>

          {/* Retry advisory (email fields only) */}
          {retryNote && (
            <p style={{
              margin: "0 0 12px",
              padding: "8px 10px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#92400e",
              lineHeight: "1.5",
            }}>
              {retryNote}
            </p>
          )}

          {/* Current value pill */}
          <div style={{ marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              You entered
            </span>
            <div style={{
              marginTop: "4px",
              padding: "6px 10px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#7f1d1d",
              wordBreak: "break-all",
            }}>
              {currentValue}
            </div>
          </div>

          {/* Change mode — editable input */}
          {changing ? (
            <>
              <label
                htmlFor="fem-input"
                style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
              >
                {fieldType === "date" ? "Select the correct date:" : "Type the correct value:"}
              </label>
              <input
                id="fem-input"
                ref={inputRef}
                type={fieldType === "date" ? "date" : "text"}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={fieldType === "date" ? undefined : (suggestion || currentValue)}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  border: `1.5px solid ${accent}`,
                  borderRadius: "7px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  marginBottom: "12px",
                  fontFamily: fontStack,
                }}
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => setChanging(false)} style={secondaryBtn}>Back</button>
                <button onClick={handleSave} style={primaryBtn(accent)}>Save</button>
              </div>
            </>

          ) : (
            /* Default mode — action buttons */
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

              {suggestion && (
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Did you mean?
                  </span>
                  <div style={{
                    marginTop: "4px",
                    padding: "6px 10px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#14532d",
                    wordBreak: "break-all",
                  }}>
                    {suggestion}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "4px" }}>
                {suggestion && (
                  <button onClick={() => onSave(suggestion)} style={primaryBtn(accent)}>
                    Yes, use this correction
                  </button>
                )}
                <button onClick={() => setChanging(true)} style={suggestion ? secondaryBtn : primaryBtn(accent)}>
                  Type a different value
                </button>
                <button onClick={onKeep} style={ghostBtn}>
                  Keep as entered
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shared button styles ───────────────────────────────────────────────────
const primaryBtn = (accent) => ({
  width: "100%",
  padding: "9px 14px",
  borderRadius: "7px",
  border: "none",
  background: accent,
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
});

const secondaryBtn = {
  padding: "8px 14px",
  borderRadius: "7px",
  border: "1px solid #d1d5db",
  background: "#f9fafb",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const ghostBtn = {
  width: "100%",
  padding: "7px 14px",
  borderRadius: "7px",
  border: "1px solid #e5e7eb",
  background: "transparent",
  color: "#6b7280",
  fontSize: "12px",
  cursor: "pointer",
  textAlign: "center",
};
