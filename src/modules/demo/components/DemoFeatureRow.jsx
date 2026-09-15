import { FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";

const DemoFeatureRow = ({
  feature = {},
  savedEntry = null,
  isSelected = false,
  isExpanded = false,
  isSaving = false,
  onToggle,
  onToggleOutline,
  children = null,
}) => {
  const chapters = savedEntry?.chapters || [];
  const introAction = savedEntry?.introDemoAction || savedEntry?.demoAction;

  return (
    <div className={`border-b border-gray-100 transition-colors ${isSelected ? "bg-primary/2" : "bg-white"}`}>
      <div className="flex items-center gap-3 px-5 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle?.()}
          aria-label={feature.name}
          className="accent-primary cursor-pointer shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
            {feature.name}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">{feature.description}</p>
        </div>
        {isSelected && savedEntry && (
          <div className="flex items-center gap-1.5 shrink-0">
            {savedEntry.headline && (
              <span className="text-[10px] text-primary/70 italic truncate max-w-32">"{savedEntry.headline}"</span>
            )}
            {chapters.length > 0 && (
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5">
                {chapters.length} ch
              </span>
            )}
            {introAction?.steps?.length > 0 && (
              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 flex items-center gap-0.5">
                <FiZap size={9} />
                {introAction.steps.length}
              </span>
            )}
          </div>
        )}
        {isSaving && <span className="text-[10px] text-gray-400 italic shrink-0">Saving…</span>}
        {isSelected && (
          <button
            type="button"
            onClick={() => onToggleOutline?.()}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            title={isExpanded ? "Collapse" : "Expand outline"}
            aria-label={isExpanded ? "Collapse" : "Expand outline"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default DemoFeatureRow;
