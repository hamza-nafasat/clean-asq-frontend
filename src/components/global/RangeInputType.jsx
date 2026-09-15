import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { isEmptyValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getRequiredBorderClasses } from "@/utils/fieldStyles";

const RangeInputType = ({ field = {}, className = "", form = {}, setForm }) => {
  const { label, name, uniqueId, required, minValue = 0, maxValue = 100, aiPrompt, isDisplayText, ai_formatting } = field;
  const rawValue = form[uniqueId]?.value;
  const numericValue = Number(rawValue) || 0;

  const handleRangeChange = (e) => {
    const nextValue = String(e.target.value);
    if (nextValue > maxValue || nextValue < minValue) return;
    setForm({ ...form, [uniqueId]: { name, value: nextValue } });
  };

  return (
    <div className={`flex w-full flex-col items-start ${className}`} data-ai-help-context={aiPrompt || undefined}>
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 p-4" />
      )}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{numericValue} %</div>
        <input
          value={numericValue}
          type="range"
          className={`border-frameColor ${FIELD_INPUT_CLASSES} ${className} `}
          onChange={handleRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            id={uniqueId}
            name={name}
            data-ai-id={uniqueId}
            data-ai-label={label || undefined}
            type="number"
            value={numericValue}
            className={`border-frameColor ${FIELD_INPUT_CLASSES} ${className} ${getRequiredBorderClasses(
              (required && isEmptyValue(rawValue)) || rawValue === 0,
            )}`}
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default RangeInputType;
