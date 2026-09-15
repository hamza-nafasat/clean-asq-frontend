import Checkbox from "@/components/shared/Checkbox";
import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import TextField from "@/components/shared/TextField";
import { FIELD_TYPES } from "@/constants";
import getFieldLabel from "@/utils/getFieldLabel";

// onChangeShape: "event" passes the native event, "field" passes (field, value)
const FormField = ({
  field = "",
  value = "",
  onChange,
  type = FIELD_TYPES.TEXT,
  options = null,
  error = null,
  onChangeShape = "event",
  labelClassName = "",
  selectBaseClassName = "",
  selectClassSeparator = " ",
  selectDefaultClassName = "",
  selectErrorClassName = "border-red-500",
  placeholderOption = null,
  inputClassName = undefined,
  inputPlaceholderSource = "label",
  checkboxVariant = "native",
}) => {
  const labelText = getFieldLabel(field);
  const isFieldShape = onChangeShape === "field";
  const selectClassName = `${selectBaseClassName}${selectClassSeparator}${error ? selectErrorClassName : selectDefaultClassName}`;
  const placeholderText = placeholderOption === "label" ? `Select ${labelText}` : placeholderOption;

  if (type === FIELD_TYPES.SELECT && options) {
    return (
      <div className="mb-4">
        <label className={labelClassName}>{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={isFieldShape ? (e) => onChange?.(field, e.target.value) : onChange}
          className={selectClassName}
        >
          {placeholderText !== null && <option value="">{placeholderText}</option>}
          {options.map((option) => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === FIELD_TYPES.CHECKBOX) {
    if (checkboxVariant === "shared") {
      return (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox name={field} checked={value} onChange={onChange} label={labelText} />
          {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
        </div>
      );
    }
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

  if (type === FIELD_TYPES.TEXTAREA) {
    return (
      <div className="mb-4">
        <label className={labelClassName}>{labelText}</label>
        <textarea
          name={field}
          value={value}
          onChange={(e) => onChange?.(field, e.target.value)}
          className={selectClassName}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
        onChange={isFieldShape ? (e) => onChange?.(field, e.target.value) : onChange}
        placeholder={`Enter ${inputPlaceholderSource === "field" ? field : labelText}`}
        className={inputClassName}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
