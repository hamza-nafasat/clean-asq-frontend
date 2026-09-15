import { TESTING_TAB_LABELS, TESTING_TAB_ORDER, TESTING_TABS } from "../utils/testing.constants";

const TestingTabs = ({
  activeTab = TESTING_TABS.CONFIGURE,
  isRunning = false,
  passCount = 0,
  failCount = 0,
  report = null,
  testCaseCount = 0,
  onTabChange,
}) => {
  const doneCount = passCount + failCount;

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {TESTING_TAB_ORDER.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => (!isRunning || tab === TESTING_TABS.RUNNING ? onTabChange?.(tab) : null)}
          className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
            activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {TESTING_TAB_LABELS[tab] || tab}
          {tab === TESTING_TABS.RUNNING && isRunning && (
            <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          )}
          {tab === TESTING_TABS.RUNNING && doneCount > 0 && !isRunning && (
            <span className="ml-2 text-xs text-gray-400">
              {passCount}✓ {failCount > 0 ? `${failCount}✗` : ""}
            </span>
          )}
          {tab === TESTING_TABS.REPORT && report && (
            <span className={`ml-2 text-xs font-bold ${report.summary.failed ? "text-red-600" : "text-green-600"}`}>
              {report.summary.passRate}%
            </span>
          )}
          {tab === TESTING_TABS.TEST_CASES && testCaseCount > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">{testCaseCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default TestingTabs;
