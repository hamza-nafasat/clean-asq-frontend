import { useEffect, useRef, useState } from "react";
import { captureBrandingScreenshot } from "../utils/branding.screenshot.utils";

// screenshot state for colour inputs
const useBrandingColorCapture = ({ image, setImage, setColor }) => {
  const colorPickerRef = useRef(null);
  const [ssLoading, setSSLoading] = useState(false);
  const [showSSButton, setShowSSButton] = useState(false);
  const [colorPicker, setColorPicker] = useState("");

  const captureColors = async () => {
    if (image) return;
    await captureBrandingScreenshot({
      e: { target: { value: colorPicker } },
      setSSLoading,
      setColorPicker,
      setImage,
      setShowSSButton,
      setColor,
    });
  };

  // hide the button when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) setShowSSButton(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return { colorPickerRef, ssLoading, showSSButton, setShowSSButton, setColorPicker, captureColors };
};

export default useBrandingColorCapture;
