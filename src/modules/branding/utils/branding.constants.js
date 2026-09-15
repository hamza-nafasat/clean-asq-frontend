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
  PENDING_BRANDING_DATA: "pendingBrandingData",
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

export const BRANDING_FILL_MODES = {
  SOLID: "solid",
  GRADIENT: "gradient",
};

export const BRANDING_COLOR_MODES = {
  SLIDER: "slider",
  CUSTOM: "custom",
};

export const BRANDING_EFFECT_NONE = "none";

export const BRANDING_DIRECTIONAL_EFFECTS = new Set(["bevel", "soft-shadow", "soft-edges", "reflection"]);

export const BRANDING_DEFAULT_FONT = "Inter";

export const BRANDING_FAVICON_MAX_DIM = 128;

export const BRANDING_COPY_FEEDBACK_MS = 2000;

// swatch families: black, white, gray, red, yellow, orange, blue, purple, green, custom
export const BRANDING_COLOR_LABELS = ["Black", "White", "Gray", "Red", "Yellow", "Orange", "Blue", "Purple", "Green", "Custom"];

export const BRANDING_CUSTOM_SWATCH_INDEX = 9;

export const BRANDING_SLIDER_ENDS = [
  ["Pure Black", "Dark Gray"],
  ["Light Gray", "Pure White"],
  ["Near Black", "Near White"],
  ["Darker", "Lighter"],
  ["Darker", "Lighter"],
  ["More Red", "More Yellow"],
  ["Darker", "Lighter"],
  ["More Blue", "More Red"],
  ["More Yellow", "More Blue"],
  null,
];

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

export const BRANDING_PREVIEW_STEPS = ["Business Info", "Owners", "Documents", "Review"];

export const BRANDING_AI_VOICES = {
  NOVA: "nova",
};

export const BRANDING_AI_VOICE_OPTIONS = [
  { value: "nova", label: "Nova — warm, friendly" },
  { value: "shimmer", label: "Shimmer — expressive" },
  { value: "alloy", label: "Alloy — neutral" },
  { value: "echo", label: "Echo — smooth male" },
  { value: "onyx", label: "Onyx — deep male" },
  { value: "fable", label: "Fable — British male" },
];

export const BRANDING_VOICE_SAMPLE_TEXT =
  "Hi there! I'm your application assistant. I'm here to help guide you through each step.";

export const BRANDING_AI_ICON_SRC = "/azpayments_icon_adaptive.svg";

export const BRANDING_FONT_OPTIONS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "montserrat", label: "Montserrat" },
  { value: "poppins", label: "Poppins" },
  { value: "lato", label: "Lato" },
  { value: "source-sans", label: "Source Sans Pro" },
  { value: "nunito", label: "Nunito" },
  { value: "playfair", label: "Playfair Display" },
  { value: "merriweather", label: "Merriweather" },
  { value: "alex-brush", label: "Alex Brush" },
  { value: "raleway", label: "Raleway" },
  { value: "ubuntu", label: "Ubuntu" },
  { value: "oswald", label: "Oswald" },
  { value: "roboto-slab", label: "Roboto Slab" },
  { value: "pt-sans", label: "PT Sans" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "work-sans", label: "Work Sans" },
  { value: "quicksand", label: "Quicksand" },
  { value: "rubik", label: "Rubik" },
  { value: "mulish", label: "Mulish" },
  { value: "josefin-sans", label: "Josefin Sans" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "manrope", label: "Manrope" },
  { value: "plus-jakarta-sans", label: "Plus Jakarta Sans" },
  { value: "figtree", label: "Figtree" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "sora", label: "Sora" },
  { value: "general-sans", label: "General Sans" },
  { value: "cabinet-grotesk", label: "Cabinet Grotesk" },
  { value: "clash-display", label: "Clash Display" },
  { value: "clash-grotesk", label: "Clash Grotesk" },
  { value: "satoshi", label: "Satoshi" },
  { value: "switzer", label: "Switzer" },
  { value: "chillax", label: "Chillax" },
  { value: "ranade", label: "Ranade" },
  { value: "zodiak", label: "Zodiak" },
  { value: "gambarino", label: "Gambarino" },
  { value: "sentient", label: "Sentient" },
  { value: "author", label: "Author" },
  { value: "panchang", label: "Panchang" },
  { value: "melodrama", label: "Melodrama" },
  { value: "boska", label: "Boska" },
];

export const EMAIL_HEADER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

        
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: {{emailHeaderColor}}; color: {{emailHeaderTextColor}}; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          
          <!-- Logo -->
          <tr>
            <td align="{{headerAlignment}}" style="padding: {{emailHeaderPadding}}px 20px 20px 20px; color: {{emailHeaderTextColor}};">
              <img
                src="{{{logo}}}"
                alt="{{companyName}}"
                style="max-width: {{emailLogoMaxWidth}}px; max-height: {{emailLogoMaxHeight}}px; object-fit: contain; display: block;"
              />
            </td>
          </tr>

          <!-- Company Name -->
          <tr>
            <td align="center" style="padding: 20px 20px {{emailHeaderSpacing}}px 20px; color: {{emailHeaderTextColor}};">
              <h1 style="margin: 0; font-size: {{headerHeadingSize}}px; font-weight: bold;">
                {{headerHeading}}
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding: 0 20px {{emailHeaderPadding}}px 20px; color: {{emailHeaderTextColor}};">
              <p style="margin: 0; font-size: {{headerDescriptionSize}}px;">
                {{headerDescription}}
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;

