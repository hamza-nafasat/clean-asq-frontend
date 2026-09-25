import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadSavedBranding } from "@/redux/slices/branding.slice";
import { STORAGE_KEYS } from "@/constants";
import { effectToBoxShadow, materialToGloss, parseEffectState } from "@/utils/effectPresets";
import { toFontVariable } from "@/utils/fontVariable";

const setDocumentFavicon = (href) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
};

const UNSAVED_KEYS = ["logo", "headerAlignment"];

const toSavedBranding = (theme) =>
  Object.fromEntries(Object.entries(theme).filter(([key]) => !UNSAVED_KEYS.includes(key)));

const applyBrandingToDocument = (theme) => {
  const root = document.documentElement.style;
  root.setProperty("--color-primary", theme.primaryColor);
  root.setProperty("--primary", theme.primaryColor);
  root.setProperty("--color-secondary", theme.secondaryColor);
  root.setProperty("--secondary", theme.secondaryColor);
  root.setProperty("--color-accent", theme.accentColor);
  root.setProperty("--accent", theme.accentColor);
  root.setProperty("--color-text", theme.textColor);
  root.setProperty("--textPrimary", theme.textColor);
  root.setProperty("--color-link", theme.linkColor);
  root.setProperty("--linkColor", theme.linkColor);
  const gradientStart = theme.backgroundColor?.match(/linear-gradient\([^,]+,\s*(#[0-9a-fA-F]{3,8})/);
  root.setProperty("--color-background", theme.backgroundColor);
  root.setProperty("--backgroundColor", theme.backgroundColor);
  root.setProperty("--backgroundColor-solid", gradientStart ? gradientStart[1] : theme.backgroundColor);
  root.setProperty("--color-frame", theme.frameColor);
  root.setProperty("--frameColor", theme.frameColor);
  root.setProperty("--color-highlighting", theme.highlightingColor);
  root.setProperty("--highlightingColor", theme.highlightingColor);
  root.setProperty("--color-button-text-primary", theme.buttonTextPrimary);
  root.setProperty("--color-button-text-secondary", theme.buttonTextSecondary);

  // header and footer material gloss
  const headerGloss = materialToGloss(theme.headerMaterial, parseEffectState(theme.headerEffect).angle);
  const footerGloss = materialToGloss(theme.footerMaterial, parseEffectState(theme.footerEffect).angle);
  root.setProperty(
    "--color-header",
    headerGloss ? `${headerGloss}, ${theme.headerBackground}` : theme.headerBackground || "#ffffff",
  );
  root.setProperty(
    "--color-footer",
    footerGloss ? `${footerGloss}, ${theme.footerBackground}` : theme.footerBackground || "#1f2937",
  );
  root.setProperty("--color-header-text", theme.headerText);
  root.setProperty("--color-footer-text", theme.footerText);
  root.setProperty("--font-primary", toFontVariable(theme.fontFamily));

  // effect shadows and the button gloss
  root.setProperty("--header-box-shadow", effectToBoxShadow(theme.headerEffect) || "none");
  root.setProperty("--footer-box-shadow", effectToBoxShadow(theme.footerEffect) || "none");
  root.setProperty("--button-box-shadow", effectToBoxShadow(theme.buttonEffect) || "none");
  const buttonGloss = materialToGloss(theme.buttonMaterial, parseEffectState(theme.buttonEffect).angle);
  root.setProperty("--button-material-overlay", buttonGloss || "none");

  if (theme.tabTitle) document.title = theme.tabTitle;
  if (theme.favicon) setDocumentFavicon(theme.favicon);
};

const useBrandingSync = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.branding.theme);

  // restore the saved branding once
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDING_DATA));
    if (!saved) return;
    dispatch(loadSavedBranding(saved));
    if (saved.favicon) setDocumentFavicon(saved.favicon);
    if (saved.tabTitle) document.title = saved.tabTitle;
  }, [dispatch]);

  // persist and apply every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANDING_DATA, JSON.stringify(toSavedBranding(theme)));
    applyBrandingToDocument(theme);
  }, [theme]);
};

export default useBrandingSync;
