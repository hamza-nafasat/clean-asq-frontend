import { EFFECT_NAMES } from "@/utils/effectPresets";

export const BRANDING_ROUTES = {
  LIST: "/branding",
  CREATE: "/branding/create",
  SINGLE: "/branding/single",
};

export const BRANDING_ROW_ACTIONS = {
  EDIT: "edit",
  DELETE: "delete",
  APPLY: "apply",
};

export const BRANDING_EXTRACTION_TABS = {
  AUTO: "auto",
  MANUAL: "manual",
};

export const BRANDING_EXTRACTION_TAB_OPTIONS = [
  { id: BRANDING_EXTRACTION_TABS.AUTO, label: "Auto Extract" },
  { id: BRANDING_EXTRACTION_TABS.MANUAL, label: "Manual Extract" },
];

export const BRANDING_EXTRACTION_MESSAGE_TYPE = "fintainium-branding-extraction";

export const BRANDING_MANUAL_EXTRACTION_STEPS = {
  URL: 1,
  WAITING: 2,
  RESULTS: 3,
};

export const BRANDING_PASTE_TARGETS = {
  WEBSITE_IMAGE: "websiteImage",
  LOGO: "logo",
};

export const BRANDING_STORAGE_KEYS = {
  LAST_SCREENSHOT: "lastScreenshot",
};

export const BRANDING_SCREENSHOT_ELEMENT_ID = "screen-shot";

export const BRANDING_HEADER_ALIGNMENTS = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
};

export const BRANDING_ALIGNMENT_OPTIONS = [
  { option: "Left", value: BRANDING_HEADER_ALIGNMENTS.LEFT },
  { option: "Center", value: BRANDING_HEADER_ALIGNMENTS.CENTER },
  { option: "Right", value: BRANDING_HEADER_ALIGNMENTS.RIGHT },
];

export const BRANDING_LOGO_CARD_STATES = {
  PREVIEW: "preview",
  SELECTED: "selected",
  IDLE: "idle",
};

export const BRANDING_COLOR_MODES = {
  SLIDER: "slider",
  CUSTOM: "custom",
};

export const BRANDING_EFFECT_NONE = EFFECT_NAMES.NONE;

export const BRANDING_DIRECTIONAL_EFFECTS = new Set([
  EFFECT_NAMES.BEVEL,
  EFFECT_NAMES.SOFT_SHADOW,
  EFFECT_NAMES.SOFT_EDGES,
  EFFECT_NAMES.REFLECTION,
]);

export const BRANDING_DEFAULT_FONT = "Inter";

export const BRANDING_FAVICON_MAX_DIM = 128;

export const BRANDING_COPY_FEEDBACK_MS = 2000;

export const BRANDING_CUSTOM_SWATCH_INDEX = 9;

export const BRANDING_DEFAULT_SLIDERS = {
  0: 0,
  1: 100,
  2: 50,
  3: 50,
  4: 50,
  5: 50,
  6: 50,
  7: 50,
  8: 50,
};

export const BRANDING_AI_VOICES = {
  NOVA: "nova",
  SHIMMER: "shimmer",
  ALLOY: "alloy",
  ECHO: "echo",
  ONYX: "onyx",
  FABLE: "fable",
};

export const BRANDING_LOGO_TYPES = {
  IMAGE: "img",
};

export const BRANDING_AI_PATHS = {
  LIST_CHAT: "/api/ai/branding-list-chat",
  TTS: "/api/ai/tts",
};

export const BRANDING_VOICE_SAMPLE_TEXT =
  "Hi there! I'm your application assistant. I'm here to help guide you through each step.";

export const BRANDING_AI_ICON_SRC = "/azpayments_icon_adaptive.svg";

export const BRANDING_DEFAULT_TAB_TITLE = "Online-Application";

export const BRANDING_DEFAULT_FOOTER_TEXT = "©{year} {company}, All Rights Reserved";

// email text and colour fields
export const BRANDING_EMAIL_CONTENT_FIELDS = [
  "emailHeader",
  "emailFooter",
  "headerHeading",
  "headerDescription",
  "footerHeading",
  "footerDescription",
  "emailHeadingColor",
  "emailTextColor",
  "emailHeaderColor",
  "emailFooterColor",
  "emailBodyColor",
  "emailHeaderTextColor",
  "emailFooterTextColor",
];

