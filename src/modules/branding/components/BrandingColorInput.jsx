import { useId } from "react";
import { CgSpinner } from "react-icons/cg";
import { cn } from "@/lib/utils";
import Button from "@/components/shared/Button";
import BrandingFieldError from "./BrandingFieldError";
import useBrandingColorCapture from "../hooks/useBrandingColorCapture";

const BrandingColorInput = ({ label = "", color, setColor, setImage, image, hideLabel = false, className = "", error = "" }) => {
  const inputId = useId();
  const { colorPickerRef, ssLoading, showSSButton, setShowSSButton, setColorPicker, captureColors } =
    useBrandingColorCapture({ image, setImage, setColor });

  return (
    <div className="relative flex flex-col">
      {!hideLabel && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div ref={colorPickerRef} className={cn("flex items-stretch space-x-2", className)}>
        <input
          id={inputId}
          type="color"
          aria-label={hideLabel ? label : undefined}
          className="size-14 cursor-pointer appearance-none rounded-lg border-none outline-none focus:ring-0"
          value={color}
          onFocus={() => setShowSSButton(true)}
          onChange={(e) => {
            setColorPicker(e.target.value);
            setColor?.(e.target.value);
          }}
        />
        {showSSButton && (
          <Button
            variant="primary"
            onClick={captureColors}
            label="Show Colors"
            disabled={ssLoading}
            cnRight="size-6 animate-spin"
            rightIcon={ssLoading ? CgSpinner : null}
          />
        )}
        <p className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
          {color}
        </p>
      </div>
      <BrandingFieldError message={error} />
    </div>
  );
};

export default BrandingColorInput;
