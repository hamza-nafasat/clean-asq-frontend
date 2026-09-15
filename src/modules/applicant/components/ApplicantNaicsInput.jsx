import { useEffect, useRef, useState } from "react";
import { naicsToMcc } from "@/../public/NAICStoMCC.js";
import {
  KEYBOARD_KEYS,
  NAICS_COLUMNS,
  NAICS_INPUT_ID,
  NAICS_SUGGESTIONS_FLIP_SPACE,
} from "../utils/applicant.constants";
import { filterNaicsSuggestions, formatNaicsSelection } from "../utils/applicant.utils8";

const ApplicantNaicsInput = ({ value = "", isLoading = false, setNaicsToMccDetails }) => {
  const naicsInputRef = useRef(null);
  const [naicsSuggestions, setNaicsSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // suggestion selected with the arrow keys
  const [naicsHighlight, setNaicsHighlight] = useState(-1);
  const [isSuggestionsAbove, setIsSuggestionsAbove] = useState(false);

  const checkNaicsPosition = () => {
    if (!naicsInputRef.current) return;
    const rect = naicsInputRef.current.getBoundingClientRect();
    setIsSuggestionsAbove(window.innerHeight - rect.bottom < NAICS_SUGGESTIONS_FLIP_SPACE);
  };

  const handleInputChange = (e) => {
    checkNaicsPosition();
    const inputValue = e.target.value;
    setNaicsToMccDetails?.((prev) => ({ ...prev, NAICS: inputValue, NAICS_Description: "", MCC: "", MCC_Description: "" }));
    if (inputValue.length > 0) {
      const filtered = filterNaicsSuggestions(inputValue, naicsToMcc);
      setNaicsSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
    setNaicsHighlight(-1);
  };

  const handleSelect = (item) => {
    setNaicsToMccDetails?.(formatNaicsSelection(item));
    setShowSuggestions(false);
    setNaicsHighlight(-1);
  };

  // arrows move through suggestions, enter or tab picks one
  const handleKeyDown = (e) => {
    if (!showSuggestions || naicsSuggestions.length === 0) return;
    if (e.key === KEYBOARD_KEYS.ARROW_DOWN) {
      e.preventDefault();
      setNaicsHighlight((i) => Math.min(i + 1, naicsSuggestions.length - 1));
    } else if (e.key === KEYBOARD_KEYS.ARROW_UP) {
      e.preventDefault();
      setNaicsHighlight((i) => Math.max(i - 1, 0));
    } else if ((e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.TAB) && naicsHighlight >= 0) {
      e.preventDefault();
      handleSelect(naicsSuggestions[naicsHighlight]);
    } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={naicsInputRef}>
      <div className="flex w-full gap-4">
        <input
          id={NAICS_INPUT_ID}
          name={NAICS_INPUT_ID}
          placeholder="Type NAICS code or description..."
          type="text"
          value={value}
          onKeyDown={handleKeyDown}
          className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${!value ? "bg-highlighting border-accent! border-2" : ""}`}
          data-ai-has-suggestions="true"
          data-ai-required="true"
          data-ai-label="NAICS Code and Description"
          data-ai-loading={isLoading ? "true" : undefined}
          onChange={handleInputChange}
          onFocus={() => {
            checkNaicsPosition();
            setShowSuggestions(!!value);
          }}
        />
      </div>
      {showSuggestions && (
        <div
          className={`rounded-md absolute z-10 max-h-80 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg ${isSuggestionsAbove ? "bottom-full mb-1" : "mt-1"}`}
        >
          {naicsSuggestions.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${index === naicsHighlight ? "bg-gray-100" : ""}`}
              onMouseEnter={() => setNaicsHighlight(index)}
              onClick={() => handleSelect(item)}
            >
              <div className="font-medium">{item[NAICS_COLUMNS.NAICS_CODE]}</div>
              <div className="text-sm text-gray-600">{item[NAICS_COLUMNS.NAICS_DESCRIPTION]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantNaicsInput;
