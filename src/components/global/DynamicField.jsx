import CheckboxInputType from "@/components/global/CheckboxInputType";
import FileInputType from "@/components/global/FileInputType";
import MultiCheckboxInputType from "@/components/global/MultiCheckboxInputType";
import OtherInputType from "@/components/global/OtherInputType";
import RadioInputType from "@/components/global/RadioInputType";
import RangeInputType from "@/components/global/RangeInputType";
import SelectInputType from "@/components/global/SelectInputType";
import SimpleRadioInputType from "@/components/global/SimpleRadioInputType";
import FieldLabel from "@/components/shared/FieldLabel";
import { FIELD_TYPES } from "@/constants";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

const CHECKBOX_CLASSES = "text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded";
const RANGE_MIN = 0;
const RANGE_MAX = 100;

const DynamicField = ({ cn, field = {}, className = "", form = {}, placeholder, value, setForm, ...rest }) => {
  const { type, label, id, options, name, required } = field;
  const inputClasses = `${cn} border-frameColor ${FIELD_INPUT_CLASSES} ${className}`;

  const handleMultiCheckboxChange = (e) => {
    if (form[name]?.includes(e.target.value)) {
      setForm({ ...form, [name]: form[name].filter((item) => item !== e.target.value) });
    } else {
      setForm({ ...form, [name]: [...form[name], e.target.value] });
    }
  };

  const handleRangeChange = (e) => {
    if (e.target.value > RANGE_MAX || e.target.value < RANGE_MIN) return;
    setForm({ ...form, [name]: e.target.value });
  };

  if (type == FIELD_TYPES.RADIO) {
    return (
      <>
        <FieldLabel label={label} required={required} />
        <div className="border-b-2 py-2">
          <div className="grid grid-cols-2 gap-4 p-0">
            {options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2">
                <input
                  name={name}
                  type={type}
                  id={option.value}
                  value={option.value}
                  checked={form[name] === option.value}
                  className="text-textPrimary accent-primary size-5"
                  {...rest}
                  onChange={() => setForm({ ...form, [name]: option.value })}
                />
                <label className="text-textPrimary text-base">{option?.label}</label>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  if (type == FIELD_TYPES.CHECKBOX) {
    return (
      <div className={`flex items-center space-x-8 ${className}`}>
        {label && <FieldLabel label={label} required={required} />}
        <input
          id={id}
          type={type}
          value={value}
          className={CHECKBOX_CLASSES}
          {...rest}
          onChange={(e) => setForm({ ...form, [name]: e.target.checked })}
        />
      </div>
    );
  }
  if (type == FIELD_TYPES.RANGE) {
    return (
      <div className="flex w-full flex-col items-start">
        {label && <FieldLabel label={label} required={required} />}
        <div className={`relative w-full ${label ? "mt-2" : ""}`}>
          <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{value ?? 25}</div>
          <input {...rest} type="range" value={value ?? 0} className={inputClasses} onChange={handleRangeChange} />
          <input type="number" value={value ?? 0} className={inputClasses} onChange={handleRangeChange} />
        </div>
      </div>
    );
  }
  if (type == FIELD_TYPES.MULTI_CHECKBOX) {
    return (
      <div className={`flex w-full justify-between gap-4 ${className}`}>
        <FieldLabel label={label} required={required} />
        <div className="flex w-full items-center gap-8">
          {options?.map((option, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <label htmlFor={option?.label} className="text-base text-gray-700 capitalize">
                {option?.label}
              </label>
              <input
                id={option?.label}
                type="checkbox"
                value={option?.value}
                checked={form[name]?.includes(option?.value)}
                className={CHECKBOX_CLASSES}
                {...rest}
                onChange={handleMultiCheckboxChange}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type == FIELD_TYPES.SELECT) {
    return (
      <div className="flex w-full flex-col items-start">
        {label && <FieldLabel label={label} required={required} />}
        <select
          name={name}
          id={id}
          className={`border-frameColor ${FIELD_INPUT_CLASSES}`}
          {...rest}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        >
          {options?.map((option, index) => (
            <option key={index} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col items-start">
      {label && <FieldLabel label={label} required={required} />}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <input
          {...rest}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
          placeholder={placeholder}
          type={type}
          value={value}
          className={inputClasses}
        />
      </div>
    </div>
  );
};

export {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
  SimpleRadioInputType,
};

export default DynamicField;
