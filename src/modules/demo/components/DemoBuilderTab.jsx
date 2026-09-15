import { FiZap } from "react-icons/fi";
import DemoBuilderProposal from "./DemoBuilderProposal";
import { findSavedEntry, getBuilderLevelLabel } from "../utils/demo.utils3";

const DemoBuilderTab = ({ features = [], activePreset = null, builder = {}, onGoToConfigure }) => {
  const { builderFeatureId, builderLevel, builderProposedAction } = builder;

  if (!builderFeatureId) {
    return (
      <div className="h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4 py-20">
        <div className="rounded-full bg-gray-100 p-5">
          <FiZap size={28} className="text-gray-400" />
        </div>
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-gray-700">No active builder target</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Click <strong>"Build Demo"</strong> on any feature in the Configure tab's Presentation Outline to start
            building a live action sequence here.
          </p>
        </div>
        <button type="button" onClick={() => onGoToConfigure?.()} className="text-sm text-primary hover:underline">
          Go to Configure →
        </button>
      </div>
    );
  }

  const activeFeature = features.find((f) => f.id === builderFeatureId);
  const levelLabel = getBuilderLevelLabel(builderLevel, findSavedEntry(activePreset, builderFeatureId));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => builder.clearBuilderTarget?.()}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ← Configure
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-800">{activeFeature?.name || builderFeatureId}</h2>
          <p className="text-xs text-gray-500">
            Building: <span className="font-medium text-gray-700">{levelLabel}</span>
          </p>
        </div>
      </header>

      {!activePreset?._id && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Load or create a demo preset in the{" "}
          <button type="button" onClick={() => onGoToConfigure?.()} className="font-semibold underline">
            Configure tab
          </button>{" "}
          first — the Builder needs a preset to save into.
        </div>
      )}

      {builderProposedAction?.featureId === builderFeatureId ? (
        <DemoBuilderProposal
          proposedAction={builderProposedAction}
          canSave={Boolean(activePreset?._id)}
          isSaving={builder.isSavingAction}
          onSave={builder.saveBuilderAction}
          onClear={builder.clearProposedSteps}
          onRemoveStep={builder.removeProposedStep}
          onParamChange={builder.setProposedParam}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <FiZap size={24} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-600">No action built yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Use the AI chat widget (bottom right) to describe what you want to demonstrate for this level.
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoBuilderTab;
