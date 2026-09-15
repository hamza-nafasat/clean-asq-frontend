import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HTTP_METHODS, TEST_CASE_SUB_PATHS, TESTING_API_PATHS } from "@/modules/testing/utils/testing.constants";
import { fetchTesting, testCasePath, testingRequest } from "@/modules/testing/utils/testing.utils";

const useTestingCases = () => {
  const [areas, setAreas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [smokeTestIds, setSmokeIds] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMetadata = () => {
    setMetaLoading(true);
    fetchTesting(TESTING_API_PATHS.METADATA)
      .then((data) => {
        if (!data.success) return;
        setAreas(data.data.areas);
        setPersonas(data.data.personas);
        setSmokeIds(data.data.smokeTestIds || []);
        setSelectedIds(data.data.areas.flatMap((a) => a.tests.map((t) => t.id)));
      })
      .catch(() => toast.error("Failed to load test metadata"))
      .finally(() => setMetaLoading(false));
  };

  const loadTestCases = () => {
    setTcLoading(true);
    fetchTesting(TESTING_API_PATHS.TEST_CASES)
      .then((data) => {
        if (data.success) setTestCases(data.data || []);
        else toast.error(data.message || "Failed to load test cases");
      })
      .catch(() => toast.error("Failed to load test cases"))
      .finally(() => setTcLoading(false));
  };

  useEffect(() => {
    loadMetadata();
    loadTestCases();
  }, []);

  // run a request, toast the result, and reload what changed
  const runAction = async (request, { successMessage, reloadMetadata = false } = {}) => {
    try {
      const data = await request();
      const message = typeof successMessage === "function" ? successMessage(data) : successMessage;
      if (message) toast.success(message);
      loadTestCases();
      if (reloadMetadata) loadMetadata();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const saveTestCase = async (form, editingCase) => {
    setSaving(true);
    const isEdit = !!editingCase;
    const isSaved = await runAction(
      () =>
        testingRequest(isEdit ? testCasePath(editingCase._id) : TESTING_API_PATHS.TEST_CASES, {
          method: isEdit ? HTTP_METHODS.PATCH : HTTP_METHODS.POST,
          body: form,
          fallbackMessage: "Save failed",
        }),
      {
        successMessage: isEdit ? "Test case updated" : "Test case created",
        reloadMetadata: true,
      },
    );
    setSaving(false);
    return isSaved;
  };

  const deleteTestCase = (id) =>
    runAction(
      () =>
        testingRequest(testCasePath(id), {
          method: HTTP_METHODS.DELETE,
          fallbackMessage: "Delete failed",
        }),
      { successMessage: "Test case deleted", reloadMetadata: true },
    );

  const duplicateTestCase = (tc) =>
    runAction(
      () =>
        testingRequest(testCasePath(tc._id, TEST_CASE_SUB_PATHS.DUPLICATE), {
          method: HTTP_METHODS.POST,
          body: {},
          fallbackMessage: "Duplicate failed",
        }),
      {
        successMessage: "Test case duplicated (inactive — edit before activating)",
      },
    );

  const toggleTestCaseActive = async (id, currentlyActive) => {
    try {
      await testingRequest(testCasePath(id, TEST_CASE_SUB_PATHS.TOGGLE), {
        method: HTTP_METHODS.PATCH,
        fallbackMessage: "Toggle failed",
      });
      setTestCases((prev) => prev.map((tc) => (tc._id === id ? { ...tc, isActive: !currentlyActive } : tc)));
      loadMetadata();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const seedFromStatic = () =>
    runAction(
      () =>
        testingRequest(testCasePath(TEST_CASE_SUB_PATHS.SEED), {
          method: HTTP_METHODS.POST,
          fallbackMessage: "Seed failed",
        }),
      {
        successMessage: (data) =>
          data.message || `Seeded: ${data.data?.inserted ?? 0} added, ${data.data?.updated ?? 0} updated`,
        reloadMetadata: true,
      },
    );

  const deleteTestCases = (ids) =>
    runAction(
      () =>
        testingRequest(testCasePath(TEST_CASE_SUB_PATHS.BULK_DELETE), {
          method: HTTP_METHODS.POST,
          body: { ids },
          fallbackMessage: "Bulk delete failed",
        }),
      { successMessage: `Deleted ${ids.length} test case(s)` },
    );

  return {
    areas,
    personas,
    smokeTestIds,
    metaLoading,
    selectedIds,
    setSelectedIds,
    testCases,
    tcLoading,
    saving,
    loadTestCases,
    saveTestCase,
    deleteTestCase,
    duplicateTestCase,
    toggleTestCaseActive,
    seedFromStatic,
    deleteTestCases,
  };
};

export default useTestingCases;
