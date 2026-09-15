import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import TextField from "@/components/shared/TextField";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { getDisabledClasses } from "@/utils/fieldStyles";

const CheckboxInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, isPdf = false }) => {
  const { label, name, uniqueId, required, aiPrompt, isDisplayText, ai_formatting, conditional_fields } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const isDisabled = isPdf && isDisabledAllFields;

  return (
    <div className="flex flex-col gap-2" data-ai-help-context={isPdf ? undefined : aiPrompt || undefined}>
      <div className={`flex flex-col justify-between ${className}`}>
        {ai_formatting && isDisplayText && <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col" />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 px-2">
            <input
              type="checkbox"
              id={isPdf ? undefined : uniqueId}
              name={name}
              data-ai-id={isPdf ? undefined : uniqueId}
              data-ai-label={isPdf ? undefined : label || undefined}
              required={required}
              disabled={isPdf ? isDisabledAllFields : undefined}
              value={form[uniqueId]?.value}
              checked={form[uniqueId]?.value}
              className={
                isPdf
                  ? `text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${getDisabledClasses(isDisabledAllFields)}`
                  : "text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              }
              onChange={(e) =>
                isPdf
                  ? setSectionFieldValue(setForm, sectionKey, uniqueId, name, e.target.checked)
                  : setForm({ ...form, [uniqueId]: { name, value: e.target.checked } })
              }
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
                    id={isPdf ? undefined : fieldName}
                    data-ai-id={isPdf ? undefined : fieldName}
                    disabled={isDisabled}
                    value={form?.[fieldName]?.value}
                    type={conditionalField?.type}
                    label={conditionalField?.label}
                    name={fieldName}
                    required={conditionalField?.required}
                    onChange={(e) =>
                      isPdf
                        ? setSectionFieldValue(setForm, sectionKey, e.target.name, e.target.name, e.target.value)
                        : setForm({ ...form, [e.target.name]: { name: e.target.name, value: e.target.value } })
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

export default CheckboxInputType;
