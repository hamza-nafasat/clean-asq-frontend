import { createSlice } from "@reduxjs/toolkit";

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
  headerAlignment: "left",
  headerText: DEFAULT_COLORS.headerText,
  footerText: DEFAULT_COLORS.footerText,
  applicationFooterText: "Fintainium All rights reserved",
  applicationFooterTextSize: 20,
  appHeaderPadding: 8,
  appFooterPadding: 16,
  appLogoMaxWidth: 300,
  appLogoMaxHeight: 100,
  aiVoice: "nova",
  aiCustomPrompt: "",
  aiLaunchButtonColor: "",
  aiHeaderColor: "",
  aiBannerColor: "",
  aiBannerTextColor: "",
  aiUseCustomIcon: true,
  aiSliderColor: "",
  privacyPolicyUrl: "https://fintainium.com/pp/",
  termsOfServiceUrl: "https://fintainium.com/t&c/",
  favicon: "",
  tabTitle: "Online-application",
  headerEffect: "none",
  footerEffect: "none",
  emailHeaderEffect: "none",
  emailFooterEffect: "none",
  buttonEffect: "none",
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
  companyName: null,
  theme: DEFAULT_BRANDING_THEME,
};

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    setCompanyName: (state, action) => {
      state.companyName = action.payload;
    },
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
      theme.headerAlignment = saved.headerAlignment || "left";
      theme.headerText = saved.headerText || DEFAULT_COLORS.headerText;
      theme.footerText = saved.footerText || DEFAULT_COLORS.footerText;
      theme.applicationFooterText = saved.applicationFooterText || " ©{year} Fintainium, All Rights Reserved";
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

export const { setCompanyName, setBrandingValue, loadSavedBranding } = brandingSlice.actions;

export default brandingSlice;
