import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import FieldSelect from "@/components/shared/FieldSelect";
import { getSelectDisplayValue } from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

const SelectInputType = ({ field = {}, className = "", form = {}, setForm, onChange }) => {
  const { label, options, name, required, uniqueId, placeholder, aiPrompt, isDisplayText, ai_formatting } = field;
  const { displayValue, hiddenValue } = getSelectDisplayValue(options, form?.[uniqueId]?.value);

  return (
    <div className={`flex w-full flex-col items-start ${className}`} data-ai-help-context={aiPrompt || undefined}>
      {label && <FieldLabel label={label} required={required} />}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4" />
      )}
      <div className="flex w-full gap-2">
        <FieldSelect
          name={name}
          id={uniqueId}
          data-ai-id={uniqueId}
          data-ai-label={label || undefined}
          required={required}
          options={options}
          placeholder={placeholder}
          value={displayValue}
          hiddenValue={hiddenValue}
          className={`border-frameColor ${FIELD_INPUT_CLASSES} ${!displayValue && required ? "bg-highlighting" : ""}`}
          onChange={onChange}
          onValueChange={(value) => setForm({ ...form, [uniqueId]: { name, value } })}
        />
      </div>
    </div>
  );
};

export default SelectInputType;
