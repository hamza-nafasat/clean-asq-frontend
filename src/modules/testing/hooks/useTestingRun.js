import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import getEnv from "@/utils/env";
import {
  HTTP_METHODS,
  REPORT_POLL_INTERVAL_MS,
  REPORT_POLL_MAX_ATTEMPTS,
  RUN_EVENT_TYPES,
  TESTING_API_PATHS,
  TESTING_TABS,
} from "@/modules/testing/utils/testing.constants";
import { fetchTesting, testingRequest } from "@/modules/testing/utils/testing.utils";

const SERVER_URL = getEnv("SERVER_URL");

const useTestingRun = ({ selectedIds = [], selectedPersona, credentials, formUrl, setActiveTab }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [runMeta, setRunMeta] = useState(null);
  const eventSourceRef = useRef(null);
  const pollTimerRef = useRef(null);

  // close the stream and stop polling if the user navigates away mid-run
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const finishWithReport = (nextReport) => {
    setReport(nextReport);
    setIsRunning(false);
    setActiveTab?.(TESTING_TABS.REPORT);
  };

  // sse can drop behind http/2 proxies, so poll for the report
  const pollForReport = (runId) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const data = await fetchTesting(`${TESTING_API_PATHS.REPORT}/${runId}`);
        if (data.success && data.data) {
          clearInterval(poll);
          finishWithReport(data.data);
        }
      } catch {
        // keep polling
      }
      if (attempts >= REPORT_POLL_MAX_ATTEMPTS) {
        clearInterval(poll);
        setIsRunning(false);
      }
    }, REPORT_POLL_INTERVAL_MS);
    pollTimerRef.current = poll;
  };

  const handleRun = async () => {
    if (!selectedIds.length) return toast.warn("Select at least one test to run");
    if (isRunning) return;

    setLogs([]);
    setReport(null);
    setIsRunning(true);
    setActiveTab?.(TESTING_TABS.RUNNING);

    try {
      const data = await testingRequest(TESTING_API_PATHS.RUN, {
        method: HTTP_METHODS.POST,
        body: {
          testIds: selectedIds,
          personaId: selectedPersona,
          credentials,
          formUrl: formUrl || undefined,
          frontendUrl: window.location.origin,
        },
        fallbackMessage: "Failed to start run",
      });
      const { runId, totalTests } = data.data;
      setRunMeta({ totalTests, startedAt: new Date().toISOString() });

      const es = new EventSource(`${SERVER_URL}${TESTING_API_PATHS.STREAM}/${runId}`, { withCredentials: true });
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        const event = JSON.parse(e.data);
        setLogs((prev) => [...prev, event]);
        if (event.type === RUN_EVENT_TYPES.RUN_COMPLETE) {
          finishWithReport(event.report);
          es.close();
        }
        if (event.type === RUN_EVENT_TYPES.ERROR) {
          toast.error(`Test runner error: ${event.message}`);
          setIsRunning(false);
          es.close();
        }
      };
      es.onerror = () => {
        es.close();
        pollForReport(runId);
      };
    } catch (err) {
      toast.error(err.message);
      setIsRunning(false);
      setActiveTab?.(TESTING_TABS.CONFIGURE);
    }
  };

  const handleStop = () => {
    eventSourceRef.current?.close();
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setIsRunning(false);
    toast.info("Test run stopped");
  };

  const completedTests = logs.filter((l) => l.type === RUN_EVENT_TYPES.TEST_COMPLETE);
  const passCount = completedTests.filter((l) => l.passed).length;
  const failCount = completedTests.length - passCount;

  return {
    isRunning,
    logs,
    report,
    runMeta,
    passCount,
    failCount,
    handleRun,
    handleStop,
  };
};

export default useTestingRun;
