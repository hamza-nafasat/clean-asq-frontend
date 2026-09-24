import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { getDisabledClasses } from "@/utils/fieldStyles";
import { buildAiHelpContext } from "@/utils/aiHelpContext";

const MultiCheckboxInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, isPdf = false }) => {
  const { label, options, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const selectedValues = form?.[uniqueId]?.value;

  const handleToggle = (e) => {
    const { value } = e.target;
    if (isPdf) {
      const nextValue = selectedValues?.includes(value)
        ? selectedValues?.filter((item) => item !== value)
        : [...(selectedValues || []), value];
      setSectionFieldValue(setForm, sectionKey, uniqueId, name, nextValue);
      return;
    }
    const nextValue = form[name]?.includes(value)
      ? form[name].filter((item) => item !== value)
      : [...form[name], value];
    setForm({ ...form, [uniqueId]: { name, value: nextValue } });
  };

  return (
    <div
      className={`flex w-full justify-between gap-4 ${className}`}
      data-ai-help-context={isPdf ? undefined : buildAiHelpContext(field)}
    >
      <FieldLabel label={label} required={required} className="text-textPrimary min-w-50lg:text-lg text-base font-medium" />
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="gap-4p-4 flex h-full w-full flex-col" />
      )}
      <div className="flex w-full items-center gap-8">
        {options?.map((option, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <label htmlFor={`${uniqueId}-option-${index}`} className="text-base text-gray-700 capitalize">
              {option?.label}
            </label>
            <input
              id={`${uniqueId}-option-${index}`}
              name={isPdf ? undefined : name}
              data-ai-id={isPdf ? undefined : uniqueId}
              data-ai-label={isPdf ? undefined : label || undefined}
              type="checkbox"
              value={option?.value}
              checked={isPdf ? selectedValues?.includes(option?.value) : form[uniqueId]?.value?.includes(option?.value)}
              disabled={isPdf ? isDisabledAllFields : undefined}
              className={
                isPdf
                  ? `text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${getDisabledClasses(isDisabledAllFields)}`
                  : "text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              }
              required={required}
              onChange={handleToggle}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiCheckboxInputType;