// email size and spacing fields
export const BRANDING_EMAIL_SIZE_FIELDS = [
  "headerHeadingSize",
  "headerDescriptionSize",
  "footerHeadingSize",
  "footerDescriptionSize",
  "emailHeaderPadding",
  "emailFooterPadding",
  "emailHeaderSpacing",
  "emailFooterSpacing",
];

// fields required before saving
export const BRANDING_REQUIRED_FIELDS = [
  "companyName",
  "websiteUrl",
  "fontFamily",
  "accentColor",
  "primaryColor",
  "secondaryColor",
  "textColor",
  "linkColor",
  "backgroundColor",
  "frameColor",
  "highlightingColor",
  "buttonTextPrimary",
  "buttonTextSecondary",
  "headerAlignment",
  "headerBackground",
  "footerBackground",
  "headerText",
  "footerText",
  "applicationFooterText",
  "emailHeader",
  "emailFooter",
  "headerHeading",
  "headerDescription",
  "footerHeading",
  "footerDescription",
  "emailHeadingColor",
  "emailTextColor",
  "emailHeaderColor",
  "emailFooterColor",
  "emailBodyColor",
  "emailHeaderTextColor",
  "emailFooterTextColor",
];

// required fields with no input
export const BRANDING_REQUIRED_FIELDS_WITHOUT_INPUT = [
  "emailHeader",
  "emailFooter",
  "emailHeadingColor",
  "emailHeaderTextColor",
];

// fields the assistant can edit
export const BRANDING_AI_FIELDS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "textColor",
  "linkColor",
  "backgroundColor",
  "headerBackground",
  "footerBackground",
  "headerText",
  "footerText",
  "frameColor",
  "highlightingColor",
  "buttonTextPrimary",
  "buttonTextSecondary",
  "buttonBorderPrimary",
  "buttonBorderSecondary",
  "fontFamily",
  "companyName",
  "websiteUrl",
  "headerAlignment",
  "appLogoMaxWidth",
  "appLogoMaxHeight",
  "appHeaderPadding",
  "appFooterPadding",
  "applicationFooterText",
  "applicationFooterTextSize",
  "emailHeaderColor",
  "emailHeaderTextColor",
  "emailFooterColor",
  "emailFooterTextColor",
  "emailBodyColor",
  "emailTextColor",
  "emailHeaderPadding",
  "emailFooterPadding",
  "aiVoice",
  "aiCustomPrompt",
  "aiLaunchButtonColor",
  "aiHeaderColor",
  "aiBannerColor",
  "aiBannerTextColor",
  "privacyPolicyUrl",
  "termsOfServiceUrl",
  "favicon",
  "tabTitle",
  "headerEffect",
  "footerEffect",
  "emailHeaderEffect",
  "emailFooterEffect",
  "buttonEffect",
  "headerMaterial",
  "footerMaterial",
  "buttonMaterial",
  "emailHeaderMaterial",
  "emailFooterMaterial",
];

// assistant context refresh fields
export const BRANDING_AI_DEP_FIELDS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "textColor",
  "linkColor",
  "backgroundColor",
  "headerBackground",
  "footerBackground",
  "headerText",
  "footerText",
  "frameColor",
  "highlightingColor",
  "buttonTextPrimary",
  "buttonTextSecondary",
  "buttonBorderPrimary",
  "buttonBorderSecondary",
  "fontFamily",
  "companyName",
  "headerAlignment",
  "emailHeaderColor",
  "emailHeaderTextColor",
  "emailFooterColor",
  "emailFooterTextColor",
  "emailBodyColor",
  "emailTextColor",
  "emailHeaderPadding",
  "emailFooterPadding",
  "aiVoice",
  "aiCustomPrompt",
  "aiLaunchButtonColor",
  "aiHeaderColor",
  "aiBannerColor",
  "aiBannerTextColor",
  "selectedLogo",
];

export const BRANDING_EDITOR_SCREEN_CONTEXT = {
  SCREEN_ID_PREFIX: "global-branding",
  NEW_SCREEN_ID: "global-branding-new",
  ASSISTANT_NAME: "Branding Assistant",
};

export const BRANDING_LIST_SCREEN_CONTEXT = {
  SCREEN_ID: "branding-list",
  SCREEN_NAME: "Branding Management",
  ASSISTANT_NAME: "Branding Assistant",
};

export const BRANDING_ON_HOME = {
  YES: "yes",
  NO: "no",
};
