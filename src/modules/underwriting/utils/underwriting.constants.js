export const UNDERWRITING_TABS = {
  HISTORY: "history",
  APPLICATION_ANALYSIS: "applicationAnalysis",
  APP_VIEWER: "appViewer",
  FORM_VERSIONS: "formVersions",
};

export const UNDERWRITING_TAB_BUTTONS = [
  { label: "History", value: UNDERWRITING_TABS.HISTORY },
  { label: "Application Analysis", value: UNDERWRITING_TABS.APPLICATION_ANALYSIS },
  { label: "Application", value: UNDERWRITING_TABS.APP_VIEWER },
  { label: "Form Versions", value: UNDERWRITING_TABS.FORM_VERSIONS },
];

// statuses the backend writes to history
export const HISTORY_STATUSES = {
  COMPLETED: "completed",
  RULES_APPLIED: "rules_applied",
};

export const HISTORY_STATUS_LABELS = {
  [HISTORY_STATUSES.COMPLETED]: "Completed",
  [HISTORY_STATUSES.RULES_APPLIED]: "Rules applied",
};

// history rows not tied to a form section
export const HISTORY_SECTION_KEYS = { FORM_RULES: "form_rules" };

export const HISTORY_SECTION_NAMES = { [HISTORY_SECTION_KEYS.FORM_RULES]: "Form rules" };

// field changes with no section
export const UNGROUPED_SECTION_KEY = "other";

export const UNDERWRITING_AI_CHAT_PATH = "/api/ai/underwriting-chat";

export const UNDERWRITING_SCREEN_CONTEXT = {
  screenId: "underwriting",
  screenName: "Underwriting",
  assistantName: "Underwriting Assistant",
  description:
    "The Underwriting screen shows one submitted application for review: its history, the output of the form's rules, the submitted answers and every saved version.",
  greeting: `Hi! I'm your **Underwriting Assistant**.\n\nI can help you:\n- **Answer questions** about this application — its applicant, status and version\n- **Explain the rule results** shown in Application Analysis\n- **Run the rules** on this application\n\nWhat would you like to know?`,
};
