import { FiCheck, FiClipboard } from "react-icons/fi";
import BrandingExtractionStepBar from "./BrandingExtractionStepBar";
import { BRANDING_MANUAL_EXTRACTION_STEPS } from "../utils/branding.constants";

const Kbd = ({ children = null }) => (
  <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
    {children}
  </kbd>
);

const BrandingManualExtractWaiting = ({ isCopied = false, onCopy, onStartOver }) => (
  <div className="space-y-5">
    <BrandingExtractionStepBar
      current={BRANDING_MANUAL_EXTRACTION_STEPS.WAITING}
      total={BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS}
    />
    <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <span>The script is on your clipboard. We're listening for results.</span>
      <button
        type="button"
        onClick={() => onCopy?.()}
        className="ml-4 flex shrink-0 items-center gap-1.5 rounded border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
      >
        {isCopied ? <FiCheck size={13} className="text-green-600" /> : <FiClipboard size={13} />}
        {isCopied ? "Copied!" : "Copy Again"}
      </button>
    </div>
    <div className="space-y-3 text-sm text-gray-700">
      <p className="font-medium">In the browser tab that just opened:</p>
      <ol className="list-inside list-decimal space-y-2 pl-1">
        <li>
          Open the DevTools console —{" "}
          <span className="text-gray-500">
            <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>J</Kbd>
          </span>{" "}
          on Windows/Linux, or{" "}
          <span className="text-gray-500">
            <Kbd>⌘</Kbd> + <Kbd>⌥</Kbd> + <Kbd>J</Kbd>
          </span>{" "}
          on Mac
        </li>
        <li>
          Click the <strong>Console</strong> tab
        </li>
        <li>
          Paste with <Kbd>Ctrl+V</Kbd> / <Kbd>⌘+V</Kbd> and press <Kbd>Enter</Kbd>
        </li>
      </ol>
      <p className="mt-1 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700 text-xs">
        <strong>First time?</strong> Chrome may show a "Don't paste code" warning. Type <Kbd>allow pasting</Kbd> and
        press Enter, then paste the script again.
      </p>
    </div>
    <div className="flex items-center gap-3 pt-2 text-sm text-gray-500">
      <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Waiting for the script to run…</span>
    </div>
    <button
      type="button"
      className="text-xs text-gray-400 underline hover:text-gray-600"
      onClick={() => onStartOver?.()}
    >
      ← Start over with a different URL
    </button>
  </div>
);

export default BrandingManualExtractWaiting;
