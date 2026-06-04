import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import getEnv from "@/lib/env";
import { useScreenContext } from "@/hooks/useScreenContext";
import TestChecklist from "./components/TestChecklist";
import PersonaPanel from "./components/PersonaPanel";
import TestLogStream from "./components/TestLogStream";
import TestReport from "./components/TestReport";
import TestCaseTable from "./components/TestCaseTable";
import TestCaseEditor from "./components/TestCaseEditor";

const SERVER_URL = getEnv("SERVER_URL");

const TABS = ["configure", "running", "report", "test-cases"];

const HELP_SECTIONS = [
  {
    title: "Prerequisites",
    body: "Puppeteer must be installed on the backend server before tests can run. If it isn't installed yet, SSH into the server and run: npm install puppeteer inside the Onboarding-Back directory, then restart the process.",
  },
  {
    title: "1 · Configure tab",
    body: "Select which tests to run using the checklist on the left. Use All / None / Smoke only for quick selection. Smoke tests are a fast subset (~5 tests) that cover the most critical paths. On the right panel, enter the admin account email and password the browser will log in with, and optionally a Form URL if you're testing the applicant flow end-to-end.",
  },
  {
    title: "2 · Personas",
    body: "A persona is a pre-filled set of applicant data injected into form fields during tests. Clean Slate starts with blank fields (good for general flow checks). Pre-filled uses realistic business data. Edge Cases uses boundary values like very long names and max numbers. Invalid Inputs uses intentionally bad data to check validation. International uses non-US characters and formats.",
  },
  {
    title: "3 · Running tab",
    body: "After clicking Run, the page switches to the live log stream. Each test prints step-by-step pass/fail lines in real time. A progress bar tracks overall completion. If a step fails, the error message is shown inline. You can click Stop at any time to abort the run early.",
  },
  {
    title: "4 · Report tab",
    body: "When the run finishes the page switches to the Report tab automatically. It shows overall pass rate, a per-area breakdown table, and expandable failure cards with the exact error and a screenshot of what the browser saw. Use the Export JSON button to download the full report for sharing or logging.",
  },
  {
    title: "5 · Test Cases tab",
    body: "Create, edit, duplicate, and delete test cases. Each test case has a set of ordered steps that Puppeteer executes. Use the AI assistant (chat bubble) to have the Testing Assistant create or modify test cases for you by describing what you want in plain English.",
  },
  {
    title: "Tips",
    body: "Run Smoke only first after any deployment to get a quick health check in under a minute. Full suite runs can take several minutes depending on server speed. Tests that require a Form URL are marked with a badge in the checklist — they'll be skipped gracefully if no URL is provided.",
  },
];

