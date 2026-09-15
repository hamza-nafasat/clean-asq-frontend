import { BRANDING_DEFAULT_FOOTER_TEXT, BRANDING_DEFAULT_TAB_TITLE } from "./branding.constants";
import { toHexColor } from "./branding.utils2";

export const toSetterName = (key) => `set${key[0].toUpperCase()}${key.slice(1)}`;

export const getLogoUrl = (logo) => (typeof logo === "string" ? logo : logo?.url);

export const isPreviewLogo = (logo) => typeof logo === "object" && logo?.preview === true;

const isLogoPaletteEntry = (entry) => typeof entry === "object" && entry?.source?.toLowerCase().includes("logo");

// swap logo-sourced palette entries for freshly extracted colours
export const replaceLogoColors = (palette, colors) => {
  let newIdx = 0;
  return palette.map((entry) => (isLogoPaletteEntry(entry) && newIdx < colors.length ? colors[newIdx++] : entry));
};

const getFirstLogoColor = (palette = []) => {
  const logoEntry = palette.find(isLogoPaletteEntry);
  if (logoEntry?.hex) return logoEntry.hex;
  const first = palette[0];
  return (typeof first === "string" ? first : first?.hex) || null;
};

// { value, setValue } props for the given fields
export const toFieldProps = (values, setters, fields) =>
  Object.fromEntries(fields.flatMap((field) => [[field, values[field]], [toSetterName(field), setters[field]]]));

const copyWhen = (patch, source, keys, test) =>
  keys.forEach((key) => {
    if (test(source?.[key])) patch[key] = source[key];
  });

const isTruthy = (value) => Boolean(value);
const isDefined = (value) => value !== undefined;

// form values from an extraction result
export const mapExtractedBranding = (data) => {
  const colors = data?.colors;
  const patch = {};
  if (data?.url) patch.websiteUrl = data.url;
  Object.assign(patch, {
    fontFamily: data?.fontFamily || "",
    logos: data?.logos || [],
    primaryColor: colors?.primary,
    secondaryColor: colors?.secondary,
    accentColor: colors?.accent,
    textColor: colors?.text,
    linkColor: colors?.link,
    backgroundColor: colors?.background,
    frameColor: colors?.frame,
    highlightingColor: toHexColor(colors?.highlighting),
    buttonTextPrimary: colors?.buttonTextPrimary,
    buttonTextSecondary: colors?.buttonTextSecondary,
  });
  copyWhen(
    patch,
    colors,
    ["buttonBorderPrimary", "buttonBorderSecondary", "headerBackground", "headerText", "footerBackground", "footerText"],
    isTruthy,
  );
  if (colors?.headerBackground) patch.emailHeaderColor = colors.headerBackground;
  if (colors?.headerText) patch.emailHeaderTextColor = colors.headerText;
  if (colors?.footerBackground) patch.emailFooterColor = colors.footerBackground;
  if (colors?.footerText) patch.emailFooterTextColor = colors.footerText;

  const firstLogoColor = getFirstLogoColor(data?.color_palette || []);
  if (firstLogoColor) patch.aiLaunchButtonColor = firstLogoColor;
  else if (colors?.headerBackground) patch.aiLaunchButtonColor = colors.headerBackground;
  if (colors?.headerBackground) {
    patch.aiHeaderColor = colors.headerBackground;
    patch.aiBannerColor = colors.headerBackground;
  }
  if (colors?.headerText) patch.aiBannerTextColor = colors.headerText;

  patch.emailBodyColor = colors?.background;
  patch.emailTextColor = colors?.text;
  if (data?.prominentHeadline) patch.headerHeading = data.prominentHeadline;
  patch.headerAlignment = data?.headerAlignment;
  patch.applicationFooterText = data?.applicationFooterText || BRANDING_DEFAULT_FOOTER_TEXT;
  if (Array.isArray(data?.color_palette)) patch.colorPalette = data.color_palette;
  if (data?.screenshotUrl) patch.websiteImage = data.screenshotUrl;
  else if (data?.screenshotBase64) patch.websiteImage = `data:image/png;base64,${data.screenshotBase64}`;
  if (data?.favicon) patch.favicon = data.favicon;
  return patch;
};

