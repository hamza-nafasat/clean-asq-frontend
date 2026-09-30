import { ghostBtn, primaryBtn, secondaryBtn } from "../utils/aiChat.fieldErrorButtons.utils.js";

const FieldErrorChoices = ({ suggestion, accent, onUseSuggestion, onChange, onKeep }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    {suggestion && (
      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Did you mean?
        </span>
        <div
          style={{
            marginTop: "4px",
            padding: "6px 10px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#14532d",
            wordBreak: "break-all",
          }}
        >
          {suggestion}
        </div>
      </div>
    )}

    <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "4px" }}>
      {suggestion && (
        <button onClick={onUseSuggestion} style={primaryBtn(accent)}>
          Yes, use this correction
        </button>
      )}
      <button onClick={onChange} style={suggestion ? secondaryBtn : primaryBtn(accent)}>
        Type a different value
      </button>
      <button onClick={onKeep} style={ghostBtn}>
        Keep as entered
      </button>
    </div>
  </div>
);

export default FieldErrorChoices;
