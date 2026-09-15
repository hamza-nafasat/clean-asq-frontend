import { useSelector } from "react-redux";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import FieldSelect from "@/components/shared/FieldSelect";
import { getSelectDisplayValue, setSectionFieldValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getDisabledClasses } from "@/utils/fieldStyles";

const ApplicationPdfSelectInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, onChange }) => {
  const { label, options, name, required, uniqueId, placeholder, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const { displayValue, hiddenValue } = getSelectDisplayValue(options, form?.[uniqueId]?.value);

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4" />
      )}
      <div className="flex w-full gap-2">
        <FieldSelect
          name={name}
          required={required}
          disabled={isDisabledAllFields}
          options={options}
          placeholder={placeholder}
          value={displayValue}
          hiddenValue={hiddenValue}
          className={`border-frameColor ${FIELD_INPUT_CLASSES} ${!displayValue && required ? "bg-highlighting" : ""} ${getDisabledClasses(isDisabledAllFields)}`}
          onChange={onChange}
          onValueChange={(value) => setSectionFieldValue(setForm, sectionKey, uniqueId, name, value)}
        />
      </div>
    </div>
  );
};

export default ApplicationPdfSelectInputType;
