import { useCallback, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { IoEyeOffSharp } from "react-icons/io5";
import { isValidPhoneNumber } from "react-phone-number-input";
import { RxEyeOpen } from "react-icons/rx";

import AiFormattedText from "@/components/shared/AiFormattedText";
import FieldLabel from "@/components/shared/FieldLabel";
import FieldSuggestionList from "@/components/shared/FieldSuggestionList";
import PhoneFieldInput from "@/components/shared/PhoneFieldInput";
import { FIELD_FORMATS, FIELD_NAME_MATCHERS, FIELD_TYPES } from "@/constants";
import {
  BLOCK_CLIPBOARD_PROPS,
  focusNextField,
  formatFieldDisplayValue,
  GOOGLE_PLACE_FIELDS,
  isEmptyValue,
  limitByFormat,
  normalizeDateValue,
} from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getRequiredBorderClasses } from "@/utils/fieldStyles";
import { buildAiHelpContext } from "@/utils/aiHelpContext";

const FULL_DATE_LENGTH = 10;
const MIN_AUTO_ADVANCE_YEAR = 1900;
const BLUR_CLOSE_DELAY_MS = 100;

const OtherInputType = ({
  field = {},
  className = "",
  form = {},
  setForm,
  isConfirmField = false,
  suggestions = [],
  autoFocus = false,
}) => {
  const {
    type,
    label,
    name,
    uniqueId,
    required,
    placeholder,
    isMasked,
    isDisplayText,
    ai_formatting,
    suggestions: rawFieldSuggestions,
    isGooglePlaces = false,
  } = field;
  const fieldSuggestions = rawFieldSuggestions ? rawFieldSuggestions.split(",") : rawFieldSuggestions;

  // auto formatting overrides
  const isPhone = name.toLowerCase().includes(FIELD_NAME_MATCHERS.PHONE);
  const isSSN = name.includes(FIELD_NAME_MATCHERS.SSN);
  const isTaxId = name.toLowerCase().includes(FIELD_NAME_MATCHERS.TAX);
  const formatting = isTaxId ? FIELD_FORMATS.TAX_ID : isSSN ? FIELD_FORMATS.SSN : field.formatting;

  const inputRef = useRef(null);
  const [showMasked, setShowMasked] = useState(Boolean(isMasked));
  const [autocomplete, setAutocomplete] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const value = form?.[uniqueId]?.value;
  const hasSuggestions = Boolean(suggestions?.length || fieldSuggestions?.length);
  const displayValue = formatFieldDisplayValue(type, value, { formatting, isMasked, showMasked });
  const inputClasses = `${FIELD_INPUT_CLASSES} ${className} ${getRequiredBorderClasses(required && isEmptyValue(value))} `;
  const clipboardProps = isConfirmField ? BLOCK_CLIPBOARD_PROPS : {};

  const setFieldValue = (nextValue) => setForm((prev) => ({ ...prev, [uniqueId]: { name, value: nextValue } }));

  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSuggestionIndex(-1);
  };

  const pickSuggestion = (suggestion, shouldFocusNext = true) => {
    setFieldValue(suggestion);
    closeSuggestions();
    if (shouldFocusNext) setTimeout(() => focusNextField(inputRef.current), 0);
  };

  const handleLoad = useCallback((instance) => {
    instance.setFields(GOOGLE_PLACE_FIELDS);
    setAutocomplete(instance);
  }, []);

  const handleInputChange = (e) => {
    let nextValue = e.target.value;
    // store raw digits only, capped at the format length
    if (formatting && type !== FIELD_TYPES.DATE && !isPhone) nextValue = limitByFormat(nextValue, formatting);
    const normalized = type === FIELD_TYPES.DATE ? normalizeDateValue(nextValue) : nextValue;
    setFieldValue(normalized);
    // advance after a full date is picked so the ai focus listener fires
    if (type === FIELD_TYPES.DATE && normalized?.length === FULL_DATE_LENGTH) {
      const year = parseInt(normalized.split("-")[0], 10);
      if (year >= MIN_AUTO_ADVANCE_YEAR) setTimeout(() => focusNextField(inputRef.current), 0);
    }
  };

  const handleInputKeyDown = (e) => {
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
      pickSuggestion(activeSuggestions[suggestionIndex]);
    } else if (e.key === "Tab" && suggestionIndex >= 0) {
      pickSuggestion(activeSuggestions[suggestionIndex], false);
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  };

  const renderInput = () => {
    if (isGooglePlaces && type === FIELD_TYPES.TEXT) {
      return (
        <Autocomplete
          onLoad={handleLoad}
          className="w-full"
          onPlaceChanged={() => setFieldValue(autocomplete.getPlace().formatted_address)}
          options={{ fields: GOOGLE_PLACE_FIELDS }}
        >
          <input
            ref={inputRef}
            id={uniqueId}
            name={name}
            data-ai-id={uniqueId}
            data-ai-label={label || undefined}
            placeholder={placeholder}
            type={type}
            required={required || undefined}
            data-ai-has-suggestions="true"
            value={value || ""}
            onChange={(e) => setFieldValue(e.target.value)}
            className={`relative ${inputClasses}`}
          />
        </Autocomplete>
      );
    }
    if (isPhone) {
      return (
        <PhoneFieldInput
          numberInputProps={{
            required: required || undefined,
            id: uniqueId,
            name,
            "data-ai-id": uniqueId,
            "data-ai-label": label || undefined,
          }}
          placeholder={placeholder}
          value={value}
          onChange={setFieldValue}
          className={`${FIELD_INPUT_CLASSES} ${className} ${
            required && (!value || !isValidPhoneNumber(value)) ? "border-red-500 border-2" : "border-frameColor border"
          }  ${getRequiredBorderClasses(required && isEmptyValue(value))}`}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        id={uniqueId}
        name={name}
        data-ai-id={uniqueId}
        data-ai-label={label || undefined}
        placeholder={placeholder}
        type={(isMasked || isSSN) && type !== FIELD_TYPES.DATE ? FIELD_TYPES.TEXT : type}
        required={required || undefined}
        data-ai-has-suggestions={fieldSuggestions?.length ? "true" : undefined}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => {
          setShowMasked(false);
          if (hasSuggestions) setShowSuggestions(true);
        }}
        onBlur={() => {
          setShowMasked(true);
          if (hasSuggestions) setTimeout(closeSuggestions, BLUR_CLOSE_DELAY_MS);
        }}
        readOnly={showMasked}
        autoComplete="off"
        autoFocus={autoFocus || undefined}
        className={`relative ${inputClasses}`}
        {...clipboardProps}
      />
    );
  };

  return (
    <div className="flex w-full flex-col items-start gap-4" data-ai-help-context={buildAiHelpContext(field)}>
      <article className="flex w-full flex-col items-start gap-2">
        {ai_formatting && isDisplayText && (
          <AiFormattedText html={ai_formatting} className="gap-4p-4 flex h-full w-full flex-col" />
        )}

        <section className="flex w-full gap-2">
          <div className={`w-full ${label ? "mt-2" : ""}`}>
            {label && <FieldLabel label={label} required={required} />}

            {type === FIELD_TYPES.TEXTAREA ? (
              <div className="relative">
                <textarea
                  ref={inputRef}
                  id={uniqueId}
                  name={name}
                  data-ai-id={uniqueId}
                  data-ai-label={label || undefined}
                  placeholder={placeholder}
                  required={required || undefined}
                  value={displayValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  onFocus={() => setShowMasked(false)}
                  onBlur={() => setShowMasked(true)}
                  readOnly={showMasked}
                  autoComplete="off"
                  className={inputClasses}
                  {...clipboardProps}
                />
              </div>
            ) : (
              <div className="relative">
                {renderInput()}

                {showSuggestions && type === FIELD_TYPES.TEXT && fieldSuggestions?.length > 0 && (
                  <FieldSuggestionList suggestions={fieldSuggestions} activeIndex={suggestionIndex} onPick={pickSuggestion} />
                )}

                {showSuggestions && suggestions?.length > 0 && (!fieldSuggestions || !fieldSuggestions.length) && (
                  <FieldSuggestionList suggestions={suggestions} activeIndex={suggestionIndex} onPick={pickSuggestion} />
                )}

                {isMasked && (
                  <button
                    type="button"
                    onClick={() => setShowMasked(!showMasked)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
                    aria-label={showMasked ? "Show value" : "Hide value"}
                  >
                    {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </article>
    </div>
  );
};

export default OtherInputType;
