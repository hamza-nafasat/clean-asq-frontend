import { FiCheck, FiEdit2, FiRefreshCw, FiSave, FiX } from "react-icons/fi";
import { DEMO_PERSONA_PREVIEW_LENGTH, DEMO_SCRIPT_SOURCES } from "../utils/demo.constants";

const DemoScriptHeader = ({
  displayScript = [],
  scriptSource = null,
  savedScriptDate = null,
  activePreset = null,
  isEditing = false,
  isSavingScript = false,
  isStarting = false,
  hasSelection = false,
  onSaveEdits,
  onCancelEditing,
  onStartEditing,
  onRegenerate,
  onSaveToPreset,
}) => {
  const isSaved = scriptSource === DEMO_SCRIPT_SOURCES.SAVED;
  const persona = activePreset?.scriptPersonalityPrompt;

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-gray-800">{isSaved ? "Saved Script" : "Generated Script"}</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {displayScript.length} step{displayScript.length !== 1 ? "s" : ""}
          {" · "}
          {displayScript.reduce((s, x) => s + (x.estimatedMins || 0), 0)} min estimated
          {isSaved && savedScriptDate && <span className="ml-1 text-green-600">· saved {savedScriptDate}</span>}
          {isSaved && persona && (
            <span className="ml-1 text-gray-400 italic">
              · persona: "{persona.slice(0, DEMO_PERSONA_PREVIEW_LENGTH)}
              {persona.length > DEMO_PERSONA_PREVIEW_LENGTH ? "…" : ""}"
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => onSaveEdits?.()}
              disabled={isSavingScript}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSavingScript ? (
                <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck size={13} />
              )}
              Save Edits
            </button>
            <button
              type="button"
              onClick={() => onCancelEditing?.()}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <FiX size={13} /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onStartEditing?.()}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiEdit2 size={13} /> Edit Script
            </button>
            <button
              type="button"
              onClick={() => onRegenerate?.()}
              disabled={isStarting || !hasSelection}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw size={13} /> Regenerate
            </button>
            {scriptSource === DEMO_SCRIPT_SOURCES.LIVE && activePreset?._id && (
              <button
                type="button"
                onClick={() => onSaveToPreset?.()}
                disabled={isSavingScript}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isSavingScript ? (
                  <span className="h-3 w-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                ) : (
                  <FiSave size={13} />
                )}
                Save to "{activePreset.name}"
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default DemoScriptHeader;
