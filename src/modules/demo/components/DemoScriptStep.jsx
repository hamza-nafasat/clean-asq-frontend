import { FiChevronDown, FiChevronUp, FiClock, FiZap } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import DemoScriptChapter from "./DemoScriptChapter";
import { DEMO_ACTION_PREVIEW_LIMIT, DEMO_BUILDER_LEVELS } from "../utils/demo.constants";
import { toChapterKey, toChapterLevel } from "../utils/demo.utils3";

const DemoScriptStep = ({
  step = {},
  index = 0,
  isExpanded = false,
  isEditing = false,
  editedNarrations = {},
  onToggle,
  onNarrationChange,
  onOpenBuilder,
}) => {
  const stepNarration = step.introNarration || step.narration;
  const introAction = step.introDemoAction || step.demoAction;
  const hasChapters = step.chapters?.length > 0;
  const introStepCount = introAction?.steps?.length || 0;

  return (
    <article className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle?.()}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-gray-400 w-5 text-right shrink-0">{index + 1}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-800 truncate">{step.headline || step.name}</p>
              {step.naturalPause && (
                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-1 shrink-0">
                  pause
                </span>
              )}
              {hasChapters ? (
                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5 shrink-0">
                  {step.chapters.length} chapter{step.chapters.length !== 1 ? "s" : ""}
                </span>
              ) : (
                introStepCount > 0 && (
                  <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 shrink-0 flex items-center gap-0.5">
                    <FiZap size={9} />
                    {introStepCount} action
                    {introStepCount !== 1 ? "s" : ""}
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{step.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {step.estimatedMins > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <FiClock size={11} />
              {step.estimatedMins}m
            </span>
          )}
          {isExpanded ? (
            <FiChevronUp size={14} className="text-gray-400" />
          ) : (
            <FiChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-primary/3">
          {/* Intro script */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <HiOutlineSparkles size={12} className="text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                {hasChapters ? "Intro Script" : "Script"}
              </span>
            </div>
            {isEditing ? (
              <textarea
                value={editedNarrations[step.id] ?? stepNarration ?? ""}
                onChange={(e) => onNarrationChange?.(step.id, e.target.value)}
                rows={5}
                aria-label="Script narration"
                className="w-full rounded-md border border-primary/30 bg-white px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {stepNarration || step.description}
              </p>
            )}

            {!hasChapters && introStepCount > 0 && (
              <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <FiZap size={11} className="text-green-600" />
                    <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">
                      Live Action · {introStepCount} step
                      {introStepCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenBuilder?.(step.id, DEMO_BUILDER_LEVELS.INTRO)}
                    className="text-[10px] text-green-600 hover:underline"
                  >
                    Edit in Builder →
                  </button>
                </div>
                <div className="space-y-1">
                  {introAction.steps.slice(0, DEMO_ACTION_PREVIEW_LIMIT).map((a, ai) => (
                    <div key={ai} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="font-mono text-green-700 shrink-0">{a.action}</span>
                      {a.selector && <span className="text-gray-400 truncate">{a.selector}</span>}
                      {a.value && <span className="text-gray-500 truncate">"{a.value}"</span>}
                    </div>
                  ))}
                  {introStepCount > DEMO_ACTION_PREVIEW_LIMIT && (
                    <p className="text-[10px] text-gray-400 italic">
                      +{introStepCount - DEMO_ACTION_PREVIEW_LIMIT} more…
                    </p>
                  )}
                </div>
              </div>
            )}
            {!hasChapters && introStepCount === 0 && !isEditing && (
              <button
                type="button"
                onClick={() => onOpenBuilder?.(step.id, DEMO_BUILDER_LEVELS.INTRO)}
                className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-primary transition-colors"
              >
                <FiZap size={11} /> Build live action for this step →
              </button>
            )}
          </div>

          {/* Chapters */}
          {hasChapters && (
            <div>
              <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
                {step.chapters.length} Chapter{step.chapters.length !== 1 ? "s" : ""}
              </span>
              <div className="space-y-2 mt-2">
                {step.chapters.map((ch, ci) => {
                  const chKey = toChapterKey(step.id, ci);
                  return (
                    <DemoScriptChapter
                      key={ci}
                      chapter={ch}
                      index={ci}
                      isEditing={isEditing}
                      editedNarration={editedNarrations[chKey]}
                      onNarrationChange={(value) => onNarrationChange?.(chKey, value)}
                      onOpenBuilder={() => onOpenBuilder?.(step.id, toChapterLevel(ci))}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default DemoScriptStep;
