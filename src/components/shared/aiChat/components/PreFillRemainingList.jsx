const PreFillRemainingList = ({ remaining }) => (
  <div
    style={{
      padding: "12px 14px",
      backgroundColor: "var(--color-chatBackground)",
      border: "1px solid #e0e7ff",
      borderRadius: "8px",
    }}
  >
    <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
      Still to complete ({remaining.length} field{remaining.length !== 1 ? "s" : ""}):
    </p>
    <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: "12px", color: "#6b7280", lineHeight: 1.8 }}>
      {remaining.map((f) => (
        <li key={f.id}>
          {f.label}
          {f.required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
        </li>
      ))}
    </ul>
  </div>
);

export default PreFillRemainingList;
