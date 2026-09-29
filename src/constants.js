export const API_TAGS = {
  BRANDINGS: "Brandings",
  SINGLE_BRANDING: "SingleBranding",
  FORM: "Form",
  SINGLE_FORM: "SingleForm",
  FORM_CREATION_DATA: "FormCreationData",
  FORM_RULES: "FormRules",
  SEARCH_STRATEGIES: "SearchStrategies",
  FORM_STRATEGIES: "FormStrategies",
  PROMPTS: "Prompts",
  SUBMIT_FORM: "SubmitForm",
  SUBMIT_FORM_VERSIONS: "SubmitFormVersions",
  HISTORY: "History",
  USERS: "Users",
  MY_APPLICATIONS: "MyApplications",
};

// matches the backend upload field names
export const UPLOAD_FIELD_NAMES = {
  SINGLE: "file",
  MULTIPLE: "files",
};

export const STORAGE_KEYS = {
  BRANDING_DATA: "brandingData",
  AI_WIDGET_USER_CLOSED: "ai-widget-user-closed",
  PENDING_BRANDING_DATA: "pendingBrandingData",
};

// value stored under AI_WIDGET_USER_CLOSED once the applicant closes the widget
export const WIDGET_CLOSED_FLAG = "1";

// display name to css font slug
export const FONT_OPTIONS = [
  { value: "Inter", slug: "inter" },
  { value: "Roboto", slug: "roboto" },
  { value: "Open Sans", slug: "open-sans" },
  { value: "Montserrat", slug: "montserrat" },
  { value: "Poppins", slug: "poppins" },
  { value: "Lato", slug: "lato" },
  { value: "Source Sans Pro", slug: "source-sans" },
  { value: "Nunito", slug: "nunito" },
  { value: "Playfair Display", slug: "playfair" },
  { value: "Merriweather", slug: "merriweather" },
  { value: "Alex Brush", slug: "alex-brush" },
  { value: "Raleway", slug: "raleway" },
  { value: "Ubuntu", slug: "ubuntu" },
  { value: "Oswald", slug: "oswald" },
  { value: "Roboto Slab", slug: "roboto-slab" },
  { value: "PT Sans", slug: "pt-sans" },
  { value: "Noto Sans", slug: "noto-sans" },
  { value: "Work Sans", slug: "work-sans" },
  { value: "Quicksand", slug: "quicksand" },
  { value: "Rubik", slug: "rubik" },
  { value: "Mulish", slug: "mulish" },
  { value: "Josefin Sans", slug: "josefin-sans" },
  { value: "DM Sans", slug: "dm-sans" },
  { value: "Manrope", slug: "manrope" },
  { value: "Plus Jakarta Sans", slug: "plus-jakarta-sans" },
  { value: "Figtree", slug: "figtree" },
  { value: "Space Grotesk", slug: "space-grotesk" },
  { value: "Sora", slug: "sora" },
  { value: "General Sans", slug: "general-sans" },
  { value: "Cabinet Grotesk", slug: "cabinet-grotesk" },
  { value: "Clash Display", slug: "clash-display" },
  { value: "Clash Grotesk", slug: "clash-grotesk" },
  { value: "Satoshi", slug: "satoshi" },
  { value: "Switzer", slug: "switzer" },
  { value: "Chillax", slug: "chillax" },
  { value: "Ranade", slug: "ranade" },
  { value: "Zodiak", slug: "zodiak" },
  { value: "Gambarino", slug: "gambarino" },
  { value: "Sentient", slug: "sentient" },
  { value: "Author", slug: "author" },
  { value: "Panchang", slug: "panchang" },
  { value: "Melodrama", slug: "melodrama" },
  { value: "Boska", slug: "boska" },
];

export const URL_PREFIXES = {
  HTTP: "http",
  HTTPS: "https://",
  WWW: "www.",
};

// how FormField reports a change
export const FORM_FIELD_CHANGE_SHAPES = {
  EVENT: "event",
  FIELD: "field",
};

export const FORM_FIELD_CHECKBOX_VARIANTS = {
  NATIVE: "native",
  SHARED: "shared",
};

// where FormField takes placeholder text
export const FORM_FIELD_TEXT_SOURCES = {
  LABEL: "label",
  FIELD: "field",
};

export const MODAL_MODES = {
  ADD: "add",
  EDIT: "edit",
};

// query names on the pdf view page
export const PDF_VIEW_PARAMS = { PDF_TOKEN: "pdfToken", SUBMISSION_ID: "submissionId" };

export const HIDDEN_SECTION_PARAMS = { TOKEN: "token" };

export const VERIFICATION_PARAMS = { FORM_ID: "formid", BRANDING_NAME: "brandingName", DRAFT_ID: "draftId" };

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

