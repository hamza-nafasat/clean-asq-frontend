export const FIELD_INPUT_CLASSES =
  "h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";

export const DISABLED_FIELD_CLASSES = "opacity-70 cursor-not-allowed";

export const getRequiredBorderClasses = (isHighlighted) =>
  isHighlighted ? "border-accent bg-highlighting border-2" : "border-frameColor border";

export const getDisabledClasses = (isDisabled) => (isDisabled ? DISABLED_FIELD_CLASSES : "");
