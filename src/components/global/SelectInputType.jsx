import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import FieldSelect from "@/components/shared/FieldSelect";
import { getSelectDisplayValue, setSectionFieldValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getDisabledClasses } from "@/utils/fieldStyles";
import { buildAiHelpContext } from "@/utils/aiHelpContext";

const SelectInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, onChange, isPdf = false }) => {
  const { label, options, name, required, uniqueId, placeholder, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const { displayValue, hiddenValue } = getSelectDisplayValue(options, form?.[uniqueId]?.value);

  return (
    <div
      className={`flex w-full flex-col items-start ${className}`}
      data-ai-help-context={isPdf ? undefined : buildAiHelpContext(field)}
    >
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4" />
      )}
      <div className="flex w-full gap-2">
        <FieldSelect
          name={name}
          id={isPdf ? undefined : uniqueId}
          data-ai-id={isPdf ? undefined : uniqueId}
          data-ai-label={isPdf ? undefined : label || undefined}
          required={required}
          disabled={isPdf ? isDisabledAllFields : undefined}
          options={options}
          placeholder={placeholder}
          value={displayValue}
          hiddenValue={hiddenValue}
          className={
            isPdf
              ? `border-frameColor ${FIELD_INPUT_CLASSES} ${!displayValue && required ? "bg-highlighting" : ""} ${getDisabledClasses(isDisabledAllFields)}`
              : `border-frameColor ${FIELD_INPUT_CLASSES} ${!displayValue && required ? "bg-highlighting" : ""}`
          }
          onChange={onChange}
          onValueChange={(value) =>
            isPdf
              ? setSectionFieldValue(setForm, sectionKey, uniqueId, name, value)
              : setForm({ ...form, [uniqueId]: { name, value } })
          }
        />
      </div>
    </div>
  );
};

export default SelectInputType;
