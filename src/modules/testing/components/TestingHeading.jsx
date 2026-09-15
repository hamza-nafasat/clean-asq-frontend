import { TESTING_TABS } from "../utils/testing.constants";

const TestingHeading = ({
  activeTab = TESTING_TABS.CONFIGURE,
  isHelpOpen = false,
  isRunning = false,
  canRun = false,
  selectedCount = 0,
  onToggleHelp,
  onRun,
  onSeed,
  onStop,
}) => (
  <header className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold text-gray-900">Automated Testing</h1>
      <p className="text-sm text-gray-500 mt-0.5">Run end-to-end tests against the platform</p>
    </div>
    <div className="flex gap-2 items-center">
      <button
        type="button"
        onClick={() => onToggleHelp?.()}
        title="How to use"
        aria-label="How to use"
        className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border transition-colors ${
          isHelpOpen
            ? "bg-primary text-white border-primary"
            : "border-gray-300 text-gray-500 hover:border-primary hover:text-primary bg-white"
        }`}
      >
        ?
      </button>
      {activeTab === TESTING_TABS.CONFIGURE && (
        <button
          type="button"
          onClick={() => onRun?.()}
          disabled={!canRun}
          data-testid="run-tests-btn"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-40"
        >
          Run {selectedCount} test{selectedCount !== 1 ? "s" : ""}
        </button>
      )}
      {activeTab === TESTING_TABS.TEST_CASES && (
        <button
          type="button"
          onClick={() => onSeed?.()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Seed from static
        </button>
      )}
      {isRunning && (
        <button
          type="button"
          onClick={() => onStop?.()}
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Stop
        </button>
      )}
    </div>
  </header>
);

export default TestingHeading;
