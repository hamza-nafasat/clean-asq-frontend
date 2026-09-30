import { CgSpinner } from "react-icons/cg";

const PreFillFieldList = ({ fields }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
    {fields.map((field) => (
      <div
        key={field.id}
        style={{
          padding: "8px 12px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: "2px",
          }}
        >
          {field.label}
        </div>
        {field.isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af" }}>
            <CgSpinner style={{ animation: "pfm-spin 0.8s linear infinite", flexShrink: 0 }} size={14} />
            <em style={{ fontSize: "13px" }}>Loading…</em>
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "#111827", fontWeight: 500 }}>
            {field.value || <em style={{ color: "#9ca3af", fontWeight: 400 }}>—</em>}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default PreFillFieldList;
