import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import { buildAiHelpContext } from "@/utils/aiHelpContext";

const SimpleRadioInputType = ({ field = {}, className = "", form = {}, setForm, onChange, disabled = false, groupName }) => {
  const { label, options, name, required, isDisplayText, ai_formatting } = field;
  // repeated boxes pass a unique group name so their radios do not share one group
  const radioGroupName = groupName || name;

  return (
    <div className={`flex w-full flex-col items-start ${className}`} data-ai-help-context={buildAiHelpContext(field)}>
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 py-4" />
      )}
      <div className="flex w-full">
        <FieldLabel label={label} required={required} className="text-textPrimary min-w-50 text-base font-medium lg:text-lg" />
      </div>
      <div className="border-b-2 py-2">
        <div className="grid grid-cols-3 gap-4 p-0">
          {options?.map((option, index) => {
            const optionId = option.value + index + radioGroupName;
            return (
              <div key={index} className="flex items-center gap-2 p-2 text-start">
                <input
                  disabled={disabled}
                  name={radioGroupName}
                  data-ai-id={field.uniqueId || radioGroupName}
                  data-ai-label={typeof label === "string" ? label : name}
                  type="radio"
                  id={optionId}
                  value={option.value}
                  checked={form[name] === option.value}
                  className={`text-textPrimary accent-primary size-5 ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  required={required}
                  onChange={onChange ? (e) => onChange(e) : () => setForm({ ...form, [name]: option.value })}
                />
                <label htmlFor={optionId} className="text-textPrimary text-base">
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

export default SimpleRadioInputType;
