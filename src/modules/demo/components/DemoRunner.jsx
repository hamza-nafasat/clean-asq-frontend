import { useState } from "react";
import { FiCheck, FiChevronUp, FiPlay } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import DemoRunnerControls from "./DemoRunnerControls";
import DemoRunnerQuestions from "./DemoRunnerQuestions";
import { DEMO_SESSION_STATUSES } from "../utils/demo.constants";

const DemoRunner = ({
  session = null,
  sessionStatus = null,
  currentIndex = 0,
  totalSteps = 0,
  currentStep = null,
  narration = "",
  questions = [],
  viewerCount = 0,
  selectedSteps = [],
  features = [],
  onBegin,
  onNext,
  onPrev,
  onPause,
  onEnd,
  onQuestion,
}) => {
  const [showScript, setShowScript] = useState(true);

  const isRunning = sessionStatus === DEMO_SESSION_STATUSES.RUNNING;
  const isPaused = sessionStatus === DEMO_SESSION_STATUSES.PAUSED;
  const isReady = sessionStatus === DEMO_SESSION_STATUSES.READY;
  const isGenerating = sessionStatus === DEMO_SESSION_STATUSES.GENERATING;
  const isEnded = sessionStatus === DEMO_SESSION_STATUSES.ENDED;
  const isLive = isRunning || isPaused;

  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  const orderedSteps = [...selectedSteps]
    .sort((a, b) => a.order - b.order)
    .map((s) => features.find((f) => f.id === s.featureId))
    .filter(Boolean);

  const getStepClass = (idx) => {
    if (idx === currentIndex && isLive) return "bg-primary text-white";
    if (idx < currentIndex) return "text-gray-400 line-through";
    return "text-gray-600";
  };

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Step list */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Steps</p>
          <div className="space-y-0.5">
            {orderedSteps.map((feature, idx) => (
              <div
                key={feature.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${getStepClass(idx)}`}
              >
                <span className="w-4 text-right font-mono opacity-60 shrink-0">{idx + 1}</span>
                <span className="truncate">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Generating your demo script…</p>
                <p className="text-xs text-gray-400 mt-1">
                  AI is preparing narration for all {totalSteps} steps. This takes about 15 seconds.
                </p>
              </div>
            </div>
          )}

          {isReady && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="rounded-full bg-green-100 p-4">
                <FiPlay size={28} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Your script is ready!</p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalSteps} steps prepared. Share the viewer URL with your audience, then click Begin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onBegin?.()}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <FiPlay size={14} /> Begin Demo
              </button>
            </div>
          )}

          {isEnded && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="rounded-full bg-gray-100 p-4">
                <FiCheck size={28} className="text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Demo complete</p>
                <p className="text-xs text-gray-400 mt-1">Thanks for presenting!</p>
              </div>
            </div>
          )}

          {isLive && (
            <>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">{currentStep?.category}</p>
                    <h2 className="text-base font-bold text-gray-800 mt-0.5">{currentStep?.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{currentStep?.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 font-mono">
                    {currentIndex + 1} / {totalSteps}
                  </span>
                </div>
              </div>

              {showScript && narration && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <HiOutlineSparkles size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wide">Your Script</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowScript(false)}
                      aria-label="Hide script"
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <FiChevronUp size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{narration}</p>
                </div>
              )}
              {!showScript && (
                <button
                  type="button"
                  onClick={() => setShowScript(true)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <HiOutlineSparkles size={12} /> Show script
                </button>
              )}
            </>
          )}

          {(isLive || isEnded) && <DemoRunnerQuestions questions={questions} />}
        </div>

        <DemoRunnerControls
          viewerUrl={session?.viewerUrl}
          viewerCount={viewerCount}
          currentIndex={currentIndex}
          isEnded={isEnded}
          isLive={isLive}
          isPaused={isPaused}
          onQuestion={onQuestion}
          onEnd={onEnd}
          onPrev={onPrev}
          onPause={onPause}
          onNext={onNext}
        />
      </div>
    </div>
  );
};

export default DemoRunner;
