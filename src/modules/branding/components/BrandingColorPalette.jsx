import { BiColor } from "react-icons/bi";
import { IoColorPaletteOutline } from "react-icons/io5";
import useBranding from "@/hooks/useBranding";
import Button from "@/components/shared/Button";
import useBrandingColorSwatches from "../hooks/useBrandingColorSwatches";
import BrandingColorAdjustPanel from "./BrandingColorAdjustPanel";
import BrandingFieldError from "./BrandingFieldError";
import { BRANDING_COLOR_LABELS } from "../utils/branding.data";

const NO_COLORS = [];
const SWATCH_GRID_CLASS = "mt-6 grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-8 xl:grid-cols-10 xl:gap-10";

const PaletteSwatch = ({ color, onSelect }) => {
  const hex = typeof color === "string" ? color : color?.hex;
  const source = typeof color === "object" && color?.source ? color?.source : null;
  return (
    <button
      type="button"
      aria-label={`Use ${hex} as primary color`}
      onClick={() => onSelect(hex)}
      className="group relative flex w-full cursor-pointer flex-col items-center gap-2"
    >
      <span className="border-swatchBorder block h-24 w-full rounded-md border shadow-sm" style={{ backgroundColor: hex }}>
        {source && (
          <span className="absolute bottom-8 left-1/2 z-10 hidden w-max max-w-40 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-center text-xs text-white shadow group-hover:block">
            {source}
          </span>
        )}
      </span>
      <span className="text-sm font-medium text-gray-600">{hex}</span>
    </button>
  );
};

const BrandingColorPalette = ({ colorPalette = NO_COLORS, suggestedColors = NO_COLORS, error = "" }) => {
  const { setPrimaryColor } = useBranding();
  const swatches = useBrandingColorSwatches({ suggestedColors, onApply: setPrimaryColor });
  const { activeIndex } = swatches;

  return (
    <div className="mt-6 w-full">
      <h3 className="mb-4 flex items-center gap-1.5 text-[16px] font-medium text-gray-700 md:gap-3 md:text-xl">
        <IoColorPaletteOutline className="text-primary size-6" />
        Website / Image Color Palette
      </h3>

      <div className={SWATCH_GRID_CLASS}>
        {colorPalette?.map((color, index) => (
          <PaletteSwatch key={index} color={color} onSelect={setPrimaryColor} />
        ))}
      </div>
      <BrandingFieldError message={error} />

      <hr className="border-primary my-6 border-t-2" />

      <h3 className="mt-6 flex items-center gap-1.5 text-lg font-normal text-gray-500 md:gap-3">
        <BiColor className="text-primary size-6" />
        Custom Color Options
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        Click any swatch to open it. Use the <strong>Slider</strong> to stay within the color family, or switch to{" "}
        <strong>Custom</strong> for a free color picker with hex input and eyedropper.
      </p>

      <div className={SWATCH_GRID_CLASS}>
        {BRANDING_COLOR_LABELS.map((label, index) => {
          const color = swatches.getSliderColor(index);
          const isActive = activeIndex === index;
          return (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <Button
                type="button"
                title="Click to adjust or apply"
                aria-label={`Adjust ${label}`}
                onClick={() => swatches.openPanel(index)}
                className={`h-24 w-full rounded-md border shadow-sm transition-transform hover:scale-105 focus:outline-none ${
                  isActive ? "border-blue-400 ring-2 ring-blue-400" : "border-swatchBorder"
                }`}
                style={{ backgroundColor: color }}
              />
              {swatches.getPickedColor(index) ? (
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
          activeMode={swatches.activeMode}
          activeColor={swatches.pendingColor}
          sliderValue={swatches.getSliderValue(activeIndex)}
          customColor={swatches.getCustomColor(activeIndex)}
          hexInputValue={swatches.hexInputValue}
          onSwitchMode={swatches.switchMode}
          onSliderChange={swatches.handleSliderChange}
          onPickerChange={swatches.handlePickerChange}
          onHexInput={swatches.handleHexInput}
          onHexReset={swatches.resetHexInput}
          onApply={swatches.handleApply}
          onCancel={swatches.closePanel}
        />
      )}

      <hr className="border-primary my-6 border-t-2" />
    </div>
  );
};

export default BrandingColorPalette;
