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
