import { MdColorize } from "react-icons/md";
import Button from "@/components/shared/Button";
import { BRANDING_COLOR_MODES, BRANDING_CUSTOM_SWATCH_INDEX, BRANDING_SLIDER_ENDS } from "../utils/branding.constants";
import { isValidHex } from "../utils/branding.utils2";

const BrandingColorAdjustPanel = ({
  activeIndex = 0,
  activeMode = BRANDING_COLOR_MODES.SLIDER,
  activeColor = "#000000",
  sliderValue = 50,
  customColor = "#000000",
  hexInputValue = "",
  onSwitchMode,
  onSliderChange,
  onPickerChange,
  onHexInput,
  onHexReset,
  onApply,
  onCancel,
}) => {
  const isCustomSwatch = activeIndex === BRANDING_CUSTOM_SWATCH_INDEX;
  const eyedropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  const handleEyedropper = async () => {
    try {
      const { sRGBHex } = await new EyeDropper().open();
      onPickerChange?.(sRGBHex);
    } catch {
      // user cancelled
    }
  };

  // normalise the typed hex on blur
  const handleHexBlur = () => {
    const normalised = hexInputValue.startsWith("#") ? hexInputValue : `#${hexInputValue}`;
    if (isValidHex(normalised)) onPickerChange?.(normalised);
    else onHexReset?.();
  };

  return (
    <div className="mt-4 rounded-xl border p-5">
      <div className="mb-4 flex gap-1 rounded-lg p-1 w-fit">
        {!isCustomSwatch && (
          <Button
            variant={activeMode === BRANDING_COLOR_MODES.SLIDER ? "primary" : "secondary"}
            label={"Slider"}
            type="button"
            onClick={() => onSwitchMode?.(BRANDING_COLOR_MODES.SLIDER)}
          />
        )}
        <Button
          variant={activeMode === BRANDING_COLOR_MODES.CUSTOM ? "primary" : "secondary"}
          label={"Custom"}
          type="button"
          onClick={() => onSwitchMode?.(BRANDING_COLOR_MODES.CUSTOM)}
        />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 shrink-0 rounded-lg border border-gray-300 shadow-inner"
          style={{ backgroundColor: activeColor }}
        />

        {activeMode === BRANDING_COLOR_MODES.SLIDER && !isCustomSwatch && (
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>{BRANDING_SLIDER_ENDS[activeIndex]?.[0]}</span>
              <span>{BRANDING_SLIDER_ENDS[activeIndex]?.[1]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValue}
              aria-label="Colour slider"
              onChange={(e) => onSliderChange?.(e.target.value)}
              className="w-full cursor-pointer accent-gray-600"
            />
            <p className="mt-1 text-center font-mono text-xs text-gray-500">{activeColor}</p>
          </div>
        )}

        {(activeMode === BRANDING_COLOR_MODES.CUSTOM || isCustomSwatch) && (
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => onPickerChange?.(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-gray-300 p-0.5"
                title="Open color picker"
              />
              <input
                type="text"
                value={hexInputValue}
                aria-label="Hex colour"
                onChange={(e) => onHexInput?.(e.target.value)}
                onBlur={handleHexBlur}
                placeholder="#000000"
                maxLength={7}
                className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {eyedropperSupported && (
                <button
                  type="button"
                  onClick={handleEyedropper}
                  title="Pick color from screen"
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <MdColorize className="h-4 w-4" />
                  Dropper
                </button>
              )}
            </div>
            <p className="font-mono text-xs text-gray-400">{customColor}</p>
          </div>
        )}

        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => onApply?.()}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingColorAdjustPanel;
