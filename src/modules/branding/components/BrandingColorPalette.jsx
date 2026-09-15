import { useEffect, useState } from "react";
import { BiColor } from "react-icons/bi";
import { IoColorPaletteOutline } from "react-icons/io5";
import useBranding from "@/hooks/useBranding";
import Button from "@/components/shared/Button";
import BrandingColorAdjustPanel from "./BrandingColorAdjustPanel";
import {
  BRANDING_COLOR_LABELS,
  BRANDING_COLOR_MODES,
  BRANDING_CUSTOM_SWATCH_INDEX,
  BRANDING_DEFAULT_SLIDERS,
} from "../utils/branding.constants";
import { computeSliderColor, isValidHex, randomHex } from "../utils/branding.utils2";

const ColorPalette = ({ colorPalette = [], suggestedColors = [] }) => {
  const { setPrimaryColor } = useBranding();
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeMode, setActiveMode] = useState(BRANDING_COLOR_MODES.SLIDER);
  const [sliderValues, setSliderValues] = useState({ ...BRANDING_DEFAULT_SLIDERS });
  const [customPickerColors, setCustomPickerColors] = useState({});
  const [hexInputValue, setHexInputValue] = useState("");
  const [randomBase] = useState(randomHex);
  // the colour shown in the open panel, applied as is
  const [pendingColor, setPendingColor] = useState("#000000");

  // suggested colours replace the swatch at the same index
  useEffect(() => {
    if (!suggestedColors?.length) return;
    const updates = {};
    suggestedColors.slice(0, 10).forEach((item, i) => {
      if (item?.hex) updates[i] = item.hex;
    });
    if (Object.keys(updates).length) setCustomPickerColors((prev) => ({ ...prev, ...updates }));
  }, [suggestedColors]);

  const getSliderValue = (index) => sliderValues[index] ?? BRANDING_DEFAULT_SLIDERS[index] ?? 50;
  const getFormulaColor = (index) => computeSliderColor(index, getSliderValue(index), randomBase);
  const getSliderColor = (index) => customPickerColors[index] || getFormulaColor(index);
  const getCustomColor = (index) =>
    customPickerColors[index] ?? (index === BRANDING_CUSTOM_SWATCH_INDEX ? randomBase : getFormulaColor(index));

  const openPanel = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
      return;
    }
    const defaultMode = index === BRANDING_CUSTOM_SWATCH_INDEX ? BRANDING_COLOR_MODES.CUSTOM : BRANDING_COLOR_MODES.SLIDER;
    const initialColor = customPickerColors[index] ?? getFormulaColor(index);
    setActiveIndex(index);
    setActiveMode(defaultMode);
    setPendingColor(defaultMode === BRANDING_COLOR_MODES.CUSTOM ? initialColor : getSliderColor(index));
    setCustomPickerColors((prev) => ({ ...prev, [index]: initialColor }));
    setHexInputValue(initialColor);
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    if (mode === BRANDING_COLOR_MODES.CUSTOM) {
      const current = customPickerColors[activeIndex] ?? getSliderColor(activeIndex);
      setPendingColor(current);
      setHexInputValue(current);
    } else {
      setPendingColor(getSliderColor(activeIndex));
    }
  };

  const handleSliderChange = (value) => {
    setSliderValues((prev) => ({ ...prev, [activeIndex]: Number(value) }));
    // the slider takes over from any custom colour
    setCustomPickerColors((prev) => {
      const next = { ...prev };
      delete next[activeIndex];
      return next;
    });
    setPendingColor(computeSliderColor(activeIndex, Number(value), randomBase));
  };

  const handlePickerChange = (value) => {
    setCustomPickerColors((prev) => ({ ...prev, [activeIndex]: value }));
    setHexInputValue(value);
    setPendingColor(value);
  };

  const handleHexInput = (raw) => {
    setHexInputValue(raw);
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (isValidHex(normalized)) {
      setCustomPickerColors((prev) => ({ ...prev, [activeIndex]: normalized }));
      setPendingColor(normalized);
    }
  };

  const handleApply = () => {
    setPrimaryColor(pendingColor);
    setActiveIndex(null);
  };

  return (
    <div className="mt-6 w-full">
      {/* Website palette */}
      <div className="mb-4 flex items-center gap-1.5 text-[16px] font-medium text-gray-700 md:gap-3 md:text-xl">
        <IoColorPaletteOutline className="text-primary size-6" />
        Website / Image Color Palette
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
        {colorPalette?.map((color, index) => {
          const hex = typeof color === "string" ? color : color?.hex;
          const source = typeof color === "object" && color?.source ? color?.source : null;
          return (
            <div
              key={index}
              className="group relative flex w-full cursor-pointer flex-col items-center gap-2"
              onClick={() => setPrimaryColor(hex)}
            >
              <div className="h-24 w-full rounded-md border shadow-sm" style={{ backgroundColor: hex, borderColor: "#e0e0e0" }}>
                {source && (
                  <div className="absolute bottom-8 left-1/2 z-10 hidden w-max max-w-40 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-center text-xs text-white shadow group-hover:block">
                    {source}
                  </div>
                )}
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: parseInt(hex?.substring(1), 16) > 0xffffff / 2 ? "#000" : "#555" }}
              >
                {hex}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-primary my-6 border-t-2" />

      {/* Custom colours */}
      <div className="mt-6 flex items-center gap-1.5 text-lg font-normal text-gray-500 md:gap-3">
        <BiColor className="text-primary size-6" />
        Custom Color Options
      </div>
      <p className="mt-1 text-sm text-gray-400">
        Click any swatch to open it. Use the <strong>Slider</strong> to stay within the color family, or switch to{" "}
        <strong>Custom</strong> for a free color picker with hex input and eyedropper.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10">
        {BRANDING_COLOR_LABELS.map((label, index) => {
          const color = getSliderColor(index);
          const isActive = activeIndex === index;
          return (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <Button
                type="button"
                title="Click to adjust or apply"
                aria-label={`Adjust ${label}`}
                onClick={() => openPanel(index)}
                className={`h-24 w-full rounded-md border shadow-sm transition-transform hover:scale-105 focus:outline-none ${
                  isActive ? "ring-2 ring-blue-400" : ""
                }`}
                style={{ backgroundColor: color, borderColor: isActive ? "#60a5fa" : "#e0e0e0" }}
              />
              {customPickerColors[index] ? (
                <span className="font-mono text-sm font-medium text-gray-600">{color}</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-600">{label}</span>
                  {index > 1 && <span className="font-mono text-sm text-gray-400">{color}</span>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {activeIndex !== null && (
        <BrandingColorAdjustPanel
          activeIndex={activeIndex}
          activeMode={activeMode}
          activeColor={pendingColor}
          sliderValue={getSliderValue(activeIndex)}
          customColor={getCustomColor(activeIndex)}
          hexInputValue={hexInputValue}
          onSwitchMode={switchMode}
          onSliderChange={handleSliderChange}
          onPickerChange={handlePickerChange}
          onHexInput={handleHexInput}
          onHexReset={() => setHexInputValue(getCustomColor(activeIndex))}
          onApply={handleApply}
          onCancel={() => setActiveIndex(null)}
        />
      )}

      <div className="border-primary my-6 border-t-2" />

      <div className="mt-12 flex items-center space-x-6">
        <div className="flex items-center gap-3 text-gray-600">
          <BiColor className="text-primary size-6" />
          Assign Brand Element
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
