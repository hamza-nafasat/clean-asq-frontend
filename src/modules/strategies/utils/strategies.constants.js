import { FORM_FIELD_CHANGE_SHAPES, LIST_FILTER_TYPES } from "@/constants";

export const STRATEGIES_SCREEN_CONTEXT = {
  screenId: "strategies",
  screenName: "Strategies",
  assistantName: "Strategy Assistant",
  description:
    "The Strategies screen lets admins bundle one or more lookups (search strategies) into a named Strategy, then link that strategy to one or more application forms. When a form is submitted, the linked strategy's lookups run automatically to extract company data.",
  greeting: `Hi! I'm your **Strategy Assistant**.\n\nI can help you:\n- **Explain any lookup** so you can decide which to include in a strategy\n- **Recommend lookups** based on what your application form needs to capture\n- **Create a new strategy** — I'll name it, select the right lookups, and save it for you\n- **Link a strategy to an application form**\n\nTell me what you're trying to accomplish and I'll get started!`,
};

export const STRATEGY_FORM_FIELDS = {
  NAME: "name",
  FORM: "form",
  SEARCH_STRATEGIES: "searchStrategies",
};

// this module's FormField look
export const STRATEGY_FORM_FIELD_PROPS = {
  labelClassName: "text-textPrimary mb-1 block text-sm font-medium",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base",
  selectDefaultClassName: "border-frameColor",
  placeholderOption: "Choose an option",
  onChangeShape: FORM_FIELD_CHANGE_SHAPES.FIELD,
  inputClassName: "w-full rounded border p-2 text-sm",
};

export const STRATEGY_FORM_LABELS = {
  [STRATEGY_FORM_FIELDS.FORM]: "Forms",
  [STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES]: "Lookup Keys",
};

export const INITIAL_STRATEGY_FORM = {
  [STRATEGY_FORM_FIELDS.NAME]: "",
  [STRATEGY_FORM_FIELDS.FORM]: [],
  [STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES]: [],
};

export const STRATEGY_FILTER_KEYS = {
  SEARCH: "search",
  FORM: "form",
};

export const INITIAL_STRATEGY_FILTERS = {
  [STRATEGY_FILTER_KEYS.SEARCH]: "",
  [STRATEGY_FILTER_KEYS.FORM]: "",
};

// form options are added from the data
export const STRATEGY_FILTER_FIELDS = [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: STRATEGY_FILTER_KEYS.SEARCH,
    label: "Strategy",
    placeholder: "Search by strategy name",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: STRATEGY_FILTER_KEYS.FORM,
    label: "Form",
    allLabel: "All forms",
    className: "sm:col-span-2 lg:col-span-6",
  },
];
