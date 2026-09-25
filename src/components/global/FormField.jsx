import Checkbox from "@/components/shared/Checkbox";
import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import TextField from "@/components/shared/TextField";
import {
  FIELD_TYPES,
  FORM_FIELD_CHANGE_SHAPES,
  FORM_FIELD_CHECKBOX_VARIANTS,
  FORM_FIELD_TEXT_SOURCES,
} from "@/constants";
import getFieldLabel from "@/utils/getFieldLabel";

// FIELD shape calls onChange(field, value)
const FormField = ({
  field = "",
  label = "",
  value = "",
  onChange,
  type = FIELD_TYPES.TEXT,
  options = null,
  error = null,
  onChangeShape = FORM_FIELD_CHANGE_SHAPES.EVENT,
  labelClassName = "",
  selectBaseClassName = "",
  selectDefaultClassName = "",
  selectErrorClassName = "border-red-500",
  placeholderOption = null,
  inputClassName = undefined,
  inputPlaceholderSource = FORM_FIELD_TEXT_SOURCES.LABEL,
  checkboxVariant = FORM_FIELD_CHECKBOX_VARIANTS.NATIVE,
}) => {
  const labelText = label || getFieldLabel(field);
  const isFieldShape = onChangeShape === FORM_FIELD_CHANGE_SHAPES.FIELD;
  const selectClassName = `${selectBaseClassName} ${error ? selectErrorClassName : selectDefaultClassName}`;
  const placeholderText =
    placeholderOption === FORM_FIELD_TEXT_SOURCES.LABEL ? `Select ${labelText}` : placeholderOption;

  if (type === FIELD_TYPES.SELECT && options) {
    return (
      <div className="mb-4">
        <label htmlFor={field} className={labelClassName}>
          {labelText}
        </label>
        <select
          id={field}
          name={field}
          value={value}
          onChange={isFieldShape ? (e) => onChange?.(field, e.target.value) : onChange}
          aria-invalid={error ? true : undefined}
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
    if (checkboxVariant === FORM_FIELD_CHECKBOX_VARIANTS.SHARED) {
      return (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox id={field} name={field} checked={value} onChange={onChange} label={labelText} />
          {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
        </div>
      );
    }
    return (
      <div className="mb-4 flex items-center space-x-2">
        <input id={field} type="checkbox" checked={value} onChange={() => onChange?.(field, !value)} />
        <label htmlFor={field} className="text-sm font-medium">
          {labelText}
        </label>
      </div>
    );
  }

  if (type === FIELD_TYPES.MULTI_SELECT && options) {
    return (
      <div className="mb-4">
        <label htmlFor={field} className={labelClassName || "mb-1 block text-sm font-medium"}>
          {labelText}
        </label>
        <DropdownCheckbox
          id={field}
          options={options}
          selected={value}
          defaultText={`Select ${labelText}`}
          onSelect={(vals) => onChange?.(field, vals)}
          hasError={Boolean(error)}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === FIELD_TYPES.TEXTAREA) {
    return (
      <div className="mb-4">
        <label htmlFor={field} className={labelClassName}>
          {labelText}
        </label>
        <textarea
          id={field}
          name={field}
          value={value}
          onChange={(e) => onChange?.(field, e.target.value)}
          aria-invalid={error ? true : undefined}
          className={selectClassName}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <TextField
        id={field}
        label={labelText}
        aria-label={labelText}
        name={field}
        type={type}
        value={value}
        onChange={isFieldShape ? (e) => onChange?.(field, e.target.value) : onChange}
        placeholder={`Enter ${inputPlaceholderSource === FORM_FIELD_TEXT_SOURCES.FIELD ? field : labelText}`}
        className={inputClassName}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
