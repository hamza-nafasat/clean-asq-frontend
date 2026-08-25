import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { Autocomplete } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";
import { PiFileArrowUpFill } from "react-icons/pi";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_TEXT_EXTENSIONS = [".csv", ".txt", ".rtf"];
const FORBIDDEN_EXTENSIONS = [".doc", ".docx", ".xls", ".xlsx"];

const SelectInputType = ({ field, className, form, setForm, sectionKey, onChange }) => {
  const { label, options, name, required, uniqueId, placeholder, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const selectMouseDownRef = useRef(false);
  const selectTabPressedRef = useRef(false);

  const advanceToNextField = (currentEl) => {
    const focusable = Array.from(
      document.querySelectorAll("input:not([disabled]), select:not([disabled]), textarea:not([disabled])"),
    );
    const idx = focusable.indexOf(currentEl);
    if (idx !== -1 && idx < focusable.length - 1) focusable[idx + 1].focus();
  };

  const selectHandler = (e) => {
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: e.target.value } },
    }));
    if (!selectTabPressedRef.current) {
      const el = e.target;
      setTimeout(() => advanceToNextField(el), 50);
    }
    selectTabPressedRef.current = false;
  };

  let displayValue = form?.[uniqueId]?.value ?? "";
  const isValueInOptions = options?.some((option) => option.value === displayValue);
  if (!isValueInOptions) {
    const matchedOptionByLabel = options?.find(
      (option) => String(option.label).toLowerCase() === String(displayValue).toLowerCase(),
    );
    if (matchedOptionByLabel) displayValue = matchedOptionByLabel.value;
  }

  return (
    <>
      <div className={`flex w-full flex-col items-start ${className}`}>
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? "*" : ""}
          </h4>
        )}
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col gap-4">
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                  if (match.includes("target=")) return match;
                  return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}
        <div className="flex w-full gap-2">
          <select
            name={name}
            value={displayValue}
            required={required}
            disabled={isDisabledAllFields}
            className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${!displayValue && required ? "bg-highlighting" : ""} ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
            onChange={onChange ? onChange : selectHandler}
            onKeyDown={(e) => {
              if (e.key === "Tab") selectTabPressedRef.current = true;
            }}
            onMouseDown={() => {
              selectMouseDownRef.current = true;
            }}
            onFocus={(e) => {
              if (!selectMouseDownRef.current) {
                try {
                  e.target.showPicker?.();
                } catch (err) {
                  console.error(err);
                }
              }
              selectMouseDownRef.current = false;
            }}
          >
            <option value="">{placeholder ?? "Select an option"}</option>
            {!isValueInOptions && displayValue && form[uniqueId]?.value && (
              <option className="hidden" value={form[uniqueId]?.value}>
                {form[uniqueId]?.value}
              </option>
            )}
            {options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const MultiCheckboxInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, options, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  const multiCheckBoxHandler = (e) => {
    if (form?.[uniqueId]?.value?.includes(e.target.value)) {
      setForm((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [uniqueId]: {
            name: name,
            value: form?.[uniqueId]?.value?.filter((item) => item !== e.target.value),
          },
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [uniqueId]: { name: name, value: [...(form?.[uniqueId]?.value || []), e.target.value] },
        },
      }));
    }
  };

  return (
    <div className={`flex w-full justify-between gap-4 ${className}`}>
      <h4 className="text-textPrimary min-w-50lg:text-lg text-base font-medium">
        {label}:{required ? "*" : ""}
      </h4>
      {ai_formatting && isDisplayText && (
        <div className="gap-4p-4 flex h-full w-full flex-col">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full items-center gap-8">
        {options?.map((option, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <label htmlFor={`${uniqueId}-option-${index}`} className="text-base text-gray-700 capitalize">
              {option?.label}
            </label>
            <input
              id={`${uniqueId}-option-${index}`}
              type={"checkbox"}
              value={option?.value}
              checked={form?.[uniqueId]?.value?.includes(option?.value)}
              disabled={isDisabledAllFields}
              className={`text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
              required={required}
              onChange={multiCheckBoxHandler}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RadioInputType = ({ field, className, form, setForm, onChange, sectionKey, optionColumnCount = 3 }) => {
  const { label, options, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  const radioHandler = (option) =>
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: option.value } },
    }));

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 py-4">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full">
        <h4 className="text-textPrimary min-w-50 text-base font-medium lg:text-lg">
          {label}:{required ? "*" : ""}
        </h4>
      </div>
      <div className="border-b-2 py-2">
        <div className={`grid grid-cols-${optionColumnCount} gap-4 p-0`}>
          {options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 text-start">
              <input
                disabled={isDisabledAllFields}
                name={name}
                type={"radio"}
                id={option.value + index + name}
                value={option.value}
                checked={form?.[uniqueId]?.value === option.value}
                className={` h-5! w-5! text-textPrimary accent-primary ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                required={required}
                onChange={onChange ? onChange : () => radioHandler(option)}
              />
              <label htmlFor={option.value + index + name} className="text-textPrimary text-base">
                {option?.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckboxInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, isDisplayText, ai_formatting, conditional_fields } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  const singleCheckBoxHandler = (e) =>
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: e.target.checked } },
    }));

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex flex-col justify-between ${className}`}>
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col">
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                  if (match.includes("target=")) return match;
                  return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 px-2">
            <input
              type={"checkbox"}
              name={name}
              required={required}
              disabled={isDisabledAllFields}
              value={form?.[uniqueId]?.value}
              checked={form?.[uniqueId]?.value}
              className={`text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
              onChange={singleCheckBoxHandler}
            />
            {label && (
              <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                {label} {required ? "*" : ""}
              </h4>
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2 px-6">
        {form?.[uniqueId]?.value && conditional_fields?.length
          ? conditional_fields?.map((f, index) => {
              const fieldName = `${uniqueId}/${f?.name}`;
              return (
                <div className="flex w-full flex-col gap-2" key={index}>
                  <TextField
                    disabled={isDisabledAllFields}
                    value={form?.[fieldName]?.value}
                    type={f?.type}
                    label={f?.label}
                    name={fieldName}
                    required={f?.required}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          [e.target.name]: { name: e.target.name, value: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

const RangeInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, minValue = 0, maxValue = 100, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);

  const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const onRangeChange = (e) => {
    const targetVAlue = String(e.target.value);
    if (targetVAlue > maxValue || targetVAlue < minValue) return;
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: targetVAlue } },
    }));
  };

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && (
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? "*" : ""}
        </h4>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 p-4">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">
          {Number(form?.[uniqueId]?.value) || 0} %
        </div>
        <input
          disabled={isDisabledAllFields}
          value={Number(form?.[uniqueId]?.value) || 0}
          type="range"
          className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
          onChange={onRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            disabled={isDisabledAllFields}
            type="number"
            value={Number(form?.[uniqueId]?.value) || 0}
            className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${
              (required && isEmpty(form?.[uniqueId]?.value)) || form?.[uniqueId]?.value === 0
                ? "border-accent bg-highlighting border-2"
                : "border-frameColor border"
            } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
            onChange={onRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

const OtherInputType = ({
  field,
  className,
  form,
  setForm,
  isConfirmField,
  sectionKey,
  suggestions = [],
  autoFocus = false,
}) => {
  const { isDisabledAllFields } = useSelector((state) => state.form);

  const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  let {
    type,
    label,
    name,
    uniqueId,
    required,
    formatting,
    placeholder,
    isDisplayText,
    ai_formatting,
    suggestions: fieldSuggestions,
    isGooglePlaces = false,
  } = field;

  if (fieldSuggestions) fieldSuggestions = fieldSuggestions.split(",");

  // Auto formatting overrides (never mask in PDF view)
  const isSSN = name.includes("ssn");
  if (isSSN) formatting = "3,2,4";
  const isPhone = name.toLowerCase().includes("phone");
  if (isPhone) formatting = "3,3,4";
  const isTaxId = name.toLowerCase().includes("tax");
  if (isTaxId) formatting = "2,7";

  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const focusNext = (el) => {
    if (!el) return;
    const focusable = Array.from(
      document.querySelectorAll("input:not([disabled]), select:not([disabled]), textarea:not([disabled])"),
    ).filter((f) => f.offsetParent !== null && f.tabIndex !== -1);
    const idx = focusable.indexOf(el);
    if (idx >= 0 && idx + 1 < focusable.length) focusable[idx + 1].focus();
  };

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

  const getDisplayValue = (type, value) => {
    if (!value) return "";

    if (type === "date") return formatDate(value);

    const format = getFormatParts(formatting);
    if (format.length > 0) {
      const maxDigits = format.reduce((a, b) => a + b, 0);
      const digits = value.toString().replace(/\D/g, "").slice(0, maxDigits);
      let formatted = "";
      let start = 0;

      for (let i = 0; i < format.length; i++) {
        const len = format[i];
        if (start >= digits.length) break;

        const part = digits.substr(start, len);
        formatted += part;
        start += len;

        if (i < format.length - 1 && start < digits.length) {
          formatted += "-";
        }
      }

      return formatted;
    }

    return value;
  };

  const updateFieldValue = (value) => {
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value } },
    }));
  };

  // Google Places
  const onLoad = useCallback((autoC) => {
    autoC.setFields(["address_components", "formatted_address", "geometry", "place_id"]);
    setAutocomplete(autoC);
  }, []);

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();
    updateFieldValue(place.formatted_address);
  };

  return (
    <>
      <div className="flex w-full flex-col items-start gap-4">
        <article className="flex w-full flex-col items-start gap-2">
          {ai_formatting && isDisplayText && (
            <div className="gap-4p-4 flex h-full w-full flex-col">
              <div
                dangerouslySetInnerHTML={{
                  __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                    if (match.includes("target=")) return match;
                    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                  }),
                }}
              />
            </div>
          )}

          <section className="flex w-full gap-2">
            <div className={`w-full ${label ? "mt-2" : ""}`}>
              {label && (
                <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                  {label}:{required ? "*" : ""}
                </h4>
              )}

              {type === "textarea" ? (
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    name={name}
                    disabled={isDisabledAllFields}
                    placeholder={placeholder}
                    required={required || undefined}
                    value={getDisplayValue(type, form?.[uniqueId]?.value)}
                    onChange={(e) => updateFieldValue(e.target.value)}
                    autoComplete="off"
                    className={`h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${
                      required && isEmpty(form?.[uniqueId]?.value)
                        ? "border-accent bg-highlighting border-2"
                        : "border-frameColor border"
                    } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                    {...(isConfirmField
                      ? {
                          onPaste: (e) => e.preventDefault(),
                          onCopy: (e) => e.preventDefault(),
                          onCut: (e) => e.preventDefault(),
                        }
                      : {})}
                  />
                </div>
              ) : (
                <div className="relative">
                  {isGooglePlaces && type === "text" ? (
                    <Autocomplete
                      onLoad={onLoad}
                      className="w-full"
                      onPlaceChanged={onPlaceChanged}
                      options={{ fields: ["address_components", "formatted_address", "geometry", "place_id"] }}
                    >
                      <input
                        ref={inputRef}
                        name={name}
                        disabled={isDisabledAllFields}
                        placeholder={placeholder}
                        type={type}
                        required={required || undefined}
                        value={form?.[uniqueId]?.value || ""}
                        onChange={(e) =>
                          updateFieldValue(type === "date" ? normalizeDate(e.target.value) : e.target.value)
                        }
                        className={`relative h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${
                          required && isEmpty(form?.[uniqueId]?.value)
                            ? "border-accent bg-highlighting border-2"
                            : "border-frameColor border"
                        } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </Autocomplete>
                  ) : isPhone ? (
                    <div>
                      <PhoneInput
                        international
                        limitMaxLength
                        disabled={isDisabledAllFields}
                        numberInputProps={{
                          style: { outline: "none" },
                          required: required || undefined,
                          disabled: isDisabledAllFields,
                        }}
                        defaultCountry="US"
                        placeholder={placeholder || "Enter phone number"}
                        value={form?.[uniqueId]?.value || ""}
                        onChange={(value) => updateFieldValue(value || "")}
                        className={`h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${
                          required && (!form?.[uniqueId]?.value || !isValidPhoneNumber(form?.[uniqueId]?.value))
                            ? "border-red-500 border-2"
                            : "border-frameColor border"
                        }  ${
                          required && isEmpty(form?.[uniqueId]?.value)
                            ? "border-accent bg-highlighting border-2"
                            : "border-frameColor border"
                        } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                      />

                      {form?.[uniqueId]?.value && !isValidPhoneNumber(form?.[uniqueId]?.value) && (
                        <p className="mt-1 text-sm text-red-500">Invalid phone number</p>
                      )}
                    </div>
                  ) : (
                    <input
                      ref={inputRef}
                      name={name}
                      disabled={isDisabledAllFields}
                      placeholder={placeholder}
                      type={isSSN && type !== "date" ? "text" : type}
                      required={required || undefined}
                      value={getDisplayValue(type, form?.[uniqueId]?.value)}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (formatting && type !== "date" && !isPhone) {
                          val = limitByFormat(val, formatting);
                        }
                        const normalized = type === "date" ? normalizeDate(val) : val;
                        updateFieldValue(normalized);
                        if (type === "date" && normalized?.length === 10) {
                          const year = parseInt(normalized.split("-")[0], 10);
                          if (year >= 1900) setTimeout(() => focusNext(inputRef.current), 0);
                        }
                      }}
                      onKeyDown={(e) => {
                        const activeSuggestions = fieldSuggestions?.length ? fieldSuggestions : suggestions || [];
                        if (!showSuggestions || !activeSuggestions.length) return;
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setSuggestionIndex((i) => Math.min(i + 1, activeSuggestions.length - 1));
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setSuggestionIndex((i) => Math.max(i - 1, -1));
                        } else if (e.key === "Enter" && suggestionIndex >= 0) {
                          e.preventDefault();
                          updateFieldValue(activeSuggestions[suggestionIndex]);
                          setShowSuggestions(false);
                          setSuggestionIndex(-1);
                          setTimeout(() => focusNext(inputRef.current), 0);
                        } else if (e.key === "Tab" && suggestionIndex >= 0) {
                          updateFieldValue(activeSuggestions[suggestionIndex]);
                          setShowSuggestions(false);
                          setSuggestionIndex(-1);
                        } else if (e.key === "Escape") {
                          setShowSuggestions(false);
                          setSuggestionIndex(-1);
                        }
                      }}
                      onFocus={() => {
                        if (suggestions?.length || fieldSuggestions?.length) setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        if (suggestions?.length || fieldSuggestions?.length)
                          setTimeout(() => {
                            setShowSuggestions(false);
                            setSuggestionIndex(-1);
                          }, 100);
                      }}
                      autoComplete="off"
                      autoFocus={autoFocus || undefined}
                      className={`relative h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${className} ${
                        required && isEmpty(form?.[uniqueId]?.value)
                          ? "border-accent bg-highlighting border-2"
                          : "border-frameColor border"
                      } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                      {...(isConfirmField
                        ? {
                            onPaste: (e) => e.preventDefault(),
                            onCopy: (e) => e.preventDefault(),
                            onCut: (e) => e.preventDefault(),
                          }
                        : {})}
                    />
                  )}

                  {showSuggestions && !isDisabledAllFields && type === "text" && fieldSuggestions?.length > 0 && (
                    <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                      {fieldSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${suggestionIndex === index ? "bg-gray-100 font-medium" : ""}`}
                          onMouseDown={() => {
                            updateFieldValue(suggestion);
                            setShowSuggestions(false);
                            setSuggestionIndex(-1);
                            setTimeout(() => focusNext(inputRef.current), 0);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}

                  {showSuggestions &&
                    !isDisabledAllFields &&
                    suggestions?.length > 0 &&
                    (!fieldSuggestions || !fieldSuggestions.length) && (
                      <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${suggestionIndex === index ? "bg-gray-100 font-medium" : ""}`}
                            onMouseDown={() => {
                              updateFieldValue(suggestion);
                              setShowSuggestions(false);
                              setSuggestionIndex(-1);
                              setTimeout(() => focusNext(inputRef.current), 0);
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </section>
        </article>
      </div>
    </>
  );
};

const FileInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return !(value.secureUrl || value.publicId || value.file);
    return false;
  };

  // Restore previously uploaded file preview from draft
  useEffect(() => {
    const existing = form?.[uniqueId]?.value;
    const url = existing?.secureUrl;
    if (!url || fileName) return;
    const nameFromUrl = url.split("/").pop()?.split("?")[0] || "Uploaded file";
    setFileName(decodeURIComponent(nameFromUrl));
    if (existing?.resourceType === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      setPreviewUrl(url);
    }
  }, [form, uniqueId, fileName]);

  const fileHandler = (file) => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const mimeType = file.type;

    if (FORBIDDEN_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext))) {
      toast.error("DOC and Excel files are not allowed");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf = mimeType === "application/pdf" || fileNameLower.endsWith(".pdf");
    const isText = mimeType.startsWith("text/") || ALLOWED_TEXT_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

    if (!isImage && !isPdf && !isText) {
      toast.error("Unsupported file type");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: { file } } },
    }));

    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) fileHandler(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isDisabledAllFields) return;
    const file = e.dataTransfer.files[0];
    if (file) fileHandler(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && (
        <label className="mb-2 block text-sm text-[#666666] lg:text-base">
          {label}:{required ? "*" : ""}
        </label>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 mb-2">
          <div
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full gap-2 mt-2">
        <div className="w-full">
          <div
            className={`relative mt-2 flex h-70.75 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50 ${
              required && isEmpty(form?.[uniqueId]?.value) ? "border-accent bg-highlighting" : "border-gray-300"
            } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed!" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={isDisabledAllFields ? undefined : () => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (isDisabledAllFields) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            tabIndex={isDisabledAllFields ? -1 : 0}
            role="button"
            aria-label="Upload file"
          >
            <PiFileArrowUpFill className="text-textPrimary text-8xl" />
            <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
            <h5 className="text-textPrimary">pdf, jpg, png, csv, txt, rtf up to 10MB</h5>
            <Button
              label={"Select file"}
              className={`text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500! ${isDisabledAllFields ? "opacity-70 cursor-not-allowed!" : ""}`}
              rightIcon={CgSoftwareUpload}
              disabled={isDisabledAllFields}
            />
            <input
              ref={inputRef}
              type="file"
              name={name}
              disabled={isDisabledAllFields}
              accept="image/*,application/pdf,text/csv,text/plain,application/rtf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {fileName && <div className="mt-2 text-sm text-gray-700">Selected: {fileName}</div>}

          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />}

          {form?.[uniqueId]?.value?.secureUrl && (
            <Button
              label="Download"
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => window.open(form?.[uniqueId]?.value?.secureUrl, "_blank")}
            />
          )}
        </div>
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
};
