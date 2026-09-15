import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PhoneFieldInput = ({
  value,
  placeholder,
  className = "",
  wrapperClassName,
  numberInputProps = {},
  disabled,
  onChange,
}) => (
  <div className={wrapperClassName}>
    <PhoneInput
      international
      limitMaxLength
      disabled={disabled}
      numberInputProps={{ style: { outline: "none" }, ...numberInputProps }}
      defaultCountry="US"
      placeholder={placeholder || "Enter phone number"}
      value={value || ""}
      onChange={(nextValue) => onChange?.(nextValue || "")}
      className={className}
    />
    {value && !isValidPhoneNumber(value) && <p className="mt-1 text-sm text-red-500">Invalid phone number</p>}
  </div>
);

export default PhoneFieldInput;
