import { IoClose } from "react-icons/io5";
import useDirectEntryField from "./hooks/useDirectEntryField.js";
import ADESecurePanel from "./components/ADESecurePanel.jsx";
import { DEFAULT_ACCENT_COLOR, FIELD_MODES } from "./utils/aiChat.constants.js";

// assisted direct entry panel
const ADEPanel = ({
  fieldId,
  fieldLabel,
  fieldMode,
  isRequired = true,
  explanation,
  accentColor = DEFAULT_ACCENT_COLOR,
  onComplete,
  onCancel,
}) => {
  const fieldFocused = useDirectEntryField({ fieldId, fieldMode, onComplete });

  if (fieldMode === FIELD_MODES.SECURE) {
    return (
      <ADESecurePanel
        fieldLabel={fieldLabel}
        explanation={explanation}
        accentColor={accentColor}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 text-sm shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <span>⚡</span>
          <span>{fieldLabel}</span>
        </div>
        <button onClick={onCancel} className="p-0.5 text-blue-600 hover:text-blue-800">
          <IoClose size={16} />
        </button>
      </div>

      {/* AI explanation */}
      {explanation && <p className="mb-2 text-xs leading-snug text-blue-700">{explanation}</p>}

      <p className="mb-3 text-xs text-blue-600">
        {fieldFocused
          ? isRequired
            ? "Fill the highlighted field on the form — the assistant will continue automatically when done."
            : "This field is optional — fill it on the form, or click Skip to leave it blank. The assistant will continue automatically when done."
          : isRequired
            ? "The field is being highlighted on the form — fill it there and the assistant will continue automatically."
            : "This field is optional — the field is being highlighted on the form. Fill it there, or click Skip to leave it blank."}
      </p>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          {isRequired ? "Cancel" : "Skip"}
        </button>
      </div>
    </div>
  );
};

export default ADEPanel;
