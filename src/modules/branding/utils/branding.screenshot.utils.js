import { captureElementToCanvas } from "@/lib/screenshot";
import { BRANDING_SCREENSHOT_ELEMENT_ID, BRANDING_STORAGE_KEYS } from "./branding.constants";

// screenshot branding source area
export const captureBrandingScreenshot = async ({
  e,
  setSSLoading,
  setColorPicker,
  colorPicker,
  setImage,
  setShowSSButton,
  setColor,
}) => {
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
      const canvas = await captureElementToCanvas(element, { useCORS: true, scale: 2, backgroundColor: null });
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
