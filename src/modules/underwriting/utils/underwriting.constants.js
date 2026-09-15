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

export const DATE_TIME_OPTIONS = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};
