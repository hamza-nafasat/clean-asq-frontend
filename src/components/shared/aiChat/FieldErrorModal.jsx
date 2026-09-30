import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import FieldErrorChoices from "./components/FieldErrorChoices.jsx";
import FieldErrorDetails from "./components/FieldErrorDetails.jsx";
import FieldErrorEditForm from "./components/FieldErrorEditForm.jsx";
import { DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_TEXT_COLOR } from "./utils/aiChat.constants.js";

const FieldErrorModal = ({
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
}) => {
  const accent = accentColor || DEFAULT_ACCENT_COLOR;
  const hBg = headerBg || accent;
  const hText = headerTextColor || DEFAULT_ACCENT_TEXT_COLOR;
  const fontStack = fontFamily ? `"${fontFamily}", sans-serif` : "inherit";

  const [changing, setChanging] = useState(false);
  const [editValue, setEditValue] = useState(suggestion ?? currentValue ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    setChanging(false);
    setEditValue(suggestion ?? currentValue ?? "");
  }, [fieldLabel, currentValue, suggestion]);

  useEffect(() => {
    if (changing) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [changing]);

  const handleSave = () => onSave(editValue.trim() || currentValue);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onKeep();
    }
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px 11px",
            backgroundColor: hBg,
          }}
        >
          <span id="fem-title" style={{ fontWeight: 700, fontSize: "14px", color: hText }}>
            Check this entry
          </span>
          <button
            onClick={onKeep}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: hText,
              opacity: 0.8,
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px 16px" }}>
          <FieldErrorDetails
            fieldLabel={fieldLabel}
            description={description}
            retryNote={retryNote}
            currentValue={currentValue}
          />

          {changing ? (
            <FieldErrorEditForm
              inputRef={inputRef}
              fieldType={fieldType}
              editValue={editValue}
              setEditValue={setEditValue}
              suggestion={suggestion}
              currentValue={currentValue}
              accent={accent}
              fontStack={fontStack}
              onKeyDown={handleKeyDown}
              onBack={() => setChanging(false)}
              onSave={handleSave}
            />
          ) : (
            <FieldErrorChoices
              suggestion={suggestion}
              accent={accent}
              onUseSuggestion={() => onSave(suggestion)}
              onChange={() => setChanging(true)}
              onKeep={onKeep}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default FieldErrorModal;
