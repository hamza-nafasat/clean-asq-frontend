export const UNDERWRITING_TABS = {
  HISTORY: "history",
  APPLICATION_ANALYSIS: "applicationAnalysis",
  APP_VIEWER: "appViewer",
  FORM_VERSIONS: "formVersions",
};

export const UNDERWRITING_TAB_BUTTONS = [
  { label: "History", value: UNDERWRITING_TABS.HISTORY },
  { label: "Application Analysis", value: UNDERWRITING_TABS.APPLICATION_ANALYSIS },
  { label: "App viewer", value: UNDERWRITING_TABS.APP_VIEWER },
  { label: "Form Versions", value: UNDERWRITING_TABS.FORM_VERSIONS },
];

export const UNDERWRITING_FALLBACK_ROUTE = "/application-forms";

export const ALERT_CATEGORIES = {
  DISPLAY: "display",
};

// shares rule results across the page
export const UNDERWRITING_RULES_CACHE_KEY = "underwritingRules";

export const UNDERWRITING_SCREEN_CONTEXT = {
  screenId: "underwriting",
  screenName: "Underwriting",
  assistantName: "Underwriting Assistant",
  description:
    "The Underwriting screen shows one submitted application for review: its history, the output of the form's rules, the submitted answers and every saved version.",
  greeting: `Hi! I'm your **Underwriting Assistant**.\n\nI can help you:\n- **Answer questions** about this application — its applicant, status and version\n- **Explain the rule results** shown in Application Analysis\n- **Re-run the rules** on this application\n\nWhat would you like to know?`,
};

export const DATE_TIME_OPTIONS = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};
