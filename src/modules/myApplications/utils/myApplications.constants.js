export const MY_APPLICATIONS_ROUTES = {
  VERIFICATION: "/verification",
  APPLICATION_FORM: "/application-form",
  HIDDEN_FORM: "/hidden",
};

export const LONG_DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const DATE_LOCALE = "en-US";

export const MENU_CONTAINER_SELECTOR = ".menu-container";

export const CARD_CLASS =
  "relative flex h-full w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md md:p-5";

export const EMPTY_SPECIAL_ACCESS_FORM = { email: "" };

export const MY_APPLICATIONS_AI_CHAT_PATH = "/api/ai/my-applications-chat";

export const MY_APPLICATIONS_SCREEN_CONTEXT = {
  screenId: "my-applications",
  screenName: "My Applications",
  assistantName: "My Applications Assistant",
  description:
    "The My Applications screen lists this account's own drafts, submitted applications, and applications where it was added as a beneficial owner. From here the account can resume or delete a draft, download a submitted application's PDF, and invite beneficial owners by email.",
  greeting: `Hi! I'm your **Applications Assistant**.\n\nI can help you:\n- **Check** your drafts and submitted applications\n- **Download** a submitted application's PDF\n- **Invite a beneficial owner** to add their details\n- **Delete** drafts you no longer need\n\nWhat would you like to do?`,
};
