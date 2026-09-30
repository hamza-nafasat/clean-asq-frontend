import { useState } from "react";
import TextField from "@/components/shared/TextField";
import { FIELD_TYPES } from "@/constants";

// text box with a hint until picked
const DateFilterField = ({ name, placeholder, value, className, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className={className} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
      <TextField
        id={name}
        name={name}
        aria-label={placeholder}
        placeholder={placeholder}
        type={value || isFocused ? FIELD_TYPES.DATE : FIELD_TYPES.TEXT}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default DateFilterField;
