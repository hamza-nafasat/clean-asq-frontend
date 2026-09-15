import { LoaderIcon } from "lucide-react";
import useBrandingColorCapture from "../hooks/useBrandingColorCapture";
import Button from "@/components/shared/Button";

const BrandingColorInput = ({ label = "", color, setColor, setImage, image, hideLabel = false, className = "" }) => {
  const { colorPickerRef, ssLoading, showSSButton, setShowSSButton, setColorPicker, captureColors } =
    useBrandingColorCapture({ image, setImage, setColor });

  return (
    <div className="relative flex flex-col">
      {!hideLabel && (
        <label
          htmlFor={label.toLowerCase().replace(/\s/g, "-") + "-color"}
          className="mb-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div ref={colorPickerRef} className={`flex items-stretch space-x-2 ${className ? className : ""}`}>
        <input
          type="color"
          className="size-14 cursor-pointer appearance-none rounded-lg border-none outline-none focus:ring-0"
          value={color}
          onFocus={() => setShowSSButton(true)}
          onChange={(e) => {
            setColorPicker(e.target.value);
            setColor?.(e.target.value);
          }}
        />
        {showSSButton && (
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
        )}
        <div className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
          {color}
        </div>
      </div>
    </div>
  );
};

export default BrandingColorInput;
