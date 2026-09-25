import { FiSave } from "react-icons/fi";
import Spinner from "@/components/shared/Spinner";

const DemoBuilderSaveDialog = ({
  isOpen = false,
  featureName = "",
  presetLabel = "",
  isSaving = false,
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
              <Spinner size="md" tone="light" />
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
