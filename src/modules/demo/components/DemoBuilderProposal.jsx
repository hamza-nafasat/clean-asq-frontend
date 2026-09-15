import { FiSave, FiTrash2, FiX, FiZap } from "react-icons/fi";
import DemoBuilderVariables from "./DemoBuilderVariables";
import Spinner from "@/components/shared/Spinner";

const DemoBuilderProposal = ({
  proposedAction = {},
  canSave = false,
  isSaving = false,
  onSave,
  onClear,
  onRemoveStep,
  onParamChange,
}) => {
  const steps = proposedAction.demoAction?.steps;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FiZap size={14} className="text-primary" />
          <span className="text-sm font-semibold text-primary">Proposed Action</span>
          <span className="text-xs text-gray-500">({steps?.length || 0} steps)</span>
        </div>
        <div className="flex items-center gap-2">
          {canSave && (
            <button
              type="button"
              onClick={() => onSave?.()}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <Spinner tone="light" />
              ) : (
                <FiSave size={11} />
              )}
              {isSaving ? "Saving…" : "Save Action"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onClear?.()}
            title="Clear all steps"
            className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiTrash2 size={11} /> Clear
          </button>
        </div>
      </div>
      {proposedAction.narration && (
        <div className="rounded-md bg-white border border-gray-200 px-3 py-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Narration</p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{proposedAction.narration}</p>
        </div>
      )}
      <div className="rounded-md bg-white border border-gray-200 px-3 py-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Steps</p>
        <div className="space-y-1.5">
          {steps?.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs group">
              <span className="font-mono text-primary shrink-0 w-4 text-right mt-0.5">{i + 1}</span>
              <span className="font-semibold text-gray-700 shrink-0">{s.action}</span>
              {s.selector && <span className="text-gray-400 truncate">{s.selector}</span>}
              {s.value && <span className="text-primary/70 italic truncate">"{s.value}"</span>}
              {s.message && <span className="text-gray-500 truncate">{s.message}</span>}
              <button
                type="button"
                onClick={() => onRemoveStep?.(i)}
                className="ml-auto shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove step"
                aria-label="Remove step"
              >
                <FiX size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <DemoBuilderVariables
        steps={steps || []}
        overrides={proposedAction.demoAction?.paramOverrides || {}}
        onParamChange={onParamChange}
      />

      <p className="text-xs text-gray-500 italic">
        Review the steps above. Use the AI widget to request adjustments, or click Save Action when it looks right.
      </p>
    </div>
  );
};

export default DemoBuilderProposal;
