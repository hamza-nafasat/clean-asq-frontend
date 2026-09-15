import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  demoFinished,
  narrationReceived,
  questionAnswered,
  questionReceived,
  readyIfStillGenerating,
  sessionCleared,
  sessionReady,
  sessionStarted,
  setSessionStatus,
  setViewerCount,
  stepChanged,
} from "@/redux/slices/demo.slice";
import getEnv from "@/utils/env";
import {
  DEMO_SESSION_COMMANDS,
  DEMO_SESSION_STATUSES,
  DEMO_STREAM_EVENTS,
} from "@/modules/demo/utils/demo.constants";

const SERVER_URL = getEnv("SERVER_URL");
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40;
const GENERATION_TIMEOUT_MS = 50_000;
const LIVE_STATUSES = [DEMO_SESSION_STATUSES.READY, DEMO_SESSION_STATUSES.RUNNING, DEMO_SESSION_STATUSES.PAUSED];

// one presenter session per app, so the live connection sits at module scope
const eventSourceRef = { current: null };
const generationTimeoutRef = { current: null };

const clearGenerationTimeout = () => {
  if (!generationTimeoutRef.current) return;
  clearTimeout(generationTimeoutRef.current);
  generationTimeoutRef.current = null;
};

const closeEventSource = () => {
  if (!eventSourceRef.current) return;
  eventSourceRef.current.close();
  eventSourceRef.current = null;
};

const postSessionCommand = (sessionId, command) =>
  fetch(`${SERVER_URL}/api/demo/session/${sessionId}/${command}`, { method: "POST", credentials: "include" });

const createDemoActions = (dispatch) => {
  const handleStreamMessage = (message) => {
    switch (message.type) {
      case DEMO_STREAM_EVENTS.SESSION_READY:
        clearGenerationTimeout();
        dispatch(sessionReady(message.steps));
        break;
      case DEMO_STREAM_EVENTS.STEP_CHANGE:
        dispatch(stepChanged({ currentIndex: message.currentIndex, step: message.step, status: message.status }));
        break;
      case DEMO_STREAM_EVENTS.NARRATION:
        dispatch(narrationReceived({ narration: message.narration, demoAction: message.demoAction }));
        break;
      case DEMO_STREAM_EVENTS.QUESTION_RECEIVED:
        dispatch(questionReceived({ from: message.from, question: message.question }));
        break;
      case DEMO_STREAM_EVENTS.QUESTION_ANSWER:
        dispatch(questionAnswered({ question: message.question, answer: message.answer }));
        break;
      case DEMO_STREAM_EVENTS.STATUS_CHANGE:
        dispatch(setSessionStatus(message.status));
        break;
      case DEMO_STREAM_EVENTS.VIEWER_JOINED:
      case DEMO_STREAM_EVENTS.VIEWER_LEFT:
        dispatch(setViewerCount(message.viewerCount));
        break;
      case DEMO_STREAM_EVENTS.DEMO_COMPLETE:
      case DEMO_STREAM_EVENTS.DEMO_ENDED:
        dispatch(demoFinished());
        closeEventSource();
        break;
    }
  };

  // fall back to polling until the session is live again
  const pollSessionStatus = (sessionId) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/status`, { credentials: "include" });
        const data = await response.json();
        if (data.success) {
          dispatch(setViewerCount(data.viewerCount));
          if (LIVE_STATUSES.includes(data.status)) {
            clearInterval(poll);
            connectPresenterStream(sessionId);
          } else if (data.status === DEMO_SESSION_STATUSES.ENDED) {
            clearInterval(poll);
            dispatch(setSessionStatus(DEMO_SESSION_STATUSES.ENDED));
          }
        }
      } catch {
        // keep polling
      }
      if (attempts >= MAX_POLL_ATTEMPTS) clearInterval(poll);
    }, POLL_INTERVAL_MS);
  };

  const connectPresenterStream = (sessionId) => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    const eventSource = new EventSource(`${SERVER_URL}/api/demo/stream/${sessionId}`, { withCredentials: true });
    eventSourceRef.current = eventSource;
    eventSource.onmessage = (event) => handleStreamMessage(JSON.parse(event.data));
    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;
      pollSessionStatus(sessionId);
    };
  };

  const startDemo = async (steps, personalityPrompt, { savedScript, regenerate = false } = {}) => {
    if (!steps.length) {
      toast.error("Select at least one feature to demo");
      return false;
    }
    try {
      const response = await fetch(`${SERVER_URL}/api/demo/start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps, personalityPrompt, frontendUrl: window.location.origin, savedScript, regenerate }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      dispatch(sessionStarted(data));

      if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = setTimeout(() => {
        dispatch(readyIfStillGenerating());
        toast.warn("Script generation timed out — proceeding with talking-point notes.");
      }, GENERATION_TIMEOUT_MS);

      connectPresenterStream(data.sessionId);
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to start demo");
      return false;
    }
  };

  const sendEnd = async (sessionId) => {
    await postSessionCommand(sessionId, DEMO_SESSION_COMMANDS.END);
    clearGenerationTimeout();
    closeEventSource();
    dispatch(sessionCleared());
  };

  const sendQuestion = async (sessionId, question) => {
    await fetch(`${SERVER_URL}/api/demo/session/${sessionId}/question`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  };

  return {
    startDemo,
    sendBegin: async (sessionId) => {
      await postSessionCommand(sessionId, DEMO_SESSION_COMMANDS.BEGIN);
    },
    sendNext: async (sessionId) => {
      await postSessionCommand(sessionId, DEMO_SESSION_COMMANDS.NEXT);
    },
    sendPrev: async (sessionId) => {
      await postSessionCommand(sessionId, DEMO_SESSION_COMMANDS.PREV);
    },
    sendPause: async (sessionId) => {
      await postSessionCommand(sessionId, DEMO_SESSION_COMMANDS.PAUSE);
    },
    sendEnd,
    sendQuestion,
  };
};

const useDemoSession = () => {
  const dispatch = useDispatch();
  const demo = useSelector((state) => state.demo);
  const actions = useMemo(() => createDemoActions(dispatch), [dispatch]);
  return { ...demo, ...actions };
};

export default useDemoSession;
