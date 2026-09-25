import { useState } from "react";
import usePermission from "@/hooks/usePermission";
import EmptyState from "@/components/shared/EmptyState";
import { PERMISSIONS } from "@/utils/permissions";
import useTestingCases from "./hooks/useTestingCases";
import useTestingRun from "./hooks/useTestingRun";
import useTestingScreenContext from "./hooks/useTestingScreenContext";
import TestingCaseEditor from "./components/TestingCaseEditor";
import TestingCaseTable from "./components/TestingCaseTable";
import TestingConfigure from "./components/TestingConfigure";
import TestingHeading from "./components/TestingHeading";
import TestingHelpPanel from "./components/TestingHelpPanel";
import TestingLogStream from "./components/TestingLogStream";
import TestingReport from "./components/TestingReport";
import TestingTabs from "./components/TestingTabs";
import { DEFAULT_PERSONA_ID, INITIAL_CREDENTIALS, TESTING_TABS } from "./utils/testing.constants";
import { getAreaNames } from "./utils/testing.utils";

const Testing = () => {
  const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONA_ID);
  const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS);
  const [formUrl, setFormUrl] = useState("");
  const [activeTab, setActiveTab] = useState(TESTING_TABS.CONFIGURE);
  const [filterArea, setFilterArea] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const canRunTesting = usePermission(PERMISSIONS.RUN_TESTING);
  const canCreateTesting = usePermission(PERMISSIONS.CREATE_TESTING);
  const canUpdateTesting = usePermission(PERMISSIONS.UPDATE_TESTING);
  const canDeleteTesting = usePermission(PERMISSIONS.DELETE_TESTING);

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
        onRun={canRunTesting ? run.handleRun : null}
        onSeed={canCreateTesting ? cases.seedFromStatic : null}
        onStop={canRunTesting ? run.handleStop : null}
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
            <EmptyState variant="panel" title="No report yet" description="Run tests to see a report here." />
          ))}

        {activeTab === TESTING_TABS.TEST_CASES && (
          <TestingCaseTable
            testCases={testCases}
            filterArea={filterArea}
            onFilterArea={setFilterArea}
            onEdit={canUpdateTesting ? openEditor : null}
            onDuplicate={canCreateTesting ? cases.duplicateTestCase : null}
            onToggleActive={canUpdateTesting ? cases.toggleTestCaseActive : null}
            onDelete={canDeleteTesting ? cases.deleteTestCase : null}
            onNew={canCreateTesting ? () => openEditor(null) : null}
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
