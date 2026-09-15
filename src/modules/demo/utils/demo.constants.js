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

export const DEMO_STEP_ACTIONS = {
  NAVIGATE: "navigate",
  RELOAD: "reload",
  WAIT_FOR: "wait-for",
  WAIT_FOR_GONE: "wait-for-gone",
  WAIT_MS: "wait-ms",
  FILL: "fill",
  FILL_PERSONA_FIELDS: "fill-persona-fields",
  CLICK: "click",
  CLICK_IF_EXISTS: "click-if-exists",
  CLICK_TEXT: "click-text",
  BLUR: "blur",
  SELECT: "select",
  SCROLL_TO: "scroll-to",
  SCROLL_TO_BOTTOM: "scroll-to-bottom",
  CLEAR_SESSION_STORAGE: "clear-session-storage",
  VERIFY_EXISTS: "verify-exists",
  VERIFY_NOT_EXISTS: "verify-not-exists",
  VERIFY_TEXT: "verify-text",
  VERIFY_URL: "verify-url",
  VERIFY_NOT_URL: "verify-not-url",
  VERIFY_VALUE: "verify-value",
  VERIFY_ANY_FILLED: "verify-any-filled",
};

export const DEMO_STEP_RESULTS = {
  PASS: "pass",
  FAIL: "fail",
  RUNNING: "running",
};

export const DEMO_ACTION_STATUSES = {
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
};

export const DEMO_CHAT_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
};

export const DEMO_TABS = {
  CONFIGURE: "configure",
  SCRIPT: "script",
  BUILDER: "builder",
};

export const DEMO_STORAGE_KEYS = {
  ACTIVE_TAB: "demo-active-tab",
  BUILDER_FEATURE_ID: "demo-builder-feature-id",
  BUILDER_LEVEL: "demo-builder-level",
  BUILDER_PROPOSED_ACTION: "demo-builder-proposed-action",
};

export const DEMO_BUILDER_LEVELS = {
  INTRO: "intro",
  CHAPTER: "chapter",
};

export const DEMO_CHAPTER_LEVEL_PREFIX = "ch";

export const DEMO_CHAPTER_KEY_SEPARATOR = "__ch";

export const DEMO_SCRIPT_SOURCES = {
  LIVE: "live",
  SAVED: "saved",
};

export const DEMO_PERSONA = {
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@acmefinancial.com",
  phone: "555-867-5309",
  address: "1200 Commerce Blvd",
  city: "Nashville",
  zip: "37201",
  company: "Acme Financial",
  companyName: "Acme Financial",
};

export const DEMO_PERSONA_FIELD_ALIASES = {
  firstName: ["firstname", "first-name", "first_name", "givenname", "fname"],
  lastName: ["lastname", "last-name", "last_name", "surname", "lname"],
  email: ["email"],
  phone: ["phone", "mobile", "tel", "telephone"],
  address: ["address", "street", "addr"],
  city: ["city", "town"],
  zip: ["zip", "postal", "postcode", "zipcode"],
  company: ["company", "organization", "organisation", "employer"],
  companyName: ["companyname", "company-name", "company_name"],
};

export const DEMO_STEP_TIMEOUT_MS = 10_000;

export const DEMO_WAIT_FOR_GONE_TIMEOUT_MS = 30_000;

export const DEMO_ACTION_SETTLE_MS = 1200;

export const DEMO_ACTION_STATUS_CLEAR_MS = 6000;

export const DEMO_COPY_FEEDBACK_MS = 2000;

export const DEMO_STEP_SUMMARY_LIMIT = 6;

export const DEMO_ACTION_PREVIEW_LIMIT = 4;

export const DEMO_PARAM_FIELDS = ["value", "selector", "contains"];

export const DEMO_PERSONA_PREVIEW_LENGTH = 60;

export const DEMO_TAB_OPTIONS = [
  { id: DEMO_TABS.CONFIGURE, label: "Menu" },
  { id: DEMO_TABS.SCRIPT, label: "Script" },
  { id: DEMO_TABS.BUILDER, label: "Builder" },
];

export const DEMO_SCREEN_CONTEXT = {
  SCREEN_ID: "demo",
  SCREEN_NAME: "Sales Demo",
  ASSISTANT_NAME: "Demo Assistant",
  DESCRIPTION:
    "The Sales Demo page lets you configure and run an AI-powered product demonstration. " +
    "Select features, set the presentation order, add talking-point context, and launch an interactive demo. " +
    "The Builder tab lets you build live action sequences for each feature — the AI interviews you about each feature and constructs browser automation steps.",
  GREETING: `Hi! I'm your **Demo Assistant**.\n\nI can help you:\n- **Build demo actions** — walk me through a feature and I'll construct a live browser automation sequence\n- **Select features** for a demo run\n- **Set narration tone and audience** instructions\n- **Save** approved action sequences to your active preset\n\nWhat would you like to do?`,
};
