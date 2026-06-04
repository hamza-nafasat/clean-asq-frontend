import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";

/**
 * Pre-fill notification — shown when the DB has pre-populated fields on a new
 * form screen. Lets the applicant scan the values before continuing. If anything
 * is wrong they correct it directly on the form after dismissing this dialog.
 *
 * Props:
 *   preFilled       Array<{ id, label, type, value }>
 *   remaining       Array<{ id, label, required }>
 *   headerBg        Brand header background colour
 *   headerTextColor Contrasting text/icon colour for the header
 *   accentColor     Brand accent colour for the primary button
 *   fontFamily      Brand font family name
 *   onDismiss       () => void
 */
export default function PreFillModal({
  preFilled = [],
  remaining = [],
  headerBg,
  headerTextColor,
  accentColor,
  buttonColor,
  buttonTextColor,
  fontFamily,
  onDismiss,
  // legacy aliases
  onConfirm,
  onSkip,
}) {
  const dismiss = onDismiss || onConfirm || onSkip || (() => {});
  const accent    = accentColor    || "#6366f1";
  const hBg       = headerBg       || accent;
  const hText     = headerTextColor || "#ffffff";
  const btnBg     = buttonColor     || accent;
  const btnText   = buttonTextColor || "#ffffff";
  const fontStack = fontFamily ? `"${fontFamily}", sans-serif` : "inherit";

  return (
    <>
      <style>{`@keyframes pfm-spin { to { transform: rotate(360deg); } }`}</style>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 99996 }}
        onClick={dismiss}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pfm-title"
        data-prefill-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99997,
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "min(80vh, 680px)",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 36px rgba(0,0,0,0.24)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: fontStack,
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px 11px",
          backgroundColor: hBg,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: hText }} id="pfm-title">
              Some fields have been pre-filled
            </div>
            <div style={{ fontSize: "12px", color: hText, opacity: 0.8, marginTop: "1px" }}>
              Please scan the values below — correct anything that's wrong directly on the form
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: hText, opacity: 0.8, padding: "4px",
              display: "flex", alignItems: "center", flexShrink: 0,
            }}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>
            The following information was filled in automatically. Take a moment to confirm it looks right — if anything needs updating, close this and edit the field directly on the form.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {preFilled.map((field) => (
              <div key={field.id} style={{
                padding: "8px 12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>
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

          {remaining.length > 0 && (
            <div style={{
              padding: "12px 14px",
              backgroundColor: "#f8f9ff",
              border: "1px solid #e0e7ff",
              borderRadius: "8px",
            }}>
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
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #e5e7eb",
          flexShrink: 0,
          backgroundColor: "#fff",
        }}>
          <button
            onClick={dismiss}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: btnBg,
              color: btnText,
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: fontStack,
            }}
          >
            <IoCheckmarkCircle size={16} />
            Got it — take me to the form
          </button>
        </div>
      </div>
    </>
  );
}
