import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_AI_VOICE } from "@/components/shared/aiChat/utils/aiChat.constants";
import { DEFAULT_BRANDING_TEXT, HEADER_ALIGNMENTS } from "@/constants";
import { EFFECT_NAMES } from "@/utils/effectPresets";

const DEFAULT_COLORS = {
  primaryColor: "#066969",
  secondaryColor: "#21ccb0",
  accentColor: "#72ffe7",
  textColor: "#1b1b1b",
  linkColor: "#1025e3",
  backgroundColor: "#f9f9f9",
  headerBackgroundColor: "#f9f9f9",
  footerBackgroundColor: "#f9f9f9",
  frameColor: "#db1313",
  highlightingColor: "#000000",
  fontFamily: "Inter",
  buttonTextPrimary: "#bfff00",
  buttonTextSecondary: "#bfff00",
  footerBackground: "#998069",
  headerBackground: "#f3e1d0",
  headerText: "#000000",
  footerText: "#000000",
};

export const DEFAULT_BRANDING_THEME = {
  name: "",
  logo: "",
  primaryColor: DEFAULT_COLORS.primaryColor,
  secondaryColor: DEFAULT_COLORS.secondaryColor,
  accentColor: DEFAULT_COLORS.accentColor,
  textColor: DEFAULT_COLORS.textColor,
  linkColor: DEFAULT_COLORS.linkColor,
  backgroundColor: DEFAULT_COLORS.backgroundColor,
  frameColor: DEFAULT_COLORS.frameColor,
  highlightingColor: DEFAULT_COLORS.highlightingColor,
  fontFamily: DEFAULT_COLORS.fontFamily,
  buttonTextPrimary: DEFAULT_COLORS.buttonTextPrimary,
  buttonTextSecondary: DEFAULT_COLORS.buttonTextSecondary,
  headerBackground: DEFAULT_COLORS.headerBackgroundColor,
  footerBackground: DEFAULT_COLORS.footerBackgroundColor,
  headerAlignment: HEADER_ALIGNMENTS.LEFT,
  headerText: DEFAULT_COLORS.headerText,
  footerText: DEFAULT_COLORS.footerText,
  applicationFooterText: DEFAULT_BRANDING_TEXT.FOOTER,
  applicationFooterTextSize: 20,
  appHeaderPadding: 8,
  appFooterPadding: 16,
  appLogoMaxWidth: 300,
  appLogoMaxHeight: 100,
  aiVoice: DEFAULT_AI_VOICE,
  aiCustomPrompt: "",
  aiLaunchButtonColor: "",
  aiHeaderColor: "",
  aiBannerColor: "",
  aiBannerTextColor: "",
  aiUseCustomIcon: true,
  aiSliderColor: "",
  privacyPolicyUrl: DEFAULT_BRANDING_TEXT.PRIVACY_POLICY_URL,
  termsOfServiceUrl: DEFAULT_BRANDING_TEXT.TERMS_OF_SERVICE_URL,
  favicon: "",
  tabTitle: DEFAULT_BRANDING_TEXT.TAB_TITLE,
  headerEffect: EFFECT_NAMES.NONE,
  footerEffect: EFFECT_NAMES.NONE,
  emailHeaderEffect: EFFECT_NAMES.NONE,
  emailFooterEffect: EFFECT_NAMES.NONE,
  buttonEffect: EFFECT_NAMES.NONE,
  headerMaterial: 0,
  footerMaterial: 0,
  buttonMaterial: 0,
  emailHeaderMaterial: 0,
  emailFooterMaterial: 0,
};

// saved values copied over only when present
const TRUTHY_SAVED_KEYS = [
  "aiVoice",
  "aiCustomPrompt",
  "aiLaunchButtonColor",
  "aiHeaderColor",
  "aiBannerColor",
  "aiBannerTextColor",
  "aiSliderColor",
  "privacyPolicyUrl",
  "termsOfServiceUrl",
  "favicon",
  "headerEffect",
  "footerEffect",
  "emailHeaderEffect",
  "emailFooterEffect",
  "buttonEffect",
];
const DEFINED_SAVED_KEYS = ["headerMaterial", "footerMaterial", "buttonMaterial", "emailHeaderMaterial", "emailFooterMaterial"];

const initialState = {
  theme: DEFAULT_BRANDING_THEME,
};

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    setBrandingValue: (state, action) => {
      state.theme[action.payload.key] = action.payload.value;
    },
    loadSavedBranding: (state, action) => {
      const saved = action.payload;
      const theme = state.theme;
      theme.name = saved.name || "";
      theme.primaryColor = saved.primaryColor || DEFAULT_COLORS.primaryColor;
      theme.secondaryColor = saved.secondaryColor || DEFAULT_COLORS.secondaryColor;
      theme.accentColor = saved.accentColor || DEFAULT_COLORS.accentColor;
      theme.textColor = saved.textColor || DEFAULT_COLORS.textColor;
      theme.linkColor = saved.linkColor || DEFAULT_COLORS.linkColor;
      theme.backgroundColor = saved.backgroundColor || DEFAULT_COLORS.backgroundColor;
      theme.frameColor = saved.frameColor || DEFAULT_COLORS.frameColor;
      theme.highlightingColor = saved.highlightingColor || DEFAULT_COLORS.highlightingColor;
      theme.fontFamily = saved.fontFamily || DEFAULT_COLORS.fontFamily;
      theme.buttonTextPrimary = saved.buttonTextPrimary || DEFAULT_COLORS.buttonTextPrimary;
      theme.buttonTextSecondary = saved.buttonTextSecondary || DEFAULT_COLORS.buttonTextSecondary;
      theme.headerBackground = saved.headerBackground || DEFAULT_COLORS.headerBackground;
      theme.footerBackground = saved.footerBackground || DEFAULT_COLORS.footerBackground;
      theme.headerAlignment = saved.headerAlignment || HEADER_ALIGNMENTS.LEFT;
      theme.headerText = saved.headerText || DEFAULT_COLORS.headerText;
      theme.footerText = saved.footerText || DEFAULT_COLORS.footerText;
      theme.applicationFooterText = saved.applicationFooterText || DEFAULT_BRANDING_TEXT.FOOTER;
      theme.applicationFooterTextSize = saved.applicationFooterTextSize || 20;
      theme.appHeaderPadding = saved.appHeaderPadding || 8;
      theme.appFooterPadding = saved.appFooterPadding || 16;
      theme.appLogoMaxWidth = saved.appLogoMaxWidth || 300;
      theme.appLogoMaxHeight = saved.appLogoMaxHeight || 100;
      TRUTHY_SAVED_KEYS.forEach((key) => {
        if (saved[key]) theme[key] = saved[key];
      });
      if (saved.aiUseCustomIcon) theme.aiUseCustomIcon = saved.aiUseCustomIcon !== false;
      if (saved.tabTitle !== undefined) theme.tabTitle = saved.tabTitle;
      DEFINED_SAVED_KEYS.forEach((key) => {
        if (saved[key] !== undefined) theme[key] = saved[key];
      });
    },
  },
});

export const { setBrandingValue, loadSavedBranding } = brandingSlice.actions;

export default brandingSlice;
