export const APPLICANT_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const APPLICANT_TYPE = {
  SUBMITTED: "submitted",
  DRAFT: "draft",
};

export const APPLICATIONS_ROUTES = {
  VERIFICATION: "/verification",
  APPLICATION_FORM: "/application-form",
  UNDERWRITING: "/underwriting",
};

export const APPLICANT_FILTER_KEYS = {
  NAME: "name",
  STATUS: "status",
  TYPE: "type",
  DATE_RANGE: "dateRange",
};

export const BENEFICIAL_SECTION_KEY = "beneficial_information";

export const DATE_TIME_OPTIONS = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export const APPLICATIONS_AI_CHAT_PATH = "/api/ai/applications-chat";

export const APPLICATIONS_SCREEN_CONTEXT = {
  screenId: "applications",
  screenName: "Applications",
  assistantName: "Applications Assistant",
  description:
    "The Applications screen lists every submitted application and draft made on the forms this account owns. From here the account can view or download an application's PDF, delete applications and drafts, forward a hidden section of a submitted application to someone by email, and open Underwriting.",
  greeting: `Hi! I'm your **Applications Assistant**.\n\nI can help you:\n- **Find and summarise** applications and drafts\n- **Download** a submitted application's PDF\n- **Forward a hidden section** of an application to someone by email\n- **Delete** applications or drafts\n\nWhat would you like to do?`,
};
