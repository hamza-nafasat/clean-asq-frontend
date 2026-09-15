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

// props that give the shared FormField this module's look
export const STRATEGY_FORM_FIELD_PROPS = {
  labelClassName: "text-textPrimary mb-1 block text-sm font-medium",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base",
  selectDefaultClassName: "border-frameColor",
  placeholderOption: "Choose an option",
  onChangeShape: "field",
  inputClassName: "w-full rounded border p-2 text-sm",
};
