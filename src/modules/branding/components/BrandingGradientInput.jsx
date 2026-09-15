import { useEffect, useRef, useState } from "react";
import { LoaderIcon } from "lucide-react";
import useBrandingColorCapture from "../hooks/useBrandingColorCapture";
import Button from "@/components/shared/Button";
import { BRANDING_FILL_MODES } from "../utils/branding.constants";
import { parseGradient, toGradient } from "../utils/branding.utils2";

const modeClass = (isActive) =>
  `rounded px-2 py-1 text-xs font-medium ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`;

const BrandingGradientInput = ({ label = "", value, onChange, hideLabel = false, image, setImage, setColor }) => {
  const parsed = parseGradient(value);
  const [mode, setMode] = useState(parsed ? BRANDING_FILL_MODES.GRADIENT : BRANDING_FILL_MODES.SOLID);
  const [solidColor, setSolidColor] = useState(parsed ? "#000000" : value || "#000000");
  const [color1, setColor1] = useState(parsed?.color1 || "#3b82f6");
  const [color2, setColor2] = useState(parsed?.color2 || "#8b5cf6");
  const [angle, setAngle] = useState(parsed?.angle ?? 135);
  const { colorPickerRef, ssLoading, showSSButton, setShowSSButton, captureColors } = useBrandingColorCapture({
    image,
    setImage,
    setColor,
  });

  // follow value changes made outside this input
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    const p = parseGradient(value);
    if (p) {
      setMode(BRANDING_FILL_MODES.GRADIENT);
      setColor1(p.color1);
      setColor2(p.color2);
      setAngle(p.angle);
    } else if (value) {
      setMode(BRANDING_FILL_MODES.SOLID);
      setSolidColor(value);
    }
  }, [value]);

  const switchToSolid = () => {
    setMode(BRANDING_FILL_MODES.SOLID);
    onChange?.(solidColor);
  };

  const switchToGradient = () => {
    setMode(BRANDING_FILL_MODES.GRADIENT);
    onChange?.(toGradient(angle, color1, color2));
  };

  const handleSolid = (c) => {
    setSolidColor(c);
    onChange?.(c);
  };
  const handleC1 = (c) => {
    setColor1(c);
    onChange?.(toGradient(angle, c, color2));
  };
  const handleC2 = (c) => {
    setColor2(c);
    onChange?.(toGradient(angle, color1, c));
  };
  const handleAngle = (a) => {
    setAngle(a);
    onChange?.(toGradient(a, color1, color2));
  };

  return (
    <div className="flex flex-col">
      {!hideLabel && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <div className="mb-2 flex gap-1">
        <button type="button" onClick={switchToSolid} className={modeClass(mode === BRANDING_FILL_MODES.SOLID)}>
          Solid
        </button>
        <button type="button" onClick={switchToGradient} className={modeClass(mode === BRANDING_FILL_MODES.GRADIENT)}>
          Gradient
        </button>
      </div>
      {mode === BRANDING_FILL_MODES.SOLID ? (
        <div ref={colorPickerRef} className="flex items-stretch space-x-2">
          <input
            type="color"
            value={solidColor}
            aria-label={label}
            onFocus={() => setShowSSButton(true)}
            onChange={(e) => handleSolid(e.target.value)}
            className="size-14 cursor-pointer rounded-lg border-none outline-none focus:ring-0"
          />
          {showSSButton ? (
            <div className="flex">
              <Button
                variant="primary"
                onClick={captureColors}
                label={"Show Colors"}
                disabled={ssLoading}
                cnRight={"animate-spin"}
                rightIcon={ssLoading ? LoaderIcon : null}
              />
            </div>
          ) : (
            <div className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
              {solidColor}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">Start</span>
              <input
                type="color"
                value={color1}
                onChange={(e) => handleC1(e.target.value)}
                className="size-10 cursor-pointer rounded border-none outline-none"
              />
            </label>
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">End</span>
              <input
                type="color"
                value={color2}
                onChange={(e) => handleC2(e.target.value)}
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
                onChange={(e) => handleAngle(Number(e.target.value))}
                className="h-10 w-16 rounded-lg border border-gray-300 bg-[#FAFBFF] px-2 text-sm outline-none"
              />
            </label>
          </div>

          <div className="h-6 w-full rounded-md border" style={{ background: toGradient(angle, color1, color2) }} />
        </div>
      )}
    </div>
  );
};

export default BrandingGradientInput;
