import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiPlay, FiSave, FiZap } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import DemoBuilderStepRow from "./DemoBuilderStepRow";
import { DEMO_STEP_RESULTS } from "../utils/demo.constants";
import Spinner from "@/components/shared/Spinner";

const DemoBuilderDraft = ({
  demoAction = { steps: [], paramOverrides: {} },
  narration = "",
  isReady = false,
  isRunning = false,
  previewIdx = -1,
  previewResults = [],
  onPreview,
  onApprove,
}) => {
  const [showSteps, setShowSteps] = useState(true);
  const hasSteps = demoAction.steps.length > 0;
  const resultMap = Object.fromEntries(previewResults.map((r) => [r.index, r]));

  return (
    <section className="flex flex-col w-1/2 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <span className="text-sm font-semibold text-gray-800">Draft</span>
        <div className="flex items-center gap-2">
          {hasSteps && (
            <button
              type="button"
              onClick={() => onPreview?.()}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Run these steps in the live browser"
            >
              {isRunning ? (
                <Spinner tone="neutral" />
              ) : (
                <FiPlay size={12} />
              )}
              {isRunning ? "Running…" : "Preview"}
            </button>
          )}
          {(isReady || hasSteps) && (
            <button
              type="button"
              onClick={() => onApprove?.()}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <FiSave size={12} /> Approve & Save
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {narration && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <HiOutlineSparkles size={11} className="text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Narration</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{narration}</p>
          </div>
        )}

        {hasSteps ? (
          <div>
            <button
              type="button"
              onClick={() => setShowSteps((p) => !p)}
              aria-expanded={showSteps}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <span className="text-xs font-semibold text-gray-700">
                {demoAction.steps.length} Action Step{demoAction.steps.length !== 1 ? "s" : ""}
              </span>
              {showSteps ? (
                <FiChevronUp size={12} className="text-gray-400" />
              ) : (
                <FiChevronDown size={12} className="text-gray-400" />
              )}
            </button>
            {showSteps && (
              <div className="space-y-1.5">
                {demoAction.steps.map((step, i) => (
                  <DemoBuilderStepRow
                    key={i}
                    step={step}
                    index={i}
                    status={previewIdx === i ? DEMO_STEP_RESULTS.RUNNING : (resultMap[i]?.status ?? null)}
                  />
                ))}
              </div>
            )}
            {Object.keys(demoAction.paramOverrides || {}).length > 0 && (
              <div className="mt-3 rounded-md border border-gray-100 p-2.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Demo Data</p>
                {Object.entries(demoAction.paramOverrides).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-primary">{`{{${k}}}`}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <FiZap size={22} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400">
              Answer the AI's questions on the left
              <br />
              and action steps will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DemoBuilderDraft;
