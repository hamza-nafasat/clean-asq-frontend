import {
  BRANDING_AI_VOICES,
  BRANDING_DEFAULT_FOOTER_TEXT,
  BRANDING_DEFAULT_TAB_TITLE,
  BRANDING_EFFECT_NONE,
  BRANDING_HEADER_ALIGNMENTS,
} from "./branding.constants";

export const BRANDING_COLOR_LABELS = ["Black", "White", "Gray", "Red", "Yellow", "Orange", "Blue", "Purple", "Green", "Custom"];

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

export const BRANDING_PREVIEW_STEPS = ["Business Info", "Owners", "Documents", "Review"];

export const BRANDING_AI_VOICE_OPTIONS = [
  { value: BRANDING_AI_VOICES.NOVA, label: "Nova — warm, friendly" },
  { value: BRANDING_AI_VOICES.SHIMMER, label: "Shimmer — expressive" },
  { value: BRANDING_AI_VOICES.ALLOY, label: "Alloy — neutral" },
  { value: BRANDING_AI_VOICES.ECHO, label: "Echo — smooth male" },
  { value: BRANDING_AI_VOICES.ONYX, label: "Onyx — deep male" },
  { value: BRANDING_AI_VOICES.FABLE, label: "Fable — British male" },
];

export const EMAIL_HEADER_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: {{emailHeaderColor}}; color: {{emailHeaderTextColor}}; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: {{emailFooterColor}}; color: {{emailFooterTextColor}}; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          
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
                © ${new Date().getFullYear()} {{companyName}} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;

// editor defaults, legal urls from env
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
  applicationFooterText: BRANDING_DEFAULT_FOOTER_TEXT,
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
  footerDescription: "Thank you, we appreciate your business and support.",
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

export const BRANDING_EDITOR_ASSISTANT_COPY = {
  GREETING: `Hi! I'm your **Branding Assistant**.\n\nHere's what I can do:\n- **Edit this branding** — update colors, fonts, header/footer styles, email templates, AI assistant colors, and more\n- **Recommend colors** — suggest a full color palette, match your website's brand, or pull inspiration from any URL\n- **Edit or create logos** — remove backgrounds, recolor elements, change background colors, or generate stylistic variations of any existing logo\n- **Manage the favicon and tab title** — upload a favicon or extract one from your website\n- **Apply branding to forms** — assign this branding profile to one or more application forms\n\nWhat would you like to work on?`,
  DESCRIPTION:
    "The Global Branding screen lets admins configure company branding: colors, fonts, logos, header/footer styles, and email templates. Changes apply live across the entire application.",
};

export const BRANDING_LIST_ASSISTANT_COPY = {
  GREETING: `Hi! I'm your **Branding Assistant**.\n\nI can help you:\n- **Search** your branding profiles by name, color, font, or URL\n- **Open** a branding for editing\n- **Delete** one or more brandings\n- **Create** a new branding profile\n- **Apply** a branding to application forms or the home page\n\nWhat would you like to do?`,
};
