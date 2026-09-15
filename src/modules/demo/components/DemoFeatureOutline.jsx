import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import DemoActionButton from "./DemoActionButton";
import DemoOutlineChapter from "./DemoOutlineChapter";
import { DEMO_BUILDER_LEVELS } from "../utils/demo.constants";
import { toChapterLevel } from "../utils/demo.utils3";

const DemoFeatureOutline = ({
  feature = {},
  savedEntry = null,
  activePresetId,
  onSaveOutline,
  onOpenBuilder,
  onRemoveIntroAction,
  onAddChapter,
  onRemoveChapter,
}) => {
  const chapters = savedEntry?.chapters || [];
  const introAction = savedEntry?.introDemoAction || savedEntry?.demoAction;

  // warn until the preset has been saved
  const withSavedPreset = (action) => {
    if (!activePresetId) {
      toast.warn("Enter a demo name above and click Save first");
      return;
    }
    action();
  };

  const saveField = (updates) => {
    if (!activePresetId) return;
    onSaveOutline?.(feature.id, updates);
  };

  const saveChapterField = (index, field, value) =>
    saveField({
      chapters: chapters.map((c, i) =>
        i === index
          ? { title: c.title, summary: c.summary || "", [field]: value }
          : { title: c.title, summary: c.summary || "" },
      ),
    });

  return (
    <div className="px-5 pb-4 pt-2 border-t border-gray-100 bg-primary/2.5 space-y-3">
      {/* Headline */}
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
          Section Headline
        </label>
        <input
          type="text"
          defaultValue={savedEntry?.headline || ""}
          key={`headline-${feature.id}-${activePresetId}`}
          placeholder={feature.name}
          aria-label="Section Headline"
          onBlur={(e) => saveField({ headline: e.target.value })}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Intro */}
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {chapters.length > 0 ? "Intro" : "Narrative"} · Opening
          </span>
        </div>
        <div className="p-3 space-y-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">
              Narrative notes — AI writes the script from these
            </label>
            <textarea
              defaultValue={savedEntry?.intro || ""}
              key={`intro-${feature.id}-${activePresetId}`}
              rows={3}
              aria-label="Narrative notes"
              placeholder="What you want to say here — key points, tone cues, audience hooks…"
              onBlur={(e) => saveField({ intro: e.target.value })}
              className="w-full rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Demo action</label>
            {introAction?.steps?.length > 0 ? (
              <div className="flex items-center gap-2">
                <DemoActionButton
                  stepCount={introAction.steps.length}
                  onClick={() => onOpenBuilder?.(feature.id, DEMO_BUILDER_LEVELS.INTRO)}
                />
                <button
                  type="button"
                  onClick={() => onRemoveIntroAction?.(feature.id)}
                  title="Remove demo action"
                  aria-label="Remove demo action"
                  className="flex items-center justify-center rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={11} />
                </button>
              </div>
            ) : (
              <DemoActionButton
                onClick={() => withSavedPreset(() => onOpenBuilder?.(feature.id, DEMO_BUILDER_LEVELS.INTRO))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Chapters */}
      {chapters.map((ch, ci) => (
        <DemoOutlineChapter
          key={ci}
          chapter={ch}
          index={ci}
          fieldKey={`${feature.id}-${ci}-${activePresetId}`}
          onFieldBlur={saveChapterField}
          onRemove={() => onRemoveChapter?.(feature.id, ci)}
          onOpenBuilder={() => onOpenBuilder?.(feature.id, toChapterLevel(ci))}
        />
      ))}

      <button
        type="button"
        onClick={() => withSavedPreset(() => onAddChapter?.(feature.id))}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary hover:underline transition-colors"
      >
        <FiPlus size={11} /> Add Chapter
      </button>
      {!activePresetId && <p className="text-[10px] text-amber-500">Save a preset name above to enable editing</p>}
    </div>
  );
};

export default DemoFeatureOutline;
