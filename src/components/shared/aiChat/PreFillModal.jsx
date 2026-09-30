import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import PreFillFieldList from "./components/PreFillFieldList.jsx";
import PreFillRemainingList from "./components/PreFillRemainingList.jsx";
import { DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_TEXT_COLOR } from "./utils/aiChat.constants.js";

// pre-filled fields notice
const PreFillModal = ({
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
}) => {
  const dismiss = onDismiss || onConfirm || onSkip || (() => {});
  const accent = accentColor || DEFAULT_ACCENT_COLOR;
  const hBg = headerBg || accent;
  const hText = headerTextColor || DEFAULT_ACCENT_TEXT_COLOR;
  const btnBg = buttonColor || accent;
  const btnText = buttonTextColor || DEFAULT_ACCENT_TEXT_COLOR;
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px 11px",
            backgroundColor: hBg,
            flexShrink: 0,
          }}
        >
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
              background: "none",
              border: "none",
              cursor: "pointer",
              color: hText,
              opacity: 0.8,
              padding: "4px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>
            The following information was filled in automatically. Take a moment to confirm it looks right — if anything
            needs updating, close this and edit the field directly on the form.
          </p>

          <PreFillFieldList fields={preFilled} />

          {remaining.length > 0 && <PreFillRemainingList remaining={remaining} />}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            flexShrink: 0,
            backgroundColor: "#fff",
          }}
        >
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
};

export default PreFillModal;
