import { useRef, useState } from "react";
import { IoEyeOffSharp } from "react-icons/io5";
import { RxEyeOpen } from "react-icons/rx";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// ----------------------
// FORMAT UTILITIES
// ----------------------

const getFormatParts = (format) =>
  String(format || "")
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

const getMaxDigitsFromFormat = (format) => getFormatParts(format).reduce((a, b) => a + b, 0);

const limitByFormat = (value, format) => {
  const maxDigits = getMaxDigitsFromFormat(format);
  const digits = String(value || "").replace(/\D/g, "");
  if (!maxDigits) return digits;
  return digits.slice(0, maxDigits);
};

const formatByParts = (raw, format) => {
  const parts = getFormatParts(format);
  if (!parts.length) return String(raw || "");
  const maxDigits = parts.reduce((a, b) => a + b, 0);
  const digits = String(raw || "").replace(/\D/g, "").slice(0, maxDigits);
  let out = "";
  let start = 0;
  for (let i = 0; i < parts.length; i++) {
    if (start >= digits.length) break;
    out += digits.slice(start, start + parts[i]);
    start += parts[i];
    if (i < parts.length - 1 && start < digits.length) out += "-";
  }
  return out;
};

const focusNextField = (el) => {
  if (!el) return;
  const focusable = Array.from(
    document.querySelectorAll("input:not([disabled]), select:not([disabled]), textarea:not([disabled])"),
  ).filter((f) => f.offsetParent !== null && f.tabIndex !== -1);
  const idx = focusable.indexOf(el);
  if (idx >= 0 && idx + 1 < focusable.length) focusable[idx + 1].focus();
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
  labelCs = "",
  textAreaHeight = "45px",
  placeholder,
  borderAndBgChangeIfEmpty = true,
  id,
  ...rest
}) => {
  const [showMasked, setShowMasked] = useState(isMasked);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);

  const inputVal = String(value ?? "").toLowerCase();

  const isPhone = type === "tel" || name?.toLowerCase().includes("phone");
  const isSSN = name?.toLowerCase().includes("ssn");
  const isTaxId = name?.toLowerCase().includes("tax");
  let effectiveFormatting = formatting;
  if (isSSN) effectiveFormatting = "3,2,4";
  if (isTaxId) effectiveFormatting = "2,7";

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
    if (effectiveFormatting && type !== "date" && !isPhone) {
      return formatByParts(String(value), effectiveFormatting);
    }
    return value;
  };

  // -----------------------------
  // TEXTAREA MODE
  // -----------------------------
  if (type === "textarea")
    return (
      <div className={`input-box flex w-full flex-col items-start ${className}`}>
        {label && (
          <h4 className={`text-textPrimary text-base font-medium lg:text-lg ${labelCs && labelCs}`}>{label}</h4>
        )}

        <div className={`relative w-full ${label ? "mt-2" : ""}`}>
          {leftIcon && (
            <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
          )}

          <textarea
            onChange={(e) => {
              const val = type === "date" ? normalizeDate(e.target.value) : e.target.value;
              onChange?.({ target: { name, value: val } });
            }}
            rows={rows}
            cols={cols}
            placeholder={placeholder}
            name={name}
            id={id}
            data-ai-id={rest["data-ai-id"] || id}
            disabled={disabled}
            value={type === "date" ? formatDate(value) : value}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className={`${cn} relative min-h-[${textAreaHeight}]! w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:text-base $ ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${!value && required && !isPdf && borderAndBgChangeIfEmpty ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
            {...rest}
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
      {label && <h4 className={`text-textPrimary text-base font-medium lg:text-lg ${labelCs && labelCs}`}>{label}</h4>}

      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
        )}

        {isPhone ? (
          <div className="relative">
            <PhoneInput
              numberInputProps={{
                style: { outline: "none" },
                required: required || undefined,
                disabled,
                id,
                name,
                "data-ai-id": rest["data-ai-id"] || id,
              }}
              international
              limitMaxLength
              defaultCountry="US"
              disabled={disabled}
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
              className={`${cn} relative h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${
                leftIcon ? "pl-10" : ""
              } ${rightIcon ? "pr-10" : ""} ${
                required && value && !isValidPhoneNumber(value) ? "border-red-500 border-2" : "border-frameColor"
              } ${!value && required && !isPdf && borderAndBgChangeIfEmpty ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
            />

            {value && !isValidPhoneNumber(value) && <p className="mt-1 text-sm text-red-500">Invalid phone number</p>}
          </div>
        ) : (
          <input
            ref={inputRef}
            id={id}
            data-ai-id={rest["data-ai-id"] || id}
            name={name}
            data-ai-has-suggestions={suggestions?.length ? "true" : undefined}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            type={showMasked ? "password" : type}
            value={type === "date" ? formatDate(value) : getDisplayValue(value)}
            className={`${cn} relative h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${!value && required && !isPdf && borderAndBgChangeIfEmpty ? "border-accent bg-highlighting border-2" : "border-frameColor"} ${disabled ? "opacity-70 cursor-not-allowed" : ""} `}
            {...rest}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() =>
              setTimeout(() => {
                setShowSuggestions(false);
                setSuggestionIndex(-1);
              }, 150)
            }
            onChange={(e) => {
              let val = e.target.value;
              if (effectiveFormatting && type !== "date" && !isPhone) {
                val = limitByFormat(val, effectiveFormatting);
              }
              if (type === "date") val = normalizeDate(val);
              setSuggestionIndex(-1);
              onChange?.({ target: { name, value: val } });
            }}
            onKeyDown={(e) => {
              if (!showSuggestions || !filteredSuggestions.length) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSuggestionIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSuggestionIndex((i) => Math.max(i - 1, 0));
              } else if ((e.key === "Enter" || e.key === "Tab") && suggestionIndex >= 0) {
                const picked = filteredSuggestions[suggestionIndex];
                if (!picked) return;
                if (e.key === "Enter") e.preventDefault();
                onChange?.({ target: { name, value: picked } });
                setShowSuggestions(false);
                setSuggestionIndex(-1);
                if (e.key === "Enter") setTimeout(() => focusNextField(inputRef.current), 0);
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
                setSuggestionIndex(-1);
              }
            }}
          />
        )}

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && value?.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
            <ul className="flex h-full flex-col divide-y divide-gray-100">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`h-full cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black ${
                    suggestionIndex === index ? "bg-gray-100 font-medium text-black" : ""
                  }`}
                  onMouseEnter={() => setSuggestionIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange?.({ target: { name, value: suggestion } });
                    setShowSuggestions(false);
                    setSuggestionIndex(-1);
                    setTimeout(() => focusNextField(inputRef.current), 0);
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
