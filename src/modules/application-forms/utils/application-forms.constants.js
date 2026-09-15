export const APPLICATION_FORMS_ROUTES = {
  MANAGE_RULES: "/manage-rules",
};

export const APPLICATION_FORMS_SCREEN = {
  ID: "application-forms",
  NAME: "Application Forms",
  ASSISTANT_NAME: "Form Management Assistant",
  AI_ENDPOINT_PATH: "/api/ai/form-chat",
  GREETING: `Hi! I'm your **Form Management Assistant**.\n\nI can help you:\n- **Create or delete forms**\n- **Clone a form**\n- **Reorder or delete sections** in a form\n- **Preview a form**\n- **Check form readiness**\n- **Change branding, email templates, header text, redirect URLs, and location settings**\n\n> **Note:** Editing section display text, field labels, or AI prompts must be done in the form editor UI directly.\n\nWhat would you like to do?`,
};

export const SEARCH_MODES = {
  CLIENT: "client",
  NAME: "name",
};

export const INITIAL_FORM_FILTERS = {
  clientQuery: "",
  nameQuery: "",
  dateFrom: "",
  dateTo: "",
  searchMode: SEARCH_MODES.CLIENT,
};

export const INITIAL_FORM_LOCATION_DATA = {
  title: "",
  subtitle: "",
  message: "",
  status: "",
  formatedText: "",
  formatingTextInstructions: "",
};

export const DEFAULT_HEADER_TEXT_SIZE = 24;

export const DEFAULT_FORM_BUTTON_COLOR = "#066969";

export const DEFAULT_BUTTON_EFFECT = "none";

export const DEFAULT_HEADER_BACKGROUND = "#f3f4f6";

export const DUPLICATE_FORM_NAME_PREFIX = "same name: ";

export const DUPLICATE_ERROR_KEYWORDS = ["already", "duplicate", "exists"];

export const HTTP_STATUS_CONFLICT = 409;

export const CREATED_DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const DATE_LOCALE = "en-US";

export const FORM_UPLOAD_ACCEPT = ".pdf,image/*,.csv";

export const FORM_UPLOAD_FIELDS = {
  FILE: "file",
  NAME: "name",
};

export const ASSISTANT_ROLE = "assistant";

export const UNKNOWN_ORDER_INDEX = 9999;

export const RULE_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const RULE_CATEGORIES = {
  ALERT: "alert",
  DISPLAY: "display",
  UPDATE_STATUS: "update_status",
};

export const RULE_FILTER_CATEGORY_OPTIONS = [
  { label: "Alert", value: RULE_CATEGORIES.ALERT },
  { label: "Display", value: RULE_CATEGORIES.DISPLAY },
];

export const RULE_EDITOR_CATEGORY_OPTIONS = [
  ...RULE_FILTER_CATEGORY_OPTIONS,
  { label: "Update Status", value: RULE_CATEGORIES.UPDATE_STATUS },
];

export const RULE_CATEGORIES_FIELD = {
  label: "Category",
  options: RULE_EDITOR_CATEGORY_OPTIONS,
  uniqueId: "category",
};

export const RULE_STATUS_OPTIONS = [
  { label: "Active", value: RULE_STATUSES.ACTIVE },
  { label: "Inactive", value: RULE_STATUSES.INACTIVE },
];

export const RULE_RECIPIENTS = {
  BENEFICIAL_OWNERS: "beneficial_owners_key",
  APPLICANT: "applicant",
  ALL: "all",
};

export const RECIPIENT_EMAIL_OPTIONS = [
  { label: "Beneficial Owners", value: RULE_RECIPIENTS.BENEFICIAL_OWNERS },
  { label: "Applicant", value: RULE_RECIPIENTS.APPLICANT },
  { label: "All", value: RULE_RECIPIENTS.ALL },
];

export const INITIAL_RULE_FILTERS = { name: "", category: "", status: "" };

export const RULE_FILTER_KEYS = {
  NAME: "name",
  CATEGORY: "category",
  STATUS: "status",
};

export const RULE_DRAG_ACTIVATION_DISTANCE = 5;

export const RULE_DROP_ANIMATION = {
  duration: 200,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
};
