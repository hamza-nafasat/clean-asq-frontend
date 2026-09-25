export const RULE_AI_CHAT_PATH = "/api/ai/rule-chat";

export const RULE_SCREEN_CONTEXT = {
  screenId: "manage-rules",
  screenName: "Manage Rules",
  assistantName: "Rules Assistant",
  description:
    "The Manage Rules screen lists the rules of one application form. When an application is reviewed, each rule that is on runs in order and shows an alert, displays data, or sets the application status, and can email someone when it triggers.",
  greeting: `Hi! I'm your **Rules Assistant**.\n\nI can help you:\n- **Explain** what each rule on this form does\n- **Create a rule** from a plain-English description\n- **Edit, turn on or off, reorder, or delete** rules\n\nWhat would you like to do?`,
};
