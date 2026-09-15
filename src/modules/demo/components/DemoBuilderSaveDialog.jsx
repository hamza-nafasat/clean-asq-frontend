import { FiSave } from "react-icons/fi";

const DemoBuilderSaveDialog = ({
  isOpen = false,
  featureName = "",
  presetLabel = "",
  proposedTestCase = null,
  saveAsTest = true,
  isSaving = false,
  onSaveAsTestChange,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-96">
        <h3 className="text-base font-bold text-gray-800 mb-1">Save Demo Action</h3>
        <p className="text-sm text-gray-500 mb-4">
          Saving "{featureName}" demo action to preset <strong>{presetLabel}</strong>.
        </p>

        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={saveAsTest}
            onChange={(e) => onSaveAsTestChange?.(e.target.checked)}
            disabled={!proposedTestCase}
            className="mt-0.5"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Also create test case</span>
            <p className="text-xs text-gray-400 mt-0.5">
              {proposedTestCase
                ? `Will create "${proposedTestCase.name}" in the test suite.`
                : "No proposed test case yet — continue the interview to generate one."}
            </p>
          </div>
        </label>

        <footer className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.()}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSave size={14} />
            )}
            {isSaving ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DemoBuilderSaveDialog;
