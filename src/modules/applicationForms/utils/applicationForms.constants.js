import { FORM_RULE_CATEGORIES, LIST_FILTER_TYPES } from "@/constants";

export const APPLICATION_FORMS_SCREEN = {
  ID: "application-forms",
  NAME: "Application Forms",
  ASSISTANT_NAME: "Form Management Assistant",
  AI_ENDPOINT_PATH: "/api/ai/form-chat",
  GREETING: `Hi! I'm your **Form Management Assistant**.\n\nI can help you:\n- **Create, clone or delete forms**\n- **Preview a form** and **check its readiness**\n- **Change branding** on forms or your website, plus **email templates, header text, redirect URLs, location settings and step display texts**\n- **Edit a form's content** — add, reorder or delete sections and fields; change display text, signature settings, field labels, types, options, required and AI prompts\n\nContent edits are previewed first — say **save** to apply them.\n\nWhat would you like to do?`,
};

export const FORM_FILTER_KEYS = {
  NAME_QUERY: "nameQuery",
  DATE_FROM: "dateFrom",
  DATE_TO: "dateTo",
};

export const INITIAL_FORM_FILTERS = {
  [FORM_FILTER_KEYS.NAME_QUERY]: "",
  [FORM_FILTER_KEYS.DATE_FROM]: "",
  [FORM_FILTER_KEYS.DATE_TO]: "",
};

export const FORM_FILTER_FIELDS = [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: FORM_FILTER_KEYS.NAME_QUERY,
    label: "Form name",
    placeholder: "Search by form name",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.DATE,
    name: FORM_FILTER_KEYS.DATE_FROM,
    placeholder: "From date",
    className: "lg:col-span-3",
  },
  { type: LIST_FILTER_TYPES.DATE, name: FORM_FILTER_KEYS.DATE_TO, placeholder: "To date", className: "lg:col-span-3" },
];

export const DEFAULT_HEADER_TEXT_SIZE = 24;

export const HEADER_TEXT_SIZE_LIMITS = { MIN: 8, MAX: 72 };

export const FORM_CONFIG_FIELDS = {
  FORM_URL: "formUrl",
  REDIRECT_URL: "redirectUrl",
  HEADER_TEXT: "headerText",
  HEADER_TEXT_SIZE: "headerTextSize",
};

export const LOCATION_FIELDS = {
  STATUS: "locationStatus",
  MESSAGE: "locationMessage",
  FORMATTED_MESSAGE: "formatedLocationMessage",
  INSTRUCTIONS: "formateTextInstructions",
};

export const COPY_RESET_MS = 2000;

// app theme colour, overridden by branding
export const DEFAULT_FORM_BUTTON_COLOR = "var(--primary)";

export const DEFAULT_BUTTON_EFFECT = "none";

export const DUPLICATE_FORM_NAME_PREFIX = "same name: ";

export const DUPLICATE_ERROR_KEYWORDS = ["already", "duplicate", "exists"];

export const HTTP_STATUS_CONFLICT = 409;

export const CREATED_DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

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

export const RULE_FILTER_CATEGORY_OPTIONS = [
  { label: "Alert", value: FORM_RULE_CATEGORIES.ALERT },
  { label: "Display", value: FORM_RULE_CATEGORIES.DISPLAY },
];

const RULE_EDITOR_CATEGORY_OPTIONS = [
  ...RULE_FILTER_CATEGORY_OPTIONS,
  { label: "Update Status", value: FORM_RULE_CATEGORIES.UPDATE_STATUS },
];

export const RULE_FIELDS = {
  NAME: "name",
  CATEGORY: "category",
  PROMPT: "prompt",
  IS_EMAIL_SENT_ON: "isEmailSentOn",
  RECIEVER_EMAIL: "recieverEmail",
  EMAIL_TEMPLATE_ID: "emailTemplateId",
};

export const RULE_CATEGORIES_FIELD = {
  label: "Category",
  name: RULE_FIELDS.CATEGORY,
  options: RULE_EDITOR_CATEGORY_OPTIONS,
  uniqueId: RULE_FIELDS.CATEGORY,
};

export const RULE_STATUS_OPTIONS = [
  { label: "Active", value: RULE_STATUSES.ACTIVE },
  { label: "Inactive", value: RULE_STATUSES.INACTIVE },
];

const RULE_RECIPIENTS = {
  BENEFICIAL_OWNERS: "beneficial_owners_key",
  APPLICANT: "applicant",
  ALL: "all",
};

export const RECIPIENT_EMAIL_OPTIONS = [
  { label: "Beneficial Owners", value: RULE_RECIPIENTS.BENEFICIAL_OWNERS },
  { label: "Applicant", value: RULE_RECIPIENTS.APPLICANT },
  { label: "All", value: RULE_RECIPIENTS.ALL },
];

export const RULE_FILTER_KEYS = {
  NAME: "name",
  CATEGORY: "category",
  STATUS: "status",
};

export const INITIAL_RULE_FILTERS = {
  [RULE_FILTER_KEYS.NAME]: "",
  [RULE_FILTER_KEYS.CATEGORY]: "",
  [RULE_FILTER_KEYS.STATUS]: "",
};

export const RULE_ROW_ACTIONS = {
  STATUS: "status",
  EDIT: "edit",
  DELETE: "delete",
};

export const RULE_FILTER_IDS = {
  NAME: "rule-filter-name",
  CATEGORY: "rule-filter-category",
  STATUS: "rule-filter-status",
};

export const RULE_DRAG_ACTIVATION_DISTANCE = 5;

export const RULE_DROP_ANIMATION = {
  duration: 200,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
};

export const INITIAL_RULE = {
  prompt: "",
  name: "",
  category: "",
  order: "",
  handler: "",
  formula: "",
  example: "",
  explanation: "",
  isEmailSentOn: false,
  recieverEmail: RULE_RECIPIENTS.APPLICANT,
  emailTemplateId: "",
};
