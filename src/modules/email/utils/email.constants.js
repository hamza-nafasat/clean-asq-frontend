import { EMAIL_TEMPLATE_TYPES, LIST_FILTER_TYPES } from "@/constants";

export const EMAIL_TYPES = [
  { label: "Otp Email Template", value: EMAIL_TEMPLATE_TYPES.OTP },
  { label: "Old Beneficial Owners Email Template", value: EMAIL_TEMPLATE_TYPES.OLD_BENEFICIAL_OWNERS },
  { label: "New Beneficial Owners Email Template", value: EMAIL_TEMPLATE_TYPES.NEW_BENEFICIAL_OWNERS },
  { label: "Form Forwarded Email Template", value: EMAIL_TEMPLATE_TYPES.FORM_FORWARDED },
  { label: "Welcome Email Template", value: EMAIL_TEMPLATE_TYPES.WELCOME },
  { label: "Rule Triggered Email Template", value: EMAIL_TEMPLATE_TYPES.RULE_TRIGGERED },
];

export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

export const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "script",
  "indent",
  "direction",
  "color",
  "background",
  "align",
  "link",
  "image",
  "data",
];

// placeholders the mailer fills, {{name}} in the body
export const TEMPLATE_KEYWORDS = [
  "link",
  "otp",
  "email",
  "password",
  "frontEndUrl",
  "recipientName",
  "brandCompanyName",
];

// rule emails also fill the rule result
export const RULE_TEMPLATE_KEYWORDS = [...TEMPLATE_KEYWORDS, "data"];

export const TEMPLATE_OPEN_MODES = {
  EDIT: "edit",
  VIEW: "view",
};

export const TEMPLATE_MODAL_MODES = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
};

// screen states the email ai chat reads
export const EMAIL_SCREEN_STATES = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
};

export const EMAIL_SCREEN_IDS = {
  LIST: "email-template-list",
  NEW: "email-template-new",
  TEMPLATE_PREFIX: "email-template-",
};

export const TEMPLATE_FIELDS = {
  NAME: "templateName",
  TYPE: "emailType",
  SUBJECT: "subject",
  BODY: "body",
};

export const INITIAL_EDIT_DATA = {
  [TEMPLATE_FIELDS.NAME]: "",
  [TEMPLATE_FIELDS.SUBJECT]: "",
  [TEMPLATE_FIELDS.TYPE]: "",
  [TEMPLATE_FIELDS.BODY]: "",
};

export const EMAIL_FILTER_KEYS = {
  SEARCH: "search",
  TYPE: "emailType",
  FORM: "form",
};

export const INITIAL_EMAIL_FILTERS = {
  [EMAIL_FILTER_KEYS.SEARCH]: "",
  [EMAIL_FILTER_KEYS.TYPE]: "",
  [EMAIL_FILTER_KEYS.FORM]: "",
};

// form filter value for templates on no form
export const EMAIL_FORM_FILTER_NONE = "none";

export const EMAIL_FILTER_FIELDS = [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: EMAIL_FILTER_KEYS.SEARCH,
    label: "Template",
    placeholder: "Search by name or subject",
    className: "sm:col-span-2 lg:col-span-4",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: EMAIL_FILTER_KEYS.TYPE,
    label: "Email type",
    allLabel: "All email types",
    options: EMAIL_TYPES,
    className: "lg:col-span-4",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: EMAIL_FILTER_KEYS.FORM,
    label: "Attached form",
    allLabel: "All attached forms",
    className: "lg:col-span-4",
  },
];
