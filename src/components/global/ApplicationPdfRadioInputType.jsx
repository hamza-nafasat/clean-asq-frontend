import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { getDisabledClasses } from "@/utils/fieldStyles";

const ApplicationPdfRadioInputType = ({
  field = {},
  className = "",
  form = {},
  setForm,
  onChange,
  sectionKey,
  optionColumnCount = 3,
}) => {
  const { label, options, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 py-4" />
      )}
      <div className="flex w-full">
        <FieldLabel label={label} required={required} className="text-textPrimary min-w-50 text-base font-medium lg:text-lg" />
      </div>
      <div className="border-b-2 py-2">
        <div className={`grid grid-cols-${optionColumnCount} gap-4 p-0`}>
          {options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 text-start">
              <input
                disabled={isDisabledAllFields}
                name={name}
                type="radio"
                id={option.value + index + name}
                value={option.value}
                checked={form?.[uniqueId]?.value === option.value}
                className={` h-5! w-5! text-textPrimary accent-primary ${getDisabledClasses(isDisabledAllFields)}`}
                required={required}
                onChange={
                  onChange ? onChange : () => setSectionFieldValue(setForm, sectionKey, uniqueId, name, option.value)
                }
              />
              <label htmlFor={option.value + index + name} className="text-textPrimary text-base">
                {option?.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationPdfRadioInputType;
