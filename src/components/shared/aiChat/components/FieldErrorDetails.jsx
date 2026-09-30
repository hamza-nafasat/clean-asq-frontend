const FieldErrorDetails = ({ fieldLabel, description, retryNote, currentValue }) => (
  <>
    {/* Field label and error */}
    <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
      <strong style={{ color: "#111827" }}>{fieldLabel}:</strong> {description}
    </p>

    {/* Retry advisory */}
    {retryNote && (
      <p
        style={{
          margin: "0 0 12px",
          padding: "8px 10px",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#92400e",
          lineHeight: "1.5",
        }}
      >
        {retryNote}
      </p>
    )}

    {/* Current value pill */}
    <div style={{ marginBottom: "14px" }}>
      <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        You entered
      </span>
      <div
        style={{
          marginTop: "4px",
          padding: "6px 10px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#7f1d1d",
          wordBreak: "break-all",
        }}
      >
        {currentValue}
      </div>
    </div>
  </>
);

export default FieldErrorDetails;
