export const TESTING_TABS = {
  CONFIGURE: "configure",
  RUNNING: "running",
  REPORT: "report",
  TEST_CASES: "test-cases",
};

export const TESTING_TAB_ORDER = [
  TESTING_TABS.CONFIGURE,
  TESTING_TABS.RUNNING,
  TESTING_TABS.REPORT,
  TESTING_TABS.TEST_CASES,
];

export const TESTING_TAB_LABELS = {
  [TESTING_TABS.CONFIGURE]: "Configure",
  [TESTING_TABS.RUNNING]: "Running",
  [TESTING_TABS.REPORT]: "Report",
  [TESTING_TABS.TEST_CASES]: "Test Cases",
};

export const TESTING_API_PATHS = {
  METADATA: "/api/testing/metadata",
  TEST_CASES: "/api/testing/test-cases",
  RUN: "/api/testing/run",
  STREAM: "/api/testing/stream",
  REPORT: "/api/testing/report",
};

export const TEST_CASE_SUB_PATHS = {
  DUPLICATE: "duplicate",
  TOGGLE: "toggle",
  SEED: "seed",
  BULK_DELETE: "bulk-delete",
};

export const HTTP_METHODS = {
  POST: "POST",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

export const TESTING_SCREEN = {
  ID: "testing",
  NAME: "Automated Testing",
  ASSISTANT_NAME: "Testing Assistant",
  AI_ENDPOINT_PATH: "/api/ai/testing-chat",
  GREETING: `Hi! I'm your **Testing Assistant**.\n\nI can help you:\n- **Create** new test cases from plain-English descriptions\n- **Edit** existing test cases — add, remove, or reorder steps\n- **Duplicate** a test case to use as a starting point\n- **Delete** test cases (will ask for confirmation)\n- **Filter** the list by feature area\n- **Open** the editor for manual editing\n- **Seed** all built-in tests from the static files\n\nWhat would you like to do?`,
};

export const DEFAULT_PERSONA_ID = "clean-slate";

export const INITIAL_CREDENTIALS = { email: "", password: "" };

export const RUN_EVENT_TYPES = {
  RUN_START: "run-start",
  TEST_START: "test-start",
  STEP: "step",
  TEST_COMPLETE: "test-complete",
  RUN_COMPLETE: "run-complete",
  ERROR: "error",
};

export const STEP_STATUSES = {
  PASS: "pass",
  FAIL: "fail",
};

export const REPORT_POLL_INTERVAL_MS = 3000;

export const REPORT_POLL_MAX_ATTEMPTS = 60;

export const UNKNOWN_TEST_TOTAL = "?";

export const FULL_PASS_RATE = 100;

export const WARNING_PASS_RATE = 80;

export const ALL_AREAS_FILTER = "All";

export const DEFAULT_TEST_AREAS = [
  "Authentication",
  "Branding",
  "Form Builder",
  "Email Templates",
  "User Management",
  "Admin Review",
  "Applicant Flow",
  "AI Chat",
];

export const EMPTY_TEST_CASE = {
  testId: "",
  name: "",
  area: "",
  description: "",
  requiresLogin: false,
  requiresFormUrl: false,
  smoke: false,
  isActive: true,
  steps: [],
};

export const TEST_CASE_FLAGS = [
  { field: "requiresLogin", label: "Requires Login" },
  { field: "requiresFormUrl", label: "Requires Form URL" },
  { field: "smoke", label: "Smoke Test" },
  { field: "isActive", label: "Active" },
];

export const TEST_CASE_FIELDS = {
  TEST_ID: "testId",
  NAME: "name",
  AREA: "area",
  DESCRIPTION: "description",
  STEPS: "steps",
};

export const TEST_ID_PATTERN = /^[a-z0-9]+(\.[a-z0-9-]+)+$/;

export const STEP_ACTIONS = {
  NAVIGATE: "navigate",
  RELOAD: "reload",
  WAIT_FOR: "wait-for",
  WAIT_MS: "wait-ms",
  FILL: "fill",
  FILL_PERSONA_FIELDS: "fill-persona-fields",
  CLICK: "click",
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
  VERIFY_ANY_FILLED: "verify-any-filled",
};

// which inputs each step action shows
export const STEP_ACTION_FIELDS = {
  [STEP_ACTIONS.NAVIGATE]: { value: "Path / URL" },
  [STEP_ACTIONS.RELOAD]: {},
  [STEP_ACTIONS.WAIT_FOR]: { selector: "Selector", critical: true },
  [STEP_ACTIONS.WAIT_MS]: { value: "Milliseconds" },
  [STEP_ACTIONS.FILL]: {
    selector: "Selector",
    value: "Text to type",
    message: true,
    critical: true,
  },
  [STEP_ACTIONS.FILL_PERSONA_FIELDS]: { message: true },
  [STEP_ACTIONS.CLICK]: { selector: "Selector", message: true, critical: true },
  [STEP_ACTIONS.BLUR]: { selector: "Selector" },
  [STEP_ACTIONS.SELECT]: {
    selector: "Selector",
    value: "Option value",
    critical: true,
  },
  [STEP_ACTIONS.SCROLL_TO]: { selector: "Selector" },
  [STEP_ACTIONS.SCROLL_TO_BOTTOM]: {},
  [STEP_ACTIONS.CLEAR_SESSION_STORAGE]: { key: "Storage key" },
  [STEP_ACTIONS.VERIFY_EXISTS]: { selector: "Selector", message: true },
  [STEP_ACTIONS.VERIFY_NOT_EXISTS]: { selector: "Selector", message: true },
  [STEP_ACTIONS.VERIFY_TEXT]: {
    selector: "Selector",
    contains: "Expected text",
    message: true,
  },
  [STEP_ACTIONS.VERIFY_URL]: { contains: "URL substring", message: true },
  [STEP_ACTIONS.VERIFY_NOT_URL]: { contains: "URL substring", message: true },
  [STEP_ACTIONS.VERIFY_ANY_FILLED]: { message: true },
};

export const STEP_FIELDS = {
  ACTION: "action",
  SELECTOR: "selector",
  VALUE: "value",
  CONTAINS: "contains",
  KEY: "key",
  MESSAGE: "message",
  CRITICAL: "critical",
};

export const EMPTY_STEP = {
  action: STEP_ACTIONS.NAVIGATE,
  selector: "",
  value: "",
  contains: "",
  message: "",
  critical: true,
  key: "",
};

export const STEP_ACTION_LABELS = {
  [STEP_ACTIONS.NAVIGATE]: "Navigate to",
  [STEP_ACTIONS.FILL]: "Fill field",
  [STEP_ACTIONS.CLICK]: "Click",
  [STEP_ACTIONS.FILL_PERSONA_FIELDS]: "Fill persona fields",
  [STEP_ACTIONS.VERIFY_EXISTS]: "Verify exists",
  [STEP_ACTIONS.VERIFY_NOT_EXISTS]: "Verify not exists",
  [STEP_ACTIONS.VERIFY_TEXT]: "Verify text",
  [STEP_ACTIONS.VERIFY_URL]: "Verify URL",
  [STEP_ACTIONS.VERIFY_NOT_URL]: "Verify URL not",
  [STEP_ACTIONS.VERIFY_ANY_FILLED]: "Verify fields filled",
  [STEP_ACTIONS.WAIT_FOR]: "Wait for",
  [STEP_ACTIONS.WAIT_MS]: "Wait",
  [STEP_ACTIONS.SELECT]: "Select option",
  [STEP_ACTIONS.BLUR]: "Blur field",
  [STEP_ACTIONS.SCROLL_TO]: "Scroll to",
  [STEP_ACTIONS.SCROLL_TO_BOTTOM]: "Scroll to bottom",
  [STEP_ACTIONS.RELOAD]: "Reload page",
  [STEP_ACTIONS.CLEAR_SESSION_STORAGE]: "Clear session storage",
};

export const VERIFICATION_STATUSES = {
  UNVERIFIED: "unverified",
};

export const LOOKUP_NOT_FOUND = "Not found";

export const LOOKUP_SOURCE_KEY = "source";

export const VERIFICATION_FORM_ID_PARAM = "formid";
