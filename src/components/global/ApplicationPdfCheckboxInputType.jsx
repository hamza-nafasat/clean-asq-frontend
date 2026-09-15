import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import TextField from "@/components/shared/TextField";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { getDisabledClasses } from "@/utils/fieldStyles";

const ApplicationPdfCheckboxInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, isDisplayText, ai_formatting, conditional_fields } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex flex-col justify-between ${className}`}>
        {ai_formatting && isDisplayText && <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col" />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 px-2">
            <input
              type="checkbox"
              name={name}
              required={required}
              disabled={isDisabledAllFields}
              value={form?.[uniqueId]?.value}
              checked={form?.[uniqueId]?.value}
              className={`text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${getDisabledClasses(isDisabledAllFields)}`}
              onChange={(e) => setSectionFieldValue(setForm, sectionKey, uniqueId, name, e.target.checked)}
            />
            {label && <FieldLabel label={label} required={required} separator=" " />}
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2 px-6">
        {form?.[uniqueId]?.value && conditional_fields?.length
          ? conditional_fields?.map((conditionalField, index) => {
              const fieldName = `${uniqueId}/${conditionalField?.name}`;
              return (
                <div className="flex w-full flex-col gap-2" key={index}>
                  <TextField
                    disabled={isDisabledAllFields}
                    value={form?.[fieldName]?.value}
                    type={conditionalField?.type}
                    label={conditionalField?.label}
                    name={fieldName}
                    required={conditionalField?.required}
                    onChange={(e) =>
                      setSectionFieldValue(setForm, sectionKey, e.target.name, e.target.name, e.target.value)
                    }
                  />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

export default ApplicationPdfCheckboxInputType;
