import { FORM_FIELD_TEXT_SOURCES } from "@/constants";

export const APPLICATION_FILTER_FIELDS = {
  NAME: "name",
  ROLE: "role",
  STATUS: "status",
  TYPE: "type",
  START_DATE: "startDate",
  END_DATE: "endDate",
};

export const INITIAL_APPLICATION_FILTERS = Object.fromEntries(
  Object.values(APPLICATION_FILTER_FIELDS).map((field) => [field, ""]),
);

export const FORWARD_FORM_FIELDS = {
  EMAIL: "email",
  SECTION_KEY: "sectionKey",
};

export const INITIAL_FORWARD_FORM = { [FORWARD_FORM_FIELDS.EMAIL]: "", [FORWARD_FORM_FIELDS.SECTION_KEY]: "" };

export const FORWARD_FIELD_PROPS = {
  labelClassName: "mb-1 block text-sm font-medium text-gray-700",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base",
  selectDefaultClassName: "border-gray-300",
  placeholderOption: FORM_FIELD_TEXT_SOURCES.LABEL,
};

// formats a local date as yyyy-mm-dd
export const LOCAL_DAY_LOCALE = "en-CA";

export const APPLICATIONS_AI_CHAT_PATH = "/api/ai/applications-chat";

export const APPLICATIONS_SCREEN_CONTEXT = {
  screenId: "applications",
  screenName: "Applications",
  assistantName: "Applications Assistant",
  description:
    "The Applications screen lists every submitted application and draft made on the forms this account owns. From here the account can view or download an application's PDF, delete applications and drafts, forward a hidden section of a submitted application to someone by email, and open Underwriting.",
  greeting: `Hi! I'm your **Applications Assistant**.\n\nI can help you:\n- **Find and summarise** applications and drafts\n- **Download** a submitted application's PDF\n- **Forward a hidden section** of an application to someone by email\n- **Delete** applications or drafts\n\nWhat would you like to do?`,
};