export default function Testing() {
  // ── Metadata from backend ─────────────────────────────────────────────────
  const [areas, setAreas]           = useState([]);
  const [personas, setPersonas]     = useState([]);
  const [smokeTestIds, setSmokeIds] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  // ── Test config ───────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds]         = useState([]);
  const [selectedPersona, setSelectedPersona] = useState("clean-slate");
  const [credentials, setCredentials]         = useState({ email: "", password: "" });
  const [formUrl, setFormUrl]                 = useState("");

  // ── Run state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("configure");
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId]         = useState(null);
  const [logs, setLogs]           = useState([]);
  const [report, setReport]       = useState(null);
  const [runMeta, setRunMeta]     = useState(null);
  const eventSourceRef            = useRef(null);

  // ── Test case management ──────────────────────────────────────────────────
  const [testCases, setTestCases]       = useState([]);
  const [tcLoading, setTcLoading]       = useState(false);
  const [filterArea, setFilterArea]     = useState(null);
  const [editorOpen, setEditorOpen]     = useState(false);
  const [editingCase, setEditingCase]   = useState(null); // null = create mode
  const [saving, setSaving]             = useState(false);

  // ── Help ──────────────────────────────────────────────────────────────────
  const [helpOpen, setHelpOpen]         = useState(false);
  const [helpExpanded, setHelpExpanded] = useState({});
  const toggleHelp = (title) =>
    setHelpExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  // ── Load run metadata ─────────────────────────────────────────────────────
  const loadMetadata = () => {
    setMetaLoading(true);
    fetch(`${SERVER_URL}/api/testing/metadata`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        setAreas(data.areas);
        setPersonas(data.personas);
        setSmokeIds(data.smokeTestIds || []);
        const allIds = data.areas.flatMap((a) => a.tests.map((t) => t.id));
        setSelectedIds(allIds);
      })
      .catch(() => toast.error("Failed to load test metadata"))
      .finally(() => setMetaLoading(false));
  };

  useEffect(() => { loadMetadata(); }, []);

  // ── Load test cases ───────────────────────────────────────────────────────
  const loadTestCases = () => {
    setTcLoading(true);
    fetch(`${SERVER_URL}/api/testing/test-cases`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTestCases(data.data || []);
        else toast.error(data.message || "Failed to load test cases");
      })
      .catch(() => toast.error("Failed to load test cases"))
      .finally(() => setTcLoading(false));
  };

  useEffect(() => {
    loadTestCases();
  }, []);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = !!editingCase;
      const url = isEdit
        ? `${SERVER_URL}/api/testing/test-cases/${editingCase._id}`
        : `${SERVER_URL}/api/testing/test-cases`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      toast.success(isEdit ? "Test case updated" : "Test case created");
      setEditorOpen(false);
      setEditingCase(null);
      loadTestCases();
      loadMetadata();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/testing/test-cases/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Test case deleted");
      loadTestCases();
      loadMetadata();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDuplicate = async (tc) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/testing/test-cases/${tc._id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Duplicate failed");
      toast.success("Test case duplicated (inactive — edit before activating)");
      loadTestCases();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/testing/test-cases/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Toggle failed");
      setTestCases((prev) =>
        prev.map((tc) => tc._id === id ? { ...tc, isActive: !currentlyActive } : tc)
      );
      loadMetadata();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSeedFromStatic = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/testing/test-cases/seed`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Seed failed");
      const msg = data.message || `Seeded: ${data.inserted ?? 0} added, ${data.updated ?? 0} updated`;
      toast.success(msg);
      loadTestCases();
      loadMetadata();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteBulk = async (ids) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/testing/test-cases/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Bulk delete failed");
      toast.success(`Deleted ${ids.length} test case(s)`);
      loadTestCases();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── AI screen context ─────────────────────────────────────────────────────
  useScreenContext({
    screenId: "testing",
    screenName: "Automated Testing",
    assistantName: "Testing Assistant",
    aiEndpoint: `${SERVER_URL}/api/ai/testing-chat`,
    greeting:
      `Hi! I'm your **Testing Assistant**.\n\nI can help you:\n- **Create** new test cases from plain-English descriptions\n- **Edit** existing test cases — add, remove, or reorder steps\n- **Duplicate** a test case to use as a starting point\n- **Delete** test cases (will ask for confirmation)\n- **Filter** the list by feature area\n- **Open** the editor for manual editing\n- **Seed** all built-in tests from the static files\n\nWhat would you like to do?`,
    currentState: {
      testCases: testCases.map((tc) => ({
        _id: tc._id,
        testId: tc.testId,
        name: tc.name,
        area: tc.area,
        stepCount: tc.steps?.length ?? tc.stepCount ?? 0,
        smoke: tc.smoke,
        isActive: tc.isActive,
      })),
      areas: [...new Set(testCases.map((tc) => tc.area))],
      filterArea,
    },
    actions: {
      createTestCase: async ({ testId, name, area, description, requiresLogin, requiresFormUrl, smoke, steps, explanation }) => {
        const res = await fetch(`${SERVER_URL}/api/testing/test-cases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ testId, name, area, description, requiresLogin, requiresFormUrl, smoke, steps }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Create failed");
        loadTestCases();
        return explanation;
      },
      updateTestCase: async ({ testCaseId, explanation, ...fields }) => {
        const res = await fetch(`${SERVER_URL}/api/testing/test-cases/${testCaseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(fields),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Update failed");
        loadTestCases();
        return explanation;
      },
      deleteTestCases: async ({ testCaseIds, explanation }) => {
        await handleDeleteBulk(testCaseIds);
        return explanation;
      },
      duplicateTestCase: async ({ testCaseId, newName, explanation }) => {
        const res = await fetch(`${SERVER_URL}/api/testing/test-cases/${testCaseId}/duplicate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newName }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Duplicate failed");
        loadTestCases();
        return explanation;
      },
      openEditor: ({ testCaseId, explanation }) => {
        if (testCaseId) {
          const tc = testCases.find((t) => t._id === testCaseId);
          if (tc) {
            setEditingCase(tc);
          }
        } else {
          setEditingCase(null);
        }
        setEditorOpen(true);
        setActiveTab("test-cases");
        return explanation;
      },
      setFilterArea: ({ area, explanation }) => {
        setFilterArea(area || null);
        setActiveTab("test-cases");
        return explanation;
      },
      seedFromStatic: async ({ explanation }) => {
        await handleSeedFromStatic();
        return explanation;
      },
    },
    deps: [testCases.length, filterArea],
  });

  // ── Start a test run ──────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!selectedIds.length) return toast.warn("Select at least one test to run");
    if (isRunning) return;

    setLogs([]);
    setReport(null);
    setIsRunning(true);
    setActiveTab("running");

    try {
      const res = await fetch(`${SERVER_URL}/api/testing/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          testIds: selectedIds,
          personaId: selectedPersona,
          credentials,
          formUrl: formUrl || undefined,
          frontendUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to start run");

      setRunId(data.runId);
      setRunMeta({ totalTests: data.totalTests, startedAt: new Date().toISOString() });

      const es = new EventSource(`${SERVER_URL}/api/testing/stream/${data.runId}`, {
        withCredentials: true,
      });
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        const event = JSON.parse(e.data);
        setLogs((prev) => [...prev, event]);

        if (event.type === "run-complete") {
          setReport(event.report);
          setIsRunning(false);
          setActiveTab("report");
          es.close();
        }
        if (event.type === "error") {
          toast.error(`Test runner error: ${event.message}`);
          setIsRunning(false);
          es.close();
        }
      };
      es.onerror = () => {
        es.close();
        // SSE can drop over HTTP/2 proxies — poll the report endpoint until done
        const pollRunId = data.runId;
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const r = await fetch(`${SERVER_URL}/api/testing/report/${pollRunId}`, { credentials: "include" });
            const d = await r.json();
            if (d.success && d.report) {
              clearInterval(poll);
              setReport(d.report);
              setIsRunning(false);
              setActiveTab("report");
            }
          } catch { /* keep polling */ }
          if (attempts >= 60) { // give up after 3 minutes
            clearInterval(poll);
            setIsRunning(false);
          }
        }, 3000);
      };
    } catch (err) {
      toast.error(err.message);
      setIsRunning(false);
      setActiveTab("configure");
    }
  };

  // ── Stop a run ────────────────────────────────────────────────────────────
  const handleStop = () => {
    eventSourceRef.current?.close();
    setIsRunning(false);
    toast.info("Test run stopped");
  };

  // ── Quick-select helpers ──────────────────────────────────────────────────
  const selectAll   = () => setSelectedIds(areas.flatMap((a) => a.tests.map((t) => t.id)));
  const selectNone  = () => setSelectedIds([]);
  const selectSmoke = () => setSelectedIds(smokeTestIds);

  // ── Counts ────────────────────────────────────────────────────────────────
  const passCount = logs.filter((l) => l.type === "test-complete" && l.passed).length;
  const failCount = logs.filter((l) => l.type === "test-complete" && !l.passed).length;
  const doneCount = passCount + failCount;

  const TAB_LABELS = {
    "configure":   "Configure",
    "running":     "Running",
    "report":      "Report",
    "test-cases":  "Test Cases",
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6" data-testid="testing-page">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Automated Testing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Run end-to-end tests against the platform</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setHelpOpen((v) => !v)}
            title="How to use"
            className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border transition-colors ${
              helpOpen
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-500 hover:border-primary hover:text-primary bg-white"
            }`}
          >
            ?
          </button>
          {activeTab === "configure" && (
            <button
              onClick={handleRun}
              disabled={isRunning || !selectedIds.length || metaLoading}
              data-testid="run-tests-btn"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-40"
            >
              Run {selectedIds.length} test{selectedIds.length !== 1 ? "s" : ""}
            </button>
          )}
          {activeTab === "test-cases" && (
            <button
              onClick={handleSeedFromStatic}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Seed from static
            </button>
          )}
          {isRunning && (
            <button
              onClick={handleStop}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* ── Help panel ── */}
      {helpOpen && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-blue-900">How to use Automated Testing</h2>
            <button
              onClick={() => setHelpOpen(false)}
              className="text-blue-400 hover:text-blue-700 text-lg leading-none bg-transparent border-0 cursor-pointer"
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {HELP_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-lg border border-blue-100 bg-white overflow-hidden">
                <button
                  onClick={() => toggleHelp(s.title)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-blue-800 hover:bg-blue-50 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  <span>{s.title}</span>
                  <span className="text-blue-400 text-xs">{helpExpanded[s.title] ? "▲" : "▼"}</span>
                </button>
                {helpExpanded[s.title] && (
                  <p className="px-3 pb-3 text-xs leading-relaxed text-gray-600 border-t border-blue-50">
                    {s.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => !isRunning || tab === "running" ? setActiveTab(tab) : null}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[tab] || tab}
            {tab === "running" && isRunning && (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            )}
            {tab === "running" && doneCount > 0 && !isRunning && (
              <span className="ml-2 text-xs text-gray-400">
                {passCount}✓ {failCount > 0 ? `${failCount}✗` : ""}
              </span>
            )}
            {tab === "report" && report && (
              <span className={`ml-2 text-xs font-bold ${report.summary.failed ? "text-red-600" : "text-green-600"}`}>
                {report.summary.passRate}%
              </span>
            )}
            {tab === "test-cases" && testCases.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">{testCases.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 min-h-0 overflow-auto">

        {/* Configure */}
        {activeTab === "configure" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.length} test{selectedIds.length !== 1 ? "s" : ""} selected
                </span>
                <button onClick={selectAll}   className="text-xs text-primary hover:underline">All</button>
                <span className="text-gray-300">|</span>
                <button onClick={selectNone}  className="text-xs text-primary hover:underline">None</button>
                <span className="text-gray-300">|</span>
                <button onClick={selectSmoke} className="text-xs text-primary hover:underline">Smoke only</button>
              </div>
              {metaLoading ? (
                <div className="text-sm text-gray-400 p-4">Loading tests…</div>
              ) : (
                <TestChecklist
                  areas={areas}
                  selectedIds={selectedIds}
                  onChange={setSelectedIds}
                />
              )}
            </div>
            <PersonaPanel
              personas={personas}
              selectedPersona={selectedPersona}
              onPersonaChange={setSelectedPersona}
              credentials={credentials}
              onCredentialsChange={setCredentials}
              formUrl={formUrl}
              onFormUrlChange={setFormUrl}
              baseUrl={window.location.origin}
            />
          </div>
        )}

        {/* Running */}
        {activeTab === "running" && (
          <TestLogStream
            logs={logs}
            isRunning={isRunning}
            runMeta={runMeta}
            passCount={passCount}
            failCount={failCount}
          />
        )}

        {/* Report */}
        {activeTab === "report" && (
          report
            ? <TestReport report={report} />
            : <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                No report yet — run tests first.
              </div>
        )}

        {/* Test Cases */}
        {activeTab === "test-cases" && (
          <TestCaseTable
            testCases={testCases}
            filterArea={filterArea}
            onFilterArea={setFilterArea}
            onEdit={(tc) => { setEditingCase(tc); setEditorOpen(true); }}
            onDuplicate={handleDuplicate}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            onNew={() => { setEditingCase(null); setEditorOpen(true); }}
            loading={tcLoading}
            areas={[...new Set(testCases.map((tc) => tc.area))].sort()}
          />
        )}
      </div>

      {/* ── Test Case Editor modal ── */}
      <TestCaseEditor
        isOpen={editorOpen}
        testCase={editingCase}
        onSave={handleSave}
        onClose={() => { setEditorOpen(false); setEditingCase(null); }}
        saving={saving}
        areas={[...new Set(testCases.map((tc) => tc.area))].sort()}
      />
    </div>
  );
}
