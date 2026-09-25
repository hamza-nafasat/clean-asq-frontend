import { useId, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import Button from "@/components/shared/Button";
import BrandingFieldError from "./BrandingFieldError";
import useBrandingColorCapture from "../hooks/useBrandingColorCapture";
import { parseGradient, toGradient } from "../utils/branding.color.utils";

const DEFAULT_SOLID = "#000000";
const DEFAULT_GRADIENT = { color1: "#3b82f6", color2: "#8b5cf6", angle: 135 };

const modeClass = (isActive) =>
  `rounded px-2 py-1 text-xs font-medium ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`;

const BrandingGradientInput = ({ label = "", value, onChange, hideLabel = false, image, setImage, setColor, error = "" }) => {
  const inputId = useId();
  const parsed = parseGradient(value);
  const isGradient = Boolean(parsed);
  // remember the other mode's colours
  const [lastSolid, setLastSolid] = useState(isGradient ? DEFAULT_SOLID : value || DEFAULT_SOLID);
  const [lastGradient, setLastGradient] = useState(parsed ?? DEFAULT_GRADIENT);
  const solidColor = isGradient ? lastSolid : value || DEFAULT_SOLID;
  const { color1, color2, angle } = parsed ?? lastGradient;
  const { colorPickerRef, ssLoading, showSSButton, setShowSSButton, captureColors } = useBrandingColorCapture({
    image,
    setImage,
    setColor,
  });

  const switchToSolid = () => {
    if (parsed) setLastGradient(parsed);
    onChange?.(solidColor);
  };

  const switchToGradient = () => {
    if (!isGradient) setLastSolid(solidColor);
    onChange?.(toGradient(angle, color1, color2));
  };

  return (
    <div className="flex flex-col">
      {!hideLabel && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="mb-2 flex gap-1">
        <button type="button" onClick={switchToSolid} className={modeClass(!isGradient)}>
          Solid
        </button>
        <button type="button" onClick={switchToGradient} className={modeClass(isGradient)}>
          Gradient
        </button>
      </div>
      {isGradient ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">Start</span>
              <input
                id={inputId}
                type="color"
                value={color1}
                onChange={(e) => onChange?.(toGradient(angle, e.target.value, color2))}
                className="size-10 cursor-pointer rounded border-none outline-none"
              />
            </label>
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">End</span>
              <input
                type="color"
                value={color2}
                onChange={(e) => onChange?.(toGradient(angle, color1, e.target.value))}
                className="size-10 cursor-pointer rounded border-none outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Angle °</span>
              <input
                type="number"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => onChange?.(toGradient(Number(e.target.value), color1, color2))}
                className="bg-fieldBackground h-10 w-16 rounded-lg border border-gray-300 px-2 text-sm outline-none"
              />
            </label>
          </div>

          <div className="h-6 w-full rounded-md border" style={{ background: toGradient(angle, color1, color2) }} />
        </div>
      ) : (
        <div ref={colorPickerRef} className="flex items-stretch space-x-2">
          <input
            id={inputId}
            type="color"
            value={solidColor}
            aria-label={hideLabel ? label : undefined}
            onFocus={() => setShowSSButton(true)}
            onChange={(e) => onChange?.(e.target.value)}
            className="size-14 cursor-pointer rounded-lg border-none outline-none focus:ring-0"
          />
          {showSSButton ? (
            <Button
              variant="primary"
              onClick={captureColors}
              label="Show Colors"
              disabled={ssLoading}
              cnRight="size-6 animate-spin"
              rightIcon={ssLoading ? CgSpinner : null}
            />
          ) : (
            <p className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
              {solidColor}
            </p>
          )}
        </div>
      )}
      <BrandingFieldError message={error} />
    </div>
  );
};

export default BrandingGradientInput;