export const AUTH_ROUTES = {
  LOGIN: "/login",
  FORGET_PASSWORD: "/forget-password",
  RESET_MAIL_SENT: "/reset-mail-sent",
  RESET_PASSWORD: "/reset-password",
  RESET_PASSWORD_SUCCESSFULLY: "/reset-password-successfully",
};

export const LAYOUT_ROUTES = {
  HOME: "/",
  MY_APPLICATIONS: "/submission",
  HIDDEN_SECTION: "/hidden",
  MY_PROFILE: "/my-profile",
  VERIFICATION: "/verification",
  APPLICATION_FORM: "/application-form",
  APPLICATION_FORMS: "/application-forms",
  ROLE_MANAGEMENT: "/all-roles",
  USER_MANAGEMENT: "/all-users",
  APPLICATIONS: "/applications",
  BRANDING: "/branding",
  LOOKUP_MANAGEMENT: "/strategies-key",
  STRATEGIES: "/strategies",
  EMAIL: "/email",
  UNDERWRITING: "/underwriting",
  MANAGE_RULES: "/manage-rules",
  BRANDING_CREATE: "/branding/create",
  BRANDING_SINGLE: "/branding/single",
};

// tag id of the default branding
export const DEFAULT_BRANDING_TAG_ID = "default";

export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DATE_LOCALE = "en-US";

export const DATE_TIME_OPTIONS = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export const FORM_RULE_CATEGORIES = {
  ALERT: "alert",
  DISPLAY: "display",
  UPDATE_STATUS: "update_status",
};

// statuses with their own pill colour
export const APPLICATION_STATUSES = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const SUBMISSION_TYPES = {
  SUBMITTED: "submitted",
  DRAFT: "draft",
};

// pages that show the form's branding
export const FORM_BRANDING_PATHS = [
  LAYOUT_ROUTES.APPLICATION_FORM,
  "/singleform",
  LAYOUT_ROUTES.HIDDEN_SECTION,
  LAYOUT_ROUTES.VERIFICATION,
];

export const HEADER_ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
};

// fallback theme text before a branding loads
export const DEFAULT_BRANDING_TEXT = {
  FOOTER: "©{year} Fintainium, All Rights Reserved",
  TAB_TITLE: "Online-application",
  PRIVACY_POLICY_URL: "https://fintainium.com/pp/",
  TERMS_OF_SERVICE_URL: "https://fintainium.com/t&c/",
};

export const LOCATION_STATUSES = {
  REQUIRED: "required",
  OPTIONAL: "optional",
  DISABLED: "disabled",
};

