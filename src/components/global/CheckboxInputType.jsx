import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import TextField from "@/components/shared/TextField";

const CheckboxInputType = ({ field = {}, className = "", form = {}, setForm }) => {
  const { label, name, uniqueId, required, aiPrompt, isDisplayText, ai_formatting, conditional_fields } = field;

  return (
    <div className="flex flex-col gap-2" data-ai-help-context={aiPrompt || undefined}>
      <div className={`flex flex-col justify-between ${className}`}>
        {ai_formatting && isDisplayText && <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col" />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 px-2">
            <input
              type="checkbox"
              id={uniqueId}
              name={name}
              data-ai-id={uniqueId}
              data-ai-label={label || undefined}
              required={required}
              value={form[uniqueId]?.value}
              checked={form[uniqueId]?.value}
              className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              onChange={(e) => setForm({ ...form, [uniqueId]: { name, value: e.target.checked } })}
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
                    id={fieldName}
                    data-ai-id={fieldName}
                    value={form?.[fieldName]?.value}
                    type={conditionalField?.type}
                    label={conditionalField?.label}
                    name={fieldName}
                    required={conditionalField?.required}
                    onChange={(e) =>
                      setForm({ ...form, [e.target.name]: { name: e.target.name, value: e.target.value } })
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
