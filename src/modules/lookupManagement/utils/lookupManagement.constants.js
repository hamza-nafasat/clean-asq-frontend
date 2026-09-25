import { FORM_FIELD_CHANGE_SHAPES } from "@/constants";

export const LOOKUP_SCREEN_CONTEXT = {
  screenId: "lookup-management",
  screenName: "Lookup Management",
  assistantName: "Lookup Assistant",
  description:
    "The Lookup Management screen lets admins create and manage search strategies (lookups) — AI-powered extraction rules that pull specific data fields from company research. Each lookup has a key, search terms, an extraction prompt, an output format (extractAs), and an active/inactive status.",
  greeting: `Hi! I'm your **Lookup Assistant**.\n\nI can help you:\n- **Answer questions** about how lookups work and what each field does\n- **Review active vs. inactive lookups** and explain what they do\n- **Draft new lookups** with a properly written extraction prompt\n- **Activate or deactivate** one or more lookups by name\n- **Describe the expected output** for any lookup, with a sample to help with troubleshooting\n\nWhat would you like to do?`,
};

export const LOOKUP_TABS = {
  LOOKUP_KEYS: "lookupKeys",
  EXTRACTION_PROMPT: "extractionPrompt",
};

export const LOOKUP_TAB_LIST = [
  { value: LOOKUP_TABS.LOOKUP_KEYS, label: "Lookup Keys" },
  { value: LOOKUP_TABS.EXTRACTION_PROMPT, label: "Extraction Prompt" },
];

export const EXTRACTION_TABS = {
  EDIT: "edit",
  PREVIEW: "preview",
};

export const EXTRACTION_TAB_LIST = [
  { value: EXTRACTION_TABS.EDIT, label: "Edit Sections" },
  { value: EXTRACTION_TABS.PREVIEW, label: "Preview Full Prompt" },
];

export const LOOKUP_FORM_FIELDS = {
  SEARCH_OBJECT_KEY: "searchObjectKey",
  COMPANY_IDENTIFICATION: "companyIdentification",
  EXTRACT_AS: "extractAs",
  SEARCH_TERMS: "searchTerms",
  EXTRACTION_PROMPT: "extractionPrompt",
  ACTIVE: "active",
};

export const COMPANY_IDENTIFICATIONS = {
  LEGAL_COMPANY_NAME: "legal_company_name",
  SIMPLE_COMPANY_NAME: "simple_company_name",
  WEBSITE_URL: "website_url",
  NONE: "none",
};

export const EDIT_COMPANY_IDENTIFICATION_OPTIONS = [
  {
    label: "Legal company name",
    value: COMPANY_IDENTIFICATIONS.LEGAL_COMPANY_NAME,
  },
  {
    label: "Simple company name",
    value: COMPANY_IDENTIFICATIONS.SIMPLE_COMPANY_NAME,
  },
  { label: "Website URL", value: COMPANY_IDENTIFICATIONS.WEBSITE_URL },
];

export const ADD_COMPANY_IDENTIFICATION_OPTIONS = [
  ...EDIT_COMPANY_IDENTIFICATION_OPTIONS,
  { label: "None", value: COMPANY_IDENTIFICATIONS.NONE },
];

export const EXTRACT_AS_TYPES = {
  SIMPLE_TEXT: "simple_text",
  PHONE: "phone",
  ADDRESS: "address",
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  LIST: "list",
};

export const EXTRACT_AS_OPTIONS = [
  { label: "Simple Text", value: EXTRACT_AS_TYPES.SIMPLE_TEXT },
  { label: "Phone", value: EXTRACT_AS_TYPES.PHONE },
  { label: "Address", value: EXTRACT_AS_TYPES.ADDRESS },
  { label: "Text", value: EXTRACT_AS_TYPES.TEXT },
  { label: "Number", value: EXTRACT_AS_TYPES.NUMBER },
  { label: "Date", value: EXTRACT_AS_TYPES.DATE },
  { label: "List", value: EXTRACT_AS_TYPES.LIST },
];

export const PROMPT_NAMES = {
  SYSTEM_CONTEXT: "system_context",
  EXTRACTION_TASK: "extraction_task",
  OUTPUT_FORMAT: "output_format",
  EXTRACTION_GUIDELINES: "extraction_guidelines",
  SEARCH_RESULTS_HEADER: "search_results_header",
  CLOSING_INSTRUCTION: "closing_instruction",
};

export const NO_OUTPUT_EXTRACT_AS = "No output";

export const EXTRACTION_SECTION_IDS = {
  SYSTEM_CONTEXT: "1",
  EXTRACTION_TASK: "2",
  OUTPUT_FORMAT: "3",
  EXTRACTION_GUIDELINES: "4",
  SEARCH_RESULTS_HEADER: "5",
  CLOSING_INSTRUCTION: "6",
};

export const EXTRACTION_SECTION_CARDS = [
  {
    id: EXTRACTION_SECTION_IDS.SYSTEM_CONTEXT,
    title: "System Context",
    label: PROMPT_NAMES.SYSTEM_CONTEXT,
    subtitle: "Sets the role and expertise for Perplexity AI",
  },
  {
    id: EXTRACTION_SECTION_IDS.EXTRACTION_TASK,
    title: "Extraction Task",
    label: PROMPT_NAMES.EXTRACTION_TASK,
    subtitle: "Main instruction and company context",
  },
  {
    id: EXTRACTION_SECTION_IDS.OUTPUT_FORMAT,
    title: "Output Format",
    subtitle: "JSON structure and field specifications",
  },
  {
    id: EXTRACTION_SECTION_IDS.EXTRACTION_GUIDELINES,
    title: "Extraction Guidelines",
    label: PROMPT_NAMES.EXTRACTION_GUIDELINES,
    subtitle: "Rules and standards for data extraction",
  },
  {
    id: EXTRACTION_SECTION_IDS.SEARCH_RESULTS_HEADER,
    title: "Search Results Header",
    label: PROMPT_NAMES.SEARCH_RESULTS_HEADER,
    subtitle: "Introduction to the search evidence section",
  },
  {
    id: EXTRACTION_SECTION_IDS.CLOSING_INSTRUCTION,
    title: "Closing Instruction",
    label: PROMPT_NAMES.CLOSING_INSTRUCTION,
    subtitle: "Final directive for JSON output",
  },
];

// this module's FormField look
export const LOOKUP_FORM_FIELD_PROPS = {
  labelClassName: "text-textPrimary mb-1 block text-sm font-medium",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base",
  selectDefaultClassName: "border-frameColor",
  placeholderOption: "Select",
  onChangeShape: FORM_FIELD_CHANGE_SHAPES.FIELD,
  inputClassName: "w-full rounded border p-2 text-sm",
};

export const LOOKUP_FORM_LABELS = {
  [LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY]: "Lookup Key",
};

export const INITIAL_LOOKUP_FORM = {
  [LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY]: "",
  [LOOKUP_FORM_FIELDS.COMPANY_IDENTIFICATION]: [],
  [LOOKUP_FORM_FIELDS.EXTRACT_AS]: "",
  [LOOKUP_FORM_FIELDS.SEARCH_TERMS]: "",
  [LOOKUP_FORM_FIELDS.EXTRACTION_PROMPT]: "",
  [LOOKUP_FORM_FIELDS.ACTIVE]: false,
};
