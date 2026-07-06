import html2canvas from "html2canvas-pro";

export const applyBrandingToCSS = (brandingColors) => {
  if (!brandingColors) return;

  const { primary, secondary, accent, link, text, background, frame } = brandingColors;

  console.log("🎨 Applying form branding:", brandingColors);

  // Apply Primary Color - Set base variable first, then Tailwind theme variable
  if (primary) {
    document.documentElement.style.setProperty("--primary", primary, "important");
    document.documentElement.style.setProperty("--color-primary", primary, "important");
    console.log("✅ Primary color applied:", primary);
  }

  // Apply Secondary Color - Set base variable first, then Tailwind theme variable
  if (secondary) {
    document.documentElement.style.setProperty("--secondary", secondary, "important");
    document.documentElement.style.setProperty("--color-secondary", secondary, "important");
    document.documentElement.style.setProperty("--buttonSecondary", secondary, "important");
    console.log("✅ Secondary color applied:", secondary);
  }

  // Apply Accent Color
  if (accent) {
    document.documentElement.style.setProperty("--accent", accent, "important");
    document.documentElement.style.setProperty("--color-accent", accent, "important");
  }

  // Apply Text Colors
  if (text) {
    document.documentElement.style.setProperty("--textPrimary", text, "important");
    document.documentElement.style.setProperty("--color-text", text, "important");
    // Also apply to secondary text colors with slight variation
    const textSecondary = adjustColorLightness(text, -10); // Slightly darker
    const textLight = adjustColorLightness(text, 30); // Lighter
    document.documentElement.style.setProperty("--textSecondary", textSecondary, "important");
    document.documentElement.style.setProperty("--textLight", textLight, "important");
  }

  // Apply Link Color
  if (link) {
    document.documentElement.style.setProperty("--linkColor", link, "important");
    document.documentElement.style.setProperty("--color-link", link, "important");
  }

  // Apply Background Color
  if (background) {
    document.documentElement.style.setProperty("--backgroundColor", background, "important");
    document.documentElement.style.setProperty("--color-background", background, "important");
  }

  // Apply Frame Color
  if (frame) {
    document.documentElement.style.setProperty("--frameColor", frame, "important");
    document.documentElement.style.setProperty("--color-frame", frame, "important");
  }
};

// Helper function to adjust color lightness
const adjustColorLightness = (hex, percent) => {
  if (!hex) return hex;

  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Convert to RGB
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) + Math.round(255 * (percent / 100));
  const g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  const b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  // Clamp values between 0 and 255
  const clampedR = Math.max(0, Math.min(255, r));
  const clampedG = Math.max(0, Math.min(255, g));
  const clampedB = Math.max(0, Math.min(255, b));

  // Convert back to hex
  return `#${((clampedR << 16) | (clampedG << 8) | clampedB).toString(16).padStart(6, "0")}`;
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

  console.log("🔄 Resetting to default branding");
  applyBrandingToCSS(defaultColors);

  // Reset additional CSS variables to defaults
  document.documentElement.style.setProperty("--textSecondary", "#3b3b3b", "important");
  document.documentElement.style.setProperty("--textLight", "#636363", "important");
  document.documentElement.style.setProperty("--buttonSecondary", "#a7a7a7", "important");
};

export const getBrandingPriority = (userBranding, formBranding) => {
  return formBranding || userBranding || null;
};

export const handleChange = async ({
  e,
  setSSLoading,
  setColorPicker,
  colorPicker,
  setImage,
  setShowSSButton,
  setColor,
}) => {
  setSSLoading(true);
  const newColor = e.target.value;
  setColorPicker(newColor);
  console.log(`[ColorInput] 🎨 Color changed to:`, newColor);

  setTimeout(async () => {
    const selector = "#screen-shot";
    console.log(`[ColorInput] 🔍 Trying to capture element:`, selector);
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`[ColorInput] ❌ Element not found`);
      setSSLoading(false);
      return;
    }

    const previousFilter = element.style.filter;
    element.style.filter = "none";
    element.style.colorScheme = "light";
    console.log(`[ColorInput] ✅ Element found. Starting html2canvas...`);
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      console.log(`[ColorInput] 📸 Screenshot captured successfully.`);
      const imageData = canvas.toDataURL("image/png");
      const fileName = `screenshot-${Date.now()}.png`;
      // ✅ Convert base64 → File
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "image/png" });
      // ✅ Optional: trigger download (kept original functionality)
      const link = document.createElement("a");
      // link.download = fileName;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`[ColorInput] ✅ Image downloaded successfully as "${fileName}".`);
      // ✅ Save only filename to localStorage
      try {
        localStorage.setItem("lastScreenshot", fileName);
        console.log(`[ColorInput] 💾 Stored only filename in localStorage.`);
      } catch (err) {
        console.error(`[ColorInput] ⚠️ Failed to save filename:`, err);
      }
      setImage(file); // ✅ Set actual File object
    } catch (error) {
      console.error(`[ColorInput] ❌ Error capturing screenshot:`, error);
    } finally {
      element.style.filter = previousFilter;
      if (colorPicker) setColor(colorPicker);
      console.log("done one done done");
      setShowSSButton(false);
      setSSLoading(false);
    }
  }, 1000);
};
