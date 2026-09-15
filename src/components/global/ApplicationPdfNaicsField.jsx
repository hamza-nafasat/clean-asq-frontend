import { CgSpinner } from "react-icons/cg";

import Button from "@/components/shared/Button";
import { FIELD_INPUT_CLASSES, getDisabledClasses } from "@/utils/fieldStyles";
import { NAICS_KEYS } from "@/utils/naicsLookup";

const ApplicationPdfNaicsField = ({
  value = "",
  isDisabled = false,
  isLoading = false,
  suggestions = [],
  showSuggestions = false,
  containerRef,
  onChange,
  onFocus,
  onFind,
  onSelect,
}) => (
  <div className="relative w-full" ref={containerRef}>
    <div className="flex w-full gap-4">
      <input
        id="naics-code"
        name="naics-code"
        placeholder="Type NAICS code or description..."
        type="text"
        value={value}
        disabled={isDisabled}
        className={`border-frameColor ${FIELD_INPUT_CLASSES} ${getDisabledClasses(isDisabled)}`}
        onChange={onChange}
        onFocus={onFocus}
      />
      {!isDisabled && (
        <Button
          label="Find NAICS"
          className={`text-nowrap ${isLoading && "pointer-events-none opacity-30"}`}
          disabled={isLoading}
          onClick={onFind}
          icon={isLoading && CgSpinner}
          cnLeft="animate-spin h-5 w-5"
        />
      )}
    </div>
    {showSuggestions && !isDisabled && (
      <div className="rounded-m absolute z-10 mt-1 max-h-80 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg">
        {suggestions.map((item, index) => (
          <div key={index} className="cursor-pointer px-4 py-2 hover:bg-gray-100" onClick={() => onSelect?.(item)}>
            <div className="font-medium">{item[NAICS_KEYS.CODE]}</div>
            <div className="text-sm text-gray-600">{item[NAICS_KEYS.DESCRIPTION]}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ApplicationPdfNaicsField;
