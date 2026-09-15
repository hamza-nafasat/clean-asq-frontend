import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";

const MultiCheckboxInputType = ({ field = {}, className = "", form = {}, setForm }) => {
  const { label, options, name, uniqueId, required, aiPrompt, isDisplayText, ai_formatting } = field;

  const handleToggle = (e) => {
    const { value } = e.target;
    const nextValue = form[name]?.includes(value)
      ? form[name].filter((item) => item !== value)
      : [...form[name], value];
    setForm({ ...form, [uniqueId]: { name, value: nextValue } });
  };

  return (
    <div className={`flex w-full justify-between gap-4 ${className}`} data-ai-help-context={aiPrompt || undefined}>
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
              name={name}
              data-ai-id={uniqueId}
              data-ai-label={label || undefined}
              type="checkbox"
              value={option?.value}
              checked={form[uniqueId]?.value?.includes(option?.value)}
              className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
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
