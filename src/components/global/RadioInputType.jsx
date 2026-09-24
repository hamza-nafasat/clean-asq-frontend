import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { getDisabledClasses } from "@/utils/fieldStyles";
import { buildAiHelpContext } from "@/utils/aiHelpContext";

const RadioInputType = ({
  field = {},
  className = "",
  form = {},
  setForm,
  onChange,
  disabled = false,
  optionColumnCount = 3,
  sectionKey,
  isPdf = false,
}) => {
  const { label, options, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  return (
    <div
      className={`flex w-full flex-col items-start ${className}`}
      data-ai-help-context={isPdf ? undefined : buildAiHelpContext(field)}
    >
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 py-4" />
      )}
      <div className="flex w-full">
        <FieldLabel label={label} required={required} className="text-textPrimary min-w-50 text-base font-medium lg:text-lg" />
      </div>
      <div className="border-b-2 py-2">
        <div className={`grid grid-cols-${optionColumnCount} gap-4 p-0`}>
          {options?.map((option, index) => {
            const optionId = option.value + index + name;
            const isOptionDisabled = isPdf ? isDisabledAllFields : disabled || option?.disabled;
            return (
              <div key={index} className="flex items-center gap-2 p-2 text-start">
                <input
                  disabled={isOptionDisabled}
                  name={name}
                  data-ai-id={isPdf ? undefined : uniqueId}
                  data-ai-label={isPdf ? undefined : label || undefined}
                  type="radio"
                  id={optionId}
                  value={option.value}
                  checked={form[uniqueId]?.value === option.value}
                  className={` h-5! w-5! text-textPrimary accent-primary ${getDisabledClasses(isOptionDisabled)}`}
                  required={required}
                  onChange={
                    onChange
                      ? onChange
                      : () =>
                          isPdf
                            ? setSectionFieldValue(setForm, sectionKey, uniqueId, name, option.value)
                            : setForm({ ...form, [uniqueId]: { name, value: option.value } })
                  }
                />
                <label
                  htmlFor={optionId}
                  className={
                    isPdf
                      ? "text-textPrimary text-base"
                      : `text-base ${isOptionDisabled ? "cursor-not-allowed text-gray-400" : "text-textPrimary"}`
                  }
                >
                  {option?.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RadioInputType;
