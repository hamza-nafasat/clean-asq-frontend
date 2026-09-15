export const DEMO_SESSION_STATUSES = {
  GENERATING: "generating",
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  ENDED: "ended",
};

export const DEMO_STREAM_EVENTS = {
  SESSION_READY: "session-ready",
  STEP_CHANGE: "step-change",
  NARRATION: "narration",
  QUESTION_RECEIVED: "question-received",
  QUESTION_ANSWER: "question-answer",
  STATUS_CHANGE: "status-change",
  VIEWER_JOINED: "viewer-joined",
  VIEWER_LEFT: "viewer-left",
  DEMO_COMPLETE: "demo-complete",
  DEMO_ENDED: "demo-ended",
};

export const DEMO_SESSION_COMMANDS = {
  BEGIN: "begin",
  NEXT: "next",
  PREV: "prev",
  PAUSE: "pause",
  END: "end",
};
