export const API_TAGS = {
  BRANDINGS: "Brandings",
  SINGLE_BRANDING: "SingleBranding",
  FORM: "Form",
};

export const STORAGE_KEYS = {
  BRANDING_DATA: "brandingData",
  AI_WIDGET_USER_CLOSED: "ai-widget-user-closed",
  PENDING_BRANDING_DATA: "pendingBrandingData",
};

// value stored under AI_WIDGET_USER_CLOSED once the applicant closes the widget
export const WIDGET_CLOSED_FLAG = "1";

export const MODAL_MODES = {
  ADD: "add",
  EDIT: "edit",
};

export const SOCKET_EVENTS = {
  CONNECT: "connect",
  REGISTER_USER: "register_user",
};

export const AI_ASSISTANT_MODES = {
  SERVICE_PROVIDER: "service-provider",
  APPLICANT: "applicant",
};

export const FIELD_TYPES = {
  TEXT: "text",
  DATE: "date",
  EMAIL: "email",
  NUMBER: "number",
  PASSWORD: "password",
  TEXTAREA: "textarea",
  RANGE: "range",
  FILE: "file",
  RADIO: "radio",
  SELECT: "select",
  CHECKBOX: "checkbox",
  MULTI_CHECKBOX: "multi-checkbox",
  MULTI_SELECT: "multi-select",
};

export const EMAIL_TEMPLATE_TYPES = {
  RULE_TRIGGERED: "rule_triggered_email_template",
};

export const ROW_ACTIONS = {
  EDIT: "edit",
  DELETE: "delete",
};

export const LAYOUT_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  MY_APPLICATIONS: "/submission",
  MY_PROFILE: "/my-profile",
  APPLICATION_FORM: "/application-form",
  APPLICATION_FORMS: "/application-forms",
  ROLE_MANAGEMENT: "/all-roles",
  USER_MANAGEMENT: "/all-users",
  APPLICATIONS: "/applications",
  BRANDING: "/branding",
  LOOKUP_MANAGEMENT: "/strategies-key",
  STRATEGIES: "/strategies",
  EMAIL: "email",
};

export const HEADER_ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
};

export const LOCATION_STATUSES = {
  REQUIRED: "required",
  OPTIONAL: "optional",
  DISABLED: "disabled",
};

export const SIGNATURE_MODES = {
  DRAW: "draw",
  TYPE: "type",
};

export const SIGNATURE_KEY = "signature";

export const DOCUMENT_STATUSES = {
  LOADING: "loading",
  READY: "ready",
  UNAVAILABLE: "unavailable",
};

export const AI_HELP_CHAT_ROLES = {
  USER: "user",
  AI: "ai",
};

export const YES_NO_VALUES = {
  YES: "yes",
  NO: "no",
};

export const OWNER_ROLES = {
  PRIMARY_OPERATOR: "primary_operator",
  BENEFICIAL_OWNER: "beneficial_owner",
  BOTH: "both",
};

export const ID_MISSION_ROLES = {
  PRIMARY_OPERATOR_AND_CONTROLLER: "primaryOperatorAndController",
  PRIMARY_CONTACT: "primaryContact",
  BOTH: "both",
};

export const SECTION_TITLES = {
  COMPANY_INFORMATION: "company_information_blk",
  BENEFICIAL: "beneficial_blk",
  BANK_ACCOUNT_INFO: "bank_account_info_blk",
  AVG_TRANSACTIONS: "avg_transactions_blk",
  INCORPORATION_ARTICLE: "incorporation_article_blk",
  CUSTOM_SECTION: "custom_section",
  AGREEMENT: "agreement_blk",
  ID_VERIFICATION: "id_verification_blk",
};

export const FORM_BLOCK_TYPE = "block";

export const FIELD_NAMES = {
  MAIN_OWNER_OWN_25_PERCENT: "main_owner_own_25_percent_or_more",
  ADDITIONAL_OWNERS_OWN_25_PERCENT: "additional_owners_own_25_percent_or_more",
  BANK_ROUTING_NUMBER: "bank_routing_number",
  BANK_ACCOUNT_NUMBER: "bank_account_number",
  CONFIRM_BANK_ACCOUNT_NUMBER: "confirm_bank_account_number",
  BANK_ACCOUNT_HOLDER_NAME: "bank_account_holder_name",
  BANK_NAME: "bank_name",
  COMPANY_DESCRIPTION: "companydescription",
  ROLLING_OWNER_SSN: "rolling_owner_ssn",
  ROLLING_OWNER_IS_ALSO_OWNER: "rolling_owner_is_also_owner",
  ROLLING_OWNER_PERCENTAGE: "rolling_owner_percentage",
};

export const FIELD_NAME_MATCHERS = {
  PHONE: "phone",
  SSN: "ssn",
  TAX: "tax",
  INCORPORATION: "incorp",
};

export const FIELD_FORMATS = {
  SSN: "3,2,4",
  TAX_ID: "2,7",
  PHONE: "3,3,4",
};

export const DROPDOWN_OPTION_VALUES = {
  NONE: "none",
  OTHERS: "others",
};

export const RESOURCE_TYPES = {
  IMAGE: "image",
};

export const formKeys = {
  beneficial_owners_key: "beneficial_information", // beneficial owners section key which is section for form
  additional_owners_hidden_section_key: "additional_owners_information", // additional owners info section key which is hidden section
  company_lookup_data: "company_lookup_data", // company lookup data section key
};

export const formFieldsStaticKeys = {
  additional_owners_key: "additional_owners", //static key for additional owners field which is inside beneficial owners page
};

export const additionalOwnersFields = {
  name: "",
  email: "",
  role: "",
  job_title: "",
  have_detail: "",
  phone: "",
  ssn: "",
  address: "",
  percentage: "",
  date_of_birth: "",
  id_number: "",
  id_type: "",
  id_issuer: "",
  id_issuer_date: "",
  isCompleted: false,
};

export const STATE_SUGGESTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
  "Puerto Rico",
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "New South Wales",
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Australian Capital Territory",
  "Northern Territory",
];

// when a delete confirmation closes after its action runs
export const DELETE_CLOSE_MODES = {
  FINALLY: "finally",
  RESULT: "result",
};
