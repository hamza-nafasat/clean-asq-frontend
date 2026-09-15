import DemoFeatureOutline from "./DemoFeatureOutline";
import DemoFeatureRow from "./DemoFeatureRow";
import { findSavedEntry } from "../utils/demo.utils3";

const DemoFeatureList = ({
  features = [],
  categories = [],
  selectedSteps = [],
  activePreset = null,
  collapsedOutline = {},
  savingOutline = {},
  onSelectAll,
  onClear,
  onToggleFeature,
  onToggleOutline,
  onSaveOutline,
  onOpenBuilder,
  onRemoveIntroAction,
  onAddChapter,
  onRemoveChapter,
}) => (
  <section className="flex-1 overflow-y-auto">
    {/* Selection summary */}
    <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
      <p className="text-xs text-gray-500">
        {selectedSteps.length > 0 ? (
          <>
            <span className="font-medium text-gray-700">{selectedSteps.length}</span> feature
            {selectedSteps.length !== 1 ? "s" : ""} selected
          </>
        ) : (
          "No features selected — check items below to include them in the presentation"
        )}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onSelectAll?.()} className="text-xs text-primary hover:underline">
          Select all
        </button>
        <button type="button" onClick={() => onClear?.()} className="text-xs text-gray-400 hover:underline">
          Clear
        </button>
      </div>
    </div>

    {categories.map((cat) => {
      const catFeatures = features.filter((f) => f.category === cat);
      const selectedInCat = catFeatures.filter((f) => selectedSteps.some((s) => s.featureId === f.id)).length;
      return (
        <div key={cat}>
          <div className="flex items-center justify-between px-5 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{cat}</span>
            <span className="text-[10px] text-gray-400">
              {selectedInCat}/{catFeatures.length}
            </span>
          </div>

          {catFeatures.map((feat) => {
            const isSelected = selectedSteps.some((s) => s.featureId === feat.id);
            const savedEntry = findSavedEntry(activePreset, feat.id);
            const isExpanded = isSelected && collapsedOutline[feat.id] !== true;
            return (
              <DemoFeatureRow
                key={feat.id}
                feature={feat}
                savedEntry={savedEntry}
                isSelected={isSelected}
                isExpanded={isExpanded}
                isSaving={savingOutline[feat.id]}
                onToggle={() => onToggleFeature?.(feat.id)}
                onToggleOutline={() => onToggleOutline?.(feat.id, isExpanded)}
              >
                {isSelected && isExpanded && (
                  <DemoFeatureOutline
                    feature={feat}
                    savedEntry={savedEntry}
                    activePresetId={activePreset?._id}
                    onSaveOutline={onSaveOutline}
                    onOpenBuilder={onOpenBuilder}
                    onRemoveIntroAction={onRemoveIntroAction}
                    onAddChapter={onAddChapter}
                    onRemoveChapter={onRemoveChapter}
                  />
                )}
              </DemoFeatureRow>
            );
          })}
        </div>
      );
    })}

    {features.length === 0 && <div className="text-center py-16 text-sm text-gray-400">Loading features…</div>}
  </section>
);

export default DemoFeatureList;
