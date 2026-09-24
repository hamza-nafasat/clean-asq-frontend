import { setBrandingValue } from "@/redux/slices/branding.slice";

const getUserBrandingTheme = (branding) => ({
  name: branding.name,
  primaryColor: branding.colors.primary,
  secondaryColor: branding.colors.secondary,
  accentColor: branding.colors.accent,
  textColor: branding.colors.text,
  linkColor: branding.colors.link,
  backgroundColor: branding.colors.background,
  frameColor: branding.colors.frame,
  fontFamily: branding.fontFamily,
  logo: branding.selectedLogo,
  buttonTextPrimary: branding.colors.buttonTextPrimary,
  buttonTextSecondary: branding.colors.buttonTextSecondary,
  headerBackground: branding.colors.headerBackground,
  footerBackground: branding.colors.footerBackground,
  headerAlignment: branding.headerAlignment,
  headerText: branding.colors.headerText,
  footerText: branding.colors.footerText,
  applicationFooterText: branding.applicationFooterText,
  appLogoMaxWidth: branding.appLogoMaxWidth,
  appLogoMaxHeight: branding.appLogoMaxHeight,
});

export const applyUserBranding = (branding, dispatch) => {
  if (!branding?.colors) return;
  Object.entries(getUserBrandingTheme(branding)).forEach(([key, value]) => dispatch(setBrandingValue({ key, value })));
};
