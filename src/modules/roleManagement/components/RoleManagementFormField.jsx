import TextField from "@/components/shared/TextField";
import { FIELD_TYPES } from "@/constants";
import { SELECT_CLASS_NAME } from "../utils/roleManagement.constants";
import { getFieldLabel } from "../utils/roleManagement.utils";

const RoleManagementFormField = ({ field = "", value = "", onChange, type = FIELD_TYPES.TEXT, error = null, options = null }) => {
  const labelText = getFieldLabel(field);

  if (type === FIELD_TYPES.SELECT && options) {
    return (
      <div className="mb-4">
        <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={onChange}
          className={`${SELECT_CLASS_NAME}${error ? "border-red-500" : "border-frameColor"}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
        onChange={onChange}
        placeholder={`Enter ${field}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default RoleManagementFormField;
