import { useRef, useState } from "react";
import { IoEyeOffSharp } from "react-icons/io5";
import { RxEyeOpen } from "react-icons/rx";
import { isValidPhoneNumber } from "react-phone-number-input";

import PhoneFieldInput from "@/components/shared/PhoneFieldInput";
import { FIELD_FORMATS, FIELD_NAME_MATCHERS, FIELD_TYPES } from "@/constants";
import {
  focusNextField,
  formatByParts,
  formatDateValue,
  limitByFormat,
  normalizeDateValue,
} from "@/utils/fieldFormatting";

const TEL_TYPE = "tel";
const BLUR_CLOSE_DELAY_MS = 150;

const LABEL_SIZE_CLASSES = {
  default: "text-textPrimary text-base font-medium lg:text-lg",
  sm: "text-textPrimary text-sm font-medium",
};

const TextField = ({
  isPdf = false,
  cn,
  label,
  type = FIELD_TYPES.TEXT,
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
  labelSize = "default",
  placeholder,
  borderAndBgChangeIfEmpty = true,
  id,
  error = "",
  ...rest
}) => {
  const [showMasked, setShowMasked] = useState(isMasked);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);

  const lowerName = name?.toLowerCase();
  const isDate = type === FIELD_TYPES.DATE;
  const isPhone = type === TEL_TYPE || lowerName?.includes(FIELD_NAME_MATCHERS.PHONE);
  let effectiveFormatting = formatting;
  if (lowerName?.includes(FIELD_NAME_MATCHERS.SSN)) effectiveFormatting = FIELD_FORMATS.SSN;
  if (lowerName?.includes(FIELD_NAME_MATCHERS.TAX)) effectiveFormatting = FIELD_FORMATS.TAX_ID;

  const inputVal = String(value ?? "").toLowerCase();
  const filteredSuggestions = Array.isArray(suggestions)
    ? suggestions.filter((s) => s.toLowerCase().includes(inputVal))
    : [];

  const iconPadding = `${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""}`;
  const emptyClasses =
    !value && required && !isPdf && borderAndBgChangeIfEmpty ? "border-accent bg-highlighting border-2" : "border-frameColor";
  const disabledClasses = disabled ? "opacity-70 cursor-not-allowed" : "";
  const aiId = rest["data-ai-id"] || id;
  const errorId = error ? `${id || name}-error` : undefined;

  const getDisplayValue = (raw) => {
    if (!raw) return "";
    if (effectiveFormatting && !isDate && !isPhone) return formatByParts(String(raw), effectiveFormatting);
    return raw;
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSuggestionIndex(-1);
  };

  const pickSuggestion = (picked) => {
    onChange?.({ target: { name, value: picked } });
    closeSuggestions();
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredSuggestions.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && suggestionIndex >= 0) {
        const picked = filteredSuggestions[suggestionIndex];
        if (!picked) return;
        if (e.key === "Enter") e.preventDefault();
        pickSuggestion(picked);
        if (e.key === "Enter") setTimeout(() => focusNextField(inputRef.current), 0);
        return;
      }
      if (e.key === "Escape") {
        closeSuggestions();
        return;
      }
    }
    rest.onKeyDown?.(e);
  };

  const labelElement = label && (
    <h4 className={`${LABEL_SIZE_CLASSES[labelSize] ?? LABEL_SIZE_CLASSES.default} ${labelCs && labelCs}`}>{label}</h4>
  );
  const leftIconElement = leftIcon && (
    <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
  );
  const errorElement = error && (
    <p id={errorId} className="mt-1 text-sm text-red-600">
      {error}
    </p>
  );
  const rightIconElement = rightIcon && (
    <span className={`absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center text-gray-500 ${cnRight}`}>
      <button type="button" onClick={onClickRightIcon} className="cursor-pointer">
        {rightIcon}
      </button>
    </span>
  );

  if (type === FIELD_TYPES.TEXTAREA) {
    return (
      <div className={`input-box flex w-full flex-col items-start ${className}`}>
        {labelElement}
        <div className={`relative w-full ${label ? "mt-2" : ""}`}>
          {leftIconElement}
          <textarea
            onChange={(e) => onChange?.({ target: { name, value: e.target.value } })}
            rows={rows}
            cols={cols}
            placeholder={placeholder}
            name={name}
            id={id}
            data-ai-id={aiId}
            disabled={disabled}
            value={value}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), BLUR_CLOSE_DELAY_MS)}
            className={`${cn} relative w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:text-base ${iconPadding} ${emptyClasses} ${disabledClasses}`}
            {...rest}
          />
          {rightIconElement}
        </div>
        {errorElement}
      </div>
    );
  }

  return (
    <div className={`input-box flex w-full flex-col items-start ${className}`}>
      {labelElement}

      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        {leftIconElement}

        {isPhone ? (
          <PhoneFieldInput
            wrapperClassName="relative"
            numberInputProps={{
              required: required || undefined,
              disabled,
              id,
              name,
              "data-ai-id": aiId,
            }}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={(val) => onChange?.({ target: { name, value: val } })}
            className={`${cn} relative h-11.25 w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${iconPadding} ${
              required && value && !isValidPhoneNumber(value) ? "border-red-500 border-2" : "border-frameColor"
            } ${emptyClasses} ${disabledClasses}`}
          />
        ) : (
          <input
            ref={inputRef}
            id={id}
            data-ai-id={aiId}
            name={name}
            data-ai-has-suggestions={suggestions?.length ? "true" : undefined}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            type={showMasked ? FIELD_TYPES.PASSWORD : type}
            value={isDate ? formatDateValue(value) : getDisplayValue(value)}
            className={`${cn} relative h-11.25 w-full rounded-lg border bg-fieldBackground px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${iconPadding} ${emptyClasses} ${disabledClasses} `}
            {...rest}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(closeSuggestions, BLUR_CLOSE_DELAY_MS)}
            onChange={(e) => {
              let val = e.target.value;
              if (effectiveFormatting && !isDate && !isPhone) val = limitByFormat(val, effectiveFormatting);
              if (isDate) val = normalizeDateValue(val);
              setSuggestionIndex(-1);
              onChange?.({ target: { name, value: val } });
            }}
            onKeyDown={handleKeyDown}
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
                    pickSuggestion(suggestion);
                    setTimeout(() => focusNextField(inputRef.current), 0);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rightIconElement}

        {isMasked && (
          <span
            onClick={() => setShowMasked(!showMasked)}
            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
          >
            {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
          </span>
        )}
      </div>
      {errorElement}
    </div>
  );
};

export default TextField;
