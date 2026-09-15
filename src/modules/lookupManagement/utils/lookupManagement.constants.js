export const LOOKUP_SCREEN_CONTEXT = {
  screenId: "lookup-management",
  screenName: "Lookup Management",
  assistantName: "Lookup Assistant",
  description:
    "The Lookup Management screen lets admins create and manage search strategies (lookups) — AI-powered extraction rules that pull specific data fields from company research. Each lookup has a key, search terms, an extraction prompt, an output format (extractAs), and an active/inactive status.",
  greeting: `Hi! I'm your **Lookup Assistant**.\n\nI can help you:\n- **Answer questions** about how lookups work and what each field does\n- **Review active vs. inactive lookups** and explain what they do\n- **Draft new lookups** with a properly written extraction prompt\n- **Activate or deactivate** one or more lookups by name\n- **Describe the expected output** for any lookup, with a sample to help with troubleshooting\n\nWhat would you like to do?`,
};

export const LOOKUP_TABS = {
  STRATEGIES_KEY: "one",
  EXTRACTION_PROMPT: "two",
};

export const LOOKUP_TAB_LIST = [
  { id: LOOKUP_TABS.STRATEGIES_KEY, label: "Strategies Key" },
  { id: LOOKUP_TABS.EXTRACTION_PROMPT, label: "Extraction Prompt" },
];

export const EXTRACTION_TABS = {
  EDIT: "edit",
  PREVIEW: "preview",
};

export const LOOKUP_FORM_FIELDS = {
  SEARCH_OBJECT_KEY: "searchObjectKey",
  COMPANY_IDENTIFICATION: "companyIdentification",
  EXTRACT_AS: "extractAs",
  SEARCH_TERMS: "searchTerms",
  EXTRACTION_PROMPT: "extractionPrompt",
  ACTIVE: "active",
};

export const ADD_COMPANY_IDENTIFICATION_OPTIONS = [
  { label: "Legal company name", value: "legal_company_name" },
  { label: "Simple company name", value: "simple_company_name" },
  { label: "Website Url", value: "website_url" },
  { label: "None", value: "none" },
];

export const EDIT_COMPANY_IDENTIFICATION_OPTIONS = [
  { label: "Legal company name", value: "legal_company_name" },
  { label: "Simple company name", value: "simple_company_name" },
  { label: "Website Url", value: "website_url" },
];

export const EXTRACT_AS_OPTIONS = [
  { label: "Simple Text", value: "simple_text" },
  { label: "Phone", value: "phone" },
  { label: "Address", value: "address" },
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "List", value: "list" },
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

// section 3 is generated, not editable
export const OUTPUT_FORMAT_SECTION_ID = "3";

export const EXTRACTION_SECTION_CARDS = [
  {
    id: "1",
    title: "System Context",
    label: PROMPT_NAMES.SYSTEM_CONTEXT,
    subtitle: "Sets the role and expertise for Perplexity AI",
  },
  {
    id: "2",
    title: "Extraction Task",
    label: PROMPT_NAMES.EXTRACTION_TASK,
    subtitle: "Main instruction and company context",
  },
  { id: OUTPUT_FORMAT_SECTION_ID, title: "Output Format", subtitle: "JSON structure and field specifications" },
  {
    id: "4",
    title: "Extraction Guidelines",
    label: PROMPT_NAMES.EXTRACTION_GUIDELINES,
    subtitle: "Rules and standards for data extraction",
  },
  {
    id: "5",
    title: "Search Results Header",
    label: PROMPT_NAMES.SEARCH_RESULTS_HEADER,
    subtitle: "Introduction to the search evidence section",
  },
  {
    id: "6",
    title: "Closing Instruction",
    label: PROMPT_NAMES.CLOSING_INSTRUCTION,
    subtitle: "Final directive for JSON output",
  },
];

// props that give the shared FormField this module's look
export const LOOKUP_FORM_FIELD_PROPS = {
  labelClassName: "text-textPrimary mb-1 block text-sm font-medium",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base",
  selectDefaultClassName: "border-frameColor",
  placeholderOption: "Select",
  onChangeShape: "field",
  inputClassName: "w-full rounded border p-2 text-sm",
};
