import { useState, useRef, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack,
  FiX,
  FiCopy,
  FiCheck,
  FiUsers,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

/**
 * DemoRunner — the active demo control panel.
 * Shown in the "Run Demo" tab while a session is live.
 * Also handles navigation: when a step changes, navigates to that step's route.
 */
export default function DemoRunner({
  session,
  sessionStatus,
  currentIndex,
  totalSteps,
  currentStep,
  narration,
  questions,
  viewerCount,
  selectedSteps,
  features,
  onBegin,
  onNext,
  onPrev,
  onPause,
  onEnd,
  onQuestion,
}) {
  const [question, setQuestion] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showQA, setShowQA] = useState(true);
  const [showScript, setShowScript] = useState(true);
  const qaEndRef = useRef(null);
  const narrationRef = useRef(null);

  // Auto-scroll Q&A to bottom
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

  const copyViewerUrl = async () => {
    if (!session?.viewerUrl) return;
    await navigator.clipboard.writeText(session.viewerUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onQuestion(question.trim());
    setQuestion("");
  };

  const isRunning = sessionStatus === "running";
  const isPaused = sessionStatus === "paused";
  const isReady = sessionStatus === "ready";
  const isGenerating = sessionStatus === "generating";
  const isEnded = sessionStatus === "ended";

  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  // Build ordered step list for sidebar
  const orderedSteps = [...selectedSteps]
    .sort((a, b) => a.order - b.order)
    .map((s) => features.find((f) => f.id === s.featureId))
    .filter(Boolean);

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Left: step list sidebar */}
      <div className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Steps</p>
          <div className="space-y-0.5">
            {orderedSteps.map((feature, idx) => (
              <div
                key={feature.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                  idx === currentIndex && (isRunning || isPaused)
                    ? "bg-primary text-white"
                    : idx < currentIndex
                      ? "text-gray-400 line-through"
                      : "text-gray-600"
                }`}
              >
                <span className="w-4 text-right font-mono opacity-60 shrink-0">{idx + 1}</span>
                <span className="truncate">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status / waiting states */}
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
                onClick={onBegin}
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

          {(isRunning || isPaused) && (
            <>
              {/* Current step */}
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

              {/* Narration / script */}
              {showScript && narration && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <HiOutlineSparkles size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wide">Your Script</span>
                    </div>
                    <button onClick={() => setShowScript(false)} className="text-gray-300 hover:text-gray-500">
                      <FiChevronUp size={14} />
                    </button>
                  </div>
                  <p ref={narrationRef} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {narration}
                  </p>
                </div>
              )}
              {!showScript && (
                <button
                  onClick={() => setShowScript(true)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <HiOutlineSparkles size={12} /> Show script
                </button>
              )}
            </>
          )}

          {/* Q&A section */}
          {(isRunning || isPaused || isEnded) && questions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setShowQA((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FiMessageCircle size={14} />
                  Q&amp;A ({questions.length})
                </div>
                {showQA ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>

              {showQA && (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 px-4 pb-3">
                  {questions.map((q, i) => (
                    <div key={i} className="py-3 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5 shrink-0">
                          {q.from}
                        </span>
                        <p className="text-sm text-gray-700">{q.question}</p>
                      </div>
                      {q.answer ? (
                        <div className="flex items-start gap-2 ml-4">
                          <HiOutlineSparkles size={12} className="text-primary mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
                        </div>
                      ) : (
                        <div className="ml-4 flex items-center gap-1.5 text-xs text-gray-400 italic">
                          <span className="h-3 w-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                          Generating answer…
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={qaEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="border-t border-gray-200 bg-white px-6 py-3 space-y-3">
          {/* Viewer URL */}
          {session?.viewerUrl && !isEnded && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <FiUsers size={13} className="text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 truncate flex-1">{session.viewerUrl}</span>
              {viewerCount > 0 && (
                <span className="text-xs text-green-600 font-medium shrink-0">{viewerCount} watching</span>
              )}
              <button
                onClick={copyViewerUrl}
                className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
              >
                {copiedUrl ? <FiCheck size={12} /> : <FiCopy size={12} />}
                {copiedUrl ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Ask a question (presenter) */}
          {(isRunning || isPaused) && (
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question or type one from the audience…"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <FiMessageCircle size={14} /> Ask AI
              </button>
            </form>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={onEnd}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiX size={13} /> End Demo
            </button>

            {(isRunning || isPaused) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <FiSkipBack size={13} /> Back
                </button>
                <button
                  onClick={onPause}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {isPaused ? <FiPlay size={13} /> : <FiPause size={13} />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={onNext}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Next <FiSkipForward size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
