import Checkbox from "@/components/shared/Checkbox";
import TextField from "@/components/shared/TextField";
import { FIELD_TYPES } from "@/constants";
import { SELECT_CLASS_NAME } from "../utils/user-management.constants";
import { getFieldLabel } from "../utils/user-management.utils";

const UserManagementFormField = ({ field = "", value, onChange, type = FIELD_TYPES.TEXT, error = null, options = null }) => {
  const labelText = getFieldLabel(field);

  if (type === FIELD_TYPES.SELECT && options) {
    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={onChange}
          className={`${SELECT_CLASS_NAME} ${error ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="">Select {labelText}</option>
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

  if (type === FIELD_TYPES.CHECKBOX) {
    return (
      <div className="mb-4 flex items-center space-x-2">
        <Checkbox name={field} checked={value} onChange={onChange} label={labelText} />
        {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
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
        placeholder={`Enter ${labelText}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default UserManagementFormField;