export const EMAIL_FOOTER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: {{emailFooterColor}}; color: {{emailFooterTextColor}}; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          
          <!-- Content -->
          <tr>
            <td align="center" style="padding: {{emailFooterPadding}}px 20px; color: {{emailFooterTextColor}};">
              <h2 style="margin: 0 0 {{emailFooterSpacing}}px 0; font-size: {{footerHeadingSize}}px; font-weight: bold;">
                {{footerHeading}}
              </h2>
              <p style="margin: 0; font-size: {{footerDescriptionSize}}px; color: {{emailFooterTextColor}}; line-height: 1.6;">
                {{footerDescription}}
              </p>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td align="center" style="padding: 0 20px {{emailFooterPadding}}px 20px; color: {{emailFooterTextColor}};">
              <p style="margin: 0; font-size: 12px; color: {{emailFooterTextColor}};">
                © 2025 {{companyName}} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;

export const BRANDING_DEFAULT_TAB_TITLE = "Online-Application";

export const BRANDING_DEFAULT_FOOTER_TEXT = "©{year} {company}, All Rights Reserved";

// editor defaults, privacy and terms urls come from env
export const BRANDING_EDITOR_DEFAULTS = {
  companyName: "",
  websiteUrl: "",
  websiteImage: null,
  primaryColor: "#000000",
  secondaryColor: "#000000",
  accentColor: "#000000",
  textColor: "#000000",
  linkColor: "#000000",
  backgroundColor: "",
  headerBackground: "#000000",
  headerText: "#000000",
  footerBackground: "#000000",
  footerText: "#000000",
  frameColor: "#000000",
  applicationFooterText: " ©{year} {company}, All Rights Reserved",
  applicationFooterTextSize: 16,
  appHeaderPadding: 8,
  appFooterPadding: 16,
  highlightingColor: "#000000",
  fontFamily: "",
  headerAlignment: BRANDING_HEADER_ALIGNMENTS.CENTER,
  logos: [],
  colorPalette: [],
  suggestedColors: [],
  selectedLogo: undefined,
  extraLogos: [],
  buttonTextPrimary: "#000000",
  buttonTextSecondary: "#000000",
  buttonBorderPrimary: "#000000",
  buttonBorderSecondary: "#000000",
  emailHeader: EMAIL_HEADER_TEMPLATE,
  emailFooter: EMAIL_FOOTER_TEMPLATE,
  headerHeading: "Email Header",
  headerDescription: "Automated Email — Please Do Not Reply",
  footerHeading: "Thank You",
  footerDescription: "Thank We appreciate your business and support.",
  emailHeadingColor: "#1a1a1a",
  emailTextColor: "#666666",
  emailHeaderColor: "#1a1a1a",
  emailHeaderTextColor: "#1a1a1a",
  emailFooterColor: "#1a1a1a",
  emailFooterTextColor: "#1a1a1a",
  emailBodyColor: "#1a1a1a",
  selectedEmailLogo: undefined,
  headerHeadingSize: 28,
  headerDescriptionSize: 13,
  footerHeadingSize: 20,
  footerDescriptionSize: 14,
  emailHeaderPadding: 40,
  emailFooterPadding: 40,
  emailHeaderSpacing: 20,
  emailFooterSpacing: 15,
  appLogoMaxWidth: 300,
  appLogoMaxHeight: 100,
  emailLogoMaxWidth: 300,
  emailLogoMaxHeight: 100,
  privacyPolicyUrl: "",
  termsOfServiceUrl: "",
  senderEmail: "",
  replyToEmail: "",
  aiVoice: BRANDING_AI_VOICES.NOVA,
  aiCustomPrompt: "",
  aiLaunchButtonColor: "",
  aiHeaderColor: "",
  aiBannerColor: "",
  aiBannerTextColor: "",
  aiUseCustomIcon: true,
  favicon: "",
  tabTitle: BRANDING_DEFAULT_TAB_TITLE,
  headerEffect: BRANDING_EFFECT_NONE,
  footerEffect: BRANDING_EFFECT_NONE,
  emailHeaderEffect: BRANDING_EFFECT_NONE,
  emailFooterEffect: BRANDING_EFFECT_NONE,
  buttonEffect: BRANDING_EFFECT_NONE,
  headerMaterial: 0,
  footerMaterial: 0,
  buttonMaterial: 0,
  emailHeaderMaterial: 0,
  emailFooterMaterial: 0,
};

// every field that must be filled before saving
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

// fields the branding assistant can read and set
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

// fields that re-register the assistant context when they change
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
  GREETING: `Hi! I'm your **Branding Assistant**.\n\nHere's what I can do:\n- **Edit this branding** — update colors, fonts, header/footer styles, email templates, AI assistant colors, and more\n- **Recommend colors** — suggest a full color palette, match your website's brand, or pull inspiration from any URL\n- **Edit or create logos** — remove backgrounds, recolor elements, change background colors, or generate stylistic variations of any existing logo\n- **Manage the favicon and tab title** — upload a favicon or extract one from your website\n- **Apply branding to forms** — assign this branding profile to one or more application forms\n\nWhat would you like to work on?`,
  DESCRIPTION:
    "The Global Branding screen lets admins configure company branding: colors, fonts, logos, header/footer styles, and email templates. Changes apply live across the entire application.",
};

export const BRANDING_LIST_SCREEN_CONTEXT = {
  SCREEN_ID: "branding-list",
  SCREEN_NAME: "Branding Management",
  ASSISTANT_NAME: "Branding Assistant",
  GREETING: `Hi! I'm your **Branding Assistant**.\n\nI can help you:\n- **Search** your branding profiles by name, color, font, or URL\n- **Open** a branding for editing\n- **Delete** one or more brandings\n- **Create** a new branding profile\n- **Apply** a branding to application forms or the home page\n\nWhat would you like to do?`,
};

export const BRANDING_ON_HOME = {
  YES: "yes",
  NO: "no",
};
