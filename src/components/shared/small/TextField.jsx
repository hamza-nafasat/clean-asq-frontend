import { useState } from "react";
import { IoEyeOffSharp } from "react-icons/io5";
import { RxEyeOpen } from "react-icons/rx";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// ----------------------
// FORMAT UTILITIES
// ----------------------

const formatSSN = (raw) => {
  const numeric = raw.replace(/\D/g, "").slice(0, 9);
  let out = "";

  if (numeric.length > 0) out += numeric.slice(0, 3);
  if (numeric.length > 3) out += "-" + numeric.slice(3, 5);
  if (numeric.length > 5) out += "-" + numeric.slice(5);

  return out;
};
// -------------------------
// COMPONENT
// -------------------------

const TextField = ({
  isPdf = false,
  cn,
  label,
  type = "text",
  leftIcon,
  cnLeft,
  rightIcon,
  cnRight,
  onClickRightIcon,
  isMasked = false,
  className,
  formatting,
  suggestions,
  onChange,
  name,
  disabled = false,
  value,
  required = false,
  rows,
  cols,
  placeholder,
  ...rest
}) => {
  const [showMasked, setShowMasked] = useState(isMasked);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputVal = String(value ?? "").toLowerCase();

  const isPhone = name?.toLowerCase().includes("phone");
  const isSSN = name?.toLowerCase().includes("ssn");

  const filteredSuggestions = Array.isArray(suggestions)
    ? suggestions.filter((s) => s.toLowerCase().includes(inputVal))
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(/[-/]/);
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(/[-\s/]/);
    return `${year}-${month}-${day}`;
  };

  const getDisplayValue = (value) => {
    if (!value) return "";

    if (isSSN && formatting === "3,2,4") return formatSSN(String(value));

    return value;
  };

  // -----------------------------
  // TEXTAREA MODE
  // -----------------------------
  if (type === "textarea")
    return (
      <div className={`input-box flex w-full flex-col items-start ${className}`}>
        {label && <h4 className="text-textPrimary text-base font-medium lg:text-lg">{label}</h4>}

        <div className={`relative w-full ${label ? "mt-2" : ""}`}>
          {leftIcon && (
            <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
          )}

          <textarea
            {...rest}
            onChange={(e) => {
              const val = type === "date" ? normalizeDate(e.target.value) : e.target.value;
              onChange?.({ target: { name, value: val } });
            }}
            rows={rows}
            cols={cols}
            placeholder={placeholder}
            name={name}
            disabled={disabled}
            value={type === "date" ? formatDate(value) : value}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className={`${cn} relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${!value && required && !isPdf ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
          />

          {rightIcon && (
            <span
              className={`absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center text-gray-500 ${cnRight}`}
            >
              <button onClick={onClickRightIcon} className="cursor-pointer">
                {rightIcon}
              </button>
            </span>
          )}
        </div>
      </div>
    );

  // -----------------------------
  // INPUT MODE
  // -----------------------------
  return (
    <div className={`input-box flex w-full flex-col items-start ${className}`}>
      {label && <h4 className="text-textPrimary text-base font-medium lg:text-lg">{label}</h4>}

      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
        )}

        {isPhone ? (
          <div className="relative">
            <PhoneInput
              numberInputProps={{ style: { outline: "none" } }}
              international
              defaultCountry="US"
              placeholder={placeholder || "Enter phone number"}
              value={value || ""}
              onChange={(val) => {
                onChange?.({
                  target: {
                    name,
                    value: val || "", // E.164
                  },
                });
              }}
              className={`${cn} relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
                leftIcon ? "pl-10" : ""
              } ${rightIcon ? "pr-10" : ""} ${
                required && (!value || !isValidPhoneNumber(value)) ? "border-red-500 border-2" : "border-frameColor"
              } ${!value && required && !isPdf ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
            />

            {/* Validation */}
            {value && !isValidPhoneNumber(value) && <p className="mt-1 text-sm text-red-500">Invalid phone number</p>}
          </div>
        ) : (
          <input
            {...rest}
            name={name}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            type={showMasked ? "password" : type}
            value={type === "date" ? formatDate(value) : getDisplayValue(value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => {
              let val = type === "date" ? normalizeDate(e.target.value) : e.target.value;
              // SSN HANDLING
              if (isSSN && formatting === "3,2,4") {
                val = val.replace(/\D/g, "").slice(0, 9);
              }
              onChange?.({ target: { name, value: val } });
            }}
            className={`${cn} relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${!value && required && !isPdf ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""} `}
          />
        )}

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && value?.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
            <ul className="flex h-full flex-col divide-y divide-gray-100">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="h-full cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                  onClick={() => {
                    onChange?.({ target: { name, value: suggestion } });
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rightIcon && (
          <span
            className={`absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center text-gray-500 ${cnRight}`}
          >
            <button onClick={onClickRightIcon} className="cursor-pointer">
              {rightIcon}
            </button>
          </span>
        )}

        {isMasked && (
          <span
            onClick={() => setShowMasked(!showMasked)}
            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
          >
            {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextField;
