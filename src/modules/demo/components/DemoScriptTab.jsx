import { HiOutlineSparkles } from "react-icons/hi";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import Spinner from "@/components/shared/Spinner";
import DemoScriptHeader from "./DemoScriptHeader";
import DemoScriptStep from "./DemoScriptStep";

const DemoScriptTab = ({
  isGenerating = false,
  generatingStepCount = 0,
  displayScript = [],
  scriptSource = null,
  savedScriptDate = null,
  activePreset = null,
  hasSelection = false,
  isStarting = false,
  editor = {},
  onRegenerate,
  onCreateScript,
  onGoToConfigure,
  onOpenBuilder,
}) => {
  const { isEditing, isSavingScript, expandedScript, setExpandedScript, editedNarrations, setEditedNarrations } = editor;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {isGenerating && (
        <LoadingState
          className="flex flex-col items-center justify-center py-20 gap-4"
          title="Writing your demo script…"
          description={<>AI is generating narration for {generatingStepCount} steps.</>}
        />
      )}

      {!isGenerating && displayScript.length > 0 && (
        <>
          <DemoScriptHeader
            displayScript={displayScript}
            scriptSource={scriptSource}
            savedScriptDate={savedScriptDate}
            activePreset={activePreset}
            isEditing={isEditing}
            isSavingScript={isSavingScript}
            isStarting={isStarting}
            hasSelection={hasSelection}
            onSaveEdits={editor.saveEdits}
            onCancelEditing={editor.cancelEditing}
            onStartEditing={editor.startEditing}
            onRegenerate={onRegenerate}
            onSaveToPreset={editor.saveScriptToPreset}
          />

          <div className="space-y-3">
            {displayScript.map((step, idx) => {
              const isExpanded = expandedScript[step.id] !== false;
              return (
                <DemoScriptStep
                  key={step.id || idx}
                  step={step}
                  index={idx}
                  isExpanded={isExpanded}
                  isEditing={isEditing}
                  editedNarrations={editedNarrations}
                  onToggle={() => setExpandedScript((p) => ({ ...p, [step.id]: !isExpanded }))}
                  onNarrationChange={(key, value) => setEditedNarrations((p) => ({ ...p, [key]: value }))}
                  onOpenBuilder={onOpenBuilder}
                />
              );
            })}
          </div>
        </>
      )}

      {!isGenerating && displayScript.length === 0 && (
        <EmptyState
          className="flex flex-col items-center justify-center py-20 gap-4"
          iconClassName="rounded-full bg-gray-100 p-5"
          icon={<HiOutlineSparkles size={28} className="text-gray-400" />}
          title="No script yet"
          description={
            hasSelection
              ? 'Use "Create Script" on the Configure tab to generate narration.'
              : "Go to Configure, select features, then come back here to generate a script."
          }
        >
          {!hasSelection && (
            <button type="button" onClick={() => onGoToConfigure?.()} className="text-sm text-primary hover:underline">
              Go to Configure →
            </button>
          )}
          {hasSelection && (
            <button
              type="button"
              onClick={() => onCreateScript?.()}
              disabled={isStarting}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isStarting ? (
                <Spinner size="md" tone="light" />
              ) : (
                <HiOutlineSparkles size={14} />
              )}
              {isStarting ? "Generating…" : "Create Script"}
            </button>
          )}
        </EmptyState>
      )}
    </div>
  );
};

export default DemoScriptTab;
