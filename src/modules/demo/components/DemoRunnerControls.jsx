import { useState } from "react";
import {
  FiCheck,
  FiCopy,
  FiMessageCircle,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { DEMO_COPY_FEEDBACK_MS } from "../utils/demo.constants";

const DemoRunnerControls = ({
  viewerUrl = "",
  viewerCount = 0,
  currentIndex = 0,
  isEnded = false,
  isLive = false,
  isPaused = false,
  onQuestion,
  onEnd,
  onPrev,
  onPause,
  onNext,
}) => {
  const [question, setQuestion] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyViewerUrl = async () => {
    if (!viewerUrl) return;
    await navigator.clipboard.writeText(viewerUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), DEMO_COPY_FEEDBACK_MS);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onQuestion?.(question.trim());
    setQuestion("");
  };

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-3 space-y-3">
      {viewerUrl && !isEnded && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <FiUsers size={13} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate flex-1">{viewerUrl}</span>
          {viewerCount > 0 && <span className="text-xs text-green-600 font-medium shrink-0">{viewerCount} watching</span>}
          <button
            type="button"
            onClick={copyViewerUrl}
            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            {copiedUrl ? <FiCheck size={12} /> : <FiCopy size={12} />}
            {copiedUrl ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {isLive && (
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question or type one from the audience…"
            aria-label="Ask a question"
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onEnd?.()}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <FiX size={13} /> End Demo
        </button>

        {isLive && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrev?.()}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <FiSkipBack size={13} /> Back
            </button>
            <button
              type="button"
              onClick={() => onPause?.()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {isPaused ? <FiPlay size={13} /> : <FiPause size={13} />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={() => onNext?.()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Next <FiSkipForward size={13} />
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

export default DemoRunnerControls;
