import { createContext, useCallback, useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import getEnv from "@/lib/env";

const SERVER_URL = getEnv("SERVER_URL");
const DemoSessionContext = createContext(null);

export function DemoSessionProvider({ children }) {
  const [session, setSession] = useState(null); // { sessionId, viewerUrl, totalSteps }
  const [sessionStatus, setSessionStatus] = useState(null); // generating|ready|running|paused|ended
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [narration, setNarration] = useState("");
  const [currentDemoAction, setCurrentDemoAction] = useState(null); // live action for current step
  const [questions, setQuestions] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [scriptSteps, setScriptSteps] = useState([]); // full narrated script from session-ready
  const eventSourceRef = useRef(null);
  const generationTimeoutRef = useRef(null);

  const handleSSEMessage = useCallback((msg) => {
    switch (msg.type) {
      case "session-ready":
        if (generationTimeoutRef.current) {
          clearTimeout(generationTimeoutRef.current);
          generationTimeoutRef.current = null;
        }
        if (msg.steps?.length) setScriptSteps(msg.steps);
        setSessionStatus("ready");
        break;
      case "step-change":
        setCurrentIndex(msg.currentIndex);
        setCurrentStep(msg.step);
        setSessionStatus(msg.status);
        break;
      case "narration":
        setNarration(msg.narration || "");
        setCurrentDemoAction(msg.demoAction || null);
        console.log(
          "[DemoSSE] narration received — demoAction:",
          msg.demoAction ? `${msg.demoAction.steps?.length || 0} steps` : "null (no demo action for this step)",
        );
        break;
      case "question-received":
        setQuestions((q) => [...q, { from: msg.from, question: msg.question, answer: null }]);
        break;
      case "question-answer":
        setQuestions((q) =>
          q.map((item) =>
            item.question === msg.question && item.answer === null ? { ...item, answer: msg.answer } : item,
          ),
        );
        break;
      case "status-change":
        setSessionStatus(msg.status);
        break;
      case "viewer-joined":
      case "viewer-left":
        setViewerCount(msg.viewerCount);
        break;
      case "demo-complete":
      case "demo-ended":
        setSessionStatus("ended");
        setCurrentDemoAction(null);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;
    }
  }, []);

  const pollSessionStatus = useCallback((sessionId) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const r = await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/status`, { credentials: "include" });
        const d = await r.json();
        if (d.success) {
          setViewerCount(d.viewerCount);
          if (d.status === "ready" || d.status === "running" || d.status === "paused") {
            clearInterval(poll);
            connectPresenterSSE(sessionId);
          } else if (d.status === "ended") {
            clearInterval(poll);
            setSessionStatus("ended");
          }
        }
      } catch {
        /* keep polling */
      }
      if (attempts >= 40) clearInterval(poll);
    }, 3000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectPresenterSSE = useCallback(
    (sessionId) => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      const es = new EventSource(`${SERVER_URL}/api/demo/stream/${sessionId}`, { withCredentials: true });
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        handleSSEMessage(msg);
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        console.warn("[Demo] SSE connection lost — falling back to status polling");
        pollSessionStatus(sessionId);
      };
    },
    [handleSSEMessage, pollSessionStatus],
  );

  const startDemo = useCallback(
    async (steps, personalityPrompt, { savedScript, regenerate = false } = {}) => {
      if (!steps.length) {
        toast.error("Select at least one feature to demo");
        return false;
      }
      try {
        const res = await fetch(`${SERVER_URL}/api/demo/start`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            steps,
            personalityPrompt,
            frontendUrl: window.location.origin,
            savedScript,
            regenerate,
          }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.message);

        setSession(d);
        setSessionStatus("generating");
        setCurrentIndex(0);
        setNarration("");
        setCurrentStep(null);
        setQuestions([]);
        setScriptSteps([]);

        if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = setTimeout(() => {
          setSessionStatus((prev) => (prev === "generating" ? "ready" : prev));
          toast.warn("Script generation timed out — proceeding with talking-point notes.");
        }, 50_000);

        connectPresenterSSE(d.sessionId);
        return true;
      } catch (err) {
        toast.error(err.message || "Failed to start demo");
        return false;
      }
    },
    [connectPresenterSSE],
  );

  const sendBegin = useCallback(async (sessionId) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/begin`, { method: "POST", credentials: "include" });
  }, []);

  const sendNext = useCallback(async (sessionId) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/next`, { method: "POST", credentials: "include" });
  }, []);

  const sendPrev = useCallback(async (sessionId) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/prev`, { method: "POST", credentials: "include" });
  }, []);

  const sendPause = useCallback(async (sessionId) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/pause`, { method: "POST", credentials: "include" });
  }, []);

  const sendEnd = useCallback(async (sessionId) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/end`, { method: "POST", credentials: "include" });
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSession(null);
    setSessionStatus(null);
    setCurrentStep(null);
    setNarration("");
    setCurrentDemoAction(null);
    setQuestions([]);
    setScriptSteps([]);
  }, []);

  const sendQuestion = useCallback(async (sessionId, question) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/question`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  }, []);

  return (
    <DemoSessionContext.Provider
      value={{
        session,
        sessionStatus,
        currentIndex,
        currentStep,
        narration,
        currentDemoAction,
        questions,
        viewerCount,
        scriptSteps,
        startDemo,
        sendBegin,
        sendNext,
        sendPrev,
        sendPause,
        sendEnd,
        sendQuestion,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDemoSession = () => useContext(DemoSessionContext);
