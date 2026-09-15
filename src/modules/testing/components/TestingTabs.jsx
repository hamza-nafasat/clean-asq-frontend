import Tabs from "@/components/shared/Tabs";
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

  const getBadge = (tab) => (
    <>
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
    </>
  );

  const tabs = TESTING_TAB_ORDER.map((tab) => ({
    value: tab,
    label: TESTING_TAB_LABELS[tab] || tab,
    badge: getBadge(tab),
  }));

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      lockedTab={isRunning ? TESTING_TABS.RUNNING : null}
      onTabChange={onTabChange}
    />
  );
};

export default TestingTabs;
