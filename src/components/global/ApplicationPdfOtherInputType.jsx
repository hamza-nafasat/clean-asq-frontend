import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Autocomplete } from "@react-google-maps/api";
import { isValidPhoneNumber } from "react-phone-number-input";

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
  setSectionFieldValue,
} from "@/utils/fieldFormatting";
import { FIELD_INPUT_CLASSES, getDisabledClasses, getRequiredBorderClasses } from "@/utils/fieldStyles";

const FULL_DATE_LENGTH = 10;
const MIN_AUTO_ADVANCE_YEAR = 1900;
const BLUR_CLOSE_DELAY_MS = 100;

// ssn, phone and tax id names force their digit format; never masked in the pdf view
const getPdfFieldFormatting = (name, formatting) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes(FIELD_NAME_MATCHERS.TAX)) return FIELD_FORMATS.TAX_ID;
  if (lowerName.includes(FIELD_NAME_MATCHERS.PHONE)) return FIELD_FORMATS.PHONE;
  if (name.includes(FIELD_NAME_MATCHERS.SSN)) return FIELD_FORMATS.SSN;
  return formatting;
};

const ApplicationPdfOtherInputType = ({
  field = {},
  className = "",
  form = {},
  setForm,
  isConfirmField = false,
  sectionKey,
  suggestions = [],
  autoFocus = false,
}) => {
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const { type, label, name, uniqueId, required, placeholder, isDisplayText, ai_formatting, isGooglePlaces = false } = field;
  const fieldSuggestions = field.suggestions ? field.suggestions.split(",") : field.suggestions;
  const isSSN = name.includes(FIELD_NAME_MATCHERS.SSN);
  const isPhone = name.toLowerCase().includes(FIELD_NAME_MATCHERS.PHONE);
  const formatting = getPdfFieldFormatting(name, field.formatting);

  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const value = form?.[uniqueId]?.value;
  const hasSuggestions = Boolean(suggestions?.length || fieldSuggestions?.length);
  const displayValue = formatFieldDisplayValue(type, value, { formatting });
  const statusClasses = `${getRequiredBorderClasses(required && isEmptyValue(value))} ${getDisabledClasses(isDisabledAllFields)}`;
  const inputClasses = `${FIELD_INPUT_CLASSES} ${className} ${statusClasses}`;
  const clipboardProps = isConfirmField ? BLOCK_CLIPBOARD_PROPS : {};
  const canShowSuggestions = showSuggestions && !isDisabledAllFields;

  const setFieldValue = (nextValue) => setSectionFieldValue(setForm, sectionKey, uniqueId, name, nextValue);

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
    if (formatting && type !== FIELD_TYPES.DATE && !isPhone) nextValue = limitByFormat(nextValue, formatting);
    const normalized = type === FIELD_TYPES.DATE ? normalizeDateValue(nextValue) : nextValue;
    setFieldValue(normalized);
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
            name={name}
            disabled={isDisabledAllFields}
            placeholder={placeholder}
            type={type}
            required={required || undefined}
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
          disabled={isDisabledAllFields}
          numberInputProps={{ required: required || undefined, disabled: isDisabledAllFields }}
          placeholder={placeholder}
          value={value}
          onChange={setFieldValue}
          className={`${FIELD_INPUT_CLASSES} ${className} ${
            required && (!value || !isValidPhoneNumber(value)) ? "border-red-500 border-2" : "border-frameColor border"
          }  ${statusClasses}`}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        name={name}
        disabled={isDisabledAllFields}
        placeholder={placeholder}
        type={isSSN && type !== FIELD_TYPES.DATE ? FIELD_TYPES.TEXT : type}
        required={required || undefined}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => {
          if (hasSuggestions) setShowSuggestions(true);
        }}
        onBlur={() => {
          if (hasSuggestions) setTimeout(closeSuggestions, BLUR_CLOSE_DELAY_MS);
        }}
        autoComplete="off"
        autoFocus={autoFocus || undefined}
        className={`relative ${inputClasses}`}
        {...clipboardProps}
      />
    );
  };

  return (
    <div className="flex w-full flex-col items-start gap-4">
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
                  name={name}
                  disabled={isDisabledAllFields}
                  placeholder={placeholder}
                  required={required || undefined}
                  value={displayValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  autoComplete="off"
                  className={inputClasses}
                  {...clipboardProps}
                />
              </div>
            ) : (
              <div className="relative">
                {renderInput()}

                {canShowSuggestions && type === FIELD_TYPES.TEXT && fieldSuggestions?.length > 0 && (
                  <FieldSuggestionList suggestions={fieldSuggestions} activeIndex={suggestionIndex} onPick={pickSuggestion} />
                )}

                {canShowSuggestions && suggestions?.length > 0 && (!fieldSuggestions || !fieldSuggestions.length) && (
                  <FieldSuggestionList suggestions={suggestions} activeIndex={suggestionIndex} onPick={pickSuggestion} />
                )}
              </div>
            )}
          </div>
        </section>
      </article>
    </div>
  );
};

export default ApplicationPdfOtherInputType;
