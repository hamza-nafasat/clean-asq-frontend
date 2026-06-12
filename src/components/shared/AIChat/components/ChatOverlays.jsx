import PreFillModal from "../PreFillModal.jsx";
import FieldErrorModal from "../FieldErrorModal.jsx";

export default function ChatOverlays({
  preFillModal,
  fieldErrorModal,
  translationTooltip,
  effectiveHeaderColor,
  headerIconColor,
  primaryColor,
  buttonTextPrimary,
  fontFamily,
  handlePreFillConfirm,
  handlePreFillSkip,
  handleFieldErrorKeep,
  handleFieldErrorSave,
}) {
  return (
    <>
      {preFillModal && (
        <PreFillModal
          preFilled={preFillModal.preFilled}
          remaining={preFillModal.remaining}
          headerBg={effectiveHeaderColor}
          headerTextColor={headerIconColor}
          accentColor={effectiveHeaderColor}
          buttonColor={primaryColor}
          buttonTextColor={buttonTextPrimary}
          fontFamily={fontFamily}
          onConfirm={handlePreFillConfirm}
          onSkip={handlePreFillSkip}
        />
      )}

      {fieldErrorModal && (
        <FieldErrorModal
          fieldLabel={fieldErrorModal.fieldLabel}
          fieldType={fieldErrorModal.fieldType}
          currentValue={fieldErrorModal.currentValue}
          description={fieldErrorModal.description}
          suggestion={fieldErrorModal.suggestion}
          retryNote={fieldErrorModal.retryNote}
          headerBg={effectiveHeaderColor}
          headerTextColor={headerIconColor}
          accentColor={effectiveHeaderColor}
          fontFamily={fontFamily}
          onKeep={handleFieldErrorKeep}
          onSave={handleFieldErrorSave}
        />
      )}

      {translationTooltip && (
        <div
          style={{
            position: "fixed",
            left: translationTooltip.x,
            top: translationTooltip.y,
            transform: "translate(-50%, -100%)",
            zIndex: 99999,
            pointerEvents: "none",
            background: "rgba(30,20,60,0.92)",
            color: "#fff",
            fontSize: "12px",
            lineHeight: "1.4",
            padding: "4px 10px",
            borderRadius: "6px",
            maxWidth: "260px",
            whiteSpace: "normal",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {translationTooltip.text}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
