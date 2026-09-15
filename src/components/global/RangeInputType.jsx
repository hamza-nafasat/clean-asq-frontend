import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { isEmptyValue, setSectionFieldValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getDisabledClasses, getRequiredBorderClasses } from "@/utils/fieldStyles";

const RangeInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, isPdf = false }) => {
  const { label, name, uniqueId, required, minValue = 0, maxValue = 100, aiPrompt, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const rawValue = form[uniqueId]?.value;
  const numericValue = Number(rawValue) || 0;
  const disabledClasses = getDisabledClasses(isPdf && isDisabledAllFields);

  const handleRangeChange = (e) => {
    const nextValue = String(e.target.value);
    if (nextValue > maxValue || nextValue < minValue) return;
    if (isPdf) setSectionFieldValue(setForm, sectionKey, uniqueId, name, nextValue);
    else setForm({ ...form, [uniqueId]: { name, value: nextValue } });
  };

  return (
    <div
      className={`flex w-full flex-col items-start ${className}`}
      data-ai-help-context={isPdf ? undefined : aiPrompt || undefined}
    >
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 p-4" />
      )}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{numericValue} %</div>
        <input
          value={numericValue}
          type="range"
          disabled={isPdf ? isDisabledAllFields : undefined}
          className={
            isPdf
              ? `border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${disabledClasses}`
              : `border-frameColor ${FIELD_INPUT_CLASSES} ${className} `
          }
          onChange={handleRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            id={isPdf ? undefined : uniqueId}
            name={isPdf ? undefined : name}
            data-ai-id={isPdf ? undefined : uniqueId}
            data-ai-label={isPdf ? undefined : label || undefined}
            disabled={isPdf ? isDisabledAllFields : undefined}
            type="number"
            value={numericValue}
            className={
              isPdf
                ? `border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${getRequiredBorderClasses(
                    (required && isEmptyValue(rawValue)) || rawValue === 0,
                  )} ${disabledClasses}`
                : `border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${getRequiredBorderClasses(
                    (required && isEmptyValue(rawValue)) || rawValue === 0,
                  )}`
            }
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default RangeInputType;
