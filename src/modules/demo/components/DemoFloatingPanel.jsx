import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiChevronDown, FiChevronUp, FiPlay, FiUsers } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import useDemoActionRunner from "../hooks/useDemoActionRunner";
import useDemoSession from "../hooks/useDemoSession";
import DemoPanelActionStatus from "./DemoPanelActionStatus";
import DemoPanelControls from "./DemoPanelControls";
import DemoPanelQuestions from "./DemoPanelQuestions";
import { DEMO_SESSION_STATUSES } from "../utils/demo.constants";
import Spinner from "@/components/shared/Spinner";

const ACTIVE_STATUSES = Object.values(DEMO_SESSION_STATUSES);

const getPanelTitle = ({ sessionStatus, currentStep, currentIndex, totalSteps }) => {
  if (sessionStatus === DEMO_SESSION_STATUSES.GENERATING) return "Generating script…";
  if (sessionStatus === DEMO_SESSION_STATUSES.READY) return "Script ready";
  if (sessionStatus === DEMO_SESSION_STATUSES.ENDED) return "Demo complete";
  if (currentStep) return `${currentIndex + 1}/${totalSteps} · ${currentStep.name}`;
  return "Demo";
};

const DemoFloatingPanel = ({ features = [] }) => {
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
  const { actionStatus, actionErrors } = useDemoActionRunner({ currentDemoAction, navigate });

  const isReady = sessionStatus === DEMO_SESSION_STATUSES.READY;
  const isRunning = sessionStatus === DEMO_SESSION_STATUSES.RUNNING;
  const isPaused = sessionStatus === DEMO_SESSION_STATUSES.PAUSED;
  const isEnded = sessionStatus === DEMO_SESSION_STATUSES.ENDED;
  const isLive = isRunning || isPaused;

  // follow the current step's route
  useEffect(() => {
    if (!currentStep) return;
    const feature = features.find((f) => f.id === currentStep.id);
    if (feature?.route) navigate(feature.route);
  }, [currentStep, features, navigate]);

  if (!ACTIVE_STATUSES.includes(sessionStatus)) return null;

  const totalSteps = session?.totalSteps || 0;
  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  const handleAsk = (text) => {
    if (!session) return false;
    sendQuestion(session.sessionId, text);
  };

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col">
      <div
        className="flex items-center justify-between px-3 py-2 bg-primary cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <HiOutlineSparkles size={14} className="text-white/80" />
          <span className="text-sm font-semibold text-white">
            {getPanelTitle({ sessionStatus, currentStep, currentIndex, totalSteps })}
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

      {isLive && totalSteps > 0 && (
        <div className="h-0.5 bg-primary/20">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {expanded && (
        <div className="flex flex-col overflow-hidden">
          {sessionStatus === DEMO_SESSION_STATUSES.GENERATING && (
            <div className="flex items-center gap-3 px-4 py-4">
              <Spinner as="div" size="lg" className="shrink-0" />
              <p className="text-xs text-gray-500">AI is writing your narration script…</p>
            </div>
          )}

          {isReady && (
            <div className="px-4 py-3 flex flex-col gap-2">
              <p className="text-xs text-gray-500">
                {totalSteps} step{totalSteps !== 1 ? "s" : ""} ready. Share the viewer link, then begin.
              </p>
              <button
                type="button"
                onClick={() => sendBegin(session.sessionId)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <FiPlay size={13} /> Begin Demo
              </button>
            </div>
          )}

          {isLive && (
            <div className="flex flex-col gap-0 overflow-hidden max-h-[60vh]">
              <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">{currentStep?.category}</p>
                <p className="text-sm font-bold text-gray-800 leading-snug">{currentStep?.name}</p>
              </div>

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

              <DemoPanelActionStatus actionStatus={actionStatus} actionErrors={actionErrors} />
              <DemoPanelQuestions questions={questions} onAsk={handleAsk} />
            </div>
          )}

          {isEnded && (
            <div className="px-4 py-3 text-center">
              <FiCheck size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Demo complete. Thanks for presenting!</p>
            </div>
          )}

          <DemoPanelControls
            viewerUrl={session?.viewerUrl}
            currentIndex={currentIndex}
            isEnded={isEnded}
            isReady={isReady}
            isLive={isLive}
            isPaused={isPaused}
            onEnd={() => sendEnd(session?.sessionId)}
            onPrev={() => sendPrev(session.sessionId)}
            onPause={() => sendPause(session.sessionId)}
            onNext={() => sendNext(session.sessionId)}
            onBegin={() => sendBegin(session.sessionId)}
          />
        </div>
      )}
    </aside>
  );
};

export default DemoFloatingPanel;
