import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import TextField from "@/components/shared/TextField";
import { FIELD_TYPES } from "@/constants";

const getLabelText = (field) =>
  field
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

const StrategiesFormField = ({ field, value, onChange, type = FIELD_TYPES.TEXT, options = null, error = null }) => {
  const labelText = getLabelText(field);

  if (type === FIELD_TYPES.SELECT && options) {
    return (
      <div className="mb-4">
        <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={(e) => onChange?.(field, e.target.value)}
          className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${
            error ? "border-red-500" : "border-frameColor"
          }`}
        >
          <option value="">Choose an option</option>
          {options?.map((opt) => (
            <option key={opt?.value} value={opt?.value}>
              {opt?.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === FIELD_TYPES.CHECKBOX) {
    return (
      <div className="mb-4 flex items-center space-x-2">
        <input type="checkbox" checked={value} onChange={() => onChange?.(field, !value)} />
        <label className="text-sm font-medium">{labelText}</label>
      </div>
    );
  }

  if (type === FIELD_TYPES.MULTI_SELECT && options) {
    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">{labelText}</label>
        <DropdownCheckbox
          options={options}
          selected={value}
          defaultText={`Select ${labelText}`}
          onSelect={(vals) => onChange?.(field, vals)}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <TextField
        label={labelText}
        name={field}
        type={type}
        value={value}
        onChange={(e) => onChange?.(field, e.target.value)}
        placeholder={`Enter ${labelText}`}
        className="w-full rounded border p-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default StrategiesFormField;
