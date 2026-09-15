import { useState } from "react";
import { FiCheck, FiCopy, FiPause, FiPlay, FiSkipBack, FiSkipForward, FiUsers, FiX } from "react-icons/fi";
import { DEMO_COPY_FEEDBACK_MS } from "../utils/demo.constants";

const DemoPanelControls = ({
  viewerUrl = "",
  currentIndex = 0,
  isEnded = false,
  isReady = false,
  isLive = false,
  isPaused = false,
  onEnd,
  onPrev,
  onPause,
  onNext,
  onBegin,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyViewerUrl = async () => {
    if (!viewerUrl) return;
    await navigator.clipboard.writeText(viewerUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), DEMO_COPY_FEEDBACK_MS);
  };

  return (
    <footer className="px-3 py-2 flex flex-col gap-2 bg-gray-50 border-t border-gray-100">
      {viewerUrl && !isEnded && (
        <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs">
          <FiUsers size={11} className="text-gray-400 shrink-0" />
          <span className="truncate flex-1 text-gray-500">{viewerUrl}</span>
          <button
            type="button"
            onClick={copyViewerUrl}
            className="shrink-0 text-primary hover:underline flex items-center gap-0.5"
          >
            {copiedUrl ? <FiCheck size={11} /> : <FiCopy size={11} />}
            {copiedUrl ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onEnd?.()}
          className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
        >
          <FiX size={11} /> End
        </button>
        {isLive && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPrev?.()}
              disabled={currentIndex === 0}
              aria-label="Previous step"
              className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <FiSkipBack size={12} />
            </button>
            <button
              type="button"
              onClick={() => onPause?.()}
              aria-label={isPaused ? "Resume" : "Pause"}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              {isPaused ? <FiPlay size={12} /> : <FiPause size={12} />}
            </button>
            <button
              type="button"
              onClick={() => onNext?.()}
              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Next <FiSkipForward size={11} />
            </button>
          </div>
        )}
        {isReady && (
          <button
            type="button"
            onClick={() => onBegin?.()}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
          >
            <FiPlay size={11} /> Begin
          </button>
        )}
      </div>
    </footer>
  );
};

export default DemoPanelControls;
