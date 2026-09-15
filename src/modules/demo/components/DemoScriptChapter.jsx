import { FiZap } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

const DemoScriptChapter = ({
  chapter = {},
  index = 0,
  isEditing = false,
  editedNarration,
  onNarrationChange,
  onOpenBuilder,
}) => {
  const stepCount = chapter.demoAction?.steps?.length || 0;

  return (
    <div className="rounded-md border border-purple-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-purple-50">
        <span className="text-xs font-semibold text-purple-700">{chapter.title || `Chapter ${index + 1}`}</span>
        <div className="flex items-center gap-2">
          {stepCount > 0 && (
            <span className="text-[10px] text-green-600 flex items-center gap-0.5">
              <FiZap size={9} />
              {stepCount} action
              {stepCount !== 1 ? "s" : ""}
            </span>
          )}
          {!isEditing && (
            <button type="button" onClick={() => onOpenBuilder?.()} className="text-[10px] text-purple-500 hover:underline">
              {stepCount > 0 ? "Edit action →" : "Build action →"}
            </button>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 mb-1">
          <HiOutlineSparkles size={10} className="text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Script</span>
        </div>
        {isEditing ? (
          <textarea
            value={editedNarration ?? chapter.narration ?? ""}
            onChange={(e) => onNarrationChange?.(e.target.value)}
            rows={4}
            aria-label={`Chapter ${index + 1} script`}
            className="w-full rounded-md border border-primary/30 bg-white px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {chapter.narration || (
              <span className="text-gray-400 italic">No script yet — click Edit Script above to add narration.</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default DemoScriptChapter;
