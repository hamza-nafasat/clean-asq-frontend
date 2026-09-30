import { FIELD_TYPES } from "@/constants";
import { primaryBtn, secondaryBtn } from "../utils/aiChat.fieldErrorButtons.utils.js";

const FieldErrorEditForm = ({
  inputRef,
  fieldType,
  editValue,
  setEditValue,
  suggestion,
  currentValue,
  accent,
  fontStack,
  onKeyDown,
  onBack,
  onSave,
}) => {
  const isDate = fieldType === FIELD_TYPES.DATE;

  return (
    <>
      <label htmlFor="fem-input" style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
        {isDate ? "Select the correct date:" : "Type the correct value:"}
      </label>
      <input
        id="fem-input"
        ref={inputRef}
        type={isDate ? "date" : "text"}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={isDate ? undefined : suggestion || currentValue}
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
        <button onClick={onBack} style={secondaryBtn}>
          Back
        </button>
        <button onClick={onSave} style={primaryBtn(accent)}>
          Save
        </button>
      </div>
    </>
  );
};

export default FieldErrorEditForm;
