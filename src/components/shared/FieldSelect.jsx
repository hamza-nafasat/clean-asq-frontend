import { useRef } from "react";

import { advanceToNextField } from "@/utils/fieldFormatting";

const ADVANCE_DELAY_MS = 50;
const TAB_KEY = "Tab";

const FieldSelect = ({
  options = [],
  placeholder,
  value = "",
  hiddenValue,
  className = "",
  onChange,
  onValueChange,
  ...rest
}) => {
  const mouseDownRef = useRef(false);
  const tabPressedRef = useRef(false);

  const handleSelectChange = (e) => {
    onValueChange?.(e.target.value);
    // tab already moves focus, so only advance after a click or keyboard pick
    if (!tabPressedRef.current) {
      const el = e.target;
      setTimeout(() => advanceToNextField(el), ADVANCE_DELAY_MS);
    }
    tabPressedRef.current = false;
  };

  const handleFocus = (e) => {
    if (!mouseDownRef.current) {
      try {
        e.target.showPicker?.();
      } catch {
        // picker is not supported here
      }
    }
    mouseDownRef.current = false;
  };

  return (
    <select
      {...rest}
      value={value}
      className={className}
      onChange={onChange ? onChange : handleSelectChange}
      onKeyDown={(e) => {
        if (e.key === TAB_KEY) tabPressedRef.current = true;
      }}
      onMouseDown={() => {
        mouseDownRef.current = true;
      }}
      onFocus={handleFocus}
    >
      <option value="">{placeholder ?? "Select an option"}</option>
      {hiddenValue && (
        <option className="hidden" value={hiddenValue}>
          {hiddenValue}
        </option>
      )}
      {options?.map((option, index) => (
        <option key={index} value={option?.value}>
          {option?.label}
        </option>
      ))}
    </select>
  );
};

export default FieldSelect;