// form document keys of each form-level display text
export const FORM_DISPLAY_TEXT_FIELDS = {
  OTP: {
    text: "otpDisplayText",
    instructions: "otpDisplayFormatingInstructions",
    formatted: "otpDisplayFormatedText",
  },
  ID_MISSION_DATA: {
    text: "idMissionDataDisplayText",
    instructions: "idMissionDataDisplayFormatingInstructions",
    formatted: "idMissionDataDisplayFormatedText",
  },
  COMPANY_VERIFICATION: {
    text: "companyVerificationDisplayText",
    instructions: "companyVerificationDisplayFormatingInstructions",
    formatted: "companyVerificationDisplayFormatedText",
  },
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
  OTP: "otp_blk",
  COMPANY_SCRAPING: "company_scraping_blk",
  ID_MISSION: "id_mission_blk",
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

// fixed applicant fields shared with preview
export const COMPANY_LOOKUP_FIELDS = {
  NAME: { name: "company-name", label: "Legal company name *" },
  URL: { name: "company-url", label: "Website URL *" },
  NO_WEBSITE: { name: "noWebsite", type: FIELD_TYPES.CHECKBOX, label: "This company has no website" },
};

export const ID_DETAIL_FIELDS = [
  { name: "name", label: "Name:*", required: true, placeholder: "First name, middle name (optional), last name" },
  { name: "email", label: "Email Address:*", required: true, placeholder: "e.g. john.doe@email.com" },
  { name: "dateOfBirth", type: FIELD_TYPES.DATE, label: "Date of Birth:*", required: true },
  {
    name: "idType",
    type: FIELD_TYPES.TEXT,
    label: "ID Type:*",
    required: true,
    placeholder: 'e.g. "Driver\'s License", "State ID", "Passport"',
  },
  {
    name: "idIssuer",
    type: FIELD_TYPES.TEXT,
    label: "ID Issuer:*",
    required: true,
    placeholder: "State/Province or Country",
  },
  { name: "idExpiryDate", type: FIELD_TYPES.DATE, label: "ID Expiry Date:*", required: true },
  { name: "issueDate", type: FIELD_TYPES.DATE, label: "Issue Date:*", required: true },
  { name: "idNumber", label: "ID Number:*", required: true, placeholder: "As it appears on your ID" },
  {
    name: "streetAddress",
    type: FIELD_TYPES.TEXT,
    label: "Street Address:*",
    required: true,
    placeholder: "Start typing your address",
  },
  {
    name: "address2",
    type: FIELD_TYPES.TEXT,
    label: "Address 2 (Apt, Suite, Unit):",
    placeholder: "Apt, Suite, Unit, Floor, etc.",
  },
  { name: "city", type: FIELD_TYPES.TEXT, label: "City:*", required: true, placeholder: "e.g. New York City" },
  { name: "zipCode", type: FIELD_TYPES.TEXT, label: "Zip or Postal Code:*", required: true, placeholder: "e.g. 90210" },
  { name: "state", type: FIELD_TYPES.TEXT, label: "State/Province:*", required: true, placeholder: "e.g. California" },
  {
    name: "country",
    type: FIELD_TYPES.TEXT,
    label: "Country:*",
    required: true,
    placeholder: "e.g. United States",
  },
  { name: "companyTitle", label: "Company Title:*", required: true, placeholder: "e.g. CEO, Owner, Director" },
  {
    name: "phoneNumber",
    type: FIELD_TYPES.TEXT,
    label: "Phone Number:*",
    required: true,
    placeholder: "e.g. 555-867-5309",
    formatting: FIELD_FORMATS.PHONE,
  },
];

export const ROLE_FILLING_FIELD = {
  label: "What is the role you are filling for the company as you complete this application? ",
  type: FIELD_TYPES.RADIO,
  options: [
    {
      label:
        "A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)",
      value: ID_MISSION_ROLES.PRIMARY_OPERATOR_AND_CONTROLLER,
    },
    {
      label: "The primary contact for the company for this product or service, but not a company operator/controller ",
      value: ID_MISSION_ROLES.PRIMARY_CONTACT,
    },
    {
      label: "Both a company operator and the primary contact",
      value: ID_MISSION_ROLES.BOTH,
    },
  ],
  name: "roleFillingForCompany",
  uniqueId: "roleFillingForCompany",
  required: true,
};

export const OWNER_CARD_FIELDS = {
  NAME: {
    name: "name",
    label: "Owner or primary operator name",
    required: true,
    placeholder: "First name, middle name (optional), last name",
  },
  EMAIL: {
    name: "email",
    type: FIELD_TYPES.EMAIL,
    label: "Email Address",
    required: true,
    placeholder: "e.g. john.doe@email.com",
  },
  PHONE: {
    name: "phone",
    type: FIELD_TYPES.TEXT,
    label: "Phone Number",
    placeholder: "e.g. 555-867-5309",
    formatting: FIELD_FORMATS.PHONE,
  },
  ROLE: {
    name: "role",
    type: FIELD_TYPES.RADIO,
    label: "Role",
    required: true,
    options: [
      { label: "Primary Operator", value: OWNER_ROLES.PRIMARY_OPERATOR },
      { label: "Beneficial Owner", value: OWNER_ROLES.BENEFICIAL_OWNER },
      { label: "Both", value: OWNER_ROLES.BOTH },
    ],
  },
  HAVE_DETAIL: {
    name: "have_detail",
    type: FIELD_TYPES.RADIO,
    label: "Do you have full information for this person?",
    required: true,
    options: [
      { label: "No", value: YES_NO_VALUES.NO },
      { label: "Yes", value: YES_NO_VALUES.YES },
    ],
  },
  JOB_TITLE: { name: "job_title", label: "Job Title" },
  SSN: {
    name: "ssn",
    label: "Social Security, Tax, or National ID Number",
    placeholder: "e.g. 123-45-6789",
    formatting: FIELD_FORMATS.SSN,
  },
  ADDRESS: { name: "address", label: "Address" },
  PERCENTAGE: { name: "percentage", label: "Ownership Percentage", placeholder: "e.g. 25" },
  DATE_OF_BIRTH: { name: "date_of_birth", type: FIELD_TYPES.DATE, label: "Date of Birth" },
  ID_ISSUER: { name: "id_issuer", label: "ID Issuer", placeholder: "State/Province or Country" },
  ID_NUMBER: { name: "id_number", label: "ID Number", placeholder: "As it appears on your ID" },
};

export const NAICS_FIELD = {
  label: "NAICS Code and Description",
  required: true,
  placeholder: "Type NAICS code or description...",
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

export const HTTP_STATUSES = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
};

export const KEYBOARD_KEYS = {
  ESCAPE: "Escape",
};
