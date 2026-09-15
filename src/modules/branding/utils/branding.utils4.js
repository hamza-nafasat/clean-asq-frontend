import { BRANDING_REQUIRED_FIELDS } from "./branding.constants";
import { toSetterName } from "./branding.utils3";

export const hasMissingBrandingFields = (values) =>
  !values.colorPalette?.length || BRANDING_REQUIRED_FIELDS.some((field) => !values[field]);

const buildBrandingColors = (values) => ({
  primary: values.primaryColor,
  secondary: values.secondaryColor,
  accent: values.accentColor,
  link: values.linkColor,
  text: values.textColor,
  background: values.backgroundColor,
  frame: values.frameColor,
  highlighting: values.highlightingColor,
  buttonTextPrimary: values.buttonTextPrimary,
  buttonTextSecondary: values.buttonTextSecondary,
  buttonBorderPrimary: values.buttonBorderPrimary,
  buttonBorderSecondary: values.buttonBorderSecondary,
  headerBackground: values.headerBackground,
  footerBackground: values.footerBackground,
  headerText: values.headerText,
  footerText: values.footerText,
});

const EMAIL_FORM_FIELDS = [
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
  "headerHeadingSize",
  "headerDescriptionSize",
  "footerHeadingSize",
  "footerDescriptionSize",
  "emailHeaderPadding",
  "emailFooterPadding",
  "emailHeaderSpacing",
  "emailFooterSpacing",
];

const SIZE_FORM_FIELDS = [
  "applicationFooterText",
  "applicationFooterTextSize",
  "appHeaderPadding",
  "appFooterPadding",
  "appLogoMaxWidth",
  "appLogoMaxHeight",
  "emailLogoMaxWidth",
  "emailLogoMaxHeight",
];

const EFFECT_FORM_FIELDS = [
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

// multipart body for create and update, in the order the api has always received
export const buildBrandingFormData = (values, { isCreate = false } = {}) => {
  const formData = new FormData();
  const append = (key, value) => formData.append(key, value);
  const appendFiles = () => values.extraLogos.forEach((file) => append("files", file));

  append("name", values.companyName);
  if (isCreate) {
    append("headerAlignment", values.headerAlignment);
    append("url", values.websiteUrl);
  } else {
    append("url", values.websiteUrl);
    append("headerAlignment", values.headerAlignment);
  }
  append("fontFamily", values.fontFamily);
  append("selectedLogo", values.selectedLogo);
  append("colorPalette", JSON.stringify(values.colorPalette));
  append("colors", JSON.stringify(buildBrandingColors(values)));
  append("logos", JSON.stringify(values.logos.filter((logo) => !logo.preview)));
  SIZE_FORM_FIELDS.forEach((field) => append(field, values[field]));
  if (isCreate) appendFiles();

  EMAIL_FORM_FIELDS.forEach((field) => append(field, values[field]));
  if (values.selectedEmailLogo) append("selectedEmailLogo", values.selectedEmailLogo);
  append("senderEmail", values.senderEmail);
  append("replyToEmail", values.replyToEmail);
  append("privacyPolicyUrl", values.privacyPolicyUrl);
  append("termsOfServiceUrl", values.termsOfServiceUrl);
  append("aiVoice", values.aiVoice);
  append("aiCustomPrompt", values.aiCustomPrompt);
  append("aiLaunchButtonColor", values.aiLaunchButtonColor || values.accentColor);
  append("aiHeaderColor", values.aiHeaderColor || values.headerBackground);
  append("aiBannerColor", values.aiBannerColor || values.headerBackground);
  append("aiBannerTextColor", values.aiBannerTextColor || values.headerText);
  append("aiUseCustomIcon", String(values.aiUseCustomIcon));
  EFFECT_FORM_FIELDS.forEach((field) => append(field, values[field]));
  if (values.websiteImage && values.websiteImage.startsWith("https://")) append("screenshotUrl", values.websiteImage);
  if (!isCreate) appendFiles();

  return formData;
};

const callSetters = (branding, source, keys, test) =>
  keys.forEach((key) => {
    if (test(source?.[key])) branding[toSetterName(key)](source[key]);
  });

const isTruthy = (value) => Boolean(value);
const isDefined = (value) => value !== undefined;

// ai colours of the branding just saved, straight into the live theme
export const applySavedAiToGlobal = (saved, branding) => {
  callSetters(branding, saved, ["aiLaunchButtonColor", "aiHeaderColor", "aiBannerColor", "aiBannerTextColor"], isDefined);
  branding.setAiUseCustomIcon(saved?.aiUseCustomIcon !== false);
  callSetters(branding, saved, ["favicon", "tabTitle"], isDefined);
};

// the account's home branding into the live theme
export const applyUserBrandingToGlobal = (userBranding, branding) => {
  const colors = userBranding.colors;
  branding.setPrimaryColor(colors.primary);
  branding.setSecondaryColor(colors.secondary);
  branding.setAccentColor(colors.accent);
  branding.setTextColor(colors.text);
  branding.setLinkColor(colors.link);
  branding.setBackgroundColor(colors.background);
  branding.setFrameColor(colors.frame);
  branding.setHighlightingColor(colors.highlighting);
  branding.setFontFamily(userBranding.fontFamily);
  branding.setLogo(userBranding?.selectedLogo);
  branding.setButtonTextPrimary(colors.buttonTextPrimary);
  branding.setButtonTextSecondary(colors.buttonTextSecondary);
  branding.setHeaderAlignment(userBranding.headerAlignment);
  branding.setHeaderBackground(colors.headerBackground);
  branding.setFooterBackground(colors.footerBackground);
  branding.setHeaderText(colors.headerText);
  branding.setFooterText(colors.footerText);
  branding.setApplicationFooterText(userBranding.applicationFooterText);
  callSetters(branding, userBranding, ["applicationFooterTextSize"], isTruthy);
  callSetters(branding, userBranding, ["privacyPolicyUrl", "termsOfServiceUrl"], isDefined);
  callSetters(branding, userBranding, ["appLogoMaxWidth", "appLogoMaxHeight", "aiVoice"], isTruthy);
  callSetters(branding, userBranding, ["aiCustomPrompt"], isDefined);
  callSetters(
    branding,
    userBranding,
    ["aiLaunchButtonColor", "aiHeaderColor", "aiBannerColor", "aiBannerTextColor"],
    isTruthy,
  );
  callSetters(branding, userBranding, ["favicon", "tabTitle"], isDefined);
  callSetters(
    branding,
    userBranding,
    ["headerEffect", "footerEffect", "buttonEffect", "emailHeaderEffect", "emailFooterEffect"],
    isTruthy,
  );
  callSetters(
    branding,
    userBranding,
    ["headerMaterial", "footerMaterial", "buttonMaterial", "emailHeaderMaterial", "emailFooterMaterial"],
    isDefined,
  );
};

export const toFormsList = (forms = []) =>
  forms.map((f) => ({
    _id: f._id,
    name: f.name || f.headerText || "Untitled",
    branding: f.branding ? { _id: f.branding._id || f.branding, name: f.branding.name } : null,
  }));
