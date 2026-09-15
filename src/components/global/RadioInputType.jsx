import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";

const RadioInputType = ({
  field = {},
  className = "",
  form = {},
  setForm,
  onChange,
  disabled = false,
  optionColumnCount = 3,
}) => {
  const { label, options, name, uniqueId, required, aiPrompt, isDisplayText, ai_formatting } = field;

  return (
    <div className={`flex w-full flex-col items-start ${className}`} data-ai-help-context={aiPrompt || undefined}>
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
            const isOptionDisabled = disabled || option?.disabled;
            return (
              <div key={index} className="flex items-center gap-2 p-2 text-start">
                <input
                  disabled={isOptionDisabled}
                  name={name}
                  data-ai-id={uniqueId}
                  data-ai-label={label || undefined}
                  type="radio"
                  id={optionId}
                  value={option.value}
                  checked={form[uniqueId]?.value === option.value}
                  className={` h-5! w-5! text-textPrimary accent-primary ${isOptionDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  required={required}
                  onChange={onChange ? onChange : () => setForm({ ...form, [uniqueId]: { name, value: option.value } })}
                />
                <label
                  htmlFor={optionId}
                  className={`text-base ${isOptionDisabled ? "cursor-not-allowed text-gray-400" : "text-textPrimary"}`}
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
