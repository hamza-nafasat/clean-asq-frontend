import React, { createContext, useState, useEffect, useContext } from "react";
import { effectToBoxShadow, materialToGloss, parseEffectState } from "@/lib/effectPresets";

const BrandingContext = createContext();

// Default application colors
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

export const BrandingProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primaryColor);
  const [logo, setLogo] = useState("");
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_COLORS.secondaryColor);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLORS.accentColor);
  const [textColor, setTextColor] = useState(DEFAULT_COLORS.textColor);
  const [linkColor, setLinkColor] = useState(DEFAULT_COLORS.linkColor);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.backgroundColor);
  const [frameColor, setFrameColor] = useState(DEFAULT_COLORS.frameColor);
  const [highlightingColor, setHighlightingColor] = useState(DEFAULT_COLORS.highlightingColor);
  const [fontFamily, setFontFamily] = useState(DEFAULT_COLORS.fontFamily);
  const [buttonTextPrimary, setButtonTextPrimary] = useState(DEFAULT_COLORS.buttonTextPrimary);
  const [buttonTextSecondary, setButtonTextSecondary] = useState(DEFAULT_COLORS.buttonTextSecondary);
  const [headerBackground, setHeaderBackground] = useState(DEFAULT_COLORS.headerBackgroundColor);
  const [footerBackground, setFooterBackground] = useState(DEFAULT_COLORS.footerBackgroundColor);
  const [headerAlignment, setHeaderAlignment] = useState("left");
  const [headerText, setHeaderText] = useState(DEFAULT_COLORS.headerText);
  const [footerText, setFooterText] = useState(DEFAULT_COLORS.footerText);
  const [appLogoMaxWidth, setAppLogoMaxWidth] = useState(300);
  const [appLogoMaxHeight, setAppLogoMaxHeight] = useState(100);
  const [applicationFooterText, setApplicationFooterText] = useState("Fintainium All rights reserved");
  const [applicationFooterTextSize, setApplicationFooterTextSize] = useState(20);
  const [appHeaderPadding, setAppHeaderPadding] = useState(8);
  const [appFooterPadding, setAppFooterPadding] = useState(16);
  const [aiVoice, setAiVoice] = useState("nova");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiLaunchButtonColor, setAiLaunchButtonColor] = useState("");
  const [aiHeaderColor, setAiHeaderColor] = useState("");
  const [aiBannerColor, setAiBannerColor] = useState("");
  const [aiBannerTextColor, setAiBannerTextColor] = useState("");
  const [aiUseCustomIcon, setAiUseCustomIcon] = useState(true);
  const [aiSliderColor, setAiSliderColor] = useState("");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [termsOfServiceUrl, setTermsOfServiceUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [tabTitle, setTabTitle] = useState("");
  const [headerEffect, setHeaderEffect] = useState("none");
  const [footerEffect, setFooterEffect] = useState("none");
  const [emailHeaderEffect, setEmailHeaderEffect] = useState("none");
  const [emailFooterEffect, setEmailFooterEffect] = useState("none");
  const [buttonEffect, setButtonEffect] = useState("none");
  const [headerMaterial, setHeaderMaterial] = useState(0);
  const [footerMaterial, setFooterMaterial] = useState(0);
  const [buttonMaterial, setButtonMaterial] = useState(0);
  const [emailHeaderMaterial, setEmailHeaderMaterial] = useState(0);
  const [emailFooterMaterial, setEmailFooterMaterial] = useState(0);
  // Load saved branding from localStorage on mount
  useEffect(() => {
    const savedBranding = JSON.parse(localStorage.getItem("brandingData"));
    if (savedBranding) {
      setName(savedBranding.name || "");
      setPrimaryColor(savedBranding.primaryColor || DEFAULT_COLORS.primaryColor);
      setSecondaryColor(savedBranding.secondaryColor || DEFAULT_COLORS.secondaryColor);
      setAccentColor(savedBranding.accentColor || DEFAULT_COLORS.accentColor);
      setTextColor(savedBranding.textColor || DEFAULT_COLORS.textColor);
      setLinkColor(savedBranding.linkColor || DEFAULT_COLORS.linkColor);
      setBackgroundColor(savedBranding.backgroundColor || DEFAULT_COLORS.backgroundColor);
      setFrameColor(savedBranding.frameColor || DEFAULT_COLORS.frameColor);
      setHighlightingColor(savedBranding.highlightingColor || DEFAULT_COLORS.highlightingColor);
      setFontFamily(savedBranding.fontFamily || DEFAULT_COLORS.fontFamily);
      setButtonTextPrimary(savedBranding.buttonTextPrimary || DEFAULT_COLORS.buttonTextPrimary);
      setButtonTextSecondary(savedBranding.buttonTextSecondary || DEFAULT_COLORS.buttonTextSecondary);
      setHeaderBackground(savedBranding.headerBackground || DEFAULT_COLORS.headerBackground);
      setFooterBackground(savedBranding.footerBackground || DEFAULT_COLORS.footerBackground);
      setHeaderAlignment(savedBranding.headerAlignment || "left");
      setHeaderText(savedBranding.headerText || DEFAULT_COLORS.headerText);
      setFooterText(savedBranding.footerText || DEFAULT_COLORS.footerText);
      setApplicationFooterText(savedBranding.applicationFooterText || " ©{year} Fintainium, All Rights Reserved");
      setApplicationFooterTextSize(savedBranding.applicationFooterTextSize || 20);
      setAppHeaderPadding(savedBranding.appHeaderPadding || 8);
      setAppFooterPadding(savedBranding.appFooterPadding || 16);
      setAppLogoMaxWidth(savedBranding.appLogoMaxWidth || 300);
      setAppLogoMaxHeight(savedBranding.appLogoMaxHeight || 100);
      if (savedBranding.aiVoice) setAiVoice(savedBranding.aiVoice);
      if (savedBranding.aiCustomPrompt !== undefined) setAiCustomPrompt(savedBranding.aiCustomPrompt);
      if (savedBranding.aiLaunchButtonColor) setAiLaunchButtonColor(savedBranding.aiLaunchButtonColor);
      if (savedBranding.aiHeaderColor) setAiHeaderColor(savedBranding.aiHeaderColor);
      if (savedBranding.aiBannerColor) setAiBannerColor(savedBranding.aiBannerColor);
      if (savedBranding.aiBannerTextColor) setAiBannerTextColor(savedBranding.aiBannerTextColor);
      if (savedBranding.aiUseCustomIcon !== undefined) setAiUseCustomIcon(savedBranding.aiUseCustomIcon !== false);
      if (savedBranding.aiSliderColor) setAiSliderColor(savedBranding.aiSliderColor);
      if (savedBranding.privacyPolicyUrl !== undefined) setPrivacyPolicyUrl(savedBranding.privacyPolicyUrl);
      if (savedBranding.termsOfServiceUrl !== undefined) setTermsOfServiceUrl(savedBranding.termsOfServiceUrl);
      if (savedBranding.favicon !== undefined) {
        setFavicon(savedBranding.favicon);
        // Apply immediately to avoid flash — don't wait for the CSS-variables effect
        if (savedBranding.favicon) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = savedBranding.favicon;
        }
      }
      if (savedBranding.tabTitle !== undefined) {
        setTabTitle(savedBranding.tabTitle);
        if (savedBranding.tabTitle) document.title = savedBranding.tabTitle;
      }
      if (savedBranding.headerEffect) setHeaderEffect(savedBranding.headerEffect);
      if (savedBranding.footerEffect) setFooterEffect(savedBranding.footerEffect);
      if (savedBranding.emailHeaderEffect) setEmailHeaderEffect(savedBranding.emailHeaderEffect);
      if (savedBranding.emailFooterEffect) setEmailFooterEffect(savedBranding.emailFooterEffect);
      if (savedBranding.buttonEffect) setButtonEffect(savedBranding.buttonEffect);
      if (savedBranding.headerMaterial !== undefined) setHeaderMaterial(savedBranding.headerMaterial);
      if (savedBranding.footerMaterial !== undefined) setFooterMaterial(savedBranding.footerMaterial);
      if (savedBranding.buttonMaterial !== undefined) setButtonMaterial(savedBranding.buttonMaterial);
      if (savedBranding.emailHeaderMaterial !== undefined) setEmailHeaderMaterial(savedBranding.emailHeaderMaterial);
      if (savedBranding.emailFooterMaterial !== undefined) setEmailFooterMaterial(savedBranding.emailFooterMaterial);
    }
  }, []);

  // Save branding to localStorage whenever it changes
  useEffect(() => {
    const brandingData = {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      linkColor,
      backgroundColor,
      frameColor,
      highlightingColor,
      fontFamily,
      buttonTextPrimary,
      buttonTextSecondary,
      name,
      headerBackground,
      footerBackground,
      headerText,
      footerText,
      applicationFooterText,
      applicationFooterTextSize,
      appHeaderPadding,
      appFooterPadding,
      appLogoMaxWidth,
      appLogoMaxHeight,
      aiVoice,
      aiCustomPrompt,
      aiLaunchButtonColor,
      aiHeaderColor,
      aiBannerColor,
      aiBannerTextColor,
      aiUseCustomIcon,
      aiSliderColor,
      privacyPolicyUrl,
      termsOfServiceUrl,
      favicon,
      tabTitle,
      headerEffect,
      footerEffect,
      emailHeaderEffect,
      emailFooterEffect,
      buttonEffect,
      headerMaterial,
      footerMaterial,
      buttonMaterial,
      emailHeaderMaterial,
      emailFooterMaterial,
    };
    localStorage.setItem("brandingData", JSON.stringify(brandingData));

    // Apply CSS variables to the document root
    document.documentElement.style.setProperty("--color-primary", primaryColor);
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.documentElement.style.setProperty("--color-secondary", secondaryColor);
    document.documentElement.style.setProperty("--secondary", secondaryColor);
    document.documentElement.style.setProperty("--color-accent", accentColor);
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty("--color-text", textColor);
    document.documentElement.style.setProperty("--textPrimary", textColor);
    document.documentElement.style.setProperty("--color-link", linkColor);
    document.documentElement.style.setProperty("--linkColor", linkColor);
    const backgroundSolid = (() => {
      const m = backgroundColor?.match(/linear-gradient\([^,]+,\s*(#[0-9a-fA-F]{3,8})/);
      return m ? m[1] : backgroundColor;
    })();
    document.documentElement.style.setProperty("--color-background", backgroundColor);
    document.documentElement.style.setProperty("--backgroundColor", backgroundColor);
    document.documentElement.style.setProperty("--backgroundColor-solid", backgroundSolid);
    document.documentElement.style.setProperty("--color-frame", frameColor);
    document.documentElement.style.setProperty("--frameColor", frameColor);
    document.documentElement.style.setProperty("--color-highlighting", highlightingColor);
    document.documentElement.style.setProperty("--highlightingColor", highlightingColor);
    document.documentElement.style.setProperty("--color-button-text-primary", buttonTextPrimary);
    document.documentElement.style.setProperty("--color-button-text-secondary", buttonTextSecondary);
    const headerAngle = parseEffectState(headerEffect).angle;
    const footerAngle = parseEffectState(footerEffect).angle;
    const headerGloss = materialToGloss(headerMaterial, headerAngle);
    const footerGloss = materialToGloss(footerMaterial, footerAngle);
    document.documentElement.style.setProperty(
      "--color-header",
      headerGloss ? `${headerGloss}, ${headerBackground}` : headerBackground || "#ffffff",
    );
    document.documentElement.style.setProperty(
      "--color-footer",
      footerGloss ? `${footerGloss}, ${footerBackground}` : footerBackground || "#1f2937",
    );
    document.documentElement.style.setProperty("--color-header-text", headerText);
    document.documentElement.style.setProperty("--color-footer-text", footerText);

    // Apply font family globally using CSS variables
    document.documentElement.style.setProperty("--font-primary", `var(--font-${fontFamily?.toLowerCase()})`);

    // Apply effect box-shadows as CSS variables
    document.documentElement.style.setProperty("--header-box-shadow", effectToBoxShadow(headerEffect) || "none");
    document.documentElement.style.setProperty("--footer-box-shadow", effectToBoxShadow(footerEffect) || "none");
    document.documentElement.style.setProperty("--button-box-shadow", effectToBoxShadow(buttonEffect) || "none");

    // Apply button material gloss overlay
    const buttonAngle = parseEffectState(buttonEffect).angle;
    const buttonGloss = materialToGloss(buttonMaterial, buttonAngle);
    document.documentElement.style.setProperty("--button-material-overlay", buttonGloss || "none");

    // Apply favicon and tab title if set
    if (tabTitle) document.title = tabTitle;
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [
    name,
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    linkColor,
    backgroundColor,
    frameColor,
    highlightingColor,
    fontFamily,
    buttonTextPrimary,
    buttonTextSecondary,
    headerBackground,
    footerBackground,
    headerText,
    footerText,
    applicationFooterText,
    applicationFooterTextSize,
    appHeaderPadding,
    appFooterPadding,
    appLogoMaxWidth,
    appLogoMaxHeight,
    aiVoice,
    aiCustomPrompt,
    aiLaunchButtonColor,
    aiHeaderColor,
    aiBannerColor,
    aiBannerTextColor,
    aiUseCustomIcon,
    aiSliderColor,
    privacyPolicyUrl,
    termsOfServiceUrl,
    favicon,
    tabTitle,
    headerEffect,
    footerEffect,
    emailHeaderEffect,
    emailFooterEffect,
    buttonEffect,
    headerMaterial,
    footerMaterial,
    buttonMaterial,
    emailHeaderMaterial,
    emailFooterMaterial,
  ]);

  const value = {
    name,
    setName,
    logo,
    setLogo,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    accentColor,
    setAccentColor,
    textColor,
    setTextColor,
    linkColor,
    setLinkColor,
    backgroundColor,
    setBackgroundColor,
    frameColor,
    setFrameColor,
    highlightingColor,
    setHighlightingColor,
    fontFamily,
    setFontFamily,
    buttonTextPrimary,
    setButtonTextPrimary,
    buttonTextSecondary,
    setButtonTextSecondary,
    headerBackground,
    setHeaderBackground,
    footerBackground,
    setFooterBackground,
    headerAlignment,
    setHeaderAlignment,
    headerText,
    setHeaderText,
    footerText,
    setFooterText,
    applicationFooterText,
    setApplicationFooterText,
    applicationFooterTextSize,
    setApplicationFooterTextSize,
    appHeaderPadding,
    setAppHeaderPadding,
    appFooterPadding,
    setAppFooterPadding,
    appLogoMaxWidth,
    setAppLogoMaxWidth,
    appLogoMaxHeight,
    setAppLogoMaxHeight,
    aiVoice,
    setAiVoice,
    aiCustomPrompt,
    setAiCustomPrompt,
    aiLaunchButtonColor,
    setAiLaunchButtonColor,
    aiHeaderColor,
    setAiHeaderColor,
    aiBannerColor,
    setAiBannerColor,
    aiBannerTextColor,
    setAiBannerTextColor,
    aiUseCustomIcon,
    setAiUseCustomIcon,
    aiSliderColor,
    setAiSliderColor,
    privacyPolicyUrl,
    setPrivacyPolicyUrl,
    termsOfServiceUrl,
    setTermsOfServiceUrl,
    favicon,
    setFavicon,
    tabTitle,
    setTabTitle,
    headerEffect,
    setHeaderEffect,
    footerEffect,
    setFooterEffect,
    emailHeaderEffect,
    setEmailHeaderEffect,
    emailFooterEffect,
    setEmailFooterEffect,
    buttonEffect,
    setButtonEffect,
    headerMaterial,
    setHeaderMaterial,
    footerMaterial,
    setFooterMaterial,
    buttonMaterial,
    setButtonMaterial,
    emailHeaderMaterial,
    setEmailHeaderMaterial,
    emailFooterMaterial,
    setEmailFooterMaterial,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

const useBranding = () => useContext(BrandingContext);

// eslint-disable-next-line react-refresh/only-export-components
export { useBranding };
