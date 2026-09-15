import html2canvas from "html2canvas-pro";
import { BRANDING_SCREENSHOT_ELEMENT_ID, BRANDING_STORAGE_KEYS } from "./branding.constants";

// shift each rgb channel by a percentage
const adjustColorLightness = (hex, percent) => {
  if (!hex) return hex;
  const num = parseInt(hex.replace("#", ""), 16);
  const shift = Math.round(255 * (percent / 100));
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const r = clamp((num >> 16) + shift);
  const g = clamp(((num >> 8) & 0x00ff) + shift);
  const b = clamp((num & 0x0000ff) + shift);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const setCssVariable = (name, value) => document.documentElement.style.setProperty(name, value, "important");

export const applyBrandingToCSS = (brandingColors) => {
  if (!brandingColors) return;

  const { primary, secondary, accent, link, text, background, frame } = brandingColors;

  if (primary) {
    setCssVariable("--primary", primary);
    setCssVariable("--color-primary", primary);
  }

  if (secondary) {
    setCssVariable("--secondary", secondary);
    setCssVariable("--color-secondary", secondary);
    setCssVariable("--buttonSecondary", secondary);
  }

  if (accent) {
    setCssVariable("--accent", accent);
    setCssVariable("--color-accent", accent);
  }

  if (text) {
    setCssVariable("--textPrimary", text);
    setCssVariable("--color-text", text);
    setCssVariable("--textSecondary", adjustColorLightness(text, -10));
    setCssVariable("--textLight", adjustColorLightness(text, 30));
  }

  if (link) {
    setCssVariable("--linkColor", link);
    setCssVariable("--color-link", link);
  }

  if (background) {
    setCssVariable("--backgroundColor", background);
    setCssVariable("--color-background", background);
  }

  if (frame) {
    setCssVariable("--frameColor", frame);
    setCssVariable("--color-frame", frame);
  }
};

export const resetToDefaultBranding = () => {
  const defaultColors = {
    primary: "#066969",
    secondary: "#21ccb0",
    accent: "#72ffe7",
    text: "#1b1b1b",
    link: "#1025e3",
    background: "#f9f9f9",
    frame: "#db1313",
  };

  applyBrandingToCSS(defaultColors);

  setCssVariable("--textSecondary", "#3b3b3b");
  setCssVariable("--textLight", "#636363");
  setCssVariable("--buttonSecondary", "#a7a7a7");
};

// clipboard api first, then the execCommand fallback
export const copyTextToClipboard = (text) => {
  const attemptCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  };
  return navigator.clipboard?.writeText
    ? navigator.clipboard
        .writeText(text)
        .then(() => true)
        .catch(() => attemptCopy())
    : Promise.resolve(attemptCopy());
};

export const getBrandingPriority =(userBranding, formBranding) => formBranding || userBranding || null;

// capture the branding source area as an image after a colour change
export const handleChange = async ({ e, setSSLoading, setColorPicker, colorPicker, setImage, setShowSSButton, setColor }) => {
  setSSLoading(true);
  setColorPicker(e.target.value);

  setTimeout(async () => {
    const element = document.getElementById(BRANDING_SCREENSHOT_ELEMENT_ID);
    if (!element) {
      setSSLoading(false);
      return;
    }

    const previousFilter = element.style.filter;
    element.style.filter = "none";
    element.style.colorScheme = "light";
    try {
      const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: null });
      const imageData = canvas.toDataURL("image/png");
      const fileName = `screenshot-${Date.now()}.png`;
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "image/png" });
      const link = document.createElement("a");
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      try {
        localStorage.setItem(BRANDING_STORAGE_KEYS.LAST_SCREENSHOT, fileName);
      } catch {
        // storage unavailable
      }
      setImage(file);
    } catch {
      // screenshot capture failed
    } finally {
      element.style.filter = previousFilter;
      if (colorPicker) setColor(colorPicker);
      setShowSSButton(false);
      setSSLoading(false);
    }
  }, 1000);
};
