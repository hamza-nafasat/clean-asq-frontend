import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack,
  FiX,
  FiCopy,
  FiCheck,
  FiUsers,
  FiChevronUp,
  FiChevronDown,
  FiMessageCircle,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { runDemoSteps } from "../demoStepExecutor";
import { useDemoSession } from "@/hooks/DemoSessionContext";

/**
 * DemoFloatingPanel — persistent demo control panel.
 * Rendered in AdminDashboard so it survives route navigation.
 * Appears only when a demo session is active.
 */
export default function DemoFloatingPanel({ features = [] }) {
  const {
    session,
    sessionStatus,
    currentIndex,
    currentStep,
    narration,
    currentDemoAction,
    questions,
    viewerCount,
    sendBegin,
    sendNext,
    sendPrev,
    sendPause,
    sendEnd,
    sendQuestion,
  } = useDemoSession();

  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [question, setQuestion] = useState("");
  const [showQA, setShowQA] = useState(false);
  const [actionStatus, setActionStatus] = useState(null); // null | "running" | "done" | "error"
  const [actionErrors, setActionErrors] = useState([]); // failed step details
  const qaEndRef = useRef(null);
  const executingActionRef = useRef(false);

  const isGenerating = sessionStatus === "generating";
  const isReady = sessionStatus === "ready";
  const isRunning = sessionStatus === "running";
  const isPaused = sessionStatus === "paused";
  const isEnded = sessionStatus === "ended";
  const isActive = isGenerating || isReady || isRunning || isPaused || isEnded;

  // Navigate to feature route on step change
  useEffect(() => {
    if (!currentStep) return;
    const feature = features.find((f) => f.id === currentStep.id);
    if (feature?.route) navigate(feature.route);
  }, [currentStep, features, navigate]);

  // Execute demo action when currentDemoAction changes (set by narration SSE event).
  // Delay start by 1200ms to let the step-change navigation fully settle before
  // running DOM selectors (navigation and narration SSE events arrive ~ms apart).
  useEffect(() => {
    if (!currentDemoAction?.steps?.length) {
      console.log("[DemoAction] currentDemoAction empty/null — skipping executor", currentDemoAction);
      setActionStatus(null);
      setActionErrors([]);
      executingActionRef.current = false; // reset in case a previous run left it stuck
      return;
    }

    console.log(
      `[DemoAction] currentDemoAction received: ${currentDemoAction.steps.length} steps`,
      currentDemoAction.steps.map((s) => s.action),
    );

    if (executingActionRef.current) {
      console.warn("[DemoAction] executor already running — skipping duplicate trigger");
      return;
    }
    executingActionRef.current = true;
    setActionStatus("running");
    setActionErrors([]);

    const timer = setTimeout(() => {
      console.log("[DemoAction] starting runDemoSteps after navigation settle");
      runDemoSteps(currentDemoAction.steps, {
        navigate,
        paramOverrides: currentDemoAction.paramOverrides || {},
        onStepStart: (i, step) =>
          console.log(
            `[DemoAction] step ${i + 1}/${currentDemoAction.steps.length}: ${step.action}${step.selector ? ` ${step.selector}` : ""}`,
          ),
        onStepError: (i, step, err) =>
          console.warn(
            `[DemoAction] step ${i + 1} FAILED (${step.action}${step.selector ? ` ${step.selector}` : ""}): ${err.message}`,
          ),
      })
        .then((results) => {
          console.log("[DemoAction] complete:", results.map((r) => `${r.index + 1}:${r.status}`).join(", "));
          const fails = results.filter((r) => r.status === "fail" && r.step.critical !== false);
          setActionStatus(fails.length ? "error" : "done");
          if (fails.length) setActionErrors(fails);
          setTimeout(() => {
            setActionStatus(null);
            setActionErrors([]);
          }, 6000);
        })
        .finally(() => {
          executingActionRef.current = false;
        });
    }, 1200);

    // If cleanup fires (currentDemoAction changed before timer) reset the ref so
    // the next effect run isn't permanently blocked.
    return () => {
      clearTimeout(timer);
      executingActionRef.current = false;
    };
  }, [currentDemoAction, navigate]);

  // Auto-scroll Q&A
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

  if (!isActive) return null;

  const totalSteps = session?.totalSteps || 0;
  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  const copyViewerUrl = async () => {
    if (!session?.viewerUrl) return;
    await navigator.clipboard.writeText(session.viewerUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim() || !session) return;
    sendQuestion(session.sessionId, question.trim());
    setQuestion("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-primary cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <HiOutlineSparkles size={14} className="text-white/80" />
          <span className="text-sm font-semibold text-white">
            {isGenerating
              ? "Generating script…"
              : isReady
                ? "Script ready"
                : isEnded
                  ? "Demo complete"
                  : currentStep
                    ? `${currentIndex + 1}/${totalSteps} · ${currentStep.name}`
                    : "Demo"}
          </span>
          {isRunning && <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />}
          {isPaused && <span className="text-xs text-white/60">paused</span>}
        </div>
        <div className="flex items-center gap-2">
          {viewerCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <FiUsers size={11} />
              {viewerCount}
            </span>
          )}
          {expanded ? (
            <FiChevronDown size={14} className="text-white/80" />
          ) : (
            <FiChevronUp size={14} className="text-white/80" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(isRunning || isPaused) && totalSteps > 0 && (
        <div className="h-0.5 bg-primary/20">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {expanded && (
        <div className="flex flex-col overflow-hidden">
          {/* Generating spinner */}
          {isGenerating && (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin shrink-0" />
              <p className="text-xs text-gray-500">AI is writing your narration script…</p>
            </div>
          )}

          {/* Ready — begin button */}
          {isReady && (
            <div className="px-4 py-3 flex flex-col gap-2">
              <p className="text-xs text-gray-500">
                {totalSteps} step{totalSteps !== 1 ? "s" : ""} ready. Share the viewer link, then begin.
              </p>
              <button
                onClick={() => sendBegin(session.sessionId)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <FiPlay size={13} /> Begin Demo
              </button>
            </div>
          )}

          {/* Running / paused — narration + controls */}
          {(isRunning || isPaused) && (
            <div className="flex flex-col gap-0 overflow-hidden max-h-[60vh]">
              {/* Current step info */}
              <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                  {currentStep?.category}
                </p>
                <p className="text-sm font-bold text-gray-800 leading-snug">{currentStep?.name}</p>
              </div>

              {/* Narration script */}
              {narration ? (
                <div className="px-4 py-3 overflow-y-auto max-h-48 bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <HiOutlineSparkles size={11} className="text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Script</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{narration}</p>
                </div>
              ) : (
                <div className="px-4 py-2 text-xs text-gray-400 italic border-b border-gray-100">
                  No script for this step.
                </div>
              )}

              {/* Live action status indicator */}
              {actionStatus && (
                <div
                  className={`flex flex-col gap-1 px-4 py-2 text-xs border-b border-gray-100 ${
                    actionStatus === "running"
                      ? "bg-primary/5 text-primary"
                      : actionStatus === "done"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {actionStatus === "running" ? (
                      <>
                        <span className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                        Running demo action…
                      </>
                    ) : actionStatus === "done" ? (
                      <>
                        <FiCheck size={12} />
                        Action complete
                      </>
                    ) : (
                      <>
                        <FiZap size={12} />
                        Action had an issue — continue narrating
                      </>
                    )}
                  </div>
                  {actionErrors.length > 0 && (
                    <div className="pl-5 space-y-0.5 text-[10px] opacity-80">
                      {actionErrors.map((r) => (
                        <div key={r.index} className="truncate">
                          Step {r.index + 1} ({r.step.action}
                          {r.step.selector ? ` ${r.step.selector.slice(0, 30)}` : ""}): {r.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Q&A toggle */}
              {questions.length > 0 && (
                <div className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowQA((p) => !p)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <FiMessageCircle size={11} /> Q&amp;A ({questions.length})
                    </span>
                    {showQA ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
                  </button>
                  {showQA && (
                    <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 px-4 pb-2">
                      {questions.map((q, i) => (
                        <div key={i} className="py-2 space-y-1">
                          <p className="text-xs font-medium text-gray-600">
                            {q.from}: <span className="font-normal">{q.question}</span>
                          </p>
                          {q.answer ? (
                            <p className="text-xs text-gray-500 pl-2 border-l-2 border-primary/30 leading-relaxed">
                              {q.answer}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic pl-2">answering…</p>
                          )}
                        </div>
                      ))}
                      <div ref={qaEndRef} />
                    </div>
                  )}
                </div>
              )}

              {/* Ask question */}
              <form onSubmit={handleAsk} className="flex gap-1.5 px-3 py-2 border-b border-gray-100">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask AI a question…"
                  className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="rounded-md bg-primary px-2 py-1.5 text-white disabled:opacity-40"
                >
                  <FiMessageCircle size={12} />
                </button>
              </form>
            </div>
          )}

          {/* Ended */}
          {isEnded && (
            <div className="px-4 py-3 text-center">
              <FiCheck size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Demo complete. Thanks for presenting!</p>
            </div>
          )}

          {/* Bottom controls */}
          <div className="px-3 py-2 flex flex-col gap-2 bg-gray-50 border-t border-gray-100">
            {/* Viewer URL */}
            {session?.viewerUrl && !isEnded && (
              <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs">
                <FiUsers size={11} className="text-gray-400 shrink-0" />
                <span className="truncate flex-1 text-gray-500">{session.viewerUrl}</span>
                <button
                  onClick={copyViewerUrl}
                  className="shrink-0 text-primary hover:underline flex items-center gap-0.5"
                >
                  {copiedUrl ? <FiCheck size={11} /> : <FiCopy size={11} />}
                  {copiedUrl ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {/* Nav controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => sendEnd(session?.sessionId)}
                className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <FiX size={11} /> End
              </button>
              {(isRunning || isPaused) && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => sendPrev(session.sessionId)}
                    disabled={currentIndex === 0}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  >
                    <FiSkipBack size={12} />
                  </button>
                  <button
                    onClick={() => sendPause(session.sessionId)}
                    className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    {isPaused ? <FiPlay size={12} /> : <FiPause size={12} />}
                  </button>
                  <button
                    onClick={() => sendNext(session.sessionId)}
                    className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    Next <FiSkipForward size={11} />
                  </button>
                </div>
              )}
              {isReady && (
                <button
                  onClick={() => sendBegin(session.sessionId)}
                  className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  <FiPlay size={11} /> Begin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
