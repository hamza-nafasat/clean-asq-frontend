import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { isEmptyValue, setSectionFieldValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getDisabledClasses, getRequiredBorderClasses } from "@/utils/fieldStyles";

const ApplicationPdfRangeInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, minValue = 0, maxValue = 100, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const rawValue = form?.[uniqueId]?.value;
  const numericValue = Number(rawValue) || 0;
  const disabledClasses = getDisabledClasses(isDisabledAllFields);

  const handleRangeChange = (e) => {
    const nextValue = String(e.target.value);
    if (nextValue > maxValue || nextValue < minValue) return;
    setSectionFieldValue(setForm, sectionKey, uniqueId, name, nextValue);
  };

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 p-4" />
      )}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{numericValue} %</div>
        <input
          disabled={isDisabledAllFields}
          value={numericValue}
          type="range"
          className={`border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${disabledClasses}`}
          onChange={handleRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            disabled={isDisabledAllFields}
            type="number"
            value={numericValue}
            className={`border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${getRequiredBorderClasses(
              (required && isEmptyValue(rawValue)) || rawValue === 0,
            )} ${disabledClasses}`}
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationPdfRangeInputType;