const getFirstLogo = (logos) => (logos?.length > 0 ? getLogoUrl(logos[0]) : undefined);

// form values from a saved branding record
export const mapSingleBranding = (branding) => {
  const colors = branding.colors;
  const patch = {
    companyName: branding.name,
    websiteUrl: branding.url,
    logos: branding.logos || [],
    colorPalette: branding.colorPalette || [],
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    textColor: colors.text,
    linkColor: colors.link,
    backgroundColor: colors.background,
    frameColor: colors.frame,
    highlightingColor: colors.highlighting,
    headerAlignment: branding.headerAlignment,
    headerBackground: colors.headerBackground,
    footerBackground: colors.footerBackground,
    headerText: colors.headerText,
    footerText: colors.footerText,
    applicationFooterText: branding.applicationFooterText,
    fontFamily: branding.fontFamily,
    buttonTextPrimary: colors.buttonTextPrimary,
    buttonTextSecondary: colors.buttonTextSecondary,
  };
  copyWhen(patch, branding, ["applicationFooterTextSize", "appHeaderPadding", "appFooterPadding"], isTruthy);
  copyWhen(patch, colors, ["buttonBorderPrimary", "buttonBorderSecondary"], isTruthy);
  copyWhen(
    patch,
    branding,
    [
      "emailHeader",
      "emailFooter",
      "headerHeading",
      "headerDescription",
      "footerHeading",
      "footerDescription",
      "emailHeadingColor",
      "emailTextColor",
      "emailBodyColor",
      "emailHeaderColor",
      "emailFooterColor",
      "emailHeaderTextColor",
      "emailFooterTextColor",
    ],
    () => true,
  );
  copyWhen(
    patch,
    branding,
    [
      "headerHeadingSize",
      "headerDescriptionSize",
      "footerHeadingSize",
      "footerDescriptionSize",
      "emailHeaderPadding",
      "emailFooterPadding",
      "emailHeaderSpacing",
      "emailFooterSpacing",
      "appLogoMaxWidth",
      "appLogoMaxHeight",
      "emailLogoMaxWidth",
      "emailLogoMaxHeight",
      "senderEmail",
      "replyToEmail",
      "aiVoice",
      "headerEffect",
      "footerEffect",
      "emailHeaderEffect",
      "emailFooterEffect",
      "buttonEffect",
    ],
    isTruthy,
  );
  copyWhen(
    patch,
    branding,
    [
      "privacyPolicyUrl",
      "termsOfServiceUrl",
      "aiCustomPrompt",
      "headerMaterial",
      "footerMaterial",
      "buttonMaterial",
      "emailHeaderMaterial",
      "emailFooterMaterial",
    ],
    isDefined,
  );
  Object.assign(patch, {
    aiLaunchButtonColor: branding.aiLaunchButtonColor || "",
    aiHeaderColor: branding.aiHeaderColor || "",
    aiBannerColor: branding.aiBannerColor || "",
    aiBannerTextColor: branding.aiBannerTextColor || "",
    aiUseCustomIcon: branding.aiUseCustomIcon !== false,
    favicon: branding.favicon || "",
    tabTitle: branding.tabTitle || BRANDING_DEFAULT_TAB_TITLE,
  });

  const selectedLogo = branding.selectedLogo || getFirstLogo(branding.logos);
  if (selectedLogo) patch.selectedLogo = selectedLogo;
  const selectedEmailLogo = branding.selectedEmailLogo || getFirstLogo(branding.logos);
  if (selectedEmailLogo) patch.selectedEmailLogo = selectedEmailLogo;
  if (branding.screenshotUrl) patch.websiteImage = branding.screenshotUrl;
  return patch;
};
