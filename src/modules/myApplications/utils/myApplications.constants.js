export const LONG_DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const CARD_CLASS =
  "relative flex h-full w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md md:p-5";

// branded buttons dim on hover
export const BRANDED_BUTTON_CLASS = "w-full transition-all duration-300 hover:opacity-60 sm:w-auto";

export const INVITE_FORM_FIELDS = { EMAIL: "email" };

export const INITIAL_INVITE_FORM = { [INVITE_FORM_FIELDS.EMAIL]: "" };

export const MY_APPLICATIONS_AI_CHAT_PATH = "/api/ai/my-applications-chat";

export const MY_APPLICATIONS_SCREEN_CONTEXT = {
  screenId: "my-applications",
  screenName: "My Applications",
  assistantName: "My Applications Assistant",
  description:
    "The My Applications screen lists this account's own drafts, submitted applications with their review status, and applications where it was added as a beneficial owner. From here the account can resume or delete a draft, download a submitted application's PDF, and invite beneficial owners by email.",
  greeting: `Hi! I'm your **Applications Assistant**.\n\nI can help you:\n- **Check** your drafts and submitted applications\n- **Download** a submitted application's PDF\n- **Invite a beneficial owner** to add their details\n- **Delete** drafts you no longer need\n\nWhat would you like to do?`,
};
