import { useState } from "react";
import useTestingCases from "../hooks/useTestingCases";
import useTestingRun from "../hooks/useTestingRun";
import useTestingScreenContext from "../hooks/useTestingScreenContext";
import TestingCaseEditor from "../components/TestingCaseEditor";
import TestingCaseTable from "../components/TestingCaseTable";
import TestingConfigure from "../components/TestingConfigure";
import TestingHeading from "../components/TestingHeading";
import TestingHelpPanel from "../components/TestingHelpPanel";
import TestingLogStream from "../components/TestingLogStream";
import TestingReport from "../components/TestingReport";
import TestingTabs from "../components/TestingTabs";
import { DEFAULT_PERSONA_ID, INITIAL_CREDENTIALS, TESTING_TABS } from "../utils/testing.constants";
import { getAreaNames } from "../utils/testing.utils";

const Testing = () => {
  const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONA_ID);
  const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS);
  const [formUrl, setFormUrl] = useState("");
  const [activeTab, setActiveTab] = useState(TESTING_TABS.CONFIGURE);
  const [filterArea, setFilterArea] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const cases = useTestingCases();
  const { testCases, selectedIds } = cases;
  const run = useTestingRun({
    selectedIds,
    selectedPersona,
    credentials,
    formUrl,
    setActiveTab,
  });

  const openEditor = (testCase) => {
    setEditingCase(testCase);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingCase(null);
  };

  useTestingScreenContext({
    testCases,
    filterArea,
    setFilterArea,
    onOpenEditor: (testCaseId) => {
      const testCase = testCaseId ? testCases.find((t) => t._id === testCaseId) : null;
      if (!testCaseId || testCase) setEditingCase(testCase);
      setEditorOpen(true);
    },
    setActiveTab,
    loadTestCases: cases.loadTestCases,
    deleteTestCases: cases.deleteTestCases,
    seedFromStatic: cases.seedFromStatic,
  });

  const handleSave = async (form) => {
    const isSaved = await cases.saveTestCase(form, editingCase);
    if (isSaved) closeEditor();
  };

  const sortedAreas = getAreaNames(testCases).sort();

  return (
    <article className="flex h-full flex-col gap-4 p-4 md:p-6" data-testid="testing-page">
      <TestingHeading
        activeTab={activeTab}
        isHelpOpen={helpOpen}
        isRunning={run.isRunning}
        canRun={!(run.isRunning || !selectedIds.length || cases.metaLoading)}
        selectedCount={selectedIds.length}
        onToggleHelp={() => setHelpOpen((v) => !v)}
        onRun={run.handleRun}
        onSeed={cases.seedFromStatic}
        onStop={run.handleStop}
      />

      {helpOpen && <TestingHelpPanel onClose={() => setHelpOpen(false)} />}

      <TestingTabs
        activeTab={activeTab}
        isRunning={run.isRunning}
        passCount={run.passCount}
        failCount={run.failCount}
        report={run.report}
        testCaseCount={testCases.length}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      <section className="flex-1 min-h-0 overflow-auto">
        {activeTab === TESTING_TABS.CONFIGURE && (
          <TestingConfigure
            areas={cases.areas}
            personas={cases.personas}
            smokeTestIds={cases.smokeTestIds}
            selectedIds={selectedIds}
            setSelectedIds={cases.setSelectedIds}
            isLoading={cases.metaLoading}
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
            credentials={credentials}
            onCredentialsChange={setCredentials}
            formUrl={formUrl}
            onFormUrlChange={setFormUrl}
          />
        )}

        {activeTab === TESTING_TABS.RUNNING && (
          <TestingLogStream
            logs={run.logs}
            isRunning={run.isRunning}
            runMeta={run.runMeta}
            passCount={run.passCount}
            failCount={run.failCount}
          />
        )}

        {activeTab === TESTING_TABS.REPORT &&
          (run.report ? (
            <TestingReport report={run.report} />
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              No report yet — run tests first.
            </div>
          ))}

        {activeTab === TESTING_TABS.TEST_CASES && (
          <TestingCaseTable
            testCases={testCases}
            filterArea={filterArea}
            onFilterArea={setFilterArea}
            onEdit={openEditor}
            onDuplicate={cases.duplicateTestCase}
            onToggleActive={cases.toggleTestCaseActive}
            onDelete={cases.deleteTestCase}
            onNew={() => openEditor(null)}
            loading={cases.tcLoading}
            areas={sortedAreas}
          />
        )}
      </section>

      <TestingCaseEditor
        isOpen={editorOpen}
        testCase={editingCase}
        onSave={handleSave}
        onClose={closeEditor}
        saving={cases.saving}
        areas={sortedAreas}
      />
    </article>
  );
};

export default Testing;
